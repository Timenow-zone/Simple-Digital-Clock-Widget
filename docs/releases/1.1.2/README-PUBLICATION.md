# Simple Digital Clock 1.1.2 — published readme synchronization

29 October 2026. Git now contains the exact `readme.txt` published in the separate readme-only SVN change **r3772710**. The source is the retained public-delivery verification from `2026-10-29T11:11:11.879938+00:00` (13:11 Europe/Kyiv). [Hashes, file inventory, and verification limits](readme-publication-evidence.json).

## Change

SVN r3772710 changed only `trunk/readme.txt` and `tags/1.1.2/readme.txt`. The short description and opening paragraph, the visitor-device time source, external Google Fonts loading, and locale-dependent 12-hour formatting were clarified; the unsupported SEO promise was removed.

The synchronized file is byte-identical to the retained `approved-readme.txt`, SHA-256 `8bafc21fa868ea92675dc752c8f228d3d2a333fc5049e8e60c0eb4a8df8a041e`. CRLF was preserved. The plugin contains the same 15 files; the other 14, including executable code, CSS, and POT, match the original [release manifest](manifest.json). Stable tag and plugin version remain 1.1.2; bundled JS remains at 0.7.0.

## Public-delivery snapshot

The retained `public-verification.json` records successful directory and plugins/info API checks. Both public ZIPs—versioned and latest-stable—passed CRC, safe-root, unique-name, and complete 15-file inventory checks; they share SHA-256 `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`. Every file matched the retained `expected-files.json`; there are no differences outside the readme.

This transfers results from an earlier verification; it is not a new check of the current SVN HEAD, directory, or downloadable ZIP. Hashes of the three local sources are retained in the new evidence. During Git synchronization, exact readme bytes and all 14 other files were rechecked; no network checks, installation, or browser acceptance were run.

## History and update verification

Tag `wordpress-v1.1.2` at `6479ee9365e98f9b5f6822989eb89938d4955a9d`, the original `manifest.json`, [initial publication report](PUBLICATION.md), `publication-evidence.json`, patch, and SVN diff describe the original r3772502 release. Their original hashes are preserved. The new evidence supplements this history with the readme-only change; the old manifest is not the manifest of the package after r3772710.

Core update API/cooldown status remains the last observation recorded in the initial publication report. This snapshot confirms readme and ZIP delivery, but does not confirm an actual 1.1.1 → 1.1.2 update through WordPress.org. That acceptance requires a separate check of the current offer and published file contents.

Git rollback is a targeted revert of this synchronization commit. SVN publication and rollback belong to the separate release process.
