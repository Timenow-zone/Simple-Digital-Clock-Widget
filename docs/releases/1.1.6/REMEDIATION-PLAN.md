# WordPress runtime delivery remediation plan

Date: 2026-11-12. **Current status: RC5 scoped alignment acceptance PASS; delivery pending.**
Baseline source: `558460c80fe317e6d0327c79c8a4478e7430e8cf`.
The [standalone review](../0.8.2/STANDALONE-COMPATIBILITY-REVIEW.md) confirmed a
shared-runtime failure outside WordPress. [RC4](RC4.md) bundles widget 0.8.3 with
per-host error isolation and corrected renderer readiness. Earlier scoped results
for frozen [RC3](RC3.md) remain in its [snapshot](FINAL-ACCEPTANCE-RC3.md); they do
not replace fresh acceptance of changed artifacts. The [RC4 report](FINAL-ACCEPTANCE-RC4.md)
records earlier scoped checks. The later [multi-instance review](../0.8.3/MULTI-INSTANCE-REVIEW.md)
adds different simultaneous settings and proves a pre-existing Firefox alignment
defect. Selected [RC5](RC5.md) now contains widget 0.8.4 with explicit alignment
classes. The [two-phase defect record](../../defects/MULTI-ALIGN-P2-01.md) preserves
the red baseline; [RC5 scoped acceptance](FINAL-ACCEPTANCE-RC5.md) records the
fresh results and limits. No prior failure is relabeled.
Final-HEAD CI and separately
authorized production CDN delivery remain required; WordPress publication is deferred.
RC1 and RC2 remain **NO-GO**;
their manifests, archives and evidence are retained. On 2026-11-12, the owner
explicitly approved eager compatibility loading for opaque runtime overrides;
see the bounded [exception](OVERRIDE-POLICY.md). The default bundled runtime
still requires a use signal. Merge, CDN delivery and WordPress.org publication
have not been authorized by this policy decision.

## Phase 2 design decision: lightweight registration, deferred renderer

The unchanged 0.8.1 runtime cannot accept a pre-registered custom element: its
`preact-custom-element` adapter unconditionally defines the same tag. Neither a
document observer nor a WordPress render hook can observe a signal-free
`whenDefined()` waiter or the first clock inside a closed shadow root. Keeping
0.8.1 and all three requirements would therefore be contradictory.

The implementation expands the shared runtime to a new **0.8.2** artifact. A
small custom-element shell registers the existing tag without loading Preact or
the renderer. Native connected callbacks supply the use signal, including closed
shadow roots. The shell resolves `whenDefined()`, allowing existing code to
create its first clock, and defers the main request until the host stays connected
through a microtask. The runtime installs a Preact adapter into the same host;
standalone runtime loading installs that adapter eagerly. No browser API is
patched and no polling is added. The adapter preserves existing props, shadow
root, context, slot, hydrate and disconnect behavior with upstream MIT attribution.

This deliberately revises the matrix's implementation-specific "no definition"
assertion: no-use pages may define the lightweight shell but must request zero
main runtimes and must not initialize a renderer. Definition alone is no longer
a readiness or rendering oracle. The original RC1 hidden-integration fixtures
remain required without candidate-only enqueue workarounds.

Published 0.8.1 bytes and URLs remain immutable. This expanded scope requires the
shared build, exact artifact checks, generated CDN assets, production delivery
and public SHA verification in `AGENTS.md`; WordPress-only packaging cannot close
the release. The previous CDN deployment and 0.8.1 artifact remain rollback
inputs. WordPress.org publication still requires a separate owner command.

The architecture, packaging and regression boundaries received three separate
read-only reviews. Documentation prose, whitespace and local links were checked;
RC1/runtime hashes and all 2,566 sealed evidence files remain unchanged. The
matrix contains 42 required gates. These checks validate the planning artifacts,
not the future implementation. No product code, package, service or publication
state was changed in phase 1.

## Objective and authority

The owner requires the main clock runtime to stay off public pages where clocks
are not used, while preserving existing clock content and integrations and
supporting normal Gutenberg editing without additional user steps. Architecture
may change when justified; a particular DOM observer implementation is not a
requirement. This is a WordPress integration task, not a requirement to make
every clock-free page contain zero plugin bytes.

The four phases are planning, implementation, independent acceptance, and code
review/hygiene/regression/release preparation. **WordPress.org publication waits
for a later explicit owner instruction.** Candidate acceptance, a green PR,
merging, or the word "release" in a checklist never substitutes for that instruction.
The final pre-publication status is `READY_FOR_WP_PUBLICATION`, not `PUBLISHED`.

