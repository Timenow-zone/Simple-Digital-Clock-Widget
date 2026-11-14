# RC16 local correction acceptance

Status: **ORDINARY COMMENT CORRECTION VERIFIED; FULL ACCEPTANCE NO-GO;
NOT PUBLISHED**.

RC16 prevents ordinary commented clock examples from becoming actual clocks
after a filtered Author save. Native editor execution and an independent review
confirm the scoped correction. This is not a universal malformed-HTML repair;
an inherited residual and incomplete broad release gates remain explicit.

## Exact artifact and change

| Item | Value |
| --- | --- |
| Candidate | WordPress plugin 1.1.6 RC16 |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc16.zip` |
| ZIP SHA-256 | `18a1b2c67f181a0a3c719646241499eb237ce63962f5ad6f08a32fc165639601` |
| Layout | 80,962 bytes; 20 regular files |
| Manifest | [Frozen RC16](manifest-rc16.json) |
| Manifest SHA-256 | `843684c1657e1034da4df96185a11dfdf6dce3546ed6a3023b4691140d875fb2` |
| Source base | `94db2495c9547b993e835a2150ce647abbe9e065`; uncommitted candidate |
| Runtime | 0.8.4; `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |

Only `includes/simple-digital-clock-kses.php` and `readme.txt` differ from RC15.
The main runtime, loader, Gutenberg code, TinyMCE helper, stale-save guard,
initializer and POT remain byte-identical. The readme FAQ, changelog and Upgrade
Notice describe the correction. A freshly generated POT matches the retained
catalog except for its generation timestamp; no new gettext string is added.
There is no database migration.

The [correction contract](../../defects/CLASSIC-COMMENT-P2-01-RC16.md) defines the
intentional source normalization: literal angle brackets inside ordinary clock
comments become character references before native KSES processing. Real comment
delimiters remain, entities are not decoded, and actual clocks outside the comment
keep their settings. Unfiltered Administrator saves retain native behavior.
No native KSES callback is removed, no allowlist is widened, and the correction
adds no restoration of unfiltered HTML after sanitization.

The archive and per-file manifest identify the candidate. The unchanged checkout
base alone does not. The frozen manifest's `acceptance: NOT_RUN` remains its
original freeze-time snapshot; this report and the separate receipt record later
execution. Existing RC15 dirty work is not attributed to the RC16 correction.

## Fresh results

Native installations use WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35.
Actual Google Chrome is 157.0.8103.51, Firefox is 153.0, and WebKit is 26.5.
Firefox runs in pinned Linux containers; platform details are recorded per
workstream. WebKit execution is not a native Safari claim. Some repository
workflow tests use Chromium; the mandatory HTML/WordPress gate uses real Chrome.

| Scope | Result and boundary |
| --- | --- |
| Classic Editor: roles, fixtures, two saves and reopen | 96/96 functional; stored content, ordinary comments and actual-clock settings checked |
| Gutenberg native Custom HTML editing and reopening | 12/12 functional across two Core versions and three browsers |
| Native forms opened before an HTTP update | 24/24 functional: 12 destructive public-1.1.5 forms rejected with HTTP 409; 12 harmless RC15 forms accepted |
| Old Text document with clock comments across update | 4/4; public 1.1.5 and RC15, both Core versions |
| Fresh native Heartbeat autosave | 12/12; Author and Administrator, both Core versions, three browsers |
| Standalone exact main script | 24/24 in actual Chrome, Firefox and WebKit |
| Standalone differently configured instances | 6/6 single/multiple browser pairs |
| Installed WordPress frontend | 24/24: empty, single, multiple and inert placements on both Core versions, three browsers |
| Upgrade, files-only RC15 rollback and reupdate | 6/6 exact files, activation and unchanged content tables; strict stable-option equality 5/6, qualified below |
| Separate lifecycle comment and stale-save controls | Four successful RC16 comment saves, two expected RC15 failures; two public-1.1.5 stale forms protected with HTTP 409 |
| Real page/optimizer caches in ten-plugin sample | Canonical R4: 48/48 functional, 47/48 strict; 12/12 old-open observations. R5 repeats those counts with Chrome's measurement-page HTTP cache disabled |
| Actual Core KSES, guard units and syntax | 132 comment assertions, 52 guard assertions and seven package PHP lints per Core/PHP environment |
| Independent security/source review | 112 paired Core captures; 168 bounded browser comparisons, including explicit residual/equivalence controls |
| Official Plugin Check 2.1.0 | 29 static and five runtime checks, zero findings on exact installed RC16 |
| Local repository validation | 20 commands, 24 additional syntax checks and 64 focused contracts passed |
| Local browser workflow | 48 WTR checks per engine; three iframe, ten font, three serialization, 87 TinyMCE input, 96 loader leaf and three product-site checks passed |

Counts cover different purposes and repeated observations; they must not be added
as unique user scenarios. All six mandatory exact-main-script HTML/WordPress and
browser combinations are freshly covered. The native editor families comprise
148 functional passes; two old-form Chrome recovery pages captured ViewTransition
errors, and two WebKit autosave contexts captured a dashboard AJAX diagnostic.
Thus 144/148 have no captured page error, within the instrumentation limits
below. No new functional regression was established in this bounded matrix.

