# Simple Digital Clock 1.1.2 — published patch

29 October 2026. **The P2 affecting the new KSES in WP 7.2 Beta 2 is fixed. Functional ZIP `6f896d42…` passed regressions, backward compatibility, resaving, upgrade and rollback. Final local package `7a0e061f…` differs only in POT metadata/source references and clarified LocalWP changelog wording; its contents and diff were checked separately. The exact final ZIP then passed a separate smoke test and Plugin Check. The release was published in SVN r3772502; at initial publication, the public ZIPs matched all 15 files.** [Publication and delivery verification](../../releases/1.1.2/PUBLICATION.md).

- [Subsequent synchronization of the published readme r3772710](../../releases/1.1.2/README-PUBLICATION.md).
- [Final checks of the exact ZIP, Plugin Check and SVN](../../releases/1.1.2/PREFLIGHT.md).
- [KSES fix, full acceptance scope and limitations](KSES72-VERIFICATION.md).
- [Machine-readable results and SHA-256 hashes of source evidence](kses72-evidence.json).
- [POT synchronization and repackaging](../../releases/1.1.2/METADATA-SYNC.md).
- [Git/SVN preparation, publication and release manifest](../../releases/1.1.2/README.md).
- [Full diff against official 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch).
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP SHA-256: `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8`.
- Diff SHA-256: `1eac522a09f74d8eba0f521fd87a138f72084f46e194d3af28f8bb3b32b5ff67`.

The functional fix in ZIP `6f896d42…` relative to `1e5d3f0d…` changed only `includes/simple-digital-clock-kses.php` and the changelog. Plain-text JSON caption protection lasts until the new KSES finishes; real HTML and other JSON fields retain Core's current policy. `block.js`, the schema, `save()`, CSS and runtime 0.7.0 were unchanged. There are no migrations or new storage formats.

Functional ZIP `6f896d42…` passed **18 336 PHP checks**, **1 309 248 entity DOM comparisons**, checks in three browser engines, Locale/Reset, mobile frontend, three themes with four Autoptimize/WP Super Cache modes, and Native HTTPS. Coverage includes 11 installations / 12 contexts on WP 6.3.2–7.2 Beta 2, PHP 7.0–8.5, LocalWP and multisite. Rollback over resaved data and reupgrade preserved all 34 468 complete posts rows and widget settings. The database was not restored. POT and two changelog items explicitly mentioning LocalWP were then synchronized: repackaging preserves the other 13 files byte for byte. Functional results are not presented as a new run on the changed archive; its verification is described separately.

The specific **7.2 Beta 2** was accepted; final WP 7.2 has not yet been tested, and `Tested up to: 7.1` is retained. The new HTTPS tests use a separate loopback port of actual Local nginx/FPM without changing the shared router or certificate trust. Nothing was checked on the review author's site. Editing after returning to 1.1.1 remains subject to the old version's defects.

History of previous ZIP `1e5d3f0d…`: [initial Beta 2 diagnosis](WP-7.2-BETA.md), [stable matrix](GAP-CLOSURE.md), [Native HTTPS/Site Domains](NATIVE-HTTPS.md). Their results and artifacts are retained and do not replace the new acceptance.

Earlier reports: [main acceptance](FINAL-ACCEPTANCE.md), [Locale](LOCALE-VERIFICATION.md), [widget fallback](WIDGET-FALLBACK-VERIFICATION.md), [public 1.1.1 in LocalWP](LOCALWP-PUBLISHED-RECHECK.md), [review 5](FINAL-REVIEW-5.md), [numeric entities](NUMERIC-VERIFICATION.md), [HTML5](HTML5-VERIFICATION.md).
