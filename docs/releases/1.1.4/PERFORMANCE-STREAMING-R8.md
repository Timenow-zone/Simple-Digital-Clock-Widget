# Streaming r8 performance comparison — November 2, 2026

Status: completed local measurement; independent functional acceptance is recorded separately.

The same series compares exact public 1.1.2, accepted buffered 1.1.4 r6 and streaming 1.1.4 r8. No plugin delivery hooks are overridden. The immutable widget bytes in r6 and r8 are identical. All sites are disposable; no push or publication occurred.

## Interpretation

R8 removes the plugin's whole-page waiting cost. With one clock and a 2 MiB body,
current/classic median TTFB falls from 124.93 ms (r6) to 71.33 ms (r8), versus
69.49 ms for 1.1.2. Current/block falls from 164.84 to 106.94 ms. Minimum/classic
recovers early delivery: 156.86 to 16.20 ms, versus 15.71 ms for 1.1.2. Five clocks
have similar costs to one; there is no repeated script insertion.

Unused pages still incur a server-side scan. Current/classic 2 MiB with no clocks
has a paired median r8-minus-r6 TTFB difference of +1.123 ms (indicative 95% interval
+0.543 to +1.937 ms). At 64 KiB the corresponding +0.130 ms interval includes zero.
This is not a claim of zero PHP work on unused pages; their frontend clock
requests and inline style counts remain zero.

The whole-request used-heap peak does not materially shrink. Current/classic
64 KiB r8-minus-r6 peaks increase by about 20.3 KiB with no clocks, 78.5 KiB with
one and 90.5 KiB with five. Larger pages and the block theme mostly retain the
same Core-dominated high-water mark. Therefore the demonstrated benefit is early
output and removal of the expensive completed-page tokenization, not a promised
large PHP peak-memory reduction.

Twelve separate post-benchmark allocation/release probes passed on both PHP
references, bare and with WordPress bootstrap. They track the known 32 MiB
allocation and release; they are not part of the 5,520 timed requests. See the
[calibration rows](performance-streaming-r8-memory-calibration.json). The minimum reference has stable 18/20-query counts. Current Core varies between
21 and 25 queries in every variant; the cause of the extra four queries was not
traced during the frozen run. An additional sensitivity check retains only
matched rounds with 21 queries on both sides (20–37 pairs per comparison). The
large-page clock TTFB reduction remains about 53–58 ms versus r6. Small latency
differences must be interpreted with this variation and shared-host noise in
mind. See [query-count sensitivity](performance-streaming-r8-query-sensitivity.json).
All timed observations have
null PHP last-error and zero remaining buffers after Core shutdown flush.

## Exact inputs

| Variant | SHA-256 |
| --- | --- |
| 1.1.2 | `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55` |
| r6 | `f11d33c03be25bdd90ae14198c9b4d7bc9039ddbb89253d39e9b1e5843987989` |
| r8 | `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37` |

## Method and quality

WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35; aarch64 Docker Desktop, OPcache enabled, one Apache worker per reference, identical Twenty Twenty-One/Three theme bytes, page cache/compression/cron disabled. The same database contains nine pages: approximately 64/512/2048 KiB of body HTML and 0/1/5 clocks at the end. Request order rotates within each matched round; scenario order is deterministically shuffled. Requests are sequential, anonymous, uncompressed HTTP/1.1 over loopback with fresh connections.

Completed 5,520 HTTP requests: 540 warmups, 4860 measured and 120 separate footer-delay probes. There are 45 measured samples per ordinary condition. All 108 first-round HTML bodies were checked for clock/script/stylesheet counts. Every client row has one matching server observation. Final installed bytes match all three exact ZIPs. Source files were not modified by the benchmark.

PHP peak counters are sampled after Core flushes its buffers, before observer log serialization. Used heap and allocated pages are not process RSS or OPcache capacity. Both pre-flush and final peaks, request elapsed time, response bytes, query counts and worker identities are retained. p95 and deterministic paired-bootstrap intervals are in the linked CSVs; 45 local samples do not establish production tail capacity.

