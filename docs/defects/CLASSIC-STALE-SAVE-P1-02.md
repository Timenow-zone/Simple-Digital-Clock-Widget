# CLASSIC-STALE-SAVE-P1-02: an older Classic document removes saved clocks

## Proven failure and frozen subjects

The expanded RC12 acceptance reproduced this sequence in 12 combinations of
public 1.1.5 / RC9, two Core/PHP environments and Google Chrome / Firefox /
WebKit: open a stored post in Classic Text mode, update to RC12 without reloading
the document, switch to Visual, and click native Update. The database contained
four clocks before and after the file update, then zero after the save. A separate
reviewer reproduced the loss independently. Fresh RC12 documents preserved HTML.
The old document's TinyMCE schema is inherited, but the destructive update path
still blocks safe acceptance.

The sealed evidence is `.local/rc12-acceptance-20261113/REPORT.md` and the
independent reports linked there. RC12's ZIP, manifest and prior reports remain
unchanged. The original limited RC12 acceptance did not save the old document;
it must not be read as proof for this subsequently executed case.

## Correction and limits

[RC15](../releases/1.1.6/RC15.md) adds a WordPress-only guard for native Classic
post/page Update, Preview and Heartbeat autosave. Before Core can replace content,
it detects a decrease in actual clock opening tags compared with the stored post.
If the form predates the guard, the ambiguous destructive save is rejected.
The existing content is not merged, restored, sanitized differently or silently
substituted. A manual rejection returns HTTP 409 and escaped read-only fields
containing the submitted title, HTML and excerpt, with a link to reopen the saved
post separately. Heartbeat returns Core's native failed-autosave response.

Fresh Classic forms carry a marker bound to the schema, site, post, user and
login session. It identifies form generation, not successful JavaScript execution
or permission to edit. Core's nonce and capability checks remain required. The
marker survives normal Core nonce refreshes; session or salt changes invalidate
it safely. A small editor-only bridge includes it in Core's autosave payload.
Fresh forms can intentionally delete some or all clocks, including in Text mode.

Autosave needs its own early veto: Core can overwrite an author's unlocked draft
or the last autosave revision. The guard prevents that callback only for the
rejected request, retaining other Heartbeat handlers and lock bookkeeping.
It does not intercept generic post filters, REST, WP-CLI, Quick Edit or widget
endpoints. It does not protect every old TinyMCE surface, distinguish same-count
semantic replacements, recover previously deleted HTML, or recover clocks that
existed only in an unsaved browser buffer. Those boundaries are explicit.

An authenticated native request with a present, non-string content field is also
rejected when the saved post contains clocks, before trusting any fresh-form
marker. Manual requests receive HTTP 400 and an explicit invalid-content message;
autosave receives its native failure response. Array values are not reflected.
This prevents an independently reproduced older-Core path that converts malformed
array content into an empty post. Clock-free posts and other APIs retain Core's
behavior. Missing content is not interpreted as an intentional empty string.

## Required evidence

New exact-artifact acceptance covers native old-document saves and autosaves,
published posts and drafts, partial removal, role permissions, previews, fresh
intentional deletion, recovery text escaping and persistence, malformed fields,
cross-post/user/site/session markers and unaffected REST/CLI/Quick Edit paths.
Data comparisons distinguish content/revisions from ordinary Heartbeat lock
updates. Actual browser errors and expected HTTP 409 responses are separate.

All six main-script HTML/WordPress browser combinations, Plugin Check, package
identity, PHP compatibility, translation coverage, update/rollback and editor
regressions remain required. Old results do not accept new package bytes.

There is no database migration or shared runtime change. A files-only rollback
to RC12 restores the unprotected stale-save behavior and cannot recover deleted
HTML. Keep the accepted archive and data backups; do not exercise destructive
old-editor saves during rollback. Local acceptance does not authorize publication.
