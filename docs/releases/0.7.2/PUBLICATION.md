# Widget 0.7.2: production CDN publication

On **2026-10-30**, the tested Cloudflare build from PR #10 was promoted to 100% production traffic. The [live demo](https://simple-digital-clock-widget.yuri.ws/) and its generated embed code now use widget **0.7.2** with Preact **11.1.0**. preact-custom-element 4.6.0 and clsx 2.1.1 remain their latest stable registry versions at this observation.

## Identity and gates

- Source commit: `a0f62c91734b8d4030f113c4e28672f00262dabc`.
- Required CI: [run 41031135089](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41031135089), all checks successful.
- Browser CI: **36/36 tests in Chromium, Firefox and WebKit**, followed by three successful production iframe tests, without skips or filtered errors.
- Cloudflare build: `f54d7d52-6d9f-480a-bbbf-579fd07e4421`.
- Cloudflare version: `0512f780-f937-4384-b84c-50c8957ea1a5`.
- Public script: [simple-digital-clock-widget-0.7.2.min.js](https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.7.2.min.js).
- Script SHA-256: `9068d236e2dcff33a01d1aac5de9b13eb9cf2c69837f4ed3b3f7a3089721a0af`, **34,460 bytes**.
- [Public metadata](https://simple-digital-clock-widget.yuri.ws/version.json) and [machine-readable delivery record](publication.json).

The existing CI version was promoted after checking its real preview; no second widget build or manual artifact overlay was introduced. Production metadata records the encoder used by the Cloudflare build, which can differ from the local gzip measurement in the [acceptance report](README.md).

## Public checks

The ordinary production URL, metadata and all **six versioned script URLs** returned HTTP 200. Each script matched its corresponding tracked `dist/<version>.min.js` byte-for-byte, including all five predecessors. The page and metadata require revalidation; versioned scripts retain one-year immutable caching and `nosniff`. The source link points to the actual accepted commit.

Fresh Chromium and WebKit contexts each rendered all **11 clocks**, observed the builder clock ticking, exercised timezone, locale, literal caption, hundredths, widths, reset, preset selection and 0.7.2 embed generation, and checked desktop/mobile views. Five visits per engine used paired real HTTP iframe documents loading the public CDN script; parent/viewport resizing and hidden-to-visible transitions passed with no page or child-window errors. The same checks first passed on the exact Cloudflare preview.

These are point-in-time checks from the available network location and two browser engines. The separate old/new comparison covers 96 native-monospace cases per engine. Older browser minima, arbitrary host themes and remote font swaps are not certified by this delivery.

## Boundaries and rollback

PR #10 is **open**, with no merge performed. No npm package or Git tag was published. All 15 WordPress 1.1.3 plugin files and its accepted ZIP SHA-256 `1f42bd43152501499212a06a19286fbb562e5e51338a87c0a533200b31b344b0` remain unchanged, including the widget 0.7.1 bundle. Its separately authorized SVN publication still requires local user authentication.

The previous production deployment was `93f11e8f-b062-40f9-940e-00fc24855e94`, with Worker version `2192eacb-1ea4-4d0f-ba14-fd36c728718d` serving 0.7.1 at 100%. Rollback is prepared but has not been executed:

```bash
set -euo pipefail
npx --no-install wrangler versions deploy 2192eacb-1ea4-4d0f-ba14-fd36c728718d@100 \
  --yes --message 'Roll back widget 0.7.2 CDN delivery'
```

Raw HTTP and browser results, screenshots, deployment metadata and the predecessor inventory are retained under ignored `.local/widget-072-20261030/`. Historical release reports and published widget bytes are preserved.
