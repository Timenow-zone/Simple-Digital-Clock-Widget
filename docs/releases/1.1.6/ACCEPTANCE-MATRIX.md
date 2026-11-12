# WordPress delivery remediation acceptance matrix

Acceptance specification, 2026-11-12. This table defines required gates;
it does not itself mark their execution as passed. Selected [RC3](RC3.md) is in
affected acceptance. Phase 2 expanded the shared runtime to 0.8.2 with a
lightweight registration shell; see the design decision in the plan. See the
[remediation plan](REMEDIATION-PLAN.md) for architecture, authorization and scope.

## Environments and measurement

Required primary installations: WordPress 6.3.14/PHP 7.0.33 and WordPress
7.1.4/PHP 8.3.35, with a block theme and a classic theme. Pin archives/images and
record actual running versions. Use actual Chromium, Firefox and WebKit for the
primary frontend/editor/preview matrix. Linux Firefox is acceptable when the
host browser cannot launch; label the environment honestly. WebKit is not native
Safari. Do not introduce a separate Gutenberg plugin unless testing it explicitly.

Additional environments: a two-site subdirectory network on current WordPress
and PHP 8.5, with superadmin/non-super site admin; and a separate current-core
Autoptimize + WP Super Cache installation. Record exact versions/configuration.
The normal Author role must not acquire permanent editor/admin capabilities or
`unfiltered_html`. Any request-scoped capability in a controller-only fixture is
labeled and is not counted as native UI authorization coverage.

Count **network requests to the main runtime**, executable runtime tags and
actual registrations separately from bootstrap/configuration bytes. Measure each
document/iframe realm separately. A PASS requires visible clock shadow content,
correct settings and ticking where relevant, not only a host tag or a defined
custom element. Preserve HTTP bodies/headers, console/page errors and screenshots
for native failures. Observe real load timeouts without shortening the final
acceptance timer.

## Required gates

