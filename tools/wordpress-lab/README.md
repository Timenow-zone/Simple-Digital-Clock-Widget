# WordPress lab and compatibility acceptance

See [KSES72-VERIFICATION.md](../../docs/patches/1.1.2/KSES72-VERIFICATION.md) for the functionally tested 1.1.2 runtime and its exact matrix. The [metadata synchronization](../../docs/releases/1.1.2/METADATA-SYNC.md) identifies the subsequent POT/changelog-only release package; the executable files are identical. `kses72-regression.php` adds 134 checks of real save filters and widget callbacks; `kses72-owned-pass.php` adds 42 checks of nested and unrelated sanitization. `kses72-widget-rest.mjs <seed|baseline|save|check> <stage> <engine> <beta83|beta85> [evidence-folder]` exercises the real filtered widget REST path. `beta72-ui.mjs <engine> <profile> <label> [fixed|broken]` verifies an actual title-only Gutenberg Save and reload. Beta profiles are explicitly allowlisted local ports 19533/19534. Temporary caption tokens must never reach stored content.

`integration-front.mjs` and `integration-editor.mjs` accept an optional evidence-folder label, preserving earlier baselines and failed attempts. The editor driver confirms a current page-cache HIT before the widget save, and accepts either a fresh response or the independently confirmed Core stale-cache policy. `beta72-lab.py` pins the final ZIP hash and all 13 PHP suites. Generated runtime data, TLS keys, credentials and database dumps remain ignored under `.local/`.

## Historical setup and earlier acceptance runs

The [initial WordPress 7.2 Beta 2 investigation](../../docs/patches/1.1.2/WP-7.2-BETA.md) found the KSES defect in the previous `1e5d3f0d…` ZIP. The corrected runtime passed [KSES72 acceptance](../../docs/patches/1.1.2/KSES72-VERIFICATION.md): 12 contexts, 18,336 PHP checks and 1,309,248 DOM comparisons. Beta sites use loopback ports 19533/19534 on PHP 8.3/8.5. `beta72-lab.py` provisions only a fresh environment and verifies the pinned artifact; `beta72-browser.py` preserves failures. `beta72-repro.php` retains the diagnostic legacy-parser control. `beta72-ui.mjs` now expects a valid block after the real Save button by default; `broken` is an explicit historical control. Data and credentials remain under ignored `.local/`; setup refuses to overwrite an existing environment.

The instructions and counts below document successive earlier runs. Current evidence is in `.local/wordpress-lab/kses72-final/`; older folder names and archive identities do not identify the current release. Do not run a candidate-only PHP suite against official 1.1.1: the current assertions require the candidate sanitizer. Use fresh labels and the matching installed payload for each stage.

The additional acceptance of candidate `1e5d3f0d…` is tracked in [GAP-CLOSURE.md](../../docs/patches/1.1.2/GAP-CLOSURE.md). `locale-tests.mjs test|read <label> [engine] [localwp|wp70|ms85-child|beta83|beta85] [source-label]` checks Locale input, selection, validation, keyboard behavior, role saves and frontend. Locale selection uses the exact accessible inserter option and keyboard activation; Auto/Reset buttons use mouse clicks in every engine. `locale-pointer-tests.mjs <label> [engine] [profile]` adds 35 assertions for first-click actions, valid Reset defaults, actual Save draft and the exact public 1.1.1 JS reader. `timezone-reset-read.mjs <stage> [engine] [profile] [source-label]` reads those Reset fixtures without saving and verifies viewer-local time in Tokyo. All refuse overwrites and target generated loopback sites only. The earlier [Locale report](../../docs/patches/1.1.2/LOCALE-VERIFICATION.md) describes a superseded candidate.

`final-acceptance.mjs <mode> <stage> [engine] [site|all] [evidence-folder] [reference-folder]` and `viewport-acceptance.mjs <stage> [engine] [evidence-folder]` retain independently captured official baselines. The earlier runs used `gap-closure-921` for results and `gap-closure-reference` for the desktop visual reference; these folder names are not current ZIP identities. `integration-front.mjs <stage> <theme> <mode> [engine] [evidence-folder]` and `integration-editor.mjs <stage> <theme> <mode> [evidence-folder]` target the separate loopback port 19532. They verify real Autoptimize assets, WP Super Cache HITs and content saves. A Core Paragraph control demonstrates that widget REST saves can leave stale page-cache HITs even with the clock plugin disabled; the current suite accepts a fresh response or verifies that known stale-cache policy and manual purge. Exact configurations, downloads, cycle scripts and credentials remain in ignored `.local/`. These tools require the existing isolated setup; do not point them at user sites.

