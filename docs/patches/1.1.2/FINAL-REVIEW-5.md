# Final review of 1.1.2 and expanded compatibility coverage

**Historical review of ZIP `977c5603…`. Both P2 issues described here were fixed in final local candidate `834b1757…`; current acceptance results are in [WIDGET-FALLBACK-VERIFICATION.md](WIDGET-FALLBACK-VERIFICATION.md). The hashes and failing results below are retained for the previous archive.**

28 October 2026. **Changes required: two remaining P2 issues were found.** The latest numeric entity fix did not introduce these errors: both were reproduced on exact previous candidate `4c62efe3…`. The original cause of the public user review is still unknown.

Unchanged ZIP `977c560321b565ddfbc66aa4d5dd2c32381779751c756106c2c317e2fd6d6bbb` and diff `1f3e448f56d42c704574354cc1ce16446c81c59097a00961d8fff9f2813c7c0c` were reviewed. All 15 product files match the previous acceptance manifest. Only test tools and reports changed during this review; product code, ZIP, and diff were not changed. Nothing was published; no commit/push, SVN changes, or changes to user sites were made.

## P2. Multisite Site Admin saves invalid blocks in the widget area

Location: `includes/simple-digital-clock-kses.php:232–248`, caption preparation only in post save filters; final encoding is also in `wp_insert_post_data:297–322`.

A regular multisite site administrator has `edit_theme_options`, but Core denies `unfiltered_html` through `map_meta_cap`. `WP_Widget_Block::update()` calls `wp_kses_post()` directly. This separate path does not pass through entity preparation in `content_save_pre` or final post-data processing.

On two sites in a WordPress 7.1.3 / PHP 8.5.12 network, 103 originally valid blocks were tested. After Site Admin saves the widget, **22/103 become invalid** in each of Chromium, Firefox, and WebKit. Examples include `&NewLine;`, `&Tab;`, `&NotEqualTilde;`, and numeric CR. Super Admin passes the same suite. Regular administrators pass on three single-site configurations; Editor/Author correctly receive REST 403.

An independent HTTP control as Site Admin edits an already placed block through the standard `/wp/v2/widgets/<id>` endpoint:

```text
JSON caption before/after: &NotEqualTilde; <clock>
DOM before:               ≂̸ <clock>
DOM after:                &NotEqualTilde; <clock>
block.isValid after:       false
```

The child site uses the actual `sidebar-1` area of the Twenty Twenty-One theme. This widget's frontend also receives the literal text `&NotEqualTilde;`, so the discrepancy is not limited to the test parser. A separate registered lab sidebar was tested on the root site.

An important capability-check detail: the REST users endpoint returns raw role capabilities, where `unfiltered_html` may be `true`. The decisive `current_user_can('unfiltered_html')` result was checked separately after Core mapping: it is **false** for Site Admin. REST permits widget editing; the Editor/Author denial was verified through the same controller.

Exact `4c62efe3…` was physically installed in multisite; its 15 files were checked against the archive. Statuses for all four roles and saved widget content are byte-identical to the current candidate. The latest numeric correction therefore did not introduce this error.

Caption semantic protection must also cover the independent block-widget save path while preserving normal KSES cleanup. The new check must include Site Admin with actual mapped capabilities, block validity, and DOM, rather than only stored JSON.

## P2. An HTML-only caption produces incorrect JSON on WP 6.3 / PHP 7.0

Location: `includes/simple-digital-clock-kses.php:107–110`, restoring a missing JSON caption through `WP_HTML_Tag_Processor::get_attribute()`.

The block has a caption HTML attribute but no corresponding property in its JSON comment. The current JS fallback correctly extracts the apostrophe from the browser DOM. Before save, the block is valid and its preview shows an apostrophe. On WordPress 6.3.2 / PHP 7.0.33, the Core PHP API returns the reference as text: older Core uses default `html_entity_decode` flags, which do not decode a single quote on PHP 7; `&apos;` also depends on HTML5 mode.

Three independent inputs were tested: `&#039; <clock>`, `&#x27; <clock>`, and `&apos; <clock>`. An Administrator with `unfiltered_html` performs only a **title-only update**:

```text
Before parsed caption:   ' <clock>
After JSON caption:      &#039; <clock>
After editor preview:    &#039; <clock>
Frontend DOM caption:    ' <clock>
block.isValid:           true
```

The caption field and editor preview change even though page HTML retains the apostrophe. Checking validity alone is insufficient. All three cases were confirmed by Chromium, Firefox, and WebKit on independent fresh posts. WP 7.1.3 / PHP 7.4.33 and 8.5.12, including two multisite sites, pass the same inputs.

Fresh fixtures were rerun on physically installed `4c62efe3…` on WP 6.3 / PHP 7.0. JSON, HTML, DOM, and the title-only update result match `977c5603…`. This is a remaining candidate error, not a regression introduced by the latest numeric correction.

These fixtures model programmatically created blocks whose caption exists only in HTML. They are not presented as valid native 1.1.1 originals. This finding does not reproduce for regular blocks with an explicitly specified JSON caption. HTML-only captions must be read with browser entity semantics on the minimum Core/PHP versions, preserving the priority of explicit JSON and distinctions between literal layers.

## Extended matrix

