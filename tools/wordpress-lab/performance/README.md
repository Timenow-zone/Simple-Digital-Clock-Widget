# Local WordPress response performance comparison

This harness compares exact public 1.1.2, accepted buffered 1.1.4 r6 and the
new streaming 1.1.4 candidate in the same measurement series. It measures anonymous HTML requests, not browser rendering, JavaScript
execution, Core Web Vitals or production network latency. It creates fresh,
owned Docker projects/databases and stops only those projects. Existing preview
sites, release ZIPs and installable source files are never changed.

## Controlled setup

Each native reference (WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35)
uses one database, one Apache worker and all three exact plugin directories. A test-only
MU filter selects exactly one plugin per request. Both environments use identical
Twenty Twenty-One and Twenty Twenty-Three theme files from the pinned minimum-Core
archive. A request-scoped theme filter avoids changing stored options between
observations. No public DNS/service, authentication or owner-site credentials are
used by benchmark requests.

The three variants are:

- `legacy`: exact public 1.1.2 files.
- `buffered`: exact accepted r6 files, with its normal whole-response buffer.
- `candidate`: exact manifest-bound streaming candidate, with its normal observer.

There is no request-time override of any delivery hook. The earlier r6-versus-
oracle benchmark remains preserved with its executed harness under
`.local/wordpress-repro/perf-20261102-a/performance/`; the analyzer supports that
historical variant list as well. Fresh runs use three real plugin archives.

Nine stored pages combine 0, 1 or 5 clocks with approximately 64, 512 or 2,048 KiB
of body HTML. Complete clock blocks follow the same paragraph content, exercising
late detection. Actual HTTP response bytes are recorded separately. The page
hashes and IDs are retained. No content is saved through the old plugin writer.

OPcache is enabled, JIT and timestamp validation disabled, and all plugin/theme
files are fixed before starting PHP. PHP output buffering is 4,096 bytes;
compression, cron, external WordPress HTTP and page caching are disabled. Requests
are sequential, anonymous, uncompressed HTTP/1.1 with fresh connections over
loopback. Within each matched scenario/round, all three variants are exercised in
rotating order; scenario order is reproducibly shuffled. These controls reduce
host drift but do not make Docker Desktop a production capacity model.

## Metrics

Curl's `time_starttransfer` supplies TTFB; `time_total`, connection time, response
size and status are retained. The PHP observer records execution time and both
`memory_get_peak_usage(false)` (used Zend heap) and `memory_get_peak_usage(true)`
(allocated heap pages). These are per-request PHP heap measurements, not process
RSS, container memory or shared OPcache usage. Peaks are sampled **after** native
Core's shutdown buffer flush, so the candidate's final tokenizer and replacement
are included. Before-flush peaks and buffer handler lists verify this timing.
The small observer is identical across variants; its log serialization/write occurs
after the samples. Every request must have exactly one matching server observation.

A separate streaming diagnostic adds 200 ms of deliberate footer work. It is
excluded from normal latency summaries and only tests whether first-byte delivery
waits for late work. It is not a measured production slowdown.

Official metric definitions: [curl write-out](https://curl.se/docs/manpage.html#-w)
and [PHP peak memory](https://www.php.net/manual/en/function.memory-get-peak-usage.php).

## Run and rollback

```sh
set -euo pipefail
python3 tools/wordpress-lab/performance/run.py \
  --id perf-YYYYMMDD-a \
  --candidate .local/packages/simple-digital-clock-1.1.4-streaming-r8-candidate.zip \
  --buffered .local/packages/simple-digital-clock-1.1.4-final-output-r6-candidate.zip \
  --cache .local/wordpress-repro/final-output-r6-20261101-a/downloads
```

The default is 5 warmup and 45 measured requests per condition, plus 10 streaming
probe requests per condition. New IDs are mandatory; old evidence is never
replaced. Required tools are Python 3.9+, PHP, curl with JSON write-out, Docker
Compose and the pinned cached downloads/images from the reproducible lab. Raw
results live in `.local/wordpress-repro/<id>/performance/`. The harness records
installed package identities again at close. It retains databases, logs and failed
attempts; rollback consists of stopping the newly owned project, not restoring an
owner database. Use the reproducible lab's `stop --id` command after interruption.

Report median and p95 TTFB, used and allocated peak PHP memory, matched per-round
deltas and uncertainty. Warmup observations and the artificial streaming probe
must remain separate. Validate content, active plugin selection, status, OPcache,
heap sampling phase and resource output before interpreting any timing result.
An earlier functional GO is not a performance acceptance decision.

## Summaries and memory calibration

After a successful run, generate median/p95 tables and matched-round deltas:

```sh
set -euo pipefail
python3 tools/wordpress-lab/performance/analyze.py \
  .local/wordpress-repro/perf-YYYYMMDD-a/performance
```

The analyzer excludes warmups and keeps the synthetic footer delay separate. It
writes `summary.json`, `conditions.csv` and `paired-deltas.csv`; raw observations
are never changed. The dated release report may append quality interpretation to
its summary copy, while all raw rows remain authoritative.

`memory-calibration.php` is a test-only endpoint for a separate post-benchmark
known-allocation check (bare PHP and `?bootstrap=1` for WordPress bootstrap). It
must only be copied into the owned benchmark document root and requested through
its loopback port. It is never a plugin package file. The November 2 run retained
12 such observations separately: allocation/release increments track the known
32 MiB string, while PHP 7's absolute used/allocated counter discrepancy remains
unexplained. Do not use that absolute pair as a physical capacity estimate.

PHP high-water marks can already have been reached before the final response
handler. Inspect `peak_before_flush` as well as the end-of-request peak; a small
peak difference does not measure the standalone buffer footprint. Shared-host
noise, p95 from 45 samples, page-size/content placement and Core's own buffers are
explicit limits. Source/archive checks and the observer's zero remaining buffer
count are mandatory before trusting output.
