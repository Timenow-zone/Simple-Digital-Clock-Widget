# RC5 two-phase alignment acceptance

Date: 2026-11-12. **SCOPED TECHNICAL ACCEPTANCE PASS; NOT PUBLISHED.** Final
hosted checks must pass on the final PR HEAD, as recorded in the receipt below.
This is scoped acceptance of the correction, not a new execution of every
historical release gate or authorization to merge or publish.
The machine-readable evidence index is [acceptance-rc5.json](acceptance-rc5.json).

## Defect, correction and exact subject

[MULTI-ALIGN-P2-01](../../defects/MULTI-ALIGN-P2-01.md) was recorded before product
editing. The old dynamically constructed class was invisible to Tailwind's
source extraction. Firefox ignored explicit right/center alignment; absent or
removed alignment also inherited the parent's alignment in Chrome/WebKit.
The preserved earlier 30-workflow baseline has 20 passes and ten Firefox failures.
The expanded exact-0.8.3 HTML baseline has zero passes, six failures and zero
missing results. Its later unvisited direction phases are not claimed executed.

Phase two changes only the existing inner container's class selection to literal
`text-left`, `text-right` and `text-center`. Default, empty and removed alignment
select center. Physical left/right works under RTL. No layout, dimensions,
formatting, timers, dependencies, public property API, loader lifecycle, block
serializer or saved schema changes are included in this correction.

