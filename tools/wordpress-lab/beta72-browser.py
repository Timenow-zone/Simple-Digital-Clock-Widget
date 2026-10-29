"""Run existing browser suites serially, retaining failed beta acceptance results."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.local/wordpress-lab/wp72-beta'
mode, stage = sys.argv[1:3]
if mode not in ['save', 'check', 'locale', 'pointer', 'locale-read', 'reset-read', 'entities', 'ui'] or not stage or not all(c in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in stage):
    raise ValueError('Invalid beta browser arguments')
env = dict(os.environ, SDCW_LAB_FIREFOX_WS='ws://127.0.0.1:19527/')
jobs = []
for engine in ['chromium', 'firefox', 'webkit']:
    if mode in ['save', 'check']:
        jobs.append(['final-acceptance.mjs', mode, stage, engine, 'all', 'wp72-beta'])
    elif mode == 'entities':
        for pipeline in ['named-post', 'numeric-post', 'named-widget', 'numeric-widget']:
            jobs.append(['html5-entity-dom.mjs', pipeline, engine, 'wp72-beta', '8500' if pipeline.startswith('named') else '9684'])
    else:
        for site in ['beta83', 'beta85']:
            if mode == 'ui':
                jobs.append(['beta72-ui.mjs', engine, site, stage])
            elif mode == 'locale':
                jobs.append(['locale-tests.mjs', 'test', stage, engine, site])
            elif mode == 'pointer':
                jobs.append(['locale-pointer-tests.mjs', stage, engine, site])
            elif mode == 'locale-read':
                jobs.append(['locale-tests.mjs', 'read', stage, engine, site, 'beta-locale'])
            else:
                jobs.append(['timezone-reset-read.mjs', stage, engine, site, 'beta-pointer'])
target = OUT / (stage + '-runner.json')
if target.exists():
    raise RuntimeError('Refusing to overwrite beta run evidence')
started = time.monotonic()
rows = []
for index, args in enumerate(jobs, 1):
    result = subprocess.run(['node', str(ROOT / 'tools/wordpress-lab' / args[0])] + args[1:], cwd=ROOT, env=env, capture_output=True, text=True)
    rows.append({'args': args, 'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr})
    elapsed = time.monotonic() - started
    print(f'[{index}/{len(jobs)}] {index/len(jobs):.0%} {mode} {args[-3:]}; exit={result.returncode}; elapsed={elapsed:.1f}s; ETA={elapsed/index*(len(jobs)-index):.1f}s', flush=True)
with target.open('x') as stream:
    json.dump(rows, stream, indent=2)
failed = sum(row['exit_code'] != 0 for row in rows)
print(f'Finished {len(jobs)} runs; failed={failed}; output={target}', flush=True)
sys.exit(1 if failed else 0)
