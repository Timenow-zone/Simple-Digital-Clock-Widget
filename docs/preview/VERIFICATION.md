# Earlier Live Preview gallery verification — 2026-10-29

Historical snapshot of the unpublished nine-clock local gallery retained in `blueprint-gallery.json`. Use [guided verification](GUIDED-VERIFICATION.md) for the later published flow.

At this stage `wordpress/wporg-assets/blueprints/blueprint.json` was **19,949 bytes**, SHA-256 `ebdd5f5db02f37b6f947ea41e68d5626d5af140b134b5d2750f25f0cc7ad73ef`. That path now contains the later guided asset; the historical gallery bytes remain separately retained.

## Initial observations

The ordinary button launched public r3772712. Fresh Chromium loaded all nine working custom elements; clean Playground without the plugin also loaded. No general plugin startup defect was found.

An existing Chrome profile and the in-app browser showed a blank screen or `WordPress request transport did not start`; Chrome had OPFS errors. User storage/settings were not cleared and the exact profile-related cause remained unknown.

The original blueprint ran in official local CLI. At 1280×720 the theme navigation/title displaced clocks below the first screen, with no dedicated installation CTA. Execution disproved the suspected PHP escaping defect: literal backslash-n/backslash-quote artifacts were absent from actual HTML.

## Gallery changes

The visitor immediately sees the product, two actions and the first row of live clocks. Nine examples cover independent timezones, system fonts, localized dates, AM/PM, 24-hour display, hundredths, compact width, captions and styles. Customize opens real Gutenberg within the current Playground; native Caption saves round-trip to the frontend. Installation guidance does not install the plugin elsewhere.

Presentation removes extra theme layers, Google Fonts dependency and fixed primary-clock width. It improves selected gradient contrasts, heading order, the single main landmark and visible focus. No full WCAG/assistive-technology certification was performed.

Native serializer parity requires HTML `period="false"` for block `period=true`; empty font-family is omitted to retain block validity.

## Local acceptance

Official CLI **3.1.61**, PHP **8.3**, WordPress **7.1.4**, `127.0.0.1:19644`. Only local listener/cache infrastructure was adjusted; WordPress and blueprint were not patched.

| Check | Chromium | WebKit |
| --- | --- | --- |
| Full smoke | 38/38 PASS | 38/38 PASS |
| 320/360/390/768/900/1280 px | PASS | PASS |
| Page overflow / clipped clocks | None | None |
| Whole first row at 1280×720 | PASS | PASS |
| Native Gutenberg blocks | 41 valid, 9 clocks | 41 valid, 9 clocks |
| Customize automatic login | PASS | PASS |
| Caption UI → save → frontend | PASS | PASS |
| Caption restore → reopen | Valid, clean | Valid, clean |
| Google Fonts requests / uncaught exceptions | 0 / 0 | 0 / 0 |

The first main Chromium clock occupied y=556.48–710.84 px. The frontend made no external requests; editor smoke blocked standard Gravatar requests. This does not establish that the public Playground shell makes no external requests.

Evidence is retained without overwrite under `.local/wordpress-preview-evidence/acceptance-03-chromium/`, `acceptance-03-webkit/` and `.local/wordpress-preview-runtime/runtime-evidence.json`, with adjacent viewport/editor screenshots.

```bash
set -euo pipefail
node --check tools/wordpress-preview/smoke.mjs
node tools/wordpress-preview/smoke.mjs "manual-chromium-$(date +%Y%m%d-%H%M%S)" chromium
node tools/wordpress-preview/smoke.mjs "manual-webkit-$(date +%Y%m%d-%H%M%S)" webkit
```

These commands describe the earlier gallery, not the current guided blueprint. Both original/new JSON passed the CLI 3.1.61 official `validateBlueprint`.

## Public browser engine

The exact candidate ran without publication through the [official URL fragment mechanism](https://developer.wordpress.org/playground/blueprints/using-blueprints/). No file was uploaded to SVN or another host.

Fresh Chromium loaded the nine clocks in about ten seconds in one observation. All ticked; there was one H1/main and no frontend admin bar. The Customize URL referenced the actual `wpsandbox.wordpress.net/scope:…/wp-admin/post.php?post=4&action=edit`; automatic login, 41 valid blocks and real saves passed.

The complete public run passed in **14 seconds**: saved Caption appeared on the frontend and nine clocks continued ticking. These timings are observations, not load-time guarantees.

A separate editor-canvas check found nine shadow-DOM clocks with nonzero dimensions/time. The first block was selected, Container → Caption = London visible, `dirty=false`. Evidence: `.local/wordpress-preview-evidence/public-candidate-editor-ready.json`, `public-candidate-editor.png`, `public-candidate.json` and adjacent screenshots.

Initial harness attempts encountered iframe recreation during navigation. The subsequent run reacquired the current document and completed checks; the local smoke independently covered change/display/restore.

## Historical publication limits

At this snapshot plugin code, bundle and version 1.1.2 were unchanged and prior readme edits preserved. This gallery was not published: the ordinary button still used r3772712. Profile-related errors were not resolved by clearing user data. Network/cache/Playground/browser changes remained external factors.

Conversion was a goal without A-B or installation measurements. Gallery deployment/rollback would have needed one SVN asset only; the later guided asset was published instead, as recorded separately.
