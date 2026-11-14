# Independent local acceptance: WordPress 1.1.4 rest-r14

Date: 11 November 2026. Verdict: **GO for the exact local candidate**.

The results bind one local ZIP. They do not authorize publication or transfer
historical r9 acceptance to changed bytes.

## Exact package and source

- ZIP: `.local/packages/simple-digital-clock-1.1.4-rest-r14-candidate.zip`.
- SHA-256: `57cb0689860a0c4faa6cfbe522b021c3652d36a37120366368b82bd44c52f780`.
- 67,703 bytes; 16 installable files; [manifest](manifest-rest-r14.json).
- Manifest SHA-256: `1f249b1e005461f6270859df9bfa8652ad0b217d5da7656b50fb7b0aa78715dc`.
- Base commit: `361b11c8270fa14c524562a9f9b885a0af36b1a0`; changes are uncommitted.
- Widget 0.8.1 SHA-256: `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

Sorted paths, fixed timestamps, regular 0644 files and deterministic deflate
settings reproduce the ZIP byte-for-byte in a separate in-memory build. Only
`includes/simple-digital-clock-kses.php` and the readme changelog differ from r10.
The editor bundle, i18n dictionary/POT, block schema, asset routing and widget
bytes are unchanged. No database migration or background rewrite is introduced.

The candidate retains the [r10 i18n corrections](INDEPENDENT-ACCEPTANCE-I18N-R10-2026-11-10.md):
missing editor messages, corrected shadow help, translatable settings/notices,
and plain gettext values transported through safe JSON and text components.
PHP HTML keeps escaped gettext. The 63-message POT remains unchanged; actual
WordPress.org language-pack completeness is separate from translatability.

## Correction and preserved failures

| Candidate | Observed failure | Frozen disposition |
| --- | --- | --- |
| r10 | Core 6.8 REST input parsing discarded malformed clock metadata before the late save repair | [Compatibility](acceptance-compatibility-r10.json) |
| r11 | Stored JSON was protected, but the outgoing Core serializer corrupted it again | [Response failure](acceptance-rest-r11.json) |
| r12 | Core 7+ parsed old editor input before the dynamic pre-insert filter | [Input boundary](acceptance-rest-r12.json) |
| r13 | First REST reads of recoverable malformed content already stored by public 1.1.2 lost metadata | [Stored-content failure](acceptance-rest-r13.json) |

r14 uses the supported
[`block_parser_class` filter](https://developer.wordpress.org/reference/hooks/block_parser_class/)
to normalize narrowly recognized legacy clock JSON before the default Core parser
consumes attributes. The adapter delegates to the native parent once. Core still
makes Block Hooks decisions and applies KSES normally; no response reconstruction,
attribute merge or cached-post mutation is needed. This also preserves distinct
metadata for visually identical clocks. Valid, foreign and unrecognized content
keeps its prior handling. Non-string inputs and explicitly selected custom parser
classes are delegated or left unchanged. The parent is loaded before plugins on
the supported minimum Core and has a PHP 7-compatible public signature.

The earlier request/response guards remain: per-type pre-insert priority 9,
modern prepared-`stdClass` processing before direct Block Hooks, the existing late
save repair, and raw-response priority 11. The modern type list and `WP_Post`
response objects remain untouched. Only an existing string raw field is eligible;
permissions, `_fields`, rendered content, errors, status, headers and links remain
under their native policies. Reusable blocks retain their own Core view schema,
which can expose raw content and omit rendered content.

## Fresh native acceptance

| WordPress | PHP | Result |
| --- | --- | --- |
| 6.3.14 | 7.0.33 | PASS |
| 6.4.14 | 8.3.35 | PASS |
| 6.5.14 | 8.3.35 | PASS |
| 6.6.11 | 8.3.35 | PASS |
| 6.7.11 | 8.3.35 | PASS |
| 6.8.12 | 8.3.35 | PASS |
| 6.9.11 | 8.3.35 | PASS |
| 7.0.8 | 8.3.35 | PASS |
| 7.1.4 | 8.3.35 | PASS |
| 7.2-beta5 | 8.3.35, 8.5.12 | PASS within prerelease scope |

The twelve matrix installations complete 36 original-1.1.2 update/file-rollback/
reupdate transitions, 432 native saves, 3,024 strict raw JSON checks, 480 frontend
cases, 24 admin/editor pairs and 24 gettext UI pairs. The stable portion is ten
installations across nine Core versions, with 7.1.4 repeated independently; Beta
adds two PHP references. Every file transition requires unchanged whole stored
posts and selected critical options, exact files, version and activation state.

Native editor checks cover administrator, editor and author, ordinary old blocks,
eleven difficult captions, title-only/repeated saves, actual setting edits,
strict comment JSON and valid reopening. Stable frontend checks use 15 selected
resource fixtures and Beta uses all 45, each in Chromium and WebKit. Real gettext
controls exercise literal Unicode/markup, safe output and both reset actions.
Original public 1.1.2 is not used for editing after file rollback.

Two fresh clean installs on 6.8.12 and 7.1.4/PHP 8.3 test actual HTTP REST:
36 allowed and six expected denied route/role cases, 2,046 strict JSON checks,
collections, title/repeat updates, view/restricted fields, unknown JSON, locks,
foreign-block parity and six anonymous read/write denial pairs. A custom type
added to Block Hooks at priority 20 also passes old malformed payloads under all
three roles. Permission failures leave stored titles/content unchanged.

The stored-legacy source is an actual administrator-created public-1.1.2 record
from WordPress 6.3.14: eleven clocks, ten malformed JSON comments still containing
recoverable locks/settings. Read-only real controller probes place that exact
payload in cloned `WP_Post` objects. On 6.8.12, 7.0.8, 7.1.4 and Beta 5 under both
PHP references, r14 returns 11/11 valid metadata objects and locks, matching the
pre-repaired Core control. Database, source objects and cached posts stay exact.
These are actual controller/parser probes, separate from the HTTP authorization
checks above; no cross-Core database migration is claimed.

The installed-ZIP clean gate separately verifies 22 recovered blocks/locks,
visually identical clocks with distinct metadata, six adjacent/root Block Hooks
insertions and native ignored-metadata decisions. Four native author KSES
comparisons match valid plugin-disabled Core controls. Independent REST KSES and
parser controls on five environments also pass: valid/foreign parse parity,
non-string delegation, duplicate clocks, idempotence, custom selectors and unsafe
unknown JSON sanitization. No cached object mutation or late attribute restoration
is used. The read-only compatibility probes record zero SQL writes.

Direct public **1.1.1 → r14 → original 1.1.1 files → r14** checks pass on
6.3.14/PHP 7.0.33 and 7.1.4/PHP 8.3.35. Six file transitions preserve all posts and
selected critical options. The original serializer creates two plain/Unicode
blocks per role-owned post; six real candidate role saves/reopens preserve all
12 blocks and nondefault settings. A separate stored fixture gains only the
missing visitor-local `timeZone: ""` sentinel; all other JSON/HTML remains exact
and repeated saving is idempotent. This concerns the stored baseline, not escape
bytes before Core originally inserted it. Four frontend smoke pairs and current
PHP Plugin Check also pass.

Plugin Check passes 29 static and five runtime checks with zero findings on
6.8.12/8.3, 7.1.4/8.3 and Beta 5/8.3 and 8.5. The direct 1.1.1 current-PHP run also
passes. Plugin Check itself requires PHP 7.4+, so it is not credited on PHP 7.0.33;
the plugin has separate native minimum-runtime acceptance.

Core fallback-navigation initialization is checked against the pinned Core source
and completed before the strict frontend snapshot. Every existing post, selected
option and plugin file stays exact; subsequent frontend checks require complete
snapshot equality. Earlier r12/r13 harness failures and the prototype attempts
remain preserved. Prototype reader omissions of attribute-less comments and an
incorrect PHP hook-fixture spelling were corrected in the harness; the complete
prototype and the installed ZIP then passed independently. No product failure is
waived and no package byte changed after the r14 freeze.

## Local workflow and regression checks

All 21 local workflow verification steps pass: **254 tests** comprising 100 Node,
24 Python, 111 browser-unit and 19 integration cases. Another **33 tests** pass
against the exact extracted ZIP. Chromium, Firefox and WebKit are covered.
PHP 7.0.33 and 8.3.35 pass six packaged-file syntax checks, 43 asset assertions,
48 serialization assertions, 48 gettext transport values, and REST/parser probes.
The 19 focused REST/parser tests pass r14; frozen r13 fails three expected adapter
checks. Controlled doubles supplement the native Core checks.

A fresh 435-file public snapshot supplies the local workflow. All 734 cached
installed dependency versions match the verified package/lock/patch inputs and
are mounted read-only; no fresh `npm ci` is claimed. The snapshot stays unchanged.
A fresh audit reports five low development-only findings and zero moderate/high/
critical findings. The isolated production build reproduces the immutable widget
bytes. Final documentation is checked separately after the frozen workflow run.
Hosted checks have not run for this uncommitted revision.

## Preservation, scope and release boundary

The accepted r9 ZIP remains SHA-256
`5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
All earlier ZIPs, revision manifests, failure controls, raw evidence and original
verdicts remain intact. File rollback is available within the prior recorded
scope; old packages do not fix these new REST defects. Neither file rollback nor
r14 can reconstruct attributes already discarded by an earlier writer. Such data
requires a pre-loss backup or revision. Recoverable malformed metadata and already
lost metadata are explicitly distinguished.

