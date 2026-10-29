# KSES in WordPress 7.2 Beta 2 — the 1.1.2 fix

29 October 2026. **The P2 is fixed; the functional ZIP passed acceptance in the tested local matrix. No new regressions were found in that matrix. Nothing was published.** [Machine-readable results and SHA-256 evidence hashes](kses72-evidence.json).

Subsequent [POT synchronization and repackaging](../../releases/1.1.2/METADATA-SYNC.md) changed only translation metadata and changelog wording about confirmed LocalWP scenarios. This report and its evidence retain the identity of functional ZIP `6f896d42…`; the current installation SHA is recorded in the release manifest.

## Defect and reproduction

The [initial diagnosis](WP-7.2-BETA.md) concerns previous ZIP `1e5d3f0d…`. In WP 7.2 Beta 2, the new HTML API KSES processes block JSON after `pre_kses`. Previous caption restoration in `pre_kses` ran too early: on Author save, the JSON caption changed while the HTML attribute retained the previous text. Even a title-only change made the block invalid after reloading the editor.

Before the fix, new tests produced **27 failures out of 132 on each of two beta sites**. The real Save button reproduced the defect in all three engines. Failed results were retained under `.local/wordpress-lab/kses72-fix/red/` and in the earlier evidence; they were not overwritten.

## Change

Two installation files changed relative to the previous prepared patch:

- `includes/simple-digital-clock-kses.php`: plain-text JSON caption protection lasts until native KSES completes; restoration occurs after it returns.
- `readme.txt`: a changelog item was added. Original CRLF was preserved.

Each plugin-owned save call has a separate stack and temporary UUID markers. Only the string `caption` of a complete known clock block is protected. Real HTML, event handlers and other JSON fields follow Core's current policy. `serialize_block_attributes()` safely escapes restored JSON. Markers are not stored in the database.

Slashed post filters (`content_save_pre`, `excerpt_save_pre`, `content_filtered_save_pre`) and separate block-widget sanitization use independent scopes. A bounded `debug_backtrace` reads only function names and `WP_Hook` object identity, without arguments: it distinguishes the registered Core callback from unrelated KSES invoked by a neighboring filter. Tests cover nested direct, slashed and third-party hook calls, and early/late policies. Without this check, intermediate variants incorrectly intercepted unrelated sanitization; those variants were rejected.

The new HTML API KSES remains enabled. There is no global switch to the legacy parser. An unrelated direct `wp_kses_post()` call follows Core policy; plugin-caption preservation is checked through real post filters, the plugin's own sanitizer and the public widget callback.

`block.js`, the attribute schema, `save()`, CSS and runtime 0.7.0 were unchanged in this fix. There is no database migration, new setting or new storage format.

## Acceptance

Functional acceptance ZIP: `6f896d42797e6d3a4727f8ece6d13bb8f4be2ed8e9425473ef02ea5e374d8720`, 15 files. Official 1.1.1: `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`, 14 files.

The matrix includes 11 installations / 12 contexts: WP 6.3.2, 6.8.3, 7.1.3 and **7.2 Beta 2**; PHP 7.0, 7.4, 8.2, 8.3, 8.4 and 8.5; single sites, multisite root/child and actual LocalWP. Beta was tested on PHP 8.3.35 and 8.5.12 with unchanged official Core and the new KSES enabled. Exact versions and themes are recorded in the evidence.

The final ZIP passes **18 336/18 336 PHP checks**: 13 suites per context, including the previous 11 suites and 176 new checks per context. Coverage includes title-only updates, full/repeated saves, three post fields, HTML5/numeric entities, unsafe neighboring JSON fields, XSS attributes, nested filters and preservation of previously applied policies. All **1 309 248 DOM comparisons** in Chromium, Firefox and WebKit preserve entity values.

Fresh fixtures were created on official 1.1.1. Checks cover the native Core updater, reading old blocks, 1.1.2 resaves under different roles, active/inactive block widgets, patterns, template parts and neighboring Core blocks. Physical rollback is performed over resaved data; the database is not restored. Complete posts rows are hashed across all columns, and widget, sidebar, theme, URL and activation settings are compared exactly before/after file replacement.

