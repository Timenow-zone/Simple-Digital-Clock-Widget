# Native LocalWP upgrade acceptance: WordPress 1.1.3

Historical record for the initial `21ee03d` candidate and ZIP `adea5677...`. The revised package has a separate [iframe follow-up acceptance](IFRAME-ACCEPTANCE.md); the results and exact identity below remain unchanged.

Result: **PASS in the tested native LocalWP matrix; not published**. This follow-up verifies the unchanged candidate from source commit `9265e8d`. It is separate from the earlier Docker acceptance.

## Environment and package

- Local **10.2.0+7022**, macOS, native nginx **1.26.1**, PHP-FPM **8.2.29**, MySQL **8.4.0**, WordPress **7.1.3**, Twenty Twenty-Five.
- Two independent clones of the retained disposable SDCW test site were created through Local's **Clone site** command: `SDCW-113-From111-20261029` and `SDCW-113-From112-20261029`. The source site stayed stopped. Existing Exchange Rates test sites were not edited or stopped.
- Browsers: Chromium **151.0.7922.34** and WebKit **26.5**, using the host's Playwright test engines. WebKit engine coverage does not mean a manual Safari run.
- Pinned official predecessor ZIPs: 1.1.1 `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`; 1.1.2 `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`.
- Candidate ZIP SHA-256: `adea5677469b98d8c94373af64202bb1dce5b91d5e340273f0f0a86a4c4b5b17`. All **15 installed files** matched the existing candidate manifest after each upgrade and at completion. The ZIP was not rebuilt or repacked; plugin code and version metadata were unchanged in this follow-up.

## Workflow and results

Each predecessor's actual Gutenberg serializer created **1,423 cases per role** on its own native site. The corpus covers selector choices, all boolean combinations, widths, captions, entity layers and mixed options. Posts, Group/Columns, a synced pattern, Custom HTML, active/inactive block widgets and an unrelated text widget were included. Each site had 79 tracked records and 4,897 native clock occurrences when widget and additional coverage is included. Role-owned fixtures were initially saved by Administrator in UTC so that 1.1.1's known Author-save defect did not damage the upgrade input. Baseline parsing used UTC; candidate parsing and role saves used New York.

Updates used WordPress `Plugin_Upgrader::bulk_upgrade` with `WP_Ajax_Upgrader_Skin`, invoked through native WP-CLI with a pinned local ZIP offer. This was the Core upgrade implementation, **not a click on a WordPress.org update offer and not an HTTP admin-AJAX request**. The candidate remains unpublished. Complete post-row hashes and checked URL, activation, widget, theme and timezone settings matched exactly immediately before and after both updates.

| Check | Result |
|---|---:|
| Native 1.1.1 to 1.1.3 and 1.1.2 to 1.1.3 updates | 2/2 |
| Site/browser pairs | 4/4 |
| Native block checks per complete parser/resave matrix | 19,588 passed |
| Visible Gutenberg preservation Save/Update actions | 24/24 |
| Additional Caption and Width edits through actual Gutenberg fields and Save/Update | 12/12 |
| Repeated initial-layout samples, matching a manual resize | 24/24 |
| Container width changes and hidden-to-visible samples without a window resize | 24/24 |
| PHP invalid-numeric-reference assertions | 1,952 passed |
| Anonymous frontend captions after Author UI saves | 216/216 |
| Final render/probe frontend page visits | 288 |
| Clock render observations in those final sweeps | 17,928 |
| Live ticking checks | 4/4 |

Administrator, Editor and Author were tested. The same seeded IDs survived the upgrade and successive browser resaves; no database reset or fixture restore was used between them. Old native captions, original caption JSON, browser-decoded HTML attributes and neighboring blocks retained their checked semantics. Additional UI edits combined literal markup, escaped layers, null/surrogate/out-of-range references, Cyrillic and emoji, then changed Width from 240 to 360. Both fields persisted after reload, rendered caption text matched the saved DOM attribute, and the frontend clock measured 360 CSS pixels.

Initial layout was sampled across repeated visits before dispatching a manual resize. Dynamic samples changed the actual frontend parent width to 240 and 480 pixels, then hid and showed it. Automatic and manually remeasured geometry matched within 0.001 CSS px, with no resize/runtime error. The responsive sweeps also covered 390/768/1440 viewports, UTC/Tokyo/New York browser zones and representative DST/year/leap-day boundaries. Attributes, caption text and checked styles matched predecessor baselines. Eighteen recorded height differences in WebKit were confined to intended automatic-width/hundredths cases at the same width; pixel-identical sizing is not claimed.

The PHP regression exercised 75 entity forms per site through real Author title-only and repeated saves, content/excerpt/filtered-content fields, widget filtering and unsafe-attribute rejection. No clock-source PHP issue was found in the retained logs for this follow-up date.

## Test setup finding and limits

The first additional WebKit settings test timed out while trying to click the Container panel. An initial follow-up could not locate that panel after selecting the block. These attempts are retained as failures, not counted as successful saves. Explicitly opening Gutenberg's `edit-post/block` sidebar made the test precondition deterministic; the repeat passed all six WebKit Caption/Width saves using ordinary pointer clicks. An independent recheck recorded ten identical button rectangles and a successful normal click. The precise cause of the original transient state was not proven; this evidence does not establish a plugin defect. No product code or forced-click workaround was introduced.

This cycle covers native Local's existing **HTTP localhost routing**, single-site WordPress 7.1.3/PHP 8.2.29, and the two listed engines. Native HTTPS, multisite, Firefox and arbitrary theme/plugin combinations were not added here. External requests, including Google Fonts, were blocked by the browser tests; font selections and fallback rendering were covered, external font delivery was not. Reading or repairing already-damaged historical posts is outside this upgrade-preservation claim. Native rollback was not repeated; predecessor ZIPs, complete fixture content and clone data remain available.

Both new Local sites were stopped through Local's UI. Their ports refused connections afterward; databases/files/evidence were retained. The two previously running Exchange Rates sites remained running. No push, tag, PR, WordPress.org publication or user-site update occurred.

Machine-readable summary: [localwp-evidence.json](localwp-evidence.json). Private orchestration, credentials, old cloned MU-plugin files, raw JSON, screenshots and retained failed attempts are under `.local/localwp-113-20261029/`; credentials and runtime data are excluded from Git. Restart either named site through Local before inspecting its saved posts. Test-source and package hashes remain in the existing [1.1.3 report](README.md).
