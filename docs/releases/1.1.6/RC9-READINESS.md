# RC9 readiness and inherited issue disposition

Date: 2026-11-12. **LOCAL EVIDENCE BLOCKERS CLOSED WITH INHERITED LIMITATIONS;
FULL RELEASE NOT READY; NOT PUBLISHED.**

This is the current readiness addendum to the preserved
[RC9 acceptance snapshot](FINAL-ACCEPTANCE-RC9.md). The owner requested that
the exact WebKit `template-parts` diagnostic be recorded as inherited rather
than a new RC9 regression. The [machine-readable receipt](readiness-rc9.json)
binds this disposition and the supporting reports to their hashes. Historical
raw outcomes, strict error assertions, archives and manifests are not rewritten.

## Exact candidate

- WordPress 1.1.6 RC9, 73,184 bytes, 17 files.
- ZIP SHA-256: `f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909`.
- Frozen [manifest](manifest-rc9.json) SHA-256: `e0009d6aaffdcd071d8c2c1567212c564e692b2e920c6f0885e3121fd700f0ca`.
- Shared main 0.8.4 SHA-256: `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Loader SHA-256: `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.

The two fixes concern Gutenberg gradient clearing/reopening and stale Time Zone
selection. Runtime, loader, serializer and attribute schema are unchanged by
these fixes. This readiness update changes documentation only.

## WEBKIT-TEMPLATE-PARTS-01: inherited, open, not an RC9 regression

On the same WordPress 7.1.4 / WebKit 26.5 installation and identical Header with
six clocks, the exact diagnostic occurred in **4/4 public 1.1.2** and **2/4 RC9**
same-tab reopen runs. A fresh-tab control passed once per version. All ten
accepted workflows saved successfully, retained identical content and six clock
attribute objects across versions, and rendered all six clocks after reopening.
Every diagnostic matches the original endpoint/query, full Core stack and
`same-tab-reopen-navigation` phase; only the loopback origin/port is normalized.
The separate pilot rejected by an overstrict HTTP 304 icon-cache check is retained
and excluded. The accepted ten runs use the same corrected harness.

The diagnostic is therefore **not newly introduced by RC9**. The observed rates
do not prove improvement, and testing 1.1.2 on current Core/WebKit does not date
the historical onset. The version-comparison report is retained at
`.local/webkit-112-rc9-20261112/REPORT.md` with raw results and signature checks.

A separate Core-only Header with 60 additional Paragraph blocks reproduces the
same signature 3/3 with the plugin fully disabled and 3/3 with RC9. That control
contains no clock markup and the disabled arm loads no plugin code. It proves
that plugin execution is not necessary, but uses a different document from the
six-clock comparison. Its report is
`.local/webkit-template-parts-ab-20261112/REPORT.md`. The low-level responsibility
between WordPress and WebKit/Playwright remains unproven.

Disposition: **INHERITED_OPEN_NOT_RC9_REGRESSION**. This issue is not a new RC9
regression blocker. It is not fixed, its strict same-tab no-pageerror result is
still NOT PASS, and the fresh-tab alternative must remain explicitly labeled.
No universal error-free Site Editor claim or blanket release waiver follows
from this classification.

## Confirmed RC9 coverage

| Scope | Evidence-backed result |
| --- | --- |
| Both Gutenberg fixes | 12/12 independent native cells: two Core versions, three browsers, Admin/Author |
| Exact main in ordinary HTML and WordPress | 6/6 required environment/browser combinations; 96 workflows, including single/multiple independent clocks |
| Native regression matrix | 174 accepted workflows, including one fresh-tab alternative; original strict same-tab coverage remains 173/174 |
| Existing browser repository suites | 259 passing leaf executions |
| Focused/package/repository checks | 53 focused contracts, 4 package checks, 16 repository commands |
| Old-content upgrade and reupdate | Bounded native corpus passes reading, settings, saving, reopening and frontend behavior |
| Files-only rollback | Bounded data-preservation checks pass; old-editor usability has the limitation below |
| 1.1.2 versus RC9 targeted comparison | 10/10 persistence/validity/rendering checks; exact diagnostic present in both versions |

The original acceptance identifies actual Google Chrome 157.0.8103.51,
Firefox 153.0 and WebKit 26.5, WordPress 6.3.14/PHP 7.0.33 and
WordPress 7.1.4/PHP 8.3.35. Chromium suite runs are not relabeled as Chrome;
WebKit is not installed Safari verification. Counts describe different scopes
and must not be summed as independent full-product tests.

## Other inherited limitation

The old Background Color inspector can crash for a cleared-gradient document
after rollback to RC5/public 1.1.2, observed on Core 6.3.14/Chrome. RC5 also
reproduces it with its own cleared document. RC9 opens that panel correctly,
including after reupdate. Data preservation and full old-editor usability have
separate verdicts; **full rollback editor compatibility is not PASS**.

## Remaining release gates

No new blocking defect is established in the tested RC9 fix/main-compatibility
scope. Full release readiness is a separate verdict and is not established:

The local evidence gaps are now closed by the
[exact-RC9 local gate closure](RC9-LOCAL-GATES.md) and its
[42-row receipt](local-gates-rc9.json): Plugin Check (29 static + 5 runtime, zero
findings), fresh cache/optimizer tests in three browsers, fresh two-site
multisite lifecycle, public 1.1.5 upgrades on both primary sites, exact-ZIP
PHP/POT checks and 138 actual-Core assertions. Every required matrix row has
actual RC9 evidence or a documented unchanged-mechanism carry-forward;
historical executions are not counted as fresh RC9. The two inherited
limitations above remain explicit, so this is not 42 unrestricted PASS results.

1. **CI-01:** required hosted `Repository checks` and `Browser tests` on the exact
   final RC9 PR HEAD, including final documentation, are not established by the
   local evidence. Branch protection remains mandatory.
2. **ID-02:** production delivery of the accepted shared 0.8.4 artifact is not
   verified in the release evidence. After authorization, it requires public
   HTTP/body SHA, version/reference/cache checks and a real clock, with the prior
   deployment retained. A WordPress-only package does not close shared delivery.

WordPress.org publication, merge and CDN deployment have not been authorized or
performed in this update. The owner's current instruction is **no publication**.
The inherited issues remain explicit constraints on claims, even after the
procedural/evidence gates above are closed.

## Verification and preservation

The 21 principal references in the original RC9 receipt were rehashed without
mismatches, as were the 348-file exact-error investigation and 139-file version
comparison inventories. Their original failures remain intact. The exact RC9
ZIP, manifest and installed/source file map are retained. Product code, runtime,
package metadata, POT and archive bytes are not modified by this addendum.
The release index points here while preserving its historical RC5 snapshot.

The closure additionally rehashed ten historical inventories (4,796 files, zero
mismatches), retained earlier readiness documents, and stopped only owned test
projects with databases and rollback copies preserved. The new report and JSON
receipt distinguish fresh execution, scoped history and still-open limits.