| ID | Scenario | PASS criterion | Required execution |
| --- | --- | --- | --- |
| ID-01 | Source, ZIP, manifest, installed files | Exact candidate SHA/CRC/full allowlist; no extra files/symlinks; source and installed maps agree | Both primary sites, every transition |
| ID-02 | Shared artifact preservation and delivery | Published 0.8.1 and older versioned artifacts unchanged; new 0.8.2 build, CDN bytes, version references and rollback verified | Before/after implementation, production delivery and final review |
| LOAD-01 | Public page without clock use, default bundled runtime | Zero main-runtime requests and executable runtime tags; no renderer initialization; lightweight shell definition and external bootstrap cost documented; owner-approved opaque overrides are counted separately under CORE-01 | Both themes/sites, three engines |
| LOAD-02 | Escaped/comment/script-text/template examples | No false activation; zero runtime | Both sites, three engines |
| LOAD-03 | Owned block, one/many/nested | Runtime once; all clocks render/tick with correct attributes | Both themes/sites, three engines |
| LOAD-04 | Template part, synced/reusable block, pattern, sidebar placement | Actual native resolution renders clocks; absent/unrendered placement does not load runtime | Applicable native surfaces, both Core versions |
| LOAD-05 | Legacy Text/Custom HTML, core/html, raw template output | Existing saved markup works without resave; runtime once | Both sites, three engines |
| LOAD-06 | First dynamic insertion and later additions | Actual clock activates; no duplicate runtime; inert/removal-before-detection controls stay empty | Three engines |
| LOAD-07 | Empty owned output and later suppression | Empty output at the owned hook does not enqueue; later suppression after a real use signal is recorded under the new render contract | PHP plus native controls |
| LOAD-08 | Existing/pending/printed/defined runtime, duplicate bootstrap | Owner retained; no duplicate request, definition or before/after side effects | Three engines and actual Core |
| LOAD-09 | Native path without fallback | Owned block/helper still work when fallback is disabled; native path does not call private markup capture; disabling native enqueue fails this control | Both sites, three engines |
| CORE-01 | Explicit helper/enqueue/dependency, late footer request, and configured opaque overrides | Legacy helper requests runtime; native Core behavior and output order preserved; opaque overrides keep eager legacy behavior per the explicitly approved override policy, including one request on empty pages | Both Core versions, three engines |
| CORE-02 | Runtime markup capture | Original full registry/queue and buffer level unchanged; filters, localized data, dependencies and before/after retained | Actual Core, both versions |
| MIME-01 | Ordinary REST/feed/robots/trackback/JSON/XML/excerpts/admin | No plugin bootstrap/runtime output leaks; response parses; no unintended global admin load | Both sites; body scan includes escaped JSON markup |
| CSP-01 | External-only script-src self | Static, raw and dynamic clocks render through allowed external assets; no plugin inline-code dependency | Both sites, three engines |
| CSP-02 | Nonce policies, SRI, blocked/mismatched nonce | Positive permitted cases render; negative policy cases fail observably without bypass; attributes/order retained | Actual Core filters, both sites, three engines |
| ERR-01 | 404, timeout, invalid payload/URL, unsupported transforms, missing registration | One bounded diagnostic, no silent success/retry loop, cleanup complete; actual event ordering recorded | Three engines; sensitivity controls |
| UI-01 | Empty Post Editor: insert/configure/save/reopen/repeat | Real native UI; iframe preview immediately usable; all settings and valid block state preserved | Admin/Author, both sites, three engines |
| UI-02 | Old published content | Actual public-1.1.2 baseline; old blocks render before any save, save twice/reopen without new invalid blocks or data loss | Admin/Author, both sites, three engines |
| UI-03 | Native Site Editor | Open existing template/part, insert/edit clock, save/reopen; actual iframe works and frontend matches | Admin, both block-theme sites, three engines |
| UI-04 | Native block Widgets editor | Canonical one-block-per-widget fixtures; visible Update completes; reload preserves settings | Admin, both classic-theme sites, three engines |
| UI-05 | Native legacy Text/Custom HTML preview | Unchanged clock HTML/options; all 12 baseline/candidate pairs render; runtime present in each isolated iframe | Two widget types × two sites × three engines |
| UI-06 | Editor lifecycle and boundaries | Delete/undo/reinsert, multiple clocks, supported iframe/non-iframe modes; no duplicate-definition or uncaught plugin errors; ordinary dashboard untouched | Both Core versions; actual supported modes recorded |
| UI-07 | Separate Core iframe asset registry | Repeated editor-content hooks populate each required registry; a parent enqueue cannot suppress iframe assets | Both Core versions; actual iframe content and script requests |
| COMP-01 | Existing WP or explicit signal + whenDefined/shadow | Early runtime request makes old integration work; open and closed shadow roots tested | Both sites, three engines |
| COMP-02 | Original signal-free whenDefined/shadow counterexamples | Original before/after fixtures retained unmodified; no falsely claimed closure; fixed or explicitly decided residual boundary | Both sites, three engines; mandatory disposition |
| DATA-01 | Captions/entities/Unicode/RTL/backslashes/defaults/foreign blocks | Preserve settings, HTML/tag meaning, foreign block metadata and relationships; explain any established comment-JSON normalization | Native UI, database snapshots and serializers |
| DATA-02 | Public baseline → candidate → files-only rollback → reupdate | Active state and exact file maps; eight ordered content-table hashes/site and stable options unchanged at file transitions; old/new content readable | Both primary sites; no database restore |
| DATA-03 | Fresh public 1.1.5 → candidate | Real Core updater; verify public ZIP provenance and unpacked identity; same data invariants | Both primary sites |
| DATA-04 | Read-only frontend requests | Content tables, options and plugin files unchanged within a bracketed read-only pass | Both sites |
| DATA-05 | Native save after files-only rollback | Healthy old/new control content saves under public 1.1.2 and retains values after reupdate; known old-writer terminal-backslash failures separately classified | Both sites, three engines |
| NET-01 | Network-active multisite lifecycle | Upgrade/rollback/reupdate, site admin without unfiltered_html and superadmin; both sites' tables/options and network activation preserved | Current Core/PHP 8.5, Chromium minimum |
| CACHE-01 | Real optimization and full-page cache | Actual HIT and optimized control asset; after explicit purge exact candidate runtime on clock pages and zero runtime on empty page | Current site, three engines |
| CACHE-02 | Warm cache from old version | Staleness detected and excluded from candidate execution claims; purge/MISS/HIT control proves the oracle | Same cache configuration |
| PKG-01 | PHP/JS/Python syntax and runtime compatibility | PHP minimum/current lint and actual execution; JS/harness syntax; no masked unsupported API | All changed code and package PHP files |
| PKG-02 | Plugin Check | Actual static and runtime checks pass on supported PHP; minimum-PHP checker skip explicitly distinguished from product execution | Exact installed candidate |
| I18N-01 | POT and language/context safety | Fresh exact-ZIP extraction; strings/references/placeholders/tags agree; escaping and saved Unicode preserved | Package plus regression fixtures |
| REG-01 | Existing regression suites and build | Relevant contracts, serializer/security/runtime tests pass; production build smoke leaves immutable artifacts unchanged | Final candidate source |
| DOC-01 | All accompanying files | Plan checklist reviewed; versions/links/hashes/behavior/POT/notices/preview and PR metadata agree; history preserved | Independent final review |
| CI-01 | Required hosted checks | Repository checks and Browser tests successful on the exact final PR HEAD | After final source/docs changes |
| SAFE-01 | Evidence and teardown | New run only; immutable inputs retained; failures kept; hash inventory verifies; only owned services stopped | Every lab run and final closure |
| REL-01 | Publication boundary | Accepted artifact and rollback ready; WP publication remains deferred until explicit instruction | Phase 4 and later publication turn |

