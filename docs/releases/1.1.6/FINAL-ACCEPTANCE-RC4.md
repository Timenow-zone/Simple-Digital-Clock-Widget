# RC4 correction and compatibility acceptance

Date: 2026-11-12. **PASS for the shared correction, all six mandatory browser
cells and the fresh scopes recorded below. RELEASE INCOMPLETE: production CDN
delivery and WordPress.org publication have not occurred.** Required hosted
checks must pass on the final PR HEAD; local results do not replace that gate.
The machine-readable index is [acceptance-rc4.json](acceptance-rc4.json).

This is scoped technical acceptance, not a claim that all 42 historical release
gates were freshly repeated. In particular, the old-writer corpus has the
explicit historical scope below. No merge or publication is authorized by this
record. Rejected 0.8.2/RC3 and their frozen evidence remain unchanged.

## Exact subject and correction

| Item | Identity |
| --- | --- |
| WordPress candidate | 1.1.6 RC4; 72,469-byte ZIP, 17 regular files |
| ZIP SHA-256 | `20ba3c0ebdaa5ff9f99639d59a004f471767a7f20e5e13518b1864403b68c1ea` |
| Main widget | 0.8.3; 36,245 bytes |
| Main SHA-256 | `c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b` |
| WordPress bootstrap | 5,614 bytes; SHA-256 `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |
| Executable source | `85b0943789e174dea84ea0993eb5777e98138213` |
| Complete package containing commit | `1a1e7f824913388587841c4c7e002f31800a8cee` |
| Frozen manifest | [manifest-rc4.json](manifest-rc4.json); original creation-time `NOT_RUN` retained |

The executable commit contains 16 exact package files; the readme's source link
was finalized afterward. All 17 files match the containing commit and frozen
ZIP. Exactly four files differ from RC3: main runtime, bootstrap, assets PHP and
readme. The other 13 files are identical. Independent builds reproduced both
JavaScript artifacts. `dist/0.8.3.min.js`, `latest`, the WordPress main and the
generated site asset match byte-for-byte; nine older versioned bundles are intact.

`STANDALONE-P2-01` affected the shared host: one initial connection error aborted
the pending queue and could leave renderer readiness unresolved. The fix validates
the adapter before installation, removes each host from the live queue before
connecting it, reports each original error asynchronously, and continues the
drain. Readiness resolves after processing the queue, including an entirely
invalid initial batch. Reentrant removal/reinsertion does not double-mount hosts.
Supported markup, properties, component rendering, styles and dependencies are
unchanged. The generated WordPress bootstrap embeds the same correction.

## Mandatory main-script matrix

Every accepted main response below returned HTTP 200 with the exact 0.8.3 SHA.
Google Chrome used explicit Playwright `channel: "chrome"`; Chromium-only
infrastructure results are not substituted. WebKit coverage is not native Safari
certification.

| Exact main artifact environment | Google Chrome 157.0.8103.51 | Firefox 153.0 | WebKit 26.5 |
| --- | --- | --- | --- |
| Ordinary HTML, external script, no WordPress | 8/8 PASS | 8/8 PASS | 8/8 PASS |
| Installed WordPress runtime scenarios, two Core versions | 14/14 PASS | 14/14 PASS | 14/14 PASS |

Standalone Chrome ran on macOS arm64; Firefox/WebKit ran on Linux arm64. Native
WordPress Chrome/WebKit ran on macOS arm64, Firefox on pinned Linux arm64. The
primary sites used Core 6.3.14/PHP 7.0.33 and Core 7.1.4/PHP 8.3.35.

The standalone scenarios cover healthy hosts; invalid first/middle/last hosts;
multiple/all-invalid hosts; dynamic insertion; and correction/reconnection.
Assertions include visible ticking, reflected properties, escaped caption text,
attribute changes, stable shadow roots and original per-host errors. The same
runner passed preserved 0.8.1 **24/24** and reproduced rejected 0.8.2's **18
expected failures and six passes**. These are 72 separately identified HTTP
executions, not 72 candidate passes. WebKit inspector deduplication is accounted
for without relaxing exact native `window.error` counts.

Native runtime cases exercise actual Core `wp_head()`/`wp_footer()`, owned block
rendering, raw HTML and dynamic insertion without a candidate-only enqueue
workaround. Invalid clocks do not produce a global `sdcw:load-error`; healthy
neighbors tick, readiness resolves, and initially empty default pages load no
main runtime until first use. The 42 native runtime rows are included in the
570-row primary total, not added to it again.

## Fresh native and independent verification

| Primary native scope | Passing rows |
| --- | ---: |
| Runtime and initial error isolation | 42 |
| Core ownership, hidden roots, CSP/nonce/SRI, real 15-second deadlines | 126 |
| Classic/block theme frontend placements and non-HTML controls | 348 |
| Dedicated real-time frontend ticking | 12 |
| Post Editor Admin/Author, default/metabox, delete/Undo/reinsert/save/reopen | 24 |
| Site Editor native insert/settings/save/reopen and public template | 6 |
| Legacy Text/Custom HTML preview workflows | 6, covering 12 isolated documents |
| Block Widgets native Caption/Update/reload, live preview and response hashes | 6 |
| **Unique primary total** | **570** |

An additional **390 warm repetitions** are recorded separately, not counted as
new scenarios. Ten fresh transition rows cover public 1.1.2 to RC4, files-only
rollback, Core reupdate, public 1.1.5 file setup and actual Core 1.1.5 to RC4 on
both sites. Each transition preserves eight content-table hashes and stable
options, verifies exact file maps and active state, and uses no database restore.

Independent scopes are not combined into one inflated test total:

- **Approved override: 42/42** on both Core versions and all three browsers.
  Pre-registration and real `script_loader_src` rewrites select immutable 0.8.1;
  static/first-after-`whenDefined()` clocks tick, including the approved eager
  request on empty override pages. Default empty pages remain conditional.
  These old-main requests prove loader compatibility, not execution of 0.8.3.
- **Cache/optimizer:** actual Autoptimize 3.1.17 and WP Super Cache 3.1.4 on
  current Core/PHP 8.3.35. Fresh default assertions 75/75; invalid-first
  static/dynamic assertions 57/57; ticking 3/3; generation controls 4/4;
  intentionally blocked runtime 7/7. All three required browsers ran.
  Stale old HTML was detected and excluded. Optimized response hashes are
  distinct from artifact hashes: 21 captured bodies verify intact accepted
  payloads and their offsets, including the 36,245-byte main plus 169 control
  bytes in a static aggregate. Direct dynamic main responses match exactly.
- **Multisite:** current Core/PHP 8.5.12, two-site subdirectory network, actual
  Chrome, superadmin and ordinary site administrator. Ten native lifecycle
  workflows and three anonymous checks pass, with 16 content-table hashes per
  file transition, 14 stored-content checks and eight frontend comparisons.
  Repeated saves create expected revisions and metadata; no whole-database
  equality is claimed across intentional writes. Other network configurations
  and editor browsers are outside this supplemental scope.
- **Package:** deterministic ZIP reproduction and full 17-file maps; six PHP
  files on PHP 7.0.33 and 8.3.35; 167 routing assertions per PHP version using
  real pinned Core tokenizers; four JavaScript syntax checks; fresh POT with
  63 messages and timestamp-only difference; 48 dictionary keys/64 gettext
  calls and escaping; installed Plugin Check 2.1.0 with 29 static and five
  runtime checks, zero findings. Checker activation changes are recorded
  separately from unchanged content tables and plugin files.
- **Regression:** source red/green proof, 11/11 actual-Chrome host tests,
  22 Node tests, 41 tooling tests, 48 WordPress Node tests, 144 source browser
  tests, 13 iframe/font tests and 99 loader integration tests. Hosted native
  caption serialization and product demo checks supplement these local runs.

## Preserved failures, data boundaries and historical scope

The first cold read-only bracket **failed** strict equality because Core created
one navigation row per site and populated theme/style cache options. Existing
content and plugin bytes were unchanged. Separate warm block/classic/runtime
brackets prove all eight tables, all options and all 17 files unchanged; they do
not retroactively turn the cold result into PASS.

Native Widgets restoration preserves every instance value and content byte, but
Core moves `_multiwidget` within the outer serialized option. The raw option SHA
therefore differs and its strict failed receipt remains. Native PHP comparisons
and owning Core source establish the exact key-order change. The Site Editor
also intentionally creates a home template/relation, raising the existing
`wp_theme` counter from two to three. These are disclosed writer effects.

First harness failures remain recorded: the fresh Site Editor guide offered
Get started instead of Close; immediate WebKit Widgets reload aborted a native
preview REST request; a cache tick output used the wrong working directory.
Fresh labeled reruns corrected only the harness. Widgets Chrome/Firefox used
runner SHA `d4c1f1a6c33b37cc8833debc67177cbae7e7b43e9031a76a185f66d394465885`;
WebKit/final runner SHA is
`9049cd2cde2f6eca91b6aa09c8a192bc24f6174812d1be8e9789c39021e4d66a`.
The latter adds error stacks and page network-idle waits before navigation;
assertions and native actions remain strict. The six workflows replace the
previous store-dispatch-only Widgets coverage.

Local infrastructure attempts with a wrong dependency mount, an incomplete
serialization snapshot and missing PHP remain failed receipts. Hosted native
caption serialization passed on source/harness HEAD `6dd5df4` in
[CI run 43197756107](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43197756107).
That earlier green run does not certify a later documentation/harness commit.

The unchanged editor serializer, block schema, KSES, dictionaries and persistence
code retain the historical RC2/RC3 corpus and old-writer save evidence described
in [the RC3 snapshot](FINAL-ACCEPTANCE-RC3.md). That evidence is limited to those
unchanged file contracts; it is **not fresh RC4 execution**, does not cover the
new runtime/bootstrap, and adds zero rows to the fresh totals. The broad original
old-writer corpus was not repeated in the primary RC4 lab. Fresh exact RC4
frontend/editor/multisite results and source/serialization regressions are
reported separately. No blanket new 42/42 release-gate declaration is made.

## Evidence, final checks and release boundary

The [JSON index](acceptance-rc4.json) records the local reports, inventory hashes,
file counts and exact subjects. Raw receipts are retained under ignored `.local/`
paths in the current workspace; those links are not hosted GitHub artifacts.
Independent reviews found no blocking product issue and verified recorded
browser results and package identities. Owned primary/cache/multisite services
were stopped; databases, archives and rollback copies were retained.

[PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
remains draft and stacked on PR #18. **Repository checks** and **Browser tests**
must both succeed on its final HEAD. The final post-push receipt will be recorded at
`.local/remediation-116-rc4/final-head-ci.json`; use the
[live PR checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks)
for any later HEAD. This record does not bypass branch protection.

A read-only production check at 2026-11-12 10:17:50 UTC still found version
**0.8.1**, main SHA
`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
No production bytes changed. The withdrawn 0.8.2 preview must not be promoted.
Future 0.8.3 delivery requires separate authorization, exact public HTTP/SHA,
version/reference/cache and clock smoke proof, with the previous deployment
retained for rollback. WordPress.org publication requires its own explicit
instruction. Consequently this is neither a completed shared release nor
`READY_FOR_WP_PUBLICATION`.
