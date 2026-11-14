"""Exercise real editor writes through a local r8 / editable-rollback / r8 cycle."""

import argparse
import importlib.util
import json
from pathlib import Path
import shutil
import time

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[2]
spec = importlib.util.spec_from_file_location('repro', SOURCE.parent / 'repro/run.py')
repro = importlib.util.module_from_spec(spec)
spec.loader.exec_module(repro)
spec = importlib.util.spec_from_file_location('rollback_build', SOURCE / 'build.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def run(args):
    rollback = args.rollback.resolve()
    manifest = json.loads(rollback.with_name('manifest.json').read_text())
    if (manifest['version'] != builder.VERSION or repro.digest(rollback) != manifest['archive_sha256'] or
            manifest['inputs'] != {'public_1_1_2': builder.PREDECESSOR_SHA, 'accepted_1_1_4_r8': builder.ACCEPTED_SHA}):
        raise ValueError('Wrong rollback identity')
    files = builder.read_archive(rollback, manifest['archive_sha256'])
    if {name: builder.sha(data) for name, data in files.items()} != {name: row['sha256'] for name, row in manifest['files'].items()}:
        raise ValueError('Rollback file manifest mismatch')
    lab = repro.Lab(args.id)
    summary = {'passed': False, 'rollback_sha256': manifest['archive_sha256'],
               'accepted_r8_sha256': builder.ACCEPTED_SHA, 'transitions': [], 'publication_performed': False}
    lab.progress(0, 'Verify immutable inputs and provision a new isolated writer lab')
    sites = lab.prepare(args.accepted.resolve(), args.cache.resolve())
    shutil.copytree(SOURCE, lab.directory / 'rollback-harness', ignore=shutil.ignore_patterns('__pycache__'))
    shutil.copyfile(rollback, lab.directory / 'downloads/rollback.zip')
    shutil.copyfile(rollback.with_name('manifest.json'), lab.directory / 'rollback-manifest.json')
    try:
        lab.command('up', lab.compose + ['up', '-d', '--build'])
        for attempt in range(60):
            if lab.command('database-ready', lab.compose + ['exec', '-T', 'db', 'healthcheck.sh', '--connect', '--innodb_initialized'], check=False).returncode == 0:
                break
            if attempt == 59:
                raise RuntimeError('New database did not become ready')
            time.sleep(1)
        for name in sites:
            lab.command(name + '-install', lab.compose + ['exec', '-T', name, 'php', '/lab/harness/install.php'])
            lab.wp(name, 'plugin', 'install', '/lab/downloads/predecessor.zip', '--activate')
            lab.wp(name, 'eval-file', '/lab/harness/site.php', 'seed')
            row = lab.snapshot(name, 'legacy-installed')
            if row['version'] != '1.1.2' or not row['active'] or row['files'] != repro.package_files(lab.directory / 'downloads/predecessor.zip'):
                raise ValueError('Wrong actual predecessor installation')
        lab.progress(1, 'Run native public-version baseline saves and separate negative controls')
        lab.command('writer-legacy', ['node', str(lab.directory / 'rollback-harness/browser.mjs'), str(lab.directory), 'legacy'])
        for step, phase in enumerate(['update', 'rollback', 'reupdate'], 2):
            lab.progress(step, phase + ': compare state around file changes, then perform real editor writes')
            for name in sites:
                before = lab.snapshot(name, phase + '-before')
                archive = lab.directory / 'downloads' / ('rollback.zip' if phase == 'rollback' else 'candidate.zip')
                if phase == 'rollback':
                    plugin = lab.directory / 'lab' / name / 'wp-content/plugins/simple-digital-clock'
                    plugin.rename(lab.directory / 'backups' / (name + '-accepted-r8'))
                    repro.extract(archive, plugin, 'simple-digital-clock')
                else:
                    lab.wp(name, 'eval-file', '/lab/rollback-harness/update.php')
                after = lab.snapshot(name, phase + '-after')
                checks = {'posts_unchanged': before['posts_sha256'] == after['posts_sha256'],
                          'options_unchanged': before['options_sha256'] == after['options_sha256'],
                          'installed_files_exact': after['files'] == repro.package_files(archive),
                          'version_exact': after['version'] == (builder.VERSION if phase == 'rollback' else '1.1.4'),
                          'active': after['active']}
                summary['transitions'].append({'site': name, 'phase': phase, **checks})
                if not all(checks.values()):
                    raise ValueError(f'File transition failed: {name} {phase} {checks}')
            lab.command('writer-' + phase, ['node', str(lab.directory / 'rollback-harness/browser.mjs'), str(lab.directory), phase])
            for name in sites:
                lab.snapshot(name, phase + '-after-editor-writes')
        lab.progress(5, 'Close exact artifact and preservation receipts')
        summary['editor_phases'] = {phase: len(json.loads((lab.directory / f'writer-{phase}.json').read_text()))
                                   for phase in ['legacy', 'update', 'rollback', 'reupdate']}
        if summary['editor_phases'] != dict.fromkeys(['legacy', 'update', 'rollback', 'reupdate'], 6):
            raise ValueError('Incomplete browser writer phases')
        if repro.digest(args.accepted) != builder.ACCEPTED_SHA or repro.digest(rollback) != manifest['archive_sha256']:
            raise ValueError('Input archive changed during execution')
        summary['passed'] = True
    except Exception as error:
        summary['error'] = str(error)
        raise
    finally:
        try:
            lab.stop()
            summary['stopped'] = True
        finally:
            repro.write_json(lab.directory / 'rollback-summary.json', summary)
            lab.progress(6, f'passed={summary["passed"]}; transitions={len(summary["transitions"])}; output={lab.directory}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--id', required=True)
    parser.add_argument('--accepted', required=True, type=Path)
    parser.add_argument('--rollback', required=True, type=Path)
    parser.add_argument('--cache', required=True, type=Path)
    run(parser.parse_args())