The [native LocalWP public-version recheck](../../docs/patches/1.1.2/LOCALWP-PUBLISHED-RECHECK.md) reinstalls the official 1.1.1 ZIP and compares real Gutenberg UI workflows with the unchanged 1.1.2 candidate. `localwp-published-recheck.mjs <published|candidate> <chromium|webkit> <fixture-suffix> [ui|read]` requires the exact generated native site and fresh empty drafts for UI mode. Read mode accepts the candidate only and makes no content writes. Evidence refuses overwrites. The existing `v2` results confirm both original bugs and their fixes; that historical run found a manual Locale-input defect in both versions, subsequently fixed in the current candidate. The ignored stage helper and controls are retained in `.local/wordpress-lab/published-localwp-recheck/`.

An earlier candidate and its acceptance are documented in [WIDGET-FALLBACK-VERIFICATION.md](../../docs/patches/1.1.2/WIDGET-FALLBACK-VERIFICATION.md). Exact ZIP, source and diff hashes are recorded there. Both P2 findings are fixed, including a guard that preserves earlier widget callbacks. Final results are in `.local/wordpress-lab/widget-fallback-final/`; RED and intermediate runs are retained separately. The original four-site lab and the additional `sdcw-extended-review-20261028` project (loopback ports 19528–19531) cover PHP 7.0 through 8.5 at the explicitly recorded versions. A real Local 10.2.0/nginx 1.26.1/MySQL 8.4.0 site is retained at `.local/native-local-sites/sdcw-112-isolated-20261028/`, on `http://localhost:10003` when started. Native Local HTTPS was outside that earlier matrix. The current runtime also passed direct native Local nginx/FPM/MySQL HTTPS on private loopback port 19443 without changing the shared Local router. Native multisite is not certified by that HTTPS run. All test sites are stopped after acceptance.

`extended-browser.mjs seed|save|read <phase> [engine]` uses 17 existing-role fixture posts across five site contexts, including 103 native clock blocks per post. `extended-widgets.php` exercises actual REST permission mapping and block-widget saves; `extended-widgets.mjs [engine]` independently compares validity, JSON and DOM. `extended-widget-http.mjs` confirms the multisite finding using authenticated HTTP and a real theme sidebar. `extended-fallback-seed.php` requires `--skip-plugins=simple-digital-clock` when creating HTML-only fixtures; `extended-fallback.mjs test <engine> [seed-label]` then checks title-only updates with the candidate loaded. Evidence files refuse overwrites. Run these only with the matching isolated setup and ports; they create test posts/widgets. Known negative scenarios intentionally exit 1. Full setup/cycle/activation scripts and generated site metadata are retained in that ignored workspace without test credentials in Git.

The original four-service Docker setup below is an Apache/MariaDB approximation for investigating the public LocalWP review. It does not reproduce Local's nginx router, PHP-FPM, TLS, or OS integrations; the separately documented native Local acceptance covers those explicit cases.
Plugin ZIPs are mounted read-only and installed into each disposable site's own plugin directory.
Repository sources are not mounted into WordPress; this allows real ZIP replacement and upgrade checks.
No existing user sites or containers are used.
All HTTP ports bind to `127.0.0.1`; the database has no published port and uses a dedicated Compose bridge network.
WordPress HTTP requests to external services are disabled with `WP_HTTP_BLOCK_EXTERNAL`.
The bridge allows Docker Desktop to publish the loopback ports; an `internal: true` network did not publish them in this environment.
The root database account is confined to this disposable test network.
The default subnet `10.254.93.0/24` was checked against existing Docker networks before the investigation.
On another machine, check for overlaps and set `SDCW_LAB_SUBNET` in the ignored environment file if needed.

