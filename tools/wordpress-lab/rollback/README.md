# Editable rollback compatibility lab

This workflow prepares a separately versioned **1.1.2.1** local rollback package.
It preserves the published 1.1.2 ZIP, the accepted 1.1.4 r8 ZIP and both bundled
runtime files. Nothing here pushes, merges, deploys or publishes a release.

## Purpose and contract

Public 1.1.2 can damage clock metadata when its writer runs on WordPress 6.3
with a caption ending in a backslash. An upgrade can protect future writes, but
replacing its files with the original 1.1.2 also removes that protection.
Use the separately identified 1.1.2.1 package for an **editable** rollback.
It is not the original 1.1.2 and does not repair values already erased by it.

The builder starts with the actual public 1.1.2 archive and backports the accepted
r8 block reader, scoped PHP save protection, conditional asset delivery, output
observer and the paired admin-notice integration. Block JSON attributes and save
HTML retain their schema; no database migration, activation rewrite or persistent
compatibility module is introduced. Native Core sanitization remains active.

The legacy widget **0.7.0** is byte-identical to the original archive and
`dist/0.7.0.min.js`. Therefore this rollback retains its older visual, resizing
and internationalization behavior; it does not acquire the runtime fixes in
widget 0.8.1. Third-party notices identify the versions in release `f868574`:
Preact 10.29.8, preact-custom-element 4.6.0 and clsx 2.1.1.

On supported HTML pages, frontend resources are emitted only for a live clock
in delivered output, with one runtime and one inline host-layout rule per
document. The block editor loads preview resources before insertion. The
[streaming HTML contract](../../../docs/WORDPRESS-ASSET-CONTRACT.md), including
its explicit parsing/integration limits, also applies to this wrapper.

## Build and run

Requirements are those of the [pinned local lab](../repro/README.md): Python 3.9+,
Docker Compose, Node and Playwright with Chromium. Both immutable ZIP inputs must
be available locally; the builder verifies their exact hashes and refuses an
existing output directory. The test runner also refuses existing run IDs.

```sh
set -euo pipefail
python3 tools/wordpress-lab/rollback/build.py \
  --predecessor .local/wordpress-repro/final-output-r6-20261101-a/downloads/predecessor.zip \
  --accepted .local/packages/simple-digital-clock-1.1.4-streaming-r8-candidate.zip \
  --output .local/rollback-1121-check/package

python3 tools/wordpress-lab/rollback/run.py \
  --id rollback-1121-check \
  --accepted .local/packages/simple-digital-clock-1.1.4-streaming-r8-candidate.zip \
  --rollback .local/rollback-1121-check/package/simple-digital-clock-1.1.2.1-rollback-r2.zip \
  --cache .local/wordpress-repro/final-output-r6-20261101-a/downloads
```

Change example output paths and run IDs for every new execution. The cache
contains the five hash-pinned inputs listed in `repro/lock.json`; missing inputs
are downloaded from their pinned official URLs. No version substitution occurs.

The runner creates new minimum/current databases, installs actual public 1.1.2,
and records safe native baseline saves plus separate old-writer negative controls.
It then performs a private Core update to r8, a physical file rollback to 1.1.2.1
and a private Core reupdate to r8. Full post rows and eight critical options are
compared immediately around every file transition. No database restore or reset
masks a failed comparison.

Chromium runs native Gutenberg saves for Administrator, Editor and Author on
both references. The hard-caption corpus is created under r8, then retained
through rollback and reupdate. Every phase checks title-only saves, real width
edits, repeated native serialization, exact literal captions, nondefault settings,
className/lock and reopening valid blocks. Malformed original-version controls
remain separate; they are never converted into candidate PASS observations.

## Evidence and limits

The build directory holds the deterministic ZIP and a complete file manifest,
including every difference from public 1.1.2. The builder rejects disagreement
between the plugin header, stable tag, POT project version, source comments,
cache versions, runtime source version, minimum requirements and local changelog.
Revision 1 was rejected for its stale POT version; revision 2 updates only that
header and the readme changelog, retaining every executable byte. Its exact ZIP
requires its own complete verification. Test evidence lives under
`.local/wordpress-repro/<id>/`: exact inputs, installed hashes, whole-row snapshots,
browser inputs/results, logs, backups and `rollback-summary.json`. Credentials
remain private mode-0600 files and must not be committed.

Only the newly created project is stopped, including after a failed check.
Databases, failed attempts and pre-rollback plugin files are retained. The normal
owner preview is never modified. To stop an interrupted owned test:

```sh
python3 tools/wordpress-lab/repro/run.py stop --id rollback-1121-check
```

This tracked author runner is not an independent acceptance verdict. The separate
review must bind the exact rollback archive and unchanged r8 archive, exercise
fresh installation, editor writes across transitions, native security checks,
Plugin Check and 0/1/multiple-clock asset loading. A local private offer does not
certify WordPress.org delivery or a genuine public update offer. LocalWP, TLS,
multisite, native Safari/VoiceOver and third-party cache/optimizer integrations
remain outside the local Docker gate.

Before an operational rollback, preserve a database snapshot and the current
plugin directory. Reinstall the retained r8 archive if the rollback fails. Data
written after a database snapshot needs separate review before restoring that
snapshot; replacing plugin files alone cannot recover erased metadata.
