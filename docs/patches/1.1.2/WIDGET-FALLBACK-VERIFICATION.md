# Fixing multisite widgets and HTML-only captions

> Historical report for a previous artifact. Current candidate and results: [README](README.md), [KSES72 acceptance](KSES72-VERIFICATION.md). The shared ZIP/diff paths below may have been updated after this run; the original SHA values and results are retained as history.

28 October 2026. **Both remaining P2 issues are fixed. The final ZIP passed new and previous checks, including native LocalWP. Nothing has been published.**

- ZIP SHA-256: `834b1757263a7b9536990a9c64d9c698d73c3747a2a5af755a3e28d0d9e6b352`.
- Full diff against official 1.1.1: SHA-256 `e442cb72ef893822474bb8669e9700febbfb994b43ec86a9fa7c1538d986f79a`.
- The previous verified candidate `977c5603…` and its diff are retained separately. Relative to it, **one product file** changed: `includes/simple-digital-clock-kses.php`.

## Reproduction before the fix

Fresh independent fixtures were created on exact `977c5603…`. The browser confirmed the earlier results: Site Admin on two multisite sites gets **22/103 invalid blocks** after a widget save; on WP 6.3.2 / PHP 7.0.33, **three HTML-only captions** change to literal entities in the editor after a title-only update.

Before the fix, the new PHP suite returned **154/230**: it checks DOM captions, original JSON, repeated saves, KSES, and keeping caption absent when originally absent during a title-only update. Real REST permissions were checked separately: Editor/Author receive 403; Site Admin can save widgets but lacks the mapped `unfiltered_html` capability.

## Fix

**Widgets.** Entity preparation and final CR/Unicode encoding were extracted into shared functions for unslashed HTML. The post pipeline uses them with its previous slash handling. An early `widget_update_callback` was added for standard `WP_Widget_Block`: it takes the original unslashed input, prepares the caption, reruns **standard `wp_kses_post()`**, and encodes the result. HTML still passes through normal allowlists, CSS/URL callbacks, and filtering of dangerous attributes.

The callback preserves `false` rejection, other instance settings, the behavior of unrelated widget classes, and unfiltered users. If an earlier callback has already replaced content, that result retains priority. Later callbacks can also modify or reject the save.

This additional contract was tested before enabling the guard: intermediate `982aafd4…` returned **46/47**, overwriting an earlier content replacement. The final ZIP returns **47/47** in all ten contexts. The intermediate ZIP and RED evidence are retained; it is not a release candidate.

**HTML-only captions.** PHP no longer synthesizes absent JSON caption values through a Core/PHP-dependent decoder. Original HTML remains the caption source; the existing browser `blocks.getBlockAttributes` fallback reads it with correct DOM semantics. Explicit JSON retains its previous priority. Recovery of an absent timezone is unchanged. On a full save, Gutenberg itself serializes caption into JSON; new tests check this transition and repeated-save stability.

There is no new HTML5 decoder, database migration, bulk post modification, or change to the existing JSON format. Standalone widget 0.7.0 and its bundle are unchanged.

## Clarifying the previous security fixture

The first combined run produced one failing assertion in each of nine contexts. The older test `plain-text caption JSON cannot break a block comment` supplied **only an HTML caption** and then required PHP to add caption to JSON. That requirement contradicts the new preservation of an optional HTML-only field and does not test preservation of original JSON.

The fixture input was clarified: the dangerous string `--><script>…</script><!--` is now explicitly supplied as JSON caption through the standard serializer. The assertion is not weakened: it still requires the original JSON string and absence of a real script tag. The count of **464** previous checks is retained. The clarified suite separately passed **464/464 on exact `977c5603…`** and on the final candidate. HTML-only captions have independent PHP/browser coverage, including not synthesizing JSON on a title-only update.

Original failing results and the first combined run are retained. They are not counted as final GREEN results in place of a rerun with the clarified input.

## Final ZIP matrix

| Environment | WordPress | PHP | Contexts | PHP checks per context |
| --- | --- | --- | --- | --- |
| Docker / Apache | 6.3.2 | 7.0.33 | 1 | 1352/1352 |
| Docker / Apache | 7.1.3 | 7.4.33 | 1 | 1352/1352 |
| Docker / Apache | 6.3.2 | 8.2.12 | 1 | 1352/1352 |
| Docker / Apache | 6.8.3 | 8.3.28 | 1 | 1352/1352 |
| Docker / Apache | 7.1.3 | 8.3.35 | 1 | 1352/1352 |
| Docker / Apache | 7.1.3 | 8.4.27 | 1 | 1352/1352 |
| Docker / Apache | 7.1.3 | 8.5.12 | 1 single + 2 multisite | 1352/1352 |
| Native Local 10.2.0 / nginx 1.26.1 / MySQL 8.4.0 | 7.1.3 | 8.2.29 | 1 | 1352/1352 |

Total: **13 520/13 520 PHP assertions** across eight previous suites, the new 47-assertion suite, and two widget entity pipelines. Coverage includes Core KSES, unchanged unfiltered input, repeated saves, rejection of XSS/CSS/URL input, and exact ASCII entity-representation round trips through temporary `utf8mb3` tables. The last check does not cover arbitrary Unicode block comments on old database schemas.

