# Repository language and change boundaries

- Write all repository-facing prose in English: documentation, pull request titles and descriptions, issues, reviews, comments, release notes, code comments, and new commit messages. This applies regardless of the conversation language.
- Keep pull request titles entirely in English. Put exact localized examples in code spans or fenced blocks in the description.
- Preserve exact localization values, Unicode test inputs, captured output, and historical evidence. Translate the surrounding explanation, not the recorded data.
- Do not rewrite published Git history, release tags, hashes, patches, or evidence solely to satisfy a prose-language check.
- Preserve unrelated uncommitted work in other checkouts. Keep published widget bundles and WordPress package files unchanged unless a separately authorized release requires changes.
- Use pull requests and wait for the required `Repository checks` and `Browser tests` checks. Do not bypass branch protection.

`node scripts/check-public-prose.mjs` checks tracked Markdown prose and GitHub pull request metadata for Cyrillic text, excluding inline/fenced code and technical markup. It is a bounded regression guard, not a complete Markdown parser or language classifier. Reviewers remain responsible for English prose in every public surface, complex markup, and languages the guard does not detect.

# Shared widget build and CDN delivery contract

- Changes to the shared widget runtime, styles, or bundled dependencies require a production build and delivery of that exact artifact to the production CDN. A WordPress-only package update does not complete a shared widget release.
- Build with `npm run build`, run `npm run release:check`, `npm run release:verify`, and the relevant regression tests, then generate the Cloudflare assets with `npm run site:build`. The CDN asset must match `dist/<version>.min.js` byte-for-byte.
- Use a new widget version when changing already published bytes. Preserve published versioned files and URLs; do not overwrite immutable assets. Widget and WordPress plugin versions remain independent.
- After the release is authorized and required PR checks pass, deliver the generated assets through the configured Cloudflare deployment workflow. Verify the public production JavaScript URL returns HTTP 200, its SHA-256 matches the accepted artifact, and `/version.json`, asset references, and cache headers match the release. Smoke-test a clock using the public asset.
- Record the source commit, widget version, production asset URL, SHA-256, deployment reference, and verification results in the release evidence. A local build, CI success, or branch preview alone does not confirm production CDN delivery.
- If publication is explicitly deferred or cannot be verified, prepare and test the artifact, report CDN delivery as pending, and keep the release incomplete. This contract does not override a user instruction to avoid publication or authorize merging or publishing to WordPress.org.
- Preserve the previous artifact and deployment reference before deployment. Roll back to that deployment or asset reference if verification fails, without replacing published immutable bytes.
