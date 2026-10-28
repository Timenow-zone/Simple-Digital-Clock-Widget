"""Create a local candidate ZIP from the plugin source only."""

import hashlib
import pathlib
import re
import zipfile

root = pathlib.Path(__file__).resolve().parents[2]
plugin = root / 'wordpress/simple-digital-clock'
target = root / '.local/wordpress-lab/packages/candidate.zip'
target.parent.mkdir(parents=True, exist_ok=True)
version = re.search(r'^Version:\s*(\S+)', (plugin / 'widget_init.php').read_text(), re.MULTILINE).group(1)
files = sorted(path for path in plugin.rglob('*') if path.is_file())
for path in files:
    if path.is_symlink() or any(part.startswith('.') for part in path.relative_to(plugin).parts):
        raise SystemExit('Refusing to package hidden files or symlinks: ' + str(path))
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(plugin.parent))
with zipfile.ZipFile(target) as archive:
    if archive.testzip() is not None or len(archive.namelist()) != len(files):
        raise SystemExit('Candidate ZIP verification failed')
print(f'Local candidate {version}: {len(files)} files')
print('SHA-256: ' + hashlib.sha256(target.read_bytes()).hexdigest())
print('Output: ' + str(target))
