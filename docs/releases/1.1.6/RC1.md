# WordPress 1.1.6 RC1 packaging record

Date: 2026-11-12, Europe/Kyiv. Historical status: **RC1 assembled; scoped package
and installed checks PASS**, subsequently superseded by independent **NO-GO**
for three compatibility regressions. See the [current release disposition](README.md).
The historical source was `558460c80fe317e6d0327c79c8a4478e7430e8cf`; both required
checks passed in [run 43112671573](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43112671573).
Later PR heads and their checks do not change this RC1 record. This is candidate
preparation only. No WordPress.org publication, GitHub Release, tag, merge,
production CDN deployment or owner-site installation is included.

## Exact artifact

- [ZIP](../../../.local/packages/simple-digital-clock-1.1.6-rc1.zip):
  `simple-digital-clock-1.1.6-rc1.zip`.
- SHA-256: `1b29a26dc28431a40c475c9db6e7cee6056ef9731f298c6f672da7d200af1ecf`.
- Size: **71,397 bytes / 17 regular files**, one `simple-digital-clock/` root.
- Installable WordPress version: **1.1.6**. `RC1` identifies this local artifact;
  it is not a published release or a separate runtime version.
- Bundled widget: unchanged **0.8.1**, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Source base: `e4c753aaef2cc92c52ba517579c17bf358a0b2c2`; the containing Git
  revision and [frozen RC1 manifest](manifest-rc1.json) identify the RC1 metadata changes.

The previous r3 ZIP, SHA-256
`9c853236e957119a8aac4588d8565308f10fa0d430799ac4e3d1917ca6789137`,
is retained with its [frozen manifest](manifest-browser-r3.json). RC1 was built
as a new archive from the verified source with deterministic ZIP timestamps,
sorted entries and regular 0644 permissions; existing archives were not replaced.

## Accompanying-file synchronization

| Surface | RC1 verification |
| --- | --- |
| `widget_init.php` | Version and file annotation 1.1.6; WordPress 6.3 / PHP 7.0 minimums unchanged |
| `readme.txt` | Stable tag, first changelog entry and first Upgrade Notice all 1.1.6; tested up to 7.1 and minimum requirements agree |
| Upgrade Notice | Added the previously omitted 1.1.6 entry, including cache-regeneration guidance; historical 1.1.5 text preserved |
| POT | Fresh pinned WP-CLI 2.12.0 extraction; Project-Id-Version 1.1.6; all 63 messages, references, contexts and placeholders match |
| POT timestamp | Actual generator UTC timestamp retained; only creation date changed relative to r3 |
| Asset registration | Plugin layout handle 1.1.6; main runtime/cache version remains 0.8.1 |
| Widget metadata | `package.json`, immutable dist bytes, bundled source commit and notices remain consistent with independent widget version 0.8.1 |
| Existing file annotations | Unchanged `block.js` 1.1.4 and admin-notices 1.1.1 annotations describe those file revisions, not the package version |
| Package metadata | File allowlist, per-file SHA-256, ZIP hash/size and current README links updated to RC1 |
| Historical records | Published versions, r1/r2/r3 archives and original acceptance reports preserved |

Only `readme.txt` and `languages/simple-digital-clock.pot` differ from r3.
All **15 other files are byte-identical**. No runtime, PHP logic, editor schema,
stored content format, translation message or database migration changed.

## Checks and evidence

The existing package guard now requires the first Changelog and Upgrade Notice
entries to match the plugin version. Its retained RED run detects the actual
missing 1.1.6 notice; the corrected package passes. This closes a release-metadata
coverage gap without changing published historical files.

Fresh local checks pass: exact ZIP/source/manifest identity and CRC/file-set
verification, **44/44 focused tests** including metadata/i18n/assets/REST and
serialization, `release:check`, `release:verify`, preview consistency and prose/
diff checks. Fresh POT extraction used no network and read-only source mounts;
only the generated POT was promoted after equivalence verification.

The exact RC1 was installed in the isolated current WordPress 7.1.4/PHP 8.3.35
clone. All 17 installed files match the archive. Plugin Check 2.1.0 ran **29
static + 5 runtime checks with zero findings**. Chromium smoke passes **2/2**:
the raw clock advances with one runtime request; an empty page makes none.
Posts/postmeta and stable options remain unchanged; Core transient changes are
recorded separately. All three owned lab containers were stopped. This is not
a fresh minimum-PHP or complete editor/upgrade matrix for RC1.

The [r3 final acceptance](FINAL-ACCEPTANCE-2026-11-12.md) separately records 190
browser cases, 40 native frontend cases, 22 native Core checks, four editor
workflows and earlier real Core upgrades. Those results apply to the unchanged
code and are not renamed as fresh RC1 installation results. Required hosted
checks must pass on the new [draft PR #19 HEAD](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks).

The [RC1 acceptance aggregate](acceptance-rc1.json) binds these fresh results and
evidence hashes to the new ZIP. Local packaging evidence is retained under
`.local/rc1-116-20261112/`: `build.py`,
`build.json`, baseline identity, the RED/green logs, command receipts and fresh
POT output and `installed-checks/RESULT.json`. The accepted 1.1.5 rollback ZIP is unchanged. The current manifest
records the exact candidate separately from its inherited functional evidence.

Known runtime loading limits remain unchanged: first clocks gated on
`customElements.whenDefined()` or created in shadow roots require explicit
loading. Clock-free pages retain inline bootstrap/JSON bytes and a DOM observer.
Arbitrary optimizers, all CSP configurations, multisite, native Safari and owner
site behavior are not universally certified. Publication requires a separate
instruction after candidate review.
