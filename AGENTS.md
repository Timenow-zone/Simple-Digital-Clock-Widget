# Repository language and change boundaries

- Write all repository-facing prose in English: documentation, pull request titles and descriptions, issues, reviews, comments, release notes, code comments, and new commit messages. This applies regardless of the conversation language.
- Keep pull request titles entirely in English. Put exact localized examples in code spans or fenced blocks in the description.
- Preserve exact localization values, Unicode test inputs, captured output, and historical evidence. Translate the surrounding explanation, not the recorded data.
- Do not rewrite published Git history, release tags, hashes, patches, or evidence solely to satisfy a prose-language check.
- Preserve unrelated uncommitted work in other checkouts. Keep published widget bundles and WordPress package files unchanged unless a separately authorized release requires changes.
- Use pull requests and wait for the required `Repository checks` and `Browser tests` checks. Do not bypass branch protection.

`node scripts/check-public-prose.mjs` checks tracked Markdown prose and GitHub pull request metadata for Cyrillic text, excluding inline/fenced code and technical markup. It is a bounded regression guard, not a complete Markdown parser or language classifier. Reviewers remain responsible for English prose in every public surface, complex markup, and languages the guard does not detect.
