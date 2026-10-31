> Historical preparation report for rejected ZIP `9e02646f4cbfea322bb5dd5376d39df7afc787c6e34f659db80441c92598b8c1` at commit `4bc261ee9c8841f122e0206c7358175e98a460fd`. Native author tests and independent acceptance later returned NO-GO for literal-entity caption changes. Original relative links describe that earlier preparation stage; see the [preserved manifest](manifest-before-entity-regression-fix.json), [independent result](independent-before-entity-regression-fix.json), and current [release report](README.md).

# WordPress 1.1.4 candidate: minimum-Core compatibility and dependency notices

Status: **corrective candidate prepared; native author verification, required PR CI and independent reacceptance pending; not published**. This revision addresses the independent NO-GO for the earlier requirements candidate. Plugin version remains **1.1.4**, minimum requirements remain **WordPress 6.3 / PHP 7.0**, and the shared widget remains **0.8.1**.

## Exact candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-compatibility-candidate.zip`; **64,020 bytes**, **16 installable files**.
- ZIP SHA-256: `9e02646f4cbfea322bb5dd5376d39df7afc787c6e34f659db80441c92598b8c1`.
- [Manifest](manifest.json), [package preflight](preflight-evidence.json), and [acceptance status](acceptance-evidence.json).
- Widget: **0.8.1**, **36,009 bytes**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Widget source commit: `b44f944b60babf45bf266e73ba12f7eba53cfef2`; widget bytes remain identical to `dist/0.8.1.min.js`. This WordPress-only correction does not rebuild or redeploy the shared runtime or change its dependencies.

Only `block.js`, `includes/simple-digital-clock-kses.php` and `readme.txt` change relative to the requirements candidate, with one new file, `THIRD-PARTY-NOTICES.txt`. The other twelve files, including the main PHP requirements, wrapper GPL license, POT and production widget, remain byte-identical. The complete manifest is authoritative.

## Independent blockers and corrections

The [preserved independent result](independent-before-acceptance-fixes.json) returned **NO-GO** for ZIP `fedc54bc0600db1236270733724b108a41919f398008b6ee902eeee4ac17ed00` at commit `9a84e74cec67b112af2bd0f02aab29b653308266`. Its passing checks do not certify this new artifact.

### Bundled dependency notices

The installable package now includes the complete, exact upstream MIT copyright and permission notices for Preact **11.1.0**, preact-custom-element **4.6.0** and clsx **2.1.1** in `THIRD-PARTY-NOTICES.txt`. The existing wrapper GPL license and immutable JavaScript bundle remain unchanged. A permanent package guard checks locked/installed versions, MIT metadata and each full upstream license body; the package/manifest guard also requires the new file. A missing-file RED control fails; the new notices pass.

### Caption saving on WordPress 6.3

Core 6.3's comment-attribute serializer can corrupt JSON when a caption ends in a backslash. The independent reviewer reproduced an invalid clock block and Width 200 instead of the saved 180 on actual WP 6.3.14 / PHP 7.0.33 for Administrator, Editor and Author. The exact public 1.1.2 has the same defect; current Core is a passing control. This is an inherited support boundary, not a claim that 1.1.4 introduced it.

New saves store Caption in the existing HTML `caption` attribute, avoiding that defective JSON path. The plugin preserves valid historical string caption metadata as authoritative when reading an old block. If old JSON settings are absent or were lost, the reader recovers only the clock's known attributes from its existing HTML with explicit numeric/boolean conversion. Raw HTML stays the source of truth for recovered values; settings absent from both representations cannot be reconstructed.

PHP metadata rewrites use a clock-specific safe serializer with escaped backslashes and comment delimiters. Around legacy Core's JSON KSES pass, only the known plain-text caption containing a backslash is temporarily omitted and restored if the clock HTML is unchanged. Other metadata and actual HTML still pass native KSES. Permissions, allowed HTML and foreign blocks are not broadened. Encoding failure retains original content and logs a fixed diagnostic without user input.

There is no database migration. Caption serialization intentionally changes on an explicit save; this is not a claim of byte-identical old/new block serialization. The exact public 1.1.2 reader already has an HTML-caption fallback. Its old writer can reintroduce its known Core 6.3 defect after a rollback; acceptance must distinguish old-writer behavior from reading new content and verify recovery on reupdate.

### Documentation

Root README's current CDN and 1.1.4 paragraphs now consistently identify widget **0.8.1**. WordPress README and the plugin changelog describe the compatibility correction and dependency notices. Historical release snapshots and published versioned files are retained.

## Verification and pending gates

`node --test tests/wordpress-serialization.test.mjs` passes **4/4** controlled contracts, including **48 PHP assertions** for slash parity, quotes, Unicode/entities, nondefault settings, legacy JSON precedence, malformed numeric/boolean attributes, foreign blocks, no-op preservation, safe comment delimiters and encoding failure. The old source extracted from `9a84e74` fails **4/4**, including **19/48 PHP assertions**. The JavaScript unit fixture supplies Core-decoded HTML attributes; the PHP fixture retains the exact legacy escaping order with narrow doubles. These tests do not replace real Core, Gutenberg or KSES acceptance. Required Repository checks execute this regression suite.

The package preflight verifies CRC, sixteen unique safe paths, every file against the source and manifest, unchanged widget/GPL bytes and preservation of thirteen earlier artifact snapshots. `npm run release:check` and `npm run release:verify` pass for the unchanged shared widget.

Fresh native WordPress save/upgrade/rollback checks, exact installed hashes, actual Plugin Check static/runtime, all three browser engines and independent reacceptance remain separate pending gates. The previous seven-warning Plugin Check result must not be copied: the new explicit encoding-error diagnostic may add a warning, which requires fresh review. A green CI alone does not authorize publication.

## Preserved artifacts and publication boundaries

The rejected requirements ZIP remains `.local/packages/simple-digital-clock-1.1.4-requirements-candidate.zip`, SHA-256 `fedc54bc0600db1236270733724b108a41919f398008b6ee902eeee4ac17ed00`. Its [manifest](manifest-before-acceptance-fixes.json), [author status](acceptance-evidence-before-acceptance-fixes.json), [preflight](preflight-evidence-before-acceptance-fixes.json) and [historical author report](REQUIREMENTS-CANDIDATE.md) are preserved. That author report predates the independent NO-GO and is not the current release verdict.

The earlier 0.8.1 candidate (`5963f947…6088`), 0.8.0 candidate and 1.1.3 ZIP also remain unchanged. Their large earlier matrices and minimum-header probes stay scoped to those exact artifacts. Widget 0.8.1's [CDN publication record](../0.8.1/PUBLICATION.md) records its original delivery; it is not WordPress 1.1.4 publication evidence.

No merge, WordPress.org/SVN publication, release tag, npm publication or owner-site update is authorized by this preparation. Rollback restores pinned plugin files while preserving database data; it does not repair previously damaged content by itself. Keep every archive and manifest, inspect the exact new SHA before any later release, and never run an old publication script against this candidate.
