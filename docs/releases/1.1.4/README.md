# WordPress 1.1.4 candidate: safe legacy caption serialization

Status: **independent GO for compatibility revision 2; focused author verification passed with explicit predecessor failures; WordPress.org publication deferred**. Plugin version remains **1.1.4**, minimum requirements remain **WordPress 6.3 / PHP 7.0**, and the shared widget remains **0.8.1**.

The [31 October readiness record](../../maintenance/release-readiness-2026-10-31.md) tracks subsequent repository/tooling/preview/site integration and current release gates. Those changes preserve this exact package and do not extend the historical independent acceptance scope.

## Exact candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-compatibility-r2-candidate.zip`; **65,374 bytes**, **16 installable files**.
- ZIP SHA-256: `d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`.
- [Manifest](manifest.json), [package preflight](preflight-evidence.json), and [acceptance status](acceptance-evidence.json).
- Widget: **0.8.1**, **36,009 bytes**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Widget source commit: `b44f944b60babf45bf266e73ba12f7eba53cfef2`. Its bytes still match `dist/0.8.1.min.js`; no shared runtime, dependency or CDN change is part of this WordPress correction.

Only `block.js` and `includes/simple-digital-clock-kses.php` change relative to rejected compatibility revision 1. The other fourteen files remain identical, including the dependency notices, plugin readme/changelog, header requirements, GPL license, POT and widget. Relative to the earlier requirements candidate, three files change and `THIRD-PARTY-NOTICES.txt` is added. The full manifest is authoritative.

## Independent findings and final correction

The requirements candidate `fedc54bc…ed00` received [independent NO-GO](independent-before-acceptance-fixes.json) for missing dependency notices and terminal-backslash captions invalidating nondefault settings on actual WP 6.3.14 / PHP 7.0.33. The exact public 1.1.2 reproduces that Core 6.3 defect.

Compatibility revision 1 (`9e02646f…8c1`, commit `4bc261e`) supplied the notices and used HTML-sourced captions. It passed clean backslash UI cases and two file updates, but native author tests and [independent reacceptance](independent-before-entity-regression-fix.json) found a new regression: a title-only save changed literal entity captions, for example `&copy;` to its decoded character. Core's static HTML serializer deliberately retains entity-shaped strings. Once the original JSON caption was omitted, DOM parsing could not preserve that original literal value. Both failures were retained; rollback/reupdate were not credited as executed for that rejected archive.

### Preserve the original block format

Revision 2 retains the original **JSON-backed Caption schema and static save HTML**, including the public 1.1.2 reader's representation. It does not add a new caption field, change the saved schema, add a deprecated save format or run a database migration. Valid historical JSON remains authoritative. The reader can recover known clock settings from existing HTML when their JSON metadata is absent; attributes missing from both representations cannot be reconstructed.

### Recognize only the Core 6.3 closing-quote defect

Before native KSES parses clock comments, the server recognizes only malformed metadata matching Core 6.3's terminal-caption backslash bug. A repair requires a decoded object, one top-level string caption ending in a backslash, proof that the replaced token is precisely that caption's closing quote, an exact legacy caption-token preimage and consistent native HTML. Caption may precede Core's appended `className`; unknown values retain their semantics without requiring PHP and JavaScript to spell small floating-point numbers identically. Real U+2028/U+2029 and literal backslash-u text are distinguished.

At most 32 possible boundaries are examined. Duplicate/nested captions, inconsistent HTML, foreign or ambiguous malformed input remain unchanged with fixed diagnostics where appropriate. There is no generic JSON repair. Real nested block comments remain excluded; HTML-like caption text emitted by the native static serializer is not mistaken for a child block.

Clock metadata rewrites use safe backslash and comment-delimiter encoding. Around legacy Core's JSON KSES pass, the known plain-text caption is restored only if its HTML is unchanged. Actual HTML, other metadata, capabilities and nonces retain native policies. All three post-save fields are covered for Administrator, Editor and Author; block-widget paths still respect earlier stricter callbacks. Encoding failure retains original content without logging user data.

