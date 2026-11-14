# WordPress 1.1.4: final output candidate

Status: **final-output-r5 independent NO-GO (IND-FINAL-01); unpublished**. Requirements remain **WordPress 6.3 / PHP 7.0**. Widget **0.8.1**, its JavaScript and internal styles remain byte-identical.

## Exact candidate

- ZIP: `.local/packages/simple-digital-clock-1.1.4-final-output-r5-candidate.zip`.
- **67,469 bytes; 16 installable files**.
- SHA-256: `861912199c6e5c09e267202ee3dc2b5958a122833cd50a9bcf89cf375b036c0f`.
- [Manifest](manifest.json); [asset contract](../../WORDPRESS-ASSET-CONTRACT.md).
- Widget SHA-256: `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

## IND-INLINE-01 correction

The frontend decision moves from intermediate render filters to the completed theme HTML. A dynamic parent or later content filter can suppress or escape child clocks without requesting the runtime. The response buffer also covers direct theme output, late footer clocks and tags split across chunk flushes. Core generates deduplicated runtime and inline layout tags; the final tokenizer pass includes them only when a live clock survives. Inert templates and HTML examples do not count.

This requires response-sized PHP memory and delays streaming until completion. It adds no browser bootstrap or external stylesheet. Admin/editor behavior, KSES security and serialization code, dependencies, widget bytes, translations and licenses are unchanged. No database migration is introduced. Output rewriting after the plugin's final pass and external cache/optimizer integrations remain separately unverified. Themes must call `wp_footer()`.

The previous exact r4b **NO-GO** remains preserved in [its report](INDEPENDENT-INLINE-CSS.md), [release snapshot](INLINE-R4B.md), [manifest](manifest-inline-r4b.json) and [status](acceptance-inline-r4b.json). Its ZIP is not overwritten. The historical [r2 GO](COMPATIBILITY-R2.md) and author-only r3/r4 results do not transfer to these new bytes.

## Acceptance and publication boundaries

Fresh local tests and independent review must bind to this exact ZIP and record PASS, FAIL and NOT RUN separately. The browser contract now has 30 fixtures, including the original parent-suppression blocker, a late content filter, inactive/draft/excerpt controls, multiple clocks and explicit flushes. Clean installation, upgrade/physical rollback/re-update, official Plugin Check, classic/block themes, editors and supported PHP/Core references remain distinct gates.

No push, new GitHub CI, merge, deployment or WordPress.org publication is authorized. Old-writer/Core 6.3 data-loss and erased-caption/lock limitations remain. HTTPS/TLS installation, multisite, native Safari/VoiceOver, external Google transport, owner sites and broad historical cache/optimizer coverage are not newly certified. A local acceptance verdict is not public delivery proof.

Final verdict: [independent NO-GO report](INDEPENDENT-FINAL-OUTPUT-R5.md).
