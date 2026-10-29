# HTML5 entity fix — local candidate 1.1.2

**Historical acceptance of named HTML5 entities for `4c62efe3…`. The subsequent [review](FINAL-REVIEW-4.md) found two numeric P2 issues, which have now also been fixed. Current acceptance of the new ZIP is in [NUMERIC-VERIFICATION.md](NUMERIC-VERIFICATION.md). Results below refer to the previous archive and a narrower fixture suite.**

27 October 2026. **The remaining P2 was fixed. New and existing local checks passed. Nothing was published.**

ZIP SHA-256: `4c62efe3ae3a935a88686e354e405169cd3495e4dab45dd8b27634c08f21e880`.
Diff SHA-256: `25c6242ecabfc3fdcb00ba34f5f48663d06793827f8766d140782adfdade378b`.

## Reproduction and change

Previous candidate `4f5b285c…` corrupted HTML caption `&NotEqualTilde; <clock>` during Author save, including a title-only change: the browser received the literal entity name and the block became invalid. Standard KSES normalizes entities before `pre_kses`, so changing priority within the previous handler cannot prevent the original meaning from being lost.

Before the product was changed, an independent suite of 46 native captions returned **1380/1496**, with 116 failed assertions. The complete suite of 8500 HTML5 variants produced **14976 DOM mismatches** across four configurations. These baseline results were retained; expectations for the full suite were unchanged.

One product file changed relative to `4f5b285c…`: [`includes/simple-digital-clock-kses.php`](../../../wordpress/simple-digital-clock/includes/simple-digital-clock-kses.php).

- In standard `content_save_pre`, `excerpt_save_pre`, and `content_filtered_save_pre` at priority 8, only the clock's `caption` attribute is processed, and only when `wp_filter_post_kses` is installed.
- Named HTML5 references unsupported by KSES are converted to numeric references before their original value is lost. A single pass preserves the distinction between `&Name;`, `&amp;Name;`, and `&amp;amp;Name;`. The native WordPress lexer determines the attribute's position.
- Backslashes are protected against changes during repeated KSES saves. Numeric Unicode representation is re-established in `wp_insert_post_data` because newer Core may serialize it back to Unicode.
- This allows ASCII entities containing non-BMP characters to be saved in older `utf8mb3` columns. An intermediate version that emitted Unicode for `&Afr;` did fail this check; the final ZIP passes it. Existing C1 controls are preserved without HTML5 numeric remapping.

Original caption text in JSON, object types in unknown metadata, and neighboring blocks are preserved. KSES continues to remove dangerous HTML attributes and unknown dangerous JSON values. Global KSES and attribute-escaping rules are not broadened. The 1.1.1 format remains readable; there is no bulk database migration. Standalone widget bundle 0.7.0 was not changed.

## Final ZIP checks

| WordPress | PHP | Existing PHP checks | New PHP checks | Full HTML5 DOM suite per engine | Native captions during save per engine |
| --- | --- | --- | --- | --- | --- |
| 7.1.3 | 8.3.35 | 630/630 | 200/200 | 8500/8500 | 542/542 |
| 7.1.3 | 8.4.27 | 630/630 | 200/200 | 8500/8500 | 542/542 |
| 6.3.2 | 8.2.12 | 630/630 | 200/200 | 8500/8500 | 542/542 |
| 6.8.3 | 8.3.28 | 630/630 | 200/200 | 8500/8500 | 542/542 |

Total: **3320/3320 PHP assertions**: 2520 existing checks, 772 new checks through actual post updates, 12 checks of the complete save pipeline, and 16 checks using a temporary `utf8mb3` table. Actual site tables were not changed for the charset test.

The complete HTML5 suite contains **2125 names ending in `;`**, each with three quoted representation layers and an unquoted variant. Expected values come from the browser DOM of the original HTML, independently of the PHP implementation. **102000/102000 comparisons** passed: four configurations × three engines × 8500 variants. Repeated-save stability was also checked.

