# RC18 production pull request and exact-HEAD checks

Date: 2026-11-14. The owner authorized updating existing
[production PR #20](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/20)
from RC12 to the exact frozen RC18 and obtaining successful `Repository checks`
and `Browser tests` on its final HEAD. The branch remains
`codex/production-0.8.4`, targeting `main`.

## Frozen artifact and increment

- WordPress plugin 1.1.6 RC18 ZIP: 82,060 bytes, twenty regular files;
  SHA-256 `b59adf31cf9b9f8e7826e2540c81a3621d673c44f2eae65145b96a6b2b353429`.
- [Frozen manifest](manifest-rc18.json) SHA-256:
  `7c09c3efc71bff139d85fd80d4e79575be070c38ab018e1b450e7d098c8e486d`.
- Main runtime 0.8.4: 36,430 bytes;
  SHA-256 `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Loader SHA-256:
  `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.
- Previous PR HEAD: `94db2495c9547b993e835a2150ce647abbe9e065`.

All twenty committed package files must match the frozen manifest and ZIP.
Four existing RC12 package paths change: KSES integration, plugin entry point,
POT and readme. Two paths are added: the Classic save guard PHP integration and
its admin autosave marker bridge. The other fourteen package files, including
runtime, loader, Gutenberg and the TinyMCE helper, remain byte-identical.
All twenty-five tracked `src/` and `dist/` files remain unchanged from the
previous PR HEAD. The archive is not repacked and no database migration is added.

The guard prevents destructive native saves/autosaves from Classic documents
opened before updating, preserves submitted text for recovery, and allows
intentional removal from a fresh form. The KSES correction keeps supported
comment examples inert and neighboring clocks intact for filtered users.
The Upgrade Notice fits the directory's 300-character limit. Tests and CI cover
the save guard, malformed payload boundaries, marker transport and notice limit.

The complete PR against `main` still includes the accepted dev work from #18 and
#19: shared widget 0.8.4, conditional WordPress asset delivery, Gutenberg fixes,
tooling and evidence. This RC18 increment does not modify those runtime bytes.
The frozen manifest records build-time metadata; the mutable selection manifest
clarifies that runtime identity is unchanged relative to RC12.

## Acceptance and remaining limits

Read the preserved [initial RC18 acceptance](FINAL-ACCEPTANCE-RC18.md),
[additional local acceptance](LOCAL-ACCEPTANCE-RC18.md) and
[final encode attribution](ENCODE-DIAGNOSTIC-RC18.md) together. Their frozen
receipts remain unchanged. The latest additive evidence closes the final
unattributed diagnostic; it does not rewrite earlier NO-GO observations or
claim zero browser diagnostics.

The exact-artifact local evidence includes the mandatory standalone HTML and
installed WordPress gate in actual Google Chrome, Firefox and WebKit; the
native editor/security/Plugin Check scope; all 42 mapped contract gates; and
additional multisite, cache, placement, theme and lifecycle coverage. Counts
have different units and must not be summed into a unique test total. Hosted
browser tests supplement rather than replace installed native WordPress proof.

The final WebKit Text-widget encode message and complete stack occur with the
plugin disabled and with RC16. An independent runner records eight exact
positive reproductions and two clean settled controls; its evidence audit
passes 518 assertions. The class is Core/WebKit navigation behavior. The old
individual event has no recoverable timing. Inherited diagnostics remain
explicit accepted evidence limitations, not suppressed failures.

Previously deleted HTML still requires an intact revision or backup. A stale
Classic form that would remove saved clocks is rejected with a recovery screen;
unsaved edits must be copied before reopening. Arbitrary malformed HTML,
third-party block metadata, all customer configurations and native Safari are
not universally certified. A files-only rollback restores the old writer and
cannot repair content that it already damaged. The plugin-stack lab is synthetic;
network-specific multisite browser evidence is Google Chrome, with the separate
single-site and standalone Firefox/WebKit evidence retained.

## Hosted receipt and operational hold

After the final push, record the containing commit, current PR HEAD/base,
GitHub merge-test commit/tree, workflow event/attempt, checkout target, both
required job conclusions and URLs in
`.local/rc18-production-pr-20261114/FINAL-HEAD-CI.json`.
The successful run's head SHA must equal the current PR HEAD. Standard PR jobs
may check out GitHub's merge-test ref: record it explicitly and verify its plugin
map and immutable runtime as well. Do not call that synthetic merge SHA the PR
HEAD. The [Checks tab](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/20/checks)
is authoritative if HEAD later changes. Record success after committing this
document, without a follow-up commit solely to insert its own hash or CI result.

Fresh read-only Cloudflare UI verification shows production branch `main` and
preview builds OFF. Push only the existing PR branch. Do not enable auto-merge,
change branch protection, enable preview builds, upload/deploy to Cloudflare,
or publish to WordPress.org. No Cloudflare setting is saved in this task.

Before a separately authorized production promotion, recheck the active
deployment and additive rollback availability. The prior non-active rollback
upload is historical evidence, not a new upload or activation here. Reverting
this PR increment, if needed, must preserve history and the immutable candidates.
Passing hosted checks closes this PR validation gate only; merge, production
CDN verification and WordPress.org publication remain separate decisions.
