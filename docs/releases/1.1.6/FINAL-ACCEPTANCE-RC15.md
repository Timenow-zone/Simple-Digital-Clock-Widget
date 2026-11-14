# RC15 local correction acceptance

Status: **STALE CLASSIC SAVE CORRECTION VERIFIED; FULL ACCEPTANCE NO-GO;
NOT PUBLISHED**.

RC15 prevents the demonstrated loss of saved clock HTML from a native Classic
document opened before updating. Independent execution and source review confirm
the scoped correction. Complete release acceptance remains NO-GO: an inherited
Author/comment defect and explicit coverage gaps are not waived.

## Exact artifact

| Item | Value |
| --- | --- |
| Candidate | WordPress plugin 1.1.6 RC15 |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc15.zip` |
| ZIP SHA-256 | `5722c9c14564bd826d853f5f3fb13809f5691742f183ddee788b325471525374` |
| Layout | 79,165 bytes; 20 regular files |
| Manifest | [Frozen RC15](manifest-rc15.json) |
| Manifest SHA-256 | `46dec0b92de6e00329f9c533d858f3930e0cb4ecde46b37124e61a8b4f682e94` |
| Source base | `94db2495c9547b993e835a2150ce647abbe9e065`; uncommitted candidate |
| Runtime | 0.8.4; `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |

The source base does not identify the new working-tree bytes by itself. Use the
exact archive and per-file manifest. The frozen manifest's `NOT_RUN` field is a
freeze-time snapshot; this report and the separate acceptance receipt record
execution without changing that identity.

RC12's archive and frozen manifest remain unchanged. Only five package paths
differ: the new PHP save guard and autosave bridge, entry-point require, readme
and POT. Runtime, loader, existing TinyMCE helper, KSES/metadata code, asset PHP
and Gutenberg block are byte-identical to RC12. There is no database migration.
RC13/RC14 are retained intermediate candidates, not substituted acceptance.

## Behavior and evidence

The [stale-save defect record](../../defects/CLASSIC-STALE-SAVE-P1-02.md) describes
the guard and its limits. A destructive old native form receives HTTP 409 before
Core writes the post; the submitted title, HTML and excerpt remain available
for copying on an escaped recovery page. Heartbeat rejects the destructive
autosave using Core's native response. Fresh forms support intentional clock
removal. Non-string content is rejected separately on saved-clock posts.

Fresh tests use WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP 8.3.35.
The installed Google Chrome channel is 157.0.8103.51; Firefox is 153.0; WebKit is
26.5. Firefox runs in pinned Linux containers; WebKit platform is recorded per
workstream. WebKit execution is not a native Safari claim.

| Test scope | Result |
| --- | --- |
| Old Classic documents across predecessor, role, Core and browser | 126/126 functional: 48 manual 409 rejections, 36 rejected actual Heartbeats, 42 harmless RC12 controls; 115/126 strict error-free |
| Separate independent stale/fresh pairs | 12 protected stale saves and 12 successful fresh saves |
| Fresh intentional edits and deletion | 72/72; fresh Heartbeat cases 36/36 |
| Natural autosave schedule | Two old drafts protected and two fresh published-post autosaves successful; actual Chrome and unchanged Core timers |
| Native Classic Preview / Undo / Text widget and teeny | 12/12, 6/6 and 12/12 strict |
| Multisite WP7.1.4/PHP8.5.12 | 18/18 strict lifecycle; same-ID/user/session cross-blog controls 6/6 functional, 4/6 strict |
| HTTP security/recovery | 42/42, plus separate multisite token-binding checks |
| Main-script standalone HTML | 24/24; actual Chrome, Firefox and WebKit |
| Installed runtime / native Core-browser compatibility | 42/42 and 126/126; CSP/SRI/nonce, ownership, shadow roots and real timeouts |
| Frontend/MIME / separate real ticks | 348/348, including 72 MIME rows; separate real-time cases 12/12 |
| Single and multiple clocks | HTML 6/6; WordPress 12/12 |
| Loader / actual TinyMCE | 96 loader leaf cases; 87 TinyMCE input rows across three engines |
| Gutenberg / Site Editor / block Widgets | 18/18, 6/6 and 6/6 native workflows |
| Legacy preview | 12 actual public-1.1.2/RC15 pairs |
| Public-1.1.2 corpus save, files-only rollback and reupdate | 162/162 strict workflows; 324 visible native Save actions |
| Core baseline upgrades / post-upgrade frontend | 10/10 transitions; 150/150 frontend cases |
| Native ZIP replacement / clean installation | 6/6 replacements; 2/2 new SQL namespaces |
| HTTP automatic updater | 2/2 real Core/Apache upgrades; immediate next HTTP request loads the guard, no manual OPcache flush |
| Real page/optimizer caches / old open frontend | 120/120; 24/24 old-open observations |
| Ten-plugin sample | Widget behavior passes; 101/102 strict rows, with inherited CF7 diagnostic attributed |
| Plugin Check | 29 static and five runtime checks, zero findings |
| Focused contracts / PHP execution | 64 Node tests; 52 guard assertions and seven PHP lints per PHP environment |