The broad native matrix may be executed in controlled stages to avoid redundant
runs. Once a gate passes, repeat it only for a relevant change, a failure, or a
new unresolved concern. Never multiply parent-runner counts into claims of
independent native scenarios. A skipped required gate blocks full acceptance.

## Baseline, data and negative controls

Seed healthy legacy content using the actual installed public plugin and native
serializer/REST paths, and separately exercise real visible UI insertion and
Save/Update. Retain requested/stored/parsed/rendered values. Use canonical widget
instances and Core widget-area save completion, not a multi-block instance that
the Widgets editor only represents by its first parsed block.

Keep full ordered snapshots for posts/postmeta/terms/taxonomy/relationships/
termmeta/comments/commentmeta, stable options, and installed files. Separate
deliberate editor title/timestamp/lock/revision/draft changes from file-transition
invariants. Do not claim whole-database byte identity or conceal the two known
legacy terminal-backslash normalization cases. Native Site Editor and widget
saves need their own before/after records.

Required negative controls include: unchanged RC1 reproduces missing legacy
preview assets and external-only CSP failure; deliberately blocked runtime
cannot pass the rendering oracle; invalid nonce cannot pass a CSP case; a forced
global runtime enqueue fails the empty-page gate; a stale cached response cannot
be mistaken for execution of the new artifact. Controls mutate only disposable
fixtures/copies. The hidden-integration controls must not be "fixed" by adding
candidate-only enqueue code to the fixture.

## Existing repository commands

These commands are verified entry points, not evidence they have already passed
for the future candidate. Run with the locked dependencies and required local
PHP/browser tools. The full CI also runs its declared tooling/audit checks.
Do not use blanket formatting or direct production builds to alter unrelated
files while running acceptance.

```sh
set -euo pipefail
cd /Users/yy/dev2/Simple-Digital-Clock-Widget
node scripts/check-public-prose.mjs
git diff --check
node --test tests/wordpress-assets.test.mjs tests/wordpress-package.test.mjs \
  tests/wordpress-i18n.test.mjs tests/wordpress-rest-metadata.test.mjs \
  tests/wordpress-serialization.test.mjs
node --test tests/wordpress-loader.integration.test.mjs \
  tests/wordpress-serialization.integration.test.mjs
npm run release:check
npm run release:verify
node scripts/check-build.mjs
node scripts/build-wordpress-preview.mjs --check
python3 tests/wordpress-lab.test.py
python3 tests/wordpress-rollback.test.py
npx --no-install tsc --noEmit -p tsconfig.json
npx --no-install tsc --noEmit -p tsconfig.test.json
npx --no-install tsc --noEmit -p tsconfig.wtr.json
npm run lint
npm run test:node
npm run test:browsers
node --test tests/product-site.integration.test.mjs
```

Native WordPress, actual Plugin Check, cache and network tests require isolated
lab execution and are not replaced by this command block. Preserve their exact
commands, tool versions, exit statuses and output paths in the new acceptance
receipt. `npm run test:node`, `npm run test:browsers`, type checking, lint, release
metadata tests and product-site tests remain part of the final required CI.

Verify the fresh candidate after its current manifest is synchronized:

```sh
set -euo pipefail
cd /Users/yy/dev2/Simple-Digital-Clock-Widget
python3 tools/wordpress-lab/verify-package.py \
  --zip .local/packages/simple-digital-clock-1.1.6-rc3.zip
```

Use the selected frozen revision path. A repacked archive is not
silently substituted for the independently accepted ZIP. No command above
publishes to WordPress.org.
