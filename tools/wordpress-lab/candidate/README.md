# Exact candidate lab

This runner provisions a new, loopback-only minimum/current WordPress lab and
records actual Core update, physical files-only rollback, reupdate and ordered
database snapshots. It accepts a frozen manifest explicitly; it never substitutes
the canonical current-source manifest or silently rebuilds a ZIP. Preparation and
file-transition checks are infrastructure evidence, not full matrix acceptance.

The cache must contain the exact inputs in `lock.json`. Copy only the verified
input archives from an earlier run, never its installed site/database or PASS
results. The public 1.1.5 archive is the fresh official download, not the older
retained repack. Images are pinned; the minimum image is the retained PHP 7.0.33
image with mysqli enabled. No images are built or pulled by this runner.

```sh
set -euo pipefail
python3 tools/wordpress-lab/candidate/run.py prepare \
  --zip .local/packages/simple-digital-clock-1.1.6-rc2.zip \
  --manifest docs/releases/1.1.6/manifest-rc2.json \
  --sha256 REPLACE_WITH_THE_REVIEWED_64_CHARACTER_SHA256 \
  --cache .local/candidate-input-cache \
  --run-dir .local/candidate-116-rc2-20261112-a \
  --project sdcw-candidate-116-rc2-20261112-a \
  --minimum-port 65481 --current-port 65482
python3 tools/wordpress-lab/candidate/run.py start \
  --run-dir .local/candidate-116-rc2-20261112-a
python3 tools/wordpress-lab/candidate/run.py update \
  --run-dir .local/candidate-116-rc2-20261112-a --label baseline112-to-candidate
```

Use `snapshot --label NAME` around read-only browser passes. `rollback` restores
verified public 1.1.2 files and retains the prior installed directory in `backups`;
it never restores a database. `public115` performs a deliberate files-only setup
of the other predecessor before a real Core `update`. Run native old-version
saves between rollback and reupdate. Every label is exclusive: retry with a new
label so failed evidence remains intact.

Run native browser fixtures separately using URLs from `run.json` and credentials
from `lab/credentials.json`. Keep each browser output in a fresh evidence
directory. Test changed package bytes only after creating a new candidate/run
or an explicit frozen subsequent stage. Never replace `inputs/candidate.zip`,
`inputs/manifest.json` or `run.json` in an existing run.
Plugin Check commands must precede WP-CLI global flags, as `Lab.wp` enforces.
Ordinary Author roles receive no extra capabilities during installation.

`browser.mjs` implements native Text/Custom HTML preview checks, Post Editor
insertion/settings/save/reopen for Admin/Author, and Site Editor
insertion/settings/save/confirmation/reopen. Select `--mode legacy-preview`,
`post-editor`, or `site-editor`; use `--engine chrome`, `firefox`, or `webkit`
for the required compatibility browsers. `chrome` explicitly launches branded
Google Chrome through Playwright `channel: "chrome"`; missing Chrome is an error,
with no Chromium fallback. Optional `--engine chromium` remains a separate engine
and does not satisfy the Google Chrome gate. All native runners record the engine,
channel, actual browser version, platform and architecture. An arbitrary remote
browser endpoint cannot prove a Chrome channel, so `browser.mjs` rejects the
combination `--engine chrome --browser-endpoint ...`.
Post Editor inserts two clocks and completes two visible saves and reopens.
Optional `--lifecycle` adds native removal, observed Core Undo levels and reinsertion.
`--legacy-editor` uses a real guarded metabox: minimum Core supports a parent
realm, while the pinned current Core keeps its iframe. Neither flag changes
the clock block API version. Dashboard and editor remain in separate monitored
tabs to retain Core Dashboard Events requests during navigation.
`--site` and `--role` select an explicitly recorded targeted retry. The Site
Editor checks the saved home template in a separate frontend tab while keeping
the editor open; Core background polling is not a load-idle requirement.
Every pass captures installed file hashes, actual asset response hashes, each
clock document, errors, screenshots and the exact browser harness source.

