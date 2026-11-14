# Exact RC18 inherited-defect correction and acceptance

Status: **SCOPED FUNCTIONAL CORRECTION: PASS; STRICT EDITOR DIAGNOSTICS: NOT_CLEAN; FULL RELEASE: NO-GO; NOT PUBLISHED**.

The reproduced inherited comment-context defects are corrected. No introduced
functional regression was found in the executed, bounded matrix. Remaining
unclassified admin diagnostics and unexecuted full-release gates prevent a
complete release GO. Functional success is not a claim of zero browser errors.

## Artifact and change boundary

| Item | Identity |
| --- | --- |
| Plugin candidate | 1.1.6 RC18, 82,060 bytes, 20 regular files |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc18.zip` |
| ZIP SHA-256 | `b59adf31cf9b9f8e7826e2540c81a3621d673c44f2eae65145b96a6b2b353429` |
| Manifest | `docs/releases/1.1.6/manifest-rc18.json` |
| Manifest SHA-256 | `7c09c3efc71bff139d85fd80d4e79575be070c38ab018e1b450e7d098c8e486d` |
| KSES PHP SHA-256 | `a57f24fdcf15d0d941dc5f1ff0dae98035545a50d34347f92a0b489b9f41d6c2` |
| Runtime 0.8.4 SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Source base | `94db2495c9547b993e835a2150ce647abbe9e065`; uncommitted source |

Only KSES PHP and readme differ from RC16. The other eighteen files, including
runtime, loader, Gutenberg, TinyMCE, stale-save guard and POT, are byte-identical.
RC18 differs from RC17 only in the readme Upgrade Notice. RC17 remains frozen
NO-GO after Plugin Check reported 341 characters against a 300-character limit.
RC18 has 279 characters; a permanent package test now guards that limit.

The source base alone does not identify the candidate. The archive and full file
map do. The frozen manifest retains its creation-time `acceptance: NOT_RUN`;
the final acceptance receipt records executed results separately. No database
migration, shared runtime change or publication is part of this correction.

## Reproduced defect and fix

The exact RC16 baseline reproduced ten inherited comment-like cases on two Core
versions: quoted attribute, SCRIPT, XMP, NOSCRIPT, PLAINTEXT, unterminated comment,
incorrect closer, SVG CDATA, MathML CDATA and malformed HTML-context CDATA.
In each twenty-case mixed or pure baseline group, nineteen observations create
HTML clock elements; current-Core MathML creates one foreign node rather than a
working custom element. Namespace-aware
live browser checks correct that interpretation without rewriting old evidence.

Fresh native Classic evidence contains 60/60 red-to-green mixed-content
comparisons: ten vectors, two Core environments and three actual browsers. The
predecessor reference comprises twenty Chrome mixed-case observations reused
across the three candidate engines, not sixty separate predecessor runs. Each
performs two Save/reopen rounds and retains both real clocks, their independent
settings and ticking. Twenty pure-example Author/Chrome cases produce no HTML or
foreign clock nodes and no runtime request. `RED-GREEN-PROOF.json` in the editor
evidence binds both exact archives and every underlying row.

The existing pre-KSES hook escapes eligible examples in their native lexical
contexts. DATA comments retain inert comment boundaries; opaque text/attribute
regions preserve actual container delimiters. Bounded CDATA processing resumes
after the declaration rather than treating its fake tags as the remaining page.
Unfiltered saves, native permissions, allowlists and stricter filters stay intact.
No unsanitized HTML is restored after KSES.

Two browser-empty comments also caused native saves to lose a real clock. A
filter trace demonstrated that Core's block-attribute pass corrupts a subsequent
`<!---->` token. Canonical `<!-- -->` preserves both clocks through the complete
save pipeline and a repeated save. This is intentionally normalized source, not
byte-for-byte preservation of malformed input.

This prevents the reproduced conversions when the original comment-like content
is saved. It does not guess which already-stored real elements came from a
previous damaged save. Recover such content from a revision or backup before
saving it with the corrected plugin; no automatic database rewrite is performed.

Rejected prototypes exposed and resolved neighbor loss, a missing Core 6.5/6.6
text-setter API, and repeated-tail scanning. They were never frozen as accepted
artifacts. Final PHP uses the supported existing bookmark adapter; independent
6.5/6.6 lexer checks are supplementary, not full installed-Core acceptance.

## Fresh exact-artifact verification

Both native environments use real Apache requests: WordPress 6.3.14/PHP 7.0.33
and WordPress 7.1.4/PHP 8.3.35. The current compatibility site has ten pinned
third-party plugins. This is the requested synthetic environment, not a real-site
copy or proof of every production configuration.

| Scope | Result |
| --- | --- |
| Native editor matrix | 278/278 canonical functional flows; 269/278 rows without pageerrors; 146/278 raw diagnostic-free rows |
| Exact extracted runtime in ordinary HTML | 24/24 scenarios |
| Ordinary HTML single/six independent instances | 6/6 |
| Installed WordPress empty/single/three instances/inert comment | 24/24 strict |
| Server-cache baseline/no-purge/purge/reupdate | 48/48 strict; HTML and optimizer responses match copied cache files |
| Already-open frontend tabs across cache checkpoints | 12/12 |
| HTTP update, files-only rollback, HTTP reupdate on two sites | 6/6 content tables, target files and activation; stable options 4/6 |
| Fresh Plugin Check 2.1.0 | 29 static + 5 runtime; zero errors and warnings |
| Separate exact installed KSES/security checks | 122/122 |
| Root Core KSES and separate guard unit harness | 96 native comment assertions + 52 guard assertions with authorization doubles per environment; seven PHP lints per environment |
| Local repository validation | 21 command groups, including 65 WordPress contracts and 22 Node units; all pass |
| Local browser workflow | Five groups pass: WTR 48 per engine, iframe 3, fonts 10, serialization 3, Classic schema 3, loader 96 leaf tests + 3 browser parents, product-site 3 |
| Syntax supplement | 24/24 |

Counts describe different units and revisit documents; do not sum them as unique
user scenarios. Local workflow checks use installed dependencies, not a fresh
`npm ci`. They are not hosted Repository checks or Browser tests on a new HEAD.
The guard unit harness uses explicit permission/nonce doubles; real HTTP guard
acceptance belongs to the independently executed old-editor scenarios.

The native matrix comprises Classic 144, pure examples 20, Gutenberg 40, autosave
40, own Widget block 6, old Visual tabs 24 and old HTML/Text tabs 4. Classic is
the full two-Core, two-role, three-browser matrix for twelve mixed/control
fixtures. Pure examples use Chrome/Author. Gutenberg and autosave cover all ten
vectors in Chrome/Author plus role/browser boundary subsets; they are not a full
Cartesian product of every vector, browser and role.

Eighteen unfiltered Admin PLAINTEXT/CDATA rows retain RC16's native footer
suppression and are equivalence checks, not successful widget rendering. The six
own-block rows verify native insertion, Caption/Width, two Save/reopen rounds,
literal caption JSON and foreign-block preservation. Existing frontend entity
decoding remains equal to RC16 and is not called an ideal literal-entity UI pass.

Autosave uses actual Core Heartbeat HTTP and stored revisions. Its DOM check
replays the saved revision in a real same-origin frontend region with the normal
runtime; it does not navigate native WordPress preview. All forty parent records
remain unchanged; all metadata other than Core's advisory edit lock also remain
unchanged. The edit lock changes in 37 cases; three preserve all metadata. Two original autosave attempts
completed persistence but stopped at an overlong supporting replay label. Those
failures are retained; two targeted reruns finish the missing oracle, without
counting retries as additional unique flows. Native old-tab cases exercise
public 1.1.5 or RC16 forms across actual HTTP updates to RC18.

The mandatory exact main-script gate passes all six combinations:

| Browser | Platform | Standalone HTML | WordPress |
| --- | --- | --- | --- |
| Google Chrome 157.0.8103.51 | macOS arm64 | PASS | PASS |
| Firefox 153.0 | Linux arm64 | PASS | PASS |
| WebKit 26.5 | macOS arm64 | PASS | PASS |

The Chrome gate uses the actual Chrome channel. WTR's Chromium run is separate.
WebKit is not a claim of native Safari validation. The independent native
editor matrix uses the pinned Linux Firefox and WebKit server; the mandatory
compatibility gate above uses macOS WebKit. Tests check visible clocks,
time advancement, independent settings, current-time validity, exact loaded
runtime bytes, and zero runtime on empty/inert WordPress conditional-loader pages.
An explicit standalone HTML script embed loads that script normally.

## Exceptions and evidence limits

The native matrix has 278 functional passes, 269 rows without a captured
pageerror, and only 146 rows free of all captured diagnostics. Nine rows have
pageerrors; four additional pageerrors occur outside an active row. External
resource aborts intentionally applied by the native harness produce retained
console errors. Twelve Gutenberg `allow-presentation` sandbox warnings are also
retained. The independent frontend/cache scope's zero-error result must not be
extended to this editor scope.

A fixed WebKit control performs nine functional flows in each of RC18, RC16 and
plugin-disabled modes (three fresh contexts per mode). The original preferences
`[object Object]` rejection does not recur in any mode. Its attribution therefore
remains unresolved; non-reproduction is not proof of absence. A separate initial
dashboard `admin-ajax/getEvents` access-control message recurs in all three fresh
contexts in every mode, including verified inactive plugin state. That narrowly
proves this navigation diagnostic does not require the plugin. It does not
attribute all autosave/context-close messages, Firefox `NS_BINDING_ABORTED`, or
the original preferences rejection.

A fixed Chrome guard control reproduces the same ViewTransition abort in all
three RC16 and all three RC18 trials. Each performs a real stale-1.1.5 Visual
Save, receives HTTP 409, retains stored content and exposes the recovery page.
This proves the diagnostic is inherited rather than introduced in RC18; it does
not establish whether Core or the browser is responsible. This diagnostic
fixture switches exact files and explicitly invalidates OPcache equally for
both versions. It is separate from the primary native HTTP-upgrade matrix.

Both current-site upgrades invalidate only Elementor's generated CSS metadata
option. A fresh unrelated-plugin upgrader-hook control with exact RC18 installed
reproduces that deletion. Content, clock settings and every other stable option
remain unchanged. Preserve the raw stable-options result of 4/6; do not relabel
it 6/6. This is a scoped control, not an unrelated plugin installation.

The 48 cache rows concern actual server caches. Native browser HTTP-cache HIT is
not asserted. No manual OPcache flush occurs between the primary compatibility
matrix's native upgrades and their immediate HTTP probes. The diagnostic control
above deliberately differs. Timestamp-validation-disabled OPcache remains untested.

Foreign block JSON, non-comment raw HTML and invalid clock-name delimiters keep
their native processing. Some malformed controls still create nodes or change
bytes between saves exactly as RC16 does. Such equivalence is not an inertness
or idempotence pass. The correction is not a general replacement for Core HTML
parsing. Admin PLAINTEXT/CDATA footer suppression and existing caption entity
decoding are explicitly qualified in the native-editor results above.

Complete fresh multisite, the broad public-1.1.2 content/rollback corpus, all Site
Editor/block Widgets/teeny controls, native browser cache HIT, natural autosave
timing and hidden/resume behavior are not established by this bounded correction
matrix. Old receipts remain historical. Hosted exact-HEAD CI, CDN delivery and
WordPress.org publication remain separate, pending gates.

## Independence and preservation

The editor and compatibility agents are independent of implementation. The
compatibility agent also reviewed the final source. The security agent authored
ignored prototypes; its fresh Plugin Check and 122 assertions are execution
evidence, not an independently authored source review. Final aggregate review is recorded separately in
`.local/rc18-aggregate-review-20261114/AGGREGATE-REVIEW.json`; its evidence audit
does not waive the unresolved diagnostics or unexecuted release gates.

Evidence roots: `.local/rc18-fix-20261114/`,
`.local/rc18-editors-20261114/`, `.local/rc18-compatibility-20261114/`, and
`.local/rc17-security-20261114/` (explicit RC18 receipts). Prototype and rejected
RC17 evidence remain in their original directories.

The preservation preflight verified 10,607 prior files without a mismatch.
All 4,113 referenced peer evidence files were independently rehashed by the root
agent with zero mismatches. Four owned Compose projects and three owned browser
containers are stopped; containers, databases, volumes and backups are retained.
The final inventory and seal bind this report, the acceptance receipt, source,
exact packages and raw evidence. Mutable current-source pointers in older seals
remain historical snapshots; frozen predecessor evidence is unchanged.
No commit, push, merge, Cloudflare upload/deployment/settings change or
WordPress.org publication was performed. Files-only rollback to RC16 restores
its inherited defects and cannot reverse saved content; retain revisions and
database backups for content recovery.
