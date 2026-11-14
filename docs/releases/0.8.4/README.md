# Widget 0.8.4 alignment correction

Status: **SCOPED EXACT-ARTIFACT ACCEPTANCE PASS; NOT PUBLISHED**.
This corrects [MULTI-ALIGN-P2-01](../../defects/MULTI-ALIGN-P2-01.md) through explicit
static alignment classes in the existing inner container. Tailwind now emits
left/center/right rules, including center for absent, empty or removed alignment.
Formatting, timers, layout, dependencies and public attributes are unchanged.

- Executable source: `b1af416e8373bc0bec0163ee36a03507f3ddcaaa`.
- Main runtime: `dist/0.8.4.min.js`, 36,430 bytes.
- SHA-256: `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Gzip: 12,567 bytes, level 9, Node v26.8.2 / zlib 1.2.12.
- WordPress bootstrap: unchanged 5,614 bytes; SHA-256
  `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.
- WordPress candidate: [1.1.6 RC5](../1.1.6/RC5.md).
- Intended CDN path: `/assets/simple-digital-clock-widget-0.8.4.min.js`;
  generated locally, not delivered to production.

The two phases preserve the exact red 0.8.3 proof before the product edit, then
require the new exact main in HTML and installed WordPress across actual Chrome,
Firefox and WebKit. The same-page fixture additionally checks default/removal,
JavaScript properties and computed LTR/RTL direction. Passing source tests alone
cannot close the mandatory built-artifact gate.

[RC5 acceptance](../1.1.6/FINAL-ACCEPTANCE-RC5.md) records 30/30 HTML/WordPress
single/multiple workflows, 24 standalone compatibility cases and 222 native rows
(the 24 native multi-instance rows are included in 222), plus ten transitions.
Final-HEAD hosted checks remain required as recorded there.

Ten older numbered bundles and frozen RC4 inputs/evidence remain unchanged.
Rejected 0.8.3/RC4 records retain their original alignment failures. Production
last served 0.8.1 in the separately recorded production verification. No merge, CDN delivery or
WordPress.org publication is part of these two phases. Final PR checks and the
remaining public delivery proof remain required release gates.