`corpus-editor.mjs --mode seed` requires installed public 1.1.2 and creates a
corpus using its actual block serializer and native REST endpoints. Subsequent
`read` and `save` modes compare old settings and foreign blocks; save performs
two visible native saves. `--ui-dir evidence/FOLDER` adds successful new-post
controls from a native browser report. `--group slashes` selects saved backslash
content; this healthy corpus is not the separate single-terminal-backslash writer
negative control. `browser.mjs --terminal-control` creates that explicit native
input. `--exclude-group slashes` is an explicit corpus exclusion and must be disclosed.

The complete placement fixture uses `integration-mu.php`, `seed-integration.php`,
`frontend.mjs`, `widgets-ui.mjs` and `theme.php`. Copy the integration MU file
only into the owned site's `mu-plugins` directory. Seed integration once after
the public corpus, then switch `theme.php classic|block` outside invariant
brackets. It preserves the canonical three block widgets plus Text/HTML widgets.
The smaller preview fixtures below are for focused development runs. Do not use
their `reuse` action to replace the complete canonical widget placement.

`frontend.mjs --theme classic|block` checks native placements, attributes,
visible output, asset request counts and hashes. Non-HTML cases parse their
actual JSON/XML bodies and scan both raw and decoded markup for leakage. Their
fixture calls the plugin footer callback only; invoking a theme's complete
`wp_footer` in a synthetic JSON response would make that response invalid for
reasons unrelated to the plugin. `--only-mime` selects those cases explicitly. `--live-tick` separately checks
the normal post on both sites with the real clock, requiring visible time text
to change; it does not install the Date override used for layout parity.
Use `--cases admin-normal,custom-html-page,widgets,native-pattern,native-template-part,late,capture-dependencies,empty`
for an explicitly scoped placement pass. Unknown, empty and duplicate names are
rejected, as are combinations with `--only-mime` or `--live-tick`. The unfiltered
HTML/non-HTML corpus and the selected names remain in `CASE-INVENTORY.json` and
the result metadata; omitted cases are not reported as executed.
`widgets-ui.mjs` changes and restores a canonical widget caption, waits for the
visible Update and native REST persistence, and then reloads it.

Install `fixtures-mu.php` only into the owned lab's `mu-plugins` directory, then
run `seed-preview.php` with WP-CLI to prepare legacy fixtures. A later `reuse`
argument activates their classic-theme placement without replacing the saved
widget instances. `seed-site-editor.php` switches to bundled Twenty Twenty-Three
for the native Site Editor pass. These setup mutations belong outside read-only
data-invariant brackets. The runner copies Twenty Twenty-One from the verified
minimum Core archive when the current archive does not include a classic theme.

```sh
set -euo pipefail
node tools/wordpress-lab/candidate/browser.mjs \
  --run-dir .local/candidate-116-rc2-20261112-a \
  --label candidate-native-site --engine chromium --mode site-editor
```

`linux-browser.mjs` runs the same browser entry point inside an ephemeral
Playwright container attached to the owned Compose network. It forwards each
configured loopback origin to the matching lab service so cookies, REST URLs and
iframes remain native. Mount the repository read-only and the new run directory
writable at their original absolute paths; never mount the sealed RC1 run
writable. Record the actual container image/browser versions with its receipt.
Use `--entry corpus-editor`, `frontend`, or `widgets-ui` to run those methods;
the default entry point is `browser.mjs`. Serialize writers that share posts or
templates. Read-only browser engines may run concurrently inside one snapshot
bracket. Core transient changes must be listed, not silently dropped from an
all-options invariant.

## Exact installed runtime compatibility

Install `runtime-fixture.php` as an MU fixture only in a new owned lab, after its
candidate ZIP and frozen manifest have been verified. `runtime-compatibility.mjs`
checks the complete installed plugin map before and after execution and the
browser-captured runtime and bootstrap SHA-256 against that manifest.

The seven scenarios per Core version cover an owned block, healthy raw HTML,
invalid first/middle hosts, an all-invalid initial batch followed by a healthy
host, an empty page's first dynamic insertion, and a dynamic mixed batch with
an invalid first host. Invalid hosts retain distinct observable original errors;
healthy neighbors and a later host must render with expected settings and tick.
Renderer readiness must resolve once, the default loader must finish ready,
and individual configuration errors must not become global load failures. The
initial empty document must request no main runtime. These are real installed
WordPress routes using Core `wp_head()`/`wp_footer()`, not mocked asset queues.

