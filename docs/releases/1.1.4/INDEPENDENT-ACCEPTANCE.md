> Preserved independent reviewer report for the exact ZIP and commit below. The report body is unchanged. Original raw evidence is retained under ignored `.local/independent-acceptance-1.1.4-r3/20261030T194336Z/` in the original development checkout; named raw files refer to that directory. The [machine-readable result](independent-evidence.json) preserves the reviewer's decision and known failures. A subsequent test-only PHP 7 comparison correction is recorded in the current [release report](README.md); it changes no installable file or archive byte.

# Independent exact-candidate acceptance: GO with explicit boundaries

## Frozen identity and scope

- Source commit: `369f6bde90591e40ac8f59544297a2bae3e6a91f`.
- PR: https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/13 (open draft, unmerged at verification).
- Archive: `simple-digital-clock-1.1.4-compatibility-r2-candidate.zip`, 65,374 bytes, 16 installable files.
- SHA-256: `d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`.
- Plugin 1.1.4; declared minimum WordPress 6.3 / PHP 7.0.

GO applies to the new candidate's behavior and exact package, within the data boundaries below. Every mandatory section was executed on fresh isolated environments. The run includes retained expected predecessor failures and a unit-harness failure; it is not an all-green test run. Editing through the old 1.1.2 writer on Core 6.3 remains unsafe. No merge or publication is authorized or performed.

The reviewer wrote no source patch, source commit or competing ZIP. The clean review branch was fast-forwarded to the frozen commit. Only harness source was reused: databases, outputs, downloads and results are fresh. Author tests and CI were not substituted for independent acceptance. Earlier `fedc...ed00` and `9e...8c1` archives and NO-GO evidence remain unchanged.

## Correction reviewed

Caption again uses JSON-backed attributes and the public 1.1.2 static save markup. PHP narrowly recovers the malformed terminal-backslash closing quote emitted by Core 6.3 before native JSON KSES. Recovery requires a unique top-level caption span, exact legacy caption-token preimage, matching normalized HTML and at most 32 candidate boundaries. Valid, ambiguous, mismatched and foreign structures are retained. The clock-only safe encoder preserves metadata rewrite values. Existing native KSES, permissions, nonces and scoped frame handling remain authoritative.

The editor's HTML fallback recovers known settings when old metadata is absent. Valid JSON remains authoritative, including literal captions. This fallback cannot reconstruct data already erased by an old writer.

## Exact package, licenses and published-widget identity

`preflight.json` independently compares all 16 files to Git and the manifest, verifies the exact archive digest, CRC, root, safe paths, duplicates, hidden entries and symlink exclusion. All pass. `final-state.json` confirms all 16 exact files, activation and requirements on four supported installations after the complete cycle.

Complete upstream MIT notices for Preact 11.1.0, preact-custom-element 4.6.0 and clsx 2.1.1 were fetched independently and matched in THIRD-PARTY-NOTICES. GPL bytes are unchanged (`license-audit.json`). Pinned README current widget statements use 0.8.1 while historical 1.1.3 correctly keeps its 0.7.1 bundle (`readme-audit.json`).

