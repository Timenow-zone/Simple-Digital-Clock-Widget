# Repository synchronization review, 7 November 2026

The accepted WordPress **1.1.4 render-r9** source is committed in `cc08df6` and
reviewed in [PR #18](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/pull/18)
against `dev`. Both [hosted required checks](https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/actions/runs/42349694349)
passed for exact head `cc08df6a7e6fc99b777278aa2578700316e5f6a9` on the first attempt.
Subsequent documentation heads receive their own checks in the PR; the original
success is not transferred to a different head. Merge and WordPress.org
publication remain deferred, and auto-merge is disabled.

## Artifact and repository identity

The accepted ZIP remains **66,815 bytes / 16 files**, SHA-256
`5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
Its CRC, paths, complete manifest, source files and committed Git blobs match.
Shared widget 0.8.1 remains 36,009 bytes with SHA-256
`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
No ZIP, installable file, historical acceptance record or published bundle is
changed by this documentation synchronization.

The branch includes three prepared commits and 124 changed paths relative to
`dev` before this documentation follow-up. Much of that range preserves explicit
release evidence and test tooling. Historical reports and immutable rollback ZIP
fixtures are intentional sources, not disposable runtime data.

The 414-file tracked inventory at `cc08df6` contains no ignored lab databases,
credentials, `.env` files, caches or generated runtime logs. A bounded secret-pattern
scan found no obvious keys or tokens. The tracked `tools/wordpress-lab/init.sql`
contains four test-database creation statements, not a database dump. The only
tracked ZIPs are the documented public 1.1.2 and accepted r8 rollback-test inputs.
Ignored raw evidence and stopped databases are retained rather than deleted.

## Documentation corrections

- Current READMEs now distinguish the successful hosted checks from the frozen
  6 November local-only acceptance. The latter remains an unchanged historical
  record of its actual scope and authorization.
- The release README identifies committed source `cc08df6` and the open PR.
  The 31 October preparation record is explicitly historical.
- The lab's current verifier example uses the accepted r9 ZIP instead of the
  obsolete compatibility-r2 ZIP that the current manifest would reject.
- Rollback documentation links the frozen r8 streaming contract and names the
  reserve/r8 observers explicitly. Original public 1.1.2 is not described as
  having that later observer. The reserve build uses the tracked CI fixtures.
- The original native r8 writer runner is clearly marked historical: its r8
  closing hash and the current bootstrap's r9 manifest cannot be satisfied by
  one archive. Current r9 native acceptance is documented separately; old commands
  must not be made to pass by replacing the current manifest.
- The performance recipe names the current manifest-bound r9 candidate and
  removes the obsolete tokenizer claim. Previous streaming measurements remain
  tied to their original artifacts; no new r9 TTFB/PHP-memory claim is made.
- The asset contract states its publication boundary without implying that the
  subsequently authorized GitHub push did not occur.

The initial link review covered 80 tracked Markdown files and 402 relative file
links with no missing target. That check does not certify arbitrary external URLs
or every Markdown anchor. The follow-up checks include the new report and links.

## Examples and delivery readback

Fresh `npm run release:check`, `npm run release:verify` and the WordPress preview
generator's `--check` pass. The preview blueprint is 62,422 bytes and agrees with
its sources; it inserts the owned WordPress block required by r9. Its three
presets and 42 city locale/timezone pairs are valid. The product template has
20 unique IDs and valid internal anchors. Development, manual comparison and
product inline scripts pass syntax checks; older runtime comparison examples are
deliberate historical baselines.

Read-only HTTP checks verified the public homepage, `/version.json` and all eight
versioned CDN bundles: HTTP 200, exact retained bundle bytes, immutable cache
headers and `nosniff`. The production site still identifies `main` `526e3a`, which
is expected while PR #18 is unmerged. This review did not deploy it.

A fresh production Chromium smoke verified 11 rendered and ticking clocks, one
runtime request, Ukrainian locale formatting, literal caption handling, escaped
embed code, reset and a 390-pixel viewport without horizontal overflow. No page
JavaScript errors occurred. The WordPress Playground environment itself was not
relaunched; blueprint/source parity and block structure are separate evidence.

The production gzip record is 12,491 bytes (Node 24.22.2/zlib 1.3.2.1), versus the
README's recorded 12,446 bytes (Node 26/zlib 1.2.12). Both describe the same
36,009-byte JavaScript artifact and round to 12.2 KiB. Different encoders do not
indicate different runtime bytes.

Ignored `product-dist/index.html` had a stale source-commit link. Regenerate it
with `npm run site:build` after the final documentation commit, then verify its
source/version metadata and eight artifact hashes. Generated output stays ignored;
building it does not publish a site or replace versioned source artifacts.

## Translation findings: incomplete administrative UI coverage

Package version, text domain and POT metadata agree. The POT covers all 51
existing gettext strings, and all 115 locale tags in the selector are valid.
The widget's locale-dependent date/time formatting uses `Intl` and is separate
from translation of WordPress administrative labels. Native language names are
intentional localized values and are preserved.

The broader review found inherited UI translation gaps that the earlier bounded
acceptance did not certify:

1. `block.js` consumes `localeInvalid`, `useSiteLocale` and `resetToSiteTz`, but
   PHP does not export them. It also requests `shdowHelp` instead of the exported
   `shadowHelp`. These four controls/help messages always use English fallbacks.
2. The rating notice uses `esc_html()` and `esc_attr()` with an ignored text-domain
   argument. Escaping does not call gettext; five non-brand notice messages are
   not translatable through that path.
3. The settings page title is hardcoded English, and some POT source-line
   references lag the current layout.

These patterns are also present in the exact public 1.1.2 ZIP. They are inherited
administrative translation defects, not render-r9 resource-loading regressions.
The repository and accepted package must not be described as fully localized.
Availability of actual WordPress.org translation packs is a separate matter.

A concrete, unapplied proposal is retained locally at
`.local/github-pr-r9-20261107/i18n-proposal.patch`, with its validation plan in
`I18N-PROPOSAL.md`. It changes four packaged files: exports the missing messages,
corrects the shadow key/help, uses escaped gettext helpers and synchronizes the
POT. The proposal passes `git apply --check`; it is not an implemented or accepted
fix. Applying it requires a separately identified candidate and fresh acceptance.
The accepted r9 ZIP must remain unchanged regardless of that later decision.

## Evidence and remaining boundaries

Fresh readback and review receipts are under `.local/github-pr-r9-20261107/`.
Both required hosted jobs passed for `cc08df6`; later PR heads are verified
independently. The original five low dev-only audit findings remain visible;
there were zero moderate/high/critical findings at the successful CI gate.

This review corrects current documentation and verifies artifact/example
consistency. It does not certify complete administrative translation, regenerate
the accepted ZIP, repeat native Safari/VoiceOver/multisite acceptance, introduce
new performance measurements, merge the PR or publish to WordPress.org.
