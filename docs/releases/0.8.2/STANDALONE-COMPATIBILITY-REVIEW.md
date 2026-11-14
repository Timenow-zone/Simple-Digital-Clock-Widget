# Widget 0.8.2 standalone compatibility review

Date: 2026-11-12. Disposition: **NO-GO** for the current widget 0.8.2 artifact
and WordPress 1.1.6 RC3, which contains that same artifact.
Finding: **STANDALONE-P2-01 — initial-host mount failures are not isolated**.

This review supersedes the overall technical acceptance recorded before the
standalone review. Earlier passing results remain valid within their recorded
scope; their frozen reports, manifests and archives are preserved. They did not
cover this failure. The [CDN promotion proposal](CDN-DELIVERY-PLAN.md) is withdrawn.

## What changed and what was preserved

Widget 0.8.2 separates custom-element registration from renderer installation so
WordPress can register a lightweight host and defer the renderer until a clock
is used. The ordinary standalone bundle installs both during the same script
evaluation. This changes shared registration and lifecycle code for HTML embeds,
self-hosted scripts and source imports, as well as WordPress. It is not a
WordPress-only change and adds no WordPress dependency to standalone use.

The public element name and all 17 observed attributes are unchanged. The clock
component's rendering, formatting, sizing, fonts and timer methods, production
dependencies and the inspected style/helper files are unchanged. All eight
previous versioned bundles remain byte-identical to the baseline. Preserving
those files and API names does not establish compatibility of the new runtime.

## Reproduction without WordPress

Serve this HTML with the exact local bundle over HTTP:

```html
<!doctype html>
<meta charset="utf-8">
<timenow-zone-sdcw background-color="invalid-color"></timenow-zone-sdcw>
<timenow-zone-sdcw locale="en-GB" time-zone="UTC" second="true"
  caption="Healthy clock"></timenow-zone-sdcw>
<script src="0.8.2.min.js"></script>
```

Change only the script filename to `0.8.1.min.js` for the baseline. The invalid
color is rejected by both versions. The regression is its effect on the next,
correctly configured clock.

| Linux browser | Healthy clock with 0.8.1 | Healthy clock with 0.8.2 | Healthy clock inserted later |
| --- | --- | --- | --- |
| Chromium 151.0.7922.34 | Renders | Blank after 4 seconds | Renders in both |
| Firefox 153.0 | Renders | Blank after 4 seconds | Renders in both |
| WebKit 26.5 | Renders | Blank after 4 seconds | Renders in both |

All six external-script runs returned HTTP 200 and the browser-captured response
SHA-256 matched the corresponding exact bundle. Both versions emitted the color
error and completed script loading and `whenDefined()`. In 0.8.2, `runtimeReady`
remained false and `whenRuntimeReady` did not resolve in the observation window.
The original healthy host stayed blank even after a later healthy host rendered.

An additional 24 executions cover healthy-only, invalid-first, invalid-last and
invalid-dynamic inputs across both versions and all three engines. Healthy-only
works in both; invalid-last and invalid-dynamic preserve the already healthy
clock. This is a confirmed initial-batch regression, not evidence that every
ordinary standalone embed fails.

## Cause and required correction

At reviewed commit `838086ec39f9d8c19d8297aed80f6911c02ed0e3`,
[`src/clock-element.ts`](../../../src/clock-element.ts), lines 85–96,
`installRuntime()` connects queued hosts in one loop. One `runtime.connect()`
exception exits that loop before subsequent hosts and the readiness assignment.
The `finally` block then clears the entire pending set. The previous adapter
used individual custom-element reactions, whose errors the browser isolated.

A correction must isolate each host's mount error, continue connecting other
hosts and preserve explicit diagnostics. Renderer installation/readiness must
be distinguished from successful rendering of every user configuration. Merely
catching errors while leaving global readiness pending is insufficient because
the WordPress bootstrap waits for readiness.

Add a regression with an invalid first host and a healthy following host to both
source tests and exact production-bundle tests in all three engines. Retain the
healthy, dynamic, attribute/property, removal/reinsertion and standalone loading
controls, then rerun relevant WordPress lazy/override/editor regressions against
the newly built exact artifact. Do not silently replace frozen RC3 or published
versioned bytes. A corrected candidate needs new acceptance and a new delivery
proposal before production promotion.

## Evidence identity and limits

| Input | SHA-256 |
| --- | --- |
| 0.8.1, 36,009 bytes | `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25` |
| 0.8.2, 36,033 bytes | `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506` |
| RC3 ZIP, 72,320 bytes | `eb85f4f0d526b32288a1180a14241150eb3a3ebd250c6fe95b6e19bf9b3785c4` |

Raw evidence remains in the local ignored workspace:

- `.local/standalone-082-review-20261112-code/`: runners, paired HTML fixtures,
  captured source, 24 controls, reports and `EXTERNAL-SCRIPT-UTF8-RESULT.json`.
  The canonical six-run result SHA-256 is
  `d98b9e12207e16be04547745b61a1866aa51abb289041fbd238ff119a6410ebd`.
  Its 38-file `EVIDENCE.json` inventory SHA-256 is
  `aab9c3a4a01278645f1ca2db471ef9bfb0b55034344c944de3935b2ebf3623eb`.
- `.local/standalone-082-review-20261112-contract/`: independent contract/source
  corroboration and evidence inventory. `REPORT.md` SHA-256 is
  `795d1da7e42ecad8b73546fdee12356a42267eb85e6b11d7747e937b6ab45b39`.

An earlier external-script attempt lacked UTF-8 response metadata and produced
a Chromium response-body hash mismatch. It is retained separately and excluded
from the exact-byte claim; the canonical rerun asserts hashes with explicit
UTF-8 headers and HTML metadata.

These results do not certify every historical browser or arbitrary integration.
The new `queueMicrotask` dependency and historical polyfill setups were not
tested against older browsers. The known fault alone prevents compatibility
acceptance. Existing green CI lacks this regression case and cannot override it.

No product code, frozen artifact or production deployment changed during this
review. The last read-only production receipt identifies widget 0.8.1. The
owner's approved eager-loading policy for overridden URLs remains valid, but it
does not resolve this separate standalone defect or authorize release promotion.