The extended native suite contains all 46 existing captions plus 21 variants, including literal layers of problematic names, `&bsol;`, uppercase forms, and HTML-like text. **6504/6504** assertions passed during save and **6504/6504** when read by official 1.1.1. Both roles, title-only/full saves, original JSON, DOM, and the actual editor are checked.

The following also passed:

- **396/396** original browser checks; **504/504** checks of the existing `&apos;` suite during save and **504/504** after installing 1.1.1.
- Main caption suite: **480/480** during resave, **504/504** after rollback.
- Existing rollback checks: **1584/1584**, covering all settings, nested blocks, and two time zones.
- Neighboring metadata: **68/68** during save, **32/32** after rollback.
- Reupgrade: **168/168** for the main suite and **2168/2168** for the extended suite.
- Standalone widget: lint, release-check, **22/22** Node tests, **84/84** browser tests; PHP/JS syntax checks.

## Upgrade and rollback without a database restore

A new suite of **136 posts** was created on the exact official 1.1.1 ZIP: 64 existing scenarios, 48 captions, 16 metadata cases, and eight composite HTML5 posts. There are 34 unique IDs per configuration.

Cycle: **1.1.1 → final 1.1.2 → resave the same IDs → official 1.1.1 → the same 1.1.2**. Captions were resaved in Chromium, Firefox, and WebKit; resulting raw content matches between engines. The database was not restored, and original post content was not reset.

Direct database reads confirm byte identity of all 136 posts after upgrade before resaving, after replacing the ZIP with 1.1.1, after reads in the old editor, and after reupgrade. The installed 14 files of official 1.1.1 and 15 candidate files were checked against original manifests at every stage. Rollback restores the original 1.1.1 editing errors; the check confirms that new saves remain compatible with the old reader's storage format.

A dry run and actual application of the full diff to a separate copy of official 1.1.1 passed. All 15 resulting files match the sources and ZIP. CRLF line endings in official `readme.txt` were preserved.

## Environment and verification limits

Chromium 151.0.7922.34 and WebKit 26.5 ran on macOS arm64; Firefox 153.0 ran in official `mcr.microsoft.com/playwright:v1.62.1-noble` through a loopback WebSocket. Client and image versions match. The [supported Playwright remote server](https://playwright.dev/docs/docker) was used with a [restricted loopback tunnel](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-option-expose-network).

Native Firefox on this Mac stopped launching before assertions could run; checks were repeated in the specified container without disabling system protection. An attempt to run WTR inside Linux with macOS `node_modules` stopped because the platform-specific Rollup package was missing; the successful WTR run uses host dependencies and the same remote Firefox. Test assertions were unchanged.

An intermediate browser run accidentally overlapped baseline installation. Its results were excluded from acceptance. The final cycle ran sequentially, with files checked after every installation; intermediate ZIPs, failed logs, and reruns were retained separately.

A separate control on exact 1.1.1 confirmed an existing Core 6.3/6.8 serializer limitation: a raw trailing `\` can produce invalid JSON before plugin filters run. New fixtures are checked for validity before save; a trailing backslash is represented by valid `&bsol;`. Unknown JSON keys/values containing internal `\` pass. This patch does not change the general WordPress serializer.

Standard Core save pipelines were tested. Native LocalWP, multisite, PHP 7.x/8.5 runtime, and specific third-party plugins/themes were not tested; local PHP 8.5 was used only for syntax checks. The cause of the original user review remains unknown. No new regressions or backward-compatibility failures were found in the tested scenarios; this is not a universal guarantee for third-party code.

## Artifacts

- [Machine-readable evidence](html5-verification-evidence.json): input/output hashes, results of all accepted runs, 136 IDs, and raw-content comparisons.
- [Full diff against 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch).
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- [Lab instructions and commands](../../../tools/wordpress-lab/README.md).
- Complete local results: `.local/wordpress-lab/entities-final/`; full entity pipeline: `.local/wordpress-lab/entities-fix/*accepted*` and `charset-green.json`.

Nothing was published; no commit/push or SVN writes were made. User sites were not changed. Isolated containers were stopped; databases, posts, images, ZIPs, and logs were retained.
