# WordPress 1.1.5: final local package

Status: **final local package prepared with the exact accepted server-r2 bytes;
unpublished**. The [prepublication snapshot](PREPUBLICATION-2026-11-11.md)
records final file identity, local checks and the owner-confirmed release scope.
The [manifest](manifest.json) binds canonical source, retained r2 and its
byte-identical final copy. The snapshot records the completed local preparation
before the GitHub stage. Required hosted Repository checks and Browser tests
are tracked for the current head of [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18).
The PR description records the exact validated commit and run after completion;
historical r14 runs do not certify 1.1.5.

## Existing artifact and source boundary

- Revision: `compat-server-r2`, version `1.1.5`.
- Existing archive: `.local/compatibility-hotfix-20261111/candidate-r2/simple-digital-clock-1.1.5-server-r2.zip`.
- Final archive: `.local/packages/simple-digital-clock-1.1.5-final.zip` (identical bytes, no rebuild).
- SHA-256: `2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
- Size: **71,378 bytes / 17 installable files**.
- Widget: immutable **0.8.1**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Widget source commit: `b44f944b60babf45bf266e73ba12f7eba53cfef2`.

The source transfer changes four files and adds one relative to public 1.1.4 r14:
the assets adapter, added historical r8 output observer, `widget_init.php`,
`readme.txt` and POT metadata. The other 12 files retain r14 bytes, including
Gutenberg serialization, KSES/REST/default-parser handling, translated editor
text and notices. No files are removed, no database migration is introduced and
no new CDN artifact is built. The unchanged `block.js` retains its file-level
1.1.4 annotation; plugin release metadata comes from the main header/readme.

The r2 POT changes only `Project-Id-Version` to 1.1.5. The canonical POT was
transferred unchanged from r2, not regenerated. A separate fresh extraction with
pinned WP-CLI 2.12.0/PHP 8.3 matched all 63 messages, source references, contexts
and placeholders; only `POT-Creation-Date` differed. The no-network/no-database
verification is retained in
`.local/release-115-two-phase-20261111/pot-verification/RESULT.json`.
This does not establish complete WordPress.org translations. The JavaScript
package version and release-sync scripts remain at widget 0.8.1.

The [phase 1 audit and phase 2 verification](SYNCHRONIZATION.md) records completed
source/manifest identity checks, 44 passing focused Node tests and the local
release checks separately from the existing native r2 evidence. These local
results do not imply that a new Git HEAD has hosted CI. The subsequent final
package preparation is recorded separately in the prepublication snapshot.

## Installed-package acceptance already completed

The existing r2 package passed bounded local functional acceptance. Frontend,
integration and resource gates used Chromium and WebKit. Native Gutenberg
create/save workflows used Chromium with frontend rechecks in both engines;
the separate empty-editor/iframe gate used both engines.

| WordPress | PHP | Public 1.1.2 → r2 | Public 1.1.4 → r2 | Physical r14 rollback and Core reupdate |
| --- | --- | --- | --- | --- |
| 6.3.14 | 7.0.33 | PASS | PASS | PASS |
| 6.8.12 | 8.3.35 | PASS | PASS | Not run on this reference |
| 7.1.4 | 8.3.35 | PASS | PASS | PASS |
| 7.2-beta5 | 8.5.12 | PASS | PASS | Not run on this reference |

This is four specific Core/PHP pairs, not a Cartesian version matrix. `Tested up
to: 7.1` remains unchanged. The beta observation does not certify final 7.2.

Updates used real Core `Plugin_Upgrader::bulk_upgrade` with pinned local package
offers: eight initial upgrades and two reupdates. The two downgrades were
physical plugin-file replacements. These 12 transitions do not prove a public
WordPress.org update offer for 1.1.5 or safe editing with an old writer.

| Gate | Existing exact-r2 evidence |
| --- | --- |
| Integration observations | 600/600: 240 after each initial upgrade path, plus 120 after rollback/reupdate |
| Prior r14 nonworking integrations | All 80 observations corrected: 72 original nine-type regressions plus 8 adjacent-inline observations |
| Native Gutenberg, each initial upgrade path | 12 role/site passes; 36 healthy records with 248 clocks; 48 frontend checks |
| Native Gutenberg after rollback/reupdate | 6 role/site passes; the same 18 healthy records with 124 clocks retested; 24 frontend checks |
| Frontend resource/streaming checks | 816/816 HTML and 80/80 non-HTML |
| Clock-free HTML subset | 352/352: zero runtime requests/tags and plugin inline scripts |
| Clock-bearing HTML subset | 464/464: one runtime request/tag |
| Empty editor first insertion/iframe/save/reopen | 8/8 cases across four references and two engines |
| Plugin Check | Six supported runs, each 29 static + 5 runtime checks, zero findings; two explicit PHP 7 skips |
| Focused metadata/i18n/serialization and syntax | 32/32 tests; all 7 package PHP files parsed |

These are fixture observations, not unique affected-user counts. Template/widget
fixtures were generated and do not claim native Site Editor/Widgets UI coverage.
Each transition checked exact installed files, activation/version, all posts and
postmeta, ten selected stable options and relevant integration/widget/term data.
Transient Core state was outside this comparison; it is not whole-database byte
identity. Native workflows intentionally create drafts/revisions and user notice
metadata.

The malformed legacy controls remain separate. On the 1.1.2 path, 92 of 132
original clock settings remained present/recoverable; 40 losses had already
occurred under the old writer. They are not new r2 losses or recovered missing
data. Direct 1.1.4 upgrades retained all 132 settings; the repeated two-reference
phase retained all 66. Absent stored metadata requires a backup or revision.

## Asset contract and confirmed limit

The primary release scope is saved Simple Digital Clock Gutenberg blocks in
posts, pages and block-based widget areas. The plugin does not register a
shortcode; shortcode cases below are custom PHP integrations used as additional
server-rendered coverage.

The [frontend asset contract](../../WORDPRESS-ASSET-CONTRACT.md) restores the
tested server-rendered raw HTML, Core Custom HTML, HTML/Text widget, template,
theme-hook, dynamic-block, cached-fragment and shortcode integrations. JavaScript
delivery follows observed server output. Owned/explicit layout CSS is separate
and may remain after later suppression; raw-only clocks retain their layout.

**Universal compatibility with public 1.1.2 is false.** A first clock created
only by client JavaScript after initially clock-free HTML no longer benefits
from 1.1.2's global runtime. It needs explicit runtime loading. A constructed
local browser counterexample using exact archived runtime bytes confirms the
working legacy case, the unregistered late clock without a runtime, and recovery
when the runtime is explicitly loaded. This is not a WordPress/network update
test. Calling `SDCW_enqueue_scripts()` without server-rendered markup does not
override the zero-script requirement.

The constructed client-only case is outside the owner-confirmed release scope.
It remains a documented integration boundary, not a failure of saved-block or
block-widget acceptance. No actual user deployment of that constructed scenario
was established by this test.

Full-page caches that bypass PHP require regeneration. Ordinary server-rendered
HTML is the supported observer domain; arbitrary malformed HTML, SVG/MathML,
outer transforms, removed handlers and already-sent fixed Content-Length are
not universally covered. Normal footer execution is required. Firefox on r2,
native Safari/VoiceOver, multisite, arbitrary optimizers and complete language
packs are not certified by this matrix.

## Performance evidence

Two preserved ABBA experiments on Core 7.1.4/PHP 8.3.35 compare exact public r14
and r2: **840 HTTP observations, 560 measured**, 20 matched pairs per scenario
per run. They measure local server generation/delivery, not browser rendering,
CWV, sustained load or production latency. Pairs span opposing-order blocks;
they are not adjacent A/B requests.

Run A had higher r2 TTFB p95 in all seven scenarios; control B had higher r2 p95
in only one. Both are retained. The tail difference is not stable in this sample;
negative paired values do not establish an optimization. Memory cost repeats:
2 MiB of added text raises PHP peak used memory **7.384 → 13.400 MiB**,
**+6,308,240 bytes**. Small/64 KiB responses add 20,776 bytes. Chunk/string copies
are a possible explanation, not separately profiled causation. Bounded retained
observer state does not mean constant request peak memory or zero server cost.
No production latency/memory budget was supplied, so no budget PASS is claimed.

The performance experiments separately verified all 12 database tables and
schema hashes unchanged, restored r2, removed their fixtures and stopped their
services. That stronger read-only comparison does not expand the upgrade tests'
selected-options scope.

## Public status and retained evidence

The last verified public version is **1.1.4**, SVN r3796553. At
**2026-11-11 18:38:48–18:38:50 UTC**, plugin information and its ZIP advertised
1.1.4; all 16 files matched r14. Ten anonymous update checks for installed 1.1.2
returned `no_update: 1.1.2`. This snapshot proves neither universal absence of
offers/installations nor any future rollout deadline.

Local evidence remains outside the installable package and is not a public
download dependency:

- `.local/compatibility-hotfix-20261111/REPORT.md` and `acceptance-final/RESULT.json` with the exact-r2 aggregate.
- `.local/compatibility-hotfix-20261111/phase1/client-only-counterexample/proof.json` with the constructed browser limit.
- `.local/compatibility-hotfix-20261111/performance/COMPARISON.json` and `COMPARISON.md`, preserving both experiments.
- `.local/compatibility-hotfix-20261111/public-state/snapshot-20261111T183749647028Z/RESULT.json` with the dated public responses.

Historical r9/r14 and failed candidates, published tags, release records and
payload hashes remain unchanged. Existing r14 hosted checks do not certify this
1.1.5 source. Merge, tags, GitHub Release, WordPress.org publication, a new CDN
deployment and owner-site installation require their separate authorized steps.