| Service | WordPress image | PHP | HTTP port |
| --- | --- | --- | --- |
| wp71 | `wordpress:7.1.3-php8.3-apache` | 8.3 | 19427 |
| wp84 | `wordpress:7.1.3-php8.4-apache` | 8.4 | 19428 |
| wp63 | `wordpress:6.3-php8.2-apache` | 8.2 | 19429 |
| wp68 | `wordpress:6.8-php8.3-apache` | 8.3 | 19430 |

From the repository root, create ignored local credentials, extract WP-CLI from its official local image, then start only this lab:

```bash
set -euo pipefail
mkdir -p .local/wordpress-lab
if [ ! -f .local/wordpress-lab/env ]; then
  python3 - <<'PY'
import pathlib, secrets
path = pathlib.Path('.local/wordpress-lab/env')
path.write_text('SDCW_LAB_DB_PASSWORD=' + secrets.token_hex(24) + '\n')
path.chmod(0o600)
PY
fi
if [ ! -f .local/wordpress-lab/browser-credentials.json ]; then
  python3 - <<'PY'
import json, pathlib, secrets
path = pathlib.Path('.local/wordpress-lab/browser-credentials.json')
path.write_text(json.dumps({'username': 'clock_lab_admin', 'password': secrets.token_urlsafe(24)}))
path.chmod(0o600)
PY
fi
if [ ! -f .local/wordpress-lab/wp-cli.phar ]; then
  docker run --rm --network none --entrypoint cat wordpress:cli-2.12.0-php8.3 /usr/local/bin/wp > .local/wordpress-lab/wp-cli.phar
fi
python3 tools/wordpress-lab/package.py
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml up -d --pull never
```

Initialize the disposable sites once, then run the browser investigation using the existing widget development dependencies:

```bash
set -euo pipefail
python3 tools/wordpress-lab/setup.py
node tools/wordpress-lab/smoke.mjs
```

The setup refuses to reinstall an initialized lab. Browser results and screenshots are written to `.local/wordpress-lab/`.
The smoke script resets only the generated fixture posts; do not use this script with user sites.
For the separate role/content-filtering probe, pass the `post_id` printed by setup for that service, for example:

```bash
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml exec -T wp71 \
  php /lab/wp-cli.phar --allow-root eval-file /lab/source/role-probe.php 4
```

The role probe creates an administrator copy and an author copy of that fixture through the WordPress save pipeline.
It does not modify the source fixture or change the plugin's HTML allow-list.

## Patch and upgrade acceptance

`package.py` overwrites only the generated `.local/wordpress-lab/packages/candidate.zip` with the current plugin source.
The public 1.1.1 ZIP is retained separately as `baseline.zip`; its SHA-256 is recorded in `wordpress/upstream-1.1.1.json`.
`patch-lab.py baseline` and `candidate` deliberately replace only the installed plugin copies in these four disposable sites.
They do not overwrite repository sources or delete fixture records.

For a fresh acceptance run, put the verified public ZIP at `.local/wordpress-lab/packages/baseline.zip`, and extract it into `.local/wordpress-lab/baseline-source/`.
The extraction must contain `simple-digital-clock/block.js`. Then:

```bash
set -euo pipefail
python3 tools/wordpress-lab/patch-lab.py baseline
node tools/wordpress-lab/patch-tests.mjs seed
cp .local/wordpress-lab/patch/baseline-posts.json .local/wordpress-lab/packages/baseline-posts.json
```

The seed command refuses to overwrite existing upgrade evidence. The generated `fixtures/1.1.1.json` is an immutable-content snapshot, not a hand-written reconstruction of the save implementation.
The historical browser RED checks can run against the official baseline and intentionally exit 1 for the known defects. The current PHP contracts require `SDCW_sanitize_clock_post_html` from the candidate; do not run them on 1.1.1. The KSES RED controls use the retained previous candidate and are documented in the current acceptance report:

```bash
node tools/wordpress-lab/patch-tests.mjs test red
```

Install the newly packaged development candidate, then run the current PHP and browser contracts:

