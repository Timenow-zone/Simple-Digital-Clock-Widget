# WordPress 1.1.4 candidate: explicit minimum requirements

Status: **candidate accepted; Core minimum-version checks, focused upgrades and source CI passed; not published**. Plugin version remains 1.1.4 and the bundled widget remains the already published 0.8.1. This preparation does not merge a PR, publish to WordPress.org or change production CDN delivery.

## Exact new package

- ZIP: `.local/packages/simple-digital-clock-1.1.4-requirements-candidate.zip`, **15 installable files**.
- ZIP SHA-256: `fedc54bc0600db1236270733724b108a41919f398008b6ee902eeee4ac17ed00`.
- [Current fifteen-file manifest](manifest.json) and [revision preflight](preflight-evidence.json).
- Widget: 0.8.1, 36,009 bytes, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`. It remains identical to `dist/0.8.1.min.js` and the accepted public CDN artifact. Runtime source commit remains `b44f944b60babf45bf266e73ba12f7eba53cfef2`.

Only `widget_init.php` differs from the accepted pre-requirement package: two lines in its existing PHP comment declare `Requires at least: 6.3` and `Requires PHP: 7.0`. All fourteen other files, including the readme/changelog, block serializer, KSES, POT and JavaScript, are byte-identical. The executable PHP body, dependencies and saved-block schema are unchanged. Readme values and both header requirements agree; no artificial version bump or runtime rebuild is needed.

The previous accepted archive remains `.local/packages/simple-digital-clock-1.1.4-widget-0.8.1-candidate.zip`, SHA-256 `5963f94742828d8d91de77bf58d13a630de8d712d4e3af18709055de777d6088`. Its [manifest](manifest-before-requirements.json), [acceptance](acceptance-before-requirements.json) and [preflight](preflight-before-requirements.json) are preserved separately. The earlier 0.8.0 candidate and frozen 1.1.3 archive also remain unchanged. A repacked archive must not inherit an old exact-ZIP result by relabeling its hash.

## Why the header change is necessary

The readme already declares WordPress 6.3 and PHP 7.0, but the earlier main PHP header left both fields empty. Core ZIP installation and activation read these fields from the main PHP file and accept empty requirements; catalogue API metadata is a separate source. The new declarations let Core reject an incompatible target before installation or activation.

A permanent package guard requires nonempty numeric requirements in both PHP and readme and exact parity. It fails against the previous missing-header state. Existing identity/version guards continue to check all files, the independent widget version, source reference and script cache version. [Core header documentation](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/) and [Core requirement validation](https://developer.wordpress.org/reference/functions/validate_plugin_requirements/) describe the enforced fields.

## Current revision acceptance

The [minimum-version evidence](requirements-evidence.json) records three passing permanent package guards and six isolated negative controls: each missing field, each README mismatch and each nonnumeric value is rejected. The exact new ZIP is also checked with unchanged retained Core 7.1.3 header-parser, ZIP-check and activation-requirement function bodies. Supported minima pass; WordPress 6.2.9, PHP 5.6.40 and combined incompatibility return the corresponding Core errors. The old blank-header ZIP accepts unsupported inputs despite its readme declarations, reproducing the defect.

Those negative version decisions are controlled logic probes: WordPress uses Core's supported test-version override and PHP uses an isolated namespace constant. The actual interpreter is PHP 8.5.10, not PHP 5.6. Filesystem mapping, translations, filters and the no-plugin-dependency boundary use documented narrow doubles; this is not a complete WordPress activation/bootstrap. Separate real minimum/current Core updates supply the runtime acceptance below.

The [focused upgrade evidence](requirements-upgrade-evidence.json) records the completed real cycle for this exact new ZIP:

| Actual environment | Core 1.1.2 upgrade | Physical rollback and Core reupdate | Installed Core minimum checks |
| --- | --- | --- | --- |
| WordPress 6.3.2 / PHP 7.0.33 | Passed | Passed | WordPress 6.3 / PHP 7.0; compatible |
| WordPress 7.1.3 / PHP 8.3.35 | Passed | Passed | WordPress 6.3 / PHP 7.0; compatible |

Both initial Core HTTP AJAX upgrades and reupdates preserved complete post rows and critical options; all fifteen installed file hashes matched. Actual installed Core header parsing and requirement validation passed on both stacks after each update.

Across Chromium/WebKit and the two sites, each baseline/updated/resave/rollback/final stage passed **19,588 native block checks over four pairs**. There were **24 visible preservation saves**, **12 Caption/Width field saves**, four ticking final clocks and eight frontend/editor HTTP contexts verifying exact 0.8.1 bytes/cache version. All-frame capture recorded zero unexpected page/iframe/ResizeObserver errors. Caption/width frontend checks used the logged-in role context and are not claimed as new anonymous coverage.

One original baseline authentication/navigation attempt failed before installing this candidate. A single bounded fresh-context read-only retry passed its 4,897 checks; the other successful groups were not repeated. Concurrent session-token changes are suspected, not causally proven. A normal later iframe navigation used an existing bounded frame reacquisition with no runtime error; it was not a failed save.

[Source CI run 41093506356](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/41093506356) passed Repository checks, Browser tests and the Cloudflare preview build. The final documentation commit must also pass the required PR checks; its final result is retained privately and visible on the PR. No merge or publication is implied by those checks.

The focused cycle reuses only disposable fixture databases, with physical predecessor file restoration and no database resets. It checks actual Core HTTP AJAX updates, exact installed bytes/headers, post rows/options, editor validity, caption/width saves, live clocks and rollback readers in Chromium/WebKit. All four own test services are stopped, both site ports are closed and evidence/data are retained; the other nine project sites remained stopped. Public WordPress.org update offers are not supplied by this local package test.

## Preserved runtime acceptance

The [previous complete report at the accepted main merge](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/blob/bf6c4e6afc28236b2191a97f53046f295107a0d1/docs/releases/1.1.4/README.md), [Docker evidence](docker-evidence.json), [native evidence](native-runtime-evidence.json) and [original acceptance](acceptance-before-requirements.json) explicitly belong to archive `5963f947...6088`. They are not presented as a fresh full-matrix run of the new archive.

That historical cycle covered eleven Docker sites and one fresh native Local-runtime site, direct 1.1.2 upgrades in six environments, four file rollbacks/reupdates, 216 visible preservation saves and nine caption/width saves. Both visual defects were closed with immutable 0.8.0 RED controls and exact 0.8.1 GREEN checks. The unchanged widget/block/KSES bytes preserve that runtime identity; this revision adds focused package and Core requirement checks instead of repeating the large visual/entity matrix. Retained harness retries and scope limits remain in the original reports.

## CDN state, publication boundaries and rollback

Widget 0.8.1 was already [published and verified](../0.8.1/PUBLICATION.md) after PR #11 merged. Production deployment `e6229332-a27a-4595-8cf4-3a6d63a43f7e` uses Worker version `49773ac2-fd37-43b8-93fa-a2fa1bc879f0` at 100% traffic. This header/documentation revision does not rebuild, replace or redeploy immutable widget bytes. The earlier [production-unchanged snapshot](production-unchanged.json) records the pre-publication stage and remains historical.

WordPress 1.1.4 remains unpublished. Merging the new PR and publishing WordPress.org require later authorization; branch preview success does not authorize either. A repository rollback reverts the two PHP header lines and matching package metadata without resetting unrelated work. A test-site rollback restores the pinned official predecessor files without restoring its database. Preserve all old archives and evidence; do not overwrite accepted artifacts or run an older publication script against the new source tree.
