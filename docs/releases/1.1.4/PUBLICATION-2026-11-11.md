# WordPress 1.1.4 publication

**Published from accepted rest-r14 in SVN r3796553. The public directory and both
downloadable ZIPs are verified. The update API had not yet offered 1.1.4 at
15:06 UTC on 11 November 2026.** These are separate results; the release is not
reported as fully distributed through the updater.

See [machine-readable publication evidence](publication-20261111.json), the
[frozen manifest](manifest-rest-r14.json), and the preceding
[source/CI finalization](FINALIZATION-2026-11-11.md).

## Published identity

- SVN revision: **3796553**, author `falselight`.
- Commit time: `2026-11-11T15:04:55.839830Z`, **17:04:55 Europe/Kyiv**.
- Source commit: `d5b69e9df3ab038eb782fbb7f8f4d18565dd3b20`.
- Pre-publication HEAD: `6307dac4f8b0689f0910710f698c67c6ab5bceea`.
- Required Repository checks and Browser tests passed on both commits; the
  final pre-publication run is [43027012058](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43027012058).
- Accepted archive: 67,703 bytes, 16 installable files,
  SHA-256 `57cb0689860a0c4faa6cfbe522b021c3652d36a37120366368b82bd44c52f780`.

One successful SVN transaction changed exactly 21 reviewed paths under
`trunk` and the new `tags/1.1.4`. Pinned exports of both trees at r3796553 match
all 16 frozen file hashes. Existing release tags, directory assets and SVN
properties were preserved. The former trunk is backed up with a file manifest
under `.local/publication-r14-20261111/previous-trunk/`.

The first noninteractive authentication attempt was rejected and did not commit.
The user then ran the guarded script in their own Terminal and entered the
SVN password only at its prompt. The remote log independently confirms the
successful revision. No password is included in the evidence.

## Public file verification

| Target | Result |
| --- | --- |
| [Directory](https://wordpress.org/plugins/simple-digital-clock/) and plugin-information API | HTTP 200; version 1.1.4 and versioned download link |
| [Versioned ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.1.1.4.zip) | HTTP 200; exact 16-file r14 payload |
| [Latest stable ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.latest-stable.zip) | HTTP 200; exact same 16-file r14 payload |
| SVN trunk and tag exports at r3796553 | Exact 16-file r14 payload in each tree |
| Stable Tag / minimum WordPress / minimum PHP | 1.1.4 / 6.3 / 7.0 |
| Source and public ZIP `Tested up to` | 7.1; the directory API displays 7.1.4 |

Both public archives are 68,831 bytes and have SHA-256
`e847ac9fd5ac142d418f3b879c4f232152e48ab670c5ada81746eb5d516040ab`.
WordPress.org repackaged the ZIP container; every extracted file is byte-identical
to the accepted artifact. CRC, root paths, duplicate names and symlink checks
pass. The accepted local ZIP and all frozen acceptance records remain unchanged.

Two independent read-only checks verify public delivery. Search-index results
that still showed 1.1.2 and an initial sandbox DNS failure were retained but
excluded from live-delivery proof. The first full verifier incorrectly required API `tested=7.1` exactly
and flagged its `7.1.4` display. Its original failure is preserved. After
correcting only that API comparison to allow patch expansion in the declared
minor branch, a separate full read-only verification passed all four gates.
ZIP and source comparisons remain strict. No plugin code was changed during publication.

## Update availability

At `2026-11-11T15:06:24.618965Z`, 30 real HTTPS POST requests to
`https://api.wordpress.org/plugins/update-check/1.1/` all returned HTTP 200.
Ten exact WordPress versions were checked for each installed plugin version:
6.3.14, 6.4.14, 6.5.14, 6.6.11, 6.7.11, 6.8.12, 6.9.11, 7.0.8, 7.1.4 and
7.2-beta5.

| Installed version | Requests | Actual API response |
| --- | --- | --- |
| 1.1.1 | 10 | Update offered to 1.1.2 |
| 1.1.2 | 10 | No update; metadata version 1.1.2 |
| 1.1.4 | 10 | No update; metadata version 1.1.2; no downgrade offered |

Target 1.1.4 offers: **0/20**. Current-version metadata controls: **0/10**;
no-downgrade controls: **10/10**. Result: **UPDATE_DISTRIBUTION_PENDING**.
The requests were neither mocked nor retried; no site transient was changed and
no site installation was performed. Core sends WordPress in its user agent and
does not send a PHP runtime field in this request. PHP requirement evaluation is
local interpretation of returned metadata, not additional running PHP acceptance.

The [official Plugins Team policy](https://make.wordpress.org/plugins/2026/09/09/automated-security-review-for-plugin-releases/)
specifies a six-hour cooldown before update API availability, including the
manual update button. The observed result is consistent with that delay; it
does not establish a separate security block. The reference time for another
check is **after 21:04:55 UTC / 23:04:55 Europe/Kyiv on 11 November**, without a
guaranteed availability deadline. A new commit or cooldown bypass is not needed.

To repeat the read-only matrix from this checkout after that time:

```sh
set -euo pipefail
python3 .local/publication-r14-20261111/update-audit/audit.py \
  --execute --svn-revision 3796553 \
  --svn-time 2026-11-11T15:04:55.839830Z
```

Each invocation preserves a separate evidence directory. Exit status 2 means
distribution is still pending; 1 denotes a verification/transport error.
Availability is complete only when the actual target offers and exact advertised
package pass. Installation through a public offer remains a separate check.

## Boundaries and retained evidence

Publication does not rerun or expand the [r14 compatibility matrix](INDEPENDENT-ACCEPTANCE-REST-R14-2026-11-11.md).
That acceptance includes actual Core upgrader operations using the accepted
local package, with separate physical-file rollbacks. No production site was
updated during publication. Final WordPress 7.2 is not certified by Beta 5 tests.

The r9 ZIP, failed r10-r13 candidates, frozen r14 manifest and acceptance, and
pre-publication finalization records remain unchanged. Their earlier unpublished
statuses describe their recorded times. Current status pointers link this report.
The standalone widget 0.8.1 artifact and production CDN deployment are unchanged.
PR #18 remains unmerged; no GitHub Release or new Git release tag was created.

Raw evidence is retained under `.local/publication-r14-20261111/`: SVN receipts,
previous-trunk backup, public files and hashes, independent review, and all
30 update requests/responses. The machine-readable record binds those receipts
by SHA-256. Existing tags and previous artifacts remain available for incident
review; file rollback cannot reconstruct discarded metadata and older writers
can reintroduce known defects. No rollback was performed.
