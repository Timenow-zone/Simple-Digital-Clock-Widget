# Repository hygiene — 29 October 2026

## Source and release boundaries

PR #5 removed unused development files and duplicate npm prehooks. Unique assertions from the excluded widget test now run in the browser suite. The retired local `feature/hundredths` branch had no commits outside `main`; its tip remains available as `v0.7.0`.

The published WordPress 1.1.2 sources and the exact readme-only r3772710 snapshot are integrated separately. See the [readme provenance](../releases/1.1.2/README-PUBLICATION.md). The original release tag, manifests, evidence and versioned widget bundles retain their original bytes. Live Preview work in the original checkout is outside this change.

## Development dependencies

Four unused dependencies were removed: Parcel's Brotli/Gzip compressors, its TypeScript validator and Autoprefixer. The active configuration did not load them.

Web Test Runner and its Playwright launcher moved together to 1.0.0. The [upstream major](https://github.com/modernweb-dev/web/blob/master/packages/test-runner/CHANGELOG.md) raises the minimum Node version to 22. Its newer browser-download chain removes the unpatched `extract-zip` dependency, including [GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) and [GHSA-7pqw-9j4j-h8q3](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3). Wrangler moved to 4.155.0; compatible transitive fixes were resolved without forced downgrades or overrides.

The three production lock entries remain identical: `clsx@2.1.1`, `preact@10.29.8` and `preact-custom-element@4.6.0`. Standalone version 0.7.0, application source and published bundles remain unchanged.

All 39 originally inspected Dependabot vulnerable ranges no longer match the new lockfile. This compares the saved advisory set with resolved versions; GitHub's live alert count can change independently.

## Remaining audit finding

At verification, `npm audit` reports zero critical, high or moderate vulnerabilities and five low-severity package entries from one `deepmerge@4.3.1` toolchain finding, [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Production-only audit reports zero. No patched version is published at this snapshot.

The remaining paths are Web Test Runner's development server and Rollup's Node resolver. Their observed calls merge static defaults and trusted configuration. This repository uses `nodeResolve: true`, which supplies no external resolver options; no HTTP-content path into the affected merge was found in this configuration. This limited review does not remove the advisory or prove arbitrary configurations safe. Alerts remain visible. A patched upstream release or a deliberate tooling replacement requires a new review.

## Validation and CI policy

Local validation covers a clean `npm ci`, all three TypeScript configurations, ESLint, 22 Node tests, release metadata and versioned artifact consistency, and a real Parcel production build. The CI workflow adds the Linux browser matrix and WordPress syntax checks; the actual results are attached to the pull request and `main` checks. The release check compares the current versioned bundle with `latest.min.js`; it does not verify every historical bundle against a stored hash.

`scripts/check-build.mjs` overrides Parcel's explicit target output through its API, then runs Terser in the temporary directory. Passing only CLI `--dist-dir` would not override `targets.default.distDir`; published artifacts must never serve as scratch output.

The first Linux CI run exposed an encoder-dependent release check: the same 32649-byte bundle compressed to 11422 bytes with Node 26/zlib 1.2.12 and 11469 bytes with Node 24/zlib Motley. README now records the measurement's encoder and the exact artifact SHA. Validation checks artifact identity and recorded metadata consistently across encoders, while printing the current gzip measurement separately. Explicit `release:sync` remeasures and records the current encoder; the recorded Node version does not identify the original release's build environment. Twelve CLI regression tests cover identity corruption, malformed measurements and explicit synchronization.

The required check names are `Repository checks` and `Browser tests`. Both run on Ubuntu 24.04 with Node 24, a read-only repository token and no deployment credentials. Audit rejects moderate-or-higher findings. Cloudflare preview success does not replace these checks. The PHP/JavaScript syntax pass does not certify the full WordPress compatibility or update/rollback matrix.

Rollback uses separate reverts for dependency and CI commits. Repository settings are reversible independently; changing them must preserve the release tags and unrelated work.
