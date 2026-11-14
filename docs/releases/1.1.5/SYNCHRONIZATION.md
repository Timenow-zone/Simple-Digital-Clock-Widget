# Phase 1 proof and phase 2 source verification

This work is local. **The reviewed server-rendered scope passes; universal
compatibility with every public 1.1.2 integration is false.** No final release
candidate ZIP, commit, PR update, tag or publication is produced in these phases.

## Phase 1: independently reread evidence

The exact existing server-r2 ZIP is
`2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`
(71,378 bytes, 17 files). All 3,004 previously indexed evidence files were
rehash-verified without drift. The new audit compares raw snapshots and browser
observations rather than relying only on the earlier PASS summaries.

| Requirement | Independently checked result |
| --- | --- |
| Public 1.1.2 to r2 | Four exact Core/PHP pairs; all 436 post rows, 108 postmeta rows and 40 selected option rows unchanged at update |
| Existing healthy Gutenberg records | All 24 original records / 116 clocks retain IDs/settings; 96 same-ID native saves, setting changes/restorations and repeat/reopen checks |
| Native persistence evidence | 132 POST requests return HTTP 200; 168 subsequent REST GET bodies independently parsed; original healthy final DB content equals original content |
| Working 1.1.2 integrations | 200 working-clock observations remain working; 40 empty controls change from one runtime request to zero |
| Broken 1.1.4 integrations | All 80 previous nonworking observations recover; all 200 clock observations work after updating; 40 empty controls remain empty |
| Rollback/reupdate | 100 repeated clock observations work and 20 empty controls remain empty on the two checked references |
| Clock-free final HTML | 352/352 checks have zero actual clocks, runtime requests, runtime tags and plugin inline JavaScript |

These are generated fixture observations across the four Core/PHP pairs listed
in [README.md](README.md), not production-user counts. The malformed old corpus
contains 40 settings losses already present in public 1.1.2; no new loss was
found in the reviewed scope. POST response bodies were not separately archived;
the 168 stored bodies are subsequent `context=edit` GET readbacks.

A concrete same-fixture example is `theme-hook-unmanaged`, `rows[22]`, minimum
reference, Chromium, in `server115-114-0-a/integration-browser-{legacy,updated}.json`:

| Observation | Public 1.1.4 | r2 |
| --- | --- | --- |
| Clock runtime requests / tags | 0 / 0 | 1 / 1 |
| Shadow root and visible clock | false | true |
| Observed clock text | empty | `18:32:46` then `18:32:47` |
| Stored/rendered attributes | Preserved | Same attributes |
| Added host-layout CSS | 0 | 0 |

The zero-JavaScript checks include ordinary empty pages and rendered blocks later
suppressed or escaped. In the latter case one requested inline layout rule may
remain; zero scripts does not mean zero CSS. Raw integration observations retain
request arrays, script tags, shadow/visibility and advancing-time snapshots.
The broader smoke suite retains resource counts and executed assertions; it does
not archive every DOM snapshot or every non-HTML response body.

The additional constructed browser counterexample demonstrates the boundary:
an initially clock-free document followed by a client-created first clock works
with the old global runtime, remains unregistered under zero-runtime delivery,
and works after explicit runtime loading. It uses exact archived runtime bytes,
not a new WordPress HTTP update test. An integration relying on that old implicit
global runtime must provide explicit loading. Full-page caches also require
regeneration; arbitrary third-party loaders, parsers and optimizers are outside
the confirmed matrix.

Detailed audit receipts and concrete IDs/hashes are retained locally:

- `.local/release-115-two-phase-20261111/proof-112.json` and `README.md`.
- `.local/release-115-two-phase-20261111/phase1/raw-readback-examples.json`.
- `.local/release-115-two-phase-20261111/phase1/client-only-counterexample/proof.json` and three screenshots.

## Phase 2: synchronized source and guards

The canonical installable directory now matches all **17 existing r2 payload
files byte-for-byte**. Four files changed and the historical observer was added.
The [manifest](manifest.json) binds this source to the retained archive and adds
the widget source commit required by package checks. It does not announce a new
final RC or erase the client-only compatibility boundary.

The root/WordPress/package README surfaces, frontend asset contract, new 1.1.5
record and four lab README files are synchronized. Historical release records,
fixture README files and published preview evidence retain their original scope;
they are not mass-renumbered. Pinned 1.1.4 native/performance/rollback tools are
explicitly historical and have not been presented as new 1.1.5 orchestration.

POT `Project-Id-Version` is 1.1.5. A separate fresh extraction with pinned WP-CLI
2.12.0/PHP 8.3, no network and no database, matches all 63 messages, references,
contexts and placeholders. Only POT-Creation-Date differs. The canonical POT
keeps the exact r2 bytes; no missing catalog strings were concealed by preserving
the old extraction date. WordPress.org language-pack completeness is separate.

The asset tests now cover conditional output, early registration/data attachment,
Core-generated nonce/tag preservation, final-clock-free suppression, raw/owned
CSS scope, actual PHP output handlers, split/CLEAN/final/late delivery, hook
registration and admin/editor scope. Core API doubles are explicitly scoped;
HTTP headers and genuine Core behavior remain covered by the retained native
acceptance rather than being attributed to these unit fixtures.

The final red/green receipt records **87/87 PHP checks and 8/8 Node groups** for
both canonical and frozen r2. Public r14 has 22 expected failed checks and five
failed groups, including behavioral raw-output and suppression failures. It is
an expected negative control, not an unresolved failure of the current source.

Local verification commands, with raw receipts under
`.local/release-115-two-phase-20261111/checks/`, include:

```sh
node --test tests/wordpress-package.test.mjs tests/wordpress-assets.test.mjs tests/wordpress-i18n.test.mjs tests/wordpress-serialization.test.mjs tests/wordpress-rest-metadata.test.mjs
python3 tools/wordpress-lab/verify-package.py --zip .local/compatibility-hotfix-20261111/candidate-r2/simple-digital-clock-1.1.5-server-r2.zip
python3 tests/wordpress-lab.test.py
python3 tests/wordpress-rollback.test.py
npm run release:check
npm run release:verify
node scripts/build-wordpress-preview.mjs --check
node scripts/check-public-prose.mjs
git diff --check
```

The final combined Node run passes **44/44 tests**, with no skips or failures.
The existing ZIP verifier passes **17/17 files**, preview parity passes, the lab
safety suite passes **9 tests** and the rollback guard suite passes **15 tests**.
Both widget release checks pass without rebuilding or changing published bytes.
The public-prose check covers 86 tracked Markdown files; new release documents
are checked separately because they are not yet tracked by Git.

Source syntax checks include all seven PHP and three JavaScript files, including
the newly added observer. The unchanged widget/lockfile/versioned bundles are not
rebuilt. The temporary rollback-test build verifies its historical reserve; it
does not create a 1.1.5 release candidate. Fresh final-RC packaging and required
hosted checks remain subsequent gates. The measured server-memory cost remains
documented in the release README; zero scripts is not a zero-server-cost claim.

The local baseline backup contains pre-synchronization source, documentation and
tests. Rollback must restore only those intended paths and account for newly
added paths; it must preserve the retained ZIPs, databases and evidence.
