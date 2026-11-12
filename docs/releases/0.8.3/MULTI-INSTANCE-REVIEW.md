# Single and differently configured simultaneous clocks

Date: 2026-11-12. **NO-GO for complete cross-browser acceptance of 0.8.3 / RC4.**
The new targeted proof finds an existing Firefox alignment defect. This result
supersedes the current compatibility decision from the earlier, narrower
[RC4 snapshot](../1.1.6/FINAL-ACCEPTANCE-RC4.md); that snapshot and its evidence
remain unchanged. The initial-error-isolation correction still passes its
recorded tests. No product bytes or production deployment changed in this review.

## What was actually tested

The exact 36,245-byte `dist/0.8.3.min.js` was tested through external scripts in
ordinary HTML and real installed WordPress 6.3.14/PHP 7.0.33 and
7.1.4/PHP 8.3.35. The main SHA-256 is
`c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b`.
The installed RC4 ZIP remains
`20ba3c0ebdaa5ff9f99639d59a004f471767a7f20e5e13518b1864403b68c1ea`.

Each environment starts with one clock or four clocks on the same page. The
four configurations are independent:

| Clock | Time zone / locale | Time format | Width / background | Alignment / date |
| --- | --- | --- | --- | --- |
| UTC | UTC / en-GB | 24-hour, seconds | 240px / light blue | Left / shown |
| New York | America/New_York / en-US | 12-hour, seconds | 320px / dark blue | Right / absent |
| Tokyo | Asia/Tokyo / ja-JP | 24-hour, hundredths | 280px / yellow | Center / shown |
| Kolkata | Asia/Kolkata / hi-IN | 24-hour, minutes | 360px / green | Left / absent |

Captions, border presence, corner radius and shadows also differ. UTC's caption
contains literal HTML-like text and must not create markup. The first clock then
changes to Honolulu/de-DE, 12-hour hundredths, 410px, purple, right alignment and
no date. Other configurations must remain unchanged. The test removes that
host, checks remaining clocks, reinserts the same host/shadow root, and adds a
fifth clock using Pacific/Chatham/en-NZ and another width/color. An intentional
517px corruption is detected by the oracle and restored before final assertions.

This is multiple instances on one page, not WordPress Multisite. Native WordPress
tests separately cover actual `do_blocks()` output and raw HTML through real
`wp_head()`/`wp_footer()`. They do not force an extra enqueue: native owned pages
expect zero bootstrap requests, raw fallback pages one. Both execute the same
main artifact once per document.

## Canonical results

| Environment | Google Chrome 157.0.8103.51 | Firefox 153.0 | WebKit 26.5 |
| --- | --- | --- | --- |
| Ordinary HTML: single and multiple | 2/2 PASS | 0/2; alignment failures | 2/2 PASS |
| Installed WordPress: two Core versions, owned/raw, single/multiple | 8/8 PASS | 0/8; alignment failures | 8/8 PASS |

Total: **30 completed workflows, 20 PASS, 10 FAIL, zero missing**. Google Chrome
uses explicit `channel: "chrome"` on macOS arm64. Firefox uses pinned Linux
arm64 Playwright. WebKit uses Linux arm64 for HTML and macOS arm64 for native
WordPress; it is not a native Safari certification.

In Firefox, the single-clock workflows pass their initial left-aligned rendering
and real ticking, then fail after changing the first clock to right alignment.
The multiple-clock workflows fail on New York's right alignment and Tokyo's
center alignment. Their captured clock text, fixtures and other checked styles
match; the later lifecycle phases are not claimed passed after an early failure.

Successful Chrome/WebKit workflows verify actual text using native `Intl` and
independent fixture settings, allowing at most 1,500ms render age. They verify
captions, widths including visible geometry, colors, radius, alignment, date and
border presence, shadow class/effect, root identity, and real seconds/hundredths
ticks before and after lifecycle changes. No Date or timer override is used.
Minute-only Kolkata is checked for its correct current display, but a short test
does not establish a minute-boundary tick. Shadow pixel geometry and every
possible locale/timezone/attribute combination are outside this bounded proof.