## Median TTFB (milliseconds)

### Current reference

| Theme | Body KiB | Clocks | 1.1.2 | r6 | r8 | r8 minus r6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Classic | 64 | 0 | 26.46 | 26.31 | 26.47 | +0.17 |
| Classic | 64 | 1 | 26.47 | 28.49 | 26.51 | -1.98 |
| Classic | 64 | 5 | 26.70 | 28.32 | 26.80 | -1.52 |
| Classic | 2048 | 0 | 69.20 | 70.84 | 71.70 | +0.86 |
| Classic | 2048 | 1 | 69.49 | 124.93 | 71.33 | -53.60 |
| Classic | 2048 | 5 | 69.12 | 124.65 | 71.56 | -53.08 |
| Block | 64 | 0 | 31.45 | 33.22 | 31.59 | -1.63 |
| Block | 64 | 1 | 31.68 | 35.95 | 31.82 | -4.13 |
| Block | 64 | 5 | 31.40 | 34.91 | 31.65 | -3.26 |
| Block | 2048 | 0 | 106.74 | 109.34 | 106.57 | -2.78 |
| Block | 2048 | 1 | 106.27 | 164.84 | 106.94 | -57.91 |
| Block | 2048 | 5 | 106.53 | 164.22 | 106.77 | -57.45 |

### Minimum reference

| Theme | Body KiB | Clocks | 1.1.2 | r6 | r8 | r8 minus r6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Classic | 64 | 0 | 14.64 | 21.06 | 14.57 | -6.49 |
| Classic | 64 | 1 | 14.61 | 22.57 | 14.49 | -8.08 |
| Classic | 64 | 5 | 14.61 | 22.63 | 14.53 | -8.10 |
| Classic | 2048 | 0 | 15.82 | 109.26 | 16.00 | -93.26 |
| Classic | 2048 | 1 | 15.71 | 156.86 | 16.20 | -140.66 |
| Classic | 2048 | 5 | 15.75 | 155.74 | 15.99 | -139.75 |
| Block | 64 | 0 | 34.99 | 35.97 | 34.97 | -0.99 |
| Block | 64 | 1 | 34.70 | 38.34 | 34.57 | -3.77 |
| Block | 64 | 5 | 35.23 | 38.05 | 35.38 | -2.67 |
| Block | 2048 | 0 | 185.67 | 191.66 | 188.07 | -3.58 |
| Block | 2048 | 1 | 187.62 | 237.16 | 186.85 | -50.31 |
| Block | 2048 | 5 | 188.11 | 238.88 | 187.20 | -51.68 |

## Median PHP used-heap peak (MiB)

| Reference | Theme | Body KiB | Clocks | 1.1.2 | r6 | r8 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| current | Classic | 64 | 0 | 4.329 | 4.346 | 4.366 |
| current | Classic | 64 | 1 | 4.329 | 4.346 | 4.423 |
| current | Classic | 64 | 5 | 4.329 | 4.346 | 4.434 |
| current | Classic | 2048 | 0 | 20.175 | 20.193 | 20.193 |
| current | Classic | 2048 | 1 | 20.176 | 20.193 | 20.193 |
| current | Classic | 2048 | 5 | 20.177 | 20.194 | 20.194 |
| current | Block | 64 | 0 | 20.440 | 20.458 | 20.458 |
| current | Block | 64 | 1 | 20.440 | 20.458 | 20.458 |
| current | Block | 64 | 5 | 20.440 | 20.458 | 20.458 |
| current | Block | 2048 | 0 | 26.544 | 26.561 | 26.561 |
| current | Block | 2048 | 1 | 26.544 | 26.562 | 26.562 |
| current | Block | 2048 | 5 | 26.546 | 26.563 | 26.563 |
| minimum | Classic | 64 | 0 | 5.113 | 5.138 | 5.131 |
| minimum | Classic | 64 | 1 | 5.114 | 5.138 | 5.132 |
| minimum | Classic | 64 | 5 | 5.114 | 5.139 | 5.133 |
| minimum | Classic | 2048 | 0 | 24.396 | 24.421 | 24.415 |
| minimum | Classic | 2048 | 1 | 24.397 | 24.421 | 24.415 |
| minimum | Classic | 2048 | 5 | 24.398 | 24.422 | 24.416 |
| minimum | Block | 64 | 0 | 20.424 | 20.441 | 20.442 |
| minimum | Block | 64 | 1 | 20.424 | 20.441 | 20.442 |
| minimum | Block | 64 | 5 | 20.424 | 20.441 | 20.442 |
| minimum | Block | 2048 | 0 | 30.420 | 30.437 | 30.438 |
| minimum | Block | 2048 | 1 | 30.421 | 30.437 | 30.439 |
| minimum | Block | 2048 | 5 | 30.422 | 30.438 | 30.440 |

