# WordPress 1.1.4 candidate with widget 0.8.0

Status: **candidate; upgrade acceptance in progress; not published**. The retained 1.1.3 ZIP is unchanged. This work does not merge the new PR, publish to WordPress.org, or change the already delivered standalone CDN artifact.

## Package and changes

- ZIP: `.local/packages/simple-digital-clock-1.1.4-candidate.zip`, **15 installable files**.
- ZIP SHA-256: `a2464553084ec244dbd3b77b87a3bb49f3da7b5f0e4586ab32311e35362a112f`.
- Bundled widget: **0.8.0**, **35,922 bytes**, SHA-256 `5661f6c054aad7c2f77f7ecd8912d6e41fca0c6079c8a4be498ab1847de939d0`; identical to `dist/0.8.0.min.js` and the accepted production CDN bytes.
- [15-file release manifest](manifest.json). Acceptance belongs to this exact ZIP; repacking creates a different artifact and does not inherit these results.

Only four plugin files differ from the retained 1.1.3 package: the bundled widget, plugin/cache versions in `widget_init.php`, POT project version, and readme release metadata/changelog. The widget brings Preact 11.1.0 with explicit CSS pixel lengths, ordinary localized AM/PM fitting, refitting after actual font glyphs load, and correction for quantized font advances. See the [standalone 0.8.0 acceptance](../0.8.0/README.md).

All eleven unchanged plugin files, including `block.js` and KSES, are byte-identical to 1.1.3. No saved-block schema or database migration is introduced. Readme CRLF line endings are preserved; the measured size is corrected in both feature and FAQ text, and the source link identifies the actual widget commit rather than a nonexistent tag. Earlier changelog entries and approved readme prose are retained.

## Acceptance scope

Fresh isolated upgrades cover official 1.1.1 and 1.1.2, plus the retained **unpublished 1.1.3 candidate**. Official predecessor ZIPs were freshly downloaded and matched the existing pinned archives on 2026-10-30. The public plugin-information API reports 1.1.2; the local 1.1.3 package must not be described as an official public release.

The Docker matrix and direct native LocalWP runtime checks are in progress. Results will record real Core package replacement, unchanged stored rows/settings, role saves and reopened blocks, captions, labels, sizes, frontend behavior and rollback. External WordPress.org update delivery is outside this unpublished local acceptance.

`tests/wordpress-package.test.mjs` additionally checks installed-source hashes against this manifest, exact widget byte identity, and agreement between plugin header, stable tag, POT, source commit and script cache version. Required Repository checks run it. It does not replace installation or upgrade testing.

## Isolation and rollback

Only fresh disposable sites are used. Existing user sites, previous lab databases and historical release evidence are preserved. Each lab uses private loopback ports and independent data. The exact candidate and predecessor ZIPs remain local; no SVN commit, npm publication or Cloudflare deployment is performed by this WordPress preparation.

Rollback installs the retained predecessor's files without restoring the database. Previously damaged captions are not repaired automatically. Editing under 1.1.1 can reintroduce its known bugs; rollback reader checks do not certify those old save paths.