The canonical runner SHA-256 is
`79c5894027bc1f687153b4e46eba7e8a3647419cd5b7587390e48a13e24020cb`;
fixture SHA-256 is
`2a75fbf7b0b5cf16a881f73f1ca7708be278028781b37e510b3c54d654ceab35`.
All 30 captured main bodies match the exact accepted artifact. Errors and one
main request throughout the completed lifecycle are strict assertions in passing
rows; early failures are not converted into successful lifecycle coverage.

## Proven cause: MULTI-ALIGN-P2-01

The component generates `text-${align || "center"}` dynamically, while Tailwind
scans `src/*.tsx` without explicit alignment utilities. The exact 0.8.1, 0.8.2 and
0.8.3 bundles contain no `text-align` rules or left/center/right utility classes.
An independent Tailwind control using the actual source emits zero such rules;
adding the three literal utility names only in memory emits the expected rules.

A separate minimal browser audit compared immutable 0.8.1 and 0.8.3 in all three
browsers. Both versions show the same behavior: Chrome/WebKit inherit alignment
from the custom host's HTML `align` attribute, while Firefox retains `start`.
A bare custom-element control and an ordinary `div align="right"` distinguish
the browser behavior from the clock renderer. Both versions' shadow stylesheets
have zero alignment rules. Thus this is a pre-existing defect, not evidence that
the 0.8.3 error-isolation change caused it.

For left-to-right text, `start` is equivalent to `left`; the final oracle resolves
logical start/end using computed direction. It still rejects start/left when
right or center was requested. The demonstrated failure is explicit right/center
alignment, including a single clock after changing its settings. Omitted/default
alignment was not separately accepted by this audit.

## Evidence and next correction

The new evidence root is `.local/multi-instance-083-20261112/`:

- `CANONICAL-RESULT.json`: 30 rows and exact runner/fixture identities.
- `standalone/chrome-canonical/` and `standalone/linux-canonical/`: HTML receipts,
  observed settings/timestamps, failures and screenshots.
- `native/browser-final-{chrome,firefox,webkit}/`: eight native rows per browser.
- `alignment/{chrome,linux}/`: six independent 0.8.1/0.8.3 browser controls.
- `review/`: independent source, Tailwind causal control and result review.

The native follow-up preserved all eight content tables, all options and all 17
plugin files on both sites. Its four uniquely owned temporary MU fixture files
were removed after hash verification and only the owned project was stopped.
The previous 1,711-file acceptance inventory still matches. The new native
215-file inventory SHA-256 is
`ec1ae384cdf20adb30d6a0ffe65c1e256d4639e6f997a7cab5691064159ff5e9`.

Earlier attempts remain distinct: the initial runner compared `start` and `left`
literally; initial mutation did not exercise hundredths; failure diagnostics used
the pre-mutation fixture; and two first Chrome native pages requested a missing
favicon. These harness issues were corrected before the canonical runs, without
altering product bytes or relaxing right/center expectations. No earlier failed
receipt was rewritten as PASS.

The persistent test is `tests/multi-instance.integration.test.mjs` with fixture
`tests/fixtures/multi-instance.json`, invoked by `npm run test:instances` and the
required Browser tests workflow. This test must remain failing for the known
Firefox defect until the product is corrected; a previous green CI does not
override it. Final hosted results are recorded separately under the new evidence
root after push.

The minimal product correction is to emit explicit alignment CSS, through static
utility alternatives or a scoped `text-align` style on the inner container. That
correction requires a new versioned artifact and WordPress candidate, preserving
these 0.8.3/RC4 bytes, followed by the full single/multiple HTML/WordPress matrix.
No such product correction, merge, CDN delivery or WordPress.org publication is
included in this proof-only follow-up.
