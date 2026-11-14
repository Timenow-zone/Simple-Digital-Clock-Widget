# RC9 Gutenberg fix acceptance

Date: 2026-11-12. **SCOPED FIX ACCEPTANCE PASS; NOT PUBLISHED.** The two Gutenberg corrections pass independent native acceptance. Full old-editor usability after rollback does not pass, and one WebKit Site Editor same-tab navigation path retains a Core-stack error. These boundaries remain part of the verdict.

The machine-readable receipt is [acceptance-rc9.json](acceptance-rc9.json). The frozen [manifest](manifest-rc9.json) retains its creation-time `NOT_RUN` value; this separate receipt records subsequent acceptance without changing the subject.

## Exact subject and changes

| Subject | Identity |
| --- | --- |
| WordPress candidate | 1.1.6 RC9; 73,184 bytes; 17 files |
| Archive | `.local/packages/simple-digital-clock-1.1.6-rc9.zip` |
| ZIP SHA-256 | `f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909` |
| Manifest SHA-256 | `e0009d6aaffdcd071d8c2c1567212c564e692b2e920c6f0885e3121fd700f0ca` |
| Main runtime 0.8.4 SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Loader SHA-256 | `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |
| Checkout base | `7f79a03df112e4cb84f2ed4f7de21896337e6bc0`; uncommitted candidate identified by its full file map |

The built-in GradientPicker Clear action now stores an explicit empty background and presents undefined to Core's picker. Dedicated Clear Gradient and Clear Colors use the same storage representation. Clearing a gradient retains the solid color; cleared blocks reopen without the picker AST crash in RC9.

Time Zone allows Enter to reach Core only for an actual current option in an open list. Unmatched input preserves the committed zone and shows translatable help. Enter on a closed list preserves the zone, including after Escape. Arrow navigation, matching options, the Kyiv/Kiev label/value alias, mouse/keyboard Reset, Auto and composing-event guards are tested separately.

Only `wordpress/simple-digital-clock/block.js`, `widget_init.php`, the POT and `readme.txt` differ inside the package from RC5. The attribute schema and complete save implementation remain byte-identical. No migration is added. Thirty-three tracked runtime, distribution, dependency and asset files match HEAD byte-for-byte. Temporary production and loader builds reproduce the retained bytes. Published versioned artifacts and earlier frozen candidate manifests/archives remain unchanged.

Nine inspector callback contracts were added in `tests/wordpress-inspector.test.mjs` and wired into Repository checks. They complement native Core acceptance; they do not simulate a full Core editor. Header, changelog, Upgrade Notice, translation dictionary, POT and package manifest were checked together.

## Fresh RC9 regression matrix

The Docker environments are WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35. Native acceptance uses Google Chrome 157.0.8103.51 on macOS, Firefox 153.0 on Linux and WebKit 26.5 on macOS. Standalone Firefox/WebKit gate runs use Linux. WebKit coverage is engine coverage, not installed Safari verification.

| Scope | Accepted workflows |
| --- | ---: |
| Exact main, ordinary HTML: host compatibility and single/multiple clocks | 30/30 |
| Exact main, installed WordPress: runtime isolation and single/multiple clocks | 66/66 |
| Post/Page native inspector, saves, reopen and lifecycle | 18/18 |
| Author Page permission denials | 6/6 |
| HTTP 500, abort and delayed-save recovery | 12/12 workflows; 36 controlled faults |
| Classic Widgets | 6/6 |
| Legacy Text/Custom HTML preview | 6/6 |
| Preserved public widgets | 6/6 |
| Additional admin/permission boundaries | 12/12 |
| Site Editor Home/Header persistence | 12/12, with one fresh-tab reopen variant |
| **Recorded workflow coverage** | **174/174** |

The first two rows constitute the mandatory **six HTML/WordPress × Chrome/Firefox/WebKit combinations**, all passing with the exact main SHA above. Each browser executes 8 standalone host cases, 2 standalone single/multiple workflows, 14 WordPress runtime cases and 8 WordPress single/multiple workflows. Multiple clocks use different settings and retain independent behavior through edits, removal/reconnection and additions. Chrome is launched through the branded Chrome channel.

Each fault workflow includes 70 seconds of clean idle observation, real clock behavior, visible native Save, stored-data readback and full reopen. Role-denial rows are negative permission tests, not successful saves. The root acceptor independently recounted all raw group receipts: 174 unique accepted workflows from 176 attempts, with two original failures retained. Additional diagnostics are excluded from this count.

## Site Editor navigation boundary

The original immediate same-tab WebKit/current-Core Header workflow successfully saved, read back and reopened the expected attributes, but failed the strict page-error guard. A diagnostic reproduced the Core `api-fetch/core-data` error 72 ms after navigation. There was no matching observable HTTP request or `requestfailed` event, so an aborted HTTP request is not asserted as the cause.

The accepted replacement opens the saved native editor in a new tab while retaining the original tab. It preserves all assertions: native Save 200, raw content, existing and newly added blocks, rendered clocks and empty page errors. The template-parts GET completes normally in this variant. **Original same-tab coverage remains 173/174.** The 174/174 figure explicitly includes this one alternate persistence workflow.

A separate template containing only native Core paragraphs reproduced the same class of navigation-associated Core error, using the block-directory/search endpoint rather than template-parts. The paragraphs saved and reopened correctly. The plugin remained active, so this is a no-widget control, not a plugin-disabled Core control. Complete root cause remains unproven. The first diagnostic's RichTextData/string comparison error is retained as a separate harness failure. Product code and error guards were not changed to suppress these observations.

## Independent upgrade and rollback acceptance

An independent agent accepted **12/12 RC9 inspector cells**: two Core versions × three browsers × Admin/ordinary Author. Each native document contains two differently configured clocks. Visible insertion, settings, Save draft, Publish and Update are verified through raw persistence, valid reopened blocks, unchanged neighbors and real frontend clocks. API/store access is used for readback.

| Retained-corpus phase | Read workflows | Native double-save/reopen workflows |
| --- | ---: | ---: |
| Public 1.1.2 and RC5 content opened by RC9 | 24/24 | 24/24 |
| Files-only rollback to RC5 | 36/36 | 36/36 |
| Files-only rollback to public 1.1.2 | 36/36 | 36/36 |
| Actual Core reupdate to RC9 | 36/36 | 36/36 |

The corpus comprises twelve native documents per writer: public 1.1.2, RC5 and RC9. All transition brackets preserve eight content-table hashes, stable options and activation while verifying the complete installed package. Core's upgrader performs updates; rollback replaces only verified files. No database restore is used. Intentional native editor saves are separate from these unchanged transition brackets; whole-database equality throughout the test session is not claimed.

Independent accounting records 300 accepted phase/document workflows from 310 raw attempts: **132 on RC9**, 144 rollback workflows on older packages, and 24 baseline creation/negative-control workflows. These are not 300 new positive RC9 feature tests. Ten initial failed attempts remain: late welcome guides, Dashboard-navigation errors, login failures and one short tick observation. Targeted successful reruns retain strict product assertions. A second agent independently recounted the raw receipts and verified all 1,123 frozen evidence files.

**Full rollback editor compatibility does not pass.** RC5 itself produces a valid cleared-gradient document whose Background Color panel crashes on reopen under observed Core 6.3.14/Chrome. An RC9-created cleared document reproduces the same panel crash after rollback to exact RC5 and public 1.1.2, before any post write. Both documents reopen that panel successfully in RC9, including after reupdate. Data preservation and old-editor usability therefore have separate verdicts.

A nonempty replacement background would override the independent solid color in unchanged runtimes; duplicating the color into both fields would break later color editing in the old editor. Such substitutions are not used to hide the limitation. Older immutable packages do not acquire RC9's picker normalization during rollback.

## Repository checks, rejected candidates and limits

Fresh RC9 local results: 53 focused contracts, 4 package checks and 16 repository commands pass. The latter include source/test type checks, lint, node tests, tooling/security checks, release metadata, `release:check`, `release:verify`, production/loader reproducibility, preview synchronization and lab/rollback guards. PHP/JavaScript syntax and whitespace checks pass.

Fresh browser repository suites pass **259 leaf executions**: WTR 144, iframe 3, fonts 10, serialization 3, loader 96 and product site 3. Runner totals additionally include three loader parent tests. These use Chromium 151.0.7922.34, Firefox 153.0 and WebKit 26.5; the separate branded Chrome gate above supplies Chrome evidence. The local browser transport adapter changes launch/network plumbing only. Assertions and product test sources are unchanged.

RC6 was superseded during source review. RC7 was rejected for an empty-string GradientPicker crash. Independent RC8 acceptance found an Escape/Enter regression relative to RC5, so RC8 was rejected. RC9's source-intercepted preflight and all rejected-candidate results are excluded from installed RC9 acceptance. Their original archives, manifests and failures remain retained.

The claim is bounded to these Core/browser versions, fixtures and saved documents. Synthetic composing events verify event guards, not a physical OS IME session. Stable/reopened solid-color observations match; immediate animated paints are not asserted to be at their final RGB. Arbitrary third-party editor extensions, multisite, every historical document and every locale/zone are outside this execution.

The two functional corrections and tested data-preservation paths pass. Full old-editor rollback usability and error-free immediate same-tab WebKit Site Editor navigation remain explicit limitations. No commit, push, merge, CDN deployment or WordPress.org publication was performed. Required remote Repository checks and Browser tests remain pending for any future authorized PR/merge. Upstream 0.8.4 production CDN delivery remains pending verification. Only owned test projects were stopped; databases/evidence and the original side-by-side lab were preserved.

Raw evidence is retained under `.local/gutenberg-fix-20261112/{root-rc9,independent,regression-rc9,browser-contracts-rc9,browser-contracts-review}` and the owned lab evidence directories. The machine-readable receipt records hashes of the principal reports and inventories.
