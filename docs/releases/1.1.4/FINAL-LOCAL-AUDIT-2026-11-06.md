# Final local verification — 6 November 2026

Result: **PASS within the documented render-event compatibility boundary**.
No confirmed blocking plugin-code defect was found. Publication remains deferred.
This combines an independent source/lifecycle review, independent release-evidence
review, local CI execution, fresh native WordPress regression and public CDN smoke.
It is not a claim that hosted PR checks or a separate full independent native
release-acceptance workflow have run.

## Exact candidate

WordPress **1.1.4 render-r9**, shared widget **0.8.1**:

- ZIP: `.local/packages/simple-digital-clock-1.1.4-render-r9-candidate.zip`.
- SHA-256: `5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
- 66,815 bytes / 16 regular files; [manifest](manifest.json).
- Working tree based on `1a60f9fe1bed3afa56f45bdac5c485a1ec4e7b06`.
- No installable source, ZIP, versioned bundle, dependency, workflow, branch or
  commit was changed during this audit. Previously accepted archives remain exact.
- The [machine receipt](final-local-audit-2026-11-06.json) binds evidence hashes
  and distinguishes the initial CI snapshot from subsequent documentation edits.

## Verification results

| Area | Result and scope |
| --- | --- |
| Artifact and prior evidence | 41 independent identity/provenance checks pass; exact archive, source, manifest and prior receipts agree |
| Independent code review | No confirmed defect within scope; 8 extracted-ZIP focused tests and 13 additional Core lifecycle cases pass |
| Local CI | 21 steps / 229 tests pass: 24 Python, 75 Node, 111 browser-unit, 19 browser-integration; Chromium, Firefox, WebKit |
| Reproducible widget build | Fresh temporary production build matches all 36,009 immutable 0.8.1 bytes |
| Dependency audit | Fresh lockfile audit passes the moderate threshold: 5 dev-only low records, 0 moderate/high/critical |
| Native upgrade/save cycle | 6 file transitions, 108 real editor saves and 756 direct strict-JSON block checks pass |
| Frontend resources | 244 browser cases pass: 184 block-theme plus 60 classic-theme cases |
| Admin/editor | 4 reference/browser pairs pass, including empty-editor first insert, iframe CSS and save/reopen |
| Plugin Check 2.1.0 | 29 static + 5 actual runtime checks; zero errors and warnings |
| Public CDN/site | HTTP 200, exact 0.8.1 SHA, correct asset references/cache policy; Chromium smoke passes for all 11 clocks |
| Documentation corrections | Three P2 status/provenance issues and one P3 scope wording issue resolved; 16 independent readback checks pass |

Native references are WordPress **6.3.14 / PHP 7.0.33** and WordPress
**7.1.4 / PHP 8.3.35**, not assertions about the newest available versions. The
cycle is public 1.1.2 -> render-r9 -> immutable editable reserve 1.1.2.1 -> render-r9.
The reserve is not a required intermediate upgrade. Complete post-row and selected
critical-option hashes stay unchanged around file transitions; installed files
match the relevant exact archive. No database restoration masks data changes.

The fresh resource matrix has 46 block-theme fixtures per reference/browser,
including a new first-clock-at-footer-priority-19 case. Classic Twenty Twenty-One
covers 15 lifecycle scenarios per pair. Both Chromium and WebKit verify actual
network requests/tags, ticking clocks and layout. The 4 new priority-19 cases
supplement the previous 240-case matrix. Core's late-style printing handles the
same-priority enqueue correctly. Independent lifecycle tests also cover footer
20 before/after Core, repeated footers, inline before/after data and loader filters.
Those additional API tests use host PHP 8.5 with real Core hook/dependency code and
explicit environment doubles; the full PHP 7.0/8.3 evidence is separate.

The original public 1.1.2 writer still reproduces its known Core 6.3 negative
control; that old artifact is unchanged. Upgrade/read compatibility is preserved,
but no update can reconstruct data already erased by an earlier faulty save.

Local CI uses an isolated 409-file source snapshot, Linux ARM64, Node 24.18.1 and
read-only cached dependencies whose 738 installed package versions match the
lockfile. Patch/security tests rerun successfully. Fresh `npm ci`, browser download
and hosted GitHub-required jobs were not rerun. The five low audit records refer
to the development-only deepmerge advisory chain; the local patch's security
checks pass, while the upstream audit records remain visible.

## Corrections made during this audit

1. Root README incorrectly attributed independent GO to the current r9 archive.
   It now points to local regression evidence and actual acceptance status.
2. The lab README likewise mixed r8 independent acceptance with r9's file count.
   The histories and verdicts are now explicit.
3. Root README called the 31 October preparation report current. Its link is now
   historical, and that report has a dated banner explaining the old manifest
   link and archive-verifier example. All original report content, hashes and
   commands remain byte-for-byte below the banner.
4. The asset contract said unused pages register no plugin resources. It now
   correctly distinguishes lazy runtime/layout registration from the existing
   editor-script handle registered on init, which causes no frontend request.

These are documentation-only corrections. Before/after hashes and independent
readback are preserved. A link to this final report was subsequently added to the
candidate README. Public prose, release metadata and whitespace checks pass after
those changes. Old evidence retains its original documentation-source hashes;
new documentation hashes are not silently substituted into historical receipts.

## Runtime boundary

No plugin-owned global HTML analysis or PHP output buffer remains. The named owned
block render event queues one runtime and one inline layout rule per document.
Pages without that render or explicit integration receive neither resource. The
plugin still performs normal WordPress bootstrap/block registration.

Saved 1.1.2 clock blocks, nested blocks, synced patterns and block widget areas are
supported automatically. Arbitrary raw HTML, Custom HTML/Text widgets, cached
fragments and third-party renderers need explicit `SDCW_enqueue_scripts()` when
they output clocks. A later filter can delete a rendered clock after its assets
have entered the queue. Both boundaries are deliberate, documented and tested;
this does not claim the former global final-response discovery guarantee.

## Public delivery and installed-preview state

Read-only production checks confirm the existing shared widget delivery:

- URL: `https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.1.min.js`.
- SHA-256: `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- Asset cache: `public, max-age=31536000, immutable`; metadata/page revalidate.
- `/version.json` reports 0.8.1 and the same artifact identity. Gzip measurement
  metadata identifies its encoder separately from the invariant JS bytes.
