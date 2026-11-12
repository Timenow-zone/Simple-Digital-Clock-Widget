# WordPress 1.1.6 RC4 candidate

Date: 2026-11-12, Europe/Kyiv. Status: **FROZEN; NO-GO FOR FIREFOX ALIGNMENT; RELEASE INCOMPLETE**.
The [later multi-instance review](../0.8.3/MULTI-INSTANCE-REVIEW.md) exposes a
pre-existing alignment defect that blocks the full compatibility contract.
This candidate bundles the shared [widget 0.8.3 correction](../0.8.3/README.md).
Neither candidate preparation nor historical passing results authorize release.

## Frozen identity

- Archive: `.local/packages/simple-digital-clock-1.1.6-rc4.zip`.
- SHA-256: `20ba3c0ebdaa5ff9f99639d59a004f471767a7f20e5e13518b1864403b68c1ea`.
- Size/layout: 72,469 bytes; 17 regular files under `simple-digital-clock/`.
- Frozen manifest: [manifest-rc4.json](manifest-rc4.json).
- Executable source: `85b0943789e174dea84ea0993eb5777e98138213`.
- Shared runtime: 0.8.3, 36,245 bytes; SHA-256
  `c877005699bdb81df6a9280f3367981947db8575a1f00c6e234edb8f1e400b6b`.

The executable commit matches 16 package files. The readme was finalized after
that commit to record its exact source link. Containing commit
`1a1e7f824913388587841c4c7e002f31800a8cee` was verified against all 17 files. The frozen manifest records this provenance and
its initial `NOT_RUN` acceptance snapshot honestly; final results belong in a
separate acceptance report.

## Delta and required verification

Exactly four package files differ from frozen RC3: the main runtime, generated
bootstrap, assets PHP and readme. The other 13 files, including editor code,
KSES, translations and notices, are unchanged. Plugin version remains 1.1.6;
the widget version is independent. RC3 and every prior versioned bundle remain
unchanged.

Errors in individual clocks no longer abort initialization of healthy siblings
or leave the installed renderer permanently unready. The same host code is
present in the standalone bundle and WordPress bootstrap. Both assets and the
PHP URL version must agree; stale cached bootstrap/runtime responses cannot be
counted as execution of RC4.

The [mandatory main-script gate](../../WORDPRESS-ASSET-CONTRACT.md#mandatory-main-script-compatibility-gate)
requires actual Chrome, Firefox and WebKit execution of the exact artifact in
ordinary HTML and installed WordPress. Native frontend/editor/preview,
conditional loading, approved override, CSP and cache behavior must retain
their contracts. The [approved eager-override exception](OVERRIDE-POLICY.md)
is unchanged. Fresh executions and any evidence inherited for identical files
must be identified separately.

The earlier [scoped report](FINAL-ACCEPTANCE-RC4.md) and
[JSON evidence index](acceptance-rc4.json) record all six mandatory browser cells,
24 standalone cases, 570 unique native rows and separate independent reviews.
Counts, historical scope, preserved failed attempts and pending release gates
are explicit; a package PASS alone is not browser acceptance.
No merge, production deployment, owner-site installation or WordPress.org
publication has occurred. The withdrawn 0.8.2 CDN proposal remains withdrawn.
