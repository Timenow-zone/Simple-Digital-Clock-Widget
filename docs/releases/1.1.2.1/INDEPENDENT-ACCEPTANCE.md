# Independent local acceptance: editable rollback 1.1.2.1 r2

**Verdict: GO for this exact local archive only.** All 11 mandatory gates PASS; no mandatory failure or waiver. Six additional scope groups remain explicitly NOT RUN. This verdict does not authorize merge, publication, deployment, or installation on an owner site.

## Exact artifact and recipe

- Archive: `.local/rollback-1121-20261103/package-r2/simple-digital-clock-1.1.2.1-rollback-r2.zip`
- SHA-256: `75ab417c6a641a2ec94a624be54e1760db8b14007ac8919f2814cad62f54c75b`
- Size/count: **68,245 bytes; 17 regular files**.
- Manifest SHA-256: `a84448dd57fd2e4151499178f745a9ddc9b946f67447efb52da43e7cda539290`.
- Builder SHA-256: `64620ecb2deb286fd6eafb8926d3a3c81f79b7fa01370af7c3c2bf9d9143f9c5`.
- Git base: `f75c98776b6b1860e916123915bed8084c879153`; the release recipe is uncommitted. The exact public predecessor archive, accepted r8 archive, frozen builder and resulting manifest identify the reviewed tree, rather than a claim that Git HEAD contains it.
- Actual public 1.1.2 input SHA: `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`.
- Unchanged accepted r8 input SHA: `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37`.

The original, reviewer copy and independent deterministic rebuild match the exact r2 SHA. All 17 manifest entries match sizes and bytes; ZIP CRC, unique relative paths, regular-file types and plugin-root allowlist pass. Header, stable tag and POT project version are 1.1.2.1; required minima remain WordPress 6.3/PHP 7.0. The local changelog identifies the separate editable rollback build.

The backport keeps the actual 0.7.0 runtime, byte-identical to public 1.1.2 and `dist/0.7.0.min.js`: 32,649 bytes, SHA `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`. The paired reader/KSES/writer fix and streaming delivery are derived from r8. KSES and the output observer are byte-identical to r8; `block.js` differs only in its source version comment. The recipe does not install a persistent module or migrate the database. An incidental initial exact-byte comparison of `block.js` failed on that intended comment; the corrected comparison explicitly verifies that sole difference, without changing the candidate.

Bundled license bodies were independently checked against official npm tarballs for preact 10.29.8, preact-custom-element 4.6.0 and clsx 2.1.1. SHA-512 integrity matches the historical `f868574` lock; complete upstream license texts occur in the r2 notice. The original r1 metadata rejection remains NO-GO: its POT still declared 1.1.2. R1 partial runtime success was not transferred to r2.

## Mandatory gates

| Gate | Result | Independent evidence |
| --- | --- | --- |
| Archive/source identity | PASS | Exact tuple, safe 17-file manifest, deterministic rebuild, installed bytes |
| Metadata/licenses | PASS | Correct versions/minima, explicit local changelog, exact upstream notices |
| Published baseline RED | PASS | Genuine public 1.1.2 defect reproduced in separately retained posts |
| Fresh installation | PASS | Direct reserve installation into two new databases, active and 17/17 exact |
| File transitions | PASS | Six physical file transitions; whole post rows and eight critical options unchanged at every boundary |
| Real role writes | PASS | Administrator/Editor/Author, both environments; captions, settings, className and lock; strict stored JSON and valid reopen |
| Scoped native security | PASS | 1,108 assertions, zero failures, loaded from the exact installed reserve |
| Official Plugin Check | PASS | Pinned 2.1.0; 29 static + 5 runtime checks selected; zero errors/warnings |
| Frontend resources | PASS | 64 Chromium/WebKit cases; exact legacy/new HTTP runtime bytes and resource contract |
| Reserve admin/editor | PASS | Four pairs: first insertion, iframe preview, save/reopen, ordinary admin and notice visibility |
| Operational closure | PASS | Owned projects stopped, four ports refused; normal preview remains running with exact r8 files |

## Fresh environments and decisive edited rollback

Owned projects were newly created, with new databases, accounts, ports and fixture state. Actual versions were verified inside installed WordPress:

- Minimum: **WordPress 6.3.14 / PHP 7.0.33**.
- Current: **WordPress 7.1.4 / PHP 8.3.35**.

The primary project ran `public 1.1.2 → r8 → physical 1.1.2.1 r2 → r8`, preserving the same database throughout. Each of six file-only boundaries compares the whole `wp_posts` row set and eight critical options, plugin activation, version, and installed-file hashes. No database reset or restore was used to pass.

The independent corpus contains terminal single/double backslashes, literal and layered entities, decimal/hex numeric entities including invalid numeric values, quotes, Unicode/emoji, literal Unicode escape text, real U+2028/U+2029, comment-like text, and a backslash in the middle. Fixtures are schema-checked before insertion; `shadow` is a string. Twelve positive posts contain **90 clocks** across three roles and both environments.

Each update, rollback and reupdate phase reopens those same posts, checks valid/clean state, performs a native title-only save, changes actual captions and className, changes Administrator lock values under native policy, saves width 181 and then 180, and reopens again. This gives **144 post-transition native editor/REST saves**, plus six fresh r8 hard-corpus insertions. Every save verifies strict raw comment JSON caption/className/lock and all expected typed attributes; tolerant HTML recovery cannot hide damaged stored JSON. Literal entities and terminal backslashes remain exact through the entire edited cycle.