Counts have different purposes and are not summed into unique user scenarios.
All six mandatory exact-main-script HTML/WordPress and browser combinations are
freshly proven. Fixture serialization is not counted as native insertion.

## Qualifications and open gates

Eight paired native captures establish that the
[Author/comment conversion](../../defects/CLASSIC-COMMENT-P2-01.md) already exists
in published 1.1.5 on both Core versions. RC12/RC15 produce identical stored
bytes and render the same unexpected clock. This is a Core-processing/plugin-
allowlist interaction. The six original fresh-form data failures remain FAIL;
inheritance is not a waiver, and RC15 does not repair that separate defect.

The corpus retains 20/22 database records byte-for-byte. Two minimum-Core
backslash cases change only clock block JSON comments; actual HTML, foreign
bytes and parsed settings remain exact. A separate option qualification covers
only an empty sidebar entry added during deliberate theme activation before
the corpus saves. Raw equality failures and exact proofs remain in the evidence.

The HTTP automatic-updater supplement retains raw stable-option equality of
1/2: the ten-plugin site creates only Elementor's generated-CSS metadata.
Installed source, the updater event and exact value explain that narrow delta;
all content tables remain unchanged. This is not a blanket unchanged-options
claim or proof of public update-offer propagation or scheduler timing.

Retained browser diagnostics include a same-tab WebKit Header error reproduced
with RC12, a Chrome 409 ViewTransition error reproduced with the plugin inactive
during the RC14 diagnostic phase, and CF7 request cancellation reproduced with
RC15, RC12 and the plugin inactive. Functional and strict results stay separate.

Full acceptance remains open for:

- The inherited Author/comment defect above.
- Native Firefox browser-cache HIT and actual hidden-tab resume. Chrome BFCache
  passes on both sites; it does not prove those other paths.
- Every native inspector control, native Gutenberg Delete/Undo/reinsert, and a
  separate newly RC15-created control saved under 1.1.2. Existing-setting and old
  corpus coverage is explicitly narrower.
- Fresh execution of the specifically named RC1 preview/CSP negative controls
  and the complete declared local CI suite.
- Required Repository checks and Browser tests on a committed exact RC15 HEAD.
  Previous RC12 hosted checks do not accept this uncommitted candidate.
- Authorized production CDN delivery and later publication gates.

## Evidence and release boundary

The [acceptance receipt](acceptance-rc15.json) binds the identities and evidence.
The detailed local report is `.local/rc15-fix-20261113/REPORT.md`. Its raw root
results, independent editor/cache reports, supplemental HTTP updater, source
review, final gate mapping and hash inventories remain separate. All old inputs
and failed first attempts are retained. All five owned Docker projects and four browser containers are stopped;
databases, volumes and backups are retained. Four peer inventories were
independently rehashed: 10,007 files, zero mismatches.

No commit, push, merge, Cloudflare upload/deployment/settings change or
WordPress.org publication is performed by this correction. A files-only rollback
to RC12 removes the new stale-save protection; it does not recover HTML deleted
before the guard was installed. Recovery of already lost content requires an
intact revision or backup.
