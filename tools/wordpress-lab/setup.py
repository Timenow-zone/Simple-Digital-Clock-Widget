"""Initialize only the disposable sites in the named Clock Compose project."""

import json
import pathlib
import subprocess
import time
import urllib.error
import urllib.request

output = pathlib.Path('.local/wordpress-lab')
if (output / 'sites.json').exists():
    raise SystemExit('sites.json already exists; use the existing lab instead of reinstalling it')
credentials = json.loads((output / 'browser-credentials.json').read_text())
if not (output / 'packages/candidate.zip').is_file():
    raise SystemExit('Run python3 tools/wordpress-lab/package.py before initializing sites')
compose = ['docker', 'compose', '--env-file', str(output / 'env'), '-f', 'tools/wordpress-lab/compose.yaml']
sites = [('wp71', 19427), ('wp84', 19428), ('wp63', 19429), ('wp68', 19430)]
rows = []
started = time.monotonic()

for index, (service, port) in enumerate(sites, 1):
    url = f'http://127.0.0.1:{port}'
    print(f'[{index}/{len(sites)}] {service}: {url}; elapsed={time.monotonic() - started:.1f}s', flush=True)
    for attempt in range(30):
        try:
            urllib.request.urlopen(url + '/wp-login.php', timeout=10).read()
            break
        except (OSError, urllib.error.URLError):
            if attempt == 29:
                raise
            time.sleep(1)

    def wp(*args):
        process = subprocess.run(compose + ['exec', '-T', service, 'php', '/lab/wp-cli.phar', '--allow-root', *args], capture_output=True, text=True, check=False)
        with (output / 'setup.log').open('a') as log:
            log.write(f'{service} {args[:2]}\n{process.stdout}\n{process.stderr}\n')
        if process.returncode:
            raise RuntimeError(f'{service} {args[:2]} failed: {process.stderr}')
        return process.stdout

    wp('core', 'install', '--url=' + url, '--title=Clock isolated lab', '--admin_user=' + credentials['username'], '--admin_password=' + credentials['password'], '--admin_email=clock-lab@example.invalid', '--skip-email')
    wp('plugin', 'install', '/lab/packages/candidate.zip', '--force', '--activate')
    row = json.loads(wp('eval-file', '/lab/source/fixtures.php'))
    row.update({'service': service, 'url': url})
    rows.append(row)

(output / 'sites.json').write_text(json.dumps(rows, indent=2) + '\n')
print(json.dumps(rows, indent=2))
print(f'Completed {len(rows)}/{len(sites)} sites; elapsed={time.monotonic() - started:.1f}s; output={output.resolve()}')
