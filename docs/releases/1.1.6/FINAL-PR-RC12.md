# RC12 production pull request and exact-HEAD checks

Date: 2026-11-13. The owner authorized updating the existing
[production PR #20](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/20)
from RC9 to the exact frozen RC12 and obtaining successful `Repository checks`
and `Browser tests` on its final HEAD. The branch remains
`codex/production-0.8.4`, targeting `main`.

## Exact artifact and scope

- RC12 ZIP: 75,480 bytes, 18 files, SHA-256
  `0652cf00405e23c278d75d8aa66dd37c24e1888c9b2dae216f60e56befb5d118`.
- [Frozen manifest](manifest-rc12.json) SHA-256:
  `3b704942ae9ee7bb4e4a777cb520f56df08981276498eff95fbb8ab7dfb3bd10`.
- Main runtime 0.8.4: 36,430 bytes, SHA-256
  `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Loader SHA-256:
  `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.

All 18 package files must match the committed tree, frozen manifest and accepted
ZIP. This preparation commits the accepted Classic Editor correction and its
tests without changing product bytes, rebuilding the runtime or repacking the
archive. Exactly three package paths differ from RC9: the editor integration in
`includes/simple-digital-clock-kses.php`, the new TinyMCE helper and `readme.txt`.
The other 15 files, including runtime, loader and Gutenberg, are unchanged.
RC9 and all historical candidate artifacts remain preserved.

The complete production PR still includes the previously accepted dev changes
from PRs #18 and #19: shared widget 0.8.4, conditional WordPress asset loading,
Gutenberg corrections, tooling and evidence. The RC12 increment is not the whole
diff against `main`.

## Acceptance and hosted receipt

The [local acceptance report](FINAL-ACCEPTANCE-RC12.md) and
[receipt](acceptance-rc12.json) retain their original pre-commit observations.
Their exact-artifact six-cell HTML/WordPress browser gate and independent local
regression evidence apply to the unchanged package. Hosted CI adds the Classic
PHP contracts and actual WordPress-bundled TinyMCE browser tests to both required
jobs; it does not replace native installed WordPress acceptance.

After the final push, record the containing commit, final PR HEAD, base, merge
test commit/tree, run event/attempt, both required job conclusions and URLs in
`.local/rc12-production-pr-20261113/FINAL-HEAD-CI.json`. Verify the successful run's
head SHA against the current PR HEAD. The
[live Checks tab](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/20/checks)
is authoritative if that HEAD later changes. Record the result after committing
this document; no follow-up commit is needed only to record success.

## Operational boundary

Cloudflare preview-branch builds were observed disabled before this update;
production builds remain attached to `main`. No Cloudflare setting is saved.
Push only the existing PR branch. Auto-merge must remain disabled. Do not merge,
upload or deploy to Cloudflare, or publish to WordPress.org in this task.

Successful checks close the PR validation gate only. Production CDN delivery and
WordPress.org publication remain separate. The local report's inherited browser
limitations, old open Classic-tab reload requirement, and inability to recover
already deleted HTML remain explicit. A files-only RC9 rollback restores its
old Visual-mode loss; it is not a fix for that defect.
