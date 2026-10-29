# Simple Digital Clock 1.1.2 — release preparation and publication

29 October 2026. **Release published: SVN r3772502, Git tag `wordpress-v1.1.2`. At initial publication, remote trunk/tag, both public ZIPs, and the verified candidate contained the same 15 installable files.** [Publication and public-update verification report](PUBLICATION.md), [machine-readable results](publication-evidence.json).

- Branch: `codex/prepare-simple-digital-clock-1.1.2`.
- Release commit: `6479ee9365e98f9b5f6822989eb89938d4955a9d`; separate WordPress tag: `wordpress-v1.1.2`.
- Installable plugin Git tree: `18512403b0715be777a89e302831a3cc3d5117b6`.
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP SHA-256: `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8`.
- [Final smoke, Plugin Check, and read-only SVN preflight](PREFLIGHT.md).
- [POT synchronization, functional-acceptance limits, and repackaging](METADATA-SYNC.md).
- [File manifest](manifest.json), [trunk diff](svn-trunk.diff), [complete tag copy as additions](svn-tag-copy.diff).
- [Fix and final acceptance](../../patches/1.1.2/KSES72-VERIFICATION.md), [evidence](../../patches/1.1.2/kses72-evidence.json).

The subsequent readme-only SVN change **r3772710** was synchronized into Git separately: [report and verification limits](README-PUBLICATION.md), [file inventory for that snapshot](readme-publication-evidence.json). The initial release's historical manifest and Git tag are preserved.

## Local SVN preparation history

Checkout: `/Users/yy/Documents/ChatGPT/WordPress/wp-plugin-work/simple-digital-clock/svn`. Preparation base: **r3771402**. In `trunk`, compared with official 1.1.1, `block.js`, `readme.txt`, and `widget_init.php` were changed; `includes/simple-digital-clock-kses.php` was added; metadata and source references in `languages/simple-digital-clock.pot` were updated. Before publication, tag `tags/1.1.2` had status `A +` and copy-from `trunk@3771402`. Publication r3772502 preserved that copy history; afterward, the checkout's versioned files were clean, while the unrelated banner remained unversioned.

POT was synchronized first, then the two changelog entries about confirmed LocalWP scenarios were clarified. The last iteration updated only `readme.txt` in both directories: before copying, all files matched ZIP `e939a89b…`; afterward, they matched the new manifest. Properties were unchanged and copy history was preserved. The unrelated unversioned HTML banner in `assets/` was preserved byte-for-byte and not added to SVN.

The plain SVN diff was retained byte-for-byte, including CRLF. Dry-run and application of the diff to a clean copy of official 1.1.1 produced exactly the final ZIP's 15 files. SVN status was compared structurally: XML attribute order can differ between processes. The standard `svn diff --show-copies-as-adds` was used for the tag.

## Verification and rollback

Functional results apply to commit `9dd7c53` and ZIP `6f896d42…`: 18 336 PHP checks, 1 309 248 DOM comparisons, browser upgrade/resave/rollback scenarios, LocalWP, multisite, themes/caches, and Native HTTPS. The KSES fix did not change the storage format or standalone widget sources. `Tested up to: 7.1` was preserved. Repackaging changes only POT metadata/source references and two LocalWP changelog descriptions; the other 13 files are identical. Gettext, ZIP, manifests, and diff application were verified for that package; the full functional matrix was not rerun. After synchronization, the exact final ZIP separately passed 1388 smoke assertions; PCP completed with 0 ERROR / 7 analyzed WARNING.

Older sources, ZIP, initial SVN status, and preparation are retained in `.local/release-prep-1.1.2/` and `.local/wordpress-lab/kses72-fix/`; snapshots from before POT synchronization are in `.local/docs-sync-1.1.2/`, those from before the changelog clarification are in `.local/localwp-changelog-1.1.2/`; the snapshot before the SVN KSES fix is in `.local/wordpress-lab/kses72-final/svn-prep/`. Reversal requires targeted restoration of the relevant iteration's files, without cleaning the checkout or touching the banner. Rollback of an installed plugin to 1.1.1 was verified against resaved data without restoring the database; it does not repair previously corrupted data and reintroduces the known 1.1.1 editing defects.

Git push and SVN commit were performed after explicit user authorization. GitHub retains the release branch; tag `wordpress-v1.1.2` is fixed at the verified commit. SVN r3772502 includes only `trunk` and `tags/1.1.2`. Independent readback of the published revision and HEAD r3772504 confirmed all 15 files, no drift, and preserved properties. `assets/` was excluded. Environment runtime data, dumps, credentials, and TLS materials were not added to Git. Delivery and control-update details are in the [publication report](PUBLICATION.md).