An old public 1.1.2 writer on Core 6.3 can still reproduce its own defect after a file rollback. That does not certify an old writer as fixed. Acceptance must check old-reader validity and a complete reupdate without restoring the database. Already-invalid old content is tracked separately; this revision does not promise recovery of every literal value already lost from metadata.

### Dependency notices and documentation

`THIRD-PARTY-NOTICES.txt` retains the full exact upstream MIT notices for Preact **11.1.0**, preact-custom-element **4.6.0** and clsx **2.1.1**. The wrapper GPL and immutable widget are unchanged. A permanent package guard checks locked/installed versions, MIT metadata and full license bodies, with manifest inclusion enforced separately.

Root README, WordPress README and the plugin changelog consistently identify plugin **1.1.4**, widget **0.8.1**, the compatibility correction and dependency notices. Historical versions and acceptance snapshots remain separated from current claims.

## Verification and acceptance

- `node --test tests/wordpress-serialization.test.mjs`: **7/7 PASS**, including **23 native malformed-serialization rows**, **8 negative guard rows** and **48 PHP encoding assertions**. A provenance guard verifies pinned native fixtures. The preceding R1 source fails two behavioral contracts and the Chromium literal-caption regression; original failures remain in the raw evidence.
- `node --test tests/wordpress-serialization.integration.test.mjs`: locally **Chromium/WebKit PASS**, **11 captions × 2 cycles × both current and public-predecessor readers**, with actual DOM decoding and equivalent native static markup. macOS Firefox launch timed out and is **not credited**. The required Linux Browser tests subsequently passed all three native integration contracts, and independent real WordPress acceptance separately exercised all three engines.
- Native fixture code is unchanged, pinned Core 6.3.14 React/element/escape-html plus exact public 1.1.2 reader excerpts. Their provenance and licenses live under `tests/fixtures/wordpress-6.3.14/`; none is shipped in the plugin ZIP. Registration/query/PHP doubles are narrowly documented and do not replace actual Gutenberg, persistence, KSES or Core updating.
- The sixteen-file preflight passes CRC, safe unique paths, exact source/manifest hashes and unchanged widget/GPL checks. Fourteen previous artifact snapshots remain unchanged.

The [independent report](INDEPENDENT-ACCEPTANCE.md) and [exact result](independent-evidence.json) return **GO** for this ZIP at runtime source commit `369f6bde90591e40ac8f59544297a2bae3e6a91f`. Every mandatory section was executed independently on fresh WP 6.3.14 / PHP 7.0.33 and WP 7.1.4 / PHP 8.3.35 environments. Findings and original failures remain explicit; this is not an all-green claim for predecessor behavior.

- **276 exact and valid candidate Caption observations**, plus **378 old-reader observations**, cover three roles, literal entities, slashes, Unicode, className and lock metadata.
- **538 actual restricted KSES/security assertions per environment**, plus ten native recovery-guard cases per environment, pass. Capabilities, nonces, direct access, all three post fields, widgets, stricter callbacks and unrelated sanitization were checked.
- Two Core upgrades, two physical file rollbacks and two Core reupdates preserve complete post rows and critical options at all six file transitions, with exact installed files and no database restore/reset. Role saves on posts/pages and active/inactive widgets pass in Chromium, WebKit and real Linux Firefox.
- Patterns, HTML/shortcode consumers, Auto/Reset, ticking, iframe/resize/hidden-reveal, delayed Fira Code after Google failure and Amharic geometry pass. Old 0.8.0 RED controls remain separate. **312 native Intl comparisons** pass.
- Official **Plugin Check 2.1.0: 29 static + 5 individually run runtime checks, 0 errors / 10 reviewed nonblocking warnings**. Eight fixed diagnostics, one bounded argument-free backtrace and existing global script loading are individually assessed in the preserved result. Earlier warning totals were not reused.
- The independent isolated build reproduces exact widget 0.8.1; read-only public checks match its immutable CDN bytes. Public WordPress 1.1.4 remains absent. No publication is inferred from those reads.

