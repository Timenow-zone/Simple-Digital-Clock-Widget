# Local CI and repository hygiene — 3 November 2026

The local branch `codex/local-release-ci-hygiene` records the previously accepted
WordPress work and adds mandatory rollback-build checks. No push, remote PR,
merge, tag, deployment or WordPress.org publication was performed.

## Changes

- Commit `7409485` preserves the accumulated streaming-r8 implementation, lab
  tooling, development dependency mitigation, editable rollback recipe and
  curated evidence. Rejected candidates and historical measurements remain
  separate; their receipts were not rewritten to describe newer results.
- The existing **Repository checks** job now runs
  `python3 tests/wordpress-rollback.test.py`, compiles the rollback Python
  modules, checks PHP syntax and checks the browser harness JavaScript syntax.
  The required job names and moderate-or-higher audit policy are unchanged.
- Fifteen offline regression tests rebuild the reserve from two exact input
  ZIP fixtures and compare the entire accepted manifest and archive SHA.
  Controls cover repeat builds, unchanged legacy runtime, metadata drift,
  corrupt/unsafe archives, existing output, rejected lab inputs, startup failure
  cleanup and preservation guards before post-transition editor writes.
- The [fixture inventory](../../tests/fixtures/wordpress-rollback/README.md)
  identifies the two byte-identical plugin archives. Clean-checkout checks do
  not depend on private `.local` paths or mutable downloads. Generated output
  lives in temporary directories; accepted archives are never overwritten.
- `.gitattributes` preserves accepted package, evidence and rollback-recipe
  bytes. CRLF in the accepted readme/CSV captures and whitespace in patch
  context are treated according to their formats, without changing the files.
- Local runtime data, databases, credentials, caches, logs, prior ZIPs and
  backups remain under ignored paths. No historical lab or Docker data was
  removed. The initial dirty-file snapshot is retained under
  `.local/ci-hygiene-20261103/dirty-files-before.zip`.

## Verification

The [machine receipt](local-ci-hygiene-2026-11-03.json) records exact hashes,
step results, source inventory identity, tool versions and limitations.

An isolated Ubuntu 24.04 / Linux arm64 copy ran the workflow's repository and
browser commands with Node 24.18.1, Python 3.12.3 and PHP 8.3.6: **21/21 steps
passed**. Dependency installation used `npm ci --ignore-scripts`; reviewed
patches were then applied with networking disabled before executing tests.
All 403 copied source files matched the working tree at verification. Only
the maintenance receipt and navigation documentation were added afterward.

| Checks | Passed |
| --- | ---: |
| Python lab safety | 9 |
| Python rollback build and guards | 15 |
| Node repository tests | 75 |
| Browser unit tests: 37 each in Chromium, Firefox and WebKit | 111 |
| Iframe, font, native serializer and product-demo integration | 19 |
| Total | **229** |

Type checks, lint, release/preview metadata, temporary production build,
package identity, harness syntax and final tracked-file cleanliness also pass.
The temporary production build exactly reproduces `dist/0.8.1.min.js`.
Host checks additionally parsed all 43 newly staged JSON records, checked 92
PHP/JS/Python source files and found no Cyrillic public prose or staged private
runtime paths. Targeted secret-pattern inspection found no candidates; this is
not a claim of exhaustive secret detection.

Fresh registry audit: **0 moderate/high/critical, 5 low records**, all in the
development dependency chain around `deepmerge`. The existing local patch and
regressions mitigate the tested behavior; the upstream advisory is not closed.

## Immutable artifacts

| Artifact | SHA-256 |
| --- | --- |
| Accepted WordPress 1.1.4 streaming-r8 ZIP | `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37` |
| Accepted reserve 1.1.2.1 revision-2 ZIP | `75ab417c6a641a2ec94a624be54e1760db8b14007ac8919f2814cad62f54c75b` |
| Accepted reserve builder | `64620ecb2deb286fd6eafb8926d3a3c81f79b7fa01370af7c3c2bf9d9143f9c5` |

Both accepted archives, their manifests, installable package files, widget
bundles and the accepted builder remain unchanged. The original public 1.1.2
archive also retains its recorded hash.

## Limits and rollback

This is local CI-equivalent execution, **not a GitHub required-check result**.
GitHub-hosted Ubuntu amd64 checks must pass on the later authorized PR head.
The isolated copy used a synthetic local Git commit for commands requiring Git
metadata; no private repository metadata or owner-site data was mounted.
The fresh registry audit ran separately on the host.

The first Linux image build failed because Docker's internal filesystem had
no available space. Its log is retained. Validation then used read-only
containers, temporary memory filesystems, a new host checkout and signed Ubuntu
PHP packages extracted into a new host directory. No signature checks were
disabled and no existing Docker objects were pruned. Docker capacity remains
an operational issue outside this repository cleanup.

No new native WordPress installation/editor acceptance, performance benchmark
or public delivery is claimed. The exact archived acceptance and its known
limits remain authoritative. To undo this preparation, revert only the intended
local commit after inspection; preserve accepted archives, manifests and lab
evidence. Do not use a broad reset or clean on this workspace.