A separate fresh project installed reserve r2 directly on both clean databases. Its use of the common provisioner to obtain Core/images/downloads does not constitute an r8 installation: the first plugin installed was the exact reserve ZIP.

The native writer harness is reviewer-owned and adapted from inspected harness source. Author reports and existing databases/results supplied no acceptance proof. No installable source or ZIP was repaired by the reviewer.

## Negative controls and security boundary

Actual original public 1.1.2 controls are retained separately from the positive posts. On minimum Core, 31/36 blocks fail full exactness/validity: 10 Administrator, 10 Editor and 11 Author. Precisely **12/36 captions differ**, and 20/36 stored headers are malformed JSON (10 Administrator, 10 Editor). These counts are distinct; 31 is not a count of erased captions. On current Core all 36 captions and stored JSON headers remain exact/valid, while one Author block with invalid numeric entities is invalid under the original writer. None of these original-version failures is labeled a reserve failure or silently converted to PASS.

Fresh reserve execution passes **538 security + 10 ambiguous/malformed recovery + 6 unknown/native-metadata probes per environment**. It exercises all three post fields, repeated saves, block widgets, stricter widget callbacks, native capability policy, hostile payload removal, unrelated KSES parity and empty frame-stack cleanup. Reuse is limited to probe source; the code was executed against newly installed reserve files and accounts.

The one-line PHPCS exception for `debug_backtrace` was reviewed in the exact packaged KSES file: maximum 12 frames, `DEBUG_BACKTRACE_IGNORE_ARGS`, bounded caller-identity guard, and no debug output. It is a narrow security-boundary exception, not a blanket suppression. Official PCP findings are empty, including runtime selection. PCP was **NOT RUN on PHP 7.0**, because official 2.1.0 requires PHP 7.4+; PHP 7.0 compatibility is supported by the actual installed functional/security cycle.

## Resources and editor integration

Eight representative native fixtures were run for both packages, both environments and Chromium/WebKit: empty, one, many, parent-suppressed, parent-escaped, inert template, late footer clock and block sidebar. All **64 browser cases PASS**. Suppression/escaping controls evaluate actual final DOM and requests; clocks in other stored drafts/inactive widgets do not trigger the empty page.

Pages with no live clocks request no plugin runtime and contain no inline layout rule. Pages with one/multiple live clocks request and include exactly one runtime, have exactly one inline layout block, make zero external plugin CSS requests, and compute `display:block` on each saved clock host. Rendered clocks tick; no page errors occur. Runtime responses are HTTP 200 with the exact 0.7.0 reserve SHA or r8 0.8.1 SHA `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`, and correct version query strings. Reviewer fixture clocks use `second="true"`, the native WordPress serialized form supported by the legacy runtime.

Four independent reserve admin/editor cases (two engines × two environments) start in a semantically empty editor, insert a clock, observe a live iframe preview, check per-document runtime/inline deduplication and layout, save, and reopen valid. Ordinary admin pages load zero plugin assets; notice JavaScript is present only while the settings notice is visible and disappears after dismissal. These checks do not certify the visual/Intl fixes introduced in widget 0.8.1.

## Closure, limits and raw evidence

Only the two reviewer projects were stopped: `independent-rb1121r2-20261103-a` and `independent-rb1121r2-fresh-20261103-b`. Their ports 52198, 52201, 53028 and 53031 return ECONNREFUSED, with the running owner preview on 55900 as a positive loopback control. No owned containers remain running; databases, failed controls and evidence are retained. No prune or deletion was performed.

The normal preview `sdcw-repro-debt-20261101-h` remains running (current and database, 41 hours uptime observed). Read-only final inspection matches all 17 accepted r8 plugin files. The reviewer performed no normal-preview database read, change, restart or deployment. Original r8 and reserve r2 ZIPs, manifest and builder match their frozen identities at closure.

Accepted limits: already-erased metadata/HTML cannot be reconstructed; the reserve retains widget 0.7.0 visual/Intl/resizing behavior; native Core policy remains authoritative for unrelated/unknown metadata; the streaming observer retains r8's documented bounded HTML/integration scope. No new migration or format change is claimed.

**NOT RUN:** PCP on PHP 7.0; Firefox/native Safari/VoiceOver in this bounded backport review; LocalWP/TLS/multisite; external font delivery/cache optimizers/public update offers; a separate reserve performance benchmark; new GitHub CI or any publication/deployment. Prior r8 broad matrices and benchmarks are context only and are not relabeled as fresh reserve results. No push, merge, tag, WordPress.org/npm/Cloudflare operation was performed.

Raw evidence:

- Review receipt, copied archive/manifest, rebuild, licenses reference and final matrix: `.local/independent-rollback-1121-r2-20261103/`.
- Decisive cycle, stored raw content, native save attempts and snapshots: `.local/wordpress-repro/independent-rb1121r2-20261103-a/`.
- Fresh install/PCP/native security logs and fixture sources: `.local/wordpress-repro/independent-rb1121r2-fresh-20261103-b/`.
- Exact frontend rows: `asset-browser-results.json`; admin/editor DOM evidence: `asset-admin-results.json`; HTTP byte proof: `runtime-http-identities.json`.
- Identity closure: `identity-closure.json`; operations: `operational-closure.json`; machine gate matrix: `evidence.json`.
- R1 NO-GO and original upstream license tarballs: `.local/independent-rollback-1121-20261103/`.
