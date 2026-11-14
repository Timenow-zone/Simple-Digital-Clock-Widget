# RC9 local gate closure and full matrix reconciliation

Date: 2026-11-12. **LOCAL EVIDENCE BLOCKERS CLOSED WITH INHERITED LIMITATIONS;
FULL RELEASE NOT READY; NOT PUBLISHED.**

Subject: frozen WordPress 1.1.6 RC9, 73,184 bytes / 17 files, ZIP SHA-256
`f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909`.
Main 0.8.4: `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
No product code, runtime, package metadata, POT or archive bytes changed.
The [machine-readable matrix](local-gates-rc9.json) binds each source by hash;
the [readiness addendum](RC9-READINESS.md) preserves the inherited issue disposition.

## Fresh execution in this closure

- Plugin Check 2.1.0: **29 static + 5 runtime checks, zero findings** on actual
  Core 7.1.4/PHP 8.3.35 and exact installed RC9. The observer records actual check
  selection without suppressing checks/results. Checker deactivated afterward.
  PHP 7.0 is unsupported by the checker; it is not an executed checker cell.
- Multisite: fresh two-site subdirectory network, Core 7.1.4/PHP 8.5.12,
  Twenty Twenty-Five / Twenty Twenty-Three. **10 role/phase workflows**: two each
  for baseline 1.1.2, RC9 read, RC9 save/reopen, files-only rollback 1.1.2 save,
  and RC9 reupdate/save; six of these workflows execute RC9. Superadmin and
  ordinary site admin retain their real permissions; the latter has no
  `unfiltered_html`. Both sites remain network-active. Three file transitions
  preserve all **16 ordered content-table hashes**, stable site/network options
  and exact files. Fourteen stored-content and eight frontend comparisons pass;
  three anonymous checks include the empty network root. Fixture publication
  through REST is setup, not a claimed native Publish-button test.
- Real cache: Core 7.1.4/PHP 8.3.35, Autoptimize 3.1.17 and WP Super Cache 3.1.4.
  **75 normal + 57 invalid-neighbor assertions**, three real ticking scenarios,
  four cache-generation controls and seven blocked-runtime assertions pass.
  Actual cache HIT and optimized control asset/order are observed. Captured
  aggregates contain the exact runtime/loader bytes once; an aggregate's full
  SHA is not mislabeled the standalone runtime SHA. Empty pages load zero main
  runtimes after purge. Content tables remain unchanged; the deliberate cache
  marker option and Core update transients are listed separately.
- Fresh official public 1.1.5 to RC9 through Core Plugin_Upgrader on both primary
  sites: eight tables/site and stable options preserved; old three-clock content
  reads and ticks before/after with matching served script hashes. Subsequent
  read-only brackets preserve eight tables, all options and all 17 plugin files.
- Exact-ZIP package: six PHP lints, 167 asset assertions and six i18n assertions
  on each PHP 7.0.33 / 8.3.35; four JS syntax checks. Fresh POT matches packaged
  POT except creation date; 49 dictionary keys and 65 gettext calls are checked.
- Actual Core routing/capture/registry/iframe probes: **138 assertions**, 69 per
  primary site. These PHP probes supplement native UI coverage; they do not
  replace browser rendering.

Browser versions: actual Google Chrome 157.0.8103.51 (`channel: chrome`, macOS),
Firefox 153.0 (pinned Linux arm64), WebKit 26.5 (macOS, not native Safari).
Multisite uses Chrome, satisfying its minimum single-browser requirement;
cache uses all three. Primary Core/PHP pairs remain 6.3.14/7.0.33 and 7.1.4/8.3.35.
Counts have different units and must not be combined into a full-product total.

## Negative controls and retained failures

The warmed old cache correctly continued serving the **old 1.1.2 HTML/script
hashes** after plugin replacement. Its expected empty-page zero-runtime failure
is retained, not accepted as RC9 execution. Explicit page/optimizer purge then
exposes exact RC9; an independent option marker proves old HIT, changed origin
with unchanged cached body, purge/new body, and new HIT. Cache purge is required
by the existing delivery contract, not a new automatic invalidation feature.

The first current-site public-1.1.5 frontend check timed out because the harness
counted exactly three clocks in the entire document, which also had six existing
Header clocks. A diagnostic observed all nine rendered. A new harness version
scopes the three-clock assertion to post content and verifies identical settings
and live ticking; original method, failed receipt and diagnostic remain. No
plugin or fixture content was changed to obtain this pass. Initial database
readiness failures are also retained, distinct from product results.

Fresh cache/network PHP logs contain Core update-service connection warnings and
WP-CLI color-helper deprecations on PHP 8.5; no plugin-origin warning/fatal was
found there. Logs are retained; no blanket clean-environment claim is made.

## Justified historical scope

RC4 to RC5 changed the main's alignment class selection and exactly three CSS
alignment rules, plus two PHP version references and readme. Removing those
rules reconstructs old CSS exactly. RC5 to RC9 changes only the Gutenberg
inspector, one translation dictionary entry, POT and readme. The loader is
byte-identical RC4 through RC9; routing PHP is identical after only 0.8.3/0.8.4
substitution; block attribute schema, save implementation and KSES are unchanged.
The new scope receipt verifies these boundaries against all three frozen ZIPs.

Thus RC4 deep routing, non-HTML, owners, original hidden-root integrations,
negative CSP/timeout and approved old-runtime override proofs remain evidence
for those unchanged mechanisms. They add **zero new RC9 executions**. RC9's
recorded six required main-artifact environment/browser cells, renderer/error
isolation tests, and this fresh cache/network run establish exact-main behavior.
The separately tested new Gutenberg behavior is never inherited from RC4.
Ten historical inventories were rehashed: **4,796 files, zero mismatches**.

## All 42 required gates

`PASS_RC9` means actual exact-RC9 evidence (this turn or a verified earlier RC9
run). `PASS_WITH_SCOPED_HISTORY` explicitly combines current proof with the
unchanged-mechanism inheritance above. An inherited limitation is not a fixed
failure or an unrestricted PASS. Pending external gates and the publication hold
are not passed release gates. Evidence keys below resolve in the JSON receipt.

| Gate | Disposition | Verified scope and evidence keys |
| --- | --- | --- |
| ID-01 | `PASS_RC9` | Exact ZIP/manifest/17 source files; fresh final identity on both primary sites and cache/network. Files remain exact through recorded transitions. Evidence: `rc9`, `data115`, `cache`, `network`, `teardown`. |
| ID-02 | `PENDING_EXTERNAL` | Local build and immutable bytes verified; public production 0.8.4 delivery and rollback deployment receipt still pending authorization. Evidence: `build`, `local`, `history`. |
| LOAD-01 | `PASS_WITH_SCOPED_HISTORY` | RC9 empty-page/native boundaries and fresh three-browser cache empty-page proof; complete two-theme no-use matrix retained from RC4 for unchanged routing/loader. Evidence: `native`, `cache`, `core`, `rc4-native`, `scope`. |
| LOAD-02 | `PASS_WITH_SCOPED_HISTORY` | RC4 escaped/script/template frontend rows in both themes/sites and all three browsers; unchanged detector/loader, re-executed RC9 PHP/loader contracts. No fresh full native escaped-content matrix claimed. Evidence: `rc4-native`, `scope`, `package`, `browser`. |
| LOAD-03 | `PASS_RC9` | Recorded RC9 owned/raw, single/multiple settings, nesting and actual ticks; new network/cache observations. Evidence: `native`, `rc9`, `network`, `cache`. |
| LOAD-04 | `PASS_WITH_SCOPED_HISTORY` | RC9 Site Editor and classic/sidebar native coverage; RC4 pattern/reusable/native-template resolution supplements placements through unchanged routing and serializer. Header navigation limitation belongs to UI-03. Evidence: `native`, `rc4-native`, `scope`. |
| LOAD-05 | `PASS_WITH_SCOPED_HISTORY` | RC9 unchanged legacy Text/Custom HTML native preview and preserved widget fixtures; RC4 raw/core-html frontend matrix supplements unchanged persistence/routing. Evidence: `native`, `rc4-native`, `scope`. |
| LOAD-06 | `PASS_WITH_SCOPED_HISTORY` | RC9 exact-main dynamic insertion/reconnection; RC4 immediate-removal/inert and original hidden-root controls plus RC9 loader suite cover unchanged shell activation. Evidence: `native`, `browser`, `rc4-native`, `scope`. |
| LOAD-07 | `PASS_WITH_SCOPED_HISTORY` | Fresh RC9 actual-Core empty-owned/render probes and pinned PHP checks; RC4 discarded-owned/forced-global sensitivity cases retain prior-use queue behavior. Evidence: `core`, `package`, `rc4-native`, `scope`. |
| LOAD-08 | `PASS_WITH_SCOPED_HISTORY` | Fresh RC9 loader suite and Core registry/queue probes; RC4 actual-Core owner/order cases carried for unchanged loader and version-only routing change. Evidence: `browser`, `core`, `rc4-native`, `scope`. |
| LOAD-09 | `PASS_WITH_SCOPED_HISTORY` | RC4 fallback-disabled owned/helper and deliberately disabled-native controls, both Core versions/three browsers; unchanged PHP native enqueue path re-executed in RC9 probes. Evidence: `rc4-native`, `core`, `scope`. |
| CORE-01 | `PASS_WITH_SCOPED_HISTORY` | Fresh RC9 Core helper/late/dependency probes. RC4 native frontend order and 42 immutable-0.8.1 override rows retained: eager runtime even on empty pages is owner-approved. Those rows do not execute 0.8.4. Evidence: `core`, `rc4-native`, `override`, `scope`. |
| CORE-02 | `PASS_RC9` | Fresh actual-Core 58 frontend assertions/site include registry clone/queue/buffer/order/filter isolation; editor/preview modes add 11/site. Evidence: `core`. |
| MIME-01 | `PASS_WITH_SCOPED_HISTORY` | RC4 parsed REST/feed/robots/trackback/JSON/XML and escaped JSON leak scan, both sites/three browsers. No-runtime path is byte-identical after version substitution; fresh RC9 PHP ordinary-json/REST/iframe guards. Evidence: `rc4-native`, `scope`, `package`. |
| CSP-01 | `PASS_WITH_SCOPED_HISTORY` | RC4 actual-Core external-only static/raw/explicit cases and RC9 loader suite; preserved PHP/loader plus exact 0.8.4 rendering proof. RC4 responses are historical, never relabeled as RC9. Evidence: `rc4-native`, `browser`, `scope`, `rc9`. |
| CSP-02 | `PASS_WITH_SCOPED_HISTORY` | RC4 native permitted/invalid nonce and valid/invalid SRI controls; unchanged attribute-preserving loader and capture logic. Fresh RC9 loader and Core-filter assertions supplement. Evidence: `rc4-native`, `browser`, `core`, `scope`. |
| ERR-01 | `PASS_WITH_SCOPED_HISTORY` | RC9 repository error cases and native invalid-clock controls; fresh cache blocked-runtime real timeout. RC4 full actual-Core timeout/404 and negative policy sequence remains scoped historical proof. Evidence: `browser`, `native`, `cache`, `rc4-native`, `scope`. |
| UI-01 | `PASS_RC9` | Independent 12/12 inspector cells and native Post Editor save/reopen/lifecycle, both roles/Core versions/three browsers. Evidence: `independent`, `native`. |
| UI-02 | `PASS_RC9` | Public-1.1.2 native corpus read before save, repeated saves/reopens and RC9 reupdate; bounded corpus only. Evidence: `independent`. |
| UI-03 | `PASS_WITH_INHERITED_LIMITATION` | Native save/readback/frontend pass; original current-Core WebKit Header same-tab strict no-pageerror does not pass. Fresh-tab alternative explicit. Exact diagnostic also occurs in 1.1.2; inherited and open. Evidence: `native`, `webkit`. |
| UI-04 | `PASS_RC9` | RC9 canonical block Widgets native Update/reload/restoration on both classic-theme sites and three browsers. Evidence: `native`. |
| UI-05 | `PASS_RC9` | RC9 Text and Custom HTML previews: 12 actual isolated preview documents across sites/browsers; exact per-realm main. Evidence: `native`. |
| UI-06 | `PASS_RC9` | RC9 delete/undo/reinsert, multiple clocks and actual supported iframe/metabox modes; ordinary dashboard boundaries. No native Safari/OS IME claim. Evidence: `native`, `independent`. |
| UI-07 | `PASS_RC9` | RC9 captured editor/preview per-realm assets and fresh actual-Core repeated content-hook/iframe registry checks. Evidence: `native`, `core`. |
| COMP-01 | `PASS_WITH_SCOPED_HISTORY` | RC4 original explicit signal + whenDefined/open/closed-root fixtures, both sites/three browsers; unchanged host lifecycle and loader. RC9 exact main confirms installation/rendering and error isolation. Evidence: `rc4-native`, `scope`, `rc9`, `browser`. |
| COMP-02 | `PASS_WITH_SCOPED_HISTORY` | Original signal-free whenDefined/open/closed-root fixture bodies remain unchanged and passed RC4; same shell lifecycle in RC9. Immutable runtime override exception separately approved and proven. Evidence: `rc4-native`, `override`, `scope`. |
| DATA-01 | `PASS_WITH_SCOPED_HISTORY` | RC9 native corpus/Unicode/escaping and current exact-ZIP i18n checks. Extended RC4 foreign metadata/entities/relationships corpus carries only unchanged schema/save/KSES; old terminal-backslash writer limits retained. Evidence: `independent`, `rc4-native`, `scope`, `package`. |
| DATA-02 | `PASS_RC9` | RC9 recorded public112 rollback/reupdate transitions preserve eight content tables/site, stable options, active state and exact files; no DB restore. Evidence: `independent`. |
| DATA-03 | `PASS_RC9` | Fresh official public115 -> exact RC9 through Core Plugin_Upgrader on both primary sites; eight tables/stable options preserved; three old clocks render/tick before and after. Evidence: `data115`. |
| DATA-04 | `PASS_RC9` | Fresh RC9 bracketed frontend reads on both sites leave eight tables, all options and all 17 files unchanged. Warm/transition effects are separate. Evidence: `data115`. |
| DATA-05 | `PASS_WITH_INHERITED_LIMITATION` | Bounded old/new healthy native saves after public112 rollback and readback after RC9 reupdate pass. Full old-editor usability remains NOT PASS for inherited cleared-gradient panel; old terminal-backslash negative cases remain separate. Evidence: `independent`, `rc4-native`, `scope`. |
| NET-01 | `PASS_RC9` | Fresh two-site network, Core7.1.4/PHP8.5.12, superadmin and non-super site admin without unfiltered_html; actual upgrade/files-only rollback/reupdate, saves/reopens, 16 tables per transition. Chrome minimum exceeded by actual Google Chrome. Evidence: `network`. |
| CACHE-01 | `PASS_RC9` | Fresh Autoptimize3.1.17 + WP Super Cache3.1.4 real HIT, aggregation, independent order, exact main bytes, zero-runtime empty page after purge; Chrome/Firefox/WebKit. Evidence: `cache`. |
| CACHE-02 | `PASS_RC9` | Fresh old-cache bodies/SHA remain old after update; excluded from candidate execution. Purge produces exact RC9. Separate option-generation old HIT -> purge -> new HIT proves sensitivity. Evidence: `cache`. |
| PKG-01 | `PASS_RC9` | Fresh six package PHP lints and 167 asset assertions on each pinned PHP7.0/8.3; four JS syntax checks; recorded current harness/repository checks. Evidence: `package`, `local`. |
| PKG-02 | `PASS_RC9` | Fresh Plugin Check2.1.0, actual29 static +5 runtime checks, exact installed17-file RC9, zero findings on Core7.1.4/PHP8.3.35. Checker unsupported on PHP7.0; product runs/lints there separately. Evidence: `plugin-check`. |
| I18N-01 | `PASS_RC9` | Fresh exact-ZIP POT extraction equals packaged POT except creation date;49 dictionary keys/65 gettext calls; six context/escaping assertions per PHP version. Evidence: `package`, `independent`. |
| REG-01 | `PASS_RC9` | Recorded exact-RC9 259 browser leaves,53 focused contracts,4 package checks,16 commands including isolated production reproduction. Code unchanged this turn; no redundant full rebuild. Evidence: `rc9`, `local`, `browser`, `history`. |
| DOC-01 | `PASS_RC9` | Local header/readme/POT/notices/manifest/source links already checked; new full42-row accounting and readiness synced. Final remote PR metadata/checks remain CI-01, not asserted current. Evidence: `rc9`, `package`, `scope`. |
| CI-01 | `PENDING_EXTERNAL` | Repository checks and Browser tests must pass on exact final authorized PR HEAD including these docs; prior HEAD cannot certify it. Evidence: `rc9`. |
| SAFE-01 | `PASS_RC9` | New cache/network projects, isolated existing primary lab continuation, immutable archives and old evidence retained; only owned projects stopped, databases/rollback copies retained. Evidence: `history`, `teardown`. |
| REL-01 | `HELD_BY_OWNER` | No commit/push/merge/CDN/WordPress.org publication. Exact candidate/rollback retained; release stays incomplete until external gates and explicit authorization. Evidence: `teardown`, `rc9`. |

## Remaining boundaries

No unmapped local matrix row or outstanding local evidence gap remains. This is
**not 42/42 fresh unrestricted PASS**. UI-03 retains the inherited WebKit
same-tab diagnostic; DATA-05 retains the inherited old-editor gradient panel
limit. Neither is a new RC9 regression or claimed fixed by this closure.

Final PR HEAD must still pass required hosted `Repository checks` and `Browser
tests` (CI-01). Production CDN delivery of exact 0.8.4, version/reference/cache
checks, clock smoke and retained rollback deployment remain unverified (ID-02).
Both are outside this no-publication closure. No commit, push, merge, CDN or
WordPress.org publication was performed or authorized.

Evidence is local under `.local/rc9-local-gates-20261112/`; primary receipts use
fresh `lg-*` labels in `.local/candidate-webkit-plugin-ab-20261112/evidence/`.
Only the two new cache/network projects and the resumed owned primary project
were stopped; their databases, containers, archives and rollback copies remain.
Prior readiness documents are retained in the new run directory; frozen prior
acceptance reports/manifests and historical failures remain unchanged.

The new run inventory seals 556 evidence/input/method files (live databases and
private configuration excluded). Final validation checks 529 pre-existing
workspace files: only the three current readiness documents changed; two new
release-accounting documents were added. All 17 source files and the frozen ZIP
remain exact. Public-prose and whitespace checks pass.