`Tested up to: 7.1` remains unchanged. On 11 November the
[official schedule](https://make.wordpress.org/core/7-2/) lists Beta 5 and a planned
17 November RC1. The
[Plugin Developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#what-version-of-wordpress-should-the-tested-up-to-value-be)
permits `7.2` only once an actual RC exists and passes testing. Beta success does
not certify final 7.2. A readme-only change need not bump the plugin version, but
it requires a new ZIP identity in this frozen-artifact workflow.

This matrix covers selected maintenance patches and PHP references, not every
Core/PHP combination. Recovery uses the default Core parser; custom parser
selection is respected, not certified. This is not a replay of every historical
multisite, optimizer, native Safari/VoiceOver, performance or language-pack gate.
The [frontend asset contract](../../WORDPRESS-ASSET-CONTRACT.md) is unchanged:
raw HTML/cached integrations require explicit `SDCW_enqueue_scripts()`.

The independent gatekeeper did not edit the product and read back the complete
native matrix, package/CI and older-plugin evidence, in addition to running the
five-environment targeted checks. Regression authoring and CI/native execution
were split across reviewers; the primary author also ran two stable pairs and
the direct 1.1.1 check. The final disposition has no actionable code/security
findings and no implicit waivers.

All 29 owned r11–r14 correction projects, including the isolated prototype, are
stopped. Databases, rollback copies, downloads, failed attempts and raw evidence
are retained. The final [machine-readable acceptance](independent-rest-r14-20261111.json)
binds the report and evidence indexes to the exact package. Final source/package,
prose, links, JSON and preserved-artifact checks are recorded separately.

No push, merge, deployment, WordPress.org publication or owner-site installation
was performed. Existing hosted checks cover committed r9; the future corrected
PR still requires Repository checks and Browser tests. Existing standalone
widget 0.8.1 CDN delivery is independent and unchanged. Public update delivery
remains outside this local acceptance.
