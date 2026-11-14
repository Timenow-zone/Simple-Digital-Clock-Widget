# Independent final-output-r5 exact-ZIP acceptance

**Verdict: NO-GO.** IND-INLINE-01 is corrected, but a new mandatory final-output resource blocker is reproduced. Further broad experimentation stopped. No source/ZIP repair, push, merge, tag, deployment, publication or normal-preview update was performed.

## Exact frozen input

- Base commit `f75c98776b6b1860e916123915bed8084c879153`; uncommitted source frozen by `frozen-inputs.json` (**339 files**).
- ZIP `simple-digital-clock-1.1.4-final-output-r5-candidate.zip`: **67,469 bytes / 16 files**.
- ZIP SHA-256 `861912199c6e5c09e267202ee3dc2b5958a122833cd50a9bcf89cf375b036c0f`.
- Manifest SHA-256 `cdd9d6042bc5cba81a6556e9628e405c72871d812f1b6d8be6c8c86224480cf5`.
- Safe unique regular-file paths, CRC, exact allowlist/source/manifest/archive bytes verified independently. Both final installed file sets match. Freeze and both ZIP copies remain unchanged at close.

## IND-FINAL-01: tokenizer raw-text behavior differs across supported Core

`SDCW_output_has_clock()` (`includes/simple-digital-clock-assets.php:41-55`) assumes native `WP_HTML_Tag_Processor` suppresses every raw-text clock example. That assumption fails differently across supported versions:

- **WP6.3.14/PHP7.0.33:** `<xmp>` contents are exposed to the tag detector. Core's own tokenizer source explicitly documents that XMP is not skipped there. XMP is deprecated but still parsed as raw text by both tested browsers; the contract promises raw-text exclusion without an XMP waiver.
- **WP7.1.4/PHP8.3.35:** `<noscript>` contents are exposed to the detector. With JavaScript enabled, native browser parsing treats this as text, not a live clock. This is an ordinary fallback-markup use case. Current Core skips XMP, while minimum Core skips NOSCRIPT, so neither result may be generalized from one version.

Minimal frontend body, followed by normal `wp_footer()`:

```html
<noscript><timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second></timenow-zone-sdcw></noscript>
```

For the minimum-Core reproduction replace both `noscript` names with `xmp`. Exact native fixture implementation is in `buffer-template.php`, installed only in the new reviewer-owned lab via `buffer-fixtures.php`. No outer optimizer, post-final transformation, buffer removal or client-side clock insertion is used. The plugin's complete-response buffer remains installed.

Each failing public request returns **HTTP200/text-html**, **0 JS page errors**, **0 external plugin CSS**, **no leaked marker**, and **0 DOM clock elements**. Expected resources are 0; actual counts:

| Engine | Runtime | Raw-text example | DOM clocks | Runtime requests | Runtime tags | Inline blocks |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| chromium | minimum | xmp | 0 | 1 | 1 | 1 |
| chromium | current | noscript | 0 | 1 | 1 | 1 |
| webkit | minimum | xmp | 0 | 1 | 1 | 1 |
| webkit | current | noscript | 0 | 1 | 1 | 1 |

Native diagnostics (`minimum-rawtext-native.json`, `current-rawtext-native.json`) record detector return values and exact tokenizer token sequences. Live/escaped/iframe controls separate native-tokenizer behavior from browser harness setup. `metadata-and-scope-review.json` hashes both installed Core tokenizer sources. Actual response bodies and screenshots are preserved as `buffer-{site}-{engine}-{kind}.html/.png`; raw network counts, headers, URL and errors are in `buffer-browser-results.json`. The failing current NOSCRIPT source appears as raw text in the browser, with the plugin script/style emitted after its closing tag.

The authored 30 fixtures cover script/textarea/template examples, but omit NOSCRIPT and XMP. Their passing result cannot prove the full no-clock/raw-text requirement. No exception to the contract is assumed.

## Independent positive evidence

