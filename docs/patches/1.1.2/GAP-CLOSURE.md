# Simple Digital Clock 1.1.2 — additional acceptance

> Historical report for an earlier artifact. Current candidate and results: [README](README.md), [KSES72 acceptance](KSES72-VERIFICATION.md). The shared ZIP/diff paths below may have been updated after this run; the original SHAs and results are preserved as history.

28 October 2026. **Local acceptance of exact ZIP `1e5d3f0d…` passed. No new product regressions were confirmed in the tested matrix. Nothing was published.**

This report supplements and supersedes the current-candidate conclusions in [acceptance of `92121d67…`](FINAL-ACCEPTANCE.md). Earlier evidence and ZIPs are retained separately. Unless stated otherwise, the counts below refer to new runs.

- ZIP SHA-256: `1e5d3f0d5f7189f0fa6dca4539bf83860fbc46a7a7513f8c2c2b004f722038a3`.
- Final ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP used during tests: `.local/packages/simple-digital-clock-1.1.2-pointer3-candidate.zip`.
- Official 1.1.1 ZIP: `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`.
- [Full diff against 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch): SHA-256 `8b87567d1932d25f4439084058232806cf04d133b2d35309a05bdbb7afd8ac5e`.
- New results: `.local/wordpress-lab/gap-closure-921/`; Locale: `.local/wordpress-lab/locale-fix/accepted1e5v2-*.json`. The number `921` in the directory name identifies the investigation's initial candidate.

[Machine-readable summary and evidence hashes](gap-closure-evidence.json).

## Findings and fixes

1. The previously unresolved mouse Reset → Auto issue was also reproduced in ordinary Safari 27.0.1 and Firefox 159.0. On blur, Core collapses the Combobox between mousedown and click: the button moves, so the first click does not apply the action. The main buttons now retain focus until click; Auto first completes blur, then applies the explicit choice. Keyboard Enter/Tab/Escape behavior and the IME guard are preserved.
2. Reset Locale previously left an empty string that Intl rejects, causing the preview to show an error. Explicit Reset now restores the site language. Reading already saved locales changes nothing.
3. An additional Time Zone Reset scenario exposed `timeZone: null`. After saving, old 1.1.1 JavaScript rejected that block, particularly when opened in another timezone. Reset now saves `timeZone: ""`, the previous string format for the visitor's local time. This changes the action handler, without migrating posts or changing the serializer.

Relative to `92121d67…`, product changes are limited to `block.js` and the `readme.txt` changelog. PHP, the attribute schema, `save()`, recovery of old attributes, CSS and the bundled runtime are unchanged. Relative to official 1.1.1, the full patch also changes `widget_init.php` and adds `includes/simple-digital-clock-kses.php`; the earlier fixes are retained.

Bundled runtime 0.7.0 SHA-256: `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`. Standalone `src/`, `dist/`, dependencies and version are unchanged.

## Matrix and results