```sh
set -euo pipefail
node tools/wordpress-lab/candidate/runtime-compatibility.mjs \
  --run-dir .local/candidate-116-rc4-20261112-a \
  --label rc4-runtime --engine chrome
```

Use `linux-browser.mjs --entry runtime-compatibility` for the same runner inside
the owned Compose network. The proxy passes the explicit engine unchanged. A
stock Playwright image contains Chromium, not necessarily branded Google Chrome;
use verified native Chrome when available instead of relabeling that image's
Chromium. Record the container image and architecture for Linux Firefox/WebKit.
The normal frontend and Post/Site/legacy-preview runners remain required in
addition to these fault-isolation scenarios. Browser launch preflight on
`about:blank` establishes availability only; it is not artifact acceptance.

## Subsequent frozen candidate stage

When a reviewed candidate changes during a long acceptance run, a stage retains
the prior inputs and results and freezes a new ZIP, manifest and updater under
`stages/LABEL`. The real Core updater then installs that exact artifact on both
sites. Full before/after snapshots must retain all eight content tables, stable
options and active state. This also supports explicit same-version RC updates.
Use a fresh label even for a failed attempt. Existing results remain attributed
to their original artifact; inheritance requires a documented file delta.

```sh
set -euo pipefail
python3 tools/wordpress-lab/candidate/run.py stage \
  --run-dir .local/candidate-116-rc2-20261112-a --label rc3-exact \
  --zip .local/packages/simple-digital-clock-1.1.6-rc3.zip \
  --manifest docs/releases/1.1.6/manifest-rc3.json \
  --sha256 REPLACE_WITH_THE_REVIEWED_64_CHARACTER_SHA256
node tools/wordpress-lab/candidate/browser.mjs \
  --run-dir .local/candidate-116-rc2-20261112-a --stage rc3-exact \
  --label rc3-native-post --engine chromium --mode post-editor
```

The browser's `--stage` validates the frozen inputs and installed full file map,
and records both the initial and current artifact SHA. The default `update`
operation continues to mean the original frozen candidate, so use it only when
that is the intended target.

```sh
set -euo pipefail
python3 tools/wordpress-lab/candidate/run.py stop \
  --run-dir .local/candidate-116-rc2-20261112-a --label final
```

Stop verifies Compose project labels, stops only that project's services and
checks for running survivors. Containers, volumes, inputs, database and evidence
are retained. There is no prune, remove-volume, publication or deployment action.

## RC1 harness reuse map

The sealed local RC1 run contains corrected methods, not reusable results:

| Method                                                                | Matrix coverage to rerun against exact candidate                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `lab/native-insert.mjs`, `lab/native-editor.mjs`                      | Post insertion/settings/save/reopen, public-version corpus, roles and engines |
| `lab/native-front.mjs`, `lab/fixture.php`, `lab/seed-integration.php` | Native placements, frontend oracle, response MIME and data checks             |
| `lab/canonical-widgets.php`, `lab/widgets-ui.mjs`                     | Canonical one-block widgets and actual completed native Update                |
| `loader-audit-widgets/legacy-preview.mjs`                             | Text/Custom HTML isolated preview documents, both sites and three engines     |
| `loader-audit/browser-matrix.mjs`, `loader-audit/native-read.mjs`     | CSP, runtime ownership, original hidden-integration counterexamples           |
| `package-audit/cache-lab`                                             | Real optimizer/cache HIT, stale negative control and explicit purge           |
| `repo-checks/multisite`                                               | Two-site network activation, roles and files-only transitions                 |

Copy and parameterize reviewed methods into a fresh run before execution. They
contain historical hardcoded ports/paths/hashes and must not be launched blindly.
The full native Site Editor workflow and new negative controls need separate
coverage; a template rendering fixture is not a Site Editor UI acceptance test.
