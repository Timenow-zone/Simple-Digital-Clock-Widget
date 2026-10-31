# Guided Live Preview — local acceptance, 2026-10-29

Historical environment: `http://127.0.0.1:19644/`. Blueprint `wordpress/wporg-assets/blueprints/blueprint.json`: **62,422 bytes**, SHA-256 `fc8d270ed0b2116688ec68203e7e8742d31016f08357c41da71bfcb9aea71d74`.

## Visitor flow

1. Select Classic, Minimal or Bold; styling changes the installed plugin's real clock.
2. Select one of 42 local cities or enter an IANA timezone. Aliases and shared timezones are supported without geolocation/external lookup.
3. Submit Show my clock. City, timezone, date and time format apply. Mobile focus/scroll reveal the result. Unknown values report an error and retain the previous clock.
4. Add this clock to my site opens installation guidance and the directory link. It does not install anything on a visitor's site.

The additional editor link saves changed builder settings to the temporary page before opening Gutenberg. With no changes it opens directly. Frontend-only demo elements are hidden in the editor.

The saved block is authoritative on return. Custom Caption/gradient are not replaced by a stale preset. City/date edits on custom styling send `preset:null` and preserve that styling. Reset returns the local frontend to Classic/Kyiv; ordinary form interactions do not write the database until editor navigation.

## Scope

Preview source consists of seed.php, demo.css, demo.js, config.json, clock.php and runtime.php under `wordpress/preview/`, the blueprint generator and `tools/wordpress-preview/guided-smoke.mjs`. Installable plugin bytes and bundle were unchanged; existing readme edits were preserved. The preview mu-plugin exists only in temporary Playground.

## Results

Official Playground CLI **3.1.61**, PHP **8.3**, WordPress **7.1.4**, loopback listener, fresh browser contexts without clearing a user profile.

| Check | Chromium | WebKit |
| --- | --- | --- |
| Complete flow | 78/78 PASS | 78/78 PASS |
| 320/390/768/1280 px | No overflow/clipping | No overflow/clipping |
| Mobile submit/focus/whole-clock visibility | PASS | PASS |
| Keyboard style, city, date, AM/PM | PASS | PASS |
| Unknown city/XSS retain prior clock | PASS | PASS |
| Installation disclosure/focus/instructions | PASS | PASS |
| Missing nonce/invalid values/string booleans | Rejected | Rejected |
| Rejected requests retain raw post content | PASS | PASS |
| Gutenberg: 11 blocks, one clock | All valid | All valid |
| Native Caption/custom gradient → frontend | Preserved | Preserved |
| Custom style with preset:null | PASS | PASS |
| Google Fonts requests / uncaught exceptions | 0 / 0 | 0 / 0 |

REST requires `edit_post` for the single configured page and native `wp_rest` nonce. Only five explicitly typed fields are accepted. City/timezone validation canonicalizes IANA spelling through PHP tzdb. Exactly one clock within `sdc-live-result` is updated; ambiguity is rejected. HTML JSON uses `JSON_HEX_*`; user text is not inserted with `innerHTML`.

Both runs restored server Classic/Kyiv configuration. The main smoke does not follow external install links or install plugins on other sites.

## Evidence and reproduction

- `.local/wordpress-preview-evidence/guided-acceptance-03-chromium/results.json`.
- `.local/wordpress-preview-evidence/guided-acceptance-03-webkit/results.json`.
- Adjacent `guided-initial-desktop.png`, `guided-mobile-after-submit.png`, `guided-installation.png`, `guided-editor.png`, `guided-final-desktop.png`.
- `verification.json`: hashes and verification scope.

```bash
set -euo pipefail
php -l wordpress/preview/seed.php
php -l wordpress/preview/runtime.php
php -l wordpress/preview/clock.php
node --check wordpress/preview/demo.js
node scripts/build-wordpress-preview.mjs --check
node tools/wordpress-preview/guided-smoke.mjs "guided-chromium-$(date +%Y%m%d-%H%M%S)" chromium
node tools/wordpress-preview/guided-smoke.mjs "guided-webkit-$(date +%Y%m%d-%H%M%S)" webkit
```

Commands require the prepared local CLI described in README. Evidence uses new directories.

## Public delivery and boundaries

The user subsequently authorized public Playground verification and blueprint-only publication. Exact JSON passed **36/36** public WASM checks in **25.5 seconds**, zero page errors, covering mobile, installation, REST protection, actual Gutenberg canvas and Caption/custom-gradient round trip. One intentional 403 and three intentional 400 responses are validation controls. Evidence: `.local/wordpress-preview-evidence/public-guided-candidate-01/results.json` and adjacent PNGs.

SVN **r3773659** followed interactive user authentication. After the normal import delay the ordinary button passed **37/37** checks in clean Chromium. Separate **19/19** post-import integrity checks confirmed unchanged plugin code, 1.1.2 and both ZIPs. See [publication](PUBLICATION.md).

Conversion improvement is a goal, not a measured result; no install-count/A-B study or full WCAG/all-browser/assistive-technology certification was performed.

The earlier local gallery is `blueprint-gallery.json`; the original public asset is `blueprint-before.json`. Earlier local source remains under `.local/wordpress-preview-before-guided/`. Rollback affects the demo only.
