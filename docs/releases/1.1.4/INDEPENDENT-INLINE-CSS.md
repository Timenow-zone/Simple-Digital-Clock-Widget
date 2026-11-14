# Independent inline CSS exact-archive acceptance

**Verdict: NO-GO.** One mandatory actual-output resource contract fails. Stop-after-blocker procedure applied; remaining mandatory coverage is explicitly NOT RUN. No fixes, push, merge, tags, publication or deployment were performed.

## Exact frozen input

- Base commit: `f75c98776b6b1860e916123915bed8084c879153`; reviewed source is uncommitted, frozen by `frozen-inputs.json` (333 files).
- ZIP: `simple-digital-clock-1.1.4-inline-css-r4b-candidate.zip`, **66,810 bytes, 16 files**.
- SHA-256: `3b434a982d24192173e2f93239121292b4013aaf51e8044fd227787c67addef2`.
- Manifest SHA-256: `ce94bf3bc9b41f2ce2ca97ed802c65fe367ae59175da6cdd1e9863981472b3b7`.
- Safe paths, CRC, uniqueness, regular-file allowlist, source/manifest/archive bytes and both final installed file sets independently match. All frozen source files and both copies of the ZIP remain unchanged at close.

## Blocking finding IND-INLINE-01

`SDCW_enqueue_rendered_clock_assets()` enqueues at `includes/simple-digital-clock-assets.php:50`, registered on every `render_block` at line 54. Native Core renders an inner clock before calling its dynamic parent. If that parent suppresses or escapes its inner output, the final frontend contains no clock while the runtime and inline layout rule remain queued. This violates the documented **actual rendered frontend output: no clock = 0 runtime and 0 inline blocks** requirement, including nested/dynamic and escaped output. No contract waiver is assumed.

Minimal real fixture, with an ordinary clock block nested inside the registered parent:

```php
register_block_type('independent-inline/suppress', array(
    'api_version' => 3,
    'render_callback' => function ($attributes, $content) {
        return '<p>Conditional parent suppressed its child.</p>';
    },
));
```

The paired `keep` parent returns `<section>` plus `$content`; the paired `escape` parent returns `<pre>` plus `esc_html($content)`. `empty` contains no clock source. Full exact fixture source: `independent-negative-fixtures.php`; post source/IDs/URLs: `minimum-independent-negative-seed.json` and `current-independent-negative-seed.json`. No direct template echo or late client insertion is involved. The standard Core render path is used with a call to the native footer through the stock theme.

Every row below returned HTTP 200, 0 JS page errors and **0 actual clock elements**. Expected runtime requests/tags/inline blocks are all 0; observed values are all 1:

| Engine | Runtime | Case | DOM clocks | JS requests | JS tags | External CSS | Inline blocks |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| chromium | minimum | suppress | 0 | 1 | 1 | 0 | 1 |
| chromium | minimum | escape | 0 | 1 | 1 | 0 | 1 |
| chromium | current | suppress | 0 | 1 | 1 | 0 | 1 |
| chromium | current | escape | 0 | 1 | 1 | 0 | 1 |
| webkit | minimum | suppress | 0 | 1 | 1 | 0 | 1 |
| webkit | minimum | escape | 0 | 1 | 1 | 0 | 1 |
| webkit | current | suppress | 0 | 1 | 1 | 0 | 1 |
| webkit | current | escape | 0 | 1 | 1 | 0 | 1 |

The eight `empty`/`keep` paired controls PASS: empty = 0/0/0, kept child = 1/1/1 for runtime requests/tags/inline layout, with actual DOM clock counts 0/1 respectively. These controls share the same new site, theme, plugin files and browser routing. Each page uses a fresh browser context. Native traces independently show a child clock enqueues resources followed by parent output with no clock tag.

Raw evidence: `independent-negative-browser.json`, `negative-browser.log`, `minimum-eager-render-trace.json`, `current-eager-render-trace.json`; each `{site}-{engine}-{case}.html` and `.png` preserves the actual HTTP body and screen. The initial sandbox launch failure is separately retained in `negative-browser-sandbox-failed.log`; the successful native rerun supplies these 16 observations.