The original independent suppress/escape/keep/empty reproductions now **PASS16/16** across Chromium/WebKit and both runtimes: original IND-INLINE-01 is closed for this exact r5 archive. The separate buffer compatibility set records **40PASS/4FAIL**: nested buffers retained/discarded/escaped, split-tag `ob_flush()`, discarded child followed by a real clock, repeated footer calls, plain text, JSON, iframe and the opposite-version raw-text controls all have expected resource counts. JSON remains parseable; all44 rows have no marker leak.

Total own HTTP resource observations: **60 (56PASS/4FAIL)**. This is distinct from the separate **4/4 ticking bootstrap smoke** and **12/12 local regression contracts**. No broad frontend/admin/theme/Firefox/security acceptance is inferred from these scoped results.

## Gate matrix

**9 PASS / 1 FAIL / 7 NOT RUN; 0 waivers.** `evidence.json` binds each status to raw paths and limits.

| Gate | Status | Coverage |
| --- | --- | --- |
| G01 | PASS | Exact archive/source/manifest/installed identity |
| G02 | PASS | Metadata/minimums/licenses/PHPCS exception review |
| G03 | PASS | Actual Core/PHP identities |
| G04 | PASS | Public predecessor upgrade / physical rollback / reupdate |
| G05 | PASS | Official PCP2.1.0 static and actual runtime |
| G06 | PASS | Focused local regression guards |
| G07 | PASS | Native bootstrap clock smoke |
| G08 | PASS | Original IND-INLINE-01 paired reproduction |
| G09 | FAIL | Final response buffer and raw-text resource contract |
| G10 | NOT RUN | Fresh r5 installation separate from predecessor upgrade |
| G11 | NOT RUN | Full authored 30-fixture frontend matrix |
| G12 | NOT RUN | Admin notice/editor first insertion/save/reopen/iframe |
| G13 | NOT RUN | Classic and block theme late CSS matrix |
| G14 | NOT RUN | Actual Linux Firefox frontend |
| G15 | NOT RUN | Native roles/KSES/security/recovery/unknown-metadata matrix |
| G16 | NOT RUN | New required GitHub checks |
| G17 | PASS | Freeze, owned teardown, normal-preview preservation |

Fresh reviewer databases observe actual WP6.3.14/PHP7.0.33 and WP7.1.4/PHP8.3.35. All six public1.1.2 → native update → physical rollback → native reupdate transitions preserve complete post rows and eight critical options, with exact installed bytes and no DB restore/reset. This does not assert every transient row is immutable. These transitions do not satisfy the separate fresh-candidate-install gate.

Pinned official **Plugin Check2.1.0:29 static+5 actual runtime checks,0 errors/0 warnings**, on supported PHP8.3.35. No finding is waived. It was not run or credited on unsupported PHP7.0. The exact one-line PHPCS backtrace exception remains reviewed:12-frame limit, arguments ignored, production KSES-callback identity boundary, no broader severity/check suppression. This source review does not certify the stopped native KSES matrix.

## Scope and teardown

Only installable `includes/simple-digital-clock-assets.php` and `readme.txt` differ from r4b. KSES/block/widget/licenses/notices are byte-identical; unchanged bytes do not transfer earlier native security or r2/r3 acceptance. Public1.1.2's old writer/Core6.3 data-loss boundary remains: file rollback cannot reconstruct erased caption/Advanced/lock metadata. No blanket old-writer/recovery claim is made.

Remaining fresh-install/full30/admin/editor/iframe/classic-theme/Firefox/native-security gates are NOT RUN after the mandatory blocker. No new required GitHub CI, LocalWP, TLS, multisite, native Safari/VoiceOver, successful real external font transport, owner install or public delivery is claimed. The response-sized-memory/streaming tradeoff and external output/cache/optimizer boundaries remain as documented; this blocker occurs inside the native raw-text scope.

Only `sdcw-repro-independent-r5-20261101-a` was stopped; its ports are closed and databases/raw failures retained. Normal preview `sdcw-repro-debt-20261101-h` still has `current` and `db` running, verified read only. Root's author project was not modified/stopped. `final-integrity.json` records final frozen hashes, installed file sets and teardown. Raw transition/PCP/runtime logs remain under `.local/wordpress-repro/independent-r5-20261101-a/`.
