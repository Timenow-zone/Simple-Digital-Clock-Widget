# WordPress 1.1.6 release preparation

Status: **RC4 NO-GO: FIREFOX ALIGNMENT; RELEASE INCOMPLETE**.
Selected [RC4](RC4.md) contains [widget 0.8.3](../0.8.3/README.md), which corrects
the initial-host exception isolation regression found in RC3. The
[scoped acceptance report](FINAL-ACCEPTANCE-RC4.md) and [JSON index](acceptance-rc4.json)
retain the earlier exact-artifact checks and historical limits. A later
[single/multiple-instance review](../0.8.3/MULTI-INSTANCE-REVIEW.md) finds Firefox
right/center alignment failure in the unchanged runtime. It supersedes the
current compatibility decision; CDN delivery remains pending.

## Selected artifact

| Item | Identity |
| --- | --- |
| Candidate | RC4, internal plugin version 1.1.6 |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc4.zip` |
| SHA-256 | `20ba3c0ebdaa5ff9f99639d59a004f471767a7f20e5e13518b1864403b68c1ea` |
| Layout | 72,469 bytes; 17 regular files |
| Manifest | [Frozen RC4](manifest-rc4.json); [current pointer](manifest.json) |
| Executable source | `85b0943789e174dea84ea0993eb5777e98138213` |
| Shared widget | 0.8.3; 36,245 bytes; SHA-256 `c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b` |

The executable commit contains 16 of the 17 package files. The readme's exact
source reference was finalized afterward. All 17 files were verified against
containing commit `1a1e7f824913388587841c4c7e002f31800a8cee`; the archive and full
manifest identify the exact candidate.
The frozen manifest retains its original pre-acceptance status.

## Scope and acceptance

The shared host isolates each initial mount error, preserves its browser
diagnostic and continues connecting other clocks. Renderer readiness completes
independently of whether every user configuration renders. Main runtime and
bootstrap are rebuilt together, and both PHP version references select 0.8.3.
Exactly four files differ from RC3; the remaining 13 files are identical.

Native render signals and explicit requests retain ordinary Core enqueue.
Default empty pages retain zero main-runtime requests. The external bootstrap
supports raw/client-inserted clocks, first-clock `whenDefined()` and shadow roots.
Opaque runtime URL overrides retain the owner-approved eager compatibility
[exception](OVERRIDE-POLICY.md), including loading on empty pages. Core ownership,
CSP/nonce/SRI errors and editor/preview document boundaries remain unchanged.

The [asset contract](../../WORDPRESS-ASSET-CONTRACT.md),
[implementation plan](REMEDIATION-PLAN.md) and
[acceptance matrix](ACCEPTANCE-MATRIX.md) define requirements. In addition to the
historical 42-gate matrix, every candidate must pass the exact main artifact in
ordinary HTML and installed WordPress with Google Chrome, Firefox and WebKit.
Actual rendering and ticking, per-host fault isolation, source identity and
response hashes are required. Chromium-only runs do not satisfy Chrome cells.

## Historical evidence

- [RC3](RC3.md) remains frozen and **NO-GO** for `STANDALONE-P2-01`. Its
  [acceptance snapshot](FINAL-ACCEPTANCE-RC3.md), [42-gate index](acceptance-rc3.json),
  [manifest](manifest-rc3.json), archive and raw evidence remain unchanged.
- [RC2](RC2.md) remains frozen and **NO-GO** for its configured old-runtime
  conflict; RC3's approved policy resolved that separate finding.
- [RC1](RC1.md) remains **NO-GO** for its native preview, CSP and hidden-integration
  failures. Its 2,566 sealed evidence files and frozen archive remain preserved.
- [Browser-r3 acceptance](FINAL-ACCEPTANCE-2026-11-12.md) records earlier scoped
  results. No historical PASS is relabeled as a fresh RC4 execution.

## Release boundary and rollback

[Draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
remains stacked on [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18).
Required **Repository checks** and **Browser tests** must pass on final HEAD.
No merge or branch-protection bypass is authorized by this preparation.

Production CDN delivery remains pending and requires separate authorization,
exact public SHA/cache/reference/smoke proof and retained rollback. The old
0.8.2 Cloudflare promotion proposal is withdrawn. WordPress.org publication also
requires a separate explicit owner instruction. This is not
`READY_FOR_WP_PUBLICATION` or evidence of production 0.8.3 delivery.

The accepted local 1.1.5 rollback archive is
`.local/packages/simple-digital-clock-1.1.5-final.zip`, SHA-256
`2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
The public 1.1.5 ZIP has a different container hash and identical installed files.
Rollback changes plugin files without restoring the database. After any future
installation or rollback, purge relevant caches and verify exact runtime and
bootstrap responses on both clock and empty pages. Raw candidate archives and
acceptance receipts are under ignored `.local/` paths and must be retained.
