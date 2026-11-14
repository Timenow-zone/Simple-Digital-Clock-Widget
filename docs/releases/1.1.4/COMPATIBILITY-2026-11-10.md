# WordPress 1.1.4: compatibility extension, 10 November 2026

**Release readiness: NO-GO.** The expanded matrix exposes saved-metadata loss on
WordPress 6.8.12. The i18n-specific checks still pass; their narrower historical
acceptance does not cover this newly failing environment.

This report extends the i18n-r10 candidate with stable-Core, prerelease
and older-plugin upgrade checks. It does not replace the frozen
[original r10 acceptance](INDEPENDENT-ACCEPTANCE-I18N-R10-2026-11-10.md).

## Artifact and scope

- Candidate: `.local/packages/simple-digital-clock-1.1.4-i18n-r10-candidate.zip`.
- SHA-256: `46cf4faed3ab3784dd582c91ef3a49103b5840f00924eeb0b6830195f3458403`.
- The accepted r9 archive, all 16 installable r10 files, shared widget 0.8.1,
  current manifest and historical acceptance evidence remain byte-identical.
  The former active status is preserved as `acceptance-i18n-r10.json`; the active
  `acceptance-evidence.json` now records the compatibility blocker.
- All runs use isolated loopback sites and official Core archives with recorded
  SHA-256 values. Updates use the real Core upgrader with a private local offer;
  they do not test WordPress.org delivery or touch an owner site.

## Matrix

| WordPress | PHP | Result | Evidence scope |
| --- | --- | --- | --- |
| 6.3.14 | 7.0.33 | PASS | Same-day original r10 acceptance; fresh direct 1.1.1 upgrade check |
| 6.4.14 | 8.3.35 | PASS | Fresh stable matrix |
| 6.5.14 | 8.3.35 | PASS | Fresh stable matrix |
| 6.6.11 | 8.3.35 | PASS | Fresh stable matrix |
| 6.7.11 | 8.3.35 | PASS | Fresh stable matrix |
| **6.8.12** | **8.3.35** | **FAIL** | Native REST save drops JSON metadata; no waiver |
| 6.9.11 | 8.3.35 | PASS | Fresh independent continuation after the 6.8 failure |
| 7.0.8 | 8.3.35 | PASS | Fresh stable matrix |
| 7.1.4 | 8.3.35 | PASS | Fresh stable matrix and direct 1.1.1 upgrade check |
| 7.2-beta5 | 8.3.35, 8.5.12 | Prerelease scoped PASS | Fresh clean, transition, native editor, i18n and frontend checks |

The seven fully passing new stable references cover 21 update/file-rollback/reupdate
transitions, 252 native saves with 1,764 strict raw JSON checks, 210 frontend cases,
14 admin/editor pairs and 14 real-gettext UI pairs. The aborted 6.8.12 run is not
included in those complete-pass counts. Stable frontend coverage uses 15 selected
fixtures per Core/browser; Beta 5 uses all 45. Both use Chromium and WebKit.

## Release blocker: WordPress 6.8.12 metadata loss

An administrator creates the 11-caption corpus in the real Gutenberg editor and
saves through REST on exact r10. The plain caption retains complete metadata.
The ten terminal-backslash cases reach the database with block JSON reduced to
`{"timeZone":"UTC"}`: `caption`, `lock` and the other serialized settings are lost.
The plugin's HTML fallback reconstructs visible settings, so a valid-looking
block and correct caption do not prove intact metadata. The strict test fails;
other 6.8 roles and the remaining acceptance phases are not declared passing.

Core 6.8 still has the older JavaScript caption-escaping behavior. Its REST Block
Hooks processing parses and serializes the content before the plugin's existing
`wp_insert_post_data` repair can run. The raw incoming serializer result, saved
REST response, database snapshots and Core source are retained. An independent
read-only pipeline probe reproduces the damaged database post byte-for-byte.
Running the narrow repair before Core's transformation and retaining the existing
late repair preserves all 11 captions, locks and expected JSON values in memory. Posts, postmeta and options
hashes remain unchanged; this diagnostic is not an installed fix.

Before release, repair the narrowly recognized clock metadata before Core's REST
Block Hooks transformation, while preserving native handling of foreign blocks
and KSES. This is a corrective implementation requirement, not an applied patch.
It needs a new candidate and fresh regression/acceptance evidence, including
6.8.12 native saves under all three roles. No existing accepted package is claimed
to fix this newly discovered gap.

The stable matrix selects the latest maintenance patch from each tested Core
line. It does not cover every patch release or the Cartesian product of Core and
PHP versions. The previously accepted minimum endpoint is 6.3.14, not 6.3.0.
Older Core lines are compatibility references, not a claim of active upstream
maintenance. The original r10 endpoint evidence is explicitly distinguished from
new runs below.

## Backward compatibility

Fresh direct public **1.1.1 → r10 → original 1.1.1 files → r10** cycles pass on
6.3.14/PHP 7.0.33 and 7.1.4/PHP 8.3.35. All six file transitions preserve the stored
posts and critical options exactly. The original 1.1.1 block serializer generates
two clock blocks, with plain/Unicode captions and nondefault settings, in each of
three role-owned posts. Fixture creation uses admin REST with the corresponding
owner; subsequent real candidate saves and reopening use administrator, editor
and author accounts. All 12 blocks remain valid with their settings intact.

A separate pre-1.1.2 stored fixture omits `timeZone`. Its first candidate save adds
only the existing visitor-local sentinel `timeZone: ""`; every prior raw JSON and
HTML byte remains identical, and repeated saving is idempotent. The initial
byte-equality failure is retained. The assertion concerns the stored baseline,
not escape bytes that Core may already have transformed during fixture creation.

