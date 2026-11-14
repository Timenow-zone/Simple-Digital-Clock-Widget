# WordPress 1.1.4 render-r9 local regression

Date: 2026-11-03. Verdict: **PASS within the owned-block rendering contract**.
This is author-run local regression, not a new independent release acceptance.
No push, merge, tag change, CDN deployment or WordPress.org publication occurred.

## Exact artifact and implementation

- ZIP: `.local/packages/simple-digital-clock-1.1.4-render-r9-candidate.zip`.
- SHA-256: `5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
- 66,815 bytes / 16 regular files; [manifest](manifest.json).
- Manifest SHA-256: `f9fdc614092ef566b2965a68a693a87b928c939595334a2873d0bab83b1446c6`.
- Source: local changes on `1a60f9fe1bed3afa56f45bdac5c485a1ec4e7b06`.
- Exact identities, changed source hashes and raw-evidence hashes:
  [render-r9-evidence.json](render-r9-evidence.json).

Compared with the accepted r8 archive, only
`includes/simple-digital-clock-assets.php` and `readme.txt` change;
`includes/simple-digital-clock-output.php` is removed. The other 14 files remain
byte-identical, including `block.js`, the KSES/metadata writer, notices, main
plugin file and the entire widget 0.8.1 bundle. Widget SHA-256 remains
`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

The plugin no longer installs `template_redirect`/output-buffer callbacks or a
stream lexer. Its named block render filter lazily registers/enqueues the stable
Core handles. Inline styles print in the head or footer; late explicit rendering
prints only pending handles after Core's footer script action. There is no global
content scanner, database discovery, frontend loader or external CSS file.

The [contract](../../WORDPRESS-ASSET-CONTRACT.md), plugin readme, repository README
and routing/native/browser tests now describe render events, not final-response
HTML discovery. Frozen rollback tests reference the preserved r8 manifest instead
of the moving current-candidate manifest. The rollback builder and both frozen
input archives remain unchanged.

## Results

Pinned reference environments, not claims about the newest public versions:

| Environment | WordPress | PHP |
| --- | --- | --- |
| Minimum | 6.3.14 | 7.0.33 |
| Current reference | 7.1.4 | 8.3.35 |

| Check | Result |
| --- | --- |
| Owned rendering/package/serialization Node tests | 12 PASS |
| Frozen rollback builder/safety tests | 15 PASS |
| Disposable lab safety tests | 9 PASS |
| Widget Node tests | 22 PASS |
| Native legacy/current reader browser groups | 3 PASS: Chromium, Firefox, WebKit |
| Real Core file transitions | 6 PASS: update, reserve rollback, reupdate on both references |
| Native post-transition editor saves | 108 PASS, administrator/editor/author |
| Strict raw JSON block observations | 756 PASS: captions, class, lock and settings |
| Frontend block-theme resource cases | 180 PASS: 45 fixtures x 2 references x Chromium/WebKit |
| Classic-theme resource cases | 60 PASS: 15 fixtures x 2 references x Chromium/WebKit |
| Final admin/editor pairs | 4 PASS: both references x Chromium/WebKit |
| Plugin Check 2.1.0 | 29 static + 5 actual runtime checks; zero errors/warnings |
| Runtime HTTP verification | Both references: HTTP 200, exact 0.8.1 SHA and cache version |
| Release metadata, immutable bundle, generated preview, lint, syntax, prose, whitespace | PASS |

The editor writer cycle is public 1.1.2 -> render-r9 -> frozen local editable
reserve 1.1.2.1 -> render-r9. The reserve is a rollback test target, not a required
intermediate upgrade. Each transition preserves full post-row and selected
critical-option hashes without a database restore, and checks every installed
plugin file. The baseline/fixed corpora contain 12 positive posts and 84 clocks.
An additional strict JSON pass checks saved comment metadata directly rather
than relying only on the recovery reader.

The unmodified original 1.1.2 writer still reproduces its inherited Core 6.3
negative controls: 30/33 validity/exactness failures, versus 0/33 on the current
reference. These are not failures of the new writer and do not imply all 30
captions were erased. No file update can reconstruct data already lost before it.

Plugin Check is run on supported PHP 8.3, including real runtime checks; PCP 2.1.0
cannot run on PHP 7.0. Actual plugin rendering, saves and routing are tested on
PHP 7.0 separately. Both final installed file sets match the exact ZIP.

## Resource and compatibility boundaries