Published source, lockfile, widget bundles and delivery assets remain unchanged (`published-source-identity.json`, 27 files). Bundled widget 0.8.1 is 36,009 bytes, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`. An isolated build from source commit `b44f944b60babf45bf266e73ba12f7eba53cfef2` reproduces those exact bytes (`build-repro.json`). It uses existing matching-lock dependencies; required CI separately performs npm ci.

Read-only public verification returns HTTP 200 for that same CDN digest, with `public, max-age=31536000, immutable`; version.json still identifies 0.8.1. Public WordPress 1.1.4 ZIP returns 404, directory API identifies predecessor 1.1.2 and SVN has no new tag (`external-final.json`, fresh downloads). No delivery or external write occurred.

## Real environments and requirement gates

Official fresh API/archive downloads identify WordPress 6.3.14, current stable 7.1.4, below-minimum 6.2.15, public plugin 1.1.2 and Plugin Check 2.1.0. Bootstrap confirms actual PHP 7.0.33 on minimum sites and 8.3.35 on current sites; the current container's base image tag does not substitute for its installed Core version.

Both clean installations and activation pass. Actual WP 6.2.15 refuses ZIP installation/activation on requirements. PHP 5.6 refusal is a clearly labeled function-level simulation on actual PHP 8.3, not an actual PHP 5.6 runtime test. Minimum/current snapshots, raw commands and exit codes are retained in logs.

## Caption, roles and security

Fresh native Gutenberg save/reopen checks pass exactly for:

- 21 vectors × three roles × two clean environments: 126 observations.
- Four additional separator/escape vectors × the same six contexts: 24 observations, including actual U+2028/U+2029 and literal backslash-u sequences with terminal backslashes.
- The 21 vectors on both upgraded sites: another 126 observations.

All 276 candidate observations preserve the exact editable caption, every nondefault setting and validity. Cases include 1/2/3 terminal slashes, mixed quotes/entities/HTML-like text, layered and invalid numeric references, literal Unicode escapes, multilingual/long/empty captions, className after Caption and lock metadata. Typed values and native store values are recorded before saving. A single-line TextControl LF normalization was diagnosed in a failed public control before saving; no candidate assertion was relaxed. See HARNESS-ATTEMPTS.md and distinct public control reports.

Existing public-predecessor posts/pages, nested blocks and unrelated HTML were saved through real Gutenberg by Administrator, Editor and Author after update and again after reupdate, separately in Chromium 151.0.7922.34, WebKit 26.5 and actual Linux Firefox 153.0. Ten post/page records and 240 clock observations per engine/stage were inspected. All originally valid blocks preserve semantics; explicit settings edits change only intended width/caption values (`role-save-analysis.json`). There are no new semantic failures or page errors. Valid old literal-entity captions survive title-only saves exactly, closing the previous independent regression.

Each environment passes 538 real restricted KSES/security assertions: all three post fields, all roles forced without unfiltered_html, repeated storage, actual block-widget filters, stricter callbacks, XSS/CSS/event rejection, unrelated sanitizer parity and balanced frames. An independent actual-Core recovery suite passes 10 cases per environment, including native malformed tokens, unknown numeric/exponent metadata, duplicate/nested/mismatched rejection and the 32-boundary limit. AJAX invalid nonces, anonymous denial, role settings permissions and direct PHP access behave as expected.

Unknown metadata is additionally compared with native foreign-block persistence. Mixed numeric/associative objects retain structure. For restricted Author, a numeric-key-only object becomes an array identically under native KSES in both versions. Values follow native policy; this acceptance makes no universal unknown-type preservation claim after Core filtering.

## Update, rollback and reupdate on unchanged databases

Two independent sites begin with independently downloaded public 1.1.2 (SHA-256 `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`). Both update to the exact d112 ZIP through a real Core bulk updater offer. Both physically roll back to the exact public archive, then reupdate through Core. All six file transitions retain all post rows and critical options byte-for-byte; installed files, active state, version and requirements match each phase. No database restore, fixture reset or reseed is used to obtain PASS.

The old reader reads all 126 newly saved candidate vectors exactly and validly in each of the three engines (378 reader observations). Old post/page views, controls and active/inactive widgets also pass read checks. The public writer is then exercised for all roles on the same new records. Its inherited minimum-Core defect reappears: eight vectors per role become invalid, some original caption values and lock metadata disappear. The current-Core writer preserves these candidate records.

After reupdate, all available known HTML clock settings are recovered. Subsequent new-candidate saves preserve all currently available values. Original literal captions and Advanced lock values erased by the old writer are not claimed recovered. One already-damaged minimum-Core Author block with numeric references remains invalid because its literal entity layer was erased/altered by 1.1.2; no new attribute change occurs on its candidate save. Its strict collector remains exit 1 (`caption-transition-reupdated-recovery-chromium.json`), and `old-writer-boundary.json` classifies the exact source of failure. No tolerance, assertion or damaged record was changed to make it pass.

This is an explicit rollback-writing limitation. File rollback and old reading pass. The full old writer and automatic restoration of irreversible old corruption do not receive PASS. Fresh candidate saves and previously valid data are separately strict.

## Widgets, consumers and runtime

Native active and inactive block widgets save/reopen successfully on both versions in all three engines after update and reupdate. Unrelated Text widget data stays unchanged. Editor/Author widget access is denied as expected. Synced patterns and references, frontend ticking, Auto/Reset first-click behavior, custom HTML and shortcode/legacy consumers pass. Actual browser-loaded asset digests match the immutable bundled widget.

All engines pass the delayed local Fira Code load with failed Google stylesheet, automatic font refit, stress metrics, iframe context, 0/80/200/320 widths, parent resize, hidden/reveal and locale change. Candidate WebKit Amharic remains one line; old 0.8.0 produces two lines. Old font controls reproduce their errors in each engine, demonstrating sensitivity. These RED results remain distinct from candidate PASS. Successful external Google stylesheet transport and native Safari/VoiceOver are outside the demonstrated scope.

Native Intl comparison covers 312 checks over all three engines and both environments, frozen instants, locales/timezones and formats. Dynamic ticking is checked separately. No unexpected candidate runtime exceptions occur; deliberately aborted font-request diagnostics are retained.

## Plugin Check, syntax and unit-harness boundary

Fresh official Plugin Check 2.1.0 runs 29 static and all five individually selected runtime checks with raw output retained: zero errors, 10 warnings. Eight fixed-message error_log diagnostics preserve original data or reject unsafe recovery; one depth-12 argument-free debug_backtrace identifies owned KSES calls; one existing global frontend-script warning follows immutable legacy/dynamic loading behavior. All are explicitly reviewed as nonblocking in plugin-check-review.json. Prior warning counts were not reused.

Every PHP file passes syntax checks on actual PHP 7.0 and 8.3; every packaged JS file passes node --check. The unmodified author unit suite passes 7/7 on PHP 8.3. On PHP 7 it passes 6/7: the last test reports nine false object-equality assertions out of 48 subassertions because a constructed object with numeric keys compares differently from a JSON-decoded object in PHP 7. Independent diagnostic JSON before/after is identical, and actual-Core recovery/unknown persistence tests pass. The original unit failure and diagnostic are retained. A test-only comparison correction is recommended separately; no candidate or test source was edited by the reviewer.

Read-only GitHub verification confirms required Repository checks and Browser tests succeeded for frozen 369f6bd, run 41118373200. CI complements these independent results. PHP debug-log audit finds no fatal, parse or warning lines. Expected safety diagnostics remain visible.

## Isolation, shutdown and remaining scope

Only project `sdcw-independent-114-r3-194336` used newly created databases and loopback ports; explicit free subnet 10.253.220.0/24 was selected after network inventory. No foreign service was changed. All eight owned containers are stopped, all six owned loopback ports are closed and all containers, network, databases, failures and evidence are retained (`teardown.json`). The temporary reviewer-only dependency symlink was removed without deleting its target; source worktree is clean. No publication, merge, tag, deployment or database restoration occurred.

Unverified scope: HTTPS/TLS installation, multisite, native Safari/VoiceOver, successful Google stylesheet transport, production-installed WordPress sites and an actual PHP 5.6 runtime. Candidate publication remains intentionally pending. The known predecessor writer and unit-harness failures above remain explicit limitations, not new candidate blockers.
