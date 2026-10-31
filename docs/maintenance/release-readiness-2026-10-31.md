# Release readiness — 31 October 2026

This is the current preparation record. Earlier maintenance, release and preview
reports are historical snapshots, not claims that they were all rerun today.
WordPress.org publication remains deferred. Widget **0.8.1** and WordPress
**1.1.4** are independent versions; public WordPress.org stable remains **1.1.2**.

## Frozen WordPress artifact

The [manifest](../releases/1.1.4/manifest.json) and [independent acceptance](../releases/1.1.4/INDEPENDENT-ACCEPTANCE.md)
identify compatibility revision 2: **65,374 bytes / 16 files**, archive SHA-256
`d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`.
Accepted runtime is `369f6bde90591e40ac8f59544297a2bae3e6a91f`;
`88ae4e2e1b12879b1ad62ee7eb1d93bd6f9f7211` adds evidence and a PHP test comparison.
This preparation preserves every installable byte and all eight versioned widget
artifacts. It does not extend the original acceptance scope or repair irreversible
damage from the old 1.1.2 writer on Core 6.3.

Verify the original accepted archive without repacking:

```bash
set -euo pipefail
python3 tools/wordpress-lab/verify-package.py \
  --zip .local/release-readiness-20261031/accepted/simple-digital-clock-1.1.4-compatibility-r2-candidate.zip
```

The verifier enforces the current manifest allowlist rather than an obsolete
15-file publication list. `--allow-repacked` is only for comparing a future public
server-repacked ZIP's complete extracted contents; it does not confer acceptance
on a different local candidate. No command in this record publishes to SVN.

## Development dependency correction

The morning audit failed with 17 moderate and five low dependency records. The
two root moderate advisories are [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)
and [glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), not 17 unique CVEs.

The resolved development tree pins overrides to `minimatch@11.0.3` and
`glob@14.0.3`. Consumer review found modern named-function/class usage in ESLint,
TypeScript lint and coverage, and five old callable imports in
`eslint-plugin-react@7.37.5`. Its exact version is pinned and the five import-only
changes are tracked in `patches/`. `patch-package --error-on-fail` applies them
during `npm ci`; patch failures must remain fatal. This is a maintained local
compatibility patch, not upstream endorsement of cross-major overrides.

All **105** enabled lint rules, their parameters, globals and settings remain
identical. Seven regression contracts exercise all five patched rules with
negative/allowed controls plus configuration matching and coverage file selection.
Keep these checks until upstream consumers support the patched APIs directly;
then remove the overrides and patch together after another audit and test run.

Coverage moves from c8 10 to **12.0.0**: the old yargs entry crashes under the local
Node 26 ESM loader. Text and HTML reports remain available. Development Node is
**>=22.12.0**, with **Node 24** selected by `.nvmrc` and CI. WordPress PHP/Core
minimum requirements are unchanged. Production lock entries are unchanged.