The separate [focused author report](AUTHOR-VERIFICATION.md) and [curated result](author-evidence.json) cover Chromium only: **120/120 fresh candidate saves**, **60 observed native malformed Core/REST inputs repaired to exact stored JSON**, a 240-clock corpus over four phases with 20 visible preservation saves, **60/60 public-1.1.2 reader checks**, and six Advanced saves/old reads/reupdated saves each. Its six file transitions also preserve all rows/options. Author WebKit/Firefox were not executed or credited for this artifact; independent three-engine evidence supplies that coverage.

The [runtime-source CI run 41118373200](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41118373200) passed Repository checks and Browser tests, including all three new native DOM contracts; Workers Builds passed. Required checks must also pass on the final documentation/test-only PR head. The latest result is visible on [PR #13](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/13) and retained in local final CI evidence before handoff.

### Minimum-PHP unit comparison correction

The reviewer retained an authored unit-harness false failure on PHP 7: a constructed numeric-key `stdClass` and an equivalent JSON-decoded object have different internal key representations. Their JSON is identical. The test now compares JSON encodings, retaining object/array and number/string distinctions; [diagnostic evidence](php70-unit-evidence.json) preserves the original nine failures and negative controls. The corrected tracked test passes **48/48 assertions on actual PHP 7.0.33 and PHP 8.3.35** in read-only, network-none CLI containers. This one-line test change and the final evidence documentation change no installable file, manifest or accepted ZIP byte. The reviewer's original 6/7 PHP 7 test snapshot remains unmodified in its report.

### Explicit boundaries

The public 1.1.2 writer still corrupts some terminal-backslash metadata on Core 6.3. Both independent and author cycles retain its failures, lost literal captions and Advanced metadata. One already-damaged Author numeric-entity block remains invalid after reupdate. The author cycle does not run a new writer on that inherited invalid markup; its other **59/59 final writes** pass. The independent strict failed collector remains retained. No automatic reconstruction of erased values or blanket successful old-writer claim is made.

Unknown metadata follows native Core filtering: a numeric-key-only object can become an array for restricted Author identically under native KSES and both plugin versions. Mixed structures and actual recovery cases retain their tested semantics; there is no universal type-preservation promise after Core policy.

HTTPS/TLS, multisite, native Safari/VoiceOver, successful real Google stylesheet transport, installed owner sites and public delivery/updating of unpublished WordPress 1.1.4 remain outside this acceptance. All eight independent and five author services are stopped, their ports are closed, and databases/raw evidence are retained. Prior rejected archives, failed attempts and their separate databases are preserved. A GO or green CI does not authorize merging or publication.

## Preserved artifacts and publication boundaries

| Artifact | SHA-256 | Historical result |
| --- | --- | --- |
| Requirements candidate | `fedc54bc0600db1236270733724b108a41919f398008b6ee902eeee4ac17ed00` | Independent NO-GO; [manifest](manifest-before-acceptance-fixes.json), [original author report](REQUIREMENTS-CANDIDATE.md) |
| Compatibility revision 1 | `9e02646f4cbfea322bb5dd5376d39df7afc787c6e34f659db80441c92598b8c1` | Native/independent NO-GO; [manifest](manifest-before-entity-regression-fix.json), [original preparation](COMPATIBILITY-CANDIDATE-R1.md) |

Both archives retain their original names under `.local/packages/`. Their author/preflight/independent records are preserved separately. Earlier widget-0.8.1 (`5963f947…6088`), widget-0.8.0 and 1.1.3 archives also remain unchanged; their earlier matrices certify only their original bytes. Widget 0.8.1's [CDN publication record](../0.8.1/PUBLICATION.md) is not WordPress 1.1.4 publication evidence.

No merge, WordPress.org/SVN publication, release tag, npm publication or owner-site update is authorized by this preparation. Rollback restores pinned plugin files while keeping database data. Preserve every archive and manifest, verify the final SHA before any later release, and do not run an old publication script against this candidate.
