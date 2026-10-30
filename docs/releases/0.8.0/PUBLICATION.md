# Widget 0.8.0 CDN publication

Published on **2026-10-30**, after all required checks passed for source commit [`2dc1d0fd8e2cfe6100434561de3ffbd83003263f`](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/tree/2dc1d0fd8e2cfe6100434561de3ffbd83003263f). [PR #10](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/10) remains open and unmerged.

- [Production demo](https://simple-digital-clock-widget.yuri.ws/) and [version metadata](https://simple-digital-clock-widget.yuri.ws/version.json) report **0.8.0** and reference the correct versioned script and existing source commit.
- [Production JavaScript](https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.0.min.js): HTTP **200**, **35,922 bytes**, SHA-256 `5661f6c054aad7c2f77f7ecd8912d6e41fca0c6079c8a4be498ab1847de939d0`, byte-identical to accepted `dist/0.8.0.min.js`.
- The script has one-year immutable caching and `nosniff`; page/metadata require revalidation. All **seven** versioned scripts, including unchanged 0.7.2 and all older files, return HTTP 200 with matching bytes and immutable headers.
- Cloudflare Worker version: `aec45f34-6cb3-43dc-a273-58d2c683f5e2`; production deployment: `d4e9df90-be9b-45d4-8950-a5c34d49ffa4`, created at **10:09:04 UTC**, **100%** traffic. The tested build preview was promoted directly; no second artifact was substituted.

## Verification

[Source CI run 41038100271](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41038100271) passed Repository checks and Browser tests; the Cloudflare build also passed. Browser logs confirm **37 tests per engine** in Chromium, Firefox and WebKit, **3 production iframe tests**, and **4 font tests**, including a pending unrelated font. There were **zero failures and zero skips**. This includes the Chromium/Linux quantized-font case that failed in earlier candidates.

Both preview and public production passed Chromium/WebKit smoke checks: 11 live clocks, ticking, builder timezone/locale/caption/hundredths/width/reset/preset/embed controls, 1440/390 px views, and five paired-clock iframe visits per engine, without filtered page or child-window errors.

The [machine-readable publication evidence](publication.json) records HTTP results, metadata, hashes, browser scope, source CI and deployment IDs. The [acceptance snapshot](acceptance.json) remains the earlier local, pre-delivery record. No WordPress editor or upgrade acceptance for widget 0.8.0 is implied.

## Rollback and boundaries

Previous production 0.7.2 deployment: `2bb10006-9b4b-4a32-b154-d8904b5a596d`, Worker version `0512f780-f937-4384-b84c-50c8957ea1a5`. Restore that version at 100% if rollback is needed; keep published immutable files unchanged.

No PR merge, npm publication or Git tag was performed. All 15 WordPress files and the frozen WordPress 1.1.3 ZIP retain their accepted hashes. ZIP SHA-256: `1f42bd43152501499212a06a19286fbb562e5e51338a87c0a533200b31b344b0`; its bundled widget remains 0.7.1.