Autosave uses the actual Core Heartbeat path triggered by its normal JavaScript
API, with captured POST/response and a separate stored autosave revision. Parent
post and metadata other than Core's advisory `_edit_lock` remain unchanged.
That lock changes in all 12 captured autosave cases; the sealed editor report's
shorter unchanged-metadata wording must be read with this explicit qualification.
The saved revision is replayed in a same-origin
frontend document to check DOM inertness and clock settings. This does not claim
a natural timer wait or native Preview navigation.

## Retained failures and qualifications

The original Classic/Gutenberg harness observes `pageerror` on the editor page;
it does not collect every frontend error or all `console.error` messages. The
autosave harness observes page errors across its context. The two current-Core
Chrome public-1.1.5 recovery cases retain the ViewTransition error and strict FAIL.
Their HTTP 409 and unchanged stored records still pass. An analogous historical
diagnostic was investigated during RC15 acceptance; that is not a fresh RC16
disabled-plugin attribution test.

The two current-Core WebKit autosave contexts capture an access-control error
from dashboard `getEvents`/`admin-ajax.php` after login. Their later actual autosave
response, revision contents and parent invariants pass. No fresh disabled-plugin
control attributes these diagnostics to Core or the plugin. They remain strict
FAIL. The editor review's first prose draft incorrectly counted only the Chrome
errors; its final report corrects the total to four and preserves the draft.

The initial current-Core Gutenberg attempts retained four harness failures: two
missed the native Edit code modal, and two asserted an obsolete internal block
attribute. The final native-UI runs use the reopened textarea and stored content.
No product change was made to turn those attempts into passes. Initial invalid
Core harness counters and the corrected SCRIPT-context test oracle are also
retained separately from exact-candidate results.

The current-site reupdate removes only Elementor's generated CSS metadata option.
A separate unrelated-plugin upgrader hook reproduces that removal. Exact plugin
files, activation and all content tables remain unchanged; the original stable-
option equality failure is preserved. This is not a blanket unchanged-database
claim. The ten-plugin sample uses an explicit 512 MiB memory budget; its earlier
128 MiB WooCommerce bootstrap failure remains a configuration failure.

Each complete cache run retains one Chrome response-body collection failure for
Core emoji resources. Functional rendering/settings/runtime checks pass, with no
actual page error in those rows. Server cache comparison is byte-exact in 45/48
R4 rows and 46/48 R5 rows; the remaining three/two differ only in the cache
generation-duration comment during concurrent warming. R5 is separate evidence
for server caching, not a replacement proof of native browser HTTP-cache HIT.
The two runs revisit the same scenario matrix and are not 96 unique scenarios.

## Open gates

The independent review reproduces an unwaived residual: an HTML-context
`<![CDATA[ >` declaration followed by a clock comment has zero input DOM hosts,
but one host after KSES in both RC15 and RC16, on both Core versions and all three
browsers. The native lexer/scanner and browser disagree about the bogus declaration
boundary. Inherited status does not make this an inertness pass.

Nine other compatibility vectors also retain predecessor inert-to-active behavior:
quoted attribute, SCRIPT, XMP, NOSCRIPT, PLAINTEXT, unterminated comment, incorrect
comment closer, SVG CDATA and MathML CDATA. Their exact tested outputs match RC15.
They are equivalence controls, not proof that arbitrary disallowed or malformed
input remains inert. The independent report preserves each actual input/output.

Full acceptance also requires fresh completion or explicit disposition of the
remaining broad matrix. This correction does not transfer RC15 results to RC16:

- The complete multisite, native Site Editor/block Widgets/teeny/Preview and
  public-1.1.2 corpus/rollback matrices were not rerun here.
- Every native Gutenberg inspector control, Delete/Undo/reinsert and newly created
  RC16 content saved under 1.1.2 remain outside this fresh bounded run.
- Native Firefox HTTP-cache HIT, actual hidden-tab resume, natural autosave timing
  and the specifically named RC1 preview/CSP sensitivity controls remain unproven.
- Required hosted Repository checks and Browser tests must run on an eventual
  exact committed RC16 HEAD. The local workflow uses existing dependencies, not
  a fresh `npm ci`; previous RC12 hosted success cannot accept this dirty candidate.
- Authorized production CDN delivery and WordPress.org publication are separate,
  deferred release steps. They were not attempted here.

## Evidence, preservation and rollback

The [acceptance receipt](acceptance-rc16.json) binds exact identities, results and
evidence paths. Root evidence is `.local/rc16-fix-20261113/`; native editor and
upgrade/cache reports are separate. The independent source/security report is
`.local/rc16-independent-resume-20261113/REPORT.md`. The aggregate reviewer uses
`.local/rc16-aggregate-review-20261113/` and does not replace raw failed attempts.

All 9,364 explicitly preserved baseline files match their original hashes,
including RC15 archive, frozen manifests and historical evidence. Older inventories
that reference mutable working-tree source paths are not claimed unchanged after
the authorized new source correction. The runtime remains byte-identical.

A files-only rollback to RC15 reinstates the ordinary-comment defect. It does not
undo saved content changes. Reupdate does not silently repair a clock already
activated by an earlier save; content recovery needs an intact revision or backup.
Owned disposable services are stopped after verification; databases and evidence
are retained. No commit, push, merge, Cloudflare upload/deployment/settings change
or WordPress.org publication is performed by this task.
