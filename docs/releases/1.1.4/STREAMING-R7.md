# Streaming r7 candidate: author evidence

This local-only candidate replaces response-sized retention with a streaming
observer. It does not remove buffers owned by PHP, Core, a theme or other plugins.
The output callback has a one-byte threshold and immediately returns each write.
Only lexical state and the small Core-generated asset capture survive callbacks.
The lexer has an 8 KiB fast-path analysis window and bounded token-name/suffix
storage. Runtime and editor JavaScript bytes, serialization and database schema
are unchanged. Footer resource generation retains its prior priority and filters.

## Frozen installable identity

- Base commit: `f75c98776b6b1860e916123915bed8084c879153`; uncommitted local changes.
- ZIP: `.local/packages/simple-digital-clock-1.1.4-streaming-r7-candidate.zip`.
- SHA-256: `e42b8ef1580c10a2b8164cb0f2b3dea50d8e29048c000719f51182e53d569e0a`.
- 69,574 bytes; 17 installable files; WordPress 1.1.4 / shared widget 0.8.1.
- Added `includes/simple-digital-clock-output.php`; changed assets integration and
  package readme. Other installable bytes match r6. Prior ZIPs remain preserved.

## Author verification

Fresh lab `streaming-r7-20261102-a` passes six update/physical rollback/re-update
transitions across WP 6.3.14/PHP 7.0.33 and WP 7.1.4/PHP 8.3.35. Complete post rows
and eight selected critical options remain unchanged. Plugin Check 2.1.0 reports
zero findings across 29 static and five actual runtime checks on supported PHP.
Four Chromium/WebKit installation smokes and 160 frontend resource cases pass.
The owned test containers are stopped; the normal owner preview is unchanged.

Focused Node checks pass 12/12; lab safety checks pass 9/9. Lexical tests exercise
every two-chunk split and one-byte delivery for normal/inert/raw-text cases,
SCRIPT double escaping, CLEAN semantics and a 32 MiB streamed attribute with
bounded retained memory. These author checks do not replace independent review.
See [machine evidence](author-streaming-r7-evidence.json) and the
[asset contract](../../WORDPRESS-ASSET-CONTRACT.md) for scope boundaries.

The first performance attempt `perf-streaming-r7-20261102-a` stopped after warmup
because its new validator incorrectly expected legacy CSS on every empty page.
Core/theme conditional loading explains the mismatch. The test expectation was
corrected; all attempted data and the stopped database are retained. No plugin
bytes were changed. A fresh full measurement and independent acceptance follow.

## Remaining gates and compatibility boundaries

Independent preliminary review rejected this exact ZIP: [IND-STREAM-01](INDEPENDENT-STREAMING-R7-PREFLIGHT.md). Full acceptance was not run. The second performance attempt was stopped after the blocker; partial samples are not a completed benchmark.
No prior GO applies to r7. New GitHub checks, native Safari/LocalWP, third-party
cache/optimizer compatibility and public delivery are not inferred from local
Docker/browser results. The historical Core 6.3 / old 1.1.2 writer data-loss
boundary remains: do not edit affected captions through that old writer after
rollback. File rollback cannot restore already damaged stored metadata.

No push, merge, tag change, CDN deployment or WordPress.org publication occurred.
