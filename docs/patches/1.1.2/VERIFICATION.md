# Historical verification of candidate 1.1.2 / 1ce5d1d1

**Historical report for ZIP `1ce5d1d1…`.** The P2 later found on WP 6.3.2 was fixed in the new ZIP `4f5b285c…`; see the [current verification](P2-VERIFICATION.md). The earlier results and implementation description are preserved below.

27 October 2026. **Both review issues were fixed; local checks passed. Nothing was published.**

ZIP SHA-256: `1ce5d1d1522f5a5af317c96b8edfdf636073f638a7411efedced781a80a403b1`.

## Changes

Reserialization of the entire post through `serialize_blocks()` was removed from `includes/simple-digital-clock-kses.php`. The correction changes only comments belonging to complete clock blocks. Neighboring blocks and their JSON remain byte-for-byte unchanged. Unknown attributes belonging to the clock are decoded as objects, so `{}` and objects with numeric keys do not become arrays. Incomplete or malformed blocks are not repaired automatically.

In `block.js` and the server-side correction, an existing JSON `caption` became the authoritative source. HTML is used only when the field is absent. During KSES, the original caption string is retained in the context of the specific call and restored after standard JSON filtering. Nested calls have separate contexts. Only the known text field is restored; other attributes and real HTML continue through KSES.

For older HTML Tag Processor implementations, strict escaping is limited to a single operation on the caption attribute. The temporary filter is removed through `finally`. Checks covered filter leakage, repeated saves, nested calls, identical clock HTML with different original captions, and dangerous JSON/HTML strings.

Only two product files changed relative to candidate `431b9157`: `block.js` and `includes/simple-digital-clock-kses.php`. The full patch against official 1.1.1 still contains four files: those two, `widget_init.php` and `readme.txt`. The other 11 original files are unchanged; the JavaScript widget remains at 0.7.0.

## HTML entity test clarification

Original 1.1.1 JavaScript saves the JSON string `&lt;` and HTML `caption="&lt;"`. The first is the original setting; the browser renders the second as `<`. If the HTML is changed to `caption="&amp;lt;"`, unchanged 1.1.1 considers the block invalid. This was reproduced separately with the original code.

The compatible contract therefore checks these independently:

1. Preservation of the original JSON string and editor value.
2. Preservation of the platform's previous HTML behavior.
3. Block validity and the ability to open it after returning to 1.1.1.

The previous test required both a change in HTML behavior and compatibility with the old serializer. That requirement was corrected, rather than hidden by weakening JSON verification. Build `431b9157` still has 14 failures against the clarified 136 contracts. The fixed build passes them and 12 additional contracts per site: 148/148.

In older WordPress versions, `wp_kses()` itself also normalizes numeric entities before calling `pre_kses`. The HTML test accounts for native normalization separately from JSON preservation. The patch does not change global WordPress behavior or repair the old 1.1.1 serializer.

## Matrix

| WordPress / PHP | Previous PHP | New PHP | Previous browser regression / engine | Previous rollback set / engine |
| --- | --- | --- | --- | --- |
| 7.1.3 / 8.3.35 | 464/464 | 148/148 | 33/33 | 132/132 |
| 7.1.3 / 8.4.27 | 464/464 | 148/148 | 33/33 | 132/132 |
| 6.3.2 / 8.2.12 | 464/464 | 148/148 | 33/33 | 132/132 |
| 6.8.3 / 8.3.28 | 464/464 | 148/148 | 33/33 | 132/132 |

Browser checks ran in Chromium, Firefox and WebKit. Previous PHP contracts: **1856/1856**; new contracts: **592/592**; previous browser regression: **396/396**. Separately, new resave checks passed **336/336**, reading the new scenarios after rollback passed **336/336**, and the previous rollback set passed **1584/1584**.

ESLint, release-check, 22 Node tests and 28 standalone-widget tests in each of three engines were rerun successfully. Its production bundle is unchanged: SHA-256 `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.

## Upgrade and rollback on existing posts

A fresh cycle created **112 posts** on exact official 1.1.1:

- 64 posts with the previous settings and nested group blocks, owned by Administrator/Author.
- 32 posts with plain captions, literal entities, mixed HTML-like text and the string `0`.
- 16 posts with neighboring JSON objects, unusual comment whitespace, different block ordering and unknown clock attributes.

Installing ZIP 1.1.2 did not change any of these posts. **The same IDs** were then resaved. Separate checks covered title-only changes, full Gutenberg/REST serialization, Author and Administrator saves, and ordinary `wp_insert_post()` / `wp_update_post()` calls without REST response normalization.

After resaving, only the plugin was replaced with official 1.1.1. All 14 of its files were checked against the original manifest. **The database was not restored; all 112 posts retained their contents.** Checks covered neighboring-block JSON, the old typed reader of the third-party block, caption strings, the actual editor without dirty state, the frontend and other settings. Reading the previous 64 posts was tested in America/New_York and Asia/Tokyo in all three browsers.

The same ZIP 1.1.2 was then installed again. All 112 posts remained unchanged; rereading and the actual editor passed 112/112 checks for the new set.

Native WordPress filtering for Author remains active. Some REST paths normalize JSON themselves, so preservation of other blocks' raw objects is also checked through the ordinary post API and direct reads of saved content.

## Artifacts and reproduction

- [Machine-readable evidence](verification-evidence.json): the failing earlier candidate, passing results, original and resaved IDs/content, installed-file identity and reupgrade.
- [Patch against official 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch). SHA-256: `134ba8a6bfe91bc70723739f57f88e39a5df0fc1d14796e1345464683d68f65c`.
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- [Lab instructions](../../../tools/wordpress-lab/README.md).

The patch dry-run and application to a separate copy of official 1.1.1 passed; all 15 resulting files matched the reviewed ZIP byte for byte. Previous candidates, source snapshots and reports were retained under ignored `.local/wordpress-lab/review-fix/`.

## Limits of the conclusion

One parallel read run stopped at a 20-second editor-initialization wait before content checks. A separate rerun without product changes passed 528/528; all three official 1.1.1 read sets subsequently passed as well. Both the failed attempt and successful rerun were retained in the evidence.

Native LocalWP, multisite, the PHP 7.x/8.5 functional matrix, and specific external plugins/themes were not tested. A synthetic third-party block with typed object attributes was tested. Syntax was checked with local PHP 8.5.10; this was not a PHP 8.5 runtime test.

Returning to 1.1.1 restores its original editing defects. The patch does not automatically restore markup that was already removed. Restoring posts from backup was not needed for the tested cycle.

There was no publication, Git commit/push, SVN change or change to user sites. The test lab was stopped; local files and databases were retained.
