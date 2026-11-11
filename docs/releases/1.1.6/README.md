# WordPress 1.1.6 release candidate

Current package: **RC1**, unpublished. See the [RC1 packaging record](RC1.md)
and [current manifest](manifest.json). The ZIP is
[`simple-digital-clock-1.1.6-rc1.zip`](../../../.local/packages/simple-digital-clock-1.1.6-rc1.zip),
SHA-256 `1b29a26dc28431a40c475c9db6e7cee6056ef9731f298c6f672da7d200af1ecf`,
71,397 bytes / 17 files. RC1 adds the missing 1.1.6 upgrade notice and refreshes
the POT extraction timestamp; all 15 other files, including executable PHP/JS,
are identical to the accepted r3 below. Prior r3 checks remain evidence for those
unchanged files, not a claim that the new ZIP had already been tested.

## Retained browser-r3 acceptance

Status: **final candidate checks PASS**, revision `browser-r3`, 2026-11-12.
Unpublished. No owner-site installation, WordPress.org publication, CDN deployment,
GitHub release or merge was performed. The [final acceptance report](FINAL-ACCEPTANCE-2026-11-12.md)
records complete repository/browser checks, fresh native editor/Plugin Check/POT
results and successful required hosted checks for the payload source commit.
[Draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
must retain successful **Repository checks** and **Browser tests** on its latest
HEAD. Acceptance does not authorize publication. The preparation evidence below
is retained separately from the expanded final checks.

## Artifact identity

- ZIP: [simple-digital-clock-1.1.6-browser-r3-candidate.zip](../../../.local/packages/simple-digital-clock-1.1.6-browser-r3-candidate.zip).
- SHA-256: `9c853236e957119a8aac4588d8565308f10fa0d430799ac4e3d1917ca6789137`.
- Size: 71,358 bytes; 17 installable files.
- Source base: `5b580f86fa5dacf886d6520b1ed9cd6594cc8cdb`, with candidate changes
  identified by the containing Git revision. This is not a published release. The [frozen r3 manifest](manifest-browser-r3.json)
  identifies every installed file independently of the working branch.
- Shared widget: unchanged `0.8.1`, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

Compared with the accepted 1.1.5 package, four files change (asset integration,
plugin header, readme, POT version), one browser loader is added and the old PHP
output observer is removed. Twelve files are byte-identical, including the
runtime, editor block and KSES integration. All 125 baseline tracked files under
`dist/`, `docs/releases/1.1.4/` and `docs/releases/1.1.5/` remain unchanged.

## Behavior

The candidate replaces whole-page PHP output observation with an inline browser
loader and inert JSON containing Core-generated script markup. The unchanged
runtime activates after a connected HTML clock appears in the ordinary document
DOM, including a later client-side insertion. The waiting observer processes DOM
additions without polling and stops when activation begins. The loader is 7,959
source bytes, 2,129 bytes with local Python gzip level 9; this is a file-size measurement, not
a measured HTTP response overhead or production performance result. JSON
metadata and surrounding tags add bytes.

PHP uses a private buffer only to capture script tags from an isolated copy of
`WP_Scripts`; it does not buffer or parse the page. Normal explicit Core enqueue
remains authoritative, including a late enqueue after the default footer printer.
It can intentionally load the runtime without a clock already present. Editor
preview remains separately scoped. No database migration or saved-block rewrite
is included.

The [asset contract](../../WORDPRESS-ASSET-CONTRACT.md) defines the complete
loading, error and integration behavior.

## Fresh verification of r3

| Check | Result and scope |
| --- | --- |
| Focused repository suite | 44/44 tests, no skips; includes 94 PHP asset assertions, package, i18n, REST metadata and serialization checks |
| Loader browser suite | 63/63 tests, no skips: 20 scenarios in Chromium, Firefox and WebKit plus three parent tests; real immutable runtime served locally |
| Real Core upgrades | 2/2 transitions from accepted 1.1.5 to this exact r3 ZIP; all 17 installed file hashes match; old observer absent |
| Native WordPress browsers | 40/40 cases: two Core/PHP pairs, Chromium/WebKit, ten scenarios per combination |
| Native Core integration | 22/22 checks for registry/queue isolation, dependency and inline-data order, filters, nonce attributes and private-buffer cleanup |
| Package and release guards | Exact ZIP/manifest/source match; `release:check`, `release:verify`, preview check, prose check, PHP/JS syntax and `git diff --check` pass |

The native pairs were WordPress 6.3.14 / PHP 7.0.33 and WordPress 7.1.4 / PHP
8.3.35. The browser cases cover raw legacy HTML, owned rendering, an existing
saved block through the real `the_content` pipeline without resaving, multiple
clocks, late footer output, dynamic insertion, empty pages, inert examples and
normal/late explicit enqueue. Empty/inert pages made zero main-runtime requests;
ordinary clock pages made one, with the clocks rendering and ticking.

The separate three-engine suite additionally checks duplicate bootstraps,
existing async runtime ownership, dependencies, CSP, network errors, bounded
timeouts, malformed configuration/URLs and unsupported filtered markup. It ran
in a cached Playwright Linux container with no external network, no downloads
and a read-only repository mount; tested source hashes stayed unchanged.

All 211 posts and 42 postmeta rows in each native clone retain identical full-row
hashes. Stable options remain unchanged across 137/142 options; only the current
site's Core `update_themes` transient changed. This is not a whole-database
identity claim. All three created containers were stopped; the source lab stayed
stopped. The owner site was not touched.

### Evidence

- [Final command receipts](../../../.local/candidate-116-20261111/checks/final-r3-checks.json)
  link individual stdout/stderr logs.
- [Three-engine receipt](../../../.local/candidate-116-20261111/checks/browser-loader-json-r3-linux.json)
  and [test log](../../../.local/candidate-116-20261111/checks/browser-loader-json-r3-linux.log).
- [Native aggregate](../../../.local/candidate-116-native-20261111/evidence/final-r3-RESULT.json)
  links upgrade, browser, Core, data and container-stop receipts.
- [Native report](../../../.local/candidate-116-native-20261111/REPORT.md) records
  harness details and legacy Core CSP fixture accommodations.
- [Preservation receipt](../../../.local/candidate-116-20261111/checks/preservation.json)
  records immutable runtime, historical files and rollback archive identity.

Raw evidence and ZIPs are retained locally under ignored `.local/` paths. They
are not implied to be available in a remote checkout. A future release must
retain its accepted evidence and attach the exact artifact separately.

## Corrections during preparation and remaining limits

Revision r1 exposed a Firefox speculative runtime request with unsupported
filtered markup inside a literal template. Revision r2 moved captured markup
into inert JSON. Independent review then found that an unrelated malformed
script URL could interrupt deduplication; r3 ignores unrelated invalid URLs and
explicitly rejects invalid captured runtime URLs. Regression cases pass in all
three engines. Superseded archives, identities and failure evidence are retained;
only r3 has the final acceptance above.

The first clock created only after `customElements.whenDefined()` resolves, or
inside a shadow root, requires explicit runtime loading. No universal legacy
JavaScript or arbitrary optimizer/consent compatibility is claimed. Strict CSP
must permit both the loader and runtime. The native CSP fixture grants a hash to
Core 6.3 legacy localized inline data and removes an unrelated nonce-less theme
skip-link script; those accommodations are not plugin changes.

This work does not establish native Safari, multisite, a complete Gutenberg
save/roles matrix, owner-site compatibility, production latency or concurrent
load acceptance. There is a waiting DOM observer on clock-free pages, plus inline
loader/JSON bytes, despite zero main-runtime downloads.

## Current RC1 verification and rollback

From the repository root, with the existing local dependencies:

```sh
set -euo pipefail
python3 tools/wordpress-lab/verify-package.py \
  --zip .local/packages/simple-digital-clock-1.1.6-rc1.zip
node --test tests/wordpress-assets.test.mjs tests/wordpress-package.test.mjs \
  tests/wordpress-i18n.test.mjs tests/wordpress-rest-metadata.test.mjs \
  tests/wordpress-serialization.test.mjs
docker run --rm --pull never --network none \
  --mount "type=bind,source=$PWD,target=/work,readonly" --workdir /work \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  node --test tests/wordpress-loader.integration.test.mjs
```

The Docker command requires the already cached image; it does not pull it.
The native harness and receipts are retained in the local evidence directory.

The accepted rollback package remains
`.local/packages/simple-digital-clock-1.1.5-final.zip`, SHA-256
`2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
No schema or content migration needs reversal. A future install or rollback
requires regenerating full-page caches and checking both a clock page and an
empty page. Neither operation was performed on the owner site here.
