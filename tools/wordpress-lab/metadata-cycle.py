"""Run a fresh raw-post upgrade/rollback cycle only in the Clock lab."""

import json
import pathlib
import re
import subprocess
import sys
import time

root = pathlib.Path(__file__).resolve().parents[2]
if pathlib.Path.cwd() != root or len(sys.argv) != 3:
    raise SystemExit('Usage from repository root: metadata-cycle.py seed|save|read label')
mode, label = sys.argv[1:]
if mode not in ['seed', 'save', 'read'] or not re.fullmatch('[a-z0-9-]+', label):
    raise SystemExit('Invalid metadata cycle arguments')
lab = root / '.local/wordpress-lab'
directory = lab / label
directory.mkdir(exist_ok=True)
target = directory / ('metadata-' + mode + '.json')
if target.exists():
    raise SystemExit('Refusing to overwrite metadata cycle evidence')
compose = ['docker', 'compose', '--env-file', str(lab / 'env'), '-f', 'tools/wordpress-lab/compose.yaml']
results = []
started = time.monotonic()
for index, site in enumerate(['wp71', 'wp84', 'wp63', 'wp68'], 1):
    print(f'[{index}/4] Metadata {mode}: {site}; elapsed={time.monotonic() - started:.1f}s', flush=True)
    process = subprocess.run(compose + ['exec', '-T', site, 'php', '/lab/wp-cli.phar', '--allow-root', 'eval-file', '/lab/source/metadata-cycle.php', mode, label, site], capture_output=True, text=True)
    try:
        row = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(site + ': Invalid metadata output: ' + process.stdout + process.stderr) from error
    if not row['checks'] or bool(process.returncode) != bool(row['failed']):
        raise RuntimeError(site + ': Unexpected metadata contract execution')
    results.append(row)
    print(f'{len(row["checks"]) - row["failed"]}/{len(row["checks"])} passed; failed={row["failed"]}', flush=True)
target.write_text(json.dumps(results, indent=2) + '\n')
if mode in ['seed', 'save']:
    (lab / 'packages' / (label + '-metadata-' + mode + '.json')).write_text(json.dumps(results) + '\n')
print('Output: ' + str(target))
raise SystemExit(1 if any(row['failed'] for row in results) else 0)
