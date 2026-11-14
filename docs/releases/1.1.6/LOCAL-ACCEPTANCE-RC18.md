# Exact RC18 additional local acceptance

Status: **BOUNDED FUNCTIONAL CHECKS PASS; STRICT LOCAL ACCEPTANCE NO-GO; NOT PUBLISHED.**

The missing local coverage was extended and the original twelve targeted admin
diagnostic records were classified using matching plugin-disabled controls.
One additional WebKit Widgets exception remains unattributed. Functional
Save/reopen success and a likely teardown explanation do not close that strict
diagnostic blocker. No new functional regression was demonstrated in the
executed matrix; this is not a guarantee that every environment is bug-free.

This report supplements, and does not rewrite, [the original RC18 acceptance](FINAL-ACCEPTANCE-RC18.md).
The [machine receipt](local-acceptance-rc18.json) maps all 42 contract gates to
fresh or preserved exact-artifact evidence and their remaining boundaries.

## Frozen identity

| Item | Exact identity |
| --- | --- |
| Candidate | WordPress 1.1.6 RC18; 82,060 bytes; 20 regular files |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc18.zip` |
| ZIP SHA-256 | `b59adf31cf9b9f8e7826e2540c81a3621d673c44f2eae65145b96a6b2b353429` |
| Frozen manifest SHA-256 | `7c09c3efc71bff139d85fd80d4e79575be070c38ab018e1b450e7d098c8e486d` |
| Main runtime 0.8.4 SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Source base | `94db2495c9547b993e835a2150ce647abbe9e065`, with pre-existing uncommitted candidate changes |

The base HEAD alone does not identify RC18. The archive, manifest and complete
source/installed file maps do. Product source, runtime, packages, manifests and
prior acceptance evidence remain unchanged. This turn adds only local test
fixtures, evidence and this report/receipt; it does not create a new candidate.

## Additional execution

Primary sites run actual WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35.
Main UI/frontend tests use Google Chrome 157.0.8103.51 on macOS, Firefox 153.0 on
Linux arm64, and WebKit 26.5. Individual reports identify macOS WebKit versus the
Linux native WebKitGTK hidden/resume and editor controls. WebKit is not Safari,
and an automation driver platform field is not a browser-platform measurement.

| Scope | Result and boundary |
| --- | --- |
| All plugin inspector controls | 12/12 native Admin/Author × two Core × three-browser workflows; 40 control observations each, not 480 separate scenarios |
| Public 1.1.2 content | 54/54 reads before save; 54/54 native double-save/reopen workflows |
| Native sidebar/pattern/template-part placement | 84/84 canonical cases, including absent/inert controls, both themes/Core versions and three browsers; fixed-Date assertions are not additional live-ticking proof |
| Native Header Site Editor | 6/6; configuration, duplicate/move/delete/undo/reinsert, Save/reopen and real frontend |
| Native block Widgets | 6/6 functional; one original minimum-WebKit exception remains the strict blocker |
| Legacy Text/Custom HTML iframe preview | 12/12 baseline/candidate pairs; unchanged widget options |
| Metabox compatibility / teeny / role boundaries | 4/4 actual metabox modes; 12/12 teeny workflows; 12/12 dashboard/Author access checks |
| Natural Classic autosave and actual Preview | 12/12 combinations; ordinary approximately 57–58-second wait, actual Heartbeat persistence and native Preview; two independently configured ticking clocks |
| Public 1.1.2 upgrade, files-only rollback, reupdate | 6/6 transitions: eight ordered content tables, stable options, activation and exact file maps; no database restore |
| Save while rolled back; read after reupdate | 54/54 healthy old/new-content workflows each; single-terminal-backslash old-writer failures retained separately |
| Public 1.1.5 upgrade | Both primary sites' existing exact-RC18 authenticated HTTP updater receipts independently reverified; full public/candidate maps and table/stable-option invariants |
| CSP, ownership and failure controls | 126/126 explicit positive/negative rows plus 18/18 extra external-only CSP rows; 72 of the first 126 actually render clocks |
| Native Core probes | 138 assertions across both Core versions; registry/dependencies, overrides, MIME, iframe/editor/preview collectors |
| Native HTTP MIME | 12/12 final REST/feed/robots/rejected-trackback/empty/clock responses; two original malformed trackback requests retained |
| Native browser HTTP cache | 6/6 cold/warm cases across both sites and three browsers; two additional Firefox persistent TCP controls prove zero warm runtime GETs |
| Native hidden/resume | 6/6; Chrome minimizes for 30 seconds, stock Firefox and native WebKit for about 2.5–2.7 seconds; correct current time, ticking and one exact runtime request |
| Both themes, four frontend states | 48/48; classic/block × both Core × empty/inert/single/nested-three × three browsers |
| Warm native theme read-only bracket | Four passing table/stable-option/file brackets around sixteen HTTP reads; cold initialization differences remain separate |

The placement matrix retains twelve original failures caused by a template
part bound to the wrong theme. The unchanged runner passes the twelve affected
cases after a separate correctly theme-qualified fixture is installed; the
other 72 cases already pass. This is 84 canonical cases, not 96 independent
passes. Eight read-only brackets preserve all content tables, stable options
and exact plugin files. Counts above use different units and revisit documents;
they must not be summed into a unique-scenario total.

Natural autosave is specifically Classic Editor after measured Core readiness.
It is not a new natural Gutenberg timer claim. Initial early-typing timeouts are
retained: a separate disabled/RC16/RC18 control demonstrates Core's one-second
TinyMCE comparison-baseline race, but does not retrospectively prove the cause
of every original timeout. Parent post data and metadata other than Core's
advisory `_edit_lock` remain unchanged in all twelve accepted autosave cases.

The single-terminal-backslash public-1.1.2 control fails on minimum Core for
Admin and Author, while current Core passes; RC18 passes all four. Files-only
rollback cannot repair content already altered by the old writer. The larger
healthy corpus contains two terminal backslashes and is not substituted as
proof for the single-backslash boundary.

## Multisite

A fresh two-site subdirectory network runs WordPress 7.1.4/PHP 8.5.12 with
network activation, superadmin and ordinary site admin without `unfiltered_html`.
The exact installed Classic Editor version is **1.7.0**; a sealed metadata
erratum corrects the network report's earlier 1.6.7 prose without rewriting it.

- Public 1.1.2 → RC18 → files-only public 1.1.2 → RC18 preserves sixteen ordered
  content tables across both blogs, site/network stable options and network activation.
- Twenty native Gutenberg workflows, 48 corpus observations, and 24 site-admin
  Classic rows with 48 actual HTTP saves pass functional checks.
- Fourteen anonymous frontend observations cover 100 clock hosts, including
  84 seconds-enabled ticking clocks; two empty pages make zero runtime requests.
- Two cross-blog guard cases reject foreign tokens with HTTP 409 and unchanged
  stored content; own valid tokens allow the intended HTTP 200 save.
- Established paragraph/entity normalization and JSON key ordering remain
  explicit exceptions to byte identity. Parsed values, foreign metadata and
  repeated-save meaning remain intact. Original strict byte failures are retained.

The network browser coverage uses actual Google Chrome and satisfies the
contract's Chromium-minimum requirement. Firefox/WebKit network-specific
execution is not claimed. Their primary single-site and standalone gates are
separate. Known Core iframe style/blob diagnostics are positively reproduced
with the plugin inactive; Chrome ViewTransition guard diagnostics remain
inherited comparisons, not a claim that the plugin cannot influence any UI error.

## Admin diagnostic conclusions

| Signature | Evidence-backed disposition |
| --- | --- |
| Preferences `Ga:3:2917`, `[object Object]` | Exact error and `fetch_error` reproduced with plugin disabled and zero plugin requests. A real users/me initialization GET is cancelled by native reload; Core awaits it without a catch. Original captures lack the new request instrumentation, so attribution is to the matching class, not an invented historical request. |
| WebKit Dashboard `admin-ajax/getEvents` | Exact class reproduced with RC18, RC16 and disabled on both Core versions. Passive telemetry observes `get-community-events` attempted after beforeunload and rejected before network emission; these are not Heartbeat save errors. |
| Firefox `WorkerMain.js` line 6 / `NS_BINDING_ABORTED` | Exact clean-navigation class reproduced with plugin disabled and zero plugin requests. Browser/automation source is recorded; a particular HTTP request or deeper upstream root cause is not invented. |
| Chrome Profile `serialize` beforeunload | Same Core error in RC18 2/3, RC16 2/3 and disabled 3/3; settled controls clean. Core reads its not-yet-initialized form reference. |
| WebKit Widgets `widget-types/text/encode` access-control exception | **NOT_ATTRIBUTED; strict local blocker.** Functional settings/save/reload/render/tick checks pass. The exact original exception has no matching disabled reproduction. |

For the Widgets blocker, the original collector has seven encode requests,
six finished and the last still pending before context close. Server logs show
HTTP 200 completion 482 ms after the final screenshot. This supports a
teardown-timing explanation, but does not prove the browser received the 200 or
record the original cancellation. Settled repeats and complete RC18/RC16 repeats
are clean; fifteen targeted paired controls do not reproduce the exact error.
A disabled plain-widget variant produces a different Core exception and is
explicitly **not** used to attribute this one. Neither non-reproduction nor an
error from a different endpoint earns a waiver.

The independent reviewer separately confirmed that the original twelve targeted
records comprise four Preferences, seven Dashboard and one WorkerMain record.
The Widgets encode exception is an additional finding and is not one of those
twelve. No product fix or upstream-error suppression was performed.

## Cache, diagnostics and evidence limits

The prior exact-RC18 server-cache matrix remains 48/48, with stale old cached
responses detected before purge and fresh exact responses after purge. The new
HTTP-browser cache evidence is separate. Firefox's initial misses correlate
with zero free Docker overlay space, 27 native cache write errors and empty
doomed entries; the unchanged harness passes with a new owned tmpfs. Old
containers/data were not deleted. This finding does not attribute admin errors
to disk exhaustion.

CSP tests intentionally retain 298 console messages. Independent classification
accounts for Core emoji code/workers, theme fonts and expected nonce/SRI/loader
negative controls; no unknown pageerror is hidden. The native Firefox/WebKit
hidden driver captures window errors/rejections but not the complete console.
One unsuccessful stock-browser attempt contains truncated JSON after tmpfs
exhaustion; it is retained as incomplete evidence, not a complete failed row.

First-ever theme renders create Core navigation posts and theme metadata. The
cold bracket is not strictly immutable. Exact local Core source and full
before/after differences are retained; a separate warmed bracket passes.
Existing clock content and plugin files are unchanged. These results do not
prove every production theme, every cache configuration, disabled OPcache
timestamp validation, long system sleep, tab discard or a real customer site.

## Preservation, independent review and remaining gates

The final preservation audit rehashed 580 protected source/package/document
files and 4,427 previous evidence files with zero mismatches. A separate root
rehash verifies 2,506 new peer-inventory entries, also without a mismatch. The original RC18
report, receipt, ZIP and manifest remain frozen. Owned services are stopped;
containers, databases and backups are retained. Private lab credentials and
live database mounts are excluded from shareable inventories, not described as
sealed evidence. Raw failures and targeted retries remain separate.

The independent reviewer checked the new diagnostics, native-surface,
CSP/cache/Core, theme, placement and hidden/resume evidence. The final aggregate
audit contains 1,003 passing assertions. That reviewer was the primary multisite
executor; the root separately checked the network evidence and its inventory.
The network report is not presented as an independent review of its own author.
Reviewers challenged counts and metadata; corrections were made only in new
unsealed prose or explicit errata. Final review and evidence inventory paths
are bound in the machine receipt.

Strict local GO still requires a conclusive disposition of the exact Widgets
encode exception, or an explicit owner decision accepting that residual
uncertainty. No such waiver is inferred. Hosted `Repository checks` and
`Browser tests` on a future exact committed PR HEAD are also pending; local
results and the current base HEAD cannot satisfy that gate. Production CDN
verification and WordPress.org publication remain separate and unauthorized.

No commit, push, merge, Cloudflare upload/deployment/settings change or
WordPress.org publication was performed. Non-production Cloudflare builds were
not enabled. RC18 and runtime were not changed to obtain passing results.

Evidence entry points:

- [Root policy/cache/theme evidence](../../../.local/rc18-local-closure-20261114/ROOT-SCOPE-REPORT.md)
- [Native surfaces and unresolved Widgets diagnostic](../../../.local/rc18-local-surfaces-20261114/REPORT.md)
- [Autosave, Preview and original admin diagnostic controls](../../../.local/rc18-local-diagnostics-20261114/REPORT.md)
- [Multisite](../../../.local/rc18-local-multisite-20261114/REPORT.md) and [metadata erratum](../../../.local/rc18-local-multisite-addendum-20261114/REPORT.md)
- [Independent root scope review](../../../.local/rc18-local-root-review-20261114/REPORT.md), [hidden/resume review](../../../.local/rc18-local-hidden-review-20261114/REPORT.md), and [final aggregate review](../../../.local/rc18-local-final-review-20261114/REPORT.md)
