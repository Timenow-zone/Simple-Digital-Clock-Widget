# WordPress 1.1.6 RC3 candidate

Date: 2026-11-12, Europe/Kyiv. Status: **FROZEN; NO-GO — STANDALONE-P2-01 OPEN**.
The [standalone review](../0.8.2/STANDALONE-COMPATIBILITY-REVIEW.md) found that the
shared runtime can suppress healthy initial clocks after another clock's render
error. Earlier passing acceptance results remain true within their recorded
scopes, but do not close this blocker. Frozen reports, manifests and package
bytes are preserved. Production CDN delivery and WordPress publication are
blocked for this candidate.
The owner explicitly approved eager compatibility loading for opaque runtime
overrides. Default bundled pages retain zero main-runtime requests without use.
That approval remains valid. WordPress.org publication also requires a separate
owner command.

## Exact identity and delta

- Archive: `.local/packages/simple-digital-clock-1.1.6-rc3.zip`.
- SHA-256: `eb85f4f0d526b32288a1180a14241150eb3a3ebd250c6fe95b6e19bf9b3785c4`.
- Size/layout: 72,320 bytes; 17 regular files under `simple-digital-clock/`.
- Frozen manifest: [manifest-rc3.json](manifest-rc3.json).
- Source commit: `2c9f8aacabe2b5b3b69bb224dcff32e63c3a851b`.
- Widget 0.8.2 unchanged: 36,033 bytes, SHA-256
  `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506`.

Exactly three package files differ from frozen RC2: the external bootstrap,
assets PHP and readme. The remaining 14 files, including the main runtime,
block/editor script, KSES code, translations and notices, are byte-identical.
The readme identifies the new exact source and describes the override cost.
Original RC1/RC2 ZIPs, manifests and evidence remain unchanged.

## Final review remediation

RC2 fails when the sole configured Core runtime is immutable 0.8.1 but no script
tag has executed yet: its shell occupies the old runtime's element name. RC3
classifies the final Core-generated main source before defining that shell.
The default bundled source keeps lazy delivery. An opaque override loads eagerly
without a shell, preserving its original registration. Invalid consent formats,
nonce refusal and SRI failure remain explicit errors without policy bypass.

The [approved policy](OVERRIDE-POLICY.md) deliberately counts opaque CDN/query
rewrites separately: their runtime may load on empty pages. This cost is not
hidden inside the default zero-runtime gate. The original signal-free
`whenDefined()` and shadow-root fixtures retain their unchanged bodies.

## Verification boundaries

Prepared source passed 96 Linux loader runner tests, 167 PHP assertions with
real minimum/current Core tokenizers, and independent 84-case actual-Core/browser
override checks. Default/attribute-only empty pages request no runtime; opaque
override empty pages request one, and all positive clocks render without errors.
The exact new ZIP completed affected package, native delivery, editor, data,
cache and network checks. See the [final acceptance snapshot](FINAL-ACCEPTANCE-RC3.md)
and [42-gate index](acceptance-rc3.json). Inherited exact-RC2 results are explicitly
scoped to the 14 unchanged files and never counted as fresh RC3 executions.
All owned labs are stopped and evidence preserved. Final required hosted checks
remain tied to the latest PR HEAD. Production CDN delivery and WordPress.org
publication have not occurred; the latter still needs its separate owner command.
