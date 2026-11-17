# Exact RC18 WordPress.org prepublication record

Status: **BOUNDED PACKAGE CHECKS PASS; WORDPRESS.ORG 1.1.6 NOT PUBLISHED**.
The review completed on 2026-11-14 at 20:03 UTC. This additive record and its
documentation PR do not alter the accepted archive, runtime or historical
acceptance. They do not authorize merge, Cloudflare changes or WordPress.org
publication. The review found stale current status prose; the accompanying
documentation PR corrects that prose and requires its own exact-HEAD CI.

## Exact subject

| Item | Identity |
| --- | --- |
| Candidate | WordPress 1.1.6 RC18; RC18 is only the archive label |
| Archive | `.local/packages/simple-digital-clock-1.1.6-rc18.zip` |
| ZIP size and files | 82,060 bytes; twenty regular files |
| ZIP SHA-256 | `b59adf31cf9b9f8e7826e2540c81a3621d673c44f2eae65145b96a6b2b353429` |
| [Frozen manifest](manifest-rc18.json) SHA-256 | `7c09c3efc71bff139d85fd80d4e79575be070c38ab018e1b450e7d098c8e486d` |
| Accepted main merge | `ffb95e60a1db82b6535894db90f19da8be978564` |
| Runtime | 0.8.4, 36,430 bytes |
| Runtime SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |

Archive CRC, path traversal, duplicate-name, symlink and file-type checks pass.
All twenty extracted files equal the frozen manifest, accepted main tree and
locally staged SVN trunk/tag. Header, Stable tag, readme release sections, POT,
notices and declared WordPress 6.3/PHP 7.0 minimums agree. The 279-character
Upgrade Notice fits the directory limit. There is no database migration.

## Fresh verification and retained coverage

- Official Plugin Check **2.2.0** executes **31 static and 5 runtime checks**
  on exact installed RC18, including low-severity findings: none reported,
  exit 0. WordPress 7.1.4/PHP 8.3.35; exact files and eight content tables
  remain unchanged. Plugin Check's PHP 7.4 minimum is not the plugin's minimum.
- Focused package/i18n/stale-save contracts: **13/13**. `release:check` and
  `release:verify` pass. The accepted [main CI](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43624328841)
  reports both required jobs successful at the exact merge SHA above.
- Public 1.1.5 catalog, latest ZIP and versioned ZIP agree. Both ZIPs contain
  72,537 bytes with SHA-256
  `246c91091fa0feda5e4546b0373b7bd310c6b49d491082114cd17d143c4be882`;
  all seventeen extracted files equal the accepted predecessor and SVN exports.
- Eight official update-API probes across WordPress 6.3.14/7.1.4 user agents:
  installed 1.1.2/1.1.4 receive 1.1.5; installed 1.1.5/1.1.6 receive no update.
  These are dated samples, not proof of global adoption or future 1.1.6 delivery.
- **RC18 → official public 1.1.5 → RC18** passes four actual Core
  `Plugin_Upgrader::bulk_upgrade` transitions on WordPress 6.3.14/PHP 7.0.33 and
  7.1.4/PHP 8.3.35. Exact file maps, activation, eight ordered content-table
  hashes per site and stable options are preserved without a database restore.
  These use private local offers; old-writer editing is not newly certified.
- The [0.8.4 production record](../0.8.4/PUBLICATION-2026-11-14.md) supplies
  the delivered exact runtime and all six HTML/WordPress browser combinations.
  Its sealed 72-observation native matrix was rehashed, not rerun in this review.
  Public 0.8.4 and 0.8.1 assets were freshly fetched and hash-verified.

The [42-gate matrix](ACCEPTANCE-MATRIX.md), [initial RC18 acceptance](FINAL-ACCEPTANCE-RC18.md),
[additional local acceptance](LOCAL-ACCEPTANCE-RC18.md) and
[encode attribution](ENCODE-DIAGNOSTIC-RC18.md) retain their own scope and dates.
Seven inventories with 5,515 entries were rehashed: 5,513 unchanged; two expected
differences identify the mutable release index and selection manifest updated
in the accepted RC18 PR. Immutable archives/manifests and historical reports
are preserved. All twenty-five directly referenced gate files exist.

