# Widget 0.8.0: Preact 11 and clock fitting

Status: **candidate; required CI and production CDN delivery pending**. PR #10 remains open. This standalone release preserves all six previously published versioned bundles and the frozen WordPress 1.1.3 package with widget 0.7.1.

## Version and dependency scope

0.8.0 marks the Preact 11 migration as a new minor milestone. A dependency major upgrade alone does not require the consumer's version to increase its minor number; [SemVer bases that decision on the public API](https://semver.org/#what-should-i-do-if-i-update-my-own-dependencies-without-changing-the-public-api). The custom element and its attributes remain compatible. Published 0.7.2 bytes and URLs are retained, rather than relabeled or replaced.

Dependencies remain those accepted for 0.7.2: Preact **11.1.0**, preact-custom-element **4.6.0**, and clsx **2.1.1**. The explicit pixel lengths and built-in custom-element typings from that migration remain in place. See the [dependency migration record](../0.7.2/README.md).

## Findings and fixes

The earlier 192 old/new comparisons were **96 configurations in each of Chromium and WebKit**, checking parity between 0.7.1 and 0.7.2. They were not absolute no-wrapping assertions. Independent review found two existing sizing problems in both versions:

1. An ordinary AM/PM clock at 80 px could wrap in Chromium, including `bg-BG`. Apply the natural-width clamp to ordinary clocks as well as hundredths, and refit after rendered formatting or hour-length changes. Resize work stays coalesced in an animation frame, outside ResizeObserver delivery.
2. A delayed, wider Google Font could leave the fallback font's size in use until another resize. Wait for the stylesheet, then load the actual time glyphs and fit in the next animation frame. This does not wait for unrelated page fonts. An event-only implementation was insufficient in the tested WebKit. Explicit glyph coverage also prevents fitting too early when Latin loads before a localized Unicode subset. Newly used glyphs are cached per instance; ordinary ticks do not repeatedly call `fonts.load`. Font changes and removal invalidate stale callbacks and clear stylesheet handlers.

The narrow absolute regression was first run against 0.7.2 and failed in Chromium: the rendered time occupied two lines. Controlled font tests also reproduced delayed-font overflow. These findings are not evidence of a new regression caused by Preact 11.

## Validation and artifact

- Local Chromium and WebKit: **37/37 widget tests per engine**; production iframe regression passed five paired-frame visits per engine, without filtered errors.
- Independent 0.7.1/0.8.0 production comparison: **96 configurations per engine**, six locales and four widths. Text, labels, colors and container widths match, and every new time fits one line. The only four geometry differences are the expected Chromium `bg-BG` ordinary AM/PM fixes at widths 80/180/320/600; WebKit geometry is unchanged.
- Mutation/lifecycle review: 12 stages and five detach/reconnect cycles per engine; active timers, animation frames, observers and resize listeners are zero after removal. Controlled HTTP font swaps pass normal and 180% stress cases in both engines, including pending-load removal/reconnect with zero late detached animation frames.
- Chromium additionally passes delayed Latin/Cyrillic subsets and runtime locale changes: only two `fonts.load` calls after the initial locale and five switches, with no manual resize. WebKit did not request the Cyrillic face in that probe, so its subset-specific result is not counted.
- Three TypeScript configurations, ESLint, **22 Node tests**, **26 release/prose tests**, release metadata/identity checks, an independent temporary build, and site generation passed.
- The required browser command also runs a delayed-font production-bundle regression in Chromium, Firefox, and WebKit. Local macOS Firefox cannot start test pages; only the required Linux CI can supply its acceptance result.
- [Local acceptance snapshot](acceptance.json); raw reports, red/green results and screenshots remain in ignored `.local/widget-080-20261030/`.
- Production dependency audit has zero findings; the full audit retains five inherited low development findings and zero moderate/high/critical findings.

Accepted candidate: `dist/0.8.0.min.js`, byte-identical to `dist/latest.min.js`; **35,726 bytes**, SHA-256 `591d5fef194600410bbb8354b71f029bb478e13cd6a824577b805ca4c7591364`. Gzip level 9: **12,389 bytes** with Node 26.8.2/zlib 1.2.12. Other encoders can produce different gzip sizes without changing JavaScript bytes.

The tests cover current Playwright browsers, deterministic locales and controlled font swaps. They do not certify historical browser minima, every real Google Fonts response, every host/theme, DST transitions, or a WordPress upgrade to this widget. The [Preact 11 browser minimums](https://preactjs.com/guide/v11/upgrade-guide/#supported-browser-versions) are upstream requirements, not results of this browser suite.

## Delivery and rollback

After required PR checks pass, build the Cloudflare assets and verify the exact preview artifact before production delivery. Preserve the current production deployment reference; verify HTTP 200, SHA-256, `/version.json`, page references, cache headers, all seven immutable versioned URLs and live production clocks. Record source commit, deployment/version IDs and results separately from this candidate snapshot.

If verification fails, restore the saved deployment at 100%; do not overwrite immutable versioned bytes. PR merging, npm publication, Git tags and the WordPress package remain separate actions.
