# Local TTFB and PHP memory comparison: 1.1.2 versus 1.1.4 r6

Measured on **2026-11-02 (Europe/Kyiv)**. This is a performance measurement of two frozen packages, not a new release or a replacement of the independent functional verdict. No plugin code, package bytes, owner-preview data, Git remote or publication state was changed.

## Findings

The measurable cost is primarily **delayed first-byte delivery and additional final HTML processing when clocks are present**. It is not proportional to the number of clocks: one and five clocks have similar overhead in these fixtures. The new detector stops after finding the first live clock.

- At roughly 64 KiB of body content on PHP 8.3, median exact-version TTFB increases by approximately **0.3–3.7 ms**, depending on theme and clock presence. On PHP 7.0 with the classic theme, the same body size increases TTFB by **6.2–7.9 ms**, including pages without clocks.
- With a 2 MiB body and clocks, the diagnostic r6 control attributes approximately **54–57 ms of extra TTFB** on PHP 8.3 to the new buffer/capture/detection mechanism. The measured server-duration delta is about **54–56 ms**; this is elapsed PHP request time, not a CPU-time counter.
- On minimum Core/PHP with the classic theme, an empty 2 MiB page changes median TTFB from **15.54 to 108.11 ms**. A one-clock page changes **15.53 to 154.14 ms**. Much of this is delayed delivery of work the old version performed after sending its first bytes; it must not all be called extra computation.
- Peak *used PHP heap* increases only about **17–26 KiB** in these fixtures. In all 1,620 measured candidate requests, the high-water mark had already been reached before the final buffer flush. Therefore this small peak difference does **not** mean the response buffer consumes no memory, or that every production page has the same memory behavior. Allocated-page values and the PHP 7 counter caveat are retained below.

The r6 functional contract passes, but global buffering is **not performance-neutral**, particularly for large uncached pages and classic themes on older Core. These results do not support a claim of zero server cost on pages without clocks. Reconsider that delivery mechanism before treating the candidate as meeting a minimal-overhead release requirement. No alternative implementation was made during this measurement.

## Artifacts and controls

- Public 1.1.2 ZIP: **61,476 bytes**, SHA-256 `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`.
- Accepted 1.1.4 final-output-r6 ZIP: **67,979 bytes / 16 files**, SHA-256 `f11d33c03be25bdd90ae14198c9b4d7bc9039ddbb89253d39e9b1e5843987989`.
- Native references: WordPress **6.3.14 / PHP 7.0.33** and WordPress **7.1.4 / PHP 8.3.35**, Apache module SAPI, both aarch64.
- Each reference uses one database, identical stored page bytes, and one Apache worker. Exact packages coexist in distinct directories; a test-only MU filter selects exactly one per request. Package directory names change asset URL prefixes, but no package file is edited.
- Both sites use identical Twenty Twenty-One (classic) and Twenty Twenty-Three (block) source files from the pinned minimum-Core archive. Theme hashes are recorded in raw evidence.
- OPcache enabled and warmed; JIT/timestamp validation disabled; PHP output buffering 4,096 bytes; no response compression, page cache or cron. External WordPress HTTP is blocked. WP_DEBUG/logging remained enabled identically; all 5,520 observations report no PHP error.
- Docker Desktop reports 16 virtual CPUs and 15,953,887,232 bytes memory. Requests run sequentially over loopback; this is not production load, throughput or capacity certification.

The diagnostic `control` uses the exact r6 files but removes only the new frontend buffer/capture/detection hook. Fixture metadata supplies a known clock count to enqueue the same handles. It is **not a production detection solution or accepted ZIP variant**. It measures the whole new delivery path, not a pure `ob_start` allocation. Head/footer placement and the fixture oracle differ; query counts nevertheless match all three variants within every scenario.

## Sampling and metric definitions

**5,520 requests = 540 warmups + 4,860 measured requests + 120 separate streaming probes.** The main matrix has 108 conditions: 2 runtime references × 2 themes × 3 body sizes × 3 clock counts × 3 variants. Each condition has 5 warmups and 45 measured samples. Scenario order is reproducibly shuffled; variant order rotates within matched rounds. No measured sample was removed as an outlier. HTTP responses are anonymous, uncompressed, fresh-connection HTTP/1.1 with no redirects.

