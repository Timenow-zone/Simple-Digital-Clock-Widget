# Widget 0.8.1 production publication

Published and verified on **2026-10-30**, after [PR #11](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/11) merged. This record covers the standalone demo/CDN. WordPress 1.1.4 remains an unpublished, independently versioned candidate.

## Source and deployment

- Accepted PR head: `8457ac17790412b018f471aede37073cc64de30f`.
- Main merge commit: `bf6c4e6afc28236b2191a97f53046f295107a0d1`, merged at **16:05:16 UTC**. Its complete tree is identical to the accepted PR tree; the runtime source commit remains `b44f944b60babf45bf266e73ba12f7eba53cfef2`.
- All three PR checks passed before the SHA-guarded merge. [Main CI run 41086672526](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41086672526) passed Repository checks and Browser tests; the Cloudflare main build also passed.
- The configured Cloudflare Git integration built and deployed main automatically. No manual artifact substitution or duplicate deployment was used.
- Cloudflare build: `06198f57-e26c-4065-b62f-bce658353234`.
- Worker version: `49773ac2-fd37-43b8-93fa-a2fa1bc879f0`.
- Production deployment: `e6229332-a27a-4595-8cf4-3a6d63a43f7e`, created at **16:09:21 UTC**, **100% traffic**.

## Public verification

The [production site](https://simple-digital-clock-widget.yuri.ws/) and [version metadata](https://simple-digital-clock-widget.yuri.ws/version.json) report **0.8.1**. The page references the correct versioned script and new main merge commit.

[Production JavaScript](https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.1.min.js): HTTP **200**, **36,009 bytes**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`. It is byte-identical to accepted `dist/0.8.1.min.js` and the WordPress bundle. All **eight** versioned script URLs return HTTP 200 with exact retained bytes, one-year immutable caching and `nosniff`; page and metadata responses require revalidation.

Public metadata records gzip level 9, **12,491 bytes**, with Node v24.22.1/zlib 1.3.2.1-motley-285e94b. The local acceptance measured 12,446 bytes with a different encoder. This does not change the uncompressed JavaScript or its SHA-256.

Chromium and WebKit each rendered all **eleven runtime-0.8.1 clocks** and observed all eleven ticking. Timezone, locale, literal captions, hundredths, widths, reset, presets, the source link and generated 0.8.1 embed code passed. Desktop 1440 px and mobile 390 px views were checked. Five paired-clock iframe visits per engine passed resizing and hidden-to-visible checks, with zero unfiltered page/child-window errors and zero console errors on the public site.

Supplemental local documents loading the actual public asset passed both fixes in both engines. Amharic at 200 px remained on one line over twelve untouched frames. The actual unadjusted theme Fira Code face at weight 300, delayed 1,000 ms after deliberate Google CSS failure, automatically fitted the 768 px es-PE case and matched the later manual-resize control. Intentional blocked-Google diagnostics were retained explicitly; no other runtime error was filtered. No retry was required. All own HTTP servers and browser contexts were closed.

The [machine-readable publication evidence](publication.json) records HTTP/cache results, browser scope, source/check IDs, deployment and rollback. Raw reports and screenshots remain under ignored `.local/widget-081-publication-20261030/`. The [acceptance snapshot](acceptance.json) remains the earlier pre-delivery regression evidence and was not rewritten as publication evidence. Current host Playwright Chromium/WebKit were used; this was not a manual Safari or native Firefox UI run, and no WordPress installation or update acceptance is implied by this CDN smoke test.

## Rollback and boundaries

The previous production deployment was preserved before merging: deployment `dd6a5615-1267-49d6-95d6-c1f2bfe39546`, Worker version `1df4534b-5203-47f1-a51d-9eaa3a02a2de`, widget 0.8.0 SHA-256 `5661f6c054aad7c2f77f7ecd8912d6e41fca0c6079c8a4be498ab1847de939d0`. Rollback was prepared but not executed. Restore that version at 100% if necessary without replacing immutable asset bytes.

All eight local versioned bundles, three then-retained WordPress candidate ZIPs and fifteen then-current WordPress files retained their hashes during publication. The 1.1.4/0.8.1 ZIP at that time was `5963f94742828d8d91de77bf58d13a630de8d712d4e3af18709055de777d6088`; this historical identity does not certify a later minimum-requirement header revision. No WordPress.org/SVN publication, installed-site update, npm publication or Git tag was performed.