- Public Chromium smoke observes exactly one runtime request, 11 rendered/ticking
  clocks, stable sampled dimensions after fonts load, and zero JS/console/network
  failures. This is a smoke test, not a Core Web Vitals or universal font claim.
- The public page reports source commit `526e3a842d009fa2cf4b0f29d5770d25304220aa`.
  No fresh Cloudflare deployment identifier is established by this audit.
- Official WordPress SVN trunk still declares `Stable tag: 1.1.2`; no upload or
  publication was performed.

Read-only installed-file hashes confirm the owner's open `127.0.0.1:55900` site
still has exact **streaming-r8**, not render-r9. It was not updated. The current
candidate was tested only in the new disposable local project.

## Repository and remaining release gates

The working tree is deliberately still dirty: render-r9 changes and new manifest,
report and historical-manifest files have not been committed. In particular,
`manifest-streaming-r8.json` must be included with the rollback test's new pointer.
No branch cleanup, merge, history rewrite, push or deletion occurred.

Before a separately authorized public WordPress release:

- Commit the complete reviewed candidate and its supporting files.
- Obtain the required `Repository checks` and `Browser tests` results on the final
  PR/head; local execution does not satisfy branch protection.
- Close the separately tracked full independent native ZIP acceptance gate. The
  independent source/lifecycle review here is complete within its stated scope.
- Follow the exact artifact publication/update-offer workflow once authorized.

The shared widget bytes did not change, and their existing CDN delivery is now
verified; another widget/CDN release is not required solely for this PHP wrapper
revision. New r9 TTFB/PHP-memory benchmarks were not run; old r8 measurements do not
transfer. Native Safari/LocalWP, multisite and arbitrary third-party optimizers
remain outside this verification matrix.

## Local evidence and operational closure

- `.local/final-audit-20261106/code-review/`: independent exact-ZIP source review
  and lifecycle outputs.
- `.local/final-audit-20261106/ci/`: isolated snapshot, full local CI logs, fresh
  npm audit and public CDN browser evidence.
- `.local/final-audit-20261106/release-review/`: initial findings, hash/provenance
  checks, HTTP observations and correction readback.
- `.local/final-audit-20261106/root/`: initial state, documentation changes,
  orchestration scripts, strict JSON observations and owner-preview readback.
- `.local/wordpress-repro/final-r9-20261106-b/`: new databases, raw native logs,
  transitions, Plugin Check, browser results and stop receipts.

The first bootstrap (`final-r9-20261106-a`) stopped before container creation
because the helper's fixed Docker subnet range was exhausted. Its evidence is
retained. A local audit adapter selected a non-overlapping subnet from an
additional range after inspecting every existing Docker subnet. Existing networks,
containers and data were preserved. This is an environment workaround, not a
change to the installable plugin or the repository's default allocator.

The successful test project is stopped, original test themes are restored and
all lab data retained. Final installed source and archive hashes remain exact.
The owner's open site and unrelated projects were not changed.