```bash
set -euo pipefail
python3 tools/wordpress-lab/package.py
python3 tools/wordpress-lab/patch-lab.py candidate green
python3 tools/wordpress-lab/patch-lab.py upgrade-check green
python3 tools/wordpress-lab/patch-lab.py php-tests green
node tools/wordpress-lab/patch-tests.mjs test green
node tools/wordpress-lab/patch-tests.mjs test green-firefox firefox
node tools/wordpress-lab/patch-tests.mjs test green-webkit webkit
```

`upgrade-check` must run before browser acceptance resaves the fixture posts.
It checks that all baseline records remain byte-for-byte unchanged and that the candidate is active.
The tests also exercise legacy defaults, explicit/empty timezones, special characters, all options, Author editor/REST saves, frontend rendering, all 354 bundled gradient presets, and rejected HTML/CSS payloads.
Results go under `.local/wordpress-lab/patch/`; credentials stay under ignored `.local/`.

## Upgrade, resave, and rollback without a database restore

The rollback suite creates seven fixture groups plus a nested group on the original release, then updates the same 64 post IDs as Administrator and Author on the candidate.
It checks raw post content, block validity, rendered settings, and actual editor/frontend pages in two browser timezones after replacing only the plugin ZIP.

Choose a new evidence label and run:

```bash
set -euo pipefail
python3 tools/wordpress-lab/patch-lab.py baseline before-cycle
node tools/wordpress-lab/rollback-tests.mjs seed accepted
python3 tools/wordpress-lab/patch-lab.py candidate cycle-upgrade
node tools/wordpress-lab/rollback-tests.mjs write accepted
python3 tools/wordpress-lab/patch-lab.py baseline rollback
node tools/wordpress-lab/rollback-tests.mjs read accepted
node tools/wordpress-lab/rollback-tests.mjs read accepted firefox
node tools/wordpress-lab/rollback-tests.mjs read accepted webkit
python3 tools/wordpress-lab/patch-lab.py candidate after-rollback
```

No database restore or content reset is performed. Writes refuse to overwrite an existing evidence label.
The read checks are read-only for post content. If rerunning the same label after installing another version, preserve its previous result JSON first; the per-engine read report is replaced.
The old version's original editing defects are expected to return when it is installed; rollback acceptance checks that the new version did not introduce an incompatible storage format.

## Earlier caption and entities reviews

The original findings, WP 6.3 `&apos;`, named HTML5 entities, and both numeric entity P2 cases are fixed in the local candidate; see [the historical numeric verification](../../docs/patches/1.1.2/NUMERIC-VERIFICATION.md). [Review 4](../../docs/patches/1.1.2/FINAL-REVIEW-4.md) describes the rejected `4c62efe3` archive. The older verification below covers narrower fixtures.
`final-review.php` now adds 148 contracts per site, including foreign object attributes, title-only updates, literal JSON caption text, repeated saves, recursive KSES calls, HTML safety, and normal WordPress controls.
Run it on the candidate with a new result label:

```bash
python3 tools/wordpress-lab/final-review-php.py acceptance
```

The fixed archive passes all 592 contracts. Results, including the foreign-block control inputs, are written to `.local/wordpress-lab/acceptance/php.json`.
Caption assertions distinguish original JSON text from the existing platform HTML semantics: changing legacy entity HTML to double escaping makes unmodified 1.1.1 reject the block. The previous archive still fails the refined regression assertions; the evidence is retained.

`final-review.mjs seed|save|rollback|reupgrade label [chromium|firefox|webkit]` provides an independent 48-record browser cycle, including mixed `&apos; <clock>` and `&amp;apos; <clock>` captions. It requires the PHP results under the same label first.
On a fresh prepared lab, run `seed` with official 1.1.1 installed, `save` after installing the candidate, `rollback` after reinstalling official 1.1.1, and `reupgrade` after installing the candidate again.
`save` checks both a title-only update and a full native Gutenberg serialization. All stages pass for the fixed archive. Their evidence files refuse overwrites; preserve completed runs and choose a fresh label for another cycle. Seed once with Chromium; save/read modes also support Firefox and WebKit.
The foreign-block browser check uses raw database content from the PHP control, because some WordPress REST paths already normalize object attributes independently of this plugin.

`metadata-cycle.py seed|save|read label` adds a separate 16-record cycle through the ordinary WordPress post API. Run its stages on 1.1.1, the candidate, and 1.1.1 respectively. It checks exact foreign block bytes, the same existing IDs, nested groups, unknown object/array types, explicit resaves, and database content after rollback. It refuses to overwrite existing snapshots.