After phase 1, the owner explicitly instructed continuation into implementation
and acceptance without another phase-start approval; WordPress publication still
requires a separate command. This also carries the previously requested phase 4
review, hygiene, regression and release preparation. No compatibility exception
was implied by that authorization; the later override exception was explicitly
approved and recorded separately. A separate implementation chat may be used,
as the owner expressly permits, with this plan and the matrix as its handoff;
creating a chat must not result in simultaneous implementation in two checkouts.

## Baseline evidence

- Exact RC1: `.local/packages/simple-digital-clock-1.1.6-rc1.zip`, SHA-256
  `1b29a26dc28431a40c475c9db6e7cee6056ef9731f298c6f672da7d200af1ecf`.
- Shared widget 0.8.1:
  `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.
- [Independent report](../../../.local/independent-116-rc1-20261112/reports/REPORT.md)
  and [machine-readable result](../../../.local/independent-116-rc1-20261112/reports/RESULT.json).
- [Sealed evidence inventory](../../../.local/independent-116-rc1-20261112/reports/EVIDENCE.json),
  SHA-256 `f6613450d6b55cf284eac163c2e12b71c3c21bacc35992c4f6b67f93aaeb55da`.

These ignored local files are available in the current workspace; they are not
claimed to be present in a remote checkout. Preserve their bytes and read-only
state. New evidence belongs in a new directory, never inside the sealed RC1 run.

| Finding | Required disposition |
| --- | --- |
| `WDG-P2-01`: legacy Text/Custom HTML previews lose their runtime | Repair the real preview iframe lifecycle; repeat all 12 baseline/candidate comparisons |
| `LDR-P2-02`: external-only CSP blocks inline bootstrap | Deliver executable bootstrap externally through Core, with non-executable configuration |
| `LDR-P2-01`: first-after-whenDefined and shadow-first integrations stop loading | Restore known WordPress/explicit integration signals, retain all original counterexamples, and resolve any remaining compatibility boundary explicitly |

The pre-existing WebKit inserter interaction and corrected harness errors remain
separate observations. Do not remove them from history or classify them as new
candidate regressions without new evidence.

## Target architecture

### Registration and one runtime owner

Register the existing `simple-digital-clock` handle early without enqueuing it
globally. Preserve the existing URL/version, filters, dependencies, attached
data, and Core queue ownership. Use one idempotent request path for the runtime.
Restore the public helper `SDCW_enqueue_scripts()` to mean an explicit request
for runtime loading; an existing integration calling it must not silently get
layout only. Separate layout requests internally when necessary.

### Native frontend use

An actual render of the owned block is a runtime-use signal. Prefer the existing
owned render hook with a normal Core enqueue because it already has output and
response-context guards. Evaluate `view_script` as the simpler alternative if it
passes the same lifecycle matrix; choose one primary mechanism, not two parallel
owners. Do not restore a global `script` attachment blindly: older Core can
enqueue registered general block scripts even when the block is absent.
Core also differs after rendering: `view_script` is queued before render filters;
the current Core removes newly queued assets for empty final output, while the
minimum Core does not. Test empty output, a removed parent and already-owned
dependencies on both versions. Never globally dequeue another owner's runtime
request to make a zero-request assertion pass.

The mechanism must work when clocks arrive through a post, page, nested block,
synced/reusable block, pattern, template part, block widget or rendered sidebar.
Do not use only `has_block()` on the current post or scan all saved posts/options
on every request. A widget configured only in an inactive or unrendered sidebar
does not justify runtime on unrelated pages. A clock in a shared header/footer
does justify runtime on every public page that renders that placement.

At the owned hook, empty output does not request assets. Once WordPress has
rendered/requested a clock, a later third-party filter removing its output may
leave an enqueued runtime, as with ordinary Core asset lifecycles. Record that
case explicitly. Do not introduce whole-response buffering to guarantee final
DOM absence, and do not misreport this case as a clock-free no-use page.

### Existing HTML and client-side insertion

Use bounded checks of content already being rendered for legacy Text, Custom
HTML and raw clock markup. Keep content bytes unchanged. Avoid duplicate full
page parsing or database-wide placement searches. Match actual HTML elements,
not escaped examples, comments, script text, inert templates or substrings.

Keep a small cacheable external bootstrap for ordinary DOM clocks that become
available without a server-side use signal, including late PHP output and
client-side insertion. Emit its non-executable JSON configuration before it can
execute. Use a distinct Core handle and Core-generated external script markup;
do not require executable inline initialization or convert the configuration to
`wp_localize_script()` output.

The fallback must respect an already queued, printed, loading or registered
runtime, avoid duplicate requests/side effects, retain Core nonce/SRI/attribute
handling and before/dependency/after ordering, and keep explicit errors and the
bounded timeout. No polling, monkey-patching browser APIs, or consent/CSP bypass.
Only invoke the private runtime-markup capture when the fallback needs it;
native enqueues should use the normal Core path.

### Gutenberg and preview documents

Treat editor runtime as an editor-content dependency. Make it available before
the first clock is inserted into an empty editor, including the actual iframe
realm. Keep editor UI scripts and content assets separately scoped. Cover Post
Editor, Site Editor, block Widgets editor, non-iframed supported configurations,
and native legacy-widget preview iframes. Ordinary admin pages remain unaffected.

Legacy preview HTML is generated inside a REST response. Give that complete
preview document its own explicit enqueue path during `wp_enqueue_scripts`,
using verified REST/iframe context. Do not weaken the ordinary JSON/feed/XML
guards or print script bytes outside Core's preview buffer. Do not assume a
runtime loaded in the parent document exists in the iframe's custom-element
registry.

Core collects iframe assets with a separate `WP_Scripts` instance and invokes
`enqueue_block_assets` again. Idempotence must follow the current Core registry
and document, not a single request-global "already enqueued" flag that suppresses
the iframe pass. Keep the clock's block API version unchanged; exercise supported
legacy non-iframe editor configurations through separate compatibility fixtures.

### Compatibility boundary that must remain visible

With a known WordPress placement or an explicit runtime request, load before
waiting for the first DOM clock. This supports `whenDefined()` and shadow-root
integrations with that use signal. Preserve direct Core enqueue, dependencies,
the existing helper and late explicit enqueue semantics.

A completely external script that has no WordPress placement/use signal and
waits for definition before creating its first clock is not discoverable by
observing document additions. A first clock in a closed shadow root likewise
does not expose a document-subtree signal. The original RC1 counterexamples
must remain unchanged in the regression corpus. Adding an enqueue to the
candidate side only is a workaround control, not proof of backward compatibility.

Phase 2 must record a bounded design decision for these cases. It may establish
an existing integration signal, implement a separately justified runtime design,
or identify a residual exception for an explicit owner decision. The current
owner request does **not** authorize silently accepting a compatibility break.
If the unmodified counterexamples still fail and no exception has been explicitly
accepted, mark the compatibility gate unresolved and do not declare the whole
candidate accepted. Continue unaffected work rather than hiding the failure.

## Scope and preservation boundaries

Expected primary changes:

- `wordpress/simple-digital-clock/includes/simple-digital-clock-assets.php`;
- `wordpress/simple-digital-clock/assets/public/js/simple-digital-clock-loader.js`;
- `widget_init.php` only if block asset registration needs adjustment;
- asset/loader tests and a reusable native WordPress regression harness;
- current asset contract, candidate records, readme/POT/manifest when justified.

Keep block name, custom-element name, saved HTML/attribute schema, existing
settings, KSES/security boundaries and database contents compatible. Do not add
a database migration or require resaving old posts. `block.js` and KSES code are
not default change targets; any change there needs a concrete failing case.

Keep shared widget 0.8.1 bytes, `dist/`, shared dependencies, immutable published
URLs, historical ZIPs/manifests/evidence and unrelated working trees unchanged.
Do not create a new settings UI or broad abstraction merely to select loading
modes. If a shared-runtime change becomes necessary, record the expanded scope,
use a new widget version, and follow the build/CDN contract in `AGENTS.md`; a
WordPress-only ZIP then cannot represent a completed shared-runtime release.

Rollback during development is a scoped reversal of the implementation diff.
Rollback in the disposable lab replaces plugin files with the retained verified
baseline package and purges caches, without restoring the database. Never use
`git reset --hard`, overwrite old ZIPs, or remove unrelated Docker resources.

## Four phases and exit gates

### Phase 1 — plan

Deliver this document, the [acceptance matrix](ACCEPTANCE-MATRIX.md), and an
accurate release-index status. Review architecture, observable loading policy,
compatibility boundary, file ownership, phase exits, publication gate and
rollback procedure. Product code and RC1 artifacts remain unchanged.

Exit: the plan is concrete enough for a different implementer and an independent
reviewer to use without reconstructing the chat; unresolved design decisions
are named rather than counted as accepted behavior.

### Phase 2 — implementation

1. Record clean/dirty source status, exact base, current artifact hashes and
   preservation inventory. Reuse the suitable current checkout unless isolation
   is actually needed. Keep one implementation owner.
2. Convert the three RC1 findings and missing native-editor surfaces into durable
   regressions with genuine failing baselines. Preserve original counterexamples.
   Add a candidate-aware native entry point, proposed as
   `tools/wordpress-lab/candidate/run.py`, with explicit ZIP, frozen manifest,
   expected SHA, fresh run directory and owned-project inputs. This is a planned
   new entry point, not an existing executable command. Historical repro/rollback
   runners pin older releases; preserve those pins and safety tests rather than
   silently repurposing them for RC2.
3. Implement the native request path and explicit helper semantics; add editor
   and legacy-preview paths; then external fallback delivery and deduplication.
4. Exercise one focused native minimum/current slice early, before full packaging,
   to expose lifecycle errors that Core doubles cannot catch.
5. Resolve or explicitly report the hidden-integration boundary above. Update the
   proposed behavior and tests together; do not only weaken old assertions.
6. Synchronize candidate source/docs/i18n as needed and create a new deterministic
   `simple-digital-clock-1.1.6-rc2.zip` plus a frozen candidate manifest. Never
   replace RC1. If this name already exists, use a fresh revision.

Before moving the canonical `manifest.json` pointer, preserve its exact RC1 bytes
as `manifest-rc1.json` and repair historical references so RC1 records still
identify RC1. The current package test and verifier compare the current source
against the canonical manifest; they do not accept a historical-manifest option.
Use a fresh exclusive-create builder, sorted entries, fixed timestamps and
regular 0644 file permissions. Do not reuse the frozen RC1 builder, which asserts
a different change scope, or the generic overwriting `candidate.zip` builder.
The plugin version stays 1.1.6; RC2 is an artifact revision, not `1.1.6-rc2` in
the WordPress header. The widget version stays 0.8.1 for the default WP-only scope.

In particular, replace the old assertion that forbids any `wp_enqueue_scripts`
hook with an assertion that no-use frontend requests do not enqueue the main
runtime. A legitimate external bootstrap hook is not a failure. Keep zero-runtime
controls for genuine no-use pages while changing render/helper assertions to
the intended Core-owned loading behavior.
Split the existing combined empty/raw/owned/discarded/helper fixture into those
causally different cases. In the browser server, serve bootstrap and runtime at
distinct exact routes with their actual bytes, return 404 for unknown routes,
and count/hash the two assets separately. The old fixture's unknown-route runtime
fallback must not accidentally turn a bootstrap request into a passing clock.

Exit: focused regressions pass, no unaccounted product changes, actual source and
ZIP identities agree, and the implementation notes state any unresolved gate.
Implementation self-tests are not independent acceptance.

### Phase 3 — independent acceptance

Run the matrix against the exact frozen ZIP, with an independent reviewer and a
new evidence directory. Install official public baselines before real Core
upgrade; check native UI, frontend, data, actual cache behavior, files-only
rollback and reupdate. Reuse corrected harness methods by copying them into the
new run; do not alter sealed RC1 evidence or reuse its PASS counts as new results.

Record per-case expected/actual outcomes, actual runtime requests and hashes,
rendered shadow content, browser errors, screenshots, command receipts, version
identities, full content-table hashes and stable options. Keep failed first runs
and harness corrections. Missing required coverage is `NOT_RUN`, never PASS.
Include actual saves under the rolled-back public version using a healthy
control corpus, then reupdate and verify the saved values. Keep the old writer's
known terminal-backslash defects as distinct baseline controls; a files-only
rollback is not a repair for historical writer behavior.

Exit: every required matrix gate passes and every RC1 finding has a documented
disposition. An unresolved compatibility exception or a skipped required native
surface prevents an unqualified GO. Any product/package byte change after this
point creates a new candidate identity and requires affected acceptance again.

### Phase 4 — code review, hygiene, regression and release preparation

Independently review the final diff for correctness, lifecycle ownership,
security, compatibility, unnecessary complexity and coverage quality. Review all
accompanying surfaces below. Preserve unrelated work and published artifacts.
Run the required local and hosted checks against the final source revision;
update/create the appropriate PR and respect protected-branch rules. The two
required checks are `Repository checks` and `Browser tests`. Do not rely on the
old green run for a changed HEAD, or add commits after the final checks without
checking the new HEAD.

For a WP-only delivery change, use the isolated production-build smoke and
verify unchanged runtime hashes; do not rebuild into immutable `dist/` files in
the main checkout. Prepare the exact release ZIP, source/candidate provenance,
rollback package, cache-purge instructions and release notes. Mark the result
`READY_FOR_WP_PUBLICATION` only after review, acceptance and required checks.
Wait for the owner's explicit WordPress.org publication instruction.

When that instruction arrives, recheck that the approved artifact is still the
one being published. Verify the public package and metadata after publication,
report any legitimate server ZIP repack separately from file-content identity,
and smoke-test the public package. Do not claim publication from a local ZIP or
CI success. If publication has not occurred, release status must say so.

## Accompanying-file review

| Surface | Required review/action |
| --- | --- |
| `widget_init.php`, assets PHP/JS | Loading ownership, guards, versions/cache keys, compatibility helper and error paths |
| `block.js`, KSES, admin files, images | Compare to baseline; preserve unless an explained change is necessary; do not mechanically change historical file-revision annotations |
| `readme.txt` | Plugin version/stable tag/changelog/first Upgrade Notice, actual loading behavior, compatibility scope, minimum versions and cache purge guidance |
| POT and translations | Fresh extraction from exact candidate; message/reference/context/placeholder/tag parity; preserve exact localized values |
| `docs/WORDPRESS-ASSET-CONTRACT.md` | Replace obsolete DOM-only/inline/helper semantics with the verified implementation; state costs and limits accurately |
| Current release README and candidate record | Current verdict, new ZIP/hash/source, inherited versus fresh evidence, publication state |
| Root README, `wordpress/README.md`, lab README | Current references and supported behavior; new reproducible harness entry point and scope |
| Current and frozen manifests | Full allowlist, every file hash, size/count, revision, source/runtime provenance and rollback identity; freeze RC1 before moving a current pointer |
| Acceptance aggregates | Bind reports to the exact new artifact and test revision; retain RC1 reports as historical evidence |
| `tests/wordpress-*`, native harness | New defect controls, unchanged serialization/security assertions, deterministic fixtures and no product-test doubles substituted for UI evidence |
| `.github/workflows/ci.yml` | Verify real gate coverage and package-current references; change only when a required regression is absent |
| `wordpress/preview`, preview builder | Run parity check; regenerate only if its owning sources actually change, and review generated output |
| `package.json`, lockfile, shared source, `dist`, product site | Verify preservation and release consistency; WP plugin version is independent of widget version |
| `LICENSE`, `THIRD-PARTY-NOTICES.txt` | Retain correct licenses/provenance and inspect any changed dependency or file set |
| PR title/body and release notes | English prose; final behavior, validation, limitations and exact candidate; no obsolete acceptance claims |
| Local evidence and lab resources | Separate new run, hashes, failure retention, no credentials in shared reports, stop only owned services, retain rollback data |

Do not use `release:version` to set a WordPress plugin version: it changes the
shared widget. `release:sync`, direct `build`/`build:prod`, `site:build`, preview
`--build`, whole-tree `fmt` and `lint:fix` are not routine WP-only verification
commands. They can modify shared/published/generated surfaces or unrelated
files. Use the read-only checks and isolated build smoke listed in the matrix;
make any needed generated-file update as an explicit, reviewed task.

## Risks and decision log

| Risk/decision | Handling |
| --- | --- |
| Server rendering differs from final DOM after other plugins' filters | Test and describe render/use semantics explicitly; do not require global output interception |
| Core editor/REST preview realms differ | Separate native lifecycle fixtures and runtime counts per document |
| Native enqueue and fallback race | One runtime owner; pending/done/defined and late-enqueue controls in three engines |
| CSP or optimizer transforms script delivery | External bootstrap, Core attributes and actual positive/negative policy tests; no policy weakening |
| Cached HTML hides the new version | Demonstrate warm-old-cache behavior, purge both cache layers, verify served runtime SHA |
| Existing helper call loses its old meaning | Restore and test the explicit runtime request contract |
| Hidden pure-JS/shadow integration still fails | Preserve failure, assess a bounded design solution or seek a concrete exception decision; do not self-waive |
| Tests encode the old implementation instead of the owner's goal | Update intended behavior and assertion together; retain negative controls and external observations |
| Release metadata points at another ZIP | Exact artifact verification and frozen acceptance; no repack substituted at publication |

Primary references: [WordPress block metadata](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)
and [editor asset guidance](https://developer.wordpress.org/block-editor/how-to-guides/enqueueing-assets-in-the-editor/).
The target architecture was also checked against actual Core 6.3.14 and 7.1.4
source retained in the independent lab. These references support the design;
they do not replace execution of the matrix.
