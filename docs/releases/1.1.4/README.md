# WordPress 1.1.4 candidate with widget 0.8.1

Status: **candidate; final Docker acceptance and required CI pending; not published**. [PR #11](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/11) prepares this exact package. No PR merge, WordPress.org publication, npm publication, tag or production CDN delivery is performed.

## Exact package and preserved artifacts

- ZIP: `.local/packages/simple-digital-clock-1.1.4-widget-0.8.1-candidate.zip`, **15 installable files**.
- ZIP SHA-256: `5963f94742828d8d91de77bf58d13a630de8d712d4e3af18709055de777d6088`.
- Widget: **0.8.1**, **36,009 bytes**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Widget source commit: `b44f944b60babf45bf266e73ba12f7eba53cfef2`. An independent snapshot rebuilt with the exact `npm run build` recipe produces identical JavaScript. The generic Parcel API smoke check is a different recipe and is not used as the byte-identity check.
- [15-file manifest](manifest.json) and [package preflight](preflight-evidence.json). Acceptance belongs to this archive; a rebuilt ZIP needs its own identity and acceptance.

The first 1.1.4 candidate with widget 0.8.0 remains at `.local/packages/simple-digital-clock-1.1.4-candidate.zip`, SHA-256 `a2464553084ec244dbd3b77b87a3bb49f3da7b5f0e4586ab32311e35362a112f`. Its [failed visual gates and original acceptance](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/blob/28a20cbfd78a24988a5f4e325581c40dd5d18da6/docs/releases/1.1.4/README.md) remain historical evidence. The frozen 1.1.3 ZIP and all seven previously published versioned widget bundles are also unchanged.

## Changes and fixed visual gates

Only four plugin files differ from frozen 1.1.3: bundled JavaScript, plugin/cache versions in `widget_init.php`, POT project version and readme metadata/changelog. All eleven other files, including `block.js` and KSES, are byte-identical. No saved-block schema or database migration is introduced. Relative to the first 1.1.4 candidate, only the JavaScript, cache version and readme change; the plugin version remains 1.1.4. Readme CRLF and existing prose are preserved; both gzip size claims are now approximately 12.2 KiB.

Widget 0.8.1 retains the Preact 11.1.0 dependency set from 0.8.0 and makes two bounded fixes:

1. Treat the Google stylesheet as settled after failure, then await a matching theme-provided face and refit. The failure remains explicitly reported. Request identifiers and connected-state checks still prevent stale font callbacks after a font change or removal.
2. Apply `white-space: nowrap` to the time anchor while retaining the natural-width clamp and bounded font-size refinement. Captions and dates retain their existing wrapping. This prevents WebKit from restoring a stale multiline layout after shrinking Amharic time.

The [0.8.1 regression record](../0.8.1/README.md) separates immutable 0.8.0 RED controls from the rebuilt package's GREEN results. Measurements record untouched Range geometry before any natural-width probe that could force a reflow. A licensed, test-only Fira Code fixture with explicit 150% size adjustment makes the font metric change deterministic; installed-package tests separately exercise the unadjusted theme font.

## Upgrade acceptance

Official 1.1.2 is directly tested in **six environments**: five Docker configurations and a fresh independent site using native Local service binaries. The wider Docker matrix also checks official 1.1.1 and the frozen **unpublished** 1.1.3 candidate. Public 1.1.3 delivery must not be inferred from that local archive.

| WordPress | PHP | Docker predecessors |
| --- | --- | --- |
| 6.3.2 | 7.0.33 | 1.1.1, 1.1.2 |
| 6.3.2 | 7.4.33 | 1.1.2 |
| 6.3.2 | 8.2.12 | 1.1.1, 1.1.2 |
| 7.1.3 | 8.3.35 | 1.1.1, 1.1.2, frozen 1.1.3 |
| 7.1.3 | 8.5.12 | 1.1.1, 1.1.2, frozen 1.1.3 |

Each browser run uses Chromium, Firefox and WebKit. The corpus covers 1,423 selector/boundary/deterministic mixed cases per role, posts, nested containers, a synced pattern, Custom HTML, active/inactive block widgets and an unrelated Text widget. This is not an exhaustive Cartesian product.

### Docker

All eleven real Core HTTP AJAX upgrades installed the pinned archive, preserved full post rows and checked settings, and matched all fifteen installed-file hashes. The retained disposable databases/corpus are reused after physical predecessor-file restoration, without database resets or reseeding. Fresh predecessor baselines and new candidate results are kept separately from the earlier 0.8.0 evidence. Full save, render, rollback and reupgrade results are still being collected; see [Docker evidence](docker-evidence.json).

Actual installed-package probes already pass the original Amharic WebKit case across twelve untouched frames and two unadjusted local Fira Code cases in all three engines. In the longer `es-pe` case, every engine demonstrably shrinks the loaded font and reaches the same geometry as a subsequent manual resize. That manual event occurs only after the automatic-fit assertion.

### Fresh native Local runtime

A new independent 1.1.2 site used Local 10.2 service binaries directly: nginx 1.26.1, PHP-FPM 8.2.29, MySQL 8.4.0 and WordPress 7.1.3 with Twenty Twenty-Five. This was not Local app UI orchestration. Chromium/WebKit used host Playwright; Firefox used the isolated Linux browser server against the native HTTP backend.

- One Core update, one physical 1.1.2 rollback and one Core reupdate passed without restoring the database. Core `Plugin_Upgrader::bulk_upgrade` with AJAX skin ran through WP-CLI, rather than HTTP AJAX. Complete post rows/options stayed unchanged and all 15 installed files matched.
- Six parser/save/reader stages each passed **14,691 block checks** across three engines. **18 visible preservation saves**, **nine Caption/Width saves**, **108 anonymous caption comparisons** and **976 numeric-caption PHP assertions** passed.
- **4,269 stored-clock fitting observations**, **45 focused checks**, final rendering of 156 pages and responsive/calendar probes passed. All three post-reupdate clocks ticked. Actual browser JavaScript responses used `ver=0.8.1`, the accepted hash and runtime version. No unexpected runtime or ResizeObserver error was recorded.
- The actual unadjusted delayed local Fira Code face fitted automatically with Google CSS blocked. Amharic passed eight untouched frames per engine after three readiness frames. The old Amharic defect did not reproduce in this native DOM; that RED control belongs to the separate permanent test and minimum-theme Docker case.

A Firefox navigation timeout passed a bounded retry of only its affected render group. One first WebKit frame-zero overflow lacked saved numeric values; the same assertions passed on replay and eight additional cold contexts passed every frame. Early sampling is suspected, not causally proven. These attempts remain in the [native evidence](native-runtime-evidence.json). The site's three processes are stopped, port 19952 is closed and shared Local configuration hashes are unchanged.

## Repository checks, isolation and release boundaries

Three TypeScript configurations, ESLint, 22 Node tests, 26 release/prose tests, two package guards and release metadata/identity checks passed locally. The package guard also rejected a coherently updated manifest with an intentionally stale script-cache version. Production-bundle font/layout tests pass 10/10 and iframe tests pass 3/3 across three engines, with the same-file immutable 0.8.0 negative controls retained. Required CI is still pending. Green repository CI does not replace the disposable-site update cycle.

`npm run site:build` generated the 0.8.1 Cloudflare asset locally; it matches `dist/0.8.1.min.js` byte-for-byte. **Production delivery is pending.** The production CDN remains on 0.8.0; no current task action deploys it. A future authorized delivery must preserve the previous deployment and verify public HTTP status, SHA-256, version/cache metadata and live clocks.

Only disposable sites are used; original user sites, shared Local routing, unrelated containers and historical evidence are preserved. A rollback installs predecessor files without restoring the database. It does not repair old damaged captions or certify buggy 1.1.1 save paths. Multisite, native HTTPS, Local UI automation, historical browser minima, arbitrary hosts/themes, real external Google transport and a public WordPress.org update offer are outside this acceptance.
