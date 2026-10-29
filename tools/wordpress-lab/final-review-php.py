"""Run the additional final-review contracts only in the existing Clock lab."""

import json
import pathlib
import subprocess
import sys
import time

root = pathlib.Path(__file__).resolve().parents[2]
if pathlib.Path.cwd() != root:
    raise SystemExit('Run from the repository root')
lab = root / '.local/wordpress-lab'
label = sys.argv[1] if len(sys.argv) > 1 else 'final-review'
if not label or not all(char.isalnum() or char == '-' for char in label):
    raise SystemExit('Invalid review run label')
output = lab / label
output.mkdir(exist_ok=True)
compose = ['docker', 'compose', '--env-file', str(lab / 'env'), '-f', 'tools/wordpress-lab/compose.yaml']
results = []
started = time.monotonic()
for index, site in enumerate(['wp71', 'wp84', 'wp63', 'wp68'], 1):
    print(f'[{index}/4] Final PHP review: {site}; elapsed={time.monotonic() - started:.1f}s', flush=True)
    process = subprocess.run(compose + ['exec', '-T', site, 'php', '/lab/wp-cli.phar', '--allow-root', 'eval-file', '/lab/source/final-review.php'], capture_output=True, text=True)
    try:
        row = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(site + ': Invalid review output: ' + process.stdout + process.stderr) from error
    if len(row['checks']) != 148 or bool(process.returncode) != bool(row['failed']) or not row.get('foreign_probe'):
        raise RuntimeError(site + ': Invalid review contract execution/count')
    row['service'] = site
    results.append(row)
    print(f'{len(row["checks"]) - row["failed"]}/{len(row["checks"])} passed; failed={row["failed"]}', flush=True)
target = output / 'php.json'
target.write_text(json.dumps(results, indent=2) + '\n')
failed = sum(row['failed'] for row in results)
print(f'Completed 4/4; checks={sum(len(row["checks"]) for row in results)}; failed={failed}; output={target}')
raise SystemExit(1 if failed else 0)
