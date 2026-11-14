# WordPress 1.1.6 RC3 acceptance and release preparation

Date: 2026-11-12. **Technical acceptance passes; all owned labs are stopped.**
Final-head CI must verify the containing commit of this acceptance snapshot. **Production CDN delivery remains pending**;
this record does not mark the release `READY_FOR_WP_PUBLICATION`.
WordPress.org publication requires a separate explicit owner command.

## Exact accepted input

RC3 is `.local/packages/simple-digital-clock-1.1.6-rc3.zip`: 72,320 bytes,
17 regular files, SHA-256
`eb85f4f0d526b32288a1180a14241150eb3a3ebd250c6fe95b6e19bf9b3785c4`.
The [frozen manifest](manifest-rc3.json) retains its creation-time status; the
[acceptance index](acceptance-rc3.json) records subsequent execution. The manifest
is not rewritten to replace historical `NOT_RUN` metadata.

Executable source is `2c9f8aacabe2b5b3b69bb224dcff32e63c3a851b`.
All 17 package files match containing commit
`eb23578965312679df4450522c7381236676c708`. Exactly three files differ from RC2:
assets PHP, the external bootstrap and readme. The other 14 files are identical,
including block/editor code, KSES, translations and the main runtime.

Widget 0.8.2 is 36,033 bytes, SHA-256
`47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506`.
The 5,402-byte bootstrap has SHA-256
`8d1396d79a6d7b7f978f233c74d1e3319cb01237387affb61633d4ca1c2d4545`.
No package bytes changed during final acceptance.

## Functional and data evidence

| Evidence | Result and exact scope |
| --- | --- |
| Independent package audit | Fresh RC3 deterministic ZIP/full file map, PHP 7.0/8.3, JS, fresh 63-message POT, notices, reproducible runtime/bootstrap; 167 asset assertions |
| Installed Plugin Check | RC3, checker 2.1.0: 29 static + 5 runtime checks, zero findings; 58 native Core assertions on each of two sites |
| Primary frontend | Fresh RC3: 348 cases across classic/block themes, two Core versions and three engines; 12 separate wall-clock ticking controls |
| Native editing | Fresh RC3: 12 Post Editor lifecycle workflows, 4 additional metabox workflows in Chromium, 6 Site Editor workflows and 12 legacy preview documents |
| Original corpus and Widgets | Inherited exact RC2: 54 corpus save/reopen-twice cases and 6 native Widgets cases; unchanged editor/schema/persistence file scope explicitly retained |
| Independent lifecycle | 24 public-1.1.2 baseline + 24 exact-RC2 cases; separate fresh RC3 durable-runner lifecycle checks above |
| Author compatibility execution | Fresh exact RC3: 126 unique cases, 48 original host HTML pairs unchanged; CSP/nonce/SRI/network/native-owner/hidden-integration controls |
| Native file transitions | Fresh exact RC3 updates from public 1.1.2 and 1.1.5, and physical rollback, on both primary sites; all eight content tables and stable options retained; active state and exact files verified |
| Rollback saves | Inherited 54 healthy old/new native save cases under public 1.1.2, followed by reupdate/read checks; old-writer negative controls classified separately |
| Optimization/cache | Fresh RC3: 69 default assertions, 84 override assertions plus 21 repeated default controls, 7 blocked-runtime assertions, 4 cache controls, ticking in three engines |
| Multisite | Fresh RC3: 10 native workflows, 3 anonymous cases, 16 table hashes per transition, 14 content and 8 frontend comparisons; Chromium, current Core/PHP 8.5 |
| Independent final review | Configured legacy-runtime P2 closed; all executable inputs match prior 84/84 independent actual-Core/browser proof; no new product findings |
| Regression/build | WTR 129 runner tests, other browser suites 19, loader 96; types/lint/Node/security/serialization/release/preview guards; isolated production reproduction; source CI passes |

The primary sites are WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35.
Browser evidence identifies actual Chromium, Firefox and WebKit versions;
Linux WebKit is not a claim of native Safari testing. Counts above have different
units and overlap in coverage. They are not added into one artificial total.

The corrected matrix contains **42 unique gates**, including `I18N-01`; the
previous prose count of 41 omitted that alphanumeric ID. The machine-readable
index names every gate and its source. A scoped pass does not expand the tested
browser, optimizer, role or transport configuration.

## Decisions, failures and limits

