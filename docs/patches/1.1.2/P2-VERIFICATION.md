# WordPress 6.3 P2 fix — candidate 1.1.2

**Historical report for `4f5b285c…`.** A subsequent [review](FINAL-REVIEW-3.md) found a P2 involving other HTML5 entities; it has also been fixed. Current acceptance for the newer ZIP is in [HTML5-VERIFICATION.md](HTML5-VERIFICATION.md). Results for the previous suite and archive are retained below.

27 October 2026. **P2 fixed; all new and previous local checks passed. Nothing published.**

ZIP SHA-256: `4f5b285c30fde609edb2252f7e8be782fe59d9967be37ecbc34b6c06795a0da2`.

## Reproduction and fix

Before changing the product, the independent `review2-entities.mjs` suite was rerun on the previous ZIP `1ce5d1d1…`. Result: **165/168**; three assertions for one Author / WP 6.3.2 case failed. Saving caption `&apos; <clock>` changed its HTML value and made the block invalid. Input fixtures from the original 1.1.1 serializer and expected DOM values remain unchanged.

The cause is WordPress 6.3's HTML 4.01 attribute decoder. It leaves `&apos;` as a string, after which strict re-escaping turns it into `&amp;apos;`. JSON was preserved, but HTML semantics changed.

A small extension of the standard `WP_HTML_Tag_Processor` was added in [includes/simple-digital-clock-kses.php](../../../wordpress/simple-digital-clock/includes/simple-digital-clock-kses.php). The native lexer identifies the exact original span of the `caption` attribute; only literal `<` and `>` are escaped within it. The whole value is neither decoded nor re-encoded. Thus `&apos;`, `&amp;apos;`, and additional `&amp;` layers retain their original meaning. The temporary global `attribute_escape` filter was removed.

It uses the protected `html` and `lexical_updates` fields, which the installed WordPress documentation provides for Tag Processor extensions. The span difference between WP 6.3 (`start/end`) and WP 6.5+ (`start/length`) is handled. Checks covered 1001 deferred replacements, UTF-8, attribute case/whitespace, single quotes, empty attributes, comments, and similar strings in unrelated HTML/script. Real event attributes are still removed by KSES; HTML-like captions remain text.

Relative to `1ce5d1d1…`, **one product file** changed. The full patch against official 1.1.1 touches four files: `block.js`, new `includes/simple-digital-clock-kses.php`, `widget_init.php`, and `readme.txt`. The other 11 original files and standalone widget 0.7.0 are unchanged. Previous fixes for neighboring-block JSON and the original JSON caption are preserved.

## Checks

| Configuration | Previous PHP | Previous-review PHP | New raw-caption PHP | Entity suite / engine | Previous browser regression / engine |
| --- | --- | --- | --- | --- | --- |
| WP 7.1.3 / PHP 8.3.35 | 464/464 | 148/148 | 18/18 | 42/42 | 33/33 |
| WP 7.1.3 / PHP 8.4.27 | 464/464 | 148/148 | 18/18 | 42/42 | 33/33 |
| WP 6.3.2 / PHP 8.2.12 | 464/464 | 148/148 | 18/18 | 42/42 | 33/33 |
| WP 6.8.3 / PHP 8.3.28 | 464/464 | 148/148 | 18/18 | 42/42 | 33/33 |

The browser columns were verified in **Chromium, Firefox, and WebKit**. Totals:

- PHP: **2520/2520**, including 1856 previous checks, 592 previous-review checks, and 72 new checks.
- Previous browser regression: **396/396**.
- Independent entity suite: **504/504** when saving with the new code and **504/504** when reading with official 1.1.1; both roles, all four sites, three engines.
- Extended caption suite: **480/480** when resaving and **504/504** when reading after rollback, including real editors without dirty state.
- Previous settings/nested-block suite: **528/528** on the candidate and **1584/1584** on official 1.1.1 in two timezones and three engines.
- Raw JSON attributes of neighboring blocks: **68/68** on saving, **32/32** after rollback. Coverage includes `{}`, objects with numeric keys, arrays, and unknown clock attributes.
- After reupgrade: **168/168**, including the real editor and a typed reader for the synthetic third-party block.

