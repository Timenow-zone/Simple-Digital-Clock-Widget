"""Generate names only; browser DOM supplies the independent expected values."""

import hashlib
import html.entities
import json
import pathlib

root = pathlib.Path(__file__).resolve().parents[2]
if pathlib.Path.cwd() != root:
    raise SystemExit('Run from the repository root')
names = sorted(name for name in html.entities.html5 if name.endswith(';'))
if len(names) != 2125:
    raise SystemExit('Unexpected HTML5 entity corpus; review it before changing fixtures')
print('[1/2] Generate 2125 names with literal layers and unquoted attributes')
cases = []
for name in names:
    for prefix in ['', 'amp;', 'amp;amp;']:
        caption = '&' + prefix + name + ' <clock>'
        cases.append({'name': prefix + name, 'input': '<timenow-zone-sdcw caption="' + caption + '"></timenow-zone-sdcw>'})
for name in names:
    cases.append({'name': 'unquoted/' + name, 'input': '<timenow-zone-sdcw caption=&' + name + '></timenow-zone-sdcw>'})
target = root / '.local/wordpress-lab/packages/html5-entity-cases.json'
content = (json.dumps(cases, ensure_ascii=False) + '\n').encode()
if target.exists():
    if target.read_bytes() != content:
        raise SystemExit('Refusing to overwrite different entity fixtures')
else:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
print('[2/2] Verified 8500 immutable cases; SHA-256: ' + hashlib.sha256(content).hexdigest())
print('Output: ' + str(target))