Default bundled clock-free pages request no main runtime; the external bootstrap,
inert configuration and lightweight host definition remain. Registration alone
is not renderer readiness. Native enqueues retain Core ownership, and later
third-party removal of already-rendered output follows that Core version's
ordinary queue behavior. No full-response buffering or browser API replacement.

The owner explicitly approved eager loading for opaque runtime URL overrides,
including same-byte CDN/query rewrites. Those pages can request a runtime without
a clock. This bounded [compatibility exception](OVERRIDE-POLICY.md) closes RC2's
configured-0.8.1 conflict without redefining registration as enqueue. Original
signal-free whenDefined/open/closed-shadow fixture bodies remain unchanged.

All initial failed attempts are retained. Core 6.3 deletes the last clock through
a paragraph intermediate state and needs two Undo operations; Core 7.1 needs one.
The real metabox configuration is non-iframe only on minimum Core; current Core
forces iframe content. The durable runner now checks those observed states.
A WebKit dashboard AJAX error was traced to Core dashboard navigation; retaining
that monitored tab and using a separate editor tab passed without error filtering.

Two WebKit timeout waits initially missed an already-present error state through
RAF polling. A two-case observation correction used test-only 100 ms polling and
independent DOM event timestamps: 15,001/15,002 ms after DCL. The product's real
15-second timer was never shortened. The original failures remain in evidence.

Read-only RC3 brackets preserve eight tables, all options and installed files
on both sites after explicit Core cache warmup. Earlier Core style-transient
warmup is disclosed, not relabeled as unchanged. Cache-lab `wp_navigation`
creation occurred during the public-1.1.2 baseline; extra brackets prove the
candidate's file transitions separately. Intentional editor saves create normal
Core revisions/locks/timestamps. A single terminal backslash still reproduces
an old public-1.1.2 writer failure on minimum Core; it is not a new RC3 regression
or a claim that rollback can reconstruct previously lost values.

Native Safari/VoiceOver, arbitrary third-party optimizers/consent systems,
owner-site installation and production performance remain outside this matrix.
Five low development-dependency audit entries remain; the source CI severity gate
has no moderate/high/critical findings.

## Review, evidence and remaining release gate

Independent reports: [package](../../../.local/independent-116-rc3-package/reports/REPORT.md),
[product review](../../../.local/independent-116-rc3-code-review/REPORT.md),
[harness follow-up](../../../.local/independent-116-rc3-followup/REPORT.md),
[cache](../../../.local/independent-116-rc3-cache-network-20261112/cache/REPORT.md),
[multisite](../../../.local/independent-116-rc3-cache-network-20261112/multisite/REPORT.md),
[lifecycle](../../../.local/candidate-116-rc2-ui06/evidence/UI06-REPORT.md).
The [primary native report](../../../.local/candidate-116-rc2-20261112-a/evidence/PRIMARY-FINAL-REPORT.md)
and [author-run compatibility report](../../../.local/author-116-rc3-compatibility-20261112/REPORT.md)
retain the installed-stage identity, failures, data brackets and screenshots.
These ignored local files are not implied to exist in a remote checkout.

RC1/RC2 archives and sealed evidence remain unchanged; all 2,566 RC1 files were
rehashed. Scoped inventories are verified, all owned labs are stopped with
containers/volumes/databases retained, and ephemeral browser containers are removed.
The primary inventory covers 1,783 files and has SHA-256
`a62544d92ad66b4a0da5241c66aeeca8421a5f2175768a12e8e8ed74b23eebbd`.

[Source CI](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43182749149)
passed both required jobs for `eb23578965312679df4450522c7381236676c708`.
This acceptance snapshot and harness changes require new checks on their final
containing commit. The latest [PR #19 Checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks)
and the [final local CI receipt](../../../.local/remediation-116-rc2/final-head-ci.json) are authoritative; older green runs do not replace them.

The [concrete CDN proposal](../0.8.2/CDN-DELIVERY-PLAN.md) identifies an existing
verified Cloudflare preview, all nine preserved immutable assets and the current
production rollback. Three preview browser workflows passed 11 clocks, ticking,
settings and mobile layout. Production still serves 0.8.1. Its delivery gate stays
open until explicit authorization and public 0.8.2 SHA/cache/reference/smoke proof.
No merge, production promotion, owner-site installation or WordPress publication
has occurred. WordPress publication remains a separate later owner command.
