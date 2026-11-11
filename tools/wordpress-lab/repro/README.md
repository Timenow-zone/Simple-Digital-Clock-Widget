# Reproducible local release lab

This is a fresh, disposable bootstrap for the frozen WordPress **1.1.4** candidate.
It needs no historical worktree, database, container, generated account or private
orchestration script. The exact manifest-bound ZIP is an explicit release input, not a newly
repacked substitute. Nothing is pushed, deployed or published by these commands.

## Inputs and setup

Use Python 3.9+, Docker with Compose v2, Node 22.12+ (Node 24 recommended), and the
repository's locked npm installation. Provide the current exact ZIP identified by
the [release report](../../../docs/releases/1.1.4/README.md) and `manifest.json`.
The verifier also checks every source/ZIP file hash against that tracked manifest.
Historical r2/r8/r9 archives and their independent acceptance remain separate. The current rest-r14 ZIP has 16 files and its own release status; the [r9 verdict](../../../docs/releases/1.1.4/INDEPENDENT-ACCEPTANCE-RENDER-R9-2026-11-06.md) does not transfer. Generated candidates remain local. The exact public 1.1.2 and accepted r8 ZIPs are tracked only as frozen rollback-test fixtures. PR #18 and its hosted checks cover the prior committed r9 source, not these local changes. A successful bootstrap is local evidence, not publication.

`lock.json` pins official download URLs, byte counts and SHA-256 values for Core
6.3.14/7.1.4, public predecessor 1.1.2, Plugin Check 2.1.0 and WP-CLI. Docker bases
are pinned by digest. Minimum PHP 7.0.33 builds `mysqli` from its bundled source;
the other reference uses PHP 8.3. These are the frozen acceptance references, not
a promise that the pinned current-Core reference is the newest available release.
Runtime versions and command output are recorded for every new run. On hosts with
a different CPU, Docker must support the pinned image's architecture/emulation.

From the repository root:

```sh
set -euo pipefail
npm ci
npx --no-install playwright install chromium webkit
python3 tools/wordpress-lab/repro/run.py run \
  --id release-114-check-01 \
  --candidate .local/packages/simple-digital-clock-1.1.4-rest-r14-candidate.zip
```

For offline reuse, add `--cache /absolute/path/to/downloads`. All five expected
files must retain the names in `lock.json`; existing cached files are verified
before execution. Missing files are fetched from their pinned official URL. There
is no automatic switch to another version or acceptance of a checksum mismatch.
Network access is needed for missing downloads/images and initial npm/browser
setup. Site containers use a dedicated bridge and block external WordPress HTTP
requests with `WP_HTTP_BLOCK_EXTERNAL`. This is an application-level restriction,
not an outbound firewall for arbitrary container processes. External browser
requests are deliberately blocked. Docker 29 does not publish host ports for
containers attached exclusively to an internal-only network; the runner uses a
normal dedicated bridge and verifies both loopback ports before installing Core.

## What runs

1. Refuse an existing run ID, verify the exact candidate and all pinned inputs,
   generate new credentials, and create independent minimum/current databases.
2. Select an explicit subnet that does not overlap existing Docker networks,
   start only the new Compose project, verify ports bound to `127.0.0.1`, install Core,
   activate the exact public 1.1.2 ZIP and seed post/widget/unknown-metadata fixtures.
3. Sequentially execute a private local Core `Plugin_Upgrader::bulk_upgrade` offer,
   a physical plugin-file rollback and a Core reupdate on both sites. Every step
   checks all installed plugin hashes, activation, version and unchanged whole-post
   and selected-option hashes. No database restoration masks a failed transition.
4. Run candidate-only Editor/Author save-filter probes. The old 1.1.2 writer is
   never used to save on Core 6.3 after rollback. These direct Core API probes do
   not certify REST authorization or actual Gutenberg UI saves.
5. Install pinned Plugin Check on PHP 8.3; inspect its JSON severities in addition
   to the CLI exit status. Plugin Check 2.1.0 itself requires PHP 7.4+, so it is
   explicitly not credited on PHP 7.0.33. Preserve warnings and raw output. Chromium/WebKit each check
   the installed frontend, ticking clock, current asset reference and page errors.
6. Stop only this new project, even on a runtime failure. Preserve every database,
   rollback directory, download, command result and attempt. Never delete volumes.

## Evidence and recovery

Progress prints steps, percentage, elapsed time, rate and estimated time remaining.
The final line reports pass/fail, transition count and the evidence directory:

```text
.local/wordpress-repro/<id>/
  summary.json
  input-identity.json
  lock.json
  sites.json
  browser-smoke.json
  <site>-<phase>-before.json
  <site>-<phase>-after.json
  <site>-plugin-check.json
  logs/
  harness/
  downloads/
  backups/
  lab/
```

Logs and snapshots may contain private fixture data. The generated directory is
ignored, has restricted host permissions and must not be committed. Credentials
are generated in a separate mode-0600 file and are never command-line arguments.
`compose.json` and `wp-config.php` necessarily contain the disposable DB password.

Inspect or stop the owned project after an interrupted terminal:

```sh
set -euo pipefail
python3 tools/wordpress-lab/repro/run.py status --id release-114-check-01
python3 tools/wordpress-lab/repro/run.py stop --id release-114-check-01
```

After a failed run, inspect its logs and use a new ID. The runner refuses to
overwrite evidence or reinstall an existing database. Old Clock labs and foreign
projects are never started, pruned, restored or stopped. File rollback is limited
to the newly generated site's plugin directory; its candidate files are retained
under `backups/`. Source changes can be reverted independently; runtime artifacts
and accepted plugin package files are not edited by this tooling.

## Scope limits

This bounded fresh bootstrap closes the missing tracked orchestration for the
minimum/current upgrade/rollback cycle. It does not recreate the entire historical
ten-context, native LocalWP, cache/optimizer, browser-editor or negative-recovery
matrix. Existing acceptance evidence and predecessor data-loss limits remain
unchanged. The full historical scripts/databases remain in the preserved local
archives; their results are not silently re-attributed to this smaller run.

Neither a private local offer nor these frontend probes prove WordPress.org
delivery. After explicit publication authorization, verify the public catalogue,
ZIP contents, genuine 1.1.2-to-1.1.4 Core update offer, installed canary and normal
public Preview separately. TLS/multisite/native Safari/VoiceOver and successful
external Google stylesheet transport are outside this bootstrap's scope.
