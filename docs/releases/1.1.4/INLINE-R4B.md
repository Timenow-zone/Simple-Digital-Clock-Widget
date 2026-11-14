# WordPress 1.1.4: local inline CSS candidate

Status: **independent NO-GO for inline-css-r4; publication is blocked by IND-INLINE-01**. Requirements stay **WordPress 6.3 / PHP 7.0**. The widget remains **0.8.1** with unchanged JavaScript and internal Shadow DOM styles.

## Independent blocking result

The [independent report](INDEPENDENT-INLINE-CSS.md) and [fresh evidence](independent-inline-evidence.json) override the earlier author-only readiness claim. A dynamic parent can suppress or escape a clock after its child render hook has enqueued assets. Eight Chromium/WebKit cases across both Core/PHP references contain zero final DOM clocks but still request one runtime script and print one inline rule. Eight paired controls pass. The frozen ZIP/source/manifest remain unchanged.

The review stops after this mandatory blocker: **8 gates PASS, 1 FAIL, 7 NOT RUN; no waivers**. Six exact file transitions and official Plugin Check (29 static + 5 runtime, zero findings) pass within their scopes; candidate clean install, full frontend/admin/theme/Firefox/native security matrices are not newly certified. A new candidate and independent acceptance are required after a fix.

## Exact rejected candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-inline-css-r4b-candidate.zip`.
- **66,810 bytes; 16 installable files**.
- SHA-256: `3b434a982d24192173e2f93239121292b4013aaf51e8044fd227787c67addef2`.
- [Manifest](manifest.json) and [local evidence](acceptance-evidence.json).
- Unchanged widget SHA-256: `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

The [r3 report](ASSET-CONTRACT-R3.md), [manifest](manifest-before-inline-css.json) and [evidence](acceptance-evidence-before-inline-css.json) remain preserved for the 17-file archive `217807d2c79018c2d1861884e1f8e5e151c86cbf4154b0889d09db0f4eb84772`. The earlier [independently accepted r2](COMPATIBILITY-R2.md) remains unchanged; its GO does not transfer to these new package bytes.

## Inline layout integration

The [frontend contract](../../WORDPRESS-ASSET-CONTRACT.md) now requires zero external plugin CSS requests on every page. A rendered clock requires one runtime script and one inline layout block, regardless of clock count; unused pages require neither. The scoped host rule remains `display:block` for the WordPress clock block. Its source-free style handle is registered idempotently through `wp_add_inline_style`, and the standalone integration CSS file is removed.

All r3 on-demand rendering, late sidebar/footer handling, editor/iframe preview and restricted admin-notice behavior remain. KSES/security code, block serialization, translations, licenses and widget bytes are unchanged from r3. No database migration is introduced. Existing metadata diagnostics and the documented bounded production-backtrace exception remain as recorded in the prior report.

## Verification and publication boundaries

The current manifest/ZIP must pass exact source and installed-file checks. The browser contract counts real JS/CSS requests, inline blocks, script tags, ticking clocks and computed host display; it covers minimum/current Core, nested blocks, patterns, raw HTML, shortcodes, dynamic blocks, active/inactive widgets, excerpts and drafts. Empty editor insertion and draft save/reopen are separate tests. The previous KSES matrix remains scoped to its original exact archive; unchanged KSES bytes are recorded explicitly rather than claiming a new independent acceptance.

No new required GitHub CI or independent exact-candidate GO is claimed for unpushed local changes. WordPress.org publication needs an explicit later instruction, followed by public ZIP/catalogue/update-offer/canary/Preview verification. After later installation, invalidate page/optimization caches so old cached markup no longer references the removed CSS URL.

Old-writer/Core 6.3 data-loss and erased-caption/lock limitations remain. HTTPS/TLS installation, multisite, native Safari/VoiceOver, external Google transport, owner sites and the broad historical cache/optimizer matrix are not newly certified. Direct theme output/later JavaScript insertion require explicit enqueueing as documented in the contract; themes must call `wp_footer()`.

Prior author-only checks pass within their original scope: **140 frontend cases** (120 across three engines plus 20 on a classic theme), **4 admin/editor cases**, **6 exact-archive transitions**, and Plugin Check **0 errors / 0 warnings**. Initial r4 MissingVersion output and its automatic preview rollback remain preserved; final r4b explicitly versions the source-free handle.

The author-only matrix omitted suppressed/escaped dynamic-parent output. Its earlier PASS is retained in [author evidence](author-inline-css-evidence.json), not treated as an independent GO. Report/status integration occurred only after the reviewer and root verified all 333 frozen files; installable files, manifest and ZIP were not edited.
