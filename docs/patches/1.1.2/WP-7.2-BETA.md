# WordPress 7.2 Beta 2 — initial 1.1.2 investigation

**Historical report for ZIP `1e5d3f0d…`. Subsequent fix and separate acceptance: [KSES72-VERIFICATION.md](KSES72-VERIFICATION.md).**

28 October 2026. **WP 7.2 Beta 2 acceptance failed: caption saving is confirmed incompatible with the new KSES. Product, accepted ZIP, and prepared SVN remain unchanged. Nothing published.**

## Test sites and artifacts

The official [WP 7.2 Beta 2 dated 27 October](https://wordpress.org/news/2026/10/wordpress-7-2-beta-2/) was used, not a nightly build. Two new Docker sites: PHP **8.3.35** / **8.5.12**, MariaDB **11.4.8**, default block theme **Ipsum 1.0**. HTTP is available only at `127.0.0.1:19533/19534`; the database publishes no port. Dedicated Compose network `10.254.120.0/28`, separate data directories, external WordPress HTTP and automatic updates disabled. Existing sites, LocalWP, routing, and certificate trust were unchanged.

- Core: `https://wordpress.org/wordpress-7.2-beta2.zip`, SHA-256 `b1e1257fb208b6a399a457182f20d96726f2812ff003eadeb60bb9232f623e81`.
- Candidate: `1e5d3f0d5f7189f0fa6dca4539bf83860fbc46a7a7513f8c2c2b004f722038a3`, the same 15 files.
- Official 1.1.1: `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`, 14 files.
- Original Git commit: `b945c3330d1ed318d500a1c1b819316857ee1e9c`; installable tree `6675a436d7ddd7ba73e0aa48e23e27fa47cd3f3b`.

First, public 1.1.1 created original Administrator/Editor/Author posts, a synced pattern, template part, mixed layout, Custom HTML, and active/inactive block widgets with a neighboring Text widget. Each native post contains 103 synthetic clock fixtures, including 96 complex captions. Separate Chromium, Firefox, and WebKit visual references were captured. Only `Date` was frozen for comparisons; real timers and navigation/performance APIs were retained.

## Confirmed P2: caption changes on save

Trigger: a user without `unfiltered_html` (Author was tested), an old published block with a caption containing HTML-like text or entities. Changing **only the post title** and pressing the regular Save button is sufficient. Administrator and Editor with `unfiltered_html` do not reproduce this scenario on single-site.

For example, original JSON caption `Київ & <clock> "quoted"` becomes `Київ &amp;  "quoted"`. The clock's HTML attribute retains the original visible caption. Metadata no longer matches stored HTML; after reload, Gutenberg displays **Block contains unexpected or invalid content**. Merely replacing the ZIP and reading without resaving does not cause this. Frontend checks still display the previous clocks; this does not prove editing works.

In the complex-caption corpus, 90 of 103 Author JSON captions changed on each PHP version. This is the proportion of deliberately selected test cases, not an estimate of affected sites. In all six PHP/browser combinations, the real Save button reproduced changed JSON and an invalid block after reload. Screenshots and before/after content are retained under `ui-repro-*`.

The cause was checked against the installed beta's code:

1. `wp-includes/default-filters.php` enables the new HTML API KSES through `wp_kses_force_legacy_parser => false`.
2. Our `pre_kses` callbacks at priorities 9 and 11 protect the plain-text caption around the previous `wp_pre_kses_block_attributes` at priority 10.
3. In `html-api` mode, this Core callback skips the previous pass. The new sanitizer filters block JSON later, inside its tokenizer, after our callback has restored the caption.

A control in **separate PHP requests** forced the legacy parser: the same 11 suites passed **2704/2704** on the same two beta sites and unchanged plugin. Three minimal scenarios on each PHP version also preserve captions only in the legacy control. This is a diagnostic switch; permanently disabling the new KSES for the whole site is not proposed.

The known plain-text caption protection needs a targeted adaptation to the new KSES pass. Sanitization of real HTML and other JSON fields must remain intact. No fix was made during this check.

## Results

| Check | Result |
| --- | --- |
| Standard `Plugin_Upgrader::bulk_upgrade`, 1.1.1 → 1.1.2 | Both PHP versions: success, exact ZIP files, all 28 posts rows and settings unchanged |
| 11 PHP suites, standard new KSES | **2544/2704**, 160 failing assertions, 80 per PHP version |
| Same PHP suites, temporary legacy control | **2704/2704**, no persistent Core change |
| Named/numeric entities, post/widget pipelines × 3 engines × 2 PHP versions | **218 208/218 208** DOM-meaning comparisons |
| Resaving the old corpus, 3 engines × 2 PHP versions | **270/300**; Author JSON/validity not preserved; raw Custom HTML also changed |
| Visual comparisons after resaving | **18/18**: previous DOM, time, styles, and geometry |
| Locale UI | All 246 functional checks in six completed contexts passed; two WebKit no-error guards failed |
| Auto/Reset Locale and Time Zone | All 204 functional checks passed; two WebKit no-error guards failed |
| Physical rollback to 1.1.1 | Exact 14 files; all 1035 posts rows and settings unchanged |
| Reading after rollback | **312/342**, existing incompatibility of posts resaved on beta persists; visually **18/18** |
| Locale after rollback, 3 engines × 2 PHP versions | **41/42**: all 36 functional checks passed; one WebKit guard failed |
| Time Zone Reset after rollback, Chromium/Firefox × 2 PHP versions | **44/44**; two WebKit runs blocked by the guard for original fixtures with browser errors |
| Another standard upgrade 1.1.1 → 1.1.2 | Both PHP versions: success, all 1035 posts rows and settings unchanged |
| Reading after reupgrade, Chromium × 2 PHP versions | **104/114**, earlier incompatible posts were not automatically restored |

160 failed PHP assertions are not 160 separate defects. Some strict contracts compare exact entity/JSON forms, including stricter removal of unrelated unsafe JSON by the new Core. The confirmed product effect is loss of the original JSON caption and an invalid clock block. Changed raw Custom HTML serialization by itself does not mean the frontend is broken.

## Separate test-environment failures

The first two PHP 8.5 reads timed out during login/editor readiness while the PHP suite ran concurrently. A separate Chromium read after that load was removed passed; subsequent Firefox cycles completed. The first Firefox Locale/PHP 8.3 run stopped at block insertion; a separate retry passed 42/42. Original failures are retained; the reason for insertion instability is not fully established.

WebKit reports `due to access control checks` during page transitions. A control **with the plugin completely disabled** and one Core Paragraph reproduced CSS-prefetch errors on both PHP versions: 18 errors each, while all six Core Paragraph saves were valid. Plugin activation was restored after the control. This rules out the plugin as a necessary condition for those CSS errors. Separate `admin-ajax.php` errors were not reproduced by this brief control and remain an uncertainty in the browser run. Guards were not disabled, and exceptions were not converted into passing results.

## Upgrade, rollback, and scope

Replacing files during upgrade/rollback does not rewrite the database. However, rolling back the ZIP does not restore JSON already changed **by saving on beta**; returning to 1.1.2 also does not restore data. Verification runs without restoring the database and without attempting automatic repair of invalid blocks.

The previous stable WP 6.3.2–7.1.3 matrix applies to this same unchanged artifact. Beta verification does not replace it and does not certify final WP 7.2. Native LocalWP/HTTPS, multisite, and the third-party theme/cache matrix were not rerun on beta. `Tested up to: 7.1` was unchanged.

Runners: `tools/wordpress-lab/beta72-lab.py`, `beta72-browser.py`; minimal KSES control: `beta72-repro.php`; real Save button: `beta72-ui.mjs`; independent Core/WebKit control: `beta72-navigation-control.mjs`. Only the two new loopback sites were added to the previous browser suites' allowlists. Runtime files and raw results are under ignored `.local/wordpress-lab/wp72-beta/`. [Machine-readable results and evidence SHA-256](wp72-beta-evidence.json) also retain failed and incomplete runs.

New containers and temporary Firefox were stopped; ports 19527/19533/19534 are closed. Database data and evidence are retained; volumes were not removed. PHP logs have no fatal errors or plugin-error messages; they contain Core warnings about deliberately blocked external HTTP and WP-CLI deprecations on PHP 8.5.

Publication and fixing beta incompatibility are separate actions. **WP 7.2 Beta 2 compatibility is not accepted.**
