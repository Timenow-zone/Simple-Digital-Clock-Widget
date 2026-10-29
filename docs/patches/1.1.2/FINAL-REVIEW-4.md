# Final review of 1.1.2 after the HTML5 entity fix

**Historical report for `4c62efe3…`. Both P2 issues described below were fixed in a new local candidate. Current acceptance results and new artifacts are in [NUMERIC-VERIFICATION.md](NUMERIC-VERIFICATION.md). The hashes and results below identify the previous ZIP and previous diff.**

27 October 2026. Unchanged ZIP `4c62efe3ae3a935a88686e354e405169cd3495e4dab45dd8b27634c08f21e880` and diff `25c6242ecabfc3fdcb00ba34f5f48663d06793827f8766d140782adfdade378b` were reviewed.

**Result: changes required. Two remaining P2 issues involving numeric entities were found. No new confirmed regressions introduced by the latest named HTML5 entity fix were found. Both new scenarios also reproduce on exact previous candidate `4f5b285c…`.**

The product code, ZIP, and diff were not changed. Independent tests and this report were added. Nothing was published; no Git commit/push, SVN changes, or changes to user sites were made.

## P2. Literal numeric entities lose an escaping layer on WP 6.3/6.8

Location: `includes/simple-digital-clock-kses.php:199–205`, caption protection before Core KSES.

The native serializer creates a valid block with caption `&amp;#34; <clock>`. JSON stores that original string, HTML contains `caption="&amp;#34; <clock>"`, and the browser receives the literal `&#34; <clock>`.

After an Author **title-only update** on WP 6.3.2 and 6.8.3:

```text
JSON caption: &amp;#34; <clock>      (preserved)
HTML caption: &#034; &lt;clock&gt;
DOM caption:  " <clock>             (changed)
block.isValid: false
```

`&amp;#13; <clock>` and `&amp;#x1F552; <clock>` fail in the same way. In the latter case, the literal `&#x1F552;` becomes a clock character. Two layers, `&amp;amp;#…;`, pass in the current suite; one layer is lost.

The cause was confirmed without loading the plugin: older `wp_kses_normalize_entities()` first restores named `&amp;`, then restores the resulting numeric reference in the same pass. For example, `wp_kses_normalize_entities('&amp;#34;')` returns `&#034;`. The current preparatory callback handles only individual named references and leaves `&amp;` unchanged, so its protection of literal layers does not cover numeric references. These three cases pass on WP 7.1.3.

Literal numeric references must be protected before their escaping layer is lost, while preserving original JSON and standard filtering of the remaining HTML. Regression tests must distinguish `&#34;`, `&amp;#34;`, `&amp;amp;#34;`, and equivalent hexadecimal forms.

## P2. Numeric CR becomes LF and breaks validation on WP 7.1

Locations: `includes/simple-digital-clock-kses.php:146` and `:298–303`, final caption encoding after KSES.

Valid native captions `&#13; <clock>` and `&#xD; <clock>` produce a DOM string containing U+000D (CR). After an Author **title-only update** on both WP 7.1.3/PHP configurations, Core serializes the reference as raw `\r` inside the HTML attribute. During the next browser HTML parse, the input CR is normalized to U+000A (LF).

```text
JSON caption: &#13; <clock>          (preserved)
HTML caption: <literal CR> &lt;clock&gt;
DOM before:   U+000D + " <clock>"
DOM after:    U+000A + " <clock>"
block.isValid: false
```

The current post-data guard runs only when bytes above ASCII are present, and `encode_caption_unicode()` handles only U+00A0 and above. The ASCII CR returned by Core remains raw. On WP 6.3.2/6.8.3, numeric CR values remain references and these two cases pass.

A control without the plugin using an ordinary `<p title="&#13;">` confirms the same raw CR in Core 7.1 output. This is not a side effect of the latest HTML5 fix, but the candidate still violates the valid static-block contract. Numeric CR semantics must be preserved, with separate checks for raw CR/LF so the next correction does not change their existing HTML behavior.

## Confirmation and results

The new fixtures contain 12 native captions, two roles, and two composite posts per site. All original blocks are valid; Administrator save leaves them byte-identical. Original raw content is identical for Administrator/Author. After Author update, JSON remains unchanged and only HTML semantics change. The actual Gutenberg editor reports an invalid block. Firefox and WebKit confirm the Chromium result.

