> Preserved focused author report. The body is unchanged; raw evidence and named files are retained under ignored `.local/release-1.1.4-acceptance-fixes-20261030/author-r2/`. The [curated machine-readable result](author-evidence.json) records identity, counts, transitions, measured boundaries and shutdown; original complete results remain intact. This report is separate from [independent acceptance](INDEPENDENT-ACCEPTANCE.md).

# Focused author verification — WordPress 1.1.4 compatibility r2

**Scoped result: PASS, with explicitly retained inherited failures. This is not an independent release GO.**

- Source commit: `369f6bde90591e40ac8f59544297a2bae3e6a91f`.
- Exact ZIP: `/Users/yy/.codex/worktrees/simple-digital-clock-113/Simple-Digital-Clock-Widget/.local/packages/simple-digital-clock-1.1.4-compatibility-r2-candidate.zip`.
- ZIP SHA-256: `d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`; **65,374 bytes**, **16 installed files**, CRC/manifest/source hashes confirmed again after the run.
- Widget remains 0.8.1, 36,009 bytes, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Executed engine: actual **Chromium 151.0.7922.34**. Author **WebKit/Firefox are NOT EXECUTED for this artifact**; no three-engine author PASS is claimed.
- Fresh disposable stacks: WP 6.3.14/PHP 7.0.33 and WP 7.1.4/PHP 8.3.35; clean block themes plus separate classic-theme public-1.1.2 upgrade sites.

## Candidate and native server timing

**120/120 fresh candidate UI cases passed:** 60 on clean installations and 60 after actual Core updates, covering ten captions, three roles and both stacks. Inputs include one/two/three terminal backslashes, quotes/Unicode, named/invalid-numeric entity spelling plus a terminal backslash, literal backslash-u0022/u2028 sequences, actual U+2028/U+2029 and block-comment/script-looking literal text.

All cases retained valid legacy JSON, the exact literal caption and every tested nondefault setting. Editor captions were exact; the widget remained 180 px with one-line time and no overflow; no executable caption payload was observed. On **60 minimum-Core cases**, captured native Core output is malformed JSON, the actual observed REST content equals that exact native output, and the stored server result is valid JSON with the exact literal caption. This demonstrates server-side repair rather than UI preescaping.

## Preservation and full file cycle

- Baseline, updated, rollback and final ordinary phases each read **10 native post/page records / 240 clocks**. All clock attributes are compared with the actual public-1.1.2 baseline before saves. Updated and final phases each perform ten visible preservation saves/reopens. The original six Author numeric-entity invalid blocks remain explicitly inherited; valid baseline blocks and literal entity captions do not regress.
- **Two Core upgrades, two file-only rollbacks, two Core reupdates** preserve complete post rows and critical options at each file transition. Every installed file matches its exact archive; requirements pass and the plugin remains active. No database restore or reseeding occurs.
- The exact old 1.1.2 reader accepts **60/60 newly saved candidate caption blocks**, with valid blocks, exact literal JSON captions, all settings and editor geometry. These are read-only checks before any old writer runs.
- Separate Advanced cases: **6/6 new saves**, **6/6 old-reader checks**, **6/6 reupdated new saves** pass. Native supported `className` follows Caption in the actual incoming Core/REST JSON and survives repair. Anchor is not natively supported and was not fabricated. Persisted key order may change during scoped Author KSES restoration; all values and validity remain strict. No old writer is run on Advanced fixtures.

## Measured inherited states — not blanket PASS

The public-1.1.2 control has **31 FAIL_INHERITED / 29 PASS**: all 30 minimum terminal-backslash cases fail, and one current Author invalid-numeric-HTML case remains invalid despite exact valid JSON and settings. Immediately after update, the old controls produce **58 valid reads and 2 retained inherited invalid numeric-HTML blocks**, with every expected setting preserved. Three minimum entity cases have already lost a valid literal JSON caption; only their explicitly recorded retained HTML interpretation is certified, not recovery of the original entity spelling.

The explicit old writer later produces **30 minimum FAIL_INHERITED and 30 current PASS**. These observations belong to old 1.1.2, after the successful old-reader check of new-format content. Reupdate preserves those records without reset. The new reader restores known clock settings and reads **59 valid blocks**; **one minimum Author numeric-HTML block remains inherited-invalid** with unchanged stored bytes and preserved attributes. Its new-writer step is explicitly **NOT_EXECUTED_INHERITED_INVALID_MARKUP**: no silent resave, Block Recovery or data reset was used. The other **59 new-writer cases pass**, with valid stored JSON. Three minimum literal-loss boundaries remain disclosed, not relabeled as preservation of metadata the old writer already damaged.

Fresh candidate writes and all valid baseline/new-format old-reader checks remain strict; inherited exceptions apply only to exact measured old-version records with retained raw JSON/HTML evidence.

## Harness history, shutdown and scope

Two original author-run failures are retained: an overly broad expectation that every current public-1.1.2 control would be valid despite the known Author invalid-numeric boundary, and an incorrect requirement that persisted JSON key order equal incoming key order. The former is now explicitly FAIL_INHERITED with strict data checks; the latter checks the actual native/REST incoming order while retaining all persisted-value guards. Original reports, logs and scripts remain intact. Bounded continuations reread completed IDs without repeat UI saves and only executed remaining steps. See `HARNESS-CHANGES.md`.

All **five** owned containers are stopped; all **four** loopback ports are closed. Containers, databases, archives and evidence are retained. No candidate source/ZIP/manifest change, owner-site update, merge, publication, foreign network removal, database restore or fixture reset was performed by this author harness.

Limitations: no author WebKit/Firefox run for this artifact, no new full security/Plugin Check/HTTPS/multisite/LocalWP/Google/CDN certification and no public WordPress.org update delivery test. Independent acceptance must use its own executions and exact-artifact verdict. Previous failed 9e acceptance and its database remain separate under `../author/` and are not relabeled as r2 results.

Machine-readable outcomes: `AUTHOR-STATUS.json`; final teardown: `teardown-advanced-order-continuation.json`; exact commands/stdout/stderr: `logs/`; raw per-phase JSON/screenshots: this directory.
