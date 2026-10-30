# Simple Digital Clock Widget

Lightweight, framework-agnostic web component (built with Preact) to display a digital clock with timezone and locale support.
Ships as a single JS file, easy to drop into any site (plain HTML, WordPress, React/Preact, etc).

<!-- SDCW_RELEASE_METADATA_START -->
* **Current version:** `0.8.0`
* **Tiny:** 12.1 KiB gzipped (`dist/0.8.0.min.js`; 35,922 bytes minified, 12,439 bytes gzip)
* **Artifact SHA-256:** `5661f6c054aad7c2f77f7ecd8912d6e41fca0c6079c8a4be498ab1847de939d0`
* **Gzip measurement:** level 9; Node `v26.8.2`; zlib `1.2.12`. Other encoders may produce different sizes.
<!-- SDCW_RELEASE_METADATA_END -->
* **Embeddable:** 1 custom element tag
* **Theme-aware:** auto light/dark, or force it
* **Timezone & locale aware:** uses `Intl.*` under the hood
* **Accessible:** semantic, keyboard focusable link

Widget **0.8.0** continues the Preact 11.1.0 migration and fixes ordinary AM/PM clock fitting and refitting after a Google Font loads. See the [regression and release record](docs/releases/0.8.0/README.md). The independently versioned WordPress 1.1.4 candidate bundles this exact artifact; the retained 1.1.3 ZIP keeps widget 0.7.1.

---

## Demo & Plugin

* **Live demo:** [https://simple-digital-clock-widget.yuri.ws/](https://simple-digital-clock-widget.yuri.ws/)
* **CodePen playground:** [https://codepen.io/dejurin/pen/01a025ef-f466-7534-acd0-77bc3a368a47](https://codepen.io/dejurin/pen/01a025ef-f466-7534-acd0-77bc3a368a47)
* **WordPress plugin:** [https://wordpress.org/plugins/simple-digital-clock/](https://wordpress.org/plugins/simple-digital-clock/)

---

## Installation

### Via `<script>` (no build tools)

Copy the file from `dist/` to your site and include it:

```html
<script type="module" src="/dist/SimpleDigitalClockWidget.js"></script>
```

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

### With npm (build tools)

```bash
npm i simple-digital-clock-widget
```

Then import it **once** at app start:

```ts
import "simple-digital-clock-widget/dist/SimpleDigitalClockWidget.js";
// or if bundling TS/Preact directly:
// import "./src/SimpleDigitalClockWidget";
```

Use the tag in your HTML/JSX as shown above.

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
| `date`             | `boolean`                                                                                     | `false`          | Show the date line below the time. Clicking it toggles **date** ↔ **timezone name**.                                                        |
| `caption`          | `string`                                                                                      | —                | Optional label displayed above the time.                                                                                                    |
| `align`            | `"left" \| "center" \| "right"`                                                               | `"center"`       | Text alignment inside the widget.                                                                                                           |
| `width`            | `number` (px)                                                                                 | auto (min 80)    | Fixed width of the widget box.                                                                                                              |
| `rounded`          | `number` (rem)                                                                                | —                | Corner radius in rem, e.g. `0.25`.                                                                                                          |
| `shadow`           | `"shadow" \| "shadow-sm" \| "shadow-md" \| "shadow-lg" \| "shadow-xl" \| "shadow-2xl"`        | —                | Box shadow presets.                                                                                                                         |
| `border`           | `boolean`                                                                                     | `false`          | Adds a 1px border. Color is auto-darkened from background.                                                                                  |
| `background`       | `string` (CSS)                                                                                | —                | Any CSS background (e.g. gradient).                                                                                                         |
| `background-color` | `string` (color)                                                                              | auto (theme)     | Solid background color (e.g. `#00416A`, `rgb(255,0,0)`). If `background` is set, this is ignored for painting but used for contrast/border. |
| `font-family`      | `string`                                                                                      | monospace        | Family name. If the value is on the internal allow-list, Google Fonts is auto-loaded.                                                       |
| `prefers`          | `"" \| "auto" \| "system" \| "light" \| "dark"`                                               | `system`         | Theme source for background when `background-color` is not provided.                                                                        |

**Boolean attributes:**

* Present without value (`<tag second>`) ⇒ `true`.
* Explicit `"false"`, `"0"`, `"no"` ⇒ `false`.
* Omitted ⇒ “not provided”.

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

* Node.js 22+ required; Node.js 24 LTS recommended and used by CI.

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

The [CI workflow](.github/workflows/ci.yml) runs on Ubuntu 24.04 with Node.js 24 for pull requests and pushes to `main`. It checks all three TypeScript configurations, lint, Node tests, release metadata/artifacts, an isolated production build, WordPress PHP/JavaScript syntax, and all three browsers, including production-bundle iframe and delayed-font regressions. Dependency audit fails on moderate, high, or critical advisories; unresolved low findings remain visible. See the [maintenance record](docs/maintenance/2026-10-29-repository-hygiene.md) for the current tooling exception.

Run `node scripts/check-build.mjs` for a build and minification smoke test in a temporary directory; it prints the output path and preserves tracked `dist/` files. PHP syntax checks use the runner's installed PHP version and do not replace WordPress compatibility or update/rollback acceptance.

---

## WordPress

This widget powers the **Simple Digital Clock** WordPress plugin.
The plugin source is maintained separately in [`wordpress/simple-digital-clock/`](wordpress/simple-digital-clock/).
See [`wordpress/README.md`](wordpress/README.md) for provenance, licensing, packaging, and local testing.
Widget and WordPress plugin versions are independent; the widget build does not update the plugin bundle automatically.

The WordPress plugin **1.1.2** is published on WordPress.org (SVN r3772502; Git tag `wordpress-v1.1.2`). Its fixes, upgrade/resave/rollback checks and WP 7.2 Beta 2 coverage are documented in the [1.1.2 patch report](docs/patches/1.1.2/README.md). The [publication report](docs/releases/1.1.2/PUBLICATION.md) and [release manifest](docs/releases/1.1.2/manifest.json) distinguish the accepted local ZIP from the public package. That published package bundles widget **0.7.0**.

The local **1.1.3 candidate** bundles widget **0.7.1** and fixes invalid numeric caption references and automatic container sizing. See the [candidate acceptance and package manifest](docs/releases/1.1.3/README.md). The WordPress candidate remains unpublished. The production demo/CDN now uses widget **0.8.0**, with earlier versioned URLs retained; see the [CDN publication record](docs/releases/0.8.0/PUBLICATION.md). CDN delivery does not publish an npm package or Git tag.

The new **1.1.4 candidate** bundles the exact widget **0.8.0**, retains the 1.1.3 PHP fixes and preserves the block serializer. See the [1.1.4 package and upgrade acceptance](docs/releases/1.1.4/README.md). It is not published; the 1.1.3 ZIP and historical acceptance records remain unchanged.

The later readme-only publication r3772710 is recorded [separately](docs/releases/1.1.2/README-PUBLICATION.md); the original release manifest and tag remain historical records.

If you’re using WordPress, install the plugin from the directory:
[https://wordpress.org/plugins/simple-digital-clock/](https://wordpress.org/plugins/simple-digital-clock/)

---

## FAQ

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

**MIT** © [dejurin](https://github.com/Timenow-zone)