**1 091 040/1 091 040 independent DOM comparisons** in Chromium, Firefox, and WebKit: 8500 named-entity inputs and 9684 literal-numeric inputs, two save paths—posts and widgets—and ten contexts. Expectations come from the browser DOM of the original HTML, not from the PHP decoder. These compare attribute meaning, not a million complete Gutenberg operations.

Additional checks and retained results:

- **20 existing posts / 2060 clock blocks** in three engines: Administrator/Editor/Author and multisite roles; title-only, full serialization, repeated saving, all attributes, editor validity, and frontend. Three posts / 309 blocks are in real LocalWP. Raw content matches across engines.
- Widget REST and **103 captions** for permitted roles in five Docker contexts across all three engines, with no invalid blocks. An HTTP control by Site Admin preserves the correct caption in a real Twenty Twenty-One footer. Editor/Author remain denied.
- **45 fresh HTML-only fixtures**: caption, preview, and frontend are preserved on a title-only update; a subsequent full save generates correct JSON, and a repeated save is stable. After full serialization, 1.1.1 accepts these same posts.
- The previous 396 browser smoke checks passed before the final widget-callback guard change; its post-only paths are unaffected by that final change. On the final ZIP, 20 native posts were checked again in three engines, along with the older 96-caption suite in the four original configurations. Acceptance of the previous 136 IDs and unrelated metadata was repeated during the work; the final cycle also checks their content through whole-database hashes.
- PHP/JS tool lint, no whitespace errors, dry-run, and application of the full diff to a separate official 1.1.1 copy. All 15 resulting files match the ZIP; the original `readme.txt` CRLF is preserved.

## Upgrade and rollback

Official **1.1.1 → final 1.1.2 → save → official 1.1.1 → the same final 1.1.2** was tested without database restoration. The native Local baseline was actually created on 1.1.1; before the first candidate save, its original 14 files and unchanged raw content of all three posts after ZIP replacement were separately verified.

In the final combined cycle, files were physically replaced in **nine installations / ten contexts**, including LocalWP and multisite. Each replacement verified the 14 official 1.1.1 files and 15 candidate files. The old editor accepts the new saves in all three engines, including widget captions. Reupgrade and multisite network/site-specific activation were also checked.

All **17 366 post_content rows and 96 widget contents** retain their hashes across rollback, old-version reading, reupgrade, and candidate reading. The main 20 IDs are compared directly with saved raw content. Reading does not resave anything. The database is neither reset nor restored.

Compatibility boundary: blocks with a nonempty caption only in HTML were already not a valid native 1.1.1 format. Saving only the title in 1.1.2 retains that original format; the old editor gains no new support for such input. Compatibility is verified for originally valid 1.1.1 blocks and for HTML-only fixtures after full Gutenberg serialization. Editing again in 1.1.1 reintroduces its previous defects that this 1.1.2 fixes.

## Native LocalWP, logs, and scope

The user personally accepted Local's terms. No Local sites existed before the test site was created. Only `SDCW-112-Isolated-20261028`, ID `ujo3kaSGV`, `http://localhost:10003`, was created under `.local/native-local-sites/`. Mail and external WordPress HTTP are blocked. Test PHP copies differ from Docker source only in the absolute fixture path; all assertions are identical and their hashes are retained.

One initial baseline editor load on official 1.1.1 exceeded 20 seconds; a diagnostic retry loaded in 0.8 seconds. Later, one concurrent Firefox login exceeded 20 seconds; a separate retry passed. In the final native reader runs, logins using the same accounts ran sequentially and passed. These timeouts are retained; their cause is unknown and is not attributed to the plugin. Logs contain no new PHP warnings/fatals from plugin files. Core warnings about blocked external update checks, the associated WP_DEBUG_DISPLAY headers-already-sent cascade on earlier Docker sites, PHP 8.5 notices in WP-CLI vendors, and corrected helper-eval errors are separated from product errors.

Native HTTPS/Site Domains, native multisite, and arbitrary third-party extensions are outside coverage. Subdirectory multisite was tested in Docker; a subdomain network was not tested. The cause of the original public review remains unknown. Previous standalone lint/22 Node/84 browser results are not presented as a new run; source and bundle 0.7.0 are unchanged, bundle SHA-256 `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.

After acceptance, the final ZIP was restored, and only the dedicated Docker sites and sole native Local site were stopped. The database, images, and evidence were retained. The path for future Local sites was restored to `~/Local Sites`; the test site remains inside the repository. Local CLI is installed; Router mode remains `localhost` for a reproducible test site.

## Artifacts

- [Machine-readable acceptance](widget-fallback-evidence.json).
- [Full diff against 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch).
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- Final results and runner: `.local/wordpress-lab/widget-fallback-final/`.
- RED and intermediate results: `.local/wordpress-lab/widget-fallback-fix/`, `widget-fallback-fix-green/`.

Only local WordPress-wrapper source, tests, package, and reports changed. There were no Git commits/pushes, WordPress.org publications, SVN writes, or changes to user sites.
