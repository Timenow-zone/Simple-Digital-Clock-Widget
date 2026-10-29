# WordPress 1.1.3 candidate

Status: **prepared and verified locally; not published**. The plugin bundles widget **0.7.1**. Branch: `codex/prepare-simple-digital-clock-1.1.3`, based on `main` at `095aaded29b8`.

Follow-up: [native LocalWP upgrade acceptance](LOCALWP.md) passed both 1.1.1 and 1.1.2 upgrade paths with the same ZIP, including Gutenberg field edits, caption preservation and automatic sizing.

The candidate fixes two defects found by the independent published-1.1.2 acceptance: Author saves changed invalid numeric caption references and invalidated blocks; automatic clock sizing could retain an initial container measurement until a window resize.

## Changes

- Normalize null, surrogate and out-of-range numeric references in clock caption HTML to `&#65533;`, matching the browser's existing replacement character. Preserve original caption JSON, literal entity layers, other attributes and normal Core KSES policy. Handle padded, hexadecimal, large and semicolonless numeric forms. The parsing rule follows the [HTML numeric-reference end state](https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state).
- Observe container width changes, including initially hidden clocks. Coalesce fitting into an animation frame outside observer delivery, skip unchanged state, and release observers, resize handlers and pending frames when a clock is removed. Window resizing remains available where ResizeObserver is unavailable.
- Bundle the tested widget 0.7.1, including the responsive hundredths fitting already present in `main`. Update the script cache version. Preserve the published `dist/0.7.0.min.js` exactly.
- Update plugin headers, stable tag, POT project version and four changelog entries. Update the measured gzip label to approximately 11.5 KiB. Retain the approved published 1.1.2 README text elsewhere and its CRLF line endings.

Runtime changes are in `src/SimpleDigitalClockWidget.tsx` and `wordpress/simple-digital-clock/includes/simple-digital-clock-kses.php`. Generated widget artifacts, package versions, cache metadata and release documentation are synchronized. No dependency versions were changed. No database migration or new saved-block schema was introduced.

## Exact package

- ZIP: `.local/packages/simple-digital-clock-1.1.3-candidate.zip`.
- ZIP SHA-256: `adea5677469b98d8c94373af64202bb1dce5b91d5e340273f0f0a86a4c4b5b17`.
- Widget SHA-256: `fd2f9c721507274e29af8b5b787a2933cd377a3416257899104a04d5c372bab4`.
- Widget size: 34,013 bytes minified; 11,758 bytes gzip level 9, measured with Node 26.8.2/zlib 1.2.12.
- The [manifest](manifest.json) identifies all 15 installable files. The checked private package and final copied ZIP are byte-identical. Lab code, credentials, databases and preview assets are excluded.

Repacking changes ZIP timestamps and can change its hash; a repacked archive does not inherit this exact-package acceptance.

## Fresh upgrade matrix

| Site | WordPress | PHP | Installed predecessor | Theme |
|---|---|---|---|---|
| p70a | 6.3.2 | 7.0.33 | 1.1.1 | twentytwentyone |
| p70b | 6.3.2 | 7.0.33 | 1.1.2 | twentytwentyone |
| p82a | 6.3.2 | 8.2.12 | 1.1.1 | twentytwentyone |
| p82b | 6.3.2 | 8.2.12 | 1.1.2 | twentytwentyone |
| p83a | 7.1.3 | 8.3.35 | 1.1.1 | twentytwentyfive |
| p83b | 7.1.3 | 8.3.35 | 1.1.2 | twentytwentyfive |
| p85a | 7.1.3 | 8.5.12 | 1.1.1 | twentytwentyfive |
| p85b | 7.1.3 | 8.5.12 | 1.1.2 | twentytwentyfive |
| p74b | 6.3.2 | 7.4.33 | 1.1.2 | twentytwentyone |

Browsers: Chromium 151.0.7922.34, Firefox 153.0, WebKit 26.5. All sites used a new private Docker project, loopback-only web ports, isolated databases and fresh test accounts. The existing checkout, Preview work and user websites were not modified.

Official 1.1.1 and 1.1.2 ZIPs were checked against their pinned public manifests. Their actual Gutenberg serializers created 1,423 cases per role on every site: all 429 bundled timezone choices, 113 bundled locale choices plus seven BCP-47 variants, 359 gradient entries, 25 font choices, all 32 boolean combinations, boundary sizes, special captions and 256 deterministic mixed cases. There were 79 base records/patterns, two block widgets and one unrelated text widget per site, containing 4,897 native block occurrences with repetitions and additional fixtures.

Each site was updated with the real Core `admin-ajax.php?action=update-plugin` path. The unpublished package was supplied through a **private local update offer**, not WordPress.org. A source guard verified all package hashes before replacement. All nine upgrades preserved complete post-row hashes and checked settings. No user site was updated.

## Acceptance results