Native editor, synthetic ten-plugin stack, cache and multisite evidence is
retained, not universally recertified. Network-specific multisite coverage is
Google Chrome; the separate HTML/single-site gate covers actual Chrome,
Firefox and WebKit. WebKit is not Safari. Matching Core/WebKit navigation
diagnostics were reproduced with the plugin disabled and independently reviewed;
their attribution does not imply an empty console. Previously lost HTML still
requires an intact revision or backup. Stale Classic forms may require recovery
of unsaved text and reopening. Historical NO-GO records are not rewritten.

## Publication gates and staged transaction

At the prepublication review, current README status text was stale and the
WordPress.org browser was logged out. Documentation consistency is corrected
in the separate PR; its final HEAD still needs both required checks. Current
publisher access and the optional Release Confirmation setting must be recorded
in an operational receipt before release. Anonymous SVN reads prove neither.
No login credential, confirmation token or release action belongs in this file.

The prepared local SVN working copy is
`.local/wordpress-1.1.6-rc18-readiness-20261114/svn/`, pinned at global revision
3802416; plugin trunk last changed at r3797104. Remote tag 1.1.6 was absent.
Local trunk and tag 1.1.6 match all twenty accepted files. Relative to public
1.1.5 there are eight modifications, four additions and one deletion
(`includes/simple-digital-clock-output.php`). Directory assets, previous tags
and SVN properties remain unchanged. No SVN commit was performed.

After explicit release authorization:

1. Refresh exact package/source/CI, remote SVN trunk and tag absence, account
   access and confirmation mode. Preserve the predecessor ZIP and canary site's
   database/content/revisions/options plus plugin directory. Stop on drift.
2. Commit the reviewed trunk and new tag together in one transaction with
   Stable tag 1.1.6, following the [WordPress SVN guidance](https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/).
3. If [Release Confirmation](https://developer.wordpress.org/plugins/wordpress-org/release-confirmation-emails/)
   is enabled, confirm the verified pending version and record that result.
4. Verify public tag/trunk, catalog and both downloadable ZIPs. Compare all
   twenty extracted files: WordPress.org recompression can change ZIP-container
   hashes without changing installed files.
5. Verify older installations are offered 1.1.6 by the official update API,
   then perform the real public update on isolated canaries. Check installed
   identity, data, one/multiple clocks, Gutenberg/Classic saves and old-open
   Classic tabs in all three browsers, including relevant cache/reload states.
6. Record public delivery only after those gates pass. Catalog/ZIP availability
   alone does not prove update propagation. Keep delayed distribution pending;
   do not make repeated SVN commits merely to force a refresh.

## Rollback

The verified official 1.1.5 ZIP and `tags/1.1.5` remain available. A files-only
rollback preserves tested data but restores the old writer and its known risks.
Pause editorial saves, preserve unsaved text and fresh backups, replace the
complete plugin directory with the verified seventeen-file package, check
activation, purge relevant caches and reopen editor tabs. Do not overlay files
and leave new helpers behind, or blindly restore a database over newer content.

Changing Stable tag back does not automatically downgrade installed 1.1.6.
Broad recovery needs a separately accepted higher-version corrective release;
do not overwrite tag 1.1.6 or immutable runtime bytes. Cloudflare rollback is
separate and cannot restore installed plugin files or damaged content.

## Evidence and documentation boundary

Local evidence: `.local/wordpress-1.1.6-rc18-readiness-20261114/`.

- `INVENTORY.json`: 166 files, 8,559,578 bytes; SHA-256
  `24460be78087272a6c39826e53ccd142cc66f41ea312ca6de233045885050835`.
- `READINESS.json`: SHA-256
  `2266fad6117c798bf1e9a245aa793986020427bf49051f53d068f775bb9d2975`.
- `REPORT.md`: SHA-256
  `b71e86d7d466500ba34a283ee757f9b158ed81a51fd8f21cbf36c02c2b2b4b34`.

The raw review keeps its original NO-GO for stale documentation and unverified
account readiness. This later documentation change is additive. Exact-HEAD
checks for its PR are recorded after commit outside these immutable receipts;
they do not need a self-referential follow-up commit. Production main builds
remain enabled and preview builds disabled: a future documentation merge can
trigger production delivery, so no merge is included in this task.
