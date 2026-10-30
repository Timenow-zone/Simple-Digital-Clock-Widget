# WordPress 1.1.4 candidate with widget 0.8.0

Status: **draft candidate; data/save/rollback checks passed; visual acceptance unpassed; not published**. [PR #11](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/11) remains in draft. The retained 1.1.3 ZIP is unchanged. This work does not merge the PR, publish to WordPress.org, or change the already delivered standalone CDN artifact.

## Package and changes

- ZIP: `.local/packages/simple-digital-clock-1.1.4-candidate.zip`, **15 installable files**.
- ZIP SHA-256: `a2464553084ec244dbd3b77b87a3bb49f3da7b5f0e4586ab32311e35362a112f`.
- Bundled widget: **0.8.0**, **35,922 bytes**, SHA-256 `5661f6c054aad7c2f77f7ecd8912d6e41fca0c6079c8a4be498ab1847de939d0`; identical to `dist/0.8.0.min.js` and the accepted production CDN bytes.
- [15-file release manifest](manifest.json). Acceptance belongs to this exact ZIP; repacking creates a different artifact and does not inherit these results.

Only four plugin files differ from the retained 1.1.3 package: the bundled widget, plugin/cache versions in `widget_init.php`, POT project version, and readme release metadata/changelog. The widget brings Preact 11.1.0 with explicit CSS pixel lengths, ordinary localized AM/PM fitting, refitting after actual font glyphs load, and correction for quantized font advances. See the [standalone 0.8.0 acceptance](../0.8.0/README.md).

All eleven unchanged plugin files, including `block.js` and KSES, are byte-identical to 1.1.3. No saved-block schema or database migration is introduced. Readme CRLF line endings are preserved; the measured size is corrected in both feature and FAQ text, and the source link identifies the actual widget commit rather than a nonexistent tag. Earlier changelog entries and approved readme prose are retained.

## Acceptance scope

Fresh isolated upgrades cover official 1.1.1 and 1.1.2, plus the retained **unpublished 1.1.3 candidate**. Official predecessor ZIPs were freshly downloaded and matched the existing pinned archives on 2026-10-30. The public plugin-information API reports 1.1.2; the local 1.1.3 package must not be described as an official public release.

The Docker matrix and direct native LocalWP runtime cycle are complete for this exact package. Stored-data, save, reader and rollback checks passed, while the visual cases below remain unaccepted. The [overall evidence](acceptance-evidence.json) separates those results. External WordPress.org update delivery is outside this unpublished local acceptance.

### Unresolved local theme font case

Native Firefox exposed an existing fitting defect when Twenty Twenty-Five supplies a local Fira Code face after the clock's first measurement and the widget's own Google stylesheet request fails. At the same 645 px width and unchanged time text, the initial 0.8.0 clock uses 92.1429 px text and wraps; a manual resize fits it at 89.3591 px. The mismatch remains after 180 animation frames. The stored block and caption data remain valid.

The broader Docker run subsequently reproduced the same local-theme-font overflow in Chromium and WebKit as well. All 13 recorded Docker failure cases also overflowed in their captured predecessors. A passing stored-data matrix or green repository CI does not certify this fitting scenario.

A private minimal HTML control reproduced the same late local-font wrapping in both 0.7.1 and 0.8.0. Manual resizing only corrects 0.8.0. Thus this is an existing limitation, rather than evidence of a new saved-content regression. The 0.8.0 font-load path depends on its own Google stylesheet succeeding and misses the independently loaded theme face when that request fails.

This layout gate is not accepted. Published 0.8.0 bytes remain unchanged; fixing them requires a new widget version. The choice between including that fix and retaining 0.8.0 with this explicit limitation is pending. Raw native traces and old/new minimal controls are retained under ignored `.local/localwp-114-20261030/` and `.local/release-1.1.4/font-initial-probe/`.

### Additional WebKit wrapping case

At width 200 px and locale `am`, WebKit keeps `ጥዋት 1:00:00` on two lines after the time font shrinks: the measured natural width is approximately 198.14 px, but two distinct line rows remain across repeated frames. Temporarily setting and restoring `white-space: nowrap` forces the correct one-line layout without resizing. The predecessor also wrapped this time, so the new package improves its width but does not fully resolve the existing wrapping case. This visual gate remains unpassed.

A separate Firefox hundredths difference came from a predecessor snapshot captured before its first animation frame. Bounded replay confirmed the candidate's correct stable fractional output; the original snapshot and diagnostic evidence are retained. Another 140 small Firefox size differences were traced exactly to 0.8.0's one-pixel fitting margin, with no changed attributes, time or checked styles. These classifications do not erase the raw comparison failures or make the visual gate green.

### Docker results

Eleven fresh sites used dedicated loopback ports, independent databases, and the actual installed predecessor serializers to produce 1,423 cases per role. The corpus includes posts, nested containers, a synced pattern, Custom HTML, active/inactive block widgets and an unrelated Text widget. It covers selector values, boundaries and deterministic mixed cases, rather than every Cartesian combination.

| WordPress | PHP | Installed predecessors |
| --- | --- | --- |
| 6.3.2 | 7.0.33 | 1.1.1, 1.1.2 |
| 6.3.2 | 7.4.33 | 1.1.2 |
| 6.3.2 | 8.2.12 | 1.1.1, 1.1.2 |
| 7.1.3 | 8.3.35 | 1.1.1, 1.1.2, retained 1.1.3 |
| 7.1.3 | 8.5.12 | 1.1.1, 1.1.2, retained 1.1.3 |

- All **11 real Core HTTP AJAX upgrades** passed with the exact local package offer, unchanged complete post-row hashes and checked settings, and 15 exact installed files.
- All **33 browser/site resave matrices** passed, checking **161,601 native blocks** per complete matrix stage. **198 completed visible Save/Update checks** passed across Administrator, Editor and Author.
- Three file-only rollbacks passed **44,073 old-reader checks** across nine browser/site pairs, followed by three real Core reupgrades without database restores. Final parser checks passed 161,601 blocks, live clocks passed 33 pairs, and 1,188 anonymous caption comparisons preserved both attributes and rendered text.
- Numeric-caption PHP tests passed **10,736 assertions**; HTML entity DOM checks passed **109,104 comparisons**. Plugin Check 2.1.0 reported **zero errors and seven unchanged warning tuples**. Its temporary plugin, drop-in and tables were removed and checked data restored.
- Consumer verification covered eight frontend/editor contexts on minimum/current sites: ten actual script responses returned HTTP 200 with `ver=0.8.0` and the accepted SHA-256; all 512 observed shadow clocks reported 0.8.0.
- Raw upgraded-render results contain **15 passing and 18 failing browser/site pairs**; six probe pairs failed. Existing Fira Code cases, one-pixel-margin changes and the bounded readiness/wrapping observations are classified separately in the [Docker evidence](docker-evidence.json). No tolerance was widened and no failed visual assertion was silently accepted.

Five environment/harness attempts were retained: initial remote loopback routing, two Firefox navigation timeouts, a WebKit iframe replacement during a UI assertion, and a Firefox UI reload timeout. Bounded retries targeted only affected sites; both UI retries completed all six saves with empty runtime-error arrays. The initial failures and partial actions remain in the evidence. No completed group or database fixture was reset to obtain a pass.

All 14 newly created Docker containers, including the temporary Linux Firefox server, are stopped. Databases, volumes and evidence are retained; unrelated projects were not changed.

### Native runtime results for the exact 0.8.0 package

Three fresh sites used Local 10.2.0 service binaries directly: nginx 1.26.1, PHP-FPM 8.2.29, MySQL 8.4.0 and WordPress 7.1.3 with Twenty Twenty-Five. This was not Local app UI automation; shared Local/router configuration remained unchanged. Firefox ran on Linux against the native HTTP services; Chromium/WebKit used host Playwright.

- Three actual Core upgrades, three physical predecessor rollbacks and three Core reupgrades passed, without database restores. Each transition preserved complete post-row hashes and checked settings; all 15 candidate files matched after upgrade.
- Each parser/resave/reader stage checked **44,073 blocks across nine site/browser pairs**. The corpus and same saved IDs were reused, rather than regenerated after upgrading.
- **54 visible Save actions**, **27 Caption/Width saves**, **324 anonymous Author-caption comparisons**, **2,928 numeric-caption PHP assertions**, and **nine live-clock checks** passed.
- Chromium/WebKit checked **8,538 stored clocks** and **72 focused fitting cases**. Paired old/new controls classified 107 of 108 recorded height differences as intended fitting improvements under identical inputs, widths, labels and styles. The remaining Fira Code Firefox case stays unaccepted.
- All five newly started native processes were stopped; their databases, configuration and evidence remain available. No original user site or shared router was changed.

The [credential-free native evidence](native-runtime-evidence.json) records this partial result. It must not be relabeled as complete fitting acceptance or as verification of a future rebuilt ZIP.

### Repository and delivery checks

Three TypeScript configurations, ESLint, 22 Node tests, 26 release/prose tests, two package guards, and release metadata/artifact checks passed. The package guard rejects a controlled stale script-cache version even when its manifest is updated coherently. Source CI run [41047749506](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41047749506) passed required Repository checks and Browser tests; its Cloudflare preview build also passed. These CI checks do not include the full disposable-site matrix and do not close the failed manual visual gates.

The [preflight evidence](preflight-evidence.json) confirms the exact ZIP, the eleven unchanged plugin files, the retained 1.1.3 ZIP and all seven versioned widget artifacts. Production CDN deployment remains the earlier `main` deployment; no candidate was delivered to production. Multisite, native HTTPS, Local app UI orchestration and real external Google Fonts transport are outside this cycle.

`tests/wordpress-package.test.mjs` additionally checks installed-source hashes against this manifest, exact widget byte identity, and agreement between plugin header, stable tag, POT, source commit and script cache version. Required Repository checks run it. It does not replace installation or upgrade testing.

## Isolation and rollback

Only fresh disposable sites are used. Existing user sites, previous lab databases and historical release evidence are preserved. Each lab uses private loopback ports and independent data. The exact candidate and predecessor ZIPs remain local; no SVN commit, npm publication or Cloudflare deployment is performed by this WordPress preparation.

Rollback installs the retained predecessor's files without restoring the database. Previously damaged captions are not repaired automatically. Editing under 1.1.1 can reintroduce its known bugs; rollback reader checks do not certify those old save paths.
