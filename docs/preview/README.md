# WordPress.org Live Preview

Historical publication: blueprint-only SVN **r3773659** on 2026-10-29. The ordinary public button passed **37/37** checks; plugin code, version 1.1.2 and both public ZIPs were unchanged. See [publication evidence](PUBLICATION.md). Integrating these sources into Git is not another SVN publication.

## Source boundaries

- `wordpress/preview/seed.php`: guided page, native Gutenberg block, template and temporary WordPress settings.
- `wordpress/preview/demo.css`: presentation without changing the clock shadow DOM.
- `wordpress/preview/demo.js`: style/city selection, live result, installation instructions and editor navigation.
- `wordpress/preview/config.json`: three presets, 42 cities, aliases and initial settings.
- `wordpress/preview/clock.php`: shared native block serialization.
- `wordpress/preview/runtime.php`: preview-only configuration, JavaScript and protected REST saves.
- `scripts/build-wordpress-preview.mjs`: self-contained JSON generator.
- `wordpress/wporg-assets/blueprints/blueprint.json`: exact output for SVN `assets/blueprints/blueprint.json`.
- `blueprint-before.json`: original public r3772712 rollback asset.
- `blueprint-gallery.json`: earlier unpublished local gallery.

These files are excluded from the installable plugin ZIP. The generator creates temporary mu-plugins only inside Playground, never on visitor sites.

## Build and behavior

```bash
set -euo pipefail
php -l wordpress/preview/seed.php
php -l wordpress/preview/runtime.php
php -l wordpress/preview/clock.php
node --check wordpress/preview/demo.js
node scripts/build-wordpress-preview.mjs --check
```

Use `--build` only when intentionally changing the blueprint, then inspect its diff. Twenty Twenty-Five is selected explicitly. The seed reuses its page slug and theme template, creates one main landmark, and does not delete unrelated posts. Editor links use `admin_url()` and the actual page ID.

The flow is Classic/Minimal/Bold → city or IANA timezone → Show my clock → installation instructions. Mobile submission scrolls to the result and focuses its heading. Unknown cities retain the previous clock and show an error. City lookup is local; no geolocation or external search is used.

The page renders one real installed-plugin web component with a system font. PHP networking is disabled; the blueprint loader fetches plugin/theme archives. Editor navigation saves selected settings through REST with the native nonce and `edit_post` capability. Visitors install the plugin on their own sites themselves.

## Reproduction

[Guided acceptance](GUIDED-VERIFICATION.md) covers the published flow. [Gallery verification](VERIFICATION.md) is an older snapshot.

The historical smoke environment uses official `@wp-playground/cli@3.1.61`, installed separately under ignored `.local/wordpress-preview-runtime/`. Its local listener was restricted to `127.0.0.1` and its cache moved under that directory. These infrastructure changes do not patch the blueprint or WordPress. The command below requires that prepared CLI; do not expose an unrestricted default listener.

```bash
set -euo pipefail
.local/wordpress-preview-runtime/node_modules/.bin/wp-playground-cli server \
  --port=19644 --php=8.3 \
  --blueprint=wordpress/wporg-assets/blueprints/blueprint.json \
  --verbosity=normal --workers=6
```

In another terminal:

```bash
set -euo pipefail
node tools/wordpress-preview/guided-smoke.mjs "manual-$(date +%Y%m%d-%H%M%S)" chromium
```

The loopback smoke checks styles/cities, validation/XSS, ticking, mobile focus, 320/390/768/1280 px, installation guidance, REST protection and native Gutenberg persistence. It restores temporary configuration and writes a new evidence directory without overwriting earlier results. Use a new browser context after recreating WordPress: old auto-login cookies may outlive its authentication keys.

## Publication and rollback

Publication remains a separate action. Only `assets/blueprints/blueprint.json` belongs in an asset-only SVN change; exclude trunk, tags, plugin ZIPs and readme. Read the remote asset again and inspect `svn diff` before a future publication. If upstream differs, reconcile it first. Verify actual ordinary-button delivery in a clean browser after metadata import.

Rollback publishes the saved `blueprint-before.json` to the same asset path. It does not change installed plugins.

Official contract: [Previews and Blueprints](https://developer.wordpress.org/plugins/wordpress-org/previews-and-blueprints/).
