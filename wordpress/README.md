# WordPress plugin

This repository contains two independently versioned components:

| Component | Source | Version | License |
| --- | --- | --- | --- |
| JavaScript widget | `../src/` | `../package.json` (`0.7.0`) | MIT, as declared in the widget package |
| WordPress plugin | `simple-digital-clock/` | Plugin header and `readme.txt` (`1.1.2`, unpublished candidate) | GPLv2 or later; see `simple-digital-clock/LICENSE` |

The existing widget build, demo, and release scripts retain their current paths.
The WordPress directory is the installable plugin root, including its bundled widget.
Do not move PHP files into the widget's `src/` or use the widget package version as the plugin version.

## Imported baseline

On 2026-10-27, all 14 files were imported unchanged from the official release:

- ZIP: https://downloads.wordpress.org/plugin/simple-digital-clock.1.1.1.zip
- Public SVN: https://plugins.svn.wordpress.org/simple-digital-clock/
- Bundled widget source: https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/tree/v0.7.0
- ZIP and per-file SHA-256 hashes: [`upstream-1.1.1.json`](upstream-1.1.1.json).

The official ZIP was also byte-compared with the existing local SVN trunk; all files matched.
The manifest records the imported baseline. Future fixes should intentionally differ from it.
No `.svn` metadata is imported. SVN remains read-only during ordinary local development. Explicitly authorized release preparation may stage changes in a local checkout; remote SVN commits and Git pushes require separate publication authorization.
The imported baseline has known findings documented in the [2026-10-27 LocalWP investigation](../docs/investigations/2026-10-27-localwp/README.md).
The local 1.1.2 candidate fixes timezone parsing, post-content filtering, custom locale input and first-click Auto/Reset behavior. Time Zone Reset retains the string format understood by 1.1.1. Its patch and validation are documented in [the 1.1.2 patch report](../docs/patches/1.1.2/README.md).

## Local development

Edit the WordPress wrapper here. Keep the bundled production JavaScript unchanged until an explicit widget update is tested.
`npm run build` only builds the standalone widget; it does not replace files inside the plugin.
Before deliberately copying a new widget bundle, verify its version and hash, then test the block editor, saved block validation, and frontend.

An isolated Docker investigation lives in [`../tools/wordpress-lab/`](../tools/wordpress-lab/).
Its runtime files, database data, logs, ZIPs, and credentials belong under ignored `.local/`.
Do not run experiments against existing WordPress containers or user sites.

To create a local ZIP from the repository root:

```bash
set -euo pipefail
mkdir -p .local/packages
archive_path="$(pwd)/.local/packages/simple-digital-clock-local-$(date +%Y%m%d-%H%M%S).zip"
(cd wordpress && zip -qr "$archive_path" simple-digital-clock)
printf 'Local package: %s\n' "$archive_path"
```

Install the ZIP only in the isolated test site. A local ZIP is not a WordPress.org release.
This local integration does not publish to GitHub, WordPress.org, or Cloudflare. Publishing belongs to a separate release workflow.

## Rollback

The import does not change the standalone widget or any existing WordPress installation.
Review `git status` and remove only the newly added WordPress/lab/report files to undo this local phase.
Stop the named lab with `docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml down`; this preserves its data in `.local/`.
