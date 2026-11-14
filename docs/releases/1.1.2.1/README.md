# WordPress 1.1.2.1: editable local rollback

Status: **independent GO for the exact revision-2 local ZIP**. Local only;
no push, merge, tag, CDN deployment or WordPress.org publication is authorized by
this report. The accepted WordPress 1.1.4 r8 package remains unchanged.

## Exact artifacts

| Role | Version | Bytes / files | SHA-256 |
| --- | --- | --- | --- |
| Original negative control | Public 1.1.2 | 61,476 / 15 | `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55` |
| Rejected rollback candidate | 1.1.2.1 r1 | 68,172 / 17 | `19e2f93c308d770b54a51dc0eafb4137420d4d367060c1dadcfbf5b837e5f5f2` |
| Editable rollback candidate | 1.1.2.1 r2 | 68,245 / 17 | `75ab417c6a641a2ec94a624be54e1760db8b14007ac8919f2814cad62f54c75b` |
| Main accepted candidate | 1.1.4 r8 | 69,772 / 17 | `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37` |

Rollback ZIP:
`.local/rollback-1121-20261103/package-r2/simple-digital-clock-1.1.2.1-rollback-r2.zip`.
Its [manifest](manifest.json) binds every installed file, both input archives,
the builder and every difference from public 1.1.2. Two local builds produce
identical ZIP bytes; a deliberately modified predecessor input is rejected.
Source base is `f75c98776b6b1860e916123915bed8084c879153` plus preserved local work
and the new rollback tooling. No new commit is claimed.

## Compatibility decision

The original 1.1.2 writer on Core 6.3 remains defective. A newer plugin cannot
keep executing its protection after its files are replaced by that original
archive. The editable rollback target is therefore **1.1.2.1**, separately
identified and never substituted for the published 1.1.2 bytes.

The paired block reader and PHP save protection come from accepted r8. Existing
JSON captions and static HTML retain their schema. Known malformed Core 6.3
terminal-backslash tokens are repaired narrowly; exact literal entities remain
JSON-authoritative. Native sanitization, unrelated content and earlier stricter
callbacks keep their policies. There is no database migration or persistent
module surviving removal of the plugin.

The backport also carries r8's conditional asset wrapper and paired admin-notice
integration. This prevents a rollback from reintroducing global frontend loading
or external plugin CSS. Only live clocks in delivered HTML trigger one runtime
and one inline integration rule. Editor previews remain available before insertion.
The same [bounded HTML contract](../../WORDPRESS-ASSET-CONTRACT.md) applies.

