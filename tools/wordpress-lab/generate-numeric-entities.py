"""Generate literal numeric syntax; the browser supplies independent DOM values."""

import hashlib
import json
import pathlib

root = pathlib.Path(__file__).resolve().parents[2]
if pathlib.Path.cwd() != root:
    raise SystemExit('Run from the repository root')
points = list(range(256)) + [0xd7ff, 0xd800, 0xdfff, 0xe000, 0xfdd0, 0xfffd, 0xfffe, 0xffff, 0x10000, 0x1f552, 0x10fffe, 0x10ffff, 0x110000]
cases = []
print('[1/2] Generate 269 code points, four numeric forms, three literal layers and three quote styles')
for codepoint in points:
    forms = [str(codepoint), 'x' + format(codepoint, 'X'), format(codepoint, '08d'), 'x' + format(codepoint, '08x')]
    for form in forms:
        for level in [1, 2, 3]:
            value = '&' + 'amp;' * level + '#' + form + ';'
            for style, quote in [('double', '"'), ('single', "'"), ('unquoted', '')]:
                caption = value + (' <clock>' if quote else '')
                cases.append({'name': f'{codepoint}/{form}/{level}/{style}', 'input': '<timenow-zone-sdcw caption=' + quote + caption + quote + '></timenow-zone-sdcw>'})
if len(cases) != 9684:
    raise SystemExit('Unexpected numeric fixture count')
target = root / '.local/wordpress-lab/packages/numeric-entity-cases.json'
data = (json.dumps(cases) + '\n').encode()
if target.exists() and target.read_bytes() != data:
    raise SystemExit('Refusing to overwrite different numeric fixtures')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(data)
print('[2/2] Verified 9684 immutable cases; SHA-256: ' + hashlib.sha256(data).hexdigest())
print('Output: ' + str(target))