Fresh audit rejects moderate/high/critical as before and passes after correction.
Five low records remain from one unpatched development-only [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
Production-only audit has zero findings. This is not a general security certification.

## Preview, documentation and site

The unique preview work originally at `04911243dd071561205b3c7b001eb049afd327b6`
is integrated separately from plugin files. Historical reports are translated into
English while identifiers, localized fixtures and published blueprint bytes remain
unchanged. The later readme commit `a19e08c2ff0bf91483f811dfa36c3bc2b87200b9`
is retained in history; its semantic edits already exist in the accepted plugin.
See [preview publication](../preview/PUBLICATION.md). CI checks generator/source parity.

The root package is explicitly private. Unsupported npm installation instructions
are removed; root LICENSE/NOTICE explain existing MIT widget and GPL wrapper scope.
No npm package is published. Five obsolete linked demo outputs containing HMR are
removed; the source playground, documented `dist/SimpleDigitalClockWidget.js`, maps
for that entry and every versioned immutable bundle remain.

Formatting is restricted to owned source/test/script/site directories, with exact
fixtures, published artifacts and ignored evidence excluded by `.prettierignore`.
The release build prehook refuses an already existing versioned artifact before
Parcel can write to dist; use the isolated check for reproduction or bump to a new
widget version first. Three negative/positive guard tests cover preservation, new
versions and unsafe version paths.

The product site retains 0.8.1 in every generated asset/example, adds its canonical
URL and a guided WordPress Preview link, and clarifies that hundredths follow the
visitor's device clock. The site builder uses exact retained bundles, not a new
runtime build. A fresh temporary build is a validation result, not a replacement
for a published artifact.

The temporary Parcel API check now explicitly matches the production CLI's
optimization/scope-hoisting flags and rejects bytes that differ from the current
versioned artifact. The corrected check reproduces all **36,009 bytes** of 0.8.1,
SHA-256 `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
The earlier API smoke emitted a different loader wrapper; its old output is
retained locally and was never delivered to the CDN or plugin package.

## Branch and deployment workflow

Keep two permanent branches: `dev` for integration and `main` for production.
Both require up-to-date `Repository checks` and `Browser tests`, a PR and resolved
discussions, including administrators; force push/deletion are forbidden. Temporary
PR branches are allowed and may be removed after integration. CI runs on PRs and
pushes to both permanent branches. Keep `main` as the default branch.

Use ordinary merge commits for development PRs into dev and release PRs dev→main.
Synchronize main changes back to dev by merge rather than repeated squash/rebase.
Do not bypass protection or delete dev as a merged PR head.

Cloudflare dashboard was read after user login: production branch **main**, build
command `npm run site:build`, production command `npx wrangler deploy`, non-production
version command `npx wrangler versions upload`, non-production builds enabled.
Thus dev builds upload versions without assigning production traffic. Existing
settings need no change. The OAuth API cannot read Builds triggers (HTTP 403);
the dashboard observation supplies this setting verification.

Before this work, production deployment was
`91de9dc4-12ce-406d-a91b-bb9e1119e196`, version
`ab98d509-1b81-4f55-9b23-d0ba5d3b724f` at 100%. Keep that version as a rollback
reference; rollback must restore traffic to a retained version, never overwrite
an immutable 0.8.1 URL. Public delivery after a main merge requires separate
SHA/cache/version/example checks; a green preview build alone is insufficient.

## Evidence preservation and cleanup

Before checkout changes, all Git refs were bundled and `git bundle verify` passed.
The current original branch was clean at a19e08c, with the former dirty readme
already committed by the user. Published history is not rewritten to improve that
commit's message.

Two ignored evidence trees were archived and every archived entry verified:

| Archive | Entries | Original bytes | Compressed bytes |
| --- | ---: | ---: | ---: |
| original-local.tar.gz | 137722 | 13905403175 | 3312278236 |
| accepted-local.tar.gz | 121860 | 6732277064 | 1556178042 |

Backups, per-file manifests and verification results remain private under
`.local/release-readiness-20261031/backups/`; the Git bundle is
`.local/release-readiness-20261031/backups-all-refs.bundle`. Git alone does not
preserve ignored ZIPs, raw reports, credentials or databases. These backups are
on the same disk: they protect cleanup/rollback, not disk loss. Do not publish them.

Delete only branches whose unique changes are integrated and whose evidence is
retained. Reviewer/author worktrees may be removed only after verifying their
ignored evidence backups; keep stopped Docker databases/volumes and foreign
projects untouched. Preserve existing tags, failed ZIP histories and raw failures.

## Validation and remaining boundaries

Fresh checks include typechecking all three configurations, lint, 22 Node tests,
coverage, 47 focused package/serialization/tooling/prose/release tests, an isolated
production build and preview generator/PHP/JavaScript syntax checks. Local Chromium
and WebKit each pass 37 unit/browser checks. macOS Firefox fails to launch with
`sandbox_extension_issue_file_to_process` and a framebuffer error; it is not
credited as PASS, and the required Linux three-engine CI remains authoritative.

The generated-site regression also checks all 11 ticking examples, the current
script URL, canonical URL, WordPress Preview link, timezone/locale/literal Caption,
hundredths/seconds coupling, escaped embed code, reset and 390 px overflow. It runs
in all three engines in CI; the local Chromium/WebKit runs pass with external
Google stylesheet transport deliberately blocked.

The full native WordPress/database/Plugin Check matrix was not repeated because
all 16 installable bytes remain unchanged. Its old-writer and erased-data limits,
TLS/multisite/native Safari/VoiceOver/Google transport and public 1.1.4 update gaps
remain explicit. New PHP cleanup, gettext changes and asset-enqueue refactoring
would invalidate this byte-preservation strategy and require separate acceptance;
they remain future runtime work rather than hidden release changes.

The complete 1.1.4 upgrade/rollback orchestration still has local-only inputs.
Tracked native serialization tests do not make that full lab reproducible on a new
machine. Preserve archived harnesses now; sanitize/pin/track their bootstrap as a
separate bounded follow-up without committing databases or credentials.

Before later WordPress publication: use the exact 16-file allowlist, verify public
catalogue/ZIP contents, obtain a real 1.1.2→1.1.4 Core update offer, run an installed
Core canary and repeat ordinary public Preview acceptance. Repository integration
and demo/CDN deployment do not complete those publication gates.
