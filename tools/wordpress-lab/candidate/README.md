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
directory. Test changed package bytes only after creating a new candidate/run.
Plugin Check commands must precede WP-CLI global flags, as `Lab.wp` enforces.
Ordinary Author roles receive no extra capabilities during installation.

`browser.mjs` implements native Text/Custom HTML preview checks, Post Editor
insertion/settings/save/reopen for Admin/Author, and Site Editor
insertion/settings/save/confirmation/reopen. Select `--mode legacy-preview`,
`post-editor`, or `site-editor`; use `--engine chromium`, `firefox`, or `webkit`.
Every pass captures installed file hashes, actual asset response hashes, each
clock document, errors, screenshots and the exact browser harness source.

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

| Method | Matrix coverage to rerun against exact candidate |
| --- | --- |
| `lab/native-insert.mjs`, `lab/native-editor.mjs` | Post insertion/settings/save/reopen, public-version corpus, roles and engines |
| `lab/native-front.mjs`, `lab/fixture.php`, `lab/seed-integration.php` | Native placements, frontend oracle, response MIME and data checks |
| `lab/canonical-widgets.php`, `lab/widgets-ui.mjs` | Canonical one-block widgets and actual completed native Update |
| `loader-audit-widgets/legacy-preview.mjs` | Text/Custom HTML isolated preview documents, both sites and three engines |
| `loader-audit/browser-matrix.mjs`, `loader-audit/native-read.mjs` | CSP, runtime ownership, original hidden-integration counterexamples |
| `package-audit/cache-lab` | Real optimizer/cache HIT, stale negative control and explicit purge |
| `repo-checks/multisite` | Two-site network activation, roles and files-only transitions |

Copy and parameterize reviewed methods into a fresh run before execution. They
contain historical hardcoded ports/paths/hashes and must not be launched blindly.
The full native Site Editor workflow and new negative controls need separate
coverage; a template rendering fixture is not a Site Editor UI acceptance test.
