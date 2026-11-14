# WordPress 1.1.5 publication

**Published to WordPress.org; public files verified. Update-API distribution of
1.1.5 remains pending in the recorded sample.** SVN revision **3797104** committed
at **2026-11-11 21:17:24.092953 UTC / 23:17:24.092953 Europe/Kyiv**.
The [machine-readable record](publication-20261111.json) binds the receipts,
archive identities and per-file hashes.

## Published payload

The pinned [1.1.5 SVN tag](https://plugins.svn.wordpress.org/simple-digital-clock/tags/1.1.5/)
and trunk exports both match all **17 accepted files**. The transaction contains
11 changed paths: four modified files and the added output observer in trunk
and the copied release tag, plus the tag directory. Source commit:
`3ba350f9865fa70e844c199c893788fb8791e738`.

| Archive | Bytes | SHA-256 |
| --- | ---: | --- |
| Preserved local final / accepted server-r2 ZIP | 71,378 | `2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2` |
| WordPress.org versioned and latest-stable ZIP | 72,537 | `246c91091fa0feda5e4546b0373b7bd310c6b49d491082114cd17d143c4be882` |

The [versioned ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.1.1.5.zip)
and [latest-stable download](https://downloads.wordpress.org/plugin/simple-digital-clock.latest-stable.zip)
returned HTTP 200; latest-stable resolved to 1.1.5. Their archive containers differ
from the local ZIP, while every extracted file matches. CRC/path validation
passed, with no duplicate entries or symlinks. Shared widget **0.8.1** remains
unchanged; this publication introduces no new CDN artifact or database migration.

The file/catalog audit finished at **21:19:23.890536 UTC**. Plugin information
reported 1.1.5 and its versioned download URL. Readme `Tested up to` remains
**7.1**; the catalog expands this to **7.1.4**, without changing package bytes.
Minimum WordPress/PHP remain **6.3 / 7.0**. The stable tag is verified from the
SVN/ZIP readme; the plugin-information response omits that field.

## Update availability snapshot

At **21:20:20.009661 UTC**, twelve anonymous official update-check requests all
returned HTTP 200. They cover WordPress **6.3.14, 6.8.12, 7.1.4 and 7.2-beta5**,
each with installed plugin versions 1.1.2, 1.1.4 and 1.1.5.

| Reported installed version | Requests | Observed response |
| --- | ---: | --- |
| 1.1.2 | 4 | Update offer for **1.1.4**, not 1.1.5 |
| 1.1.4 | 4 | `no_update`, metadata version **1.1.4** |
| 1.1.5 | 4 | No update offer; `no_update` metadata still **1.1.4** |

There were **0/8 target 1.1.5 offers** for the two older-version groups. The
current-version negative controls passed absence-of-offer **4/4**, but did not
show current 1.1.5 metadata. Public download/catalog availability and update
distribution are therefore separate observations. This sample neither proves
universal absence of 1.1.5 offers nor establishes a rollout deadline or installed
user count. These are API requests, not PHP runtime tests or owner-site upgrades.

## Checks and retained scope

Required `Repository checks` and `Browser tests` passed in
[source run 43099642441](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43099642441)
and [subsequent run 43100420340](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43100420340).
The publication-documentation commit must receive its own required hosted checks;
these completed runs do not certify a future documentation HEAD.

The accepted scope remains saved Gutenberg clocks in posts, pages and block-based
widget areas, plus the documented server-rendered integration fixtures. There is
no built-in shortcode. The client-only integration boundary, inherited metadata
loss controls and measured PHP memory cost remain in the [release record](README.md).
The [prepublication snapshot](PREPUBLICATION-2026-11-11.md) and
[source verification](SYNCHRONIZATION.md) retain their historical prepublication
status; they are not rewritten to imply publication had already occurred.

Raw read-only receipts are retained locally and hashed in the JSON record:

- `.local/publication-115-20261111/file-audit/attempt-20261111T211914Z-cb4cc11d/receipt.json`.
- `.local/publication-115-20261111/update-audit/20261111T212018Z/RESULT.json`.

No merge, Git tag, GitHub Release, new CDN deployment or owner-site installation
is claimed by this publication record. Verification of 1.1.5 update offers
remains outstanding.