A separate Compose project, `sdcw-extended-review-20261028`, contains four WordPress runtimes and five site contexts. All ports bind to loopback; MariaDB has no published port, with dedicated databases and test accounts. Mail and external WordPress HTTP are blocked. Docker multisite uses a subdirectory network.

| WordPress | Actual PHP | Mode | Existing PHP contracts | Native posts / blocks per engine |
| --- | --- | --- | --- | --- |
| 6.3.2 | 7.0.33 | single-site | 1295/1295 | 3 / 309 |
| 7.1.3 | 7.4.33 | single-site | 1295/1295 | 3 / 309 |
| 7.1.3 | 8.5.12 | single-site | 1295/1295 | 3 / 309 |
| 7.1.3 | 8.5.12 | multisite root | 1295/1295 | 4 / 412 |
| 7.1.3 | 8.5.12 | multisite child | 1295/1295 | 4 / 412 |

**6475/6475 PHP assertions** passed: regression, final-review, P2 caption, HTML5 caption/save/pipeline/charset, and numeric caption/save/pipeline. The complete DOM suite also passes: **127500/127500** named-entity and **145260/145260** literal-numeric comparisons, totaling **272760/272760** in three engines.

The native suite comes from official 1.1.1: 96 caption variants and seven existing blocks with settings, totaling 103 blocks plus a neighboring paragraph per post. Administrator/Editor/Author were checked on single-site, and Super Admin/Site Admin/Editor/Author in multisite. All **17 posts / 1751 blocks** pass title-only updates, full serialization, and repeated saves in all three engines. Complete JSON, DOM for all attributes, editor validity, dirty state, and frontend are checked against the original valid input. Stored content is identical between engines.

Network activation, deactivation, activation only on the child site, and restoration of network activation pass. With separate activation, handlers load only on the child site; KSES allows the clock tag only there. This check does not change post content.

Extending coverage to PHP 7.0 revealed an incorrect expectation in older test `final-review.php`: it read the HTML attribute through Core API with PHP-version-dependent flags. For fixtures using HTML4/numeric escaping, the test now obtains the actual DOM value through DOMDocument. The count and expected semantics of its 148 assertions were unchanged. Independent browser checks of native JSON captions pass. The separate HTML-only fixtures above remain RED; correcting the test parser does not hide them.

## Upgrade and rollback

Posts were created and verified on official 1.1.1 before candidate installation. The same 17 IDs were saved with 1.1.2, followed by a physical rollback to official 1.1.1 and reupgrade using the same 1.1.2 ZIP. The old editor accepts all 1751 blocks in three engines; after reupgrade, the entire suite passes in Chromium. Read checks do not resave content.

Every archive replacement verifies physical plugin contents: 14 files for official 1.1.1, 15 for the candidates. IDs and raw content of the 17 native posts are checked directly against the database. Hashes of **all 1302 post_content rows** across five sites are also compared before and after rollback, reads in the old editor, reupgrade, and activation checks. Content is unchanged, and the database is not restored. For comparative `4c62efe3…`, all 1272 rows existing at that stage were also checked for identity; subsequent rows were created by separate control fixtures.

This confirms compatibility for the tested suite of regular post blocks. The two scenarios described above remain incorrect. Replacing the ZIP does not fix an incorrect caption already written; full compatibility across all save paths cannot be claimed.

## LocalWP and limitations

Native LocalWP was **not tested**. Official Local 10.2.0+7022 arm64 was downloaded and extracted into an ignored lab folder; its published SHA-1 and application signature were checked. It was launched and stopped at the Terms of Service screen requiring `I agree`. The terms were not accepted; a separate request was sent to the user. Test-site setup did not continue without a response. This is a Computer Use requirement for accepting legally binding terms, not an application access denial or a plugin defect.

Docker results do not establish coverage of native Local's nginx/PHP-FPM, router, TLS, or integrations. Subdomain multisite and third-party extensions are also outside coverage. Standalone widget 0.7.0 and its sources were not changed; previous passing lint/release/Node/browser results are not presented as reruns during this review.

PHP logs were retained and classified: Core warns about blocked external update checks and missing HTTP_HOST in CLI; WP-CLI vendors emit PHP 8.5 deprecations. Errors from two corrected helper eval commands were retained separately as test-harness errors. No new PHP warnings/fatals originating from plugin files were found. New JS tools pass `node --check`; new PHP tools pass `php -l`.

## Evidence

- [Summary JSON](review5-evidence.json): artifacts, matrix, results, new P2 issues, control using the previous candidate, rollback, and limitations.
- Complete local results: `.local/wordpress-lab/review5-compat/`.
- Tests: `tools/wordpress-lab/extended-browser.mjs`, `extended-widgets.php`, `extended-widgets.mjs`, `extended-widget-http.mjs`, `extended-fallback-seed.php`, `extended-fallback.mjs`.
- Physical ZIP replacement and database checks: `.local/wordpress-lab/review5-compat/cycle.py`; activation: `activation.py` in the same folder.

The lab was stopped after restoring the exact candidate. Databases, archives, and evidence were retained. The Local license window was left for the user's decision. Technical release approval was not granted: the two new scenarios must first be fixed, verified RED → GREEN, and followed by the affected checks.
