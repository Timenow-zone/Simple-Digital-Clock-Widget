# Widget 0.8.2 production delivery proposal

Status: **PREVIEW VERIFIED; PRODUCTION AUTHORIZATION PENDING**.
No merge, production traffic change, owner-site installation or WordPress.org
publication has been performed. This proposal promotes an existing version built
by the configured Cloudflare workflow; it does not require merging PR #18 or #19.
Required checks must also pass on the final reviewed PR #19 HEAD before delivery.

## Concrete prepared version

- Source: `eb23578965312679df4450522c7381236676c708`; all 17 RC3 package files
  match this containing commit. Later acceptance/harness documentation does not
  alter the runtime or this generated site.
- Cloudflare build: `b9ebc188-1de6-44fe-9a86-014711c891ca`.
- Cloudflare version: `f7c0276a-9f5f-414f-bdca-0c1420c9292c`.
- [Exact preview](https://f7c0276a-simple-digital-clock-widget.gkhelloworld.workers.dev/).
- Runtime: `0.8.2`, 36,033 bytes, SHA-256
  `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506`.
- [Source CI](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/43182749149):
  Repository checks and Browser tests passed. Final-head checks remain mandatory.

The preview returns HTTP 200, correct version/source references and immutable
runtime cache headers. All nine versioned assets match local bytes, including
all eight previous immutable artifacts. Three Linux browser workflows passed:
11 visible ticking clocks, builder settings/escaping/reset and mobile layout.
Raw receipts are under `.local/remediation-116-rc2/cdn-preview-resolved/`.
The initial DNS failure and Python-client HTTP 403 are retained separately;
successful curl/browser fetches are the accepted observations. No CDN setting
or security policy was changed to obtain those results.

## Preserved production rollback

Read-only production preflight on 2026-11-12 found widget 0.8.1 with SHA-256
`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
The latest listed production deployment is
`862b30d4-c476-46c4-a73b-3e2830532bd6`, using Worker version
`3d96bda4-b4e8-4d5f-a8e2-06302d3ee7a6` at 100 percent.
Its bytes, headers, metadata and deployment list are preserved under
`.local/remediation-116-rc2/cdn-before/`. Recheck for intervening deployments
immediately before an authorized change.

## Authorized delivery procedure

After the owner explicitly authorizes production CDN delivery and final PR
checks are green, promote the exact verified Cloudflare version above to
100 percent. Do not rebuild or substitute another version silently. Record the
new deployment ID, source, version and artifact hash. Verify the public 0.8.2 URL,
`/version.json`, HTML references/source link, cache headers, previous versioned
assets and a clock using the public asset. A preview result is not a production
result.

If verification fails, restore the preserved production version at 100 percent
and verify the previous references and bytes. Never replace published immutable
asset bytes. Keep WordPress.org publication deferred until a separate explicit
owner instruction, even after successful CDN delivery.
