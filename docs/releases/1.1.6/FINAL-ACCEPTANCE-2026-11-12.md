# WordPress 1.1.6 browser-r3 final candidate checks

Status: **PASS for the bounded candidate checks below; unpublished**.
Date: 2026-11-12, Europe/Kyiv. No WordPress.org publication, GitHub Release,
merge, production CDN deployment or owner-site installation was performed.

## Identity and hosted checks

The tested payload source is commit
`289f32ed6ebd9b0ecf4165ca1b1ea5679b8ae3eb` in
[draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19).
The PR is stacked on the unmerged 1.1.5 branch, PR #18. No history was rewritten.

- Archive: `simple-digital-clock-1.1.6-browser-r3-candidate.zip`.
- SHA-256: `9c853236e957119a8aac4588d8565308f10fa0d430799ac4e3d1917ca6789137`.
- Size: **71,358 bytes / 17 files**, all matching the ZIP, current package source,
  source commit and [manifest](manifest.json).
- Unchanged runtime: **0.8.1**, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

Both required **Repository checks** and **Browser tests** passed for the payload
source in [CI run 43108850632](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43108850632).
Hosted execution used fresh `npm ci`, Node 24, installed Playwright browsers,
the dependency severity gate, all workflow steps and unchanged-file guards.
Any later documentation commit still requires its own checks; the
[current PR checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks)
are authoritative for the latest HEAD. Source-run success is not substituted for
that final-head requirement.

## Fresh local checks

| Gate | Result |
| --- | --- |
| Full repository workflow equivalents | 43 checks pass after two environment-only retries; includes 107 Node tests and 24 Python tests, plus type/lint/syntax/metadata/artifact guards |
| Temporary production build | Fresh output exactly matches immutable `dist/0.8.1.min.js`; published files were not overwritten |
| Dependency audit | 0 moderate/high/critical; five existing low findings in development tooling remain |
| Full browser workflow equivalents | 190 leaf cases, 0 final failures, 0 skips, Chromium/Firefox/WebKit |
| Fresh native frontend matrix | 40/40 cases across WP/PHP 6.3.14/7.0.33 and 7.1.4/8.3.35, Chromium/WebKit |
| Fresh native Core integration | 22/22 registry/queue/order/filter/buffer checks |
| Fresh native Gutenberg | 4/4 Chromium workflows: existing block save/reopen and empty-editor first insert/save/reopen on both Core/PHP pairs |
| Plugin Check 2.1.0 | WP 7.1.4/PHP 8.3.35: 29 static + 5 runtime checks, zero findings; checker unsupported on PHP 7.0 |
| Fresh POT extraction | Pinned WP-CLI 2.12.0: all 63 messages, source references, contexts and placeholders match; only creation date differs |
| Independent bounded code review | No new actionable findings; product code was written by other agents, but the reviewer authored some PHP test doubles |
| Immutable data | 125 historical tracked files and the accepted 1.1.5 rollback archive remain unchanged |

The 190 browser cases comprise compiled WTR 111, iframe resize 3, fonts/fitting
10, WordPress serialization 3, conditional loader 60 and product-site demo 3.
Node reports 63 loader tests because it also counts three parent groups. Local
browser execution used Node 24.18.1 in a cached pinned Linux image with 734
verified installed dependency versions, no external network and isolated source
files. The hosted run separately provides fresh-install evidence.

Empty/inert native pages make zero main-runtime requests. Existing HTML clocks,
multiple clocks, late footer output and dynamic first insertion work with one
runtime request. Normal and late explicit Core enqueue retain Core ownership.
The fixture checks before/after/localized data, nonces and advancing clock text.
This is a request-count and functional result, not a production latency benchmark.

The retained exact-r3 preparation also includes two real Core upgrades from
1.1.5. Those upgrades are identified separately and are not counted as new
two-site upgrade runs on November 12.

## Editor fixture distinction and data scope

The initial editor attempt used generated frontend fixture post 4. It contains
renderable clock markup but omits attributes required by Gutenberg serialization,
and is already invalid under the accepted 1.1.5 baseline. No save was performed
on that invalid fixture. Its original failure and the actual baseline control
are retained, rather than reported as a newly introduced r3 defect or silently
discarded.

The final old-content editor cases use previously accepted native post 89 with
seven clocks. A title-only native editor save and reopen preserve its raw content
byte-for-byte and all clock settings; the original title is restored. Two fresh
draft cases verify first insertion, runtime rendering, saving and reopening.
These saves use Gutenberg's `core/editor` save pipeline; they are not a claim of
a complete toolbar-click or role/permission matrix.

The earlier upgrade/read-only phase preserved all 211 posts and 42 postmeta rows
per site. The new editor phase intentionally creates drafts/revisions and edit
metadata, so whole-database identity is not claimed for this phase. No production
data or source-lab data was used for writes. All three owned native test
containers were stopped after the final file and state checks.

## Retained failures, limits and release boundary

The initial local audit could not resolve the npm registry in the sandbox. A
lock-only network audit passed after confirming every dependency resolves through
the public npm registry and that npm excludes the root project from its audit
payload. The initial Parcel build could not open LMDB in the sandbox; the same
temporary-output checker passed with the required local access. Neither retry
changed dependencies or artifact bytes.

The first isolated product-demo test lacked Git metadata needed for source links.
The unchanged test passed with Git metadata mounted read-only. Original logs for
all three environment failures remain available. No product fix or new archive
revision was needed during final checking.

Known loading limits remain: first clocks created only after
`customElements.whenDefined()` or inside shadow roots require explicit runtime
loading. A clock-free page still has inline loader/JSON bytes and a waiting DOM
observer. Arbitrary optimizer/consent transformations and every CSP are not
certified. The native Core 6.3 CSP fixture explicitly permits legacy localized
data and omits an unrelated theme skip-link script; this is recorded fixture
setup, not a plugin modification.

Native Safari, multisite, the full historical Gutenberg role matrix, production
load and owner-site integration remain outside this bounded acceptance. These
checks do not authorize release. A future installation needs full-page cache
regeneration and site smoke tests. The immutable accepted 1.1.5 ZIP remains the
rollback package, without a database migration to reverse.

## Evidence

Raw logs are retained locally outside Git and the installable package:

- `.local/final-116-20261112/repository/FINAL.json` and `commands.json`.
- `.local/final-116-20261112/browser/RESULT.json` and linked command logs.
- `.local/final-116-20261112/native/` with frontend/editor/Plugin Check/POT receipts.
- `.local/final-116-20261112/review/independent-code-review.json`.
- `.local/final-116-20261112/identity-final.json`.
- `.local/final-116-20261112/hosted-source-jobs.json`.

The [initial candidate record](README.md) retains prior r1/r2 findings and exact-r3
upgrade evidence. The final aggregate records evidence hashes without publishing
local credentials, database contents or raw browser sessions.
