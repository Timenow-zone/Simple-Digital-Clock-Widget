# Live Preview publication — SVN r3773659

Historical snapshot, **2026-10-29**. Only `assets/blueprints/blueprint.json` changed. The ordinary WordPress.org button delivered the guided flow after metadata import; plugin code, version and both public ZIPs remained unchanged.

## Final acceptance

- Ordinary [Live Preview](https://wordpress.org/plugins/simple-digital-clock/?preview=1), fresh Chromium: **37/37 PASS**, 16.527 seconds.
- Style/city, date/AM-PM, unknown values/XSS, mobile result at 320/390/768/1280 px and installation guidance passed.
- Gutenberg: 11 valid blocks and one rendered clock. Caption/custom gradient survived returning to the frontend; `preset:null` retained custom styling.
- Zero page errors or unexpected HTTP errors. One HTTP 403 and three HTTP 400 responses were intentional validation controls.
- Independent post-import integrity: **19/19 PASS**, including fresh downloads of both ZIPs.
- The actual redirect used `rev=3773708`, an imported-metadata cache parameter; the asset commit remained r3773659.

Desktop/mobile/install/editor screenshots were visually reviewed. These final results used the ordinary directory button, without substituting a local blueprint or URL fragment.

## Published identity

- SVN **r3773659**, author `falselight`, `2026-10-29T17:47:03.155572Z` (19:47 Kyiv).
- Only changed path: `/simple-digital-clock/assets/blueprints/blueprint.json`; properties unchanged.
- **62,422 bytes**; SHA-256 `fc8d270ed0b2116688ec68203e7e8742d31016f08357c41da71bfcb9aea71d74`.
- SVN readback and public `ps.w.org` asset matched the exact candidate.

Before publication, the exact JSON passed **156/156** local Chromium/WebKit checks and **36/36** public browser WASM checks via URL fragment. These did not substitute for post-import ordinary-button acceptance.

The first noninteractive commit failed with `E215004` and created no revision. The user then ran the prepared interactive script; credentials were entered locally, not sent into chat. No repeat commit was needed.

## Plugin preservation

Independent post-commit checks confirmed:

- All 15 files in trunk and `tags/1.1.2` matched pre-publication references.
- Header, Stable tag and plugins/info API remained **1.1.2**.
- Both public ZIPs remained **61,476 bytes**, CRC valid, 15 files, SHA-256 `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`.
- All 39 inspected local plugin/src/dist files were unchanged. The pre-existing local readme edit was preserved and not published.
- The isolated sparse SVN checkout was clean; the user's older checkout and untracked HTML banner were untouched.

These references include the previously published readme update; they are not the original first-publication 1.1.2 ZIP.

## Directory import delay

The first ordinary-button check still opened the old nine-clock gallery with `rev=3772712`. The API remained old even when queried with `rev=3773659`, although SVN and the assets CDN already returned the new file.

At **18:02:51 UTC** (20:02:51 Kyiv), the ordinary button's API response had new content: **62,476 bytes**, SHA-256 `d2a18b6442fa66188854bb82a306ff04b4ccadee29f96720d5813892425ac864`. Decoded JSON exactly matched the candidate. Full browser acceptance and final ZIP comparison followed.

The official [SVN watcher](https://github.com/WordPress/wordpress.org/blob/trunk/wordpress.org/public_html/wp-content/plugins/plugin-directory/cli/class-svn-watcher.php#L50-L53) adds trunk to asset-only events. [Plugin_Import](https://github.com/WordPress/wordpress.org/blob/trunk/wordpress.org/public_html/wp-content/plugins/plugin-directory/jobs/class-plugin-import.php#L130-L157) delays this import by 15 minutes. This explanation matches observations; production queue state was unavailable.

The API reads `assets_blueprints` postmeta rather than SVN directly. A query-string revision cannot force import. Another commit would restart the wait. Manual sync was not called because it might trigger a full import and ZIP repack.

Official `normalize_blueprint_json()` accepted the candidate below the 100 KiB limit. Normalized bytes/hash may differ; decoded JSON must match.

## Retained evidence

- `.local/wordpress-preview-publication/commit-result.json`: commit, author and scope.
- `.local/wordpress-preview-publication/committed-log.stdout`: independent XML log.
- `.local/wordpress-preview-publication/post-publication-20261029T174839Z/summary.json`: initial integrity and API lag.
- `.local/wordpress-preview-publication/delivery-audit/diagnosis.json`: owning source and inference limits.
- `.local/wordpress-preview-publication/delivery-watch/`: bounded delivery observation.
- `.local/wordpress-preview-evidence/public-guided-published-01/cache-status.json`: old delivery.
- `.local/wordpress-preview-evidence/public-guided-published-02/results.json`: final 37/37 and adjacent PNGs.
- `.local/wordpress-preview-publication/post-import-final-20261029T180334Z/summary.json`: final 19/19.
- `verification.json`: accepted-state summary.

The delay resolved without another commit, manual sync, code change or ZIP repack. This historical Chromium result does not certify every browser or assistive technology.
