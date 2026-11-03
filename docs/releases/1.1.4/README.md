# WordPress 1.1.4: streaming candidate

Status: **independent GO for the exact streaming-r8 local ZIP; unpublished**.
Requirements remain **WordPress 6.3 / PHP 7.0**. Shared widget **0.8.1**, its JS,
internal styles, editor bundle and saved-data schema are unchanged.

## Exact artifact

- ZIP: `.local/packages/simple-digital-clock-1.1.4-streaming-r8-candidate.zip`.
- SHA-256: `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37`.
- **69,772 bytes / 17 installable files**; [manifest](manifest.json).
- Base commit `f75c98776b6b1860e916123915bed8084c879153` plus uncommitted local changes.
- New installable bytes require another exact archive and independent acceptance.

## Behavior and compatibility

Whole-response retention is removed. A PHP output handler with a one-byte
threshold immediately passes writes through, retaining only incremental lexical
state. Core still generates resource tags at footer priority 19, preserving the
existing loader/inline-data lifecycle. A live clock receives one runtime script
and one inline host-layout rule; unused pages receive neither. No external plugin
stylesheet or generic client loader is added. See the
[asset contract](../../WORDPRESS-ASSET-CONTRACT.md).

The observer handles suppressed/escaped parents, excerpts, comments, quoted
attributes, raw text, inert templates, split writes, CLEAN operations and clocks
appearing after footer. This is a streaming observer, not removal of buffers
owned by PHP/Core/themes and not a full HTML tree builder. Normal valid HTML with
scripting enabled and an available safe insertion position is the certified
scope. Outer transforms, cache/optimizer integrations and a first clock created
solely by later client JavaScript need separate integration testing.

## Independent acceptance

The [independent report](INDEPENDENT-STREAMING-R8.md),
[evidence](independent-streaming-r8-evidence.json) and
[closing identity](independent-streaming-r8-integrity.json) record **18 mandatory
local gates PASS**, with new required GitHub checks/public delivery separately
**NOT RUN**. All **344 functional/resource cases** pass: 252 full-fixture checks
across Chromium/WebKit/Linux Firefox, 12 actual literal SELECT/SCRIPT controls,
48 classic-theme cases and 32 independent streaming/lifecycle cases.

Two clean installs and six public-1.1.2 update/physical rollback/reupdate
transitions pass on WP 6.3.14/PHP 7.0.33 and WP 7.1.4/PHP 8.3.35. Plugin Check 2.1.0
reports **29 static + 5 actual runtime checks / zero findings** on its supported
PHP reference. Per-environment native compatibility includes 538 security/caption
observations, 10 recovery guards and six unknown-metadata comparisons. All four
editor/iframe pairs pass. Frozen 367-file source and four installed file sets
matched at close; root repeated the freeze/hash check before integrating reports.

WebKit eager execution before a delayed closing tag was not observed; its final
functional behavior passes. Legacy Core localization nonce behavior prevents a
blanket strict-CSP claim. Initial failed harness attempts remain preserved and
are not relabeled PASS. Native Safari/LocalWP, multisite, TLS, external fonts and
third-party optimizers are not certified by this local matrix.

The inherited old 1.1.2 writer/Core 6.3 caption/Advanced/lock data-loss boundary
remains: file rollback cannot recover data already erased by that old writer.
The tested update/read/physical-rollback/reupdate path preserves complete post
rows and eight critical options without a database reset.

A separately versioned [1.1.2.1 editable rollback package](../1.1.2.1/README.md)
addresses saves after rollback through a backport of the compatible reader/writer
and conditional asset wrapper. It retains the original widget 0.7.0 runtime.
Its exact archive, additional real-write cycle and independent review status are
recorded separately; neither the published 1.1.2 nor accepted r8 bytes change.

## Performance

The [new report](PERFORMANCE-STREAMING-R8.md) compares exact 1.1.2/r6/r8 in one
5,520-request series (45 measured samples per ordinary condition), with two
themes, two PHP/Core references, 64/512/2048 KiB bodies and 0/1/5 clocks. Current
classic 2 MiB/one-clock median TTFB is **69.49 / 124.93 / 71.33 ms** respectively;
minimum classic is **15.71 / 156.86 / 16.20 ms**. Controlled footer-delay probes
confirm early delivery where Core does not already hold the response.

Whole-request PHP peak memory does not materially decrease. Current classic
64 KiB peaks are about 20/78/90 KiB higher than r6 for 0/1/5 clocks; larger pages
are mostly dominated by Core's earlier high-water mark. Empty current/classic
2 MiB adds about 1.1 ms of paired TTFB versus r6. Query-count variation and a
historical overclaim correction are explicit; a same-query sensitivity check
retains the large-page clock benefit. No production or Core Web Vitals claim is
made. The [independent arithmetic audit](performance-streaming-r8-independent-audit.json)
checks raw provenance, selected medians and limitations separately.

## Post-acceptance local integration

After freeze closure, only documentation and the test seed were changed. The
seed now preserves slashes, literal `</select>` and exact stored script input;
six stored-byte checks and 12 targeted browser checks pass in a fresh lab.
[Repair evidence](post-acceptance-streaming-r8-harness.json) retains the initial
overbroad guard failure: legacy block fixtures can legitimately gain canonical
metadata, so exact-byte checks are scoped to the literal script fixtures.
Installable source, manifest and ZIP remain unchanged.

Owner-preview installation and its backup/state/browser receipt are recorded in
[local integration evidence](post-acceptance-streaming-r8-preview.json). This is
separate from the reviewer's disposable-lab GO. No push, merge, tag change, CDN
deployment or WordPress.org publication occurred.

## Preserved predecessors

Accepted [r6](FINAL-OUTPUT-R6.md) retains its [manifest](manifest-final-output-r6.json),
[status](acceptance-final-output-r6.json), [independent report](INDEPENDENT-FINAL-OUTPUT-R6.md)
and [original benchmark](PERFORMANCE-2026-11-02.md). Preliminary r7 was rejected
for IND-STREAM-01; its [review](INDEPENDENT-STREAMING-R7-PREFLIGHT.md),
[manifest](manifest-streaming-r7.json) and [author record](STREAMING-R7.md) remain.
Earlier r2/r4b/r5 histories are linked from the r6 snapshot. No old verdict is
transferred to another same-version archive.
