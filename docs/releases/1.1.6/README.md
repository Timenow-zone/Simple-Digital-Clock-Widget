# WordPress 1.1.6 release preparation

Status: **RC3 TECHNICAL ACCEPTANCE PASS; FINAL PR CHECKS AND CDN DELIVERY PENDING**.
Implementation and independent native/data acceptance are complete.
The [final acceptance snapshot](FINAL-ACCEPTANCE-RC3.md) and
[42-gate evidence index](acceptance-rc3.json) separate fresh RC3 and inherited RC2
results. Required checks still bind to the final containing PR commit. This is not `READY_FOR_WP_PUBLICATION`.
WordPress.org publication requires a separate explicit owner command.

## Selected artifact

| Item | Identity |
| --- | --- |
| Candidate | [RC3](RC3.md), internal plugin version 1.1.6 |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc3.zip` |
| SHA-256 | `eb85f4f0d526b32288a1180a14241150eb3a3ebd250c6fe95b6e19bf9b3785c4` |
| Layout | 72,320 bytes; 17 regular files |
| Manifest | [Frozen RC3](manifest-rc3.json); [current pointer](manifest.json) |
| Executable source | `2c9f8aacabe2b5b3b69bb224dcff32e63c3a851b` |
| Shared widget | 0.8.2; 36,033 bytes; SHA-256 `47126e2f4515b1c88992a9d217e3a97838837a34d8a42011379bbce6f151f506` |

The readme additionally records the source commit and approved compatibility
policy. Exact ZIP/source verification includes all 17 files. The final containing
commit and latest hosted checks are separate from the executable source identity.

## Resulting behavior

Native clock renders and the existing public helper use ordinary Core enqueue.
An external bootstrap and inert configuration support raw/client-inserted clocks.
The shared 0.8.2 lightweight host also supports the original first-clock
`whenDefined()` and closed-shadow integrations without changing their code.
Default bundled pages with no use signal make zero main-runtime requests;
bootstrap/configuration bytes and a shell definition remain. No full-page PHP
buffer, waiting document observer, polling or browser API replacement is used.

Opaque runtime URL overrides load eagerly, including on empty pages, to preserve
legacy runtime compatibility. The owner explicitly approved this bounded
[exception](OVERRIDE-POLICY.md) on 2026-11-12. Attribute-only nonce/SRI filters
that retain the default ID/source keep conditional delivery. Core ownership,
dependencies, before/after data and policy failures remain observable.
Editor content and native legacy preview iframes receive their own assets.
The block schema, editor script, KSES rules and saved markup remain unchanged.

The [asset contract](../../WORDPRESS-ASSET-CONTRACT.md), [implementation plan](REMEDIATION-PLAN.md)
and [42-gate specification](ACCEPTANCE-MATRIX.md) define scope and acceptance.
RC3 changes only bootstrap, assets PHP and readme relative to RC2. Results for the
other 14 identical files may be inherited only with that scope stated. Unchanged
RC2 results are never counted as fresh RC3 executions.

## Verification and release boundaries

Exact-RC3 package verification passes: deterministic ZIP/full allowlist,
minimum/current PHP and JS syntax, fresh POT parity, exact runtime/bootstrap
reproduction and 167 asset assertions. Prepared source passed 96 Linux loader
runner tests and independent 84-case actual-Core override checks. Installed Plugin Check (29 static + 5 runtime checks), native Core probes,
frontend/editors, direct updates/rollback, cache, multisite and independent final
review pass within their recorded scopes. All owned labs are stopped; data and
sealed evidence are retained.

[Draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
is stacked on [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18).
Both **Repository checks** and **Browser tests** must pass on its final HEAD;
older successful runs do not certify RC3. No merge or branch-protection bypass
has occurred. The [shared runtime release](../0.8.2/README.md) requires separately
authorized production CDN delivery and exact public SHA/cache/smoke verification.
The WordPress package uses its own bundled runtime; its successful tests do not
prove CDN delivery. No owner-site installation or WordPress publication occurred.

Raw evidence and ZIPs live under ignored `.local/` paths in this workspace, not
in a remote checkout. Final release evidence must retain the exact archive.

## Retained candidates and historical evidence

- [RC2](RC2.md) is frozen and **NO-GO** after independent review reproduced the
  configured old-runtime conflict. Its [manifest](manifest-rc2.json), ZIP and
  original reports remain unchanged; the approved RC3 policy resolves that case.
- [RC1](RC1.md) is unpublished and **NO-GO** after independent acceptance found
  native legacy-preview, external-only CSP and hidden-integration regressions.
  Its [manifest](manifest-rc1.json), archive and 2,566 sealed evidence files remain.
- [Browser-r3 acceptance](FINAL-ACCEPTANCE-2026-11-12.md) and its
  [manifest](manifest-browser-r3.json) record earlier scoped results. Subsequent
  independent findings supersede those results for full release disposition.
  Historical PASS records do not override a later NO-GO or certify RC3.

## Exact verification and rollback

```sh
set -euo pipefail
python3 tools/wordpress-lab/verify-package.py \
  --zip .local/packages/simple-digital-clock-1.1.6-rc3.zip
node --test tests/wordpress-assets.test.mjs tests/wordpress-package.test.mjs \
  tests/wordpress-i18n.test.mjs tests/wordpress-rest-metadata.test.mjs \
  tests/wordpress-serialization.test.mjs
node scripts/build-wordpress-loader.mjs --check
npm run release:check
npm run release:verify
```

The accepted local 1.1.5 rollback archive remains
`.local/packages/simple-digital-clock-1.1.5-final.zip`, SHA-256
`2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
The official 1.1.5 ZIP has a different container hash and identical installed
files; the native lab records that provenance explicitly. Rollback changes plugin
files without restoring the database. A future installation or rollback requires
purging full-page/optimizer caches and checking a clock page and an empty page.