| Check | Result |
|---|---:|
| Actual predecessor-to-candidate Core upgrades | 9/9 |
| Browser/site resave combinations, all three post roles | 27/27 |
| Native block checks in each complete parser/resave matrix | 132,219 passed |
| Visible Gutenberg Save/Update actions, with rendered editor previews | 162/162 |
| Initial layout samples, stable across repeated visits and unchanged by a manual resize | 162/162 |
| PHP invalid-reference, title-only, repeat-save, widget and safety assertions | 8,784 passed |
| HTML5/literal-numeric browser DOM comparisons on PHP 7.0 and 8.5 | 109,104 passed |
| Anonymous frontend caption comparisons after Author UI saves | 972/972 |
| Final frontend page visits | 1,944 |
| Final clock render observations | 121,014 |
| Published 1.1.1/1.1.2 reader checks after candidate saves | 29,382 passed |

The same seeded IDs were reused throughout the upgrade and browser resaves. The save matrix serialized writes to each site's database; independent sites ran in parallel. No fixture or database restore was used between these saves. Posts, nested Group/Columns, a synced pattern, Custom HTML, active/inactive block widgets and an unrelated Text widget retained their checked semantics. Posts were saved as Administrator, Editor and Author; widget coverage used Administrator REST saves and a separate filtered-widget callback regression.

The initial-sizing regression was red on the original source and green after the fix. The 75-case PHP regression failed on published 1.1.2 across all five PHP configurations, then passed on the actual installed candidate at every site. All six original failing native captions and their mixed-case repetitions now remain valid after Author saves.

Geometry intentionally changes for auto-width clocks and hundredths fitting. Frontend comparisons require identical clock attributes, text and checked styles; other dimensions use a 0.001 CSS px tolerance. Height changes are recorded only for those intended sizing cases at the same width, and initial sizing is independently checked without requiring a resize event. Widths 390/768/1440, UTC/Tokyo/New York browser timezones, representative DST/year/leap-day boundaries and live ticking were covered.

Two sites were rolled back by replacing only plugin files: one to exact 1.1.1 and one to exact 1.1.2. All three browsers read their already-resaved content without new invalid blocks. Post hashes and checked settings stayed unchanged. Both sites then passed another real Core update to the same candidate. Reading after rollback is covered; editing with 1.1.1 reintroduces its known old defects.

## Local repository and package checks

- All three TypeScript configurations, ESLint, 22 Node tests and 24 release-metadata/public-prose tests passed.
- The full widget browser suite passed 35 tests in each engine, including responsive hundredths fitting, container changes, visibility and teardown.
- Release metadata/versioned artifact checks and an independent temporary production build passed. PHP syntax passed on PHP 7.0/8.5, and all plugin JavaScript passed syntax checks.
- Official Plugin Check 2.1.0 ran 29 static and five runtime checks: **0 errors, seven warnings**. Warning file/code/message tuples match 1.1.2; the retained guarded logging/backtrace behavior was not refactored. The checker, its cache drop-in and temporary tables were removed; post hashes and checked settings were restored exactly.
- `npm audit --audit-level=moderate` passed: five low affected packages in existing test tooling, with zero moderate/high/critical findings. Package versions in the dependency graph were unchanged.
- Repository prose and whitespace checks passed, including 32 tracked Markdown files; CRLF is treated as an intentional line ending for the WordPress readme. Required GitHub PR checks remain a merge gate; this local preparation does not create a PR, push, tag or publication.

All eleven project containers are stopped, the temporary Firefox container is removed, and the databases and evidence are retained. See [teardown evidence](teardown-evidence.json).

Raw evidence and orchestration remain under `.local/release-1.1.3/lab/`. The [acceptance summary](acceptance-evidence.json) is credential-free. Tracked regressions are `tests/container-resize.browser.spec.ts`, `tools/wordpress-lab/invalid-numeric-caption.php` and the six exact native fixtures in `tools/wordpress-lab/fixtures/invalid-numeric-native.json`.

## Scope and rollback

This matrix covers Docker single-site WordPress 6.3.2/7.1.3 and the listed PHP/browser versions. Native LocalWP is covered separately in the [follow-up acceptance](LOCALWP.md). Multisite, native HTTPS and external Google Fonts delivery remain outside this 1.1.3 cycle. Font selections and local fallback rendering were checked. The corpus is exhaustive for the listed selector values and booleans, not all Cartesian combinations or arbitrary malformed strings.

Previously damaged post content is not automatically rewritten. The fix preserves old valid content during future saves; no recovery migration was added. Legacy API/HTML attribute behavior and normal KSES restrictions remain in place.

Two login-setup actions timed out before completing navigation. Their evidence was retained; remaining cases completed using ordinary WordPress form POST authentication with the same role accounts and cookie sessions. Gutenberg saves still used visible buttons. The first checker invocation used a global flag before its positional command, which Plugin Check does not recognize; the corrected invocation proved both check types and completed successfully. A 1.1.2 synced-pattern seed differs from its raw serializer bytes because the existing server synchronizes timezone metadata; parser/DOM semantics and actual upgrade-row hashes were checked independently.

Local rollback of the candidate means installing a retained predecessor ZIP; it restores that version's behavior and limitations. Published bundles, tags and historical evidence were preserved. Publication requires a separate explicit request and fresh remote state verification.