Repeated acceptance completed without failures:

| Group | Passed |
| --- | ---: |
| Reading after upgrade / 1.1.2 saves | 2082 / 1827 |
| Reading after physical rollback / reupgrade | 2082 / 694 |
| Real Save button on Beta 2, two PHP versions × three engines | 30 |
| Filtered widgets: saving / reading after rollback | 60 / 60 |
| Locale / mouse Auto and Reset | 630 / 525 |
| Locale / Time Zone Reset after rollback in a different timezone | 105 / 165 |
| Mobile and tablet frontend: candidate / rollback | 360 / 360 |
| Three themes × four optimization/cache modes: candidate / rollback | 576 / 576 |
| Saving posts and widgets with themes/caches | 222 |
| Native HTTPS: server cycle / browser scenarios after upgrade | 28 / 246 |
| Standalone Node tests, widget source unchanged | 22 |

Official 1.1.1 baselines are captured separately and are not included in the table of new scenarios. The first native upgrade preserved all **31 426** complete posts rows byte for byte; rollback and reupgrade preserved **34 468**, including posts created by the tests. Replacing files also left widget/sidebar/theme/URL/activation settings unchanged. The row count increased only through test posts and revisions; there were no migrations or database restores.

Native HTTPS was repeated through a **dedicated loopback listener on 19443**, using the same native Local nginx, PHP-FPM and MySQL. nginx serves TLS directly, with normal validation of the previously trusted certificate CF:3E:5A:39:69:FE; Secure/HttpOnly cookies, HTTPS REST and actual `admin-ajax update-plugin` were checked. The shared Local router remained in localhost mode because other test sites were already registered in Local. Router configuration and the site's original configuration had identical SHA-256 values before/after testing; certificate trust was unchanged. The investigation's site URL was restored to `http://localhost:10003` and the private listener was closed. This tests native TLS on a separate port; a new Site Domains/443 run and ordinary Safari application run are not claimed.

## Tools and limits

New PHP suites: `tools/wordpress-lab/kses72-regression.php` and `kses72-owned-pass.php`. `kses72-widget-rest.mjs` tests the real HTTP REST path for a filtered user, active/inactive widget saves and frontend sidebar. `beta72-ui.mjs` checks the actual Save button and reopening the block.

Acceptance scenarios and full evidence are under `.local/wordpress-lab/kses72-final/`. Main commands for already prepared test sites are retained in `cycle.py`, `php.py`, `browser.py`, `dom.py`, `finish-cycle.py`, `integrations/run.py` and `native-https/run.py`. They are not intended for user sites; existing evidence is not overwritten. Checks retain temporary test posts in their own databases. After acceptance, the investigation's Docker sites, temporary Firefox and own Local site were stopped; all 14 test loopback ports were closed. Databases and volumes were retained; other Local sites were unchanged.

Two initial browser runs stopped before Locale checks while clicking a rerendering inserter. The check uses the exact accessible option and keyboard confirmation; mouse Auto/Reset interactions are separately checked by the previous suite. Reruns retain separate names. The integration test explicitly confirms a cache HIT before saving a widget; a correct fresh response is not treated as a failure. For a stale HIT, it applies the manual cache-clearing policy previously confirmed with an independent Core Paragraph control. Browser drivers wait for editor and canvas readiness; global network-idle is not used as a readiness signal.

WP 7.2 remains beta: the specific Beta 2 was accepted; the final release has not yet been tested. `Tested up to: 7.1` is retained. Custom third-party KSES policies at priority `PHP_INT_MAX` after our protection and arbitrary third-party integrations are not separately certified. Google Fonts/CDN were blocked in isolated browser runs. Public WordPress.org delivery and the review author's site were not tested.

ZIP rollback does not restore data damaged by previous versions before the fix. Editing again on 1.1.1 remains subject to its known defects. To revert the change itself, the previous Git commit, ZIP `1e5d3f0d…`, source snapshots and SVN preparation are available; the full diff against official 1.1.1 is verified separately by applying it to a clean copy.
