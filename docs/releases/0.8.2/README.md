# Widget 0.8.2 release preparation

Status: **BUILT AND REGRESSION-TESTED; PRODUCTION CDN DELIVERY PENDING**.
This shared runtime supports the separate WordPress 1.1.6 remediation. Neither
this record nor the WordPress ZIP proves public CDN delivery.

- Source commit: `d3fcef80c8921d1d7ef72c69dc8fad66a499ab8f`.
- Artifact: `dist/0.8.2.min.js`, 36,033 bytes.
- SHA-256: `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506`.
- Gzip: 12,471 bytes at level 9, Node v26.8.2 / zlib 1.2.12; other encoders differ.
- Target public URL: `https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.2.min.js` (pending delivery).
- Previous production artifact: 0.8.1, SHA-256
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

## Behavior

A lightweight custom-element host can register independently of Preact and the
clock renderer. WordPress's external bootstrap uses connected callbacks to load
that renderer, preserving first-clock `whenDefined()` and closed-shadow
integrations without document polling. The normal standalone bundle installs
the renderer during the same evaluation as registration. Existing rendering,
formatting, font fitting, sizing and timer code is unchanged. The adapter retains
preact-custom-element's context, slots, hydration and property reflection with
its MIT attribution.

On lazy WordPress pages, `whenDefined()` confirms constructor registration; it
does not promise synchronous rendering before the runtime download. Acceptance
uses rendered shadow content and ticking. The WordPress package includes the
exact artifact above, with no CDN dependency for its runtime.

## Verification and delivery gates

Production build with `--no-cache`, isolated exact-byte reproduction,
`release:check`, `release:verify` and generated `site:build` asset parity passed.
All eight prior versioned artifacts remain unchanged. The first stale-cache build
was rejected and retained; see [RC2 preparation](../1.1.6/RC2.md).

Linux Chromium/Firefox/WebKit passed 129 WTR runner tests, including six new
lifecycle/parity cases per engine; 19 iframe/font/serialization/product-site
runner tests also passed. The external WordPress loader passed 87 runner tests.
Fresh exact-ZIP, native, cache and multisite acceptance is tracked separately in
[WordPress 1.1.6](../1.1.6/README.md).

Before production delivery, preserve the actual current deployment reference,
require successful checks on the final reviewed PR HEAD, and use the configured
Cloudflare workflow. Verify public HTTP 200, exact SHA, `/version.json`, asset
references, immutable cache headers and a public-asset clock smoke. Record the
deployment reference and source commit. Restore the previous deployment if a
gate fails, preserving immutable artifact bytes. WordPress.org publication
still requires a separate explicit owner command.
