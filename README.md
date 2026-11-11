# Simple Digital Clock Widget

Lightweight, framework-agnostic web component (built with Preact) to display a digital clock with timezone and locale support.
Ships as a single JS file, easy to drop into any site (plain HTML, WordPress, React/Preact, etc).

Widget and WordPress plugin versions are independent:

| Component | Version | Delivery status |
| --- | --- | --- |
| Widget runtime | **0.8.1** | Published demo/CDN |
| WordPress source | **1.1.5** | Published in SVN r3797104; exact server-r2 payload verified; update distribution pending in the recorded sample |
| WordPress.org stable | **1.1.5** | Public ZIP/catalog verified at 2026-11-11 21:19 UTC; sampled update checks still advertised 1.1.4 at 21:20 UTC |

The metadata below describes the JavaScript widget artifact.

<!-- SDCW_RELEASE_METADATA_START -->
* **Current version:** `0.8.1`
* **Tiny:** 12.2 KiB gzipped (`dist/0.8.1.min.js`; 36,009 bytes minified, 12,446 bytes gzip)
* **Artifact SHA-256:** `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`
* **Gzip measurement:** level 9; Node `v26.8.2`; zlib `1.2.12`. Other encoders may produce different sizes.
<!-- SDCW_RELEASE_METADATA_END -->
* **Embeddable:** 1 custom element tag
* **Theme-aware:** auto light/dark, or force it
* **Timezone & locale aware:** uses `Intl.*` under the hood
* **Accessible:** semantic, keyboard focusable link

Historical preparation and branch policy: [release readiness, 31 October 2026](docs/maintenance/release-readiness-2026-10-31.md).
Local unpublished follow-up: [dependency mitigation and fresh WordPress lab, 1 November 2026](docs/maintenance/local-debt-closure-2026-11-01.md).
Local integration: [rollback CI checks and repository hygiene, 3 November 2026](docs/maintenance/local-ci-hygiene-2026-11-03.md).
Current WordPress source: [1.1.5 release and publication evidence](docs/releases/1.1.5/README.md).
Last verified WordPress publication: [1.1.5 publication and verification record](docs/releases/1.1.5/PUBLICATION-2026-11-11.md).
Prior accepted render-r9 review: [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18) targets `dev`; the [7 November synchronization review](docs/maintenance/repository-sync-2026-11-07.md) records hosted CI, examples, package identity and remaining translation limits.

Widget **0.8.1** fixes refitting after a delayed local theme font loads when the Google stylesheet fails, and keeps localized time on one line after shrinking in WebKit. See the [regression and release record](docs/releases/0.8.1/README.md). The independently versioned WordPress 1.1.4 release bundles this exact artifact; the retained 1.1.3 ZIP keeps widget 0.7.1. The production demo/CDN serves this [published 0.8.1 artifact](docs/releases/0.8.1/PUBLICATION.md).

---

## Demo & Plugin

