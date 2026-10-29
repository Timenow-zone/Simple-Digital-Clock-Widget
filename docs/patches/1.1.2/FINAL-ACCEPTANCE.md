# Final local acceptance of Simple Digital Clock 1.1.2

> Historical report for an earlier artifact. Current candidate and results: [README](README.md), [KSES72 acceptance](KSES72-VERIFICATION.md). The shared ZIP/diff paths below may have been updated after this run; the original SHAs and results are preserved as history.

28 October 2026. **Local acceptance of exact candidate `92121d67…` passed. No new regressions were confirmed in the tested matrix.** Plugin code did not change during this review. Nothing was published; SVN, remote Git repositories, the forum and user sites were not changed.

- ZIP SHA-256: `92121d672e1aa190b54bcc51f5f6a81b89827f43defca85cf647807e5019c04e`.
- Official 1.1.1 ZIP: `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`.
- Full diff: `ba3623a4aac2dfd60799c6fde1e7cd707a6816589bf404d8e47e67b5a73e101c`.
- Results and snapshots: `.local/wordpress-lab/final-acceptance-921/`.
- [Evidence manifest](final-acceptance-evidence.json).

## Compatibility criterion

Replacing files must preserve all existing rows in the posts tables, `widget_*`, `sidebars_widgets` and `theme_mods_*` settings, and plugin activation. Reading an old post in a different browser timezone must open valid blocks without dirty state. After saving, setting values, caption semantics, clock DOM, neighboring blocks and widget placement must remain unchanged.

Rendering comparisons cover attributes, text at a fixed time, custom-element dimensions and the clock's main computed styles: colors, background/gradient, border, radius, shadow, font, alignment and transform. Geometry tolerance is **0.001 CSS px**; text, attributes and style values are compared exactly. This checks the listed metrics, rather than comparing screenshots pixel by pixel.

<a id="матрица"></a>

## Matrix

Nine physical installations, ten contexts; each was checked in Chromium, Firefox and WebKit.

| Context | WordPress | PHP | Theme |
| --- | --- | --- | --- |
| wp70 | 6.3.2 | 7.0.33 | Twenty Twenty-Three |
| wp63 | 6.3.2 | 8.2.12 | Twenty Twenty-Three |
| wp68 | 6.8.3 | 8.3.28 | Twenty Twenty-Five |
| wp74 | 7.1.3 | 7.4.33 | Twenty Twenty-Five |
| wp71 | 7.1.3 | 8.3.35 | Twenty Twenty-Five |
| wp84 | 7.1.3 | 8.4.27 | Twenty Twenty-Five |
| wp85 | 7.1.3 | 8.5.12 | Twenty Twenty-Five |
| ms85, network root | 7.1.3 | 8.5.12 | Twenty Twenty-Five |
| ms85-child, child site | 7.1.3 | 8.5.12 | Twenty Twenty-One |
| Actual LocalWP | 7.1.3 | 8.2.29 | Twenty Twenty-Five |

Native site: Local 10.2.0, `SDCW-112-Isolated-20261028`, `http://localhost:10003`. Other addresses use dedicated Docker loopback ports. Firefox runs through the official Playwright 1.62.1 Linux browser server; Chromium/WebKit run locally.

Roles: Administrator, Editor and Author; multisite also includes an ordinary site administrator without `unfiltered_html`. Permissions and the actual user ID are checked. Native posts were created on official 1.1.1 in UTC; after upgrading, editors were opened in America/New_York.

## Checks

| Check of the exact ZIP | Result |
| --- | --- |
| 11 previous PHP suites × 10 contexts | **13 520/13 520** |
| Named/numeric entities: posts and block widgets, 10 contexts × 3 engines | **1 091 040/1 091 040** DOM comparisons |
| Locale UI, 3 environments × 3 engines × 2 roles | **378/378** |
| Old posts and widgets after the first upgrade, 30 browser runs | **1527/1527** |
| Title-only, full and repeated saves, 30 accepted browser runs | **1335/1335** |
| Reading on physically installed 1.1.1, 30 browser runs | **1740/1740** |
| Reading new Locale posts on 1.1.1 | **63/63** |
| Reading after another native upgrade, Chromium × 10 contexts | **580/580** |
| New Locale posts after reupgrade | **21/21** |
| Standalone Node | **22/22** |
| Standalone browser suites | **84/84**, 28 in each engine |
| ESLint, JS syntax, ZIP CRC, 15 files matching source | PASS |
| Diff dry-run and application to official 1.1.1 | PASS, result matches the ZIP |

The new corpus contains **96 captions/entities + 7 configurations** from official 1.1.1: old omitted values, UTC, Nepal, viewer-local, date/seconds/hundredths, 12/24-hour formats, widths 0/200/333/1000, fonts, alignment, background, gradients, transparency, borders and shadows. It comprises 71 control posts with 3364 native clock occurrences and 20 block widgets with 140 clocks. Checks cover nested group/columns, a synced pattern, template parts, Custom HTML, active/inactive widgets and a neighboring legacy Text widget.

Frontend comparisons cover the native corpus, mixed layout, Custom HTML and an actually rendered classic-theme sidebar. Saved attributes, DOM and block validity are checked separately for every role. At widths **390 and 768 px**, **6180 clock/viewport/engine combinations** were checked at each stage before/after upgrade and after rollback: geometry, attributes, fonts, text and advancing time. For Auto language/Reset in Firefox/WebKit, the final Locale UI run uses the keyboard; the mouse limitation is described below.

## Upgrade, rollback and data preservation

