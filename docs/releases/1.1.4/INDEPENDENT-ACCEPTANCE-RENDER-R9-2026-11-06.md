# Independent local acceptance: WordPress 1.1.4 render-r9

Verdict: **GO for the exact local ZIP; all 13 mandatory gates PASS, no waivers**.
This permits the user-authorized local commit. It does not authorize push, merge,
WordPress.org/CDN publication or installation on an owner site.

The package/source/CI reviewer and native WordPress reviewer executed fresh checks
from frozen inputs. A separate gatekeeper independently read the scripts, raw
results and identities before issuing GO. Root-executed supplemental lifecycle
checks were independently reviewed by both the native lead and gatekeeper.
Earlier r8 and r9 regression results were not reused as acceptance results.

## Accepted identity

- ZIP: `.local/packages/simple-digital-clock-1.1.4-render-r9-candidate.zip`.
- SHA-256: `5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
- Size: 66,815 bytes; 16 regular installable files; [manifest](manifest.json).
- Manifest SHA-256: `f9fdc614092ef566b2965a68a693a87b928c939595334a2873d0bab83b1446c6`.
- Shared widget 0.8.1: 36,009 bytes, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Tested source: 411 frozen public files based on
  `1a60f9fe1bed3afa56f45bdac5c485a1ec4e7b06` plus the recorded local changes.
  The base commit alone does not identify the candidate.

The [machine-readable record](independent-render-r9-20261106.json) includes the
complete frozen source inventory, reviewer receipt hashes, gate decisions, counts
and scope boundaries. The commit containing this report records the tested
executable files together with subsequent documentation-only status integration.
The final commit SHA and Git-tree/package comparison are recorded locally in
`.local/independent-render-r9-20261106/control/postcommit.json` after committing.

## Mandatory gates

| Gate | Result | Fresh evidence |
| --- | --- | --- |
| G01 archive/source/baselines | PASS | Safe paths, CRC, exact 16-file allowlist and manifest/source bytes; fresh public 1.1.2 download matches the frozen predecessor |
| G02 metadata/licenses/security | PASS | Version/minimums/POT/license checks, complete MIT notices, scoped diagnostics/KSES/permissions review |
| G03 supported references | PASS | Actual WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35 |
| G04 clean installs | PASS | Two new databases; direct candidate installs without a predecessor; four browser smoke pairs |
| G05 original file rollback | PASS | Six transitions: public 1.1.2 -> r9 -> original 1.1.2 -> r9 on both references; full saved post rows and critical options preserved, no database restore |
| G06 editor compatibility | PASS | Separate original/r9/editable-reserve/r9 cycle; three roles, 108 real saves and 756 strict JSON block checks; original-writer negative controls retained |
| G07 security/recovery/HTTP | PASS | Per reference: 487 security checks plus 51 raw captures, 10 recovery and six unknown-metadata cases; 36 HTTP authorization/nonce/direct-access controls |
| G08 Plugin Check 2.1.0 | PASS | 29 static and all five actual runtime checks on supported PHP 8.3.35; zero findings |
| G09 full frontend contract | PASS | 45 fixtures x two references x Chromium/Firefox/WebKit = 270 browser cases |
| G10 classic/footer/filters | PASS | 60 classic-theme and 36 supplemental browser cases; 28 HTTP cases, two native style-parity controls and two REST responses containing rendered clock blocks |
| G11 admin/editor/iframe | PASS | Four reference/browser pairs: ordinary admin exclusion, scoped notice, empty first insertion, iframe layout, save/reopen |
| G12 local CI/reproduction | PASS | Fresh npm install; 229 CI tests plus eight extracted-ZIP Node tests; exact PHP/JS syntax and focused guards; reproducible widget and reserve archive |
| G13 preservation/closure | PASS | All 411 frozen sources and six installed copies exact; full frontend saved-state comparisons; all three owned projects stopped; archives unchanged |

Actual resource requests, tags, inline rules, clock rendering and ticking were
checked. First renders at footer priority 19, priority 20 before/after Core, and
after the footer all pass. Repeated footer execution does not duplicate resources.
The plugin installs no global output buffer or HTML scanner.

Native loader attributes, before/after inline scripts, localization and inline CSS
additions retain Core behavior. The nonce CSP case passes separately from the
localization-data case: Core 6.3 prints localized data through a legacy path that
does not use the inline-attribute filter. Source-free inline styles match the Core
control exactly except for their handle; no media attribute or `style_loader_tag`
invocation is synthesized. REST, feed and robots contain no plugin resource leak.

## CI and dependency results

Fresh `npm ci` installed 734 locked entries with no version mismatch and applied
the existing patches. Local CI passed 75 Node tests, 24 Python safety tests,
111 browser unit cases and 19 browser integrations: 229 total. Extracted-ZIP tests
add eight Node tests, plus 43 routing and 48 serialization assertions on each
exact PHP reference. All six package PHP files and three JavaScript files pass
syntax checks. The production widget and immutable reserve rebuild are byte-exact.

Fresh audit passes the unchanged moderate-severity threshold: **five low dev-only
findings; zero moderate, high or critical**. This is not an audit-zero claim.
The npm allow-scripts warnings remain recorded; every dependency install script
was not separately certified. Required build/runtime checks passed.

CI ran on Ubuntu 24.04 ARM64 with Node 24.18.1, npm 11.16.0 and the pinned browser
image. It is not a GitHub-hosted amd64 check. Browser binaries were image-pinned;
a fresh browser/system-package installation was not performed.

## Retained failures and corrected test assumptions

- Firefox initially could not create a page because the container home directory
  was read-only. A temporary writable home fixed startup; the full failed browser
  step then passed with unchanged code, tests, image and timeouts.
- Isolated npm config and retained Parcel cache setup each required a harness-only
  correction. Initial logs and successful reruns are retained.
- Parallel reviewer dashboard logins created Core Quick Draft records during an
  overly broad state comparison. A separate frontend-only cycle compared all rows
  and critical options without exclusions and passed. Switching to a classic theme
  separately added Core's empty sidebar slot; the precise delta is retained.
- An obsolete r8 probe called the intentionally removed scanner. Current r9 checks
  independently prove scanner absence. A fixture's flush against a nonflushable
  Core buffer and blocked external updater warnings remain recorded separately
  from plugin failures and Plugin Check findings.
- The initial CSP fixture incorrectly assumed Core 6.3 localization used the nonce
  attribute filter. Separate CSP and localization-data cases verify the actual
  Core paths without changing the candidate.
- The first evidence index hashed a still-open log. The gatekeeper's original
  mismatch receipt is preserved; the original index itself had already been
  replaced and is not claimed as preserved. The final closed-log index contains
  377 entries, all independently rehashed. Its corrected lineage points to the
  original mismatch receipt. A gatekeeper parser-field mistake is also retained.

No candidate bytes, required assertion, severity policy or timeout were changed
to obtain GO. No mandatory test was waived.

## Compatibility boundaries and remaining release steps

The [asset contract](../../WORDPRESS-ASSET-CONTRACT.md) remains unchanged by this
acceptance: automatic loading follows the owned block render event. Raw custom
HTML, cached fragments and external renderers need `SDCW_enqueue_scripts()`.
A later parent/filter can suppress a rendered child while resources remain queued.
Normal footer execution is required; empty block editors are a preview exception.

Public 1.1.2 can still corrupt malformed metadata when edited through Core 6.3:
the fresh control retained 30/33 invalid-or-changed corpus observations on that
reference, versus 0/33 on the current reference. This is an inherited old-writer
defect, not an r9 update failure. The immutable editable 1.1.2.1 reserve is a
separate rollback option, not an intermediate upgrade requirement. Already erased
data cannot be reconstructed. All historical accepted archives remain unchanged.

Hosted required PR checks remain pending because push is forbidden. A future merge
must still satisfy branch protection. WordPress.org/CDN publication and owner-site
installation have not been performed. Native LocalWP, Safari, VoiceOver, multisite,
arbitrary optimizers, public font availability and new TTFB/PHP-memory measurements
are outside this established local acceptance. No prior performance verdict transfers.

Raw scripts, responses, failed attempts and reviewer reports remain under
`.local/independent-render-r9-20261106/`; native databases and logs remain in the
three stopped `.local/wordpress-repro/ind-r9-20261106-*` projects. Credentials and
raw private lab data are excluded from Git. The prior
[local-regression status](acceptance-render-r9-local-regression.json),
[regression report](REGRESSION-RENDER-R9.md) and
[earlier final audit](FINAL-LOCAL-AUDIT-2026-11-06.md) remain historical records.
