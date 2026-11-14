"""Build a local rollback package from two immutable, hash-pinned ZIP inputs."""

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import stat
import zipfile

VERSION = '1.1.2.1'
REVISION = 2
PREFIX = 'simple-digital-clock/'
PREDECESSOR_SHA = 'd07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55'
ACCEPTED_SHA = 'cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37'
RUNTIME_SHA = '1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368'
BACKPORT_FILES = (
    'block.js', 'widget_init.php', 'includes/simple-digital-clock-kses.php',
    'includes/simple-digital-clock-assets.php', 'includes/simple-digital-clock-output.php',
    'includes/simple-digital-clock-admin-notices.php', 'THIRD-PARTY-NOTICES.txt',
)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_archive(path, expected):
    data = path.read_bytes()
    if sha(data) != expected:
        raise ValueError(f'Unexpected immutable input: {path}')
    files, seen = {}, set()
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            name = PurePosixPath(entry.filename)
            if (name.is_absolute() or '..' in name.parts or '\\' in entry.filename or
                    not name.parts or name.parts[0] != 'simple-digital-clock' or
                    name in seen or stat.S_ISLNK(entry.external_attr >> 16) or entry.flag_bits & 1):
                raise ValueError(f'Unsafe archive entry: {entry.filename}')
            seen.add(name)
            if not entry.is_dir():
                files[str(name.relative_to('simple-digital-clock'))] = archive.read(entry)
    return files


def replace_once(data, before, after):
    if data.count(before) != 1:
        raise ValueError(f'Expected one exact replacement: {before!r}')
    return data.replace(before, after, 1)


def validate_metadata(files):
    header = files['widget_init.php'].decode()
    readme = files['readme.txt'].decode()
    pot = files['languages/simple-digital-clock.pot'].decode()
    assets = files['includes/simple-digital-clock-assets.php'].decode()
    def field(text, name):
        matches = [line.split(':', 1)[1].strip() for line in text.splitlines() if line.startswith(name + ':')]
        if len(matches) != 1:
            raise ValueError(f'Expected one metadata field: {name}')
        return matches[0]
    if field(header, 'Version') != VERSION or field(readme, 'Stable tag') != VERSION:
        raise ValueError('Plugin header and stable tag must match the rollback version')
    if f'Project-Id-Version: Simple Digital Clock 🕒 {VERSION}\\n' not in pot:
        raise ValueError('POT project version must match the rollback version')
    for name in ('widget_init.php', 'block.js'):
        if f'@version {VERSION}\n' not in files[name].decode():
            raise ValueError(f'Wrong source version comment: {name}')
    if f"wp_register_style('simple-digital-clock-block-style', false, array(), '{VERSION}')" not in assets:
        raise ValueError('Wrong inline style cache version')
    if "        '0.7.0'," not in assets or 'Bundled upstream version: 0.7.0' not in readme:
        raise ValueError('Runtime cache/source metadata must retain widget 0.7.0')
    if f'= {VERSION} =' not in readme:
        raise ValueError('Missing local rollback changelog entry')
    for name, value in [('Requires at least', '6.3'), ('Requires PHP', '7.0')]:
        if field(header, name) != value or field(readme, name) != value:
            raise ValueError(f'Wrong minimum requirement: {name}')