The public baseline release is [1.1.1](https://wordpress.org/plugins/simple-digital-clock/). Its official ZIP was physically installed on all nine installations; all 14 files were checked. Control posts were created on that release, rather than synthesized only by the new serializer.

Upgrades used **`Plugin_Upgrader::bulk_upgrade()` with `WP_Ajax_Upgrader_Skin`**, the path used by `wp_ajax_update_plugin`. The update offer and package are local; the previous `update_plugins` transient is restored. WordPress unpacks the ZIP itself, replaces the directory and runs its update hooks. This tests the upgrade mechanism, not WordPress.org delivery of a version that had not yet been published.

The first upgrade preserved all **19 399 posts rows** and all checked settings/activation byte for byte. Reading also left existing rows unchanged. Core created 22 empty auto-drafts for new test users and reindexed integer keys in inactive-widget arrays in four contexts; values, sidebar assignment and widget order were preserved. These differences were recorded separately; complete database equality after entering the admin interface is not claimed.

The same IDs then underwent title-only, full and repeated saves in three engines. JSON may gain an explicit `timeZone` recovered from old HTML. This records an existing value at save time; it is not a timezone change or background migration. Old widgets are neither deleted nor recreated.

Official ZIP 1.1.1 was physically restored after those saves; its 14 files were verified. Replacing the files preserved **21 656 posts rows** and settings byte for byte. The database was not restored. The old editor and frontend read the prepared data in three engines; no blocks, captions or checked widget settings/placement were lost. Reading after rollback did not change existing rows, widget contents, sidebar settings or sidebar order.

Separately confirmed: all **19 314 posts rows that existed before this acceptance run** were preserved in full, including fields other than post_content. New test posts are counted separately.

After rollback, another native upgrade installed the same ZIP 1.1.2. All 15 files were checked on nine installations; data snapshots before/after replacement matched byte for byte. Final reads, mobile/tablet smoke checks and settings comparisons passed; reading also left data unchanged. The database was not restored at any transition.

Candidate 1.1.2 was left installed on the test sites. Both dedicated Compose projects and the separate Firefox server were stopped; the native site has status `halted`. Databases, original snapshots and results were retained.

Rollback checks reading and rendering of the prepared data. Editing again on 1.1.1 restores its known KSES/Author limitations and old UI; correct behavior of the old version under such new edits is not promised. Upgrading also does not automatically restore HTML already removed by an earlier save on 1.1.1.

## Code review result

No new regressions were confirmed in the tested matrix. There are no new database schema fields, background migrations or bulk resaves. Metadata handling is limited to complete clock blocks; KSES rules for real HTML remain active. The widget callback respects rejection/replacement by other callbacks. Unrelated widgets and neighboring content have separate controls.

Standalone `src/`, `dist/`, dependencies and bundle 0.7.0 were unchanged. Bundled runtime SHA-256: `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`. Only verification tools and documentation were added in this review: `core-local-upgrade.php`, `final-acceptance.mjs`, `viewport-acceptance.mjs` and `visual-helpers.mjs`; local sequential orchestrators were retained with the evidence.

## Limitations and unsuccessful attempts

- Mouse Reset → Auto language remains unstable in headless WebKit/Firefox. A new control substituted the **exact public 1.1.1 block.js**, SHA-256 `1ce3df3a6aa541f09b5bb34a8f27e41582b417f3a309154d1eea6645d78f5eda`, only in the browser's HTTP response. Two responses were actually intercepted per engine. After confirmed clearing, mouse Auto leaves an empty string on both public JavaScript and the candidate; the keyboard restores `en-US`. This confirms that this headless scenario predates the candidate; the cause of the event-target change and behavior in users' ordinary Safari/Firefox remain unknown. This is not a new Locale defect or proof of every mouse interaction path.
- In the first Firefox Locale run on WP 6.3, waiting for Author block insertion timed out without JS exceptions. A rerun without product changes passed 42/42. The cause of the single timeout is unknown; the failed file was retained.
- The first Firefox geometry comparison after a title change found only a DOMRect height difference of **0.0000152587890625 px**. All other metrics matched. The data was retained; an explicit 0.001 px tolerance was introduced and resave scenarios were rerun successfully.
- Test setup errors were corrected: Core 7 marks an HTML block attribute as local, so saved HTML is created through parse; new widget instances are placed first, then their actual sidebar is checked; Core 6.3's incorrect template-part self-link is replaced in the test request with theme//slug. Original failed JSON files were not overwritten.
- The first low-level CLI `upgrade()` replaced files but left reactivation to the browser skin. The site was restored to active 1.1.1, and the test switched to Core's actual AJAX `bulk_upgrade()` path. This is a test change, not a plugin fix.
- PHP logs were not suppressed. The monitored tails contain Core warnings about blocked external update requests and a WP-CLI Colors deprecation on PHP 8.5. These are classified in the evidence; entirely clean logs are not claimed.

Arbitrary third-party themes/plugins, subdomain multisite, Native HTTPS/Site Domains, manual system IME, and the review author's browser and site are not covered. Visual comparisons use the same set of local/fallback fonts; external browser requests are blocked, and Google Fonts delivery is not tested. The cause of the specific LocalWP complaint remains unknown.

## Reproduction

An already prepared isolated lab and its current configurations/credentials under `.local/` are required. Sequential commands, actual labels, snapshots and checks before/after file replacement are retained in `final-acceptance-921/accept.py`, `matrix.py`, `compare_reads.py` and JSON evidence. New results are protected from overwrites; a manual repeated read smoke requires a fresh stage:

```bash
set -euo pipefail
node tools/wordpress-lab/final-acceptance.mjs check "manual-$(date +%Y%m%d-%H%M%S)" chromium localwp
```

The command requires this exact native lab to be running with the candidate. Do not switch plugin versions concurrently with browser runs. Shutdown targets only the two dedicated Compose projects, separate Firefox server and created native site; data and evidence are retained.
