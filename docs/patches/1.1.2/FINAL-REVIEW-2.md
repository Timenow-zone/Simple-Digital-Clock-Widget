# Historical follow-up review of 1.1.2 / 1ce5d1d1

**Update:** the P2 described here was fixed in ZIP `4f5b285c…`; new and existing tests passed. [Current report](P2-VERIFICATION.md). The original review of the previous archive is preserved below.

27 October 2026. The unchanged ZIP with SHA-256 `1ce5d1d1522f5a5af317c96b8edfdf636073f638a7411efedced781a80a403b1` was reviewed.

**Result: changes required. One remaining P2 was found: caption HTML semantics and block validity are broken on WordPress 6.3.2.**

The product sources and ZIP were not changed. Independent tests and this report were added. Nothing was published; no Git commit/push, SVN changes, or changes to user sites were made.

## P2. An Author save with `&apos; <clock>` makes a valid block invalid

Location: `includes/simple-digital-clock-kses.php:153–155`, inside `SDCW_prepare_clock_post_html()`.

Verified scenario:

1. On official 1.1.1, a valid block with caption `&apos; <clock>` was created in a post owned by an Author.
2. The plugin was upgraded using the same 1.1.2 ZIP under review.
3. The Author changes **only the title** of the same post.
4. The JSON caption remains unchanged, but HTML changes from `caption="&apos; <clock&gt;"` to `caption="&amp;apos; &lt;clock&gt;"`.
5. Rendering changes from `' <clock>` to the literal `&apos; <clock>`. Both `wp.blocks.parse()` and the actual editor report `isValid: false`.

The same existing ID was retained throughout. Both the current JS and unchanged 1.1.1 JS reject the result. A separate actual rollback to official 1.1.1 on posts from the new suite also confirmed the error in all three browsers; replacing the ZIP did not change database content.

This scenario passes on WordPress 6.8.3 and 7.1.3. On WordPress 6.3.2 it passes for Administrator and fails for Author. Checks also pass for `&apos;` without `<`, `&lt; <clock>`, and `&amp;apos; <clock>`. This is therefore not general JSON corruption or a failure affecting all entity strings.

## Cause and chronology

On WordPress 6.3.2, `WP_HTML_Tag_Processor::get_attribute()` uses `html_entity_decode($raw_value)` with HTML 4.01 behavior: `&apos;` is not converted to an apostrophe. The returned string still contains `&apos;` and `<`, so the patch applies strict escaping again. The ampersand becomes `&amp;`, changing the attribute's meaning in an HTML5 browser.

On WordPress 6.8/7.1, the native decoder returns an actual apostrophe, so the operation preserves semantics. A separate comparison of the actual HTML Tag Processors on all four sites confirmed this.

A control run using previous ZIP `431b9157` shows the same defect for Author on 6.3.2. It is therefore **not attributed to the two latest fixes**: it is a remaining compatibility case that earlier scenarios did not cover. The previous fixes preserving neighboring JSON and the original JSON caption continue to pass.

This error affects the local candidate. The cause of the original LocalWP review remains unknown; this case is not presented as its explanation.

## Required correction

Obtain the attribute's HTML5 value correctly on supported older WordPress versions before strict escaping. Preserve the distinction between `&apos;` and `&amp;apos;`: decoding an already processed string again can break the second case. Changing only the output flags of `htmlspecialchars()` does not fix incorrectly decoded input.

The added expectations come from the DOM of a valid block created by the original 1.1.1 JS, not from the patch's PHP decoder. They should remain mandatory, and the suite should pass without changing the expected HTML behavior.

## Results

| Configuration | New Chromium suite, both roles | Existing PHP | Extended PHP | Existing Chromium |
| --- | --- | --- | --- | --- |
| WP 7.1.3 / PHP 8.3.35 | 42/42 | 464/464 | 148/148 | 33/33 |
| WP 7.1.3 / PHP 8.4.27 | 42/42 | 464/464 | 148/148 | 33/33 |
| WP 6.3.2 / PHP 8.2.12 | **39/42** | 464/464 | 148/148 | 33/33 |
| WP 6.8.3 / PHP 8.3.28 | 42/42 | 464/464 | 148/148 | 33/33 |

The three failures on 6.3.2 are three assertions for one defect: the original HTML value, saved block validity, and the actual editor. JSON values were preserved for all 40 posts in the new suite.

Firefox and WebKit also returned 39/42 on 6.3.2. After an actual rollback to official 1.1.1, Chromium, Firefox, and WebKit returned the same 39/42. Post content remained byte-identical throughout these read checks.

The existing 1856/1856 PHP checks, 592/592 extended PHP checks, and 132/132 existing Chromium checks passed again. All 112 posts from the previous acceptance cycle remained unchanged. Their earlier passing result is valid for that dataset, which did not include the mixed caption `&apos; <clock>`.

No other confirmed defects were found in the new scenarios. This does not establish full compatibility with every third-party plugin or every valid string.

## Evidence and reproduction

- [Machine-readable evidence](review2-evidence.json): results, the original and modified post with the same ID, decoder comparisons, the previous candidate, actual rollback, and file identity.
- [New test](../../../tools/wordpress-lab/review2-entities.mjs).
- [Immutable inputs from the original serializer](../../../tools/wordpress-lab/fixtures/review2-entities.json).
- Local screenshots of the actual editor: `.local/wordpress-lab/review2/current-candidate-chromium-wp63-author.png` and `current-official111-chromium-wp63-author.png`.

In the prepared lab with the candidate under review, run from the repository root with a fresh run name:

```bash
node tools/wordpress-lab/review2-entities.mjs save fresh-review candidate chromium all
```

For previous ZIP `1ce5d1d1…` reviewed here, exit code 1 and three failed assertions on `wp63` are expected. Fixed ZIP `4f5b285c…` passes the suite. Subsequent reads do not resave content:

```bash
node tools/wordpress-lab/review2-entities.mjs read fresh-review candidate firefox wp63
node tools/wordpress-lab/review2-entities.mjs read fresh-review candidate webkit wp63
```

The tests refuse to overwrite snapshots. Setup, version, and shutdown rules are in the [lab instructions](../../../tools/wordpress-lab/README.md).

## State and limitations

After the comparisons, all four lab sites were restored to the exact ZIP under review, and all 15 files were checked. The product sources and ZIP remain identical to their state at the start of the review.

Native LocalWP, multisite, PHP 7.x runtime, and specific external plugins/themes were not tested. The defect finding is based on actual WP 6.3.2 / PHP 8.2.12; it is not extrapolated to untested combinations.

The candidate reviewed here requires this P2 to be fixed before final readiness. Nothing was published. Lab data and snapshots were retained.

Test containers and the dedicated network were stopped and removed through compose down; local files and databases were retained.
