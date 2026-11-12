# WordPress 1.1.6 release preparation

## Current RC9 readiness

Current local candidate: **RC9; LOCAL EVIDENCE BLOCKERS CLOSED WITH INHERITED
LIMITATIONS; FULL RELEASE NOT READY; NOT PUBLISHED**.
The [readiness addendum](RC9-READINESS.md) and [receipt](readiness-rc9.json)
record the owner-requested inherited classification of the WebKit
`template-parts` diagnostic, the exact 1.1.2/RC9 comparison, confirmed coverage
and remaining release gates. The [local closure](RC9-LOCAL-GATES.md) records
fresh Plugin Check, multisite, cache and package checks plus all 42 matrix rows;
final hosted CI and production CDN delivery remain pending. The [original RC9 acceptance](FINAL-ACCEPTANCE-RC9.md)
remains a preserved execution snapshot. No package or frozen manifest is changed
by this status update.

## Historical RC5 preparation snapshot

Status: **RC5 FROZEN; SCOPED ALIGNMENT ACCEPTANCE PASS; DELIVERY PENDING**.
Selected [RC5](RC5.md) contains [widget 0.8.4](../0.8.4/README.md). The
[two-phase defect record](../../defects/MULTI-ALIGN-P2-01.md) preserves the red
baseline and requires new exact-artifact HTML/WordPress verification.

## Selected artifact

| Item | Identity |
| --- | --- |
| Candidate | RC5, internal plugin version 1.1.6 |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc5.zip` |
| SHA-256 | `800bac5294632cf8a581719cdbdffb5ef20b2a20e9a71195f554f45e72c2d3dd` |
| Layout | 72,568 bytes; 17 regular files |
| Manifest | [Frozen RC5](manifest-rc5.json); [current pointer](manifest.json) |
| Executable source | `b1af416e8373bc0bec0163ee36a03507f3ddcaaa` |
| Full package containing commit | `7cf895dff9588e64e4329380dc090a83f0af5157` |
| Shared widget | 0.8.4; 36,430 bytes; SHA-256 `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |

The executable commit contains 16 exact package files; the finalized readme source
link follows that commit. All 17 files match the containing commit. The frozen
manifest retains its initial pre-acceptance `NOT_RUN` status; final acceptance
is recorded in the separate [RC5 report](FINAL-ACCEPTANCE-RC5.md) and
[evidence index](acceptance-rc5.json).

## Change and acceptance scope

The shared component now uses explicit left/center/right class names so Tailwind
emits their actual CSS. Missing, empty and removed alignment select center.
Physical left/right remains correct under RTL. Initial-host error isolation and
readiness from 0.8.3 are unchanged. The bootstrap remains byte-identical.

Exactly three files differ from RC4: main runtime, assets PHP (both runtime
version references) and readme. The remaining 14 files, including editor, KSES,
translations, notices and bootstrap, are identical. There is no database migration
or serializer/schema change.

The [asset contract](../../WORDPRESS-ASSET-CONTRACT.md),
[acceptance matrix](ACCEPTANCE-MATRIX.md) and defect record require the exact main
in ordinary HTML and installed WordPress with actual Google Chrome, Firefox and
WebKit. Single/multiple different configurations, property changes, default and
removed alignment, real ticking, instance isolation and computed LTR/RTL are
explicit checks. Native frontend/editor/preview and relevant loading/package
regressions supplement the mandatory six environment/browser cells.

Native Core enqueue and the default empty-page zero-runtime contract remain.
Opaque overrides retain their [approved eager exception](OVERRIDE-POLICY.md).
Fresh RC5 execution and historical unchanged-code evidence must be separated;
previous passes cannot substitute for the changed main artifact.

## Preserved historical candidates

- [RC4](RC4.md) and [0.8.3](../0.8.3/README.md) remain frozen and NO-GO for
  [MULTI-ALIGN-P2-01](../0.8.3/MULTI-INSTANCE-REVIEW.md). Their earlier scoped
  [snapshot](FINAL-ACCEPTANCE-RC4.md) and [index](acceptance-rc4.json) are unchanged.
- [RC3](RC3.md) remains NO-GO for initial-host error isolation; its snapshot,
  manifest, archive and raw evidence are retained.
- [RC2](RC2.md) retains its old-runtime conflict; [RC1](RC1.md) retains its native
  preview/CSP/hidden-integration failures. No old receipt is rewritten as PASS.

## Release boundary and rollback

[Draft PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
remains stacked on PR #18. Required Repository checks and Browser tests must pass
on final HEAD. No merge or branch-protection bypass is authorized here.

Production CDN delivery remains pending: it needs separate authorization and
public HTTP/SHA/version/cache/reference/clock proof with prior deployment retained.
The withdrawn 0.8.2 preview must not be promoted. WordPress.org publication also
requires an explicit owner instruction. This is not `READY_FOR_WP_PUBLICATION` or
a completed shared release.

The accepted local 1.1.5 rollback archive is
`.local/packages/simple-digital-clock-1.1.5-final.zip`, SHA-256
`2b6b2ed361115aec5dbddad058bf38411534c53705ccc5315b1fd6e756386aa2`.
The official public ZIP has a different container hash and identical installed
files. Rollback changes plugin files without restoring the database. Verify exact
runtime/bootstrap responses and relevant cache purges after a future install or
rollback. Raw candidate archives and evidence remain under ignored `.local/` paths.
