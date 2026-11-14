# WordPress 1.1.5 final prepublication snapshot

Date: 2026-11-11. Status: **final local package prepared; WordPress.org publication
not performed**. The functional acceptance passes for the owner-confirmed scope:
previously saved Simple Digital Clock Gutenberg blocks in posts, pages and
block-based widget areas, their settings/save behavior, and zero plugin scripts
on clock-free frontend pages. The plugin has no built-in shortcode. Custom PHP
shortcodes in the test corpus provide additional integration coverage only.

## Exact package

- Final archive: `.local/packages/simple-digital-clock-1.1.5-final.zip`.
- SHA-256: `2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
- Size: **71,378 bytes**, **17 regular installable files**.
- Origin: a byte-for-byte copy of accepted `compat-server-r2`, without rebuilding
  or repacking. Canonical source and both archives match the [manifest](manifest.json).
- Widget: unchanged **0.8.1**, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Source base: `f0c0843f4cb6a08346b96ff497a99677ec3e93ec`, with reviewed local
  uncommitted changes. This base commit is not a commit of the new 1.1.5 source.

All previously accepted/rejected archives and published versioned widget bytes
are preserved. No database migration, new widget build or CDN deployment is part
of this package.

## Changes from public 1.1.4 r14

| Package file | Change and purpose |
| --- | --- |
| `includes/simple-digital-clock-assets.php` | Register Core handles early; deliver Core-generated runtime tags only after actual server-rendered clock output; preserve editor preview, attached data/nonces and deduplication; exclude non-HTML responses and handle fixed Content-Length safely |
| `includes/simple-digital-clock-output.php` | Added the previously tested streaming observer to detect delivered clock markup, including raw and late output, while ignoring tested inert/escaped/discarded content |
| `widget_init.php` | Plugin version and release annotation set to 1.1.5 |
| `readme.txt` | Stable tag and changelog set to 1.1.5; describe conditional loading, custom integration boundaries and full-page cache regeneration |
| `languages/simple-digital-clock.pot` | Project version set to 1.1.5; all 63 messages retained and checked against a separate fresh extraction |

**Four files modified, one added, none removed.** The other 12 package files
retain public r14 bytes. In particular, Gutenberg serialization, the legacy JSON,
REST/KSES/default-parser corrections, editor translations and the bundled runtime
are unchanged. `block.js` retains its unchanged file-level `@version 1.1.4`;
the authoritative plugin version is the PHP header and readme stable tag.

Outside the package, README files and the asset contract now distinguish primary
Gutenberg support from custom integration fixtures. Asset tests cover 87 PHP
assertions and reject previously reproduced r14 behavior. No new block type,
shortcode or user setting was added.

## Final verification

Independent payload audit: **40/40 checks**, exact 17-file identity, ZIP CRC and
regular-entry validation, synchronized versions and 10 retained archive hashes.
POT comparison verifies actual canonical and separately regenerated catalog bytes;
only `POT-Creation-Date` differs. The accepted package preserves its original POT
bytes. `Tested up to` stays **7.1**, minimum WordPress/PHP stay **6.3 / 7.0**.
The standalone widget package/lockfile correctly remain at **0.8.1**.

The final focused test run passes **44/44 tests**. `release:check`,
`release:verify`, preview parity and all seven PHP/three JavaScript syntax checks
pass; all **15 executed commands exit 0**. Raw results are recorded under
`.local/release-115-prepublication-20261111/checks/`. The unchanged exact package
retains its native installed-package acceptance; the full native matrix was not
rerun during this final snapshot.

| Exact WordPress / PHP pair | Public 1.1.2 to r2 | Public 1.1.4 to r2 |
| --- | --- | --- |
| 6.3.14 / 7.0.33 | PASS | PASS |
| 6.8.12 / 8.3.35 | PASS | PASS |
| 7.1.4 / 8.3.35 | PASS | PASS |
| 7.2-beta5 / 8.5.12 | PASS | PASS |

This is four exact pairs, not a Cartesian matrix or final WordPress 7.2
certification. The independently reread 1.1.2 evidence retains all 24 original
healthy records / 116 clocks, with 96 same-ID healthy native saves and preserved
settings. All 80 previously nonworking r14 integration observations recover.
All **352 clock-free HTML checks have zero runtime requests, runtime tags and
plugin inline JavaScript**. See [the audit](SYNCHRONIZATION.md) and
[detailed scope](README.md) for raw-readback provenance, inherited negative
controls and generated versus native UI coverage.

## Boundaries and remaining release step

The constructed client-only first-clock example is outside the owner-confirmed
primary release scope and is not a blocker for that scope. It remains an honest
integration boundary; this test did not establish a real affected user site.
Previously lost metadata still needs a backup/revision, and full-page caches
that bypass PHP require regeneration. Zero browser scripts does not mean zero
server cost; the retained performance report documents the observer's overhead.

The repository's [AGENTS.md](../../../AGENTS.md) requires pull requests and
successful `Repository checks` and `Browser tests`. They have not run for the new
uncommitted 1.1.5 source. Local checks and historical r14 CI do not replace those
checks. **The package passes local acceptance; the publication process is not yet
complete.** This snapshot is delivered before any WordPress.org write. No Git
commit, push, PR update, merge, tag, GitHub Release or SVN commit was performed
while preparing it.

Rollback of this local preparation uses the targeted snapshots under
`.local/release-115-prepublication-20261111/baseline/`; older phase-2 source
backups remain separate. Do not overwrite the accepted r2/r14/r9 archives or
historical evidence. Publication must use this exact accepted payload, then
verify public SVN/ZIP file hashes and the update offer separately.
