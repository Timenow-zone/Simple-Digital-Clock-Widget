# WordPress 1.1.4: ready, unpublished

Date: 11 November 2026. Status: **READY_UNPUBLISHED**.

The accepted rest-r14 artifact is the final prepared WordPress 1.1.4 package.
Source review, exact-package acceptance and required hosted checks are complete
for the source commit below. This does not publish a version or authorize merge.

## Artifact and source binding

- Source commit: `d5b69e9df3ab038eb782fbb7f8f4d18565dd3b20`.
- Previous commit: `361b11c8270fa14c524562a9f9b885a0af36b1a0`.
- ZIP: `.local/packages/simple-digital-clock-1.1.4-rest-r14-candidate.zip`.
- SHA-256: `57cb0689860a0c4faa6cfbe522b021c3652d36a37120366368b82bd44c52f780`.
- Size: 67,703 bytes; 16 installable files.
- [Manifest](manifest-rest-r14.json) SHA-256: `1f249b1e005461f6270859df9bfa8652ad0b217d5da7656b50fb7b0aa78715dc`.

The source commit contains exactly the 40 reviewed paths. Every committed blob
matches the captured precommit file hash; all 16 installable files match the
accepted ZIP, working source and both manifests byte-for-byte. An independent
reviewer repeated the committed-file comparison. No package rebuild, rename,
version change or replacement of accepted bytes was necessary.

The [original r14 verdict](acceptance-rest-r14.json),
[independent acceptance report](INDEPENDENT-ACCEPTANCE-REST-R14-2026-11-11.md),
machine evidence and historical r9-r13 records remain unchanged. Statements about
uncommitted source or pending hosted CI in those frozen reports describe their
original observation time. This finalization record supplies the later Git/CI
binding without rewriting that evidence.

## Required hosted verification

[CI run 43026063278](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43026063278)
passed on source commit `d5b69e9df3ab038eb782fbb7f8f4d18565dd3b20`:

| Required job | Result | Dependency installation |
| --- | --- | --- |
| Repository checks | PASS | Fresh `npm ci` passed |
| Browser tests | PASS | Fresh `npm ci` passed |

The repository job includes the new i18n and REST metadata regression guards,
package/version checks, dependency audit, production-build reproduction and
tracked-file cleanliness. The browser job includes Chromium, Firefox and WebKit.
The preserved local native acceptance still supplies the real WordPress matrix,
update/rollback, permissions, KSES, stored-legacy and gettext UI evidence; hosted
unit/integration checks do not replace that acceptance.

This record pins the source run rather than claiming its own future commit hash.
Any later documentation commit must keep all installable files unchanged and
pass both required checks on its own HEAD. Check the current
[PR #18 checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18/checks)
before a future merge. Retain final-HEAD readback receipts locally under
`.local/finalization-r14-20261111/`.

## Publication boundary and limits

GitHub branch updates and PR/CI work were authorized. PR #18 remains open and
unmerged. No release tag, GitHub Release, WordPress.org/SVN publication, production
deployment or owner-site installation is part of this preparation. Publication
requires a later explicit user instruction; merging remains a separate decision.
The existing widget 0.8.1 bytes are unchanged, so this WordPress-only preparation
does not require a new widget/CDN release.

`Tested up to: 7.1` stays in the accepted package. The recorded 7.2 Beta 5 tests do
not certify final 7.2 or require delaying preparation of 1.1.4. Local CI's five
low development-only audit findings remain disclosed; the required hosted audit
passed its moderate-or-higher threshold.

Recovery applies to recognized malformed metadata still present in stored
content under the default Core parser. Already discarded attributes require a
pre-loss backup or revision. Custom parser implementations, arbitrary optimizer
or multisite combinations, native Safari/VoiceOver, new performance measurements
and actual language-pack completeness remain outside the certified scope.
Public WordPress.org update delivery can only be verified after authorized
publication. The [machine-readable finalization](finalization-20261111.json)
records this artifact, source and CI binding.