ESLint, release-check, **22/22** Node tests, and **84/84** standalone-widget browser tests passed. Its production bundle retained SHA-256 `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.

All five plugin PHP files passed the local PHP 8.5.10 syntax check; the changed browser scenario and entity suite passed `node --check`. The four sites' debug.log files contain no messages mentioning `simple-digital-clock-kses.php`.

## Fresh upgrade and rollback cycle

On exact official 1.1.1, **128 posts** were freshly created: 64 with previous settings and nested groups, 48 with six caption types for Administrator/Author, and 16 with raw object metadata. Mixed `&apos; <clock>` and `&amp;apos; <clock>` captions are included in the main cycle.

1. All 14 installed 1.1.1 files were verified against the official manifest.
2. Installing fixed 1.1.2 ZIP left all 128 posts' content byte-for-byte unchanged.
3. **The same IDs** were resaved: title-only updates, full Gutenberg/REST serialization, and the regular WordPress post API were checked separately. Author and Administrator were tested. Saved results match across all three engines.
4. The official 1.1.1 ZIP was installed; all 14 files were verified again. **The database was not restored.** All 128 posts' content remained equal to the snapshot after saving with the new code. The old editor reads captions/settings; neighboring blocks retain object values.
5. The same fixed 1.1.2 ZIP was reinstalled. All 15 files matched the candidate; all 128 posts' content was unchanged again. Reading and the real editor passed 168/168 checks.

A separate set of 120 entity-suite posts was also read by official 1.1.1 without changing content. This additional set is not part of the main 128 posts.

## Artifacts and reproduction

- [Machine-readable evidence](p2-verification-evidence.json): original RED result, GREEN suites, original and resaved IDs/content, installed-file comparisons, upgrade/rollback, and lab shutdown.
- [Full 1.1.1 → 1.1.2 diff](simple-digital-clock-1.1.1-to-1.1.2.patch), SHA-256 `98e5afeda9c8d895a78b28f0dd90a9b54e866ef690ca910d080617457bd87d3c`.
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- [Isolated lab instructions](../../../tools/wordpress-lab/README.md).
- New [raw-caption contracts](../../../tools/wordpress-lab/p2-caption.php) and the extended [caption cycle](../../../tools/wordpress-lab/final-review.mjs).

Dry-run and application of the diff to a separate official 1.1.1 copy passed; all 15 resulting files matched the verified ZIP. The old rejected ZIP, source, and results are retained under `.local/wordpress-lab/p2-fix/previous-*`; a separate ZIP copy is `.local/packages/simple-digital-clock-1.1.2-rejected-1ce5d1d1.zip`.

Key commands from this run are recorded in the JSON evidence. The scenarios require a prepared local lab and a fresh result name; reusing overwrite-protected names is intentionally prohibited.

## Scope, limitations, and rollback

No new regressions were found in the tested matrix. Native LocalWP, multisite, PHP 7.x/8.5 runtime, and specific third-party plugins/themes were not tested. Object attributes were checked using a synthetic third-party block. These contracts should be rerun after WordPress HTML API changes because the extension uses protected spans from the native lexer.

In the verified cycle, rollback replaces the ZIP with official 1.1.1 without restoring posts from backup. Its original editing defects return. The patch neither automatically restores previously lost markup nor repairs invalid posts created by the RED tests; acceptance used fresh valid 1.1.1 posts.

The cause of the original user's LocalWP review remains unknown. This P2 is not presented as its explanation.

There were no publications, Git commits/pushes, SVN changes, or changes to user sites. Only this lab's containers and network were stopped through Compose; local files, database, and evidence were retained.
