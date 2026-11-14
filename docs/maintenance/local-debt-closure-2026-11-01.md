# Local release preparation follow-up — 1 November 2026

> Historical tooling/lab follow-up. Later [WordPress asset-contract changes](../releases/1.1.4/README.md) introduce new plugin/package bytes and supersede the source-candidate status below. The original accepted archive remains preserved unchanged.

These changes are local and unpublished. No push, pull request, merge, Cloudflare
deployment, WordPress.org/SVN publication, npm publication or owner-site update is
part of this follow-up. WordPress source remains **1.1.4**, widget **0.8.1**; the
accepted 16-file ZIP remains `d112348051f6930a6269d027502b3cdd92cd2bd9677ee93cef0d279e7922663f`.

## Development dependency mitigation

The registry's latest `deepmerge` is still **4.3.1** and
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) lists no
patched release. It is reachable only through development server/Node resolution
tools, not the three production dependencies or the shipped widget.

The exact transitive version is pinned in `overrides`. The existing fail-closed
`patch-package --error-on-fail` installation applies
`patches/deepmerge+4.3.1.patch` to both CommonJS and UMD distribution entry points.
Both source and target copy paths reject `__proto__` independently of target
shape. Other keys retain upstream behavior; the patch does not replace the API or
change dependency identity to suppress audit output. It does not sanitize caller
objects deliberately retained by `clone: false` or a custom merge callback.

`tests/deepmerge-security.test.mjs` reproduces poisoning with null-prototype,
null/primitive and own-`__proto__` targets, nested clone paths and reverse target
copy. The unpatched distribution fails the prototype checks; the patched code
passes. Compatibility controls cover arrays, nested defaults, symbols, Dates,
immutability, `clone: false`, custom array/field merging and `merge.all`. The test
also confirms both actual consumers resolve the patched CommonJS installation.
CI runs these checks alongside the existing lint/minimatch/glob regressions.

The registry audit remains **five low package records from this one advisory**.
The behavior is locally mitigated, but this is not an upstream advisory closure
or a zero-finding audit. Moderate/high/critical policy remains unchanged;
production audit remains separate. Remove the pin/patch only after a real patched
upstream release or a separately reviewed migration passes the same controls.
Rollback: revert the new pin, patch and tests together, then `npm ci`; doing so
restores the known vulnerable development behavior and must be explicit.

## Fresh WordPress orchestration

The [tracked local bootstrap](../../tools/wordpress-lab/repro/README.md) replaces
historical absolute paths and private orchestration inputs for a bounded fresh
minimum/current upgrade/rollback cycle. It pins Core/Plugin Check/WP-CLI download
hashes and Docker digests, generates new accounts/databases, verifies the exact
release ZIP, retains snapshots and stops only its own isolated project.

Safety controls reject reused run IDs, archive traversal/symlinks, replacement of
existing extracted files, download checksum mismatches and overlapping networks.
The runner never deletes existing labs/networks/volumes. A physical rollback
renames only its newly created plugin directory into a retained backup. The old
writer is not used to save Core 6.3 content after rollback.

Plugin Check 2.1.0 requires PHP 7.4+, so its run is explicitly confined to the
supported PHP 8.3 reference; real minimum PHP 7.0.33 compatibility is a separate
upgrade/reupdate and save-filter check. The new bootstrap does not claim to rerun
the entire historical LocalWP/ten-context/editor/cache/optimizer acceptance.

The checker requires `plugin check` before global WP-CLI flags to detect a runtime
request. A focused regression preserves that order. Strict JSON output, early
`cli.php` bootstrap and an observer of the actual 29-static/5-runtime selection
prevent an exit-zero static-only run from masquerading as runtime acceptance.

Docker 29 accepted loopback bindings on an internal-only network but exposed no
host ports (`NetworkSettings.Ports` was empty while Apache listened on port 80).
This matches the [Moby explanation of default-gateway port publishing](https://github.com/moby/moby/discussions/53256).
The lab therefore uses one dedicated normal bridge, verifies host-port readiness,
and retains `WP_HTTP_BLOCK_EXTERNAL` plus same-origin-only browser routing. This
blocks WordPress HTTP requests, not arbitrary container outbound processes; it is
not described as a container firewall.

## CodePen verification

The existing public Pen opens in an ordinary browser and its **11/11 clocks
tick**. Its iframe loads the historical `v0.7.0/dist/0.7.0.min.js` from jsDelivr.
The previous direct HTTP 403 was not proof of a broken example. README now labels
it as historical **0.7.0** and directs current installation/embed usage to the
maintained production demo. No Pen was edited or published. Third-party editor,
advertising and Cloudflare diagnostics are not widget acceptance results.

## Local verification

The successful fresh run is `.local/wordpress-repro/debt-20261101-h/summary.json`:

- Core **6.3.14 / PHP 7.0.33** and **7.1.4 / PHP 8.3.35** each pass update,
  physical rollback and Core reupdate: **6/6 transitions**, with every installed
  plugin file, activation flag, whole-post hash and selected-option hash checked.
- Candidate save-filter probes pass for Editor/Author on both references.
- Plugin Check 2.1.0 selects **29 static + 5 runtime** checks on PHP 8.3:
  **0 errors, 10 warnings**, identical in file/line/type/code/message to the frozen
  independent acceptance. No checker result is credited on unsupported PHP 7.0.
- Installed frontend smoke passes **4/4** across Chromium/WebKit and both sites;
  the fixture explicitly enables seconds so a tick is visible without waiting
  for a minute boundary. The runner verifies no owned container remains running.
- **52** focused Node checks, **22** Node unit tests and **8** Python lab safety
  tests pass; typecheck, lint, release metadata/immutable-artifact checks and
  coverage pass. A temporary production build exactly reproduces `0.8.1.min.js`.
- An isolated Linux validation passes **37 browser tests per engine** in
  Chromium/Firefox/WebKit, **3** iframe checks, **10** font checks and the **5**
  deepmerge security/API/consumer checks. It installs only public npm manifests
  with lifecycle scripts disabled, then applies patches and runs the allowlisted
  code/fixtures with external networking disabled. No `.git`, private `.local`
  data or credentials are mounted. The broader-checkout container attempt was
  rejected by automatic approval review and was not executed.

The first full official downloads were verified online in attempt `d`; the final
run re-verifies those bytes from its explicit cache. Attempts `a` through `g`
remain separate, including bootstrap mistakes, unsupported checker PHP, argument
order/JSON issues, Docker port behavior and a minute-only smoke fixture. They
are retained as failed harness attempts, not presented as plugin regressions or
erased from the evidence. Successful run `h` uses no old databases/accounts.

No full GitHub CI run is claimed for these unpushed local changes. After a later
authorized push, both required PR checks must pass on that exact head before any
merge. The accepted plugin ZIP and all shared widget/source/plugin bytes remain
unchanged; local dependency mitigation does not create a new runtime release.

## Publication boundary

Before a later explicit release instruction, keep all changes local. Public
catalogue/ZIP verification, a genuine public Core 1.1.2-to-1.1.4 update offer, an
installed canary and ordinary WordPress.org Preview acceptance remain future
publication gates. TLS/multisite/native Safari/VoiceOver/external Google transport
and the inherited old-writer/erased-data limitations are not closed by this work.
