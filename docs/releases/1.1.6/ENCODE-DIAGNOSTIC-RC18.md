# Exact RC18 WebKit Widgets encode investigation

Status: **MATCHING ERROR CLASS ATTRIBUTED; PRODUCT SOURCE UNCHANGED; NOT PUBLISHED.**

This additive investigation resolves the remaining `widget-types/text/encode`
attribution question in [the frozen local acceptance report](LOCAL-ACCEPTANCE-RC18.md).
The original report, failed observations and its historical NO-GO verdict remain
unchanged. This is a new disposition based on new evidence, not a retrospective
claim that the old test was clean.

## Exact scope

- WordPress plugin 1.1.6 RC18 ZIP SHA-256:
  `b59adf31cf9b9f8e7826e2540c81a3621d673c44f2eae65145b96a6b2b353429`;
  82,060 bytes, 20 regular files.
- Frozen manifest SHA-256:
  `7c09c3efc71bff139d85fd80d4e79575be070c38ab018e1b450e7d098c8e486d`.
- Unchanged runtime 0.8.4 SHA-256:
  `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Reproduction: owned loopback Docker WordPress 6.3.14/PHP 7.0.33,
  native macOS arm64 WebKit 26.5, Playwright 1.62.1, WebKit revision 2336.
  This is bundled WebKit, not native Safari.
- Baseline: exact RC16 archive SHA-256
  `18a1b2c67f181a0a3c719646241499eb237ce63962f5ad6f08a32fc165639601`.
  Baseline installation and restoration of RC18 use the real authenticated
  local Core HTTP updater, with immediate file identity and behavior probes.

HEAD `94db2495c9547b993e835a2150ce647abbe9e065` is only the source base;
pre-existing uncommitted candidate changes mean HEAD alone does not identify RC18.

## Reproduction and cause

1. Open the native block Widgets screen with a Core legacy Text widget.
2. Type into its native Title input.
3. Start a native reload before Core's 200 ms form-change debounce expires.
4. While the old document is being replaced, Core invokes
   `handleFormChange → saveForm → encodeWidget → wp.apiFetch → fetch`.
5. WebKit rejects that new fetch before network emission with `TypeError: Load failed`
   and logs `Fetch API cannot load ... due to access control checks.`

The controlled runs do not intercept or abort requests, delay the server,
replace responses, inject errors, change Core's debounce or use a fake clock.
They select the real input-to-reload interval to expose the timing window.
The observed frequency therefore is not a population incidence estimate.

The decisive controls use passive event listeners only: no fetch override.
With the plugin disabled, both the original message and the **entire original
stack match byte-for-byte**. Those rows have zero candidate HTTP requests and
zero candidate script elements. The edited active sidebar contains plain Core
Text/HTML widgets; old inactive clock content remains in the database. A wholly
clock-free database is not claimed.

Separate passive fetch observers record the 200 ms deferred call and immediate
rejection after navigation starts. They add an observer stack frame, so they
support timing, not original full-stack equality. Correlation by unique typed
title against a passive server observer proves four rejected calls never
reached the REST handler; two settled controls reached it and completed HTTP 200.
Two immediate-reload controls recorded old-document pagehide after 177/194 ms,
before the 200 ms debounce deadline, with no matching call reaching the server.
The observer adds no network delay and does not change responses; instrumentation
I/O is not claimed to have literally zero overhead.

Core catches the rejected promise and displays/logs its normalized `fetch_error`.
The reproduced rows have no window `error` or `unhandledrejection` event.
Playwright's WebKit adapter converts JavaScript-source console errors into
`pageerror` events. A collected `pageerror` therefore does not establish an
uncaught plugin exception in this case.

## Paired results

| Root run | Native race rows with the exact message | Settled controls with that error | Original full-stack matches |
| --- | --- | --- | --- |
| RC18, fetch timing observer | 6/6 | Not run | Observer frame added |
| RC18, events only | 6/6 | 0/2 | 6/6 |
| Plugin disabled, fetch timing observer | 6/6 | 0/2 | Observer frame added |
| Plugin disabled, events only | 4/6 | 0/2 | 4/4 positive rows |
| RC16, events only | 6/6 | 0/2 | 6/6 |

All 38 root flows completed; 28/30 race rows reproduce the exact message and
0/8 settled controls do. These are diagnostic experiments, not 38 additional
regression scenarios. HTTP plugin-request collection was added in the final
events-only runner: its disabled and RC16 runs have that coverage; earlier
runner versions do not claim it.

An independent agent wrote a separate events-only runner: four race attempts
with the plugin disabled and four with reactivated RC18 all match the original
message and full stack. Each condition also has one HTTP-200-settled control
without the error: 10/10 completed flows, 8/8 exact positives, 2/2 clean controls.
Every disabled row records zero candidate scripts and HTTP requests.

A fresh native RC18 Widgets functional run passes caption edit/restore,
Update/reopen, adding a fourth independently configured widget, persisted width,
public rendering and ticking, and delete/Undo/Redo/final Update. The original three clock
attribute sets are unchanged. All observed package responses match the frozen
manifest. It records zero pageerrors and zero warning/error console messages.
The runner deliberately blocks off-origin traffic: eight failed Gravatar
requests remain visible, so its literal `strictDiagnosticsClean` field is false.
This functional run is separate from the unrouted diagnostic reproductions.

## Source attribution and limits

The exact installed Core sources bind the 200 ms debounce, native input handler,
encode call and catch path. The installed Playwright `WKPage._onConsoleMessage`
implementation binds the console-to-pageerror conversion. Local source hashes
and bounded excerpts are in `LOCAL-SOURCE-CHAIN.json`; binary hashes and the
official browser-manifest comparison are in `BROWSER-IDENTITY.json`.

The pinned [Playwright WebKit build configuration](https://raw.githubusercontent.com/microsoft/playwright/v1.62.1/browser_patches/webkit/UPSTREAM_CONFIG.sh)
identifies WebKit base revision `343e13bf22dca9d0ec227801419aab0f9001a32f`.
Its [CachedResource lifecycle guard](https://github.com/WebKit/WebKit/blob/343e13bf22dca9d0ec227801419aab0f9001a32f/Source/WebCore/loader/cache/CachedResource.cpp)
rejects non-keepalive requests during provisional/stopping document loading;
[CachedResourceLoader](https://github.com/WebKit/WebKit/blob/343e13bf22dca9d0ec227801419aab0f9001a32f/Source/WebCore/loader/cache/CachedResourceLoader.cpp)
can classify this synchronous failure as access control;
[ThreadableLoader](https://github.com/WebKit/WebKit/blob/343e13bf22dca9d0ec227801419aab0f9001a32f/Source/WebCore/loader/ThreadableLoader.cpp)
emits the observed JavaScript console message. This C++ branch attribution is
an inference supported by pinned source and the paired runtime evidence,
not a debugger trace of the native branch.

The exact error class is **plugin-independent Core/WebKit navigation behavior**,
also reproduced under RC16. It is not a demonstrated RC18 regression, runtime
failure or server CORS configuration error. The individual historical event
lacks timestamps: its exact trigger and timing cannot be reconstructed. The
earlier correlation with a pending request and later server HTTP 200 did not
prove which invocation failed. Earlier controls waited for an emitted request
before navigation and therefore missed the deferred-call ordering found here.

The initial plain fixture leaves old widget instances unassigned. Core's first
REST read moves those instances into `wp_inactive_widgets`; an intentionally
strict sidebar byte-equality assertion failed and remains in the raw evidence.
Eight ordered content tables, Text/HTML settings and exact plugin files remain
unchanged. Active plain-widget placement is unchanged. The three temporary
fixture options are restored explicitly; no whole-database restore is used.

## Disposition

The matching disabled reproduction closes the **unattributed encode blocker**;
no owner waiver or error suppression is used. It does not turn failing race
diagnostics into clean observations. A literal zero-diagnostics criterion still
reads **NOT CLEAN**, because inherited navigation diagnostics remain observable.

No product or runtime fix is justified by this evidence. The appropriate
functional-test boundary is to wait for native deferred form work and saves
before navigating or closing the context, while keeping the immediate-navigation
stress case separately visible. This investigation does not change tracked tests.

The previous 42-gate exact-artifact functional matrix remains preserved evidence;
this focused investigation does not rerun or expand that matrix. An exact
committed PR HEAD still requires hosted `Repository checks` and `Browser tests`.
CDN delivery verification and WordPress.org publication remain separate gates.
No commit, push, merge, Cloudflare upload/deployment/settings change or
WordPress.org publication was performed. Non-production builds remain untouched.

Final preservation rehashes 582 protected files and 1,996 prior inventory entries
with zero mismatches. All 20 source/archive/manifest files still agree. Both
owned sites retain active exact RC18; the temporary widget options and original
theme are restored, the added passive server observer is removed, and owned
services are stopped. Containers, databases and backups remain available.
The native save test's temporary `widget_block` bookkeeping is restored only
after its actual persisted/public observations; restoration is not used as save
success evidence. No whole-database restore is performed.

Evidence root: `.local/rc18-encode-investigation-20261114/`.
Independent evidence: `.local/rc18-encode-independent-20261114/`.
Machine receipt: [encode-diagnostic-rc18.json](encode-diagnostic-rc18.json).
