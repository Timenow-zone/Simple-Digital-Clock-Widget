# Widget 0.7.1: production demo and CDN

Widget **0.7.1** was published to [the production demo](https://simple-digital-clock-widget.yuri.ws/) on **2026-10-30**. This delivery does not merge PR #9, publish the WordPress 1.1.3 candidate, publish an npm package, or create a Git tag.

## Accepted artifact and deployment

- Widget/source commit: `d3cfbbe1963b08cae24f1d865a2bd1964c03bc39`.
- Public metadata: [version.json](https://simple-digital-clock-widget.yuri.ws/version.json).
- Public script: [simple-digital-clock-widget-0.7.1.min.js](https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.7.1.min.js).
- Script size: **34,042 bytes**.
- Script SHA-256: `affc4417099de256553267060e056e296023781ec8a1ef1382370143de080bb6`.
- Cloudflare Worker: `simple-digital-clock-widget`.
- Final Worker version: `2823c0cc-de27-46c8-89ff-46b4f3062214`, serving **100%** of production traffic.
- The [machine-readable record](cdn-publication.json) includes the deployment ID, UTC verification time, file hashes, cache checks, and browser results.

The required Repository checks and Browser tests passed on the accepted source commit. The existing build was verified with `npm run release:check` and `npm run release:verify`; its bytes match `dist/0.7.1.min.js`, `dist/latest.min.js`, and the local WordPress bundle. `npm run site:build` generated the production site without rebuilding or changing the accepted JavaScript.

The deployment adds two explicit packaging adjustments to the generated site:

1. Preserve the already public 0.7.0 script and its immutable cache headers. Its SHA-256 remains `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`. Existing embeds using that URL continue to work.
2. Point the header's version source link at the accepted commit because `v0.7.1` has no published Git tag. The label remains 0.7.1.

At publication, the site builder emitted only the selected widget version, so the deploy manifest records the assembled files and both manual adjustments. The merge-preparation follow-up now copies all versioned `dist/` bundles, retains their immutable cache headers, and resolves the source link from Git HEAD. A regression verifies legacy bytes and headers survive the build and no unpublished tag is required. These packaging changes do not alter widget bytes or the WordPress ZIP.

## Public verification

The final production domain returned HTTP 200 for the page, metadata, new script, and retained 0.7.0 script. The page loads 0.7.1, the metadata identifies 0.7.1 and the expected script path, and both downloaded and browser-loaded JavaScript match the accepted SHA-256 byte-for-byte.

The page and `/version.json` use `Cache-Control: public, max-age=0, must-revalidate`. Both versioned scripts use `max-age=31536000, immutable` and `X-Content-Type-Options: nosniff`.

Fresh browser contexts in **Chromium and WebKit** passed on the final public domain:

- All **11 demo clocks per browser** rendered version 0.7.1; the builder clock advanced without reloading.
- Timezone, locale, literal caption, hundredths, widths 180/420/240, reset, preset selection, and generated embed version worked.
- Desktop 1440 px and mobile 390 px views rendered; screenshots were retained.
- **Five visits per engine**, with two real HTTP iframe documents per visit loading the production CDN script, passed parent-width changes, viewport resizing, and hidden-to-visible transitions. Page and child-window errors were checked without filtering; none occurred.

The first request immediately after the final switch still received the previous HTML. A subsequent request to the ordinary URL confirmed the exact source link and all final checks; no cache purge or query-string cache bypass was needed. This is a point-in-time check from the available network location and two browser engines, not a global propagation or external font-delivery guarantee. Firefox remains covered by the accepted source CI, without a fresh public-domain Firefox run.

## Rollback and retained evidence

Before deployment, the previous production deployment was `bdd267c2-8ae8-4c10-9dec-a419401e704a`, using Worker version `a0c9cc26-b606-4dc3-acf2-eceef078a8de` at 100%. Its HTML, metadata, widget bytes, and Cloudflare version details were retained. Rollback was prepared but not executed:

```bash
set -euo pipefail
npx --no-install wrangler versions deploy a0c9cc26-b606-4dc3-acf2-eceef078a8de@100 \
  --yes --message 'Roll back the widget 0.7.1 CDN release'
```

Raw snapshots, generated assets, manifests, HTTP headers, browser reports/screenshots, and Wrangler logs are under ignored `.local/cdn-071-20261030/`. The intermediate 0.7.1 deployment and the final source-link adjustment remain separately recorded. Plugin files and its accepted ZIP were unchanged by this publication.
