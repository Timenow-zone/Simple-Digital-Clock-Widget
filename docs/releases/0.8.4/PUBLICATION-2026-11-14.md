# Widget 0.8.4 production delivery

Status: **DELIVERED AND VERIFIED**. Verification completed on
2026-11-14 at 18:13:55 UTC. This records the already authorized delivery;
the later documentation PR performs no deployment or Cloudflare change.
WordPress.org 1.1.6 publication is a separate, pending operation.

## Source and delivery identity

| Item | Recorded value |
| --- | --- |
| Production PR | [#20](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/20) |
| Accepted PR HEAD | `9cfbcdf9a6c8df91416935acb9631f3e6979ad5f` |
| Main merge | `ffb95e60a1db82b6535894db90f19da8be978564` |
| Identical accepted/main tree | `679af20401e493e759a5552cbe12ee312c2bed11` |
| Required main CI | [43624328841](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43624328841), Repository checks and Browser tests successful |
| Cloudflare build | `4e9e7fa6-9643-4bae-99c0-0e892dcb9b21` |
| Production deployment | `e81c4cd0-c867-46f1-bde2-16a6e6d28bbd` |
| Active version, 100% traffic | `a61e73d5-9492-4cb8-9228-d90c051d5dc9` |
| Main artifact | `dist/0.8.4.min.js`, 36,430 bytes |
| SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |

The [production JavaScript URL](https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-0.8.4.min.js)
returned HTTP 200 with the exact accepted bytes. All eleven numbered assets,
including every predecessor, returned HTTP 200 with their accepted hashes;
all eleven conditional requests returned 304. Versioned JavaScript retained
the expected MIME type, `nosniff` and immutable one-year caching. The demo and
`/version.json` selected 0.8.4 with revalidation semantics.

Local and hosted gzip sizes differ by encoder version; the minified payload
is byte-identical. The public version metadata records its encoder and size.
Cloudflare analytics injection in the public HTML is recorded separately from
the authored Worker asset. Non-production builds remained disabled.

## Exact-artifact browser verification

| Browser | Actual version | Native observations |
| --- | --- | --- |
| Google Chrome | 157.0.8103.51, macOS arm64 | 24/24 |
| Firefox | 153.0, Linux arm64 | 24/24 |
| WebKit | 26.5, macOS arm64 | 24/24 |

The 72 observations cover twelve standalone HTML CDN states, twenty-four
installed WordPress CDN states and thirty-six WordPress bundled-runtime states.
Both WordPress 6.3.14/PHP 7.0.33 and 7.1.4/PHP 8.3.35 contain exact RC18.
Single/four-clock pages cover cold and reload states; bundled WordPress checks
also cover empty pages. Independently configured UTC, New York, Tokyo and
Kolkata clocks retain their captions, widths and ticking behavior. Runtime
request counts are checked per document. Three additional real production
homepage checks pass. There are no page errors or failed requests in the
reported native matrix; the local favicon diagnostic below remains explicit.

This satisfies the mandatory standalone HTML and installed WordPress gate in
actual Google Chrome, Firefox and WebKit. It is not a new complete admin/update
acceptance or a native Safari result. It does not certify every customer setup
or geography.

## Retained diagnostics and rollback

- Default Python User-Agent requests receive Cloudflare error 1010 on old and
  new paths. A descriptive application User-Agent and all three real browsers
  pass. No Cloudflare security setting was changed.
- The auxiliary version-preview hostname failed local DNS resolution; public
  DNS and a verified-TLS control using the returned address passed.
- A local HTML fixture favicon returned 404 and appeared twice in cumulative
  console capture. A matching favicon control identifies this fixture error;
  a universally empty console is not claimed.

The previously uploaded, non-active compatibility rollback version
`1e09224b-ff49-4cae-a5c6-78bf6490c22c` was available at delivery. It selects
0.8.1 defaults while retaining all eleven immutable URLs, including 0.8.4.
It was not activated. Refresh availability and authorization before a future
rollback; this historical receipt is not current permission to deploy.
Cloudflare rollback cannot replace an installed WordPress plugin or repair
saved content. The [WordPress prepublication record](../1.1.6/PREPUBLICATION-2026-11-14.md)
documents the separate package recovery boundary.

## Evidence

Ignored local evidence directory:
`.local/cdn-0.8.4-release-20261114/`.

- `INVENTORY.json`: 63 files, 3,286,060 bytes; SHA-256
  `99058d2cb43fd614ac669886783c78a1e3cc213c6108cc7f86bad45f4faaf899`.
- `RELEASE.json`: SHA-256
  `ea7b7056ed063c0cf282c52bbd0c015845e64c93a502b1b0df89d11231e230bd`.
- `REPORT.md`: SHA-256
  `887e3e219bb69dbd3650768a1dd3ef83271dcc4ccc1381248413f1e8dfd427d7`.

The subsequent WordPress prepublication audit rehashed this evidence and
reverified the public 0.8.4 and 0.8.1 payloads. Historical preparation reports
remain unchanged; this additive record supersedes their pending-delivery status.
