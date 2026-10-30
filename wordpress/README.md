# WordPress plugin

This repository contains two independently versioned components:

| Component | Source | Version | License |
| --- | --- | --- | --- |
| JavaScript widget | `../src/` | `../package.json` (`0.8.1`, published to the demo/CDN) | MIT, as declared in the widget package |
| WordPress plugin | `simple-digital-clock/` | Plugin header and `readme.txt` (`1.1.4`, local candidate) | GPLv2 or later; see `simple-digital-clock/LICENSE` |

The existing widget build, demo, and release scripts retain their current paths.
The WordPress directory is the installable plugin root, including its bundled widget.
Do not move PHP files into the widget's `src/` or use the widget package version as the plugin version.

The [1.1.4 candidate](../docs/releases/1.1.4/README.md) deliberately bundles the exact [widget 0.8.1 artifact](../docs/releases/0.8.1/README.md). The retained WordPress 1.1.3 ZIP remains unchanged with widget 0.7.1; its earlier publication preparation is separate from this candidate.

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
The published 1.1.2 release fixes timezone parsing, post/widget KSES filtering, HTML5 and numeric caption entities, custom locale input and first-click Auto/Reset behavior. It also preserves caption JSON through the new KSES in WordPress 7.2 Beta 2. Time Zone Reset retains the string format understood by 1.1.1. No database migration or new saved-block format is introduced.

The [1.1.2 patch report](../docs/patches/1.1.2/README.md), [KSES/compatibility acceptance](../docs/patches/1.1.2/KSES72-VERIFICATION.md) and [release manifest](../docs/releases/1.1.2/manifest.json) identify the accepted runtime and release artifacts. The [publication report](../docs/releases/1.1.2/PUBLICATION.md) records SVN r3772502, Git tag `wordpress-v1.1.2` and public delivery verification. The 1.1.2 functional acceptance covers 12 contexts, 18,336 PHP assertions, 1,309,248 entity DOM comparisons, upgrade/resave/rollback, LocalWP, multisite, themes/caches and native HTTPS on a private loopback port. `Tested up to: 7.1` remains unchanged; Beta 2 does not certify the final WordPress 7.2 release.

## Local development

The retained [1.1.3 candidate](../docs/releases/1.1.3/README.md) introduced invalid numeric caption preservation and automatic container sizing with widget 0.7.1. The new [1.1.4 candidate](../docs/releases/1.1.4/README.md) retains those fixes and bundles widget 0.8.1: Preact 11 with explicit CSS units, ordinary AM/PM fitting, delayed-font refitting and quantized font-width correction, plus local-theme-font recovery after a failed Google stylesheet and stable single-line time layout. The corrective candidate also preserves terminal-backslash captions and nondefault settings on WordPress 6.3. The original JSON caption schema and static save markup remain unchanged; narrowly recognized malformed Core 6.3 caption tokens and clock-specific metadata handling are corrected without a database migration. Full MIT dependency notices ship in `THIRD-PARTY-NOTICES.txt`; the WordPress wrapper retains its GPL license. The candidate declares WordPress 6.3 and PHP 7.0 minimum requirements in both the main PHP header and readme. The WordPress candidate is not published.

Earlier widget releases remain available at their versioned CDN URLs. The current production demo/CDN uses [widget 0.8.1](../docs/releases/0.8.1/PUBLICATION.md); this does not publish or update the WordPress plugin.

Edit the WordPress wrapper here. Keep the bundled production JavaScript unchanged until an explicit widget update is tested.
`npm run build` only builds the standalone widget; it does not replace files inside the plugin.
Before deliberately copying a new widget bundle, verify its version and hash, then test the block editor, saved block validation, and frontend.

An isolated Docker investigation lives in [`../tools/wordpress-lab/`](../tools/wordpress-lab/).
Its runtime files, database data, logs, ZIPs, and credentials belong under ignored `.local/`.
Do not run experiments against existing WordPress containers or user sites.

The prepared local ZIP is `.local/packages/simple-digital-clock-1.1.4-compatibility-r2-candidate.zip`; use the [1.1.4 release report](../docs/releases/1.1.4/README.md) to verify its SHA-256. The earlier 1.1.3 archive, the first 1.1.4 candidate with widget 0.8.0, the 1.1.4/0.8.1 archive before minimum-requirement headers, the requirements candidate rejected by independent acceptance, and the first compatibility candidate rejected for entity-caption changes are retained separately. Repacking can change the archive hash because ZIP timestamps are included. A new development archive does not inherit the exact-artifact verification of the prepared candidate. The original 1.1.2 package hashes remain historical records in its publication report.

`node --test tests/wordpress-package.test.mjs` checks the current plugin against its release manifest, its exact versioned widget, the header/readme/POT/script-cache/source-reference versions, matching nonempty WordPress/PHP minimum requirements, and complete MIT notices for the exact bundled dependency versions. Required Repository checks run this guard; it does not install a ZIP or replace upgrade acceptance.

At the initial publication in SVN r3772502, the public [WordPress.org 1.1.2 ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.1.1.2.zip) had a different archive SHA-256 from the local candidate; all 15 extracted files matched the original manifest. The historical hashes remain in the publication report.

The later readme-only publication r3772710 is synchronized separately: [report](../docs/releases/1.1.2/README-PUBLICATION.md), [recorded file hashes](../docs/releases/1.1.2/readme-publication-evidence.json). At that publication, the readme matched the approved bytes and the other 14 plugin files retained the original manifest hashes. These are historical 1.1.2 results; the current 1.1.4 source intentionally differs. Public-package results are a saved snapshot, not a fresh network check. The original manifest and Git release tag remain unchanged. Genuine WordPress.org Core update acceptance remains unconfirmed by this synchronization.

To create a separate development ZIP from the repository root:

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

The accepted cycle replaces only plugin files: official 1.1.1 → candidate 1.1.2 → resave → official 1.1.1 → candidate again. Existing records, widget/sidebar settings and rendering remain compatible in the tested matrix; no database restore was used. A rollback does not repair content already damaged before the fix, and editing with 1.1.1 reintroduces its known defects.

To undo a repository change, inspect the relevant commit and restore or revert only its intended files. Preserve lab evidence, source snapshots and unrelated work; do not delete the imported WordPress directory or reset the entire checkout. The [release preparation report](../docs/releases/1.1.2/README.md) identifies saved payloads and the local SVN preparation.

All acceptance sites are stopped after testing. Stop only the matching lab when running new tests; `docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml stop` retains its containers and data. Do not remove volumes or touch unrelated sites.
