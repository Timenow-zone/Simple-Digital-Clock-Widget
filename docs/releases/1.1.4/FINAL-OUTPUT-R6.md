# WordPress 1.1.4: final output candidate

Status: **independent GO for the exact final-output-r6 local ZIP; unpublished**. Requirements remain **WordPress 6.3 / PHP 7.0**. Widget **0.8.1**, its JavaScript and internal styles remain byte-identical.

## Exact candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-final-output-r6-candidate.zip`.
- **67,979 bytes; 16 installable files**.
- SHA-256: `f11d33c03be25bdd90ae14198c9b4d7bc9039ddbb89253d39e9b1e5843987989`.
- [Manifest](manifest.json); [asset contract](../../WORDPRESS-ASSET-CONTRACT.md).
- Widget SHA-256: `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

## Final output corrections

The frontend decision moves from intermediate render filters to the completed theme HTML. A dynamic parent or later content filter can suppress or escape child clocks without requesting the runtime. The response buffer also covers direct theme output, late footer clocks and tags split across chunk flushes. Core generates deduplicated runtime and inline layout tags; the final tokenizer pass includes them only when a live clock survives. Inert templates and HTML examples do not count.

This requires response-sized PHP memory and delays streaming until completion. It adds no browser bootstrap or external stylesheet. Admin/editor behavior, KSES security and serialization code, dependencies, widget bytes, translations and licenses are unchanged. No database migration is introduced. Output rewriting after the plugin's final pass and external cache/optimizer integrations remain separately unverified. Themes must call `wp_footer()`.

The previous exact r4b **NO-GO** remains preserved in [its report](INDEPENDENT-INLINE-CSS.md), [release snapshot](INLINE-R4B.md), [manifest](manifest-inline-r4b.json) and [status](acceptance-inline-r4b.json). Its ZIP is not overwritten. The historical [r2 GO](COMPATIBILITY-R2.md) and author-only r3/r4 results do not transfer to these new bytes.

The intermediate r5 ZIP fixed IND-INLINE-01 (16 independent controls passed) but failed IND-FINAL-01: Core 6.3 treats XMP contents as tags and current Core parses NOSCRIPT with scripting disabled. The [r5 independent NO-GO report](INDEPENDENT-FINAL-OUTPUT-R5.md), [evidence](independent-final-output-r5-evidence.json) and [manifest](manifest-final-output-r5.json) remain preserved. Revision r6 explicitly skips these raw-text regions using public tokenizer APIs, preserves real clocks after their closers, and treats PLAINTEXT as text through end-of-response. The analysis copy is never delivered.

## Independent local acceptance

The [independent report](INDEPENDENT-FINAL-OUTPUT-R6.md) and [machine evidence](independent-final-output-r6-evidence.json) record **17 mandatory local gates PASS**, with new required GitHub CI separately **NOT RUN**. All **372 frontend resource observations** pass: 160 full-fixture Chromium/WebKit, 80 actual Linux Firefox, 48 classic-theme and 84 independent parent/buffer/raw-text observations. Two clean installations, six upgrade/physical rollback/re-update transitions, Plugin Check **29 static + 5 runtime / zero findings**, and fresh native security/recovery/metadata checks pass on WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35. Plugin Check itself runs only on its supported PHP 8.3 reference.

All four editor/runtime pairs have positive iframe, insertion, ticking and save/reopen evidence. One initial WebKit/current 10-second insertion timeout remains FAIL/PARTIAL with an unconfirmed transient cause; two targeted complete repeats passed, the final live preview appearing in 327 ms. The report also preserves an overbroad reviewer CSS assertion and its scope correction; editor wrapper and frontend host markup differ. No failed attempt was relabeled PASS.

All 344 frozen files, both ZIP copies and four installed file sets matched at independent close. Root independently repeated the source/ZIP/manifest/report integrity check before integrating these reports. Only documentation/status changed after closure; installable bytes and manifest remain frozen. The [author evidence](author-final-output-r6-evidence.json) is retained separately and is not substituted for independent observations.

## Acceptance and publication boundaries

The completed local review binds to this exact ZIP and records PASS, FAIL and NOT RUN separately. The browser contract now has 40 fixtures, including the original parent-suppression blocker, a late content filter, inactive/draft/excerpt controls, multiple clocks and explicit flushes. Clean installation, upgrade/physical rollback/re-update, official Plugin Check, classic/block themes, editors and supported PHP/Core references remain distinct gates.

No push, new GitHub CI, merge, deployment or WordPress.org publication is authorized. Old-writer/Core 6.3 data-loss and erased-caption/lock limitations remain. HTTPS/TLS installation, multisite, native Safari/VoiceOver, external Google transport, owner sites and broad historical cache/optimizer coverage are not newly certified. A local acceptance verdict is not public delivery proof.

## Post-acceptance local preview update

After independent freeze closure, root installed the exact r6 ZIP into the existing loopback preview, retaining a physical r4b backup. All 16 installed file hashes match; complete post rows and the eight selected critical options are unchanged before/after installation and Plugin Check. The preview checker reports zero findings, and four additional Chromium/WebKit checks confirm unused/clock-page resource counts, ticking and the served runtime SHA-256. This later owner-preview evidence is separate from the independent disposable-lab verdict: `.local/final-output-r6-20261101/preview-update.json`. It is not public delivery. No push, merge, CDN deployment or WordPress.org publication occurred.

## Measured response performance

The [November 2 local comparison](PERFORMANCE-2026-11-02.md) adds measured TTFB and
PHP-memory evidence for exact public 1.1.2 versus this unchanged r6 ZIP. It covers
5,520 requests across two native runtimes, two themes, three body sizes and 0/1/5
clocks, with a separate diagnostic control and streaming probe. Global buffering
is not performance-neutral: large clock pages add about 54–57 ms of TTFB on the
PHP 8.3 reference, and older classic-theme responses can lose early delivery even
without clocks. The small measured used-heap peak delta is bounded by an earlier
Core-rendering high-water mark; PHP 7 allocation-counter limits are explicit.
The independent functional GO remains an exact-artifact result, not a production
performance approval. Package bytes, source and publication state are unchanged.
