# Widget 0.7.2: dependency refresh

Status: **published to the production demo/CDN on 2026-10-30**; see the [publication record](PUBLICATION.md). PR #10 remains open. This is a standalone widget release. The accepted WordPress 1.1.3 ZIP and all 15 plugin files retain widget 0.7.1 and their existing hashes.

## Dependency changes

| Package | 0.7.1 | 0.7.2 | Registry result |
| --- | --- | --- | --- |
| `preact` | 10.29.8 | **11.1.0**, pinned | Latest stable; major upgrade |
| `preact-custom-element` | 4.6.0 | 4.6.0 | Already the latest stable; its peer range accepts Preact 11 |
| `clsx` | 2.1.1 | 2.1.1 | Already the latest stable |

The registry was checked on 2026-10-30. No other resolved dependency version changed. The redundant development package `@types/preact-custom-element@4.0.4` was removed: preact-custom-element 4.6.0 includes its own declarations, and the old external types otherwise install a second Preact 10 copy. There is one runtime Preact version, without peer overrides or a compatibility shim.

## Required migration

[Preact's official upgrade guide](https://preactjs.com/guide/v11/upgrade-guide/) documents that core no longer adds `px` to numeric CSS lengths. Installing Preact 11 alone reproduced four failing Chromium container tests. Width, minimum width, clock text and caption/date/timezone font sizes now use explicit pixel strings. Existing zero/automatic widths, the 80 px minimum and sizing formulas remain unchanged. Clock algorithms, attributes, saved WordPress data and CSS rules were not redesigned.

The new browser regression exercises widths 210, 330, 20 and 0, removes the explicit width, narrows the parent below 80 px, and checks all caption/date/timezone font sizes plus literal caption text. It runs in the existing required Browser tests job.

## Accepted artifact

- Artifact: `dist/0.7.2.min.js`, byte-identical to `dist/latest.min.js`.
- SHA-256: `9068d236e2dcff33a01d1aac5de9b13eb9cf2c69837f4ed3b3f7a3089721a0af`.
- Minified: **34,460 bytes**; gzip level 9: **12,026 bytes**, measured with Node 26.8.2/zlib 1.2.12.
- Relative to 0.7.1 with the same encoder: +418 minified bytes and +250 gzip bytes.
- All five earlier versioned bundles remain byte-identical. The site builder retains all six versioned CDN scripts and their immutable headers.

## Validation

- All three TypeScript configurations, ESLint, 22 Node tests, 26 release/prose tests, metadata checks and an independent temporary production build passed.
- Chromium and WebKit: **36/36 existing and new widget tests per engine**. The production iframe test passed five paired-frame visits per engine, including parent/viewport resizing and hidden-to-visible transitions, without filtered errors.
- Real old/new production bundles were compared at a fixed UTC time: **96 cases per engine**, combining six locales, widths 80/180/320/600, AM/PM, dates and hundredths. Chromium and WebKit preserved time/caption/date text, label visibility, colors, width/height and font sizes within layout rounding tolerance. No page or child-window errors occurred.
- Local macOS Firefox could not start test pages. Its product tests are not counted as passed; all three engines remain mandatory in Linux CI before delivery.
- Production-only npm audit: **0 findings**. The full audit has zero moderate/high/critical findings and five inherited low development entries; the existing deepmerge advisory is unchanged.
- [Machine-readable local acceptance](acceptance.json) retains the pre-delivery snapshot. The subsequent CI and public checks are recorded in the [publication record](PUBLICATION.md). Raw failures, comparisons, screenshots, audit data and the frozen predecessor inventory are retained under ignored `.local/widget-072-20261030/`.

The comparison uses native monospace fonts. It does not certify remote font swaps, older browser minima, every third-party host/theme, or a WordPress upgrade to widget 0.7.2. No WordPress package is rebuilt or published by this release.

## Delivery and rollback

Use the tested versioned artifact through the existing Cloudflare version-upload/deploy workflow after the required PR checks pass. Verify the production page and `/version.json`, the exact public JS SHA-256, immutable cache headers, all earlier script URLs, and live clocks. Record the source commit and Cloudflare version/deployment IDs separately from these local results. No npm package, Git tag or PR merge is implied by CDN delivery.

Save the current production deployment before switching. If public verification fails, restore that deployment at 100%; preserve every published versioned script and do not overwrite 0.7.1 or earlier bytes.
