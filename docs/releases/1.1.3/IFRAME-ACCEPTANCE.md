# WebKit iframe observer follow-up: 1.1.3

The revised candidate removes the WebKit ResizeObserver warning without changing WordPress **1.1.3** or widget **0.7.1**. This package is unpublished. It replaces the initial candidate in PR #9; earlier acceptance keeps its original artifact identity.

## Cause and minimal fix

The observer callback read `containerRef.offsetWidth` while WebKit was delivering a size snapshot for an iframe. The trace showed an initial delivered height of zero followed by layout completion and the observation error. A control with an empty callback did not warn. Reading the supplied `entry.contentRect.width`, while keeping actual DOM measurement in the existing animation frame, removed the warning. A target guard ignores an obsolete element after teardown.

The production change is confined to the callback in `src/SimpleDigitalClockWidget.tsx`. There are no new runtime timers, observer reconnection loops, DOM elements, error handlers or suppressed errors. PHP, block serialization, permissions, saved-data schema and dependency versions are unchanged. General observation-error semantics are documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors).

## Regression and verification

`tests/iframe-resize.integration.test.mjs` serves the actual minified production bundle and its embedded CSS on an ephemeral loopback server. Two real HTTP iframe documents load together, then change parent width and iframe viewport, hide and reappear. Five independent visits run per engine. Both page errors and child-window errors fail the test without filtering. Browser/server resources close even on failure.

The previous bundle fails this test in WebKit with `ResizeObserver loop completed with undelivered notifications.` The revised bundle passes locally in Chromium and WebKit. `npm run test:browsers` now runs this integration suite after WTR, so the existing required Browser tests CI job also runs it in Chromium, Firefox and WebKit. WTR's virtual CSS alone could not reproduce the reported warning.

- Local existing widget tests: **35/35 in Chromium and WebKit**.
- Local production iframe tests: **5 visits with two clocks per engine**, zero errors in both tested engines.
- Original review demonstration: **15 WebKit visits**, zero warnings across old/old, old/new and new/new controls; before the fix, pairs containing the initial candidate warned in 5/5 visits.
- All three TypeScript configurations, ESLint, 22 Node tests, 24 release/prose tests, release checks and an independent temporary build passed. The dependency audit passed the moderate threshold; the five existing low affected development packages remain unchanged.
- Local Firefox is left to the required Linux CI run; this report does not claim a native macOS Firefox run.

## Exact revised ZIP and native upgrades

- ZIP: `.local/packages/simple-digital-clock-1.1.3-candidate.zip`.
- ZIP SHA-256: `1f42bd43152501499212a06a19286fbb562e5e51338a87c0a533200b31b344b0`.
- Widget SHA-256: `affc4417099de256553267060e056e296023781ec8a1ef1382370143de080bb6`.
- Widget: 34,042 bytes; gzip level 9: 11,776 bytes, Node 26.8.2/zlib 1.2.12.
- [Current 15-file manifest](manifest.json). Only the public JS and README changelog differ from the [previous candidate manifest](previous-candidate-manifest.json). The published 0.7.0 artifact is unchanged.

Both native LocalWP sites were returned to their pinned official **1.1.1** and **1.1.2** packages, then received fresh role-owned fixtures from those versions' actual serializers. Each had 1,423 variants per role. WordPress `Plugin_Upgrader::bulk_upgrade` with a local pinned ZIP offer, invoked through native WP-CLI, performed both updates to the revised package. Complete post-row hashes and checked settings matched across each update. This is not an HTTP admin-AJAX run or a public WordPress.org offer.

On Local 10.2.0/nginx 1.26.1/PHP 8.2.29/MySQL 8.4.0/WordPress 7.1.3 with Twenty Twenty-Five, all four Chromium/WebKit site pairs passed: **19,588 block checks per complete matrix**, **36 visible Gutenberg saves/field edits**, **24 initial-size samples**, **24 container-change samples**, **288 final frontend pages** and **17,928 clock render observations**. Administrator, Editor and Author saves preserved checked caption JSON, decoded attributes, neighboring blocks and widget semantics. The 75-case PHP caption suite passed **1,952 assertions** across the two sites. No database reset or fixture restore occurred between candidate browser saves.

The initial responsive-widget probe encountered extra widgets retained from the earlier run. Its timeout logs are preserved. Only the new fixtures were moved to a distinct test sidebar/query parameter, leaving old widgets and their content intact; baseline probes then passed before either upgrade. No product change was used to resolve that setup issue.

Both test sites are stopped with files, databases and evidence retained. Other Local sites were not stopped. The local review demonstration remains available on its existing loopback URL with the corrected bundle.

## Scope and retained evidence

The original nine-site Docker and earlier LocalWP results belong to the prior ZIP, not this new checksum. They are retained in the [initial candidate record](README.md#initial-candidate-record-21ee03d) and [earlier native report](LOCALWP.md). This follow-up adds exact revised-package native upgrades and production iframe coverage. Native HTTPS, multisite, external Google Fonts delivery and a fresh full Plugin Check run were not added here. Previously damaged content is not automatically repaired.

Machine-readable current results: [iframe-followup-evidence.json](iframe-followup-evidence.json). Raw failures, traces, repeat controls and local orchestration are retained under `.local/resize-observer-followup/`; credentials and private runtime data are excluded from Git. The old ZIP is retained there as `previous-candidate.zip`. Publication and merging still require separate authorization; neither occurred during this follow-up.
