# Simple Digital Clock Widget

Lightweight, framework-agnostic web component (built with Preact) to display a digital clock with timezone and locale support.
Ships as a single JS file, easy to drop into any site (plain HTML, WordPress, React/Preact, etc).

<!-- SDCW_RELEASE_METADATA_START -->
* **Current version:** `0.7.0`
* **Tiny:** 11.2 KiB gzipped (`dist/0.7.0.min.js`; 32,649 bytes minified, 11,422 bytes gzip)
<!-- SDCW_RELEASE_METADATA_END -->
* **Embeddable:** 1 custom element tag
* **Theme-aware:** auto light/dark, or force it
* **Timezone & locale aware:** uses `Intl.*` under the hood
* **Accessible:** semantic, keyboard focusable link

---

## Demo & Plugin

* **Live demo:** [https://simple-digital-clock-widget.yuri.ws/](https://simple-digital-clock-widget.yuri.ws/)
* **CodePen playground:** [https://codepen.io/pen?template=EaWYKWO](https://codepen.io/pen?template=EaWYKWO)
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

* Node 18+ recommended

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

---

## WordPress

This widget powers the **Simple Digital Clock** WordPress plugin.
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
