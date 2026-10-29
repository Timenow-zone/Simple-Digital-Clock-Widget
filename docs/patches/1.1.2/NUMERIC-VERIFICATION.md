# Numeric entity fix — local candidate 1.1.2

**Historical numeric acceptance of ZIP `977c5603…`. Two other P2 issues found by a later extended review were fixed in `834b1757…`. Current full verification is in [WIDGET-FALLBACK-VERIFICATION.md](WIDGET-FALLBACK-VERIFICATION.md); the original numeric results below are retained.**

28 October 2026. **Both P2 issues were fixed. New and existing local checks passed; upgrade and rollback to 1.1.1 were confirmed without restoring the database. Nothing was published.**

ZIP SHA-256: `977c560321b565ddfbc66aa4d5dd2c32381779751c756106c2c317e2fd6d6bbb`.
Diff SHA-256: `1f3e448f56d42c704574354cc1ce16446c81c59097a00961d8fff9f2813c7c0c`.

## Fix and reproduction before the change

Previous ZIP `4c62efe3…` and its sources were retained separately. Before the product was changed, the new PHP suite returned **1678/1840**, with 162 failed assertions across four configurations. It tests 27 cases through actual post updates, including `post_content`, `post_excerpt`, `post_content_filtered`, original JSON, security, and repeated save.

The previous review's native suite returned **86/96** blocks: WP 6.3/6.8 lost the literal `&amp;#…;` layer, while WP 7.1 changed numeric CR to LF. The same suite passes **96/96** after the fix, with the actual editor valid.

One product file changed relative to `4c62efe3…`: [`includes/simple-digital-clock-kses.php`](../../../wordpress/simple-digital-clock/includes/simple-digital-clock-kses.php). The correction is limited to the clock's `caption` in the standard Core save pipeline:

- Before KSES, a literal ampersand preceding numeric syntax is protected with numeric `&#38;`. Older Core no longer expands the following numeric reference. Decimal/hex forms, leading zeros, uppercase forms, and multiple literal layers are preserved.
- Raw CR/CRLF are normalized to LF before KSES, matching the original HTML parse. Numeric CR remains a reference at this stage.
- CR serialized by Core 7.1 after decoding a numeric reference is encoded back to a numeric reference in `wp_insert_post_data`. The ASCII guard accounts for CR. Raw CR and numeric CR therefore retain their different original DOM values.

Named HTML5 entities, backslashes, and `utf8mb3` continue to work. JSON caption retains the original string. Unknown metadata and neighboring blocks follow the existing filtering; KSES removes dangerous attributes. Global KSES policy, the general WordPress serializer, and standalone widget 0.7.0 were not changed. There is no database migration or bulk rewriting of old posts.

## Correction of one existing test oracle

In `final-review.php`, one expectation was computed using `wp_kses_normalize_entities($html)`. For double-escaped numeric references on WP 6.3/6.8, it therefore expected the same Core defect that the fix needs to correct.

The oracle was replaced with the fixture's original DOM value: this fixture explicitly escapes every ampersand through `htmlspecialchars(..., true)`, so the original caption string is expected after one HTML decode. Assertion counts and strictness were preserved. The control for ordinary neighboring HTML still uses standard KSES.

The corrected oracle was run separately against exact previous PHP code `4c62efe3…`: **590/592**, with one reproduction on each of WP 6.3/6.8. With the fix: **592/592**. Independent browser expectations for the original fixtures were unchanged; the extended suite obtains its DOM oracle from a valid 1.1.1 original.

## Final ZIP results

| WordPress | PHP | All PHP assertions | Named HTML5 / engine | Literal numeric / engine | Native captions / engine |
| --- | --- | --- | --- | --- | --- |
| 7.1.3 | 8.3.35 | 1295/1295 | 8500/8500 | 9684/9684 | 774/774 |
| 7.1.3 | 8.4.27 | 1295/1295 | 8500/8500 | 9684/9684 | 774/774 |
| 6.3.2 | 8.2.12 | 1295/1295 | 8500/8500 | 9684/9684 | 774/774 |
| 6.8.3 | 8.3.28 | 1295/1295 | 8500/8500 | 9684/9684 | 774/774 |