| Scenario | Live clocks | JS requests/tags | Inline rules | External CSS |
| --- | --- | --- | --- | --- |
| Unused page | 0 | 0 | 0 | 0 |
| One owned block | 1 | 1 | 1 | 0 |
| Three owned blocks | 3 | 1 | 1 | 0 |
| First owned clock after Core footer scripts | 1 | 1 | 1 | 0 |
| Unmanaged raw custom-element HTML | 1 uninitialized element | 0 | 0 | 0 |
| Parent removes an already rendered owned child | 0 | 1 | 1 | 0 |

Nested blocks, synced patterns, block widget areas, mixed page/sidebar clocks,
pre-head rendering, late rendering, explicit flushes, draft/inactive controls,
excerpts and explicit raw-HTML integrations pass. All expected active clocks tick.
Requests are counted in fresh browser contexts; no admin/editor bundle leaks to
the frontend. Core's duplicate-handle behavior prevents repeated script/style
insertion. The classic theme is Twenty Twenty-One from the hash-pinned Core
6.3.14 archive; previous lab themes are restored afterward.

Saved 1.1.2 clock blocks retain automatic rendering and data compatibility.
Arbitrary raw HTML, Custom HTML/Text widgets, cached markup or third-party
shortcodes that bypass the owned render event need explicit
`SDCW_enqueue_scripts()` in their renderer. Old global enqueue/discovery made
those integrations automatic; this new contract does not. If a later parent or
content filter deletes an already rendered clock, queued assets can remain.
These two boundaries are deliberately tested and must not be advertised as the
old final-HTML guarantee.

Ordinary admin pages have no runtime, plugin stylesheet or inline layout rule.
Empty editors can insert, preview, save and reopen a valid clock in the iframe.
The editor uses a block wrapper around an inline custom element; the saved
frontend element carries the block class directly. Tests verify the wrapper,
inline-rule presence, matching saved-host CSS selector, per-document deduplication
and rating-notice scope. This preserves the existing editor structure.

## Retained failed attempts and corrections

1. The initial native paragraph assertion compared Core-rendered HTML to input.
   Core 7.1 adds `wp-block-paragraph` independently of this plugin. Comparing the
   same render with the owned hook installed/removed proves identical output on
   both references. The failed result remains in `render-assets/`.
2. An added editor assertion incorrectly required `display:block` on the inner
   preview host. Historical exact-r8 measurements show the same inline host and
   block wrapper, and `block.js` is unchanged. The corrected wrapper/selector
   checks pass in `render-admin-close-b/`; the failure remains in
   `render-admin-close/`. Plugin and ZIP bytes were not changed for either repair.
3. The first offline Linux browser container could not create a nested mountpoint
   under its read-only input mount. An empty host mountpoint resolved setup;
   the subsequent three browser groups pass. No container cleanup was used.

The initial asset-admin pass also passed all four pairs; the final pass adds
explicit inline-style exclusion, empty-editor and wrapper-layout checks.
Historical r8 UI-test instability remains historical evidence; these results do
not establish the cause of that earlier failure.

## Evidence, rollback and untested scope

Raw local evidence is retained under:

- `.local/render-r9-20261103/`: runner scripts, exact identities, strict JSON
  observations, offline browser input inventory and browser log.
- `.local/wordpress-repro/render-r9-20261103-a/`: native writer receipts, all
  transition snapshots, raw Plugin Check logs, failed attempts, 240 frontend
  results, final admin observations and teardown verification.

All test-site databases are new. Host-backed data and read-only container roots
with tmpfs reuse pinned executable images because Docker's internal disk is full;
no old site, volume or image was deleted. The test project is stopped and its
containers/data retained. The owner's open site on port 55900 remains running and
was not updated. Exact accepted r8, reserve and public predecessor archives were
rehashed unchanged at closure.

A file rollback can restore the preserved r8 ZIP, including its old global
observer. No schema/data migration is introduced. Saving through original public
1.1.2 on Core 6.3 still carries its known writer risk; use the separately verified
reserve if an editable rollback is required.

New independent acceptance, hosted required PR checks and a new TTFB/PHP-memory
benchmark are **NOT RUN** for render-r9. Old measurements/verdicts do not transfer.
Native Safari/LocalWP, multisite, third-party optimizers, cross-origin font
availability, TLS and production installations are outside this local matrix.
No numerical performance or universal raw-HTML compatibility claim is made.
