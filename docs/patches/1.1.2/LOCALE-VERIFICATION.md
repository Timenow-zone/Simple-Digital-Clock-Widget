# Manual Locale input fix in 1.1.2

> Historical report for a previous artifact. Current candidate and results: [README](README.md), [KSES72 acceptance](KSES72-VERIFICATION.md). The shared ZIP/diff paths below may have been updated after this run; the original SHA values and results are retained as history.

28 October 2026. **Locale is fixed; new and previous checks, upgrade, and physical rollback to official 1.1.1 passed. Nothing has been published publicly.**

- ZIP SHA-256: `92121d672e1aa190b54bcc51f5f6a81b89827f43defca85cf647807e5019c04e`.
- Full diff against 1.1.1: SHA-256 `ba3623a4aac2dfd60799c6fde1e7cd707a6816589bf404d8e47e67b5a73e101c`.
- [Machine-readable evidence](locale-evidence.json).

## Change

Previously, entering `uk-UA` left the previous `uk` value. Core's [`ComboboxControl`](https://developer.wordpress.org/block-editor/reference-guides/components/combobox-control/) uses input to search the list; arbitrary text by itself is not the saved value.

The language list and component are retained. The new `LocaleControl` adds a valid typed code as an option and displays saved codes that are absent from the list. Enter selects the code; blur also commits it when using Tab or clicking outside the field. An invalid code does not replace the setting and displays the existing localized message. Escape cancels input. IME Enter is not intercepted. Core 6.3 handling accounts for Tab onto Reset inside the component and Enter bubbling from Reset to the older suggestions handler.

Whitespace, `_`, and `ua → uk` normalization uses the existing helper. Syntax is checked through `Intl.getCanonicalLocales`; support for a particular locale still depends on the browser's ICU. No new translation strings were added.

Relative to `834b1757…`, only **`block.js` and the `readme.txt` changelog** changed. PHP, standalone bundle 0.7.0, the attribute schema, and all of `save()` are byte-for-byte unchanged. There are no new fields, database migrations, or background post resaves.

## Reproduction and final tests

Before the product change, the new tests on exact 834 returned **11/30** for both Administrator and Author. Intermediate runs exposed IME Enter (**34/36**), a Tab difference on Core 6.3 (**31/36**), and keyboard Reset on older Core (**36/38**). An additional test with an initially invalid value returned 38/42 on 7569aff3: Enter prevented correction. The condition was narrowed to invalid search input, allowing a valid code and list selection. In these two scenarios per role, the initial value `%%` is set through the editor store; correction uses real key presses. The final ZIP passes 42/42; intermediate ZIPs and RED evidence are retained.

| Check of the exact final ZIP | Result |
| --- | --- |
| Locale UI: three environments × Chromium/Firefox/WebKit × Administrator/Author | **378/378** |
| Previous 11 PHP suites in four contexts | **5408/5408** |
| Previous Native LocalWP UI scenarios: timezone, caption, options, Author/Editor, saving, frontend | **76/76** |
| 309 existing caption/entity blocks read by three engines | **927 block/engine combinations**, no differences |
| Reading new Locale posts after physical rollback to 1.1.1 | **63/63** |
| Reading after reupgrade from 1.1.1 to this ZIP | **21/21** |
| ZIP CRC, all 15 files matching source, dry-run and application of the diff to 1.1.1 | PASS |

UI environments: native **Local 10.2.0 / WP 7.1.3 / PHP 8.2.29 / nginx 1.26.1 / MySQL 8.4.0**; Docker **WP 6.3.2 / PHP 7.0.33**; a subdirectory multisite child site on **WP 7.1.3 / PHP 8.5.12**. The PHP suites also ran on that network's root site: three installations, four contexts. Firefox uses the official Playwright 1.62.1 Linux browser server; Chromium/WebKit run locally.

