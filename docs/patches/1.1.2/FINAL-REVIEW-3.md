# Final review of 1.1.2 after the WordPress 6.3 fix

**Historical report for `4f5b285c…`. The P2 identified below was fixed in a new local candidate; current results and artifacts are in [HTML5-VERIFICATION.md](HTML5-VERIFICATION.md). The hashes below identify the previous archive and previous diff.**

27 October 2026. The unchanged local ZIP with SHA-256 `4f5b285c30fde609edb2252f7e8be782fe59d9967be37ecbc34b6c06795a0da2` was reviewed.

**Result: changes required. One remaining P2 involving HTML5 entities in an Author caption was found. No new confirmed regressions introduced by the latest `&apos;` fix were found.**

The product code, ZIP, and diff were not changed. An independent test and report were added. Nothing was published; no Git commit/push, SVN changes, or changes to user sites were made.

## P2. Some HTML5 entities change rendering and make the block invalid

Location: `includes/simple-digital-clock-kses.php:151–173`, caption HTML processing in `pre_kses`.

Reproduction:

1. On official 1.1.1, an Administrator creates a valid post for an Author with caption `&NotEqualTilde; <clock>` using the original serializer. An HTML5 browser receives `≂̸ <clock>`; the original setting string is stored in JSON.
2. The 1.1.2 ZIP under review is installed, leaving post content unchanged.
3. The Author changes **only the title** of the same post.
4. The JSON caption is preserved, but HTML receives `caption="&amp;NotEqualTilde; &lt;clock&gt;"`. The browser now displays the literal `&NotEqualTilde; <clock>`.
5. The block parser and actual editor consider the block invalid. A full Gutenberg resave also fails to resolve the mismatch. After an actual rollback, official 1.1.1 rejects the same block; replacing the ZIP does not change database content.

Seven strings sharing the same cause were tested: `&NewLine;`, `&Tab;`, `&NotEqualTilde;`, `&CounterClockwiseContourIntegral;`, `&colon;`, `&sol;`, and `&lbrace;`, each followed by ` <clock>`. All seven fail for Author on all four configurations. Administrator passes these cases.

This is **one defect**, not seven independent errors. Standard `&apos;`, `&amp;apos;`, multiple `&amp;` layers, numeric entities, quotes, CR/LF, tabs, Unicode, and HTML-like text pass in the extended suite.

## Cause and comparison with the previous candidate

In standard `wp_kses()`, entity normalization runs **before** `wp_kses_hook()` / `pre_kses`. Some HTML5 names are absent from the KSES allowlist; the normalizer turns them into literal text. A priority-8 probe on all four sites confirmed that the ampersand has already become `&amp;` by the time the plugin handler receives it.

A separate check confirmed that `&NotEqualTilde;` and `&amp;NotEqualTilde;` become the same string after this normalization. Simply changing priority within `pre_kses` or decoding the current HTML again therefore cannot guarantee the original meaning. The correction must preserve the distinction before it is lost or use the unchanged original block setting, while preserving KSES safety and the existing 1.1.1 reading format.

Exact previous ZIP `1ce5d1d1…` was installed in the lab and tested on **separate copies** of the original posts. The same seven strings fail there as well. On WP 6.3, the older `&apos; <clock>` case also fails; the current ZIP already fixes it. The P2 was therefore not introduced by the latest native lexer change; it had remained outside the previous test suites.

The main 136 posts were unchanged during the comparative control. The current ZIP was then restored and checked byte for byte before a separate rollback to official 1.1.1.

## Results

| Configuration | PHP, all existing suites | Existing browser regression / engine | Extended captions / engine | Official 1.1.1 reading these captions / engine |
| --- | --- | --- | --- | --- |
| WP 7.1.3 / PHP 8.3.35 | 630/630 | 33/33 | **345/374** | **345/374** |
| WP 7.1.3 / PHP 8.4.27 | 630/630 | 33/33 | **345/374** | **345/374** |
| WP 6.3.2 / PHP 8.2.12 | 630/630 | 33/33 | **345/374** | **345/374** |
| WP 6.8.3 / PHP 8.3.28 | 630/630 | 33/33 | **345/374** | **345/374** |