**5180/5180 PHP assertions**: 3320 existing checks, 1840 new post-save checks, and 20 literal numeric pipeline/charset checks. All three save fields, repeated saves, original JSON, and ordinary Core controls were checked. Charset tests use temporary `utf8mb3` tables without changing the actual site schema.

**218208/218208 browser DOM comparisons** passed in Chromium, Firefox, and WebKit:

- 102000: the full set of 2125 named HTML5 references with literal layers and unquoted variants.
- 116208: 9684 literal numeric variants per configuration/engine: code points 0–255 and 13 boundaries covering BMP, surrogate/noncharacter, astral, and out-of-range values; four decimal/hex forms, three escaping layers, and three quote/attribute types. Invalid numeric values here are literal text, not decoded controls.

Expectations come from the browser DOM of the original HTML, independently of the PHP decoder. Byte stability of the second save and exact storage of the ASCII representation on `utf8mb3` were checked.

An independent existing suite of 1629 boundary inputs across four configurations in three engines found no new degradation or repeated-save instability compared with `4c62efe3…`. Remaining differences from the original DOM follow existing Core policy for invalid/control input and are not presented as fully preserved inputs. Complete results were retained.

The following also passed:

- **396/396** existing browser checks; **504/504** checks of the existing `&apos;` suite during save and **504/504** on official 1.1.1.
- Main caption suite: **480/480** during save, **504/504** after rollback, and **168/168** after reupgrade.
- Extended suite: **9288/9288** during save, **9288/9288** when read by official 1.1.1, and **3096/3096** after reupgrade.
- Existing settings/nested blocks/two time zones: **1584/1584** checks by the old reader.
- Neighboring metadata: **68/68** during save, **32/32** after rollback.
- Standalone widget: lint, release-check, **22/22** Node tests, and **84/84** browser tests. Bundle SHA-256 remains `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.

## Fresh upgrade and rollback cycle

**136 new posts** were created on exact official 1.1.1: 64 existing scenarios, 48 captions, 16 metadata cases, and eight composite posts from the extended suite. There are 34 unique IDs per configuration. The extended suite contains all 67 previous captions plus 29 numeric/newline scenarios, totaling **96 caption types** for two roles.

Cycle: **1.1.1 → this 1.1.2 ZIP → title-only/full saves of the same IDs → official 1.1.1 → the same 1.1.2 ZIP**. Captions were resaved by each of the three engines; final raw content matches between them. The database was not restored, and original posts were not reset.

Direct database reads confirm byte identity of all 136 posts at every upgrade/rollback and after reads by the old editor. The original 14 files of official 1.1.1 and 15 candidate files were checked after every installation. The old reader accepts all new saves, including both previous P2 cases.

Rollback restores the original 1.1.1 editing errors; compatibility was tested as correct reading of new saves by the old version. Posts already damaged by earlier test candidates are not used as valid originals or repaired in bulk: they are retained separately as RED evidence.

A dry run and application of the full diff to a separate copy of 1.1.1 produce the same 15 files as the sources and ZIP. CRLF line endings in `readme.txt` were preserved.

## Artifacts and limits

- [Machine-readable evidence](numeric-verification-evidence.json): RED/GREEN, correction of the old oracle, source/ZIP/diff hashes, IDs, snapshots, actual 1.1.1 readers, and cleanup.
- [Full diff against 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch).
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- [New post-save tests](../../../tools/wordpress-lab/numeric-caption-save.php), [numeric pipeline](../../../tools/wordpress-lab/numeric-entity-pipeline.php), [96 native captions](../../../tools/wordpress-lab/review3-captions.mjs).
- Complete local results and sequential runner: `.local/wordpress-lab/numeric-fix/`.

Chromium/WebKit ran on macOS arm64; Firefox ran in the retained official Playwright 1.62.1 Linux arm64 image through a loopback WebSocket, as in the previous review. System protection was not disabled.

Native LocalWP, multisite, functional PHP 7.x/8.5 runtime, and specific third-party plugins/themes were not tested. Host PHP 8.5 was used only for syntax checks. The previously established Core 6.3/6.8 limitation involving a raw trailing backslash in JSON was unchanged; valid `&bsol;` and internal backslashes are covered by tests. The cause of the original user review remains unknown.

No new regressions or backward-compatibility failures were found in the tested scenarios. Nothing was published; no commit/push or SVN writes were made. User sites were not changed. The lab was stopped; data, images, and logs were retained.