`review2-entities.mjs save|read label phase [engine] [service]` adds independent native-serializer fixtures for HTML5 apostrophe entities, both roles, browser DOM semantics, and the actual editor. The rejected `1ce5d1d1` archive fails three assertions for one Author case on `wp63`. The corrected `4f5b285c` archive passes 168/168 on all four sites in each of Chromium, Firefox and WebKit; actual official 1.1.1 readers also pass 168/168 per engine after replacing only the plugin ZIP. Fixtures and expected DOM values are unchanged. Use a separate label for each save run and pair it with the same engine for readback. Snapshots refuse overwrites. The `phase` identifies the installed version in the report; install and verify the intended ZIP separately before changing it.

`p2-caption.php` adds 18 raw-caption contracts per site. It checks byte-level entity preservation independently of decoded attribute getters, lexer source spans, 1001 pending updates, unrelated HTML contexts, and retained KSES safety. Run it on each lab service, for example:

```bash
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml exec -T wp63 \
  php /lab/wp-cli.phar --allow-root eval-file /lab/source/p2-caption.php
```

The fresh combined P2 cycle used 128 original post IDs: the 64-record legacy suite, the 48-record caption suite, and the 16-record metadata suite. It verified raw content before resaving, after actual rollback to official 1.1.1, and after reupgrade; no database restore occurred. Full snapshots and commands are retained in the latest verification evidence.

`review3-captions.mjs seed|save|read|control phase [engine] [original|html5|numeric] [label]` retains the original 46 strings. The `html5` suite adds 21 cases; `numeric` adds another 29, for 96 captions. The suites cover both roles, title-only and full Gutenberg saves, original JSON text, DOM meaning, and the actual editor. Original fixtures live under `.local/wordpress-lab/review3/`; expanded suites use `.local/wordpress-lab/<label>/` (default `entities-fix`). Seed with original 1.1.1 installed; save on the candidate; read on the intended installed reader version. `control` saves independent copies without resetting the main cycle. Choose fresh labels/phases; evidence files refuse overwrites. The numeric suite passes 774 assertions per site per engine, including old 1.1.1 readers after actual rollback.

## Complete HTML5 entity coverage

`generate-html5-entities.py` creates an immutable corpus of 2125 semicolon-terminated HTML5 names, three quoted literal layers, and unquoted attributes: 8500 cases. Expected values come from the original browser DOM, independently of the PHP implementation.

```bash
set -euo pipefail
python3 tools/wordpress-lab/generate-html5-entities.py
sdcw_phase="manual-$(date +%Y%m%d-%H%M%S)"
sdcw_output=".local/wordpress-lab/entities-fix/$sdcw_phase"
mkdir "$sdcw_output"
sdcw_index=0
for sdcw_service in wp71 wp84 wp63 wp68; do
  for sdcw_test in html5-caption-save html5-entity-pipeline html5-charset; do
    sdcw_index=$((sdcw_index + 1))
    printf '[%s/12] %s: %s\n' "$sdcw_index" "$sdcw_service" "$sdcw_test"
    docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml exec -T "$sdcw_service" \
      php /lab/wp-cli.phar --allow-root eval-file "/lab/source/$sdcw_test.php" \
      > "$sdcw_output/$sdcw_service-$sdcw_test.json"
  done
done
python3 - "$sdcw_phase" "$sdcw_output" <<'PY'
import json, pathlib, sys
phase, output = sys.argv[1:]
rows = []
for service in ['wp71', 'wp84', 'wp63', 'wp68']:
    row = json.loads((pathlib.Path(output) / (service + '-html5-entity-pipeline.json')).read_text())
    assert row['failed'] == 0
    row['service'] = service
    rows.append(row)
target = pathlib.Path('.local/wordpress-lab/entities-fix') / ('pipeline-' + phase + '.json')
with target.open('x') as stream:
    json.dump(rows, stream)
print('PASS 12/12 PHP runs; pipeline: ' + str(target) + '; full results: ' + output)
PY
for sdcw_engine in chromium firefox webkit; do
  node tools/wordpress-lab/html5-entity-dom.mjs "$sdcw_phase" "$sdcw_engine"
done
```