| Configuration | Existing PHP contracts, including HTML5 | New native suite | Failing Author cases | Older 1.1.1 reader |
| --- | --- | --- | --- | --- |
| WP 7.1.3 / PHP 8.3.35 | 830/830 | **22/24** | decimal/hex CR | the same two cases |
| WP 7.1.3 / PHP 8.4.27 | 830/830 | **22/24** | decimal/hex CR | the same two cases |
| WP 6.3.2 / PHP 8.2.12 | 830/830 | **21/24** | three literal numeric entities | the same three cases |
| WP 6.8.3 / PHP 8.3.28 | 830/830 | **21/24** | three literal numeric entities | the same three cases |

The new suite counts blocks that retain validity, original JSON, and DOM value together. Total: **86/96**, with ten failing cases. The actual editor was also checked for each role: Administrator passes, while Author receives invalid content. Read checks do not resave posts or attempt to repair them.

Exact previous ZIP `4f5b285c…` was physically installed on four sites. Its 15 files match the retained original manifest. The same numeric scenarios fail on independent fresh copies. The current ZIP already fixes named `&NewLine;`, `&AMP;…`, and `&NotEqualTilde;…` cases that failed previously. The new findings share a Core-related origin, but involve two different mechanisms and require two separate corrections.

An additional comparison of 1629 boundary HTML inputs ran in all three browsers: combinations of references with neighboring text, decimal/hex forms, quotes, backslashes, Unicode, and control characters. **There are no new degradations compared with `4f5b285c…`**, including repeated save. These results do not mean that all 1629 inputs preserve their original DOM: some intentionally test standard Core cleanup (NUL, prohibited controls, surrogate references, etc.), while others reveal the remaining numeric cases described here. Complete differences were retained rather than filtered out of the evidence.

The following passed again on the exact current ZIP:

- **3320/3320** PHP assertions, including existing tests, new post updates, the full named-entity pipeline, and `utf8mb3`.
- **102000/102000** DOM comparisons of the complete named HTML5 entity suite.
- **396/396** existing browser checks.
- **6504/6504** checks of the existing 67-caption suite by official 1.1.1 in three engines after an actual rollback.
- **2168/2168** checks of the same suite after reupgrade.

Standalone bundle 0.7.0 was not changed. Its previous lint, release-check, Node, and browser results were retained; they were not rerun in this review because the sources and bundle were unchanged.

## Backward compatibility and data identity

The 136 retained posts from the previous full cycle were not reset. This review added 16 separate native posts: an initial set of eight and an extended set of eight. This gives **152 IDs** for direct database checks. New posts were created by the current candidate's valid native serializer; unchanged Administrator copies are also valid when read by official 1.1.1.

Order: current candidate → comparative `4f5b285c…` with independent copies → official **1.1.1** → the same current **1.1.2**. Physical plugin files and byte identity of all 152 posts were checked after every replacement. The database was not restored. Content also remained unchanged after reads in the old editor.

The previous 136 posts pass the old reader. New numeric scenarios show why full compatibility cannot be claimed: incorrect HTML already written remains incorrect after rollback, and 1.1.1 rejects the corresponding blocks as well. Replacing the ZIP does not repair post content. The cause is caption save semantics, not a new JSON format or database migration.

After verification, the exact current candidate was restored; sources, ZIP, and diff were left unchanged. The lab was stopped; databases, fixtures, the previous ZIP, and all results were retained.

## Artifacts and reproduction

- [Machine-readable evidence](review4-evidence.json): results, source/ZIP/diff hashes, Core controls, comparison with the previous candidate, rollback/reupgrade, and 152 IDs.
- [Native test](../../../tools/wordpress-lab/review4-native.mjs).
- [PHP boundary test](../../../tools/wordpress-lab/review4-boundaries.php), [independent DOM comparator](../../../tools/wordpress-lab/review4-boundaries.mjs).
- [Core-only control](../../../tools/wordpress-lab/review4-core.php).
- Complete local results: `.local/wordpress-lab/review4/`.

In the prepared isolated lab with this ZIP, create independent copies using a fresh phase:

```bash
node tools/wordpress-lab/review4-native.mjs save fresh-numeric-review chromium
```

Exit code **1** is expected, with the ten failing blocks described above across four configurations. The script refuses to overwrite evidence; each fresh run creates its own fixture posts. Run only in the Clock lab. For Firefox, the retained official Playwright image and loopback remote server are available as described in the [instructions](../../../tools/wordpress-lab/README.md).

Native LocalWP, multisite, functional PHP 7.x/8.5 runtime, and specific third-party extensions were not tested. The original cause of the user review remains unknown. Named HTML5 entity acceptance remains valid for its dataset; it did not cover the CR references and literal numeric entities added here.
