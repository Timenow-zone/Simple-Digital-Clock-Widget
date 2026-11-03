> Archived r3 record; manifest/status links point to its preserved exact evidence.

# WordPress 1.1.4: local asset-contract candidate

Status: **asset-contract-r3 is locally verified; independent reacceptance and publication remain pending**. Requirements stay **WordPress 6.3 / PHP 7.0**, with unchanged widget **0.8.1**.

The previous independently accepted compatibility-r2 ZIP remains preserved. Its GO does not transfer to new PHP/package bytes. See the [historical report](COMPATIBILITY-R2.md), [previous manifest](manifest-before-asset-contract.json) and [previous acceptance](acceptance-evidence-before-asset-contract.json).

## Exact current candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-asset-contract-r3-final-candidate.zip`.
- **67,111 bytes; 17 installable files**.
- SHA-256: `217807d2c79018c2d1861884e1f8e5e151c86cbf4154b0889d09db0f4eb84772`.
- [Current manifest](manifest-before-inline-css.json) and [local acceptance status](acceptance-evidence-before-inline-css.json).
- Unchanged widget: 36,009 bytes, SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

The earlier 66,938-byte r3 and 67,109-byte r3b test ZIPs remain preserved. The final archive also handles manually rendered clock excerpts while keeping stripped excerpts asset-free. A new exact-archive cycle and 20-case browser matrix bind evidence to these final bytes. The old accepted 65,374-byte, 16-file archive remains `d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`.

## Changes

The [frontend asset contract](../../WORDPRESS-ASSET-CONTRACT.md) requires zero plugin JS/CSS without a rendered clock, and one runtime script plus one integration stylesheet for one or many rendered clocks. It covers native/nested blocks, rendered synced patterns, Custom HTML, classic content, shortcodes, dynamic blocks and Block/Text/Custom HTML sidebar widgets. Drafts, inactive widgets, comments, escaped examples and stripped excerpts must not trigger loading.

A new PHP integration file registers stable handles without global enqueueing. Core's tokenizer checks rendered HTML; late CSS is printed once before footer scripts. Block editors and their iframe retain preview assets. Ordinary admin screens load none. The rating notice and its dismissal script are limited to settings, and a hidden notice adds no script.

Eight unconditional logging calls become fixed-code `sdcw_metadata_diagnostic` events, without changing fail-closed returns. The bounded argument-free KSES caller check retains one documented exact-code PHPCS exception as production security logic. No Plugin Check result filtering, severity suppression or global ruleset exclusion is added.

Widget bytes, block save schema, CSS, translations, licenses and requirements are unchanged. There is no database migration.

## Evidence and scope

Local verification covers exact package/source identity, minimum/current Core updates, physical rollback and reupdate, real KSES/security/recovery/unknown-metadata probes, frontend network counts and admin/editor draft save/reopen. Browser cases use fresh contexts and real requests. See [local acceptance](acceptance-evidence-before-inline-css.json) for exact counts, artifact bindings and evidence locations.

The unpushed changes have no new GitHub CI or independent exact-candidate GO. Required Repository checks and Browser tests must pass on a later proposed head before merge. Nothing is pushed, merged, deployed or published in this local change.

## Preserved limitations

The old 1.1.2 writer on Core 6.3 may damage metadata after rollback. Erased literal captions/Advanced lock values cannot be reconstructed; one historically damaged Author block remains invalid. Numeric-key-only objects can follow native KSES conversion to arrays. The [historical report](COMPATIBILITY-R2.md) retains those failures and all earlier evidence.

This work does not certify HTTPS/TLS installation, multisite, native Safari/VoiceOver, successful external Google transport, owner sites or the whole historical cache/optimizer matrix. Direct theme output and later third-party JavaScript insertion require explicit enqueueing as documented in the contract. Themes must call `wp_footer()`.

WordPress.org publication requires a later explicit user instruction. Public catalogue/ZIP contents, a genuine public update offer, installed canary and normal public Preview remain separate delivery gates.
