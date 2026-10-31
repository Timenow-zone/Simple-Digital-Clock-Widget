"""Verify an exact candidate or explicitly repacked ZIP without extracting it."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import stat
import zipfile


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def verify(archive_path, allow_repacked):
    root = Path(__file__).resolve().parents[2]
    plugin = root / 'wordpress/simple-digital-clock'
    match = re.search(r'^Version:\s*(\d+\.\d+\.\d+)\s*$', (plugin / 'widget_init.php').read_text(), re.MULTILINE)
    if not match:
        raise ValueError('The plugin header must declare a release version')
    version = match.group(1)
    manifest = json.loads((root / f'docs/releases/{version}/manifest.json').read_text())
    expected = manifest['files']
    actual = {}
    for path in plugin.rglob('*'):
        if path.is_symlink() or any(part.startswith('.') for part in path.relative_to(plugin).parts):
            raise ValueError(f'Unsafe source entry: {path}')
        if path.is_file():
            actual[path.relative_to(plugin).as_posix()] = sha256(path.read_bytes())
    if manifest['version'] != version or actual != expected:
        raise ValueError('Source file set or hashes differ from the release manifest')
    archive_hash = sha256(archive_path.read_bytes())
    if not allow_repacked and archive_hash != manifest['archive_sha256']:
        raise ValueError('Archive SHA-256 differs; do not substitute a repacked candidate')
    with zipfile.ZipFile(archive_path) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        allowed = {'simple-digital-clock/' + name for name in expected}
        if len(names) != len(allowed) or len(set(names)) != len(names) or set(names) != allowed:
            raise ValueError('ZIP must contain exactly the manifest allowlist without duplicates or directory entries')
        for index, entry in enumerate(entries, 1):
            mode = entry.external_attr >> 16
            if stat.S_ISLNK(mode) or entry.flag_bits & 1:
                raise ValueError(f'Symlink or encrypted ZIP entry: {entry.filename}')
            relative = entry.filename.removeprefix('simple-digital-clock/')
            if entry.file_size != (plugin / relative).stat().st_size:
                raise ValueError(f'Unexpected uncompressed size: {entry.filename}')
            if sha256(archive.read(entry)) != expected[relative]:
                raise ValueError(f'ZIP content differs: {entry.filename}')
            print(f'[{index}/{len(entries)}] PASS {relative}')
    print(json.dumps({'version': version, 'files': len(expected), 'archive': str(archive_path.resolve()), 'sha256': archive_hash, 'exact_accepted_archive': archive_hash == manifest['archive_sha256'], 'allow_repacked': allow_repacked, 'source_and_zip_match_manifest': True}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip', required=True, type=Path)
    parser.add_argument('--allow-repacked', action='store_true', help='Compare public extracted contents while allowing server ZIP metadata to differ')
    arguments = parser.parse_args()
    try:
        verify(arguments.zip, arguments.allow_repacked)
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
        raise SystemExit(f'FAIL: {error}') from error
