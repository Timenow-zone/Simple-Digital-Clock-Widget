# MULTI-ALIGN-P2-01: missing cross-browser clock alignment CSS

Date: 2026-11-12. Severity: P2. Status: **PHASE 1 COMPLETE; PHASE 2 AUTHORIZED**.
The owner explicitly requested recording the defect and correcting it in two
phases. This record separates the confirmed failure from future acceptance.

## Phase 1: record the defect and freeze the red baseline

The main runtime's inner text container uses a dynamically constructed Tailwind
class. The configured source scan does not emit `text-left`, `text-center` or
`text-right` rules. Firefox therefore ignores requested center/right alignment.
Chrome/WebKit's legacy host `align` behavior masks explicit-attribute cases; it
does not establish the promised default alignment when the attribute is absent.
The same defect is present in immutable 0.8.1 and 0.8.3, and the CSS omission is
also confirmed in 0.8.2. This is not a newly introduced timer or mount regression.

The [0.8.3 multi-instance report](../releases/0.8.3/MULTI-INSTANCE-REVIEW.md)
records 30 exact-artifact HTML/WordPress workflows: 20 PASS and 10 Firefox
alignment failures, zero missing. Independent native results cover both Core/PHP
versions, owned block output and raw HTML. The
[hosted red run](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43209921475)
failed only the new multi-instance step; Repository checks and the older browser
checks passed. The known failure remains a release blocker until new evidence
closes it.

- Baseline source: `ea43628f6c6e23102b78ebfcb35ed30044d15915`.
- Main 0.8.3: 36,245 bytes; SHA-256
  `c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b`.
- WordPress 1.1.6 RC4 ZIP SHA-256:
  `20ba3c0ebdaa5ff9f99639d59a004f471767a7f20e5e13518b1864403b68c1ea`.
- New work/evidence root: `.local/alignment-084-20261112/`.
- Phase-one before-edit identities: `phase1/BASELINE.json`, including every old
  numbered runtime, frozen RC4 objects, prior evidence index and plugin files.

Before the product edit, extend the exact-bundle test to cover absent, empty and
removed `align`, JavaScript property changes, inherited parent alignment, and
physical left/right within both LTR and RTL pages. Preserve the new failing
receipts separately from the prior 30-workflow record. Do not reinterpret a failed
phase as a successful later lifecycle operation.

The extended standalone red baseline is complete before the product edit:
**zero PASS, six FAIL, zero missing** on exact 0.8.3. Chrome/WebKit reach the new
attribute-removal case and incorrectly inherit parent `right` instead of the
promised default `center`. Firefox retains the earlier explicit right/center
failures. `phase1/PHASE1.json` and the separate Chrome/Linux receipts record the
observed values; all 33 before-edit baseline objects still match their hashes.
Independent review then tightened the future LTR/RTL phases to assert the actual
computed direction of every clock. These later phases were not reached by the
red baseline and are not claimed tested there; the extra guard does not relax its
earlier failing alignment checks.

## Phase 2: minimal correction and independent acceptance

Use explicit static `clsx` alternatives in the existing inner container:
`text-left`, `text-right`, and `text-center` for center/empty/absent alignment.
This keeps the existing classes, Tailwind pipeline and Shadow DOM boundary.
Unsupported values do not acquire a new validation policy in this correction.
No layout/flex, dimensions, fonts, formatting, timers, loader ownership, serializer
or saved WordPress schema change is in scope.

Build a new widget **0.8.4** and WordPress **1.1.6 RC5**. Preserve every 0.8.3/RC4
byte and failure receipt. Update both PHP runtime-version references, reproduce
the generated artifacts, freeze the new ZIP/full map and identify its source
commit. An unchanged bootstrap must be proven byte-identical, not inferred.

Acceptance requires all of the following:

1. All three production alignment rules exist; the exact new main responds with
   its accepted SHA-256 in ordinary HTML and installed WordPress.
2. Single and four differently configured simultaneous clocks, with later fifth
   insertion, pass in actual Google Chrome, Firefox and WebKit. Mutating/removing
   one instance preserves neighbors; reinsertion preserves host/root identity,
   seconds/hundredths genuinely tick, and main-runtime requests remain one.
3. Explicit left/center/right, default/empty/removal, JS property changes and
   inherited parent alignment pass in LTR/RTL. Chrome/WebKit behavior must remain
   correct; Firefox must no longer depend on legacy host presentation hints.
4. Initial-error isolation/readiness, native frontend/editor/preview, relevant
   loading/CSP, package and serialization regressions pass with the exact RC5.
   Fresh execution and inherited unchanged-code evidence remain separately scoped.
5. Independent source/artifact review and both required hosted checks pass on the
   final PR HEAD. Prior green CI or a locally generated bundle is insufficient.

The principal regression risk is different text placement in Chrome/WebKit when
real CSS replaces their legacy inheritance. Default alignment and RTL are explicit
checks for that risk. The old artifacts and deployment reference remain rollback
inputs; reverting a future asset reference does not overwrite immutable bytes.

Merge, production CDN delivery, owner-site installation and WordPress.org
publication are outside these two phases. The shared release remains incomplete
until a separately authorized CDN operation passes public SHA/cache/reference and
clock verification. Completing this correction does not authorize publication.