These scripts require this initialized lab and the candidate installed. They create only disposable fixture posts or connection-local temporary tables. Results are JSON; each script exits nonzero on a failed assertion. `html5-caption-save.php` checks 193 assertions per site, including literal layers, unknown metadata, C1 controls, backslashes, safety controls, same-ID updates, and repeated saves. `html5-charset.php` checks exact storage of all 6375 quoted variants in a temporary `utf8mb3` table. The production database schema is not altered.

The aggregation above adds the service names and creates `.local/wordpress-lab/entities-fix/pipeline-<phase>.json`. `html5-entity-dom.mjs` compares all 8500 original/output DOM values per site. Use a fresh phase because results refuse overwrites. The accepted run uses phase `accepted`; all 102000 comparisons passed. The pipeline includes both standard KSES filtering and the final `wp_insert_post_data` normalization.

The earlier HTML5 upgrade cycle used label `entities-final`: 136 original post IDs, created on official 1.1.1, updated on the final candidate, read on exact official 1.1.1, and checked after reupgrade without a database restore. The local sequential orchestrator and full snapshots are retained in `.local/wordpress-lab/entities-final/`. Never switch installed plugin versions while another browser test is running.

## Optional isolated Firefox runtime

The browser helpers accept `SDCW_LAB_FIREFOX_WS=ws://127.0.0.1:19527/` for Firefox only. Other endpoints are rejected. The accepted image is `mcr.microsoft.com/playwright:v1.62.1-noble` (arm64), matching the repository's actual Playwright version. This is an official remote browser connection with `exposeNetwork: '<loopback>'`; no OS protection is disabled. Chromium/WebKit remain local.

When the pinned image is already available and the lab is running, start a separate browser server with the checkout mounted read-only:

```bash
set -euo pipefail
docker run --rm --init -d --name sdcw-entities-firefox-20261027 \
  --label com.sdcw.lab.task=01a17d67-e45f-72c3-8d24-9d746b5fa421 \
  --user pwuser --shm-size 1g --network sdcw-local-review-20261027_lab \
  -p 127.0.0.1:19527:3000 \
  --mount "type=bind,source=$PWD,target=/work,readonly" -w /work \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  node node_modules/playwright/cli.js run-server --port 3000 --host 0.0.0.0
SDCW_LAB_FIREFOX_WS=ws://127.0.0.1:19527/ \
  node tools/wordpress-lab/html5-entity-dom.mjs fresh-phase firefox
```

The example requires a previously generated `pipeline-fresh-phase.json`. The WTR widget suite uses host dependencies and a local adapter retained at `.local/wordpress-lab/entities-final/wtr-remote-firefox.mjs`; Linux cannot load macOS Rollup native dependencies from the read-only checkout. Stop this named browser container before Compose shutdown so it releases the lab network. Verify its task label before stopping it.

## Numeric entity follow-up review

`review4-native.mjs save|read phase [engine] [seedPhase]` adds 12 native captions for two roles on four sites. `save` creates independent posts as an unfiltered administrator, verifies valid/unchanged input, then performs Author title-only updates on the Author copies. `read` opens the saved records without modifying them; `seedPhase` selects the original Chromium result (default `candidate`). The actual editor is checked as well as JSON, DOM meaning, and block validity.

The rejected `4c62efe3` candidate exits 1 on this suite: WP 6.3/6.8 lose one literal numeric reference layer; WP 7.1 converts numeric CR into raw HTML CR and the browser normalizes it to LF. That historical report has 10 failed blocks out of 96, with all Administrator copies passing. The current fixed candidate exits 0 with 96/96 valid blocks. An exit code alone is insufficient evidence: inspect the generated JSON and actual editor state. See [the fix verification](../../docs/patches/1.1.2/NUMERIC-VERIFICATION.md).

On the prepared lab with the current candidate installed, choose fresh phases:

```bash
node tools/wordpress-lab/review4-native.mjs save fresh-numeric-review chromium
# Expected exit 0; inspect native-fresh-numeric-review-chromium.json before continuing.
node tools/wordpress-lab/review4-native.mjs read fresh-numeric-read webkit fresh-numeric-review
```

