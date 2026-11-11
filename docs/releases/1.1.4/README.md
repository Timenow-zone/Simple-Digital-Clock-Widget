# WordPress 1.1.4: rest-r14 local candidate

Status: **accepted local candidate; unpublished**. Check the
[current machine-readable status](acceptance-evidence.json) before using this
candidate. Previous verdicts do not certify these changed bytes.

- ZIP: `.local/packages/simple-digital-clock-1.1.4-rest-r14-candidate.zip`.
- SHA-256: `57cb0689860a0c4faa6cfbe522b021c3652d36a37120366368b82bd44c52f780`.
- 67,703 bytes / 16 installable files; [current manifest](manifest.json) and
  [revision manifest](manifest-rest-r14.json).
- Base commit: `361b11c8270fa14c524562a9f9b885a0af36b1a0`; changes remain uncommitted.
- WordPress 6.3 / PHP 7.0 minima; shared widget 0.8.1 remains byte-identical.

## Corrections

The candidate retains the r10 i18n changes: three missing editor messages,
the corrected `shadowHelp` key and description, translatable settings titles and
rating notices, and 48 plain-gettext editor dictionary values. JSON transport and
text components provide output-context safety; PHP HTML keeps escaped gettext.
The pinned WP-CLI-generated POT contains 63 unique nonempty messages. Actual
WordPress.org language-pack completeness remains separate.

The [r10 compatibility investigation](COMPATIBILITY-2026-11-10.md) exposed metadata
loss before Core REST Block Hooks processing. r11 protected stored content but
failed when Core reserialized raw responses. r12 corrected responses, then failed
the extra old-editor-payload check on modern Core, which parses that input before
the dynamic pre-insert hook. r13 protected that input, but first REST reads of
recoverable malformed content already stored by public 1.1.2 still lost metadata.
All failed ZIPs and evidence are retained.

r14 normalizes recognized legacy clock JSON before the default Core block parser
consumes it, using the supported
[`block_parser_class` filter](https://developer.wordpress.org/reference/hooks/block_parser_class/). Native parsing, KSES
and Block Hooks still run normally. Custom parser selections and non-string
inputs keep their existing handling. This avoids cached-post mutation, heuristic
matching of duplicate clocks, or late restoration of intentionally removed fields.
The existing bounded clock mapper also runs at the older Core pre-insert hook,
the modern `rest_block_hooks_post_types` input boundary, and the raw-response hook.
The existing late save repair remains. The modern wrapper touches only prepared
`stdClass` input, returns the type list unchanged, and leaves cached `WP_Post`
response objects intact. No missing raw field is added. Native permissions, KSES,
foreign blocks, HTML and unrelated fields retain their original handling.

Only `includes/simple-digital-clock-kses.php` and the readme changelog differ from
r10. The block schema, editor bundle, i18n/POT, asset routing and widget bytes are
unchanged. There is no database migration or recovery of already-discarded data.
The [frontend asset contract](../../WORDPRESS-ASSET-CONTRACT.md) still requires
explicit `SDCW_enqueue_scripts()` for raw HTML and cached integrations.

## Local verification

Fresh acceptance passes the selected maintenance releases from WordPress 6.3.14
through 7.1.4, minimum PHP 7.0.33, and 7.2 Beta 5 on PHP 8.3.35/8.5.12. The twelve
matrix installations cover 432 native saves, 3,024 strict JSON checks, 480 frontend
cases and 36 update/file-rollback/reupdate transitions. Direct public 1.1.1 adds
six file transitions and twelve old blocks reopened under all three roles.

Actual HTTP authorization/field controls, legacy input, KSES, i18n and Plugin
Check pass. Five-environment readback restores all 55 old stored blocks/locks;
the installed-package control also preserves duplicate clocks and native Block
Hooks decisions. Local workflow verification passes 254 tests plus 33 exact-ZIP
guards. The independent reviewer reports no actionable findings or implicit
waivers. All owned test projects are stopped.

See the [independent acceptance report](INDEPENDENT-ACCEPTANCE-REST-R14-2026-11-11.md)
and [machine-readable evidence](independent-rest-r14-20261111.json) for exact
coverage, retained failures, dependency-cache use and limits.

Read-only package and focused regression checks from the repository root:

```sh
set -euo pipefail
python3 tools/wordpress-lab/verify-package.py \
  --zip .local/packages/simple-digital-clock-1.1.4-rest-r14-candidate.zip
node --test tests/wordpress-i18n.test.mjs tests/wordpress-rest-metadata.test.mjs \
  tests/wordpress-package.test.mjs
```

`Tested up to: 7.1` remains unchanged. The
[official schedule](https://make.wordpress.org/core/7-2/) lists 7.2 Beta 5 and a
planned 17 November RC1. The
[Plugin Developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#what-version-of-wordpress-should-the-tested-up-to-value-be)
allows `7.2` only after an actual RC exists and has been tested successfully.
Beta acceptance does not certify final 7.2. A readme-only change need not bump the
plugin version, but it changes this frozen ZIP and requires a new artifact identity.

## Preserved candidates and rollback

| Revision | Archive SHA-256 | Preserved status |
| --- | --- | --- |
| render-r9 | `5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7` | [Original accepted scope](acceptance-render-r9.json) |
| i18n-r10 | `46cf4faed3ab3784dd582c91ef3a49103b5840f00924eeb0b6830195f3458403` | [Original i18n GO](acceptance-i18n-r10.json); [expanded compatibility NO-GO](acceptance-compatibility-r10.json) |
| rest-r11 | `1adaafe3a856a15883e369eb3b679e8c8fbad9a88c267f079c6ebc2c49a4e5da` | [Raw-response failure](acceptance-rest-r11.json) |
| rest-r12 | `df8b7a67c8b9cf262c305df426a374bdd43ea8d2e141748207abe7639835478e` | [Cross-version input failure](acceptance-rest-r12.json) |
| rest-r13 | `622f99a3c1cec9262bf8f5024df406f1000a49ba294c3871102810b3c9eb0b00` | [Stored legacy read failure](acceptance-rest-r13.json) |

All ZIPs remain in `.local/packages/` with revision-specific manifests and raw
evidence. The accepted r9 is 66,815 bytes; its
[independent report](INDEPENDENT-ACCEPTANCE-RENDER-R9-2026-11-06.md) is unchanged.
Previous packages remain available for file rollback within their recorded scope.
They are not remedies for the newly identified REST defects. File rollback does
not prove safe editing with an old writer or reconstruct metadata already lost;
use a pre-loss backup or revision for that data. The older r8 and separately
versioned [1.1.2.1 reserve](../1.1.2.1/README.md) also remain unchanged.

## Release boundary

[PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18) and its
hosted checks cover committed r9. The changed revision still needs required
Repository checks and Browser tests before any future merge. Local acceptance
does not establish public update delivery, new performance measurements, arbitrary
optimizer/multisite support, native Safari/VoiceOver, or complete language packs.
Stored-legacy recovery is verified with the default Core parser; independently
selected custom parser implementations are respected, not certified.
No push, merge, deployment, owner-site installation or WordPress.org publication
is performed. Existing widget 0.8.1 CDN delivery remains independent and unchanged.
