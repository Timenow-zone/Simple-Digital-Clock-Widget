# RC9 final pull request and exact-HEAD CI boundary

Date: 2026-11-12. The owner authorized preparing the final RC9 pull request and
obtaining successful `Repository checks` and `Browser tests` on its exact HEAD.
Merge, CDN deployment and WordPress.org publication remain unauthorized.

## Immutable package binding

The complete accepted package is contained in commit
`2e988e6703aa0c8dd80b6c984c0468a761f54aab`. All 17 committed plugin files were
compared against the frozen [RC9 manifest](manifest-rc9.json) and accepted ZIP.

- WordPress version: 1.1.6, candidate RC9.
- ZIP: 73,184 bytes, SHA-256
  `f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909`.
- Main 0.8.4 SHA-256:
  `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
- Loader SHA-256:
  `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124`.

This preparation commits already accepted files without editing product code,
rebuilding the runtime or repacking the ZIP. Existing inspector regression tests
and their CI invocation are included. No historical manifest or acceptance
snapshot is rewritten. The following documentation commit changes no plugin file.

## Pull request scope

[PR #19](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19)
continues on `codex/wordpress-1.1.6-candidate`, based on
`codex/local-release-ci-hygiene` / [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18).
Its complete diff includes conditional runtime delivery, the earlier shared
0.8.4 corrections, Gutenberg RC9 fixes, tests and release evidence. The new RC9
increment is not presented as the entire stacked PR diff. No parent PR is merged
or rewritten to prepare this review.

The [local closure](RC9-LOCAL-GATES.md) accounts for all 42 required matrix rows
and separates exact-RC9 execution from scoped historical evidence. It preserves
the inherited WebKit same-tab Header diagnostic and older-editor gradient-panel
rollback limitation; neither is described as fixed or a new RC9 regression.

## Final hosted checks

The exact final PR HEAD must match the head SHA of the successful CI run. Record
both required job names, conclusions, job/run URLs, attempt, event, PR base/head,
and timestamps in `.local/rc9-final-pr-20261112/FINAL-HEAD-CI.json` after the run
finishes. A local test result, a previous commit's green run, or a successful
cancelled/replaced attempt does not close this gate.

The [live Checks tab](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/19/checks)
is authoritative for later HEAD changes. Earlier readiness documents deliberately
retain their pre-push pending state; the final hosted receipt and live PR status
supersede that CI observation without changing the tested artifact. The final
HEAD SHA is recorded after committing this document, avoiding a self-referential
commit identifier. No follow-up documentation commit is required merely to
record CI success.

Successful hosted checks permit review of this candidate; they do not authorize
merge or production delivery. Exact 0.8.4 CDN delivery remains a separate open
release gate, and WordPress.org publication remains deferred.
