# Widget 0.8.3 compatibility correction

Status: **NO-GO: FIREFOX RIGHT/CENTER ALIGNMENT; NOT PUBLISHED**.
The later [single/multiple-instance review](MULTI-INSTANCE-REVIEW.md) demonstrates
a pre-existing CSS omission. It blocks full cross-browser acceptance while
preserving the earlier successful initial-error-isolation evidence.
This candidate fixes `STANDALONE-P2-01`, the shared lifecycle regression recorded
in the [rejected 0.8.2 review](../0.8.2/STANDALONE-COMPATIBILITY-REVIEW.md).
It also supplies the exact runtime bundled in [WordPress 1.1.6 RC4](../1.1.6/RC4.md).

## Exact identity

- Executable source: `85b0943789e174dea84ea0993eb5777e98138213`.
- Runtime: `dist/0.8.3.min.js`, 36,245 bytes.
- SHA-256: `c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b`.
- Gzip: 12,516 bytes, level 9, Node v26.8.2 / zlib 1.2.12.
- WordPress bootstrap: 5,614 bytes; SHA-256
  `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.
- Target production URL:
  `https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.3.min.js`.
  Delivery is pending; this is not a verified public asset URL.

## Corrected behavior

Each initially pending custom element is removed from the queue before its
connection is attempted. A mount error is reported through the browser's error
channel without aborting independent hosts. A live queue preserves removal and
reinsertion behavior without mounting an already reconnected host twice.

Renderer readiness completes after the initial queue is processed, including
when every initial host has invalid settings. Invalid adapter shapes are rejected
before state mutation, and duplicate installation remains an error. The existing
element name, 17 attributes, clock component, styling, formatting and dependencies
are preserved. WordPress's generated bootstrap is rebuilt because it embeds the
same registration code; both PHP version references select 0.8.3.

## Acceptance and release boundary

The [mandatory compatibility gate](../../WORDPRESS-ASSET-CONTRACT.md#mandatory-main-script-compatibility-gate)
requires the same artifact in ordinary HTML and installed WordPress with Google
Chrome, Firefox and WebKit. Unit/source tests supplement that matrix. No missing
browser or native WordPress execution may be replaced by a Chromium-only or
mock-loader result.

The [RC4 acceptance report](../1.1.6/FINAL-ACCEPTANCE-RC4.md) records 24/24
standalone cases and 42/42 native runtime rows across actual Chrome, Firefox and
WebKit, plus broader native and independent checks, within the original scope.
The later multi-instance proof adds actual different settings and exposes the
Firefox alignment failure. The earlier snapshot is not current release approval;
historical corpus limits and preserved failed attempts remain explicit.

Independent temporary builds reproduce both JavaScript artifacts exactly.
The versioned runtime, `latest`, bundled WordPress runtime and generated site
asset match byte-for-byte. All nine previous versioned bundles and frozen RC3
evidence remain unchanged. The local evidence root is
`.local/remediation-116-rc4/`; individual reports identify their precise scope.

The 0.8.2/RC3 artifacts remain rejected historical candidates. Their withdrawn
Cloudflare preview must not be promoted. Production still uses the previously
verified 0.8.1 deployment; no production operation was performed for this fix.
Required final PR checks, separately authorized CDN delivery and public
SHA/cache/reference/smoke verification remain release gates. WordPress.org
publication requires its own explicit owner instruction.
