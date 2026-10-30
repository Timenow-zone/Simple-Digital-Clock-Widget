# Widget 0.8.1: local font loading and localized time layout

Status: **local regression checks passed; required CI and final WordPress matrix pending; production CDN delivery pending**. This release is prepared with WordPress 1.1.4 in PR #11. Merging and publication are not authorized by this preparation.

## Scope

- After the widget's Google stylesheet fails, still await a matching independently provided theme font and refit in the next animation frame. The stylesheet failure remains explicitly reported. Stale font requests remain invalidated on font changes and removal.
- Keep the rendered time on one line while retaining the measured width clamp. This prevents WebKit from restoring a stale multiline layout after the font size shrinks. Caption and date wrapping retain their existing behavior.
- Add production-bundle regressions for a deliberately delayed local variable font with a failed Google stylesheet, and for Amharic time at narrow widths. Measurements must record untouched layout before any natural-width probe that could force reflow.

Dependencies and the custom-element attribute interface remain unchanged from 0.8.0. Published versioned bundles and the previous WordPress candidate are preserved.

## Local regression results

The same final regression file, with only the immutable bundle path substituted in a private runner, fails against 0.8.0 for late Fira Code in Chromium/Firefox/WebKit and for untouched Amharic wrapping in WebKit. The two Amharic controls in Chromium/Firefox pass. Against exact 0.8.1, all **10 font/loading/layout tests** pass; the existing production iframe regression passes **3 tests / 15 paired-frame visits**, without observer errors.

The local variable font is served 500 ms after its actual HTTP request. The test records and asserts that the deliberate Google stylesheet error occurs before the font response. It then checks the real loaded face, rendered weight, a required size reduction, one-line geometry and no overflow. The Amharic test records four untouched frames at 200 px, then verifies widths 80, 320 and 200 px. Earlier invalid clone/transport/readiness fixture attempts remain retained and are not counted as defect controls.

The [machine-readable regression evidence](acceptance.json) identifies the source, final test-file hash, original RED controls, exact GREEN artifact and scoped error handling. Local widget unit tests additionally pass **37 per engine** in Chromium and WebKit, including a full Linux WebKit run after the readiness correction below; required CI supplies the complete three-engine command. The independent WordPress matrix checks real unadjusted theme fonts and an installed package rather than the test-only 150% font metric stress.

Linux source CI run [41079580008](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41079580008) exposed an existing test readiness race in the first ordinary 80 px AM/PM assertion. Two equal font-size samples 16 ms apart did not prove that the scheduled fitting frame had run. A [controlled Linux WebKit replay](ci-readiness-evidence.json) held frame delivery and observed width 89.033 px at 10 px text; exactly two real frames, without resize or style mutation, produced 78.043 px at 8.777778 px text. The helper now waits for expected text/declared width, then exactly two animation frames before the unchanged strict geometry assertions. It never polls for fitting. All 37 Linux WebKit unit tests pass with that correction. The runtime, bundle and accepted WordPress ZIP remain unchanged; the original CI failure and diagnostic attempts are retained. The Amharic integration fixture also derives its expected time from the browser's native `Intl`: Linux WebKit legitimately puts the day period after the digits, while macOS puts it before them. This changes only the text-readiness precondition; single-line and width assertions remain unchanged. The final portable file passes 10/10 font tests on both platforms and retains all four macOS-hosted RED controls against 0.8.0. Linux iframe tests pass 3/3. Final required CI is pending.

Accepted local JavaScript: **36,009 bytes**, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`. Gzip level 9: **12,446 bytes** with Node 26.8.2/zlib 1.2.12. Source commit: `b44f944b60babf45bf266e73ba12f7eba53cfef2`. Dependencies remain Preact 11.1.0, preact-custom-element 4.6.0 and clsx 2.1.1. Dependency audit reports zero moderate/high/critical findings and five inherited low development findings.

## Acceptance and delivery

The [WordPress 1.1.4 report](../1.1.4/README.md) identifies the exact package and upgrade results. The earlier [0.8.0 candidate results](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/blob/28a20cbfd78a24988a5f4e325581c40dd5d18da6/docs/releases/1.1.4/README.md) remain historical evidence and do not certify a rebuilt artifact.

Production remains on 0.8.0. Build and verify the generated Cloudflare assets locally; do not deploy them during this task. A passing build or PR preview is separate from production delivery. A future authorized delivery must record the source commit, exact public asset SHA-256, deployment reference, cache/version metadata and live-clock smoke results. Preserve the previous production deployment for rollback; never replace immutable versioned bytes.