Checks ran in Chromium, Firefox, and WebKit. The extended suite was saved using Chromium; Firefox/WebKit independently read the results. The main suite was resaved in all three engines. The extended suite contains 46 caption types for two roles, with one composite post per role and site. The 29 failed assertions per site are seven cases × four assertions after title-only/full save, plus an actual editor check. All original JSON captions were preserved.

The following passed again:

- **2520/2520** PHP checks: 1856 original, 592 from the previous review, and 72 raw-caption checks.
- **396/396** existing browser checks.
- **480/480** resaves/checks of the main caption suite; **504/504** checks of that suite after rollback.
- **1584/1584** existing rollback checks: all settings, nested blocks, two time zones, and three engines.
- Raw metadata of neighboring blocks: **68/68** during save, **32/32** after rollback.
- **168/168** checks after reupgrade.
- Lint, release-check, **22/22** Node tests, and **84/84** browser tests for the standalone widget.

The latest `&apos; <clock>` fix passes on WP 6.3.2 for Author with both the current reader and the official older reader. The new HTML5 entity suite returns **1380/1496** per engine with both readers.

## Upgrade, rollback, and artifacts

The fresh cycle contains **136 original IDs**: 128 posts from existing suites and eight composite posts from the new entity suite. All were created on exact official 1.1.1; its 14 files were checked against the manifest.

After 1.1.2 was installed, original content remained unchanged: 128 posts were checked by direct database reads before resaving, and another eight through REST `content.raw` immediately before each post's first save. The same IDs were resaved. After rollback, all 136 posts were byte-identical to the snapshot taken after saving with the candidate. The database was not restored.

The main suite of 128 posts passes in the old editor. The new suite confirms the P2 described here: HTML changes during Author save, and rolling back the ZIP does not repair it. After reupgrade, all 136 posts remain unchanged again; the installed plugin's 15 files match the current ZIP.

- [Machine-readable evidence](review3-evidence.json): product identity, results, original/resaved IDs, comparison with the previous candidate, KSES normalization order, actual rollback, and file checks.
- [Independent browser test](../../../tools/wordpress-lab/review3-captions.mjs).
- [Verified diff](simple-digital-clock-1.1.1-to-1.1.2.patch), SHA-256 `98e5afeda9c8d895a78b28f0dd90a9b54e866ef690ca910d080617457bd87d3c`.
- [Lab instructions](../../../tools/wordpress-lab/README.md).

A dry run and application of the diff to a separate copy of official 1.1.1 passed; all 15 resulting files match the ZIP. Standalone bundle 0.7.0 is unchanged, SHA-256 `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.

In the prepared lab with the original snapshot retained, repeat the control on independent copies:

```bash
node tools/wordpress-lab/review3-captions.mjs control fresh-phase chromium
```

For the ZIP reviewed here, exit code 1 is expected. In a new source lab, first run `seed baseline` with official 1.1.1; the scenario refuses to overwrite evidence. Key commands from this run are preserved in the JSON report.

## Limitations

Native LocalWP, multisite, PHP 7.x/8.5 runtime, and specific third-party plugins/themes were not tested. A synthetic third-party block with typed object attributes was tested. The cause of the original LocalWP user review remains unknown; this P2 is not presented as its explanation.

Apart from the P2 described here, no new confirmed problems were found in the tested scenarios. These checks do not provide a complete guarantee for every valid string or third-party extension. Passing the previous tests proved insufficient to establish coverage of all HTML5 entities.

Nothing was published. The lab was stopped; its files, posts, databases, and results were retained. Product code, ZIP, and diff were left unchanged for a separately approved correction.