Coverage includes `uk-UA`, `en-GB`, `fr-CA`, `ja-JP`, `uk_UA` with whitespace, `ua`, list selection before/after manual input, invalid strings, Escape, both Reset methods, Auto language, multiple clocks, save/reopen/resave, and frontend. IME coverage uses a `KeyboardEvent` with `isComposing`; a system IME was not tested manually.

The final UI runs had no uncaught errors. One earlier WebKit/multisite run reported `admin-ajax.php ... access control checks` after its functional checks; a separate retry passed without the error. The cause of that isolated message is unknown. The failed result is retained; errors during context closure are now recorded separately, but the successful retry had none of those either.

The same isolated message appeared in Native WebKit on official 1.1.1 during rollback: all six functional checks passed, but the final no-exceptions requirement failed. A retry passed 7/7; the failed file was not overwritten. Read mode no longer performs an unnecessary second navigation to the already open post; the checks themselves are unchanged. The cause of the message is unknown and is not claimed as a product fix.

Only test setup/expectation errors were corrected: Author received its own initial post; `fr-CA` is checked using its `h/min/s` time format rather than requiring colons; multisite comparison uses post content without additional clocks in footer widgets. These initial failed attempts are retained.

## Mouse-run limitation

Headless WebKit/Firefox showed a change in event target after blur: mousedown reached Auto language, while mouseup/click reached the container. Some mouse Reset/Auto actions did not execute. A control using the **exact previous `block.js` from 834**, substituted only in the browser HTTP response, reproduced the behavior. The JS SHA and the number of responses actually intercepted were recorded. After guaranteed clearing, mouse Auto left an empty string, whereas keyboard activation restored `en-US`.

This is not claimed as a new regression and is not attributed to LocalWP. The reason for the event-target change and the behavior of users' regular Safari/Firefox browsers are unknown. The final Firefox/WebKit scenarios activate buttons by keyboard; Chromium uses the mouse. Failed mouse attempts and focus events are retained separately. This does not confirm every mouse interaction in every browser.

## Upgrade and rollback

The official 1.1.1 ZIP was physically installed on three installations, SHA-256 `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`; all 14 files were verified. Its editor and frontend read six new posts / nine clocks with Locale codes in three engines and a different browser timezone. Blocks remain valid; reading does not make the post dirty or change its content.

The same final 1.1.2 was then physically restored: all 15 files were verified and reading repeated. Across replacements and between reader runs, all **4750 post_content rows and 50 widget contents** in four contexts were preserved. The database was not restored. Rollback brings back the previous UI limitations and known Author filtering in 1.1.1; it does not promise correct editing on the old plugin.

After verification, the new candidate was left on the test sites, the sites were stopped, and data was retained. Old ZIPs/diffs and intermediate builds remain in `.local/wordpress-lab/locale-fix/`. User sites, SVN, remote Git repositories, and the forum were unchanged.

## Relation to the LocalWP complaint

Public 1.1.1 does reproduce two original failures **also in real LocalWP**: clock removal on Author save and invalid blocks after a browser timezone change. These are confirmed possible explanations for the complaint. They were also reproduced outside LocalWP; LocalWP itself cannot be declared the cause.

The reviewer supplied no symptoms, versions, or steps, so the cause of that particular complaint remains unknown. After release, it is reasonable to describe the verified fixes and invite a retest; it is not justified to claim “we identified the cause of your problem.”

## Artifacts and scope

Runner: `tools/wordpress-lab/locale-tests.mjs`. ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`. [Full diff](simple-digital-clock-1.1.1-to-1.1.2.patch). Results, controls, snapshots, intermediate ZIPs, and the cycle runner: `.local/wordpress-lab/locale-fix/`; additional older UI suites are listed in the manifest.

The previous 13 520 PHP checks and 1 091 040 DOM comparisons from [834 acceptance](WIDGET-FALLBACK-VERIFICATION.md) are not presented as a new run. Their PHP and bundle bytes are unchanged; current reruns are listed above. Native HTTPS, third-party themes/plugins, the reviewer's site, and manual operation in their browser are outside coverage.
