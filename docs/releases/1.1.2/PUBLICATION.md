# Simple Digital Clock 1.1.2 — publication

Verification snapshot from 29 October 2026, 09:36:57 UTC. **WordPress.org SVN and the initial release's public ZIPs are verified. At the time of this observation, the update API returned 1.1.1; an actual update through WordPress.org had not yet been accepted, and the release was within the mandatory 6-hour cooldown.** [Machine-readable results](publication-evidence.json).

The later readme-only SVN change **r3772710** and new public ZIPs are documented [separately](README-PUBLICATION.md). The hashes and results below apply to the initial r3772502 publication; its original evidence is preserved. The readme verification does not establish completion of Core update acceptance.

## Published source

- SVN: **r3772502**, author `falselight`, `2026-10-29T09:22:01.589780Z` (11:22 Europe/Kyiv).
- Targets: [trunk](https://plugins.svn.wordpress.org/simple-digital-clock/trunk/), [tags/1.1.2](https://plugins.svn.wordpress.org/simple-digital-clock/tags/1.1.2/).
- GitHub: branch [`codex/prepare-simple-digital-clock-1.1.2`](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/tree/codex/prepare-simple-digital-clock-1.1.2).
- Immutable WordPress tag: [`wordpress-v1.1.2`](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/tree/wordpress-v1.1.2), commit `6479ee9365e98f9b5f6822989eb89938d4955a9d`.
- Installable plugin Git tree: `18512403b0715be777a89e302831a3cc3d5117b6`.

The branch and annotated tag were pushed atomically, without force push or changes to `main`. Subsequent report commits may advance the branch; the tag and published source retain the stated SHA. The standalone JS widget version remains 0.7.0.

SVN received exactly the expected 11 paths: five changed/added `trunk` files, the `tags/1.1.2` copy with history from `trunk@3771402`, and the same five files inside the tag. Independent exports of both targets at r3772502 and at the then-current HEAD r3772504 matched all 15 SHA-256 values in the [manifest](manifest.json). There was no drift. Historical SVN properties were preserved. Versioned files in the local checkout were clean; the unrelated unversioned HTML banner was preserved and not published.

The first commit attempt was rejected with E215004 and created no revision. After the user entered the SVN password in an interactive terminal, one successful commit completed. The password was not transmitted through chat or included in the report or evidence.

## Public delivery

At `2026-10-29T09:23:14Z`, the official plugins/info API reported 1.1.2. The live [directory page](https://wordpress.org/plugins/simple-digital-clock/) also showed the new version, download link, and changelog with the two verified LocalWP scenarios.

| Artifact | SHA-256 |
| --- | --- |
| Verified local ZIP | `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8` |
| [Public 1.1.2 ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.1.1.2.zip) | `bebcfedfa9a27a517dcb3af44355700e1cd12ab7770e68310bfb2feeec9670c2` |
| [latest-stable ZIP](https://downloads.wordpress.org/plugin/simple-digital-clock.latest-stable.zip) | `bebcfedfa9a27a517dcb3af44355700e1cd12ab7770e68310bfb2feeec9670c2` |

Both public ZIPs passed CRC, root-directory, unique-name, and exact 15-file checks. Every extracted file is byte-identical to the verified candidate and Git tree. The overall SHA difference is due to server-side packaging; code, POT, and readme are unchanged. The API reports minimum WordPress 6.3 / PHP 7.0; `tested=7.1.4` is the directory's current representation of the readme's retained `Tested up to: 7.1`.

## Updating through WordPress.org

At 09:28:31 UTC, real POST requests to `plugins/update-check/1.1/` for installed 1.1.1 and profiles WP 6.3.2 / PHP parameter 7.0.33, WP 7.1.3 / 8.2.29, and WP 7.2-beta2 / 8.5.0 returned HTTP 200, but `no_update` still reported 1.1.1. This tests the API, not three running PHP environments.

According to the [official Plugins Team announcement of 9 September 2026](https://make.wordpress.org/plugins/2026/09/09/automated-security-review-for-plugin-releases/), a 6-hour cooldown for automated security checks applies before a release is offered through the update API; it also applies to the manual update button. [Meta ticket #8443](https://meta.trac.wordpress.org/ticket/8443) describes separate promotion of the directory/ZIP and `update_source`. The observed discrepancy is consistent with this mechanism; public data did not establish a separate security block or enabled opt-in Release Confirmation.

For the commit at 09:22 UTC, the next-request reference point was after **15:22 UTC / 17:22 Europe/Kyiv on 29 October**, without a guaranteed exact deadline. A practical next run was after 17:30 Kyiv time. Another commit, tag change, or cooldown bypass was not required.

A control update on a separate LocalWP site was prepared only for a genuine Core offer and standard `admin-ajax.php?action=update-plugin`. Official 1.1.1 was installed with all 14 files verified; all 2426 posts rows and critical settings were preserved. No local offer or version substitution was used. Before a future installation, the guard would verify the entire extracted source against the accepted manifest. Until an offer appeared, neither the installer nor new Gutenberg Save tests were run; final acceptance of the public update remained unconfirmed. The pre-release upgrade/resave/rollback cycle remains a separate, already completed result.

At `2026-10-29T09:36:57Z`, waiting was stopped after 10 genuine Core requests, the last at 09:34:53 UTC. Original wp-config, MU-plugin, and external HTTP blocking were restored; temporary logger/guard files were removed. The task's own site was stopped and `localhost:10003` was closed. Official 1.1.1 remained active on the stopped environment; fixtures and references were preserved for the next run. The database and volumes were neither restored nor deleted; other sites, the shared router, and TLS trust were unchanged.

## Verification limits

Pre-release acceptance is retained in [PREFLIGHT.md](PREFLIGHT.md): the exact final ZIP passed 1388 smoke assertions and Plugin Check 2.1.0 with **0 ERROR / 7 analyzed WARNING**. The full functional matrix applies to ZIP `6f896d42…`; final packaging changes only POT metadata/source references and two changelog lines. All executable files are identical. Publication is not presented as a rerun of the full matrix.

GitHub reported vulnerabilities in development tooling. The pre-release API snapshot had 39 open alerts, all in development scope; production-only npm audit returned 0. The verified bundled JS does not contain the affected packages. This does not block the frozen WordPress artifact, but fixing critical/high development-tool advisories remains a separate post-release task. Dependencies and JS were not rebuilt.

The reviewer's site and final WordPress 7.2 have not been validated. The previously verified rollback to 1.1.1 preserves resaved posts and settings without restoring the database; further editing in 1.1.1 reintroduces the old version's known defects. These checks do not guarantee compatibility with every third-party plugin and theme.
