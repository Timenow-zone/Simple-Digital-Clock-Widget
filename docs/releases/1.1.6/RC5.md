# WordPress 1.1.6 RC5 candidate

Date: 2026-11-12. Status: **FROZEN; EXACT-ARTIFACT ACCEPTANCE IN PROGRESS**.
This candidate bundles [widget 0.8.4](../0.8.4/README.md), the minimal
[MULTI-ALIGN-P2-01 correction](../../defects/MULTI-ALIGN-P2-01.md).

| Item | Identity |
| --- | --- |
| Archive | `.local/packages/simple-digital-clock-1.1.6-rc5.zip` |
| ZIP SHA-256 | `800bac5294632cf8a581719cdbdffb5ef20b2a20e9a71195f554f45e72c2d3dd` |
| Size/layout | 72,568 bytes; 17 regular files |
| Frozen manifest | [manifest-rc5.json](manifest-rc5.json) |
| Executable source | `b1af416e8373bc0bec0163ee36a03507f3ddcaaa` |
| Main | 0.8.4; 36,430 bytes; SHA-256 `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Bootstrap | Unchanged 5,614 bytes; SHA-256 `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |

The executable commit contains 16 exact package files. The readme's exact source
link was finalized afterward. All 17 files match containing commit
`7cf895dff9588e64e4329380dc090a83f0af5157`. The frozen manifest honestly retains its initial `NOT_RUN` snapshot.

Exactly three package files differ from RC4: main runtime, assets PHP (both
runtime-version references) and readme. Fourteen files, including bootstrap,
editor, KSES, translations and notices, are identical. There is no migration,
serializer, loader lifecycle or saved-setting schema change.

Acceptance requires the exact main in HTML and native WordPress in actual Chrome,
Firefox and WebKit, including single/multiple different configurations,
default/empty/removed alignment, JS property changes and physical alignment under
LTR/RTL. Relevant runtime, native frontend/editor/preview, package and regression
checks remain required. Explicitly scoped inheritance cannot be relabeled as
fresh execution of the changed main.

RC4 remains frozen and NO-GO for the recorded alignment defect; RC3 remains
NO-GO for initial-host error isolation. Their bytes and reports are unchanged.
New correction evidence is under `.local/alignment-084-20261112/`, with native
RC5 evidence in its separately named new run. No merge, CDN delivery or
WordPress.org publication is performed by preparing this candidate.
