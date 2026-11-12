# WordPress 1.1.6 RC2 candidate

Date: 2026-11-12, Europe/Kyiv. Status: **FROZEN; INDEPENDENT ACCEPTANCE IN PROGRESS**.
WordPress.org publication requires a separate owner command. Shared 0.8.2 CDN
delivery remains pending; no deployment is claimed by the local build.

## Exact identity

- Archive: `.local/packages/simple-digital-clock-1.1.6-rc2.zip`.
- SHA-256: `ea40d77665d21530d1671d10abf9d78308933ac81d01f758156f7d16768ce384`.
- Size/layout: 71,930 bytes; 17 regular files under `simple-digital-clock/`.
- Immutable candidate manifest: [manifest-rc2.json](manifest-rc2.json).
- Shared source commit: `d3fcef80c8921d1d7ef72c69dc8fad66a499ab8f`.
- Widget 0.8.2 SHA-256: `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506`.
- External bootstrap: 5,257 bytes, SHA-256
  `46079bb8522afe2f820f48c1135f90afd55059a1d8db495f470933e9323fa1bb`.

The WordPress version stays 1.1.6. RC2 is an artifact revision. Published widget
0.8.1 and the rejected RC1 archive/evidence remain unchanged. The original RC1
manifest was copied verbatim to [manifest-rc1.json](manifest-rc1.json) before the
canonical manifest pointer moved.

## Changes and development verification

Native render/use signals and the explicit helper request the runtime through
Core. Editor content and native legacy-widget preview iframes each load their
own runtime. External-only CSP no longer depends on inline bootstrap execution.
The new lightweight host preserves first-after-`whenDefined()` and shadow-first
integrations without candidate-only enqueue changes. Existing pending and late
parser-emitted runtime owners, including immutable 0.8.1, are retained. No block
schema, stored content format, KSES behavior or database migration changed.

The source implementation was reviewed separately; three newly discovered edges
(noscript tokenization, pending legacy owner, trailing legacy owner) were fixed
and their reproductions retained. Development checks include 129 WTR tests,
87 loader tests in Linux Chromium/Firefox/WebKit, 19 iframe/font/serialization/
product-site tests, 43 PHP/i18n/serialization tests, 22 Node tests and 19 release
metadata tests. These are runner counts, not independent installed-site cases.

A separate development lab restored all 12 native legacy preview combinations
and passed 104 actual-Core asset lifecycle assertions. Native Site Editor and
Post Editor workflows have their own receipts. These results explain why RC2
was frozen; they do not replace independent acceptance of its exact ZIP.

The first production build reused stale Parcel cache and emitted old 0.8.1 bytes
under the unpublished 0.8.2 name. Exact-byte comparison rejected it. The rejected
output is retained under `.local/remediation-116-rc2/rejected-stale-production-build/`.
Release builds now use `--no-cache`; the new production build and isolated
reproduction agree with the 0.8.2 hash above. No published versioned bytes changed.

Development evidence is under `.local/remediation-116-rc2/` and
`.local/candidate-116-development-20261112-b/`. Final matrix receipts, required
hosted checks and production CDN verification must still be attached before
claiming readiness. Any changed package byte requires a new candidate revision.
