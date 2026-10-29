# Synchronizing the 1.1.2 supporting files

29 October 2026. **Documentation, POT, and changelog are synchronized. Nothing has been published at this stage.** [Current machine-readable verification](changelog-sync-evidence.json), [previous POT stage](metadata-sync-evidence.json).

## Installable artifact

- New ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP SHA-256: `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8`.
- Git tree of the 15 installable files: `18512403b0715be777a89e302831a3cc3d5117b6`.
- Full diff SHA-256: `1eac522a09f74d8eba0f521fd87a138f72084f46e194d3af28f8bb3b32b5ff67`.
- The [manifest](manifest.json) and local SVN `trunk` / `tags/1.1.2` match the ZIP across all 15 files.

Compared with the functionally verified ZIP `6f896d42797e6d3a4727f8ece6d13bb8f4be2ed8e9425473ef02ea5e374d8720`, only `languages/simple-digital-clock.pot` and two changelog descriptions in `readme.txt` were updated. In the POT, `Project-Id-Version` was set to 1.1.2, the date and description of the preparation method were updated, and 46 source references were corrected to the current PHP lines. All **54 messages**, their order, `msgid`, `msgstr`, contexts, plural forms, and placeholders were preserved. Manual synchronization was used, with independent PHP extraction by GNU gettext xgettext; it is not presented as a new WP-CLI run. `msgfmt --check-format` passed.

The changelog explicitly states that both defects were also reproduced in LocalWP: an invalid block when reopened in a different browser timezone, and markup loss for a user without `unfiltered_html`. The existing entries were clarified without duplication. The descriptions do not claim that the reviewer's specific scenario has been established or that LocalWP itself has been fixed. The remaining `readme.txt` lines, its CRLF, and its version were preserved.

All other **13 files are byte-identical** to the functional ZIP. PHP, JS, CSS, the runtime bundle, block schema, and saved settings were unchanged. Standalone remains at 0.7.0. The original official 1.1.1 manifest was preserved unchanged.

## Verification and its limits

Functional acceptance applies to commit `9dd7c53f64a96ce2012cb439490eae39eda0e84e`, tree `ffc3aa9ca9a7771a4f1cb8205590e08ed1c6d597`, and ZIP `6f896d42…`: **18 336 PHP checks**, **1 309 248 DOM comparisons**, preservation of existing posts/widgets, upgrade, resave, rollback and reupgrade, LocalWP/HTTPS, multisite, themes, and caches. The [original report](../../patches/1.1.2/KSES72-VERIFICATION.md) and evidence are not relabeled as results for the new ZIP.

The new package was checked for ZIP CRC, exact contents, unchanged executable files, semantic identity of the translation catalog, source references, version consistency, dry-run, and application of the full diff to a clean 1.1.1. The applied result equals the new ZIP. The same verification was performed for the SVN trunk diff. The full functional matrix was not rerun: the changes are limited to POT metadata/comments and descriptions of already verified fixes in the changelog. Test sites were not started during synchronization. The exact ZIP `7a0e061f…` subsequently passed a separate [final smoke and Plugin Check](PREFLIGHT.md); this is a new, limited run documented separately.

## Documentation and history

The root and WordPress README files, lab instructions, patch overview, and release-preparation overview were updated. Current versions, SHA values, links, and status were aligned with the manifest. Older reports were marked as historical; their original counts and evidence were preserved. Invalid recommendations to run candidate-only PHP suites against official 1.1.1 and to delete imported files for rollback were removed. The original beta failure is no longer presented as the current candidate's state.

`npm run release:check` and `npm run release:verify` confirmed standalone 0.7.0 consistency and unchanged versioned/latest bundles. Local documentation links and hashes of supporting files were checked. Exact final verification results are retained in `.local/docs-sync-1.1.2/`.

## Rollback and publication

The functional ZIP/diff are retained in `.local/docs-sync-1.1.2/functional-6f.zip` and `functional-6f.patch`. Snapshots of both SVN directories and the previous manifest are alongside them. The previous ZIP `e939a89b…` and SVN snapshots from before the changelog clarification are retained in `.local/localwp-changelog-1.1.2/`. Reversing this synchronization requires targeted restoration of the POT/readme, its archives/manifests, and documentation; the database is unaffected. SVN copy history and the unrelated HTML banner were preserved, and properties were unchanged.

No Git push, SVN commit, user-site updates, or external publications occurred at this stage. Remote state must be checked before a future publication. Acceptance covers the specific WP 7.2 Beta 2 build; `Tested up to: 7.1` was preserved.