* **Live demo:** [https://simple-digital-clock-widget.yuri.ws/](https://simple-digital-clock-widget.yuri.ws/)
* **Historical CodePen playground (widget 0.7.0):** [Open CodePen](https://codepen.io/dejurin/pen/01a025ef-f466-7534-acd0-77bc3a368a47). Use the live demo above for the current widget and embed code.
* **WordPress plugin:** [https://wordpress.org/plugins/simple-digital-clock/](https://wordpress.org/plugins/simple-digital-clock/)

---

## Installation

### Via `<script>` (no build tools)

Load the immutable, versioned production asset:

```html
<script src="https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.1.min.js"></script>
```

For self-hosting, copy `dist/0.8.1.min.js` to your site and use its URL instead.
The unminified `dist/SimpleDigitalClockWidget.js` entry is also retained.

Now use the custom element:

```html
<timenow-zone-sdcw
  time-zone="Europe/London"
  locale="en-GB"
  time-zone-name="longGeneric"
  width="300"
  rounded=".25"
  shadow="shadow"
  border
  period
  background-color="#00416A"
  align="center"
  second
  caption="London time"
></timenow-zone-sdcw>
```

> The component registers itself as `<timenow-zone-sdcw>`.

### Source integration

An npm package is not published under `simple-digital-clock-widget`. Use the
versioned CDN script above, or clone this repository and follow the development
instructions below. This private root package also contains the separately
licensed WordPress wrapper and release tooling; it is not an npm distribution.

Import the widget source once from your own checked-out source integration, then
use the tag in your HTML/JSX as shown above. A future npm distribution requires a
separate package allowlist, license review and release acceptance.

---

## Attributes (Props)

Pass options as **kebab-case attributes**. Internally they map to the following props:

| Attribute (HTML)   | Type / Enum                                                                                   | Default          | Description                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `time-zone`        | `string`                                                                                      | browser timezone | IANA timezone like `Europe/Kyiv`, `America/New_York`.                                                                                       |
| `locale`           | `string`                                                                                      | browser locale   | BCP-47 locale, e.g. `en-US`, `fr`, `ru`, …                                                                                                  |
| `time-zone-name`   | `"" \| "short" \| "long" \| "shortOffset" \| "longOffset" \| "shortGeneric" \| "longGeneric"` | `""` (hidden)    | Controls the name shown when toggled (click the date/zone line).                                                                            |
| `second`           | `boolean`                                                                                     | `false`          | Show seconds. Attribute present ⇒ `true`. Use `second="false"` to force off.                                                                |
| `hundredths`       | `boolean`                                                                                     | `false`          | Show hundredths of a second. Implies seconds while enabled. Attribute present ⇒ `true`; use `hundredths="false"` to force off.             |
| `period`           | `boolean`                                                                                     | follow locale    | **12/24-hour override**. If set, forces 12h (`period`) or 24h (`period="false"`), ignoring locale. If not set, uses locale default.         |
| `date`             | presence attribute                                                                            | omitted          | Show the date line below the time. Clicking it toggles **date** ↔ **timezone name**. Omit to disable; `date="false"` still enables it.       |
| `caption`          | `string`                                                                                      | —                | Optional label displayed above the time.                                                                                                    |
| `align`            | `"left" \| "center" \| "right"`                                                               | `"center"`       | Text alignment inside the widget.                                                                                                           |
| `width`            | `number` (px)                                                                                 | auto (min 80)    | Fixed width of the widget box.                                                                                                              |
| `rounded`          | `number` (rem)                                                                                | —                | Corner radius in rem, e.g. `0.25`.                                                                                                          |
| `shadow`           | `"shadow" \| "shadow-sm" \| "shadow-md" \| "shadow-lg" \| "shadow-xl" \| "shadow-2xl"`        | —                | Box shadow presets.                                                                                                                         |
| `border`           | presence attribute                                                                            | omitted          | Adds a 1px border. Color is auto-darkened from background. Omit to disable; `border="false"` still enables it.                               |
| `background`       | `string` (CSS)                                                                                | —                | Any CSS background (e.g. gradient).                                                                                                         |
| `background-color` | `string` (color)                                                                              | auto (theme)     | Solid background color (e.g. `#00416A`, `rgb(255,0,0)`). If `background` is set, this is ignored for painting but used for contrast/border. |
| `font-family`      | `string`                                                                                      | monospace        | Family name. If the value is on the internal allow-list, Google Fonts is auto-loaded.                                                       |
| `prefers`          | `"" \| "auto" \| "system" \| "light" \| "dark"`                                               | `system`         | Theme source for background when `background-color` is not provided.                                                                        |

**Boolean attributes in the standalone web component:**

* `second`, `hundredths` and `period` normalize boolean-like values. Present without a value, `"true"`, `"1"` or `"yes"` means true; `"false"`, `"0"` or `"no"` means false.
* Omitted means “not provided”; `period` then follows the locale.
* `date` and `border` use presence semantics in the current runtime. Any supplied value enables them, including `"false"`. Omit or remove the attribute to disable them.

WordPress controls serialize the wrapper's own settings into these HTML attributes;
the raw attribute rules above are not labels for its sidebar switches.

---

## Hundredths of a Second

Hundredths are opt-in:

```html
<timenow-zone-sdcw hundredths></timenow-zone-sdcw>
```

* `hundredths` automatically includes seconds; `second` is not required.
* Without `hundredths`, the widget keeps the normal approximately once-per-second update path.
* With `hundredths`, the time display is refreshed with `requestAnimationFrame` and a cached `Intl.DateTimeFormat`.
* This is display precision, not a certified stopwatch. The browser may not render every 10 ms increment.

---

## 12/24-hour behavior (Locale vs. `period`)

* **By default** the clock follows your `locale` (e.g., `fr` displays 24-hour).
* **If you set `period`**:

  * `period` (present or `"true"`) ⇒ force **12-hour** (`AM/PM`) regardless of locale.
  * `period="false"` ⇒ force **24-hour** regardless of locale.
* **If you omit `period`**, locale rules apply.

This is implemented with `Intl.DateTimeFormat` options:

* When `period` is specified → `{ hour12: <true|false>, hourCycle: "h12"|"h23" }`
* When not → don’t pass `hour12`, letting locale decide.

---

## Styling & Theming

* Text color is computed automatically for contrast against the background.
* If `prefers` is `"system"`/`"auto"` (or unset), the widget will try to detect dark mode using `matchMedia('(prefers-color-scheme: dark)')` and pick black/white background if you didn’t set `background-color`.
* You can pass any CSS `background` (gradients, images). In that case the widget still uses your `background-color` (if provided) for border/contrast calcs.

---

## Interactions

* If `date` is enabled, click the second line to toggle **date** ↔ **time zone name**.
* The time itself is a link to [https://utctime.info/](https://utctime.info/).

---

## Browser Support

Targets modern browsers (`> 0.25%, not dead`).
Uses Web Components and `Intl.*`. For very old browsers you may need polyfills.

---

## Development

### Prerequisites

* Node.js 22.12+ required; Node.js 24 LTS is selected by `.nvmrc` and used by CI.

Install dependencies and the browser binaries before running tests:

```bash
npm ci
npx --no-install playwright install chromium firefox webkit
```

### Scripts

```bash
# start demo page with hot reload
npm run start

# build production bundle to /dist (and copy versioned files)
# requires a new widget version; existing versioned artifacts are immutable
npm run build

# lint & format
npm run lint
npm run lint:fix
npm run fmt

# Node tests (ts -> .tmp-tests -> node --test)
npm run test:node

# Browser tests (Chromium/Firefox/WebKit via Playwright)
npm run test:browsers

# Coverage (node tests, c8)
npm run coverage

# Manual release comparator (serve repository on port 4173)
npm run test:manual

# Repeatable Chromium performance benchmark
npm run benchmark:performance

# Inspect candidate artifacts
npm run release:artifacts

# Release flow
npm run release:version -- <version>
npm run build
npm run release:sync
npm run release:check
npm run release:verify
```

Build output:

```
dist/
  SimpleDigitalClockWidget.js      # main bundle
  latest.min.js                    # minified current bundle
  <version>.min.js                  # versioned copy from package.json
```

> The bundle is emitted in the “global” target context for browsers and self-registers the custom element.

---

## Manual Testing

For the ordinary development playground, use:

```bash
npm run start
```

For release comparison against immutable `dist/0.6.0.min.js`, run:

```bash
npm run test:manual
```

Then open:

```text
http://127.0.0.1:4173/manual-release-harness.html
```

The release harness loads the legacy and candidate bundles independently, compares legacy-mode geometry, exercises runtime toggles, and includes intentional invalid-attribute error checks.

The regular `src/index.html` playground is still available for interactive development.

---

## Project Structure

```
src/
  SimpleDigitalClockWidget.tsx  # the web component
  contrastColor.ts              # computes readable text color
  darkenColor.ts                # color utility for borders
  isDark.ts                     # prefers-color-scheme helper
  styles.css
  data.yaml                     # fonts allow-list
tests/                          # node & browser specs
```

Testing stack:

* **Node**: `node:test` + `assert`
* **Browsers**: `@web/test-runner` + Playwright (Chromium/Firefox/WebKit)
* **Coverage**: `c8`

The [CI workflow](.github/workflows/ci.yml) runs on Ubuntu 24.04 with Node.js 24 for pull requests and pushes to `main` and `dev`. It checks all three TypeScript configurations, lint, Node tests, release metadata/artifacts, an isolated production build, WordPress PHP/JavaScript syntax, preview parity, and all three browsers, including production-bundle iframe and delayed-font regressions. Dependency audit fails on moderate, high, or critical advisories; unresolved low findings remain visible. See the [historical tooling preparation record](docs/maintenance/release-readiness-2026-10-31.md) for the original correction, and the [local WordPress 1.1.5 report](docs/releases/1.1.5/README.md) for artifact identity and acceptance boundaries. Hosted validation for the new source is tracked on [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18), separately from local synchronization. The [29 October maintenance report](docs/maintenance/2026-10-29-repository-hygiene.md) remains a historical snapshot.

Run `node scripts/check-build.mjs` to build and minify in a temporary directory with the production CLI flags and require exact equality with the current versioned widget. It prints the output path and preserves tracked `dist/` files. PHP syntax checks use the runner's installed PHP version and do not replace WordPress compatibility or update/rollback acceptance.

---

## WordPress

The **Simple Digital Clock** WordPress plugin source in this repository is
**1.1.5**, published with the exact accepted server-r2 payload, with
the exact widget **0.8.1** bundled under
[`wordpress/simple-digital-clock/`](wordpress/simple-digital-clock/).
It requires **WordPress 6.3+ / PHP 7.0+**; `Tested up to` remains **7.1**.
The [1.1.5 report](docs/releases/1.1.5/README.md) binds the source to the existing
17-file r2 ZIP and separates its local acceptance from the [source verification](docs/releases/1.1.5/SYNCHRONIZATION.md)
and [final prepublication snapshot](docs/releases/1.1.5/PREPUBLICATION-2026-11-11.md).
The final package is a byte-identical copy of r2. Required hosted checks are
tracked for the current head of [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18).
WordPress.org publication is recorded separately from Git release operations.

The correction restores the tested server-rendered raw HTML, widget, template,
custom PHP shortcode and cached-fragment integrations. Runtime delivery follows observed
server HTML; clock-free pages receive no plugin JavaScript. The r14 Gutenberg,
legacy JSON, REST/KSES and i18n fixes remain. See the
[frontend asset contract](docs/WORDPRESS-ASSET-CONTRACT.md) for owned-layout CSS,
normal footer requirements and server cost. Compatibility is bounded: a first
clock created only by client JavaScript needs its own runtime integration, and
data already discarded by an old writer cannot be reconstructed automatically.

**The last verified public version is 1.1.5**, published in SVN r3797104 at
2026-11-11 21:17:24 UTC. Pinned trunk/tag exports and both official ZIPs match
all 17 accepted files; plugin information also reports 1.1.5. The
[publication record](docs/releases/1.1.5/PUBLICATION-2026-11-11.md) keeps file
delivery separate from update availability. At 21:20 UTC, twelve anonymous
update checks still described 1.1.4: installed 1.1.2 received a 1.1.4 offer,
while installed 1.1.4/1.1.5 received no offer. Target 1.1.5 offers were 0/8.
This is a dated distribution snapshot, not a global adoption claim or deadline.
The historical r14 publication and original r9/r14 acceptance remain unchanged.

See [`wordpress/README.md`](wordpress/README.md) for source provenance, licensing,
packaging and local testing. Widget builds and CDN deployments do not update the
plugin bundle automatically or publish a WordPress release.

Historical records remain separate:

* [WordPress 1.1.2 publication](docs/releases/1.1.2/PUBLICATION.md): SVN r3772502, tag `wordpress-v1.1.2`, original package/acceptance provenance. The later [readme-only r3772710 publication](docs/releases/1.1.2/README-PUBLICATION.md) is recorded independently.
* [Retained WordPress 1.1.3 candidate](docs/releases/1.1.3/README.md): unpublished, with widget 0.7.1.
* [Widget 0.8.1 CDN publication](docs/releases/0.8.1/PUBLICATION.md): public standalone delivery, independent of WordPress.org.

---

## FAQ

**Q:** Where does the clock get its time?
**A:** It reads the visitor's device clock and formats it for the selected time zone. It does not synchronize with a time server; an incorrect device clock affects the displayed time.

**Q:** Why both `background` and `background-color`?
**A:** `background` lets you supply any CSS (e.g. gradients). `background-color` is a solid color used for painting when `background` is not set — and always used for contrast/border heuristics.

**Q:** My locale uses 24-hour, but I want AM/PM.
**A:** Add the `period` attribute (no value) to force 12-hour. Use `period="false"` to force 24-hour anywhere.

**Q:** Can I use custom fonts?
**A:** Set `font-family`. If the family is on the internal allow-list, the widget auto-loads it from Google Fonts; otherwise it falls back to `monospace` to keep payload tiny.

---

## Contributing

Issues and PRs are welcome!
Please run lint and tests before submitting:

```bash
npm run lint && npm run test:node && npm run test:browsers
```

---

## License

The shared JavaScript widget is **MIT** © [dejurin](https://github.com/Timenow-zone); see [LICENSE](LICENSE).
The WordPress wrapper is **GPLv2 or later**; see its
[license](wordpress/simple-digital-clock/LICENSE). Bundled third-party JavaScript
retains its [MIT notices](wordpress/simple-digital-clock/THIRD-PARTY-NOTICES.txt).
Fixtures and font assets retain their accompanying licenses; see [NOTICE](NOTICE)
for repository scope.