def build(predecessor, accepted, output):
    old = read_archive(predecessor, PREDECESSOR_SHA)
    current = read_archive(accepted, ACCEPTED_SHA)
    files = dict(old)
    for name in BACKPORT_FILES:
        files[name] = current[name]
    # Preserve the legacy runtime and public bytes; only the wrapper is backported.
    del files['assets/public/css/simple-digital-clock.css']
    for name in ('widget_init.php', 'block.js'):
        files[name] = replace_once(files[name], b'@version 1.1.4', b'@version ' + VERSION.encode())
    files['widget_init.php'] = replace_once(files['widget_init.php'], b'Version: 1.1.4', b'Version: ' + VERSION.encode())
    files['includes/simple-digital-clock-assets.php'] = replace_once(
        files['includes/simple-digital-clock-assets.php'], b"'0.8.1'", b"'0.7.0'")
    files['includes/simple-digital-clock-assets.php'] = replace_once(
        files['includes/simple-digital-clock-assets.php'], b"'1.1.4'", b"'1.1.2.1'")
    # The unchanged 0.7.0 bundle is pinned by the f868574 release lockfile:
    # preact 10.29.8, preact-custom-element 4.6.0, clsx 2.1.1.
    notices = files['THIRD-PARTY-NOTICES.txt']
    if notices.count(b'11.1.0') != 2:
        raise ValueError('Unexpected Preact notice version occurrences')
    files['THIRD-PARTY-NOTICES.txt'] = notices.replace(b'11.1.0', b'10.29.8')
    files['languages/simple-digital-clock.pot'] = replace_once(
        old['languages/simple-digital-clock.pot'],
        'Project-Id-Version: Simple Digital Clock 🕒 1.1.2\\n'.encode(),
        f'Project-Id-Version: Simple Digital Clock 🕒 {VERSION}\\n'.encode())
    readme = replace_once(old['readme.txt'], b'Stable tag: 1.1.2', b'Stable tag: ' + VERSION.encode())
    newline = b'\r\n' if b'\r\n' in readme else b'\n'
    note = (
        '== Local rollback compatibility build ==\n'
        'Version 1.1.2.1 is a local rollback candidate based on public 1.1.2. It retains the byte-identical widget 0.7.0 runtime.\n'
        'The compatible block reader, scoped save protection and conditional asset delivery are backported from accepted 1.1.4 r8. There is no database migration.\n'
        'On supported HTML pages, the runtime and one inline host-layout rule are delivered only when a live clock reaches output, once per document. The editor retains its preview assets.\n'
        'Original 1.1.2 on WordPress 6.3 can damage terminal-backslash captions when saving. Use this separately versioned build for an editable rollback; already-erased data is not reconstructed.\n'
        'The original 0.7.0 visual and internationalization behavior remains. This package is not a replacement for the newer 1.1.4 runtime fixes.\n'
        'This local candidate has not been published to WordPress.org.\n\n'
    ).encode().replace(b'\n', newline)
    files['readme.txt'] = replace_once(readme, b'== ' + '📌'.encode() + b' Description ==', note + b'== ' + '📌'.encode() + b' Description ==')
    changelog = (
        f'== Changelog ==\n\n= {VERSION} =\n'
        '* Local editable rollback build; not published to WordPress.org.\n'
        '* Backported exact caption/metadata preservation and conditional asset delivery from accepted 1.1.4 r8.\n'
        '* Retained the unchanged widget 0.7.0 runtime and the original block storage schema.\n'
    ).encode().replace(b'\n', newline)
    files['readme.txt'] = replace_once(files['readme.txt'], b'== Changelog ==', changelog.rstrip())
    runtime = 'assets/public/js/simple-digital-clock.min.js'
    if sha(files[runtime]) != RUNTIME_SHA or files[runtime] != old[runtime]:
        raise ValueError('Legacy runtime bytes changed')
    validate_metadata(files)
    output.mkdir(parents=True, exist_ok=False)
    archive_path = output / f'simple-digital-clock-{VERSION}-rollback-r{REVISION}.zip'
    with zipfile.ZipFile(archive_path, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(PREFIX + name, (2026, 11, 3, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data, compresslevel=9)
    changes = {}
    for name in sorted(set(old) | set(files)):
        if old.get(name) != files.get(name):
            changes[name] = {'before_sha256': sha(old[name]) if name in old else None,
                             'after_sha256': sha(files[name]) if name in files else None}
    manifest = {'version': VERSION, 'revision': REVISION, 'widget_version': '0.7.0', 'archive': archive_path.name,
                'archive_sha256': sha(archive_path.read_bytes()), 'archive_bytes': archive_path.stat().st_size,
                'file_count': len(files), 'inputs': {'public_1_1_2': PREDECESSOR_SHA, 'accepted_1_1_4_r8': ACCEPTED_SHA},
                'builder_sha256': sha(Path(__file__).read_bytes()),
                'files': {name: {'sha256': sha(data), 'bytes': len(data)} for name, data in sorted(files.items())},
                'changes_from_public_1_1_2': changes, 'database_migration': False, 'published': False}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'PASS: version={VERSION}; files={len(files)}; changed={len(changes)}; bytes={archive_path.stat().st_size}; SHA-256={manifest["archive_sha256"]}; output={output}')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--predecessor', type=Path, required=True)
    parser.add_argument('--accepted', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    build(args.predecessor, args.accepted, args.output)