Results live under `.local/wordpress-lab/review4/`. The review also retains exact previous-source controls, 1629 boundary inputs compared in three browsers, a Core-only control, and raw-content snapshots for 152 post IDs. `review4-boundaries.php previous` requires `--skip-plugins=simple-digital-clock` plus the retained fixture and previous-handler files in `/lab/packages/`; it refuses accidental loading alongside the current plugin. `review4-core.php` requires the same skip flag and tests ordinary Core `<p title>` attributes without the plugin. Neither control changes the plugin's installed files.

`numeric-caption-save.php` adds 460 assertions per site through actual post updates: 27 inputs, all three save fields, exact JSON, raw CR/CRLF versus numeric CR, literal numeric layers, repeated saves and normal KSES controls. The previous handler fails 162 of 1840 assertions across the four sites; the fixed handler passes all of them. One old expectation in `final-review.php` used Core normalization as its oracle and therefore expected the literal-numeric defect. It now checks the original escaped HTML meaning. The previous exact handler fails that corrected assertion on WP 6.3/6.8; the fixed handler passes all 592 review assertions. Neighboring Core controls remain unchanged.

`python3 tools/wordpress-lab/generate-numeric-entities.py` generates an immutable 9684-case literal-numeric corpus: 269 code points, four numeric forms, three literal layers and three quote styles. `numeric-entity-pipeline.php` runs the standard save pipeline, checks repeat stability and ASCII storage, and performs an exact temporary-table `utf8mb3` round trip. Aggregate its four JSON objects with `service` names into `.local/wordpress-lab/<label>/pipeline-<phase>.json`; then run:

```bash
node tools/wordpress-lab/html5-entity-dom.mjs numeric-phase chromium numeric-fix 9684
```

Use an existing matching pipeline phase or generate a fresh one; the command above expects `.local/wordpress-lab/numeric-fix/pipeline-numeric-phase.json`. The accepted phases are `named` (8500 cases) and `numeric` (9684 cases) under label `numeric-fix`. Original two-argument named-entity commands keep their defaults. The explicit count accepts only these two corpus sizes. That earlier four-site PHP acceptance had 5180 assertions; named and numeric DOM suites have 218208 comparisons across four configurations and three engines.

The new full cycle uses fresh label `numeric-fix`: 136 records created on exact official 1.1.1, including the 96-caption suite. Snapshots cover upgrade before saves, the same IDs after three-engine saves, actual official 1.1.1 readers, and reupgrade without restoring the database. Full results and the sequential runner are retained under `.local/wordpress-lab/numeric-fix/`.

## Earlier ten-context acceptance

The earlier `92121d67…` ZIP is identified in [its acceptance report](../../docs/patches/1.1.2/FINAL-ACCEPTANCE.md). Its source and package were unchanged during that review. The following probes are also reused by current acceptance:

- `core-local-upgrade.php`: guarded Core `Plugin_Upgrader::bulk_upgrade()` with a temporary local update offer; restores the original transient. This is the updater path used by `wp_ajax_update_plugin`.
- `final-acceptance.mjs`: official 1.1.1 fixtures, role saves, repeated saves, nested blocks, synced patterns, template parts, Custom HTML, active/inactive block widgets and legacy Text widgets. It also verifies unrelated blocks and actual editor validity/clean state.
- `viewport-acceptance.mjs`: 390/768 px snapshots and advancing clock time.
- `visual-helpers.mjs`: exact DOM/text/style comparison, allowing at most 0.001 CSS px of DOMRect rounding variance.

These probes require the prepared ten-context matrix, private accounts and immutable seed evidence in `.local/wordpress-lab/final-acceptance-921/`. The local sequential `accept.py`, `matrix.py` and `compare_reads.py` retain the actual update/rollback commands and whole-post/option snapshots. Version replacements must never run concurrently with browser tests. Use a fresh stage for each browser run; evidence refuses overwrites. Native and extended-lab setup details are retained locally; these are prepared-lab probes, not a clean-checkout CI bootstrap.

Do not use `down -v`, prune Docker, or delete unrelated containers.
Stop only this lab when finished; its data and logs remain in `.local/wordpress-lab/`:

```bash
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml down
```