Whole-request high-water marks can be dominated by earlier Core work. A small peak difference does not measure the standalone buffer footprint. PHP 7's previously observed absolute used/allocated discrepancy is retained; do not interpret that pair as physical capacity. The callback passes writes through and keeps lexical state between writes, but PHP/Core may provide a large input chunk and inserting assets can temporarily allocate a replacement string. Bounded retained parser state is not a claim of constant total PHP request memory.

## Separate 200 ms footer-delay probe

| Reference | Theme | 1.1.2 TTFB ms | r6 TTFB ms | r8 TTFB ms |
| --- | --- | ---: | ---: | ---: |
| current | Classic | 242.31 | 250.11 | 245.15 |
| current | Block | 41.73 | 262.14 | 41.20 |
| minimum | Classic | 21.11 | 244.99 | 23.38 |
| minimum | Block | 49.00 | 261.36 | 49.62 |

This artificial delay is excluded from normal timings. Core 7.1.4 itself buffers the tested classic theme; removing the plugin buffer cannot restore early bytes while that Core buffer remains. The observer does not remove buffers owned by PHP/Core/themes.

## Historical query-count correction

The earlier [r6 report](PERFORMANCE-2026-11-02.md) said query counts matched all
three variants within every scenario. Rechecking its preserved raw measured rows
shows 21/25-query variation on current Core and unequal counts in 431 of 1,620
matched scenario/round groups. That statement was too strong. The original raw
rows and report are retained; this correction does not re-label the original
measurement. The new r8 report exposes the variation and a matched-query
sensitivity analysis rather than assuming equal query counts.

## Retained attempts and evidence

- `perf-streaming-r7-20261102-a`: stopped after first warmup because the new validator overgeneralized legacy CSS loading. Corrected expected Core/theme behavior; plugin files unchanged.
- `perf-streaming-r7-20261102-b`: intentionally stopped when independent preliminary review confirmed IND-STREAM-01. Partial samples are not a completed benchmark and are not mixed into this report.
- `perf-streaming-r8-20261102-a`: completed series for the exact corrected ZIP. Independent heavy checks were paused throughout the measurement.
- Raw observations, client/server JSONL, warm HTML, package hashes and exact executed harness copies: `.local/wordpress-repro/perf-streaming-r8-20261102-a/performance/`.
- Raw `observations.json` SHA-256: `113cdf799c28f5615146ac23943284ecd49cba0fd2db64d57949dfa5e2aec729`.
- [Summary](performance-streaming-r8-summary.json), [all conditions including 512 KiB and p95](performance-streaming-r8-conditions.csv), [paired differences and intervals](performance-streaming-r8-paired-deltas.csv).

This is a local HTTP/PHP result, not a Core Web Vitals, native browser performance, production network or third-party cache/optimizer certification. Functional compatibility and the old 1.1.2 writer boundary remain separate acceptance gates.
