# WordPress 1.1.4: render-r9 local candidate

Status: **independent local acceptance GO; all 13 mandatory gates PASS; unpublished**.
The [6 November acceptance report](INDEPENDENT-ACCEPTANCE-RENDER-R9-2026-11-06.md)
and [machine-readable record](independent-render-r9-20261106.json) bind fresh results
to this exact archive. No verdict is transferred from earlier archives.

- ZIP: `.local/packages/simple-digital-clock-1.1.4-render-r9-candidate.zip`.
- SHA-256: `5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
- 66,815 bytes / 16 installable files; [manifest](manifest.json).
- Accepted installable source: commit `cc08df6a7e6fc99b777278aa2578700316e5f6a9`.
- WordPress 6.3 / PHP 7.0 minima; shared widget 0.8.1 unchanged.

The global PHP output handler and incremental HTML lexer are removed. Resources
are registered and enqueued when Core renders the owned clock block; stable Core
handles give one runtime and one inline rule per document. No external stylesheet
is added. Saved block format, reader/writer fixes and runtime bytes are unchanged.
See the [asset contract](../../WORDPRESS-ASSET-CONTRACT.md) for the explicit
raw-HTML integration requirement and post-render suppression boundary.

The [historical r8 report](README-STREAMING-R8.md),
[manifest](manifest-streaming-r8.json), [acceptance](acceptance-streaming-r8.json)
and exact accepted ZIP remain preserved. Restore that archive for a file rollback;
it also restores its global HTML observer. No database migration is introduced.
The separate 1.1.2.1 reserve remains unchanged and is not a required update step.

The earlier [regression report](REGRESSION-RENDER-R9.md) records 240 frontend browser cases,
four final admin/editor pairs, six native file transitions, 108 real saves and
756 strict JSON block checks. Plugin Check ran 29 static plus five runtime
checks with zero findings. [Machine-readable evidence](render-r9-evidence.json)
binds those historical results to the exact ZIP. The new independent acceptance
adds two clean installs, both rollback cycles, 108 real saves, 756 strict JSON
checks, 270 full-contract browser cases, 60 classic-theme cases, 36 lifecycle cases,
four admin/editor pairs and 229 fresh local CI tests. Plugin Check again reports
zero findings across all 29 static and five runtime checks. New performance
benchmarks have not run for render-r9.
The accepted source was pushed to [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18)
on 7 November. Both [hosted required checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/42349694349)
passed for `cc08df6`. Later documentation heads are checked separately in that PR.
Merge, WordPress.org publication and owner-site installation remain deferred.

The earlier [6 November final local verification](FINAL-LOCAL-AUDIT-2026-11-06.md) records
independent source/lifecycle review, fresh native regression, local CI and public
CDN smoke for the same exact ZIP. Its then-pending independent native acceptance
is now closed by the separate report above; its historical findings are preserved.
The [7 November synchronization review](../../maintenance/repository-sync-2026-11-07.md)
records the newer hosted-check result, current documentation and examples, and
remaining inherited translation gaps. The frozen 6 November acceptance records
retain their then-current no-push scope; that historical scope does not describe
the subsequently authorized PR. Merge and publication remain separate gates.
The prior [local-regression status](acceptance-render-r9-local-regression.json)
is preserved alongside the current [acceptance status](acceptance-evidence.json).