Bodies contain approximately 64, 512 or 2,048 KiB of identical paragraph HTML followed by 0, 1 or 5 clock blocks. Actual total response sizes include theme markup and are recorded in CSV; for a one-clock current-reference page, they are approximately 100/548/2,084 KiB with the classic theme and 127/575/2,111 KiB with the block theme. Late clock placement exercises scanning of the preceding content.

TTFB uses [curl `time_starttransfer`](https://curl.se/docs/manpage.html#-w). PHP metrics use [`memory_get_peak_usage(false/true)`](https://www.php.net/manual/en/function.memory-get-peak-usage.php), sampled after Core's shutdown buffer flush, including r6 detection and marker replacement. Used heap and allocated heap pages are **not process RSS, shared OPcache or total container memory**. The identical observer logs only after taking the peak/timing samples. Every client row joins exactly one native PHP observation; all final buffer counts are zero. Separate before-flush peaks verify the timing.

Tables below show median/p95 TTFB and median per-request used-heap peak. Deltas in the main tables are differences of medians. The paired CSV separately records median within-round differences and deterministic 2,000-resample bootstrap intervals; these are indicative local uncertainty, not production SLO confidence. With 45 samples, p95 is sensitive to a few requests and shared-host noise.

## WordPress 7.1.4 / PHP 8.3.35: Twenty Twenty-One (classic)

| Body KiB | Clocks | 1.1.2 TTFB median / p95 ms | r6 TTFB median / p95 ms | Median delta ms | 1.1.2 used peak MiB | r6 used peak MiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 64 | 0 | 26.56 / 40.14 | 26.89 / 48.05 | +0.33 | 4.330 | 4.347 |
| 64 | 1 | 26.17 / 34.95 | 28.21 / 40.20 | +2.04 | 4.330 | 4.347 |
| 64 | 5 | 26.65 / 38.89 | 28.45 / 40.13 | +1.80 | 4.330 | 4.347 |
| 512 | 0 | 35.50 / 41.29 | 35.97 / 40.29 | +0.47 | 7.743 | 7.760 |
| 512 | 1 | 35.99 / 51.70 | 50.16 / 63.98 | +14.17 | 7.744 | 7.761 |
| 512 | 5 | 36.03 / 46.66 | 50.19 / 64.92 | +14.16 | 7.745 | 7.762 |
| 2048 | 0 | 67.66 / 74.45 | 69.10 / 88.25 | +1.44 | 20.177 | 20.194 |
| 2048 | 1 | 68.34 / 77.37 | 122.58 / 134.01 | +54.24 | 20.177 | 20.194 |
| 2048 | 5 | 68.06 / 78.16 | 123.70 / 143.92 | +55.64 | 20.178 | 20.195 |

## WordPress 7.1.4 / PHP 8.3.35: Twenty Twenty-Three (block)

| Body KiB | Clocks | 1.1.2 TTFB median / p95 ms | r6 TTFB median / p95 ms | Median delta ms | 1.1.2 used peak MiB | r6 used peak MiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 64 | 0 | 31.33 / 43.99 | 32.89 / 45.45 | +1.56 | 20.441 | 20.459 |
| 64 | 1 | 31.24 / 43.25 | 34.98 / 56.20 | +3.75 | 20.441 | 20.459 |
| 64 | 5 | 31.18 / 38.72 | 34.40 / 45.27 | +3.22 | 20.441 | 20.459 |
| 512 | 0 | 47.26 / 52.86 | 49.53 / 58.59 | +2.27 | 20.879 | 20.897 |
| 512 | 1 | 48.30 / 65.54 | 63.34 / 69.68 | +15.04 | 20.879 | 20.896 |
| 512 | 5 | 47.68 / 56.44 | 64.64 / 73.53 | +16.96 | 20.879 | 20.896 |
| 2048 | 0 | 105.24 / 122.05 | 108.18 / 115.18 | +2.94 | 26.545 | 26.562 |
| 2048 | 1 | 105.02 / 110.98 | 162.38 / 200.11 | +57.36 | 26.546 | 26.563 |
| 2048 | 5 | 106.52 / 128.91 | 162.87 / 220.57 | +56.35 | 26.547 | 26.564 |

## WordPress 6.3.14 / PHP 7.0.33: Twenty Twenty-One (classic)

| Body KiB | Clocks | 1.1.2 TTFB median / p95 ms | r6 TTFB median / p95 ms | Median delta ms | 1.1.2 used peak MiB | r6 used peak MiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 64 | 0 | 14.32 / 17.92 | 20.53 / 28.83 | +6.21 | 5.114 | 5.139 |
| 64 | 1 | 14.36 / 20.41 | 21.99 / 28.79 | +7.63 | 5.115 | 5.139 |
| 64 | 5 | 14.35 / 16.56 | 22.23 / 27.75 | +7.88 | 5.116 | 5.140 |
| 512 | 0 | 14.77 / 16.50 | 40.09 / 44.50 | +25.31 | 9.470 | 9.495 |
| 512 | 1 | 14.50 / 15.67 | 52.03 / 58.06 | +37.54 | 9.471 | 9.495 |
| 512 | 5 | 14.70 / 19.25 | 51.99 / 62.00 | +37.29 | 9.472 | 9.496 |
| 2048 | 0 | 15.54 / 20.85 | 108.11 / 123.41 | +92.57 | 24.398 | 24.422 |
| 2048 | 1 | 15.53 / 18.12 | 154.14 / 180.89 | +138.62 | 24.398 | 24.423 |
| 2048 | 5 | 15.56 / 19.04 | 154.60 / 160.54 | +139.04 | 24.399 | 24.424 |

## WordPress 6.3.14 / PHP 7.0.33: Twenty Twenty-Three (block)

| Body KiB | Clocks | 1.1.2 TTFB median / p95 ms | r6 TTFB median / p95 ms | Median delta ms | 1.1.2 used peak MiB | r6 used peak MiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 64 | 0 | 34.61 / 45.18 | 35.63 / 46.72 | +1.02 | 20.425 | 20.442 |
| 64 | 1 | 34.83 / 46.53 | 37.77 / 49.33 | +2.94 | 20.425 | 20.442 |
| 64 | 5 | 34.83 / 40.18 | 37.59 / 44.91 | +2.75 | 20.425 | 20.442 |
| 512 | 0 | 68.46 / 73.84 | 70.17 / 75.13 | +1.71 | 20.862 | 20.880 |
| 512 | 1 | 68.25 / 70.84 | 82.05 / 86.84 | +13.80 | 20.862 | 20.880 |
| 512 | 5 | 68.17 / 76.10 | 82.22 / 89.60 | +14.06 | 20.862 | 20.880 |
| 2048 | 0 | 185.03 / 195.92 | 187.48 / 195.59 | +2.45 | 30.421 | 30.438 |
| 2048 | 1 | 185.28 / 217.71 | 234.29 / 276.70 | +49.01 | 30.422 | 30.439 |
| 2048 | 5 | 184.89 / 202.03 | 233.41 / 242.24 | +48.52 | 30.423 | 30.440 |

## Attribution: r6 versus diagnostic control on PHP 8.3

The same source files are loaded in both variants. Positive differences isolate the complete new response-delivery mechanism subject to the stated fixture-oracle/head-placement boundary. Small empty-page differences can overlap local noise; larger clock-page differences are stable across matched rounds.

| Theme | Body KiB | Clocks | Paired median TTFB delta ms | Indicative 95% interval ms | Paired median server-duration delta ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Classic | 64 | 0 | +0.41 | -0.49 to +0.87 | +0.40 |
| Classic | 64 | 1 | +2.05 | +1.46 to +2.51 | +1.78 |
| Classic | 512 | 0 | -0.07 | -0.70 to +1.04 | -0.05 |
| Classic | 512 | 1 | +13.91 | +13.39 to +14.30 | +13.90 |
| Classic | 2048 | 0 | +1.19 | +0.23 to +2.16 | +1.65 |
| Classic | 2048 | 1 | +54.63 | +54.20 to +55.46 | +54.25 |
| Block | 64 | 0 | +1.14 | +0.27 to +2.50 | -0.29 |
| Block | 64 | 1 | +3.49 | +2.59 to +4.66 | +1.62 |
| Block | 512 | 0 | +2.26 | +1.22 to +2.83 | +0.43 |
| Block | 512 | 1 | +15.51 | +14.66 to +16.06 | +13.22 |
| Block | 2048 | 0 | +3.00 | +2.32 to +4.37 | -0.08 |
| Block | 2048 | 1 | +56.58 | +55.84 to +57.59 | +55.04 |

## Memory counter checks

The full CSV includes used and allocated peaks, their median/p95/min/max, and current usage before/after flush. On PHP 8.3 with 64 KiB bodies, used peaks are approximately **4.330 → 4.347 MiB** for the classic theme and **20.441 → 20.459 MiB** for the block theme. Allocated-page peaks are coarser and depend on retained allocator pages: for example classic 64 KiB medians are 8 MiB for both packages; some block-theme medians differ by allocator-page increments. Do not interpret those increments as a precise per-widget memory allocation.

On PHP 7.0, the native API sometimes reports a used peak larger than its allocated peak, including after bootstrapping WordPress without either clock plugin. The cause is **unconfirmed**; this report does not infer physical memory capacity from that absolute counter pair. A separate post-benchmark known-allocation test on the same Apache/PHP environments ran 12 bare/WordPress-bootstrap probes. A 32 MiB string changed used memory by **33,558,928 bytes** and allocated memory by **33,558,528 bytes**; releasing it returned used memory to within 64 KiB of baseline. This validates the observed allocation increments without resolving the absolute PHP 7 accounting discrepancy. Original benchmark samples were preserved unchanged.

In every main candidate sample, the peak was already reached before final flush. The measured high-water difference is therefore bounded to this workload; it cannot establish the buffer's standalone footprint or a worst-case production memory bound.

## Separate streaming diagnostic

A deliberate **200 ms footer delay**, with a 64 KiB body and one clock, was added only in this separate probe. These samples are excluded from all main tables. The classic theme on WordPress 7.1.4 already has Core's `wp_finalize_template_enhancement_output_buffer`, so all three variants wait for that footer. Other tested theme/runtime combinations begin sending earlier in the old/control variant but wait in r6.

| Runtime | Theme | 1.1.2 median TTFB ms | r6 median TTFB ms | Diagnostic control median TTFB ms |
| --- | --- | ---: | ---: | ---: |
| 7.1.4 / 8.3.35 | Classic | 251.68 | 251.81 | 248.29 |
| 7.1.4 / 8.3.35 | Block | 45.93 | 257.08 | 44.21 |
| 6.3.14 / 7.0.33 | Classic | 21.71 | 241.73 | 25.47 |
| 6.3.14 / 7.0.33 | Block | 49.59 | 265.19 | 51.08 |

The roughly 200 ms shift demonstrates an output-scheduling effect; it is not a claim that every real page becomes 200 ms slower.

## Evidence, reproduction and limits

- [Harness and exact method](../../../tools/wordpress-lab/performance/README.md) (repository-root path: `tools/wordpress-lab/performance/README.md`).
- [Machine summary](performance-2026-11-02-summary.json), [all condition statistics](performance-2026-11-02-conditions.csv), [paired deltas and intervals](performance-2026-11-02-paired-deltas.csv), [memory calibration](performance-2026-11-02-memory-calibration.json).
- Raw client/server rows, 108 checked initial HTML responses, native errors/handler observations, configuration, page/theme/source hashes and installed identity checks: `.local/wordpress-repro/perf-20261102-a/performance/`.
- Exact candidate ZIP and all 16 installable source hashes remain unchanged. All installed files for both variants match their original archives. Only the benchmark project was started/stopped; databases and evidence remain. Normal preview `debt-20261101-h` was not modified.

These are sequential warm local measurements, with no page cache, production concurrency, external font transport, browser execution, LCP/INP or real user network. Core versions, themes, content shape, PHP allocator behavior and existing output buffers affect the result. No production speedup, universal memory bound or streaming/optimizer compatibility is inferred. The functional acceptance report remains intact; performance findings add evidence rather than rewriting earlier results. No push or publication occurred.
