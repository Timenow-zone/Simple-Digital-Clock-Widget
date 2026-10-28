"""Run only the Clock lab's release installation and PHP contract tests."""

import json
import pathlib
import secrets
import subprocess
import sys
import time

root = pathlib.Path(__file__).resolve().parents[2]
if pathlib.Path.cwd() != root:
    raise SystemExit('Run this command from the repository root')
lab = root / '.local/wordpress-lab'
compose = ['docker', 'compose', '--env-file', str(lab / 'env'), '-f', 'tools/wordpress-lab/compose.yaml']
sites = ['wp71', 'wp84', 'wp63', 'wp68']
mode = sys.argv[1] if len(sys.argv) > 1 else ''
if mode not in ['baseline', 'candidate', 'php-tests', 'upgrade-check']:
    raise SystemExit('Usage: python3 tools/wordpress-lab/patch-lab.py baseline|candidate|php-tests|upgrade-check [label]')
label = sys.argv[2] if len(sys.argv) > 2 else mode
if not label.replace('-', '').isalnum():
    raise SystemExit('Invalid result label')
(lab / 'patch').mkdir(exist_ok=True)


def wp(site, *arguments):
    return subprocess.run(compose + ['exec', '-T', site, 'php', '/lab/wp-cli.phar', '--allow-root', *arguments], capture_output=True, text=True, check=False)


author_path = lab / 'patch-author.json'
if author_path.exists():
    author = json.loads(author_path.read_text())
else:
    author = {'username': 'clock_patch_author', 'password': secrets.token_urlsafe(24), 'post_ids': {}}

started = time.monotonic()
results = []
for index, site in enumerate(sites, 1):
    print(f'[{index}/4] {mode}: {site}; elapsed={time.monotonic() - started:.1f}s', flush=True)
    if mode in ['baseline', 'candidate']:
        result = wp(site, 'plugin', 'install', '/lab/packages/' + mode + '.zip', '--force', '--activate')
        with (lab / 'patch' / (label + '-install.log')).open('a') as log:
            log.write(site + '\n' + result.stdout + result.stderr + '\n')
        if result.returncode:
            raise RuntimeError(site + ': ZIP installation failed: ' + result.stderr)
        version = wp(site, 'plugin', 'get', 'simple-digital-clock', '--field=version')
        if version.returncode:
            raise RuntimeError(version.stderr)
        print('Installed version: ' + version.stdout.strip(), flush=True)
        if mode == 'baseline':
            existing = wp(site, 'user', 'get', author['username'], '--field=ID')
            if existing.returncode:
                user = wp(site, 'user', 'create', author['username'], 'clock-author@example.invalid', '--role=author', '--user_pass=' + author['password'], '--porcelain')
                if user.returncode:
                    raise RuntimeError('Could not create test author')
                user_id = user.stdout.strip()
            else:
                user_id = existing.stdout.strip()
                updated = wp(site, 'user', 'update', user_id, '--user_pass=' + author['password'])
                if updated.returncode:
                    raise RuntimeError('Could not set the test author password')
            if site not in author['post_ids']:
                post = wp(site, 'post', 'create', '--post_author=' + user_id, '--post_title=Clock patch author fixture', '--post_status=publish', '--porcelain')
                if post.returncode or not post.stdout.strip().isdigit():
                    raise RuntimeError('Could not create author fixture')
                author['post_ids'][site] = int(post.stdout.strip())
        results.append({'service': site, 'version': version.stdout.strip(), 'installed': True})
    elif mode == 'upgrade-check':
        result = wp(site, 'eval-file', '/lab/source/upgrade-probe.php', site)
        row = json.loads(result.stdout)
        if result.returncode or row['failed'] or row['plugin_version'] != '1.1.2' or not row['active']:
            raise RuntimeError(site + ': Upgrade data/version/activation check failed: ' + result.stdout)
        results.append(row)
        print(f'{len(row["posts"])}/{len(row["posts"])} original posts unchanged; version={row["plugin_version"]}; active={row["active"]}', flush=True)
    else:
        result = wp(site, 'eval-file', '/lab/source/regression.php')
        try:
            row = json.loads(result.stdout)
        except json.JSONDecodeError as error:
            raise RuntimeError(site + ': Invalid test output: ' + result.stdout + result.stderr) from error
        row['service'] = site
        if not row.get('tests') or bool(result.returncode) != bool(row['failed']):
            raise RuntimeError(site + ': Test exit code/count does not match its result')
        results.append(row)
        print(f'{len(row["tests"]) - row["failed"]}/{len(row["tests"])} passed; failed={row["failed"]}', flush=True)

author_path.write_text(json.dumps(author, indent=2) + '\n')
author_path.chmod(0o600)
suffix = {'php-tests': 'php', 'upgrade-check': 'upgrade'}.get(mode, 'install')
target = lab / 'patch' / (label + '-' + suffix + '.json')
target.write_text(json.dumps(results, indent=2) + '\n')
print(f'Completed 4/4; elapsed={time.monotonic() - started:.1f}s; output={target}')
if mode == 'php-tests' and any(row['failed'] for row in results):
    raise SystemExit(1)