The authored 20-case fixtures cover ordinary nested/dynamic output, literal escaped HTML and positive manually rendered excerpts. They lack dynamic parents that discard/escape inner clock output; their passing evidence cannot establish this negative requirement. No blanket output-buffer workaround or frozen-source change was made. A later candidate must resolve the final-output boundary and gain its own exact-artifact acceptance.

## Gate matrix

**8 PASS / 1 FAIL / 7 NOT RUN; 0 waivers.** PASS entries are scoped results, not a complete release acceptance.

| Gate | Status | Coverage |
| --- | --- | --- |
| G01 | PASS | Exact archive, source, allowlist and installed identities |
| G02 | PASS | WordPress metadata, minimums, notices and bounded PHPCS exception |
| G03 | PASS | Actual supported runtime identities |
| G04 | PASS | Published 1.1.2 upgrade / physical rollback / reupdate |
| G05 | PASS | Official pinned Plugin Check static and runtime |
| G06 | PASS | Focused authored regression guards independently executed |
| G07 | PASS | Native clock bootstrap smoke |
| G08 | FAIL | Actual final-output zero-assets frontend contract |
| G09 | NOT RUN | Fresh candidate installation separate from predecessor upgrade |
| G10 | NOT RUN | Full 20-fixture native frontend resource matrix |
| G11 | NOT RUN | Admin notice/editor first insertion/save/reopen/iframe matrix |
| G12 | NOT RUN | Classic plus block theme late CSS matrix |
| G13 | NOT RUN | Actual Linux Firefox frontend |
| G14 | NOT RUN | Native roles/KSES/security/recovery/unknown-metadata probes |
| G15 | NOT RUN | New required GitHub Repository checks and Browser tests |
| G16 | PASS | Freeze, owned teardown and owner preview preservation |

`evidence.json` records each gate's scope and raw paths. Fresh databases verified actual **WP6.3.14/PHP7.0.33** and **WP7.1.4/PHP8.3.35**. Six native upgrade/physical-file-rollback/reupdate transitions from the pinned actual public 1.1.2 preserve complete post rows and eight critical options with no DB restore/reset. This does not claim every transient is immutable. Four independent Chromium/WebKit bootstrap ticking smokes PASS. The generic harness `summary.json` PASS refers to its limited transitions/PCP/smoke checks; it does not override this NO-GO.

Official pinned **Plugin Check2.1.0** selected **29 static + 5 runtime** checks on PHP8.3.35: **0 errors, 0 warnings**. There are no findings to waive. PCP was not run or credited on unsupported PHP7.0. The one exact-code PHPCS exception at KSES line457 is reviewed: bounded 12-frame backtrace with arguments ignored, used to distinguish owned KSES from unrelated/nested callbacks. Only that next line is exempted; no broader rule/severity/check is disabled. This source review does not substitute for the stopped native security matrix. Twelve focused local regression contracts PASS.

## Limits and preservation

KSES, block.js and widget bytes match the pre-inline r3 manifest. This establishes unchanged bytes, not fresh native role/KSES/payload/recovery certification. The old public1.1.2 writer/Core6.3 data-loss boundary remains: physical file rollback does not reconstruct erased captions or Advanced/lock metadata. No successful old-writer or universal recovery claim is made; prior r2/r3 GO is not transferred.

No new required GitHub CI was run for the frozen uncommitted source. Candidate fresh install, full 20-case matrix, admin/editor/iframe, classic/block late CSS, actual Linux Firefox and native security probes stopped at the blocker. HTTPS/TLS, multisite, native Safari/VoiceOver, successful external Google transport, owner-site installation and public delivery are outside this review.

Only `sdcw-repro-independent-inline-20261101-a` was stopped; its two ports are closed. Databases and all failures/raw evidence remain. Normal preview `sdcw-repro-debt-20261101-h` remains running (`current`, `db`), checked read only. Final identities and teardown receipt: `final-integrity.json`; owned lab raw snapshots/logs: `.local/wordpress-repro/independent-inline-20261101-a/`.
