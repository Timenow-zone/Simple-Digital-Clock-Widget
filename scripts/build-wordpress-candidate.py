"""Create an exclusive deterministic candidate and its immutable file manifest."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import stat
import subprocess
import zipfile


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--revision', required=True)
    parser.add_argument('--widget-source-commit', required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--manifest', type=Path, required=True)
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.revision):
        parser.error('Revision must contain lowercase alphanumeric segments')
    if not re.fullmatch(r'[0-9a-f]{40}', args.widget_source_commit):
        parser.error('Widget source commit must be a full SHA')
    root = Path(__file__).resolve().parents[1]
    plugin = root / 'wordpress/simple-digital-clock'
    header = (plugin / 'widget_init.php').read_text()
    version = re.search(r'^Version:\s*(\d+\.\d+\.\d+)\s*$', header, re.M)[1]
    widget = json.loads((root / 'package.json').read_text())['version']
    archive = args.output_dir / f'simple-digital-clock-{version}-{args.revision}.zip'
    if archive.exists() or args.manifest.exists():
        raise ValueError('Candidate archive and manifest must both be new paths')
    files = {}
    for file in sorted(plugin.rglob('*')):
        relative = file.relative_to(plugin)
        if file.is_symlink() or any(part.startswith('.') for part in relative.parts):
            raise ValueError(f'Unsafe package entry: {relative}')
        if file.is_dir():
            continue
        if not file.is_file():
            raise ValueError(f'Nonregular package entry: {relative}')
        files[relative.as_posix()] = file.read_bytes()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    with archive.open('xb') as output, zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as package:
        for name, content in files.items():
            entry = zipfile.ZipInfo('simple-digital-clock/' + name, (2026, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = (stat.S_IFREG | 0o644) << 16
            entry.compress_type = zipfile.ZIP_DEFLATED
            package.writestr(entry, content, compresslevel=9)
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True).strip())
    manifest = {
        'version': version, 'revision': args.revision, 'widget': widget,
        'widget_source_commit': args.widget_source_commit,
        'source_base_commit': head, 'source_dirty': dirty,
        'source_state': 'Exact per-file hashes identify the candidate; source_base_commit identifies its checkout base',
        'archive': archive.name, 'archive_path': str(archive),
        'archive_sha256': sha256(archive.read_bytes()), 'archive_bytes': archive.stat().st_size,
        'file_count': len(files), 'files': {name: sha256(data) for name, data in files.items()},
        'published': False, 'shared_runtime_changed': True, 'database_migration': False,
        'acceptance': 'NOT_RUN', 'cdn_delivery': 'PENDING',
    }
    with args.manifest.open('x') as output:
        output.write(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'archive': str(archive), 'manifest': str(args.manifest),
                      'sha256': manifest['archive_sha256'], 'files': len(files),
                      'bytes': manifest['archive_bytes']}, indent=2))


if __name__ == '__main__':
    main()