The main matrix retains nine physical installations / ten contexts: WordPress 6.3.2, 6.8.3 and 7.1.3; PHP 7.0.33–8.5.12; actual Local 10.2.0/nginx/MySQL; multisite with a child site; Twenty Twenty-Three, Twenty Twenty-Five and Twenty Twenty-One themes. Exact combinations are listed in the [previous table](FINAL-ACCEPTANCE.md#матрица) and new `sites.json`.

| Check of the new ZIP | Result |
| --- | --- |
| 11 previous PHP suites × 10 contexts | **13 520/13 520** |
| HTML5 and numeric entities: posts/widgets, 3 engines | **1 091 040/1 091 040** DOM comparisons |
| Previous Locale UI, now using mouse activation in every engine | **378/378** |
| New mouse/keyboard scenarios, saved Reset and old-JavaScript control | **315/315** |
| Full reading of old posts/widgets on the new ZIP, 30 runs | **1740/1740** |
| Title-only, full and repeated saves, 30 runs | **1527/1527** |
| Mobile/tablet: 390/768 px, 10 contexts × 3 engines | **300/300** |
| Standalone Node / browser suites, standalone source unchanged | **22/22**, **84/84** |
| ZIP CRC, 15 files exactly matching source, JS syntax, ESLint | PASS |
| Diff dry-run and application to official 1.1.1 | PASS, result matches the ZIP byte for byte |
| Full reading after physical rollback to 1.1.1, 30 runs | **1740/1740** |
| Locale / Reset timezone after rollback, 3 environments × 3 engines | **63/63**, **99/99** |
| After another native upgrade, Chromium × 10 contexts | **580/580** |
| Locale / Reset timezone after reupgrade, Chromium × 3 environments | **21/21**, **33/33** |

Comparisons cover all 103 configurations/captions in the corpus, nested and synced blocks, template parts, neighboring Custom HTML and a legacy Text widget, and active/inactive block widgets. Roles: Administrator, Editor, Author and an ordinary multisite administrator without `unfiltered_html`. Checks cover values, editor validity, no dirty state when reading, HTML/DOM, time at a fixed date, dimensions and styles. Geometry tolerance is 0.001 CSS px; other comparisons are exact.

Ordinary Safari/Firefox were checked with a mouse through Computer Use on this investigation's own drafts in actual LocalWP: resetting the neighboring field while suggestions are open, first Auto activation, live preview, actual Save draft, database inspection and reopening. The database confirmed an empty string after Reset, and `Europe/Kyiv` after Auto Timezone. New control tabs were closed; the user's existing tabs were preserved. Manual checks used Administrator; Author is covered by automated UI tests.

## Third-party themes and caching

The additional disposable site uses a separate Compose project, `sdcw-gap-integrations-20261028`, `127.0.0.1:19532`, WP 7.1.3/PHP 8.3.35. Tested combinations:

- Twenty Twenty-Five, [Astra 4.14.1](https://wordpress.org/themes/astra/), [GeneratePress 3.6.1](https://wordpress.org/themes/generatepress/).
- No optimization; [Autoptimize 3.1.17](https://wordpress.org/plugins/autoptimize/); [WP Super Cache 3.1.4](https://wordpress.org/plugins/wp-super-cache/); both plugins together.
- Desktop 1440 px and mobile 390 px, Administrator/Author content, seven clocks per post and in a registered Core sidebar. The sidebar is rendered by control MU code; automatic placement specifically in each theme's native widget areas is not claimed.

On 1.1.1, **144** baseline page/viewport results were captured. After a native upgrade and saves on the new ZIP, all **144** matched in clock settings, text, geometry and styles. **216/216** save checks passed; six additional checks confirmed visibility of the changed widget after native page-cache clearing. Autoptimize actually processes the clock code: MIME/content and the generated JavaScript hash were checked, including `.php` endpoints. WP Super Cache checks verify a real `Served …` HIT header.

**WP Super Cache behavior:** saving a block widget through REST does not clear the existing page cache. This was independently reproduced with a plain Core Paragraph widget while the clock plugin was disabled: the database has new text, the cache HIT response has old text, and the new text becomes visible after `wp_cache_clear_cache()`. Automatic invalidation works for post saves. A widget change requires page-cache clearing. Data is not lost; this is not a 1.1.2 regression. No dependency on a third-party cache API was added to the product.

After physical rollback to 1.1.1, all **144** integration page/viewport results also matched the baseline. Reinstalling the exact candidate preserved posts/widgets; the GeneratePress smoke with both caching plugins passed.

## Upgrade and rollback

Native upgrading is tested through a local offer with the exact ZIP/SHA and the same `Plugin_Upgrader::bulk_upgrade()`/AJAX skin that Core uses. Public WordPress.org delivery is not simulated. Physical file replacement is independently checked against the full manifest; activation, all posts rows, `widget_*`, `sidebars_widgets`, `theme_mods_*` and network activation are compared before/after.

Physical rollback to official 1.1.1 and another native upgrade to the exact new ZIP passed on all nine installations. **24 137 complete posts rows**, widget settings and placement, theme mods and activation matched before/after file replacement; reading after both replacements also left data unchanged. There were no new empty auto-drafts. The database was not restored. New Reset posts were read in Asia/Tokyo: the string and HTML remain unchanged, the block is valid, and the time follows the visitor rather than UTC. A full read in three engines followed rollback; a Chromium read in all ten contexts followed reupgrade.

File rollback requires no database-format conversion. However, editing on old 1.1.1 restores its previous KSES/Author defect. A backup is needed to recover lost content if a broken old-version save has already occurred; the new patch cannot recover previously removed HTML.

## Controls and unsuccessful attempts

- Original RED results are retained: mouse/UI on `921` and Reset timezone on `353`. The latter produced six substantive failures and a separate Heartbeat error while closing the context. Close errors are now recorded separately; runtime errors are not ignored.
- In the first new control, old JavaScript was actually intercepted twice because of the editor iframe; requiring exactly one HTTP response was a test error. At least one interception is now required, and each receives the verified SHA of original 1.1.1.
- One Chrome baseline on WP 6.8 had a different auto-width font. Three independent loads of physically installed 1.1.1 produced the new ZIP's geometry, unlike the first cold baseline. The initial failed snapshot and controls were retained; a separate reference directory contains a new 1.1.1 baseline. The cause of the first outlier is unknown. Product runtime/CSS were unchanged.
- On physically installed 1.1.1, one WebKit Reset-read passed all ten data/time checks but recorded a Core Heartbeat `admin-ajax.php` access-control error. A separate rerun with network diagnostics passed 11/11; the first JSON was retained. The cause of the single error is unknown, and no filter hid the exception. This does not establish a new-ZIP defect.
- Full PHP logs contain three historical diagnostic CLI eval errors, Core warnings about blocked external update requests, and a WP-CLI Colors deprecation. The separate integration setup also retains WP Super Cache warnings caused by an incorrect debug-log path; that setting was corrected before accepted runs. Errors were classified; no PHP errors originating in clock-plugin files were found in the inspected logs. Entirely clean logs are not claimed.
- Locale on `353` stopped once at a Core inserter timeout in WebKit. A new full run of the current ZIP passed; the initial JSON was retained, and the single timeout's cause is unknown.
- Integration setup was corrected based on observed behavior: reassigning a widget duplicated its ID; new instances need explicit sidebar assignment; Nepali digits do not match ASCII `\d`; Autoptimize may serve JS through `.php`; WP Super Cache requires a slash policy matching the permalink. Earlier failed JSON files were not replaced with successful ones.
- Playwright Clock removes navigation performance entries required by Core Interactivity and caused Core JS errors. An independent control without a fake clock confirmed the cause; integration snapshots fix only Date, preserving real performance/timers. The main earlier visual baselines use the previous clock for comparability; they do not establish a clean Core console.

## Limits of the conclusion

The listed versions, themes, roles and combinations were tested. Arbitrary third-party plugins, native HTTPS/Site Domains, subdomain multisite, manual system IME, Google Fonts delivery, Windows/iOS and the review author's specific site were not tested. These checks do not establish the cause of that complaint. Updating from the public directory can be tested only after a separately authorized publication.

Nothing was published; SVN and real sites were unchanged. All five investigation-owned runtime groups were stopped after checking IDs/labels: native LocalWP, three Compose projects and a separate Firefox server. Databases, files, snapshots and archives were retained; `down -v`, volume deletion and prune were not used.

## Reproduction

The test sites and `.local/` must be retained; commands are limited to the listed loopback addresses and create only test posts. Choose a fresh label for a new run: results are protected from overwriting. Do not change the installed file version concurrently with browser runs.

```bash
set -euo pipefail
node tools/wordpress-lab/locale-pointer-tests.mjs manual-unique chromium localwp
node tools/wordpress-lab/locale-tests.mjs test manual-unique chromium localwp
node tools/wordpress-lab/timezone-reset-read.mjs manual-unique chromium localwp accepted1e5v2
```

The actual sequence, complete snapshots, manifests and commands remain in `gap-closure-921/accept.py`, `matrix.py`, `compare_reads.py`, `integrations/cycle.py` and JSON. This continues local acceptance; it is not a ready-made configuration for a user site.