The bundled **widget 0.7.0 remains byte-identical** to public 1.1.2 and its
published versioned source artifact: 32,649 bytes,
SHA-256 `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.
Older runtime rendering/Intl/resizing behavior is retained; widget 0.8.1 fixes
remain available in the main 1.1.4 package. Data compatibility does not mean that
these different runtime versions have identical presentation.

## Revision-2 author verification

The [revision-2 author receipt](author-evidence.json) records a fresh execution on
**WP 6.3.14 / PHP 7.0.33** and **WP 7.1.4 / PHP 8.3.35** disposable environments.
Chromium performs authenticated native Gutenberg saves as Administrator, Editor
and Author. The complete cycle is:

1. Actual public 1.1.2 creates a valid ordinary corpus and separate negative controls.
2. A private Core update installs exact r8; native saves create the hard-caption corpus.
3. A physical file rollback installs exact 1.1.2.1; the same posts are edited and saved.
4. A private Core reupdate restores exact r8; the same posts are edited and saved again.

All six file transitions preserve complete post rows and eight critical options,
activation and exact installed files. There is no database restore/reseed between
these boundaries. The positive corpus contains **12 posts / 84 clocks**;
**108 post-transition saves** cover title-only changes, width edits from 180 to
181 and back, all literal captions, nondefault settings, className/lock and valid
reopening. Six fresh hard-corpus inserts are recorded separately.

The public-version minimum-Core control retains **30 failing terminal-caption
cases / 33 observations**, including three passing plain controls. The current
reference retains **0 / 33 failures**. These are original-writer observations,
not failures waived for 1.1.2.1. Already-damaged controls are kept separate from
the preservation corpus.

Attempt `rollback-author-20261103-a` stopped before transitions because the test
supplied boolean `shadow:true` to a string attribute. The corrected fixture uses
`shadow-md` and a native block-schema guard. Attempt
`rollback-author-20261103-b` passed the functional cycle for r1, subsequently
rejected for POT metadata. Its [receipt](author-r1-evidence.json) remains separate.
Successful fresh attempt `rollback-author-r2-20261103-c` reruns the entire cycle
for the exact r2 archive. All attempts, databases and logs are retained; the owned
projects are stopped and r2-run ports refuse connections. The normal owner preview
was not installed over: its 17 plugin files
still match accepted r8 in a read-only comparison.

## Independent acceptance and operation

The [independent report](INDEPENDENT-ACCEPTANCE.md),
[machine evidence](independent-evidence.json) and
[closing hashes](independent-integrity.json) bind this exact r2 archive:
**11 mandatory gates PASS, zero failures or waivers**, with six additional scope
groups explicitly NOT RUN. They were copied without editing after freeze closure.

The reviewer created two fresh isolated projects. Six file transitions preserve
whole post rows and eight critical options without a database restore. Twelve
positive posts contain **90 clocks** across three roles and both references;
**144 native post-transition saves** include actual caption/className changes,
Administrator lock changes, title-only saves and width changes. Strict raw
comment JSON and typed attributes pass, so tolerant HTML recovery cannot mask
stored metadata loss. Two direct reserve-only installations also pass.

Official Plugin Check 2.1.0 executes **29 static + 5 runtime checks**, with
**zero errors and warnings** on PHP 8.3. Per environment, 538 security/caption
observations, ten recovery guards and six unknown/native-metadata probes pass.
The reviewer separately retains original-version negative controls, including
an inherited invalid-numeric Author block; full validity failures are not
misreported as counts of erased captions.

All **64 resource cases** pass for r8/reserve, both environments and
Chromium/WebKit: empty, one/many clocks, suppressed/escaped parents, inert
templates, late footer clocks and a block sidebar. Exact HTTP runtime hashes
match 0.7.0 or 0.8.1 respectively. Four reserve admin/editor cases pass, including
first insertion, iframe preview, per-document deduplication and save/reopen.
Only the reviewer's projects were stopped; their four ports refuse connections.
The normal preview remains running with the exact accepted r8 files.

Revision 1 is **NO-GO for metadata**: its POT `Project-Id-Version` still declared
1.1.2. Revision 2 corrects that header and adds an explicit local 1.1.2.1 changelog
entry. [Correction evidence](metadata-r2-correction.json) proves that these are the
only two changed files and every executable byte is identical. The new build
guard rejects the exact r1 input and accepts r2. R1 checks are retained but do not
supply r2 acceptance. Both the fresh author cycle and independent r2 acceptance
are complete and bound to the new SHA-256.

The [mandatory local gates](GATES.md) and separate review define the local GO.
Build/test commands, artifact paths,
safety guards and recovery steps are in the
[reproducible rollback workflow](../../../tools/wordpress-lab/rollback/README.md).

Before an operational rollback, retain the database and installed plugin files.
Use the separately identified rollback ZIP, then verify its installed hashes and
editor saves. Reinstall retained r8 if the rollback fails. Erased metadata cannot
be reconstructed by replacing plugin files; restoring a database snapshot also
requires accounting for writes made after that snapshot.

No blanket recovery, original-1.1.2 writer safety or public update-offer claim is
made. PCP on PHP 7.0, Firefox/native Safari/VoiceOver in this bounded review,
LocalWP, TLS, multisite, external fonts/cache optimizers, a separate rollback
performance benchmark, new GitHub CI and public delivery remain outside this
local matrix. Historical r8 results are not relabeled as fresh rollback tests.