| Item | Identity |
| --- | --- |
| Main widget | 0.8.4; 36,430 bytes |
| Main SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| WordPress archive | 1.1.6 RC5; 72,568 bytes; 17 regular files |
| ZIP SHA-256 | `800bac5294632cf8a581719cdbdffb5ef20b2a20e9a71195f554f45e72c2d3dd` |
| Bootstrap | Unchanged 5,614 bytes; SHA-256 `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |
| Executable source | `b1af416e8373bc0bec0163ee36a03507f3ddcaaa` |
| Complete package containing commit | `7cf895dff9588e64e4329380dc090a83f0af5157` |
| Manifest | [Frozen RC5](manifest-rc5.json); original creation-time `NOT_RUN` retained |

The executable commit binds 16 package files; the readme source link was finalized
afterward. All 17 files match the containing commit. Exactly three package files
differ from RC4: main runtime, both version references in assets PHP, and readme.
The remaining 14 files are identical. Ten older numbered bundles and frozen
candidate archives/reports remain unchanged; selecting old bytes retains their
historical behavior and does not acquire the new alignment fix.

## Exact-main single and multiple installation proof

Every accepted main response uses the SHA above. Google Chrome runs explicitly
through `channel: "chrome"`; Chromium-only results do not replace it. WebKit
engine coverage is not a claim about native Safari or every browser version.

| Environment and scenario | Chrome 157.0.8103.51 | Firefox 153.0 | WebKit 26.5 |
| --- | ---: | ---: | ---: |
| Ordinary HTML: single and multiple workflows | 2/2 PASS | 2/2 PASS | 2/2 PASS |
| Installed WordPress: two Core versions, owned/raw output, single/multiple | 8/8 PASS | 8/8 PASS | 8/8 PASS |
| Existing standalone host compatibility cases | 8/8 PASS | 8/8 PASS | 8/8 PASS |

The first two rows are **30 distinct workflows**, not 30 identical rendering
assertions. Each multiple workflow starts four clocks with different time zones,
locales, time formats and visual settings, changes one independently, removes and
reinserts its same host/root, then adds a fifth clock. Independent fixture values,
real Date/Intl output, visible ticking, unchanged neighbors and one main-runtime
request are asserted. A width negative control must fail and then restore.

All workflows reach the five new alignment/direction phases and final restored
tick observation: removed alignment under a right-aligned parent, empty alignment
via JavaScript, physical left/right under RTL, and removed/default center under
RTL. Computed direction is checked for every clock. Neither Date nor product
timers are mocked. The minute-only clock is checked against current displayed
time but excluded from the short tick oracle.

Standalone Chrome runs on macOS arm64, Firefox/WebKit on pinned Linux arm64.
Native Chrome/WebKit run on macOS arm64 and Firefox on pinned Linux arm64.
Native primary sites are Core 6.3.14/PHP 7.0.33 and Core 7.1.4/PHP 8.3.35.
The 24 standalone compatibility cases separately cover healthy hosts, invalid
first/middle/last hosts, multiple/all-invalid hosts, dynamic insertion and
reconnection. They preserve the previous error-isolation/readiness correction.

## Supplemental native acceptance

| Fresh native scope | Accepted unique rows |
| --- | ---: |
| Same-page single/multiple workflows above | 24 |
| Runtime/error isolation/readiness/real ticking | 42 |
| Eight selected frontend placements, both themes/sites/browsers | 96 |
| External-only CSP, valid nonce and valid SRI | 18 |
| Post Editor Admin/Author, default/metabox, save/reopen/delete/Undo | 24 |
| Site Editor insert/edit/save/reopen | 6 |
| Legacy Text/Custom HTML preview workflows | 6, covering 12 documents |
| Native Widgets Caption/Update/reload/restoration | 6 |
| **Total** | **222** |

The 24 multi-instance workflows are included in 222, not added again. Frontend
parity uses its established fixed-time fixture and is not additional real-tick
proof. Only eight of 29 available frontend cases per site/theme were selected;
the full inventory is retained. The 18 CSP rows cover three positive modes and
retain expected blocked Core/theme diagnostics, not a zero-console-error claim.

Ten separate file-transition rows pass: public 1.1.2 to RC5, files-only rollback,
Core reupdate, public 1.1.5 file setup, and actual Core 1.1.5 to RC5 on both sites.
Every transition preserves eight content-table hashes and stable options,
activation and exact file maps, with no database restore. Bracketed read-only
block/classic and cleanup checks preserve all eight tables, all options and all
17 plugin files. Core first-render navigation/cache writes occur during explicitly
recorded warmup outside those brackets.

Intentional editor writes are separate. Widgets restores every instance value
and content byte, but Core moves the outer `_multiwidget` key, changing the raw
option hash. Site Editor creates a home template/relation with the corresponding
`wp_theme` count. These effects are retained; whole-database equality across
native saves is not claimed. Ordinary Author permissions remain unchanged.

One initial current-Core Chrome Widgets row **failed** after Update and REST
persistence at the general network-idle wait. No page error or main-byte mismatch
was observed. Native UI recovery restored the original caption. Diagnostics
identify a pending same-origin `OPTIONS /index.php?rest_route=/wp/v2/settings`
schema request; its underlying browser behavior remains unexplained. A separately
reviewed harness uses event timestamps and a bounded 500 ms quiet window for all
other requests, logging this exact method/origin/path/route exception. Save,
REST, reopen, live-render, asset-hash and page-error assertions remain strict.
Only that failed site/browser was rerun; its original failure is preserved.
Minimum Chrome's earlier PASS and the five later accepted rows are individually
identified with their runner hashes, rather than treating the failed file as
an all-pass result. Strict site selection prevents a zero-row success.

Fourteen owned fixture files were hash-verified and removed; only the owned lab
project was stopped. Databases, archives and rollback inputs remain. The new
native inventory contains 814 files. Prior 1,711-file RC4 native evidence and
215-file 0.8.3 failure evidence still match their original hashes.

## Independent source, build and package review

Independent isolated builds reproduce the main and unchanged bootstrap exactly.
The versioned main, latest alias, packaged main and generated local CDN asset
match. The embedded CSS grows from 6,736 to 6,850 bytes by exactly three alignment
rules. Removing only those rules reconstructs the previous CSS byte-for-byte,
including whitespace/order. The focused source review found no actionable issue.

The archive passes CRC, allowlist, safe-name, duplicate, permissions, timestamp,
ordering, deterministic repack and full source/file-map checks. Four package
tests pass. Their initial outdated root README version-row failure is retained;
correcting that documentation did not change package bytes.

Pinned PHP 7.0.33 and 8.3.35 each pass six packaged PHP lints, 167 asset assertions
using actual pinned Core tokenizers, and six unchanged i18n assertions. Fresh POT
extraction matches 63 messages except the creation timestamp. All four packaged
JavaScript files pass syntax checks. Installed Plugin Check 2.1.0 runs 29 static
and five runtime checks on current Core/PHP 8.3.35 with zero findings. Its bracket
preserves 17 candidate files and eight content tables. Update transients, the
active-plugin array's numeric index and `recently_activated` change as recorded;
whole-database equality is not claimed. The checker is deactivated afterward.

## Evidence scope and delivery boundary

Raw evidence is retained under ignored `.local/alignment-084-20261112/` and
`.local/candidate-116-rc5-20261112-a/`; it is available in this workspace, not
claimed uploaded to GitHub. Earlier failures and frozen acceptance snapshots are
preserved rather than rewritten as successful results.

The unchanged bootstrap/editor/serializer/schema contracts retain their historical
evidence only within those file boundaries. Broader RC4 deep-loading/non-HTML,
cache/optimizer, multisite and old-writer corpus results are not fresh RC5
execution, add zero new rows, and do not prove the changed main in those unrerun
environments. No blanket 42/42 release-gate claim is made.

[Draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
remains stacked on PR #18. Repository checks and Browser tests must both pass on
final HEAD. The post-push receipt belongs at
`.local/alignment-084-20261112/final-head-ci.json`; use the
[live PR checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks)
for any later HEAD. This avoids self-referencing a commit inside its own content.

Local CDN asset generation is complete; production delivery is pending and the
shared release remains incomplete. The last separately recorded public check
still served 0.8.1. A later authorized delivery must verify HTTP 200, exact SHA,
version metadata, references, cache headers and a real clock, retaining the prior
deployment for rollback. Neither merge, CDN delivery, owner-site installation
nor WordPress.org publication was performed by these two correction phases.