The fresh stable matrix uses **public 1.1.2 → r10 → original 1.1.2 files → r10**,
with exact stored-post/critical-option checks at each transition and native
candidate saves after update and reupdate. It does not save using original 1.1.2
after rollback. Public 1.1.2 negative controls reproduce changed or invalid
metadata in 30/33 complex-caption cases on each of 6.4.14, 6.5.14, 6.6.11, 6.7.11
and 6.8.12, extending the earlier known 6.3 limitation. The same bounded corpus
reports 0/33 failures on 6.9.11, 7.0.8 and 7.1.4; that is not a universal safety
claim for the old writer.

File rollback to public 1.1.1/1.1.2 does not establish safe editing with their old
writers, and cannot reconstruct content damaged before the fix. The retained
[1.1.2.1 editable reserve](../1.1.2.1/README.md) and r9 remain available within their
recorded acceptance scope. Neither is established as a remedy for the newly found
6.8.12 failure. No database migration is introduced.

## Prerelease observations and test controls

The actual [7.2 Beta 5 announcement](https://wordpress.org/news/2026/11/wordpress-7-2-beta-5/)
and [official archive](https://wordpress.org/wordpress-7.2-beta5.zip) identify the
tested prerelease. Archive SHA-256:
`43ab43ff79f256b1efc177125ef45b63ea621b0aacba9d0275ce56c5efa8a793`.

Beta 5 passes its stated scope on PHP 8.3.35 and 8.5.12: two clean installs, six
original-1.1.2 file transitions, six editable-reserve transitions, 108 native
saves/756 strict JSON checks, 180 frontend resource cases, 34 PHP asset assertions,
four admin/editor pairs and four translated-UI pairs. Plugin Check reports zero
findings across 29 static and five runtime checks on each PHP runtime.

The new Core 7.2 KSES path can reorder attributes of the saved custom element.
The preserved first failure is attributed to Core's HTML tag processor. The
subsequent private test guard requires byte-identical block JSON, identical
parsed HTML attribute names/values and repeated-save idempotence; it does not
relax caption or metadata checks. Plugin source and ZIP bytes are unchanged.

Fast navigation away from the Beta 5 dashboard causes WebKit errors in Core
asset prefetch, also with the plugin disabled. The A/B control records OFF fast
19 / settled 0 and ON fast 20 / settled 0 errors. Waiting for Core load, scheduled
idle and network idle resolves this observed cancellation race. The full i18n
repeat retains the strict empty-page-error assertion and all escaping/save checks;
no errors are filtered. This remains a Core/WebKit fast-navigation limitation.

The first block-theme frontend request can lazily create Core
`wp_navigation` fallback data. The harness records that initialization separately,
requires every existing post, critical option and plugin file to remain exact,
and runs subsequent frontend checks against a complete strict snapshot. Original
failed attempts and the subsequent guarded repeats are retained. A raw Beta
summary has an inherited PHP 7.0 Plugin Check skip label; actual PHP 8.3 is proven
and its separate 29+5 Plugin Check run passes. The stale raw receipt is preserved.

## `Tested up to` decision

Keep the installable `readme.txt` header at **`Tested up to: 7.1`**. On 10 November,
[the official 7.2 schedule](https://make.wordpress.org/core/7-2/) lists Beta 5;
RC1 is planned for 17 November and the final release for 8 December 2026. Planned
dates are not proof that a release exists.

The [Plugin Developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#what-version-of-wordpress-should-the-tested-up-to-value-be)
limits this field to an actually released RC, or the current stable version when
no RC exists. Passing Beta 5 checks therefore does not justify `7.2` today. After
an actual 7.2 RC is released and the candidate passes the relevant checks, the
header may become `Tested up to: 7.2` without waiting for the final release. Use
the numeric major/minor value, not `7.2-beta5` or `7.2-RC1`.

A [readme-only change](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/#do-i-need-to-release-a-new-version-of-my-plugin-every-time-i-update-the-readme)
does not itself require a plugin-version bump. In this repository's frozen-ZIP
workflow it does change package bytes: preserve r10, build a new candidate, record
its new hash/manifest and accept that artifact. Any later authorized WordPress.org
readme update must keep trunk and the active stable tag consistent. This work
changes neither the packaged header nor SVN.

## Evidence and limitations

The [machine-readable compatibility record](compatibility-20261110.json) binds
results and raw-evidence indexes to the exact candidate. Main local receipts:

- `.local/compatibility-20261110/stable/RESULT.json`: eight new stable references.
- `.local/compatibility-20261110/wp72/RESULT.json`: two Beta 5 PHP references.
- `.local/compatibility-20261110/legacy-111/receipt.json`: direct older-plugin upgrades.
- `.local/compatibility-20261110/review/`: independent readback, Core attribution
  and the 6.8 failure proof.

The [original scoped acceptance snapshot](acceptance-i18n-r10.json) is preserved
exactly; [active release readiness](acceptance-evidence.json) now records the
blocking compatibility failure. The original eight-gate i18n report and evidence
are historical facts, not a passing result for the expanded matrix.

The frontend contract still requires explicit `SDCW_enqueue_scripts()` for raw
HTML, cached or client-only integrations without an owned render event. These
checks do not certify arbitrary optimizers, multisite, native Safari/VoiceOver,
all language packs, public update delivery, the eventual final 7.2 release or all
possible Core/PHP combinations. Hosted required checks still cover committed r9;
they must pass for the eventual corrected-candidate PR revision before a merge.

No push, merge, deployment or publication was performed. All new labs are stopped
and their data, negative controls and failed attempts are retained.
