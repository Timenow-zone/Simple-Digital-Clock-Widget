"""Seed and verify frontend asset counts only in a fresh reproducible Clock lab."""

import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil

SOURCE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('clock_repro', SOURCE / 'repro/run.py')
repro = importlib.util.module_from_spec(spec)
spec.loader.exec_module(repro)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--id', required=True)
    parser.add_argument('--engines', default='chromium,webkit')
    options = parser.parse_args()
    if any(engine not in ['chromium', 'firefox', 'webkit'] for engine in options.engines.split(',')):
        parser.error('Unknown browser engine')
    lab = repro.Lab(options.id)
    summary = json.loads((lab.directory / 'summary.json').read_text())
    manifest = json.loads((repro.ROOT / 'docs/releases/1.1.4/manifest.json').read_text())
    identity = json.loads((lab.directory / 'input-identity.json').read_text())
    if not summary['passed'] or identity['candidate_sha256'] != manifest['archive_sha256']:
        raise ValueError('Use a successfully checked fresh lab for the current exact candidate')
    sites = json.loads((lab.directory / 'sites.json').read_text())
    if any(not re.fullmatch(r'http://127\.0\.0\.1:\d+', row['url']) for row in sites.values()):
        raise ValueError('Only generated loopback sites are allowed')
    output = lab.directory / 'asset-contract'
    output.mkdir()  # Refuse to overwrite an earlier fixture run.
    for name in ['asset-contract.php', 'asset-contract-fixtures.php', 'asset-contract.mjs']:
        shutil.copyfile(SOURCE / name, output / name)
    for name in sites:
        mu = lab.directory / 'lab' / name / 'wp-content/mu-plugins/sdcw-asset-contract-fixtures.php'
        if mu.exists():
            raise ValueError('Existing test MU plugin; use a fresh lab instead')
        mu.parent.mkdir(exist_ok=True)
        shutil.copyfile(output / 'asset-contract-fixtures.php', mu)
    public = []
    try:
        lab.command('asset-contract-up', lab.compose + ['up', '-d', '--wait', '--wait-timeout', '60'])
        for name, site in sites.items():
            for mode in ['seed', 'checks']:
                result = lab.wp(name, 'eval-file', '/lab/asset-contract/asset-contract.php', mode)
                report = json.loads(result.stdout)
                repro.write_json(output / f'{name}-{mode}.json', report)
                if mode == 'seed':
                    public.append({'name': name, 'url': site['url'], 'cases': report})
        repro.write_json(output / 'asset-sites.json', public)
        # Restrict overrides to a validated browser list; credentials are never read.
        lab.command('asset-contract-browser', ['env', 'SDCW_ENGINES=' + options.engines,
            'node', str(output / 'asset-contract.mjs'), str(output)])
    finally:
        lab.stop()
    print(f'PASS: sites={len(sites)}; engines={options.engines}; evidence={output}')


if __name__ == '__main__':
    main()
