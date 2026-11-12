# Configured runtime override compatibility policy

Status: **OWNER APPROVED ON 2026-11-12; EXACT RC3 ACCEPTANCE IN PROGRESS**.
The owner explicitly selected preservation of compatibility for overridden
runtimes, including the documented eager-loading cost on clock-free pages.
This decision does not authorize merge, CDN delivery or WordPress.org publication.
RC2 remains frozen and NO-GO; the selected successor is [RC3](RC3.md).

## Conflict and reproduced evidence

WordPress integrations can replace the registered runtime or filter its final
URL. Registration alone ordinarily does not mean enqueue. If that configured
runtime is immutable 0.8.1, it cannot install its renderer in the new lightweight
host: it unconditionally defines the same custom-element name. A pending
`whenDefined()` promise and a first host in a closed shadow root provide no
observable signal before the element is defined. Zero runtime requests on an
empty page, arbitrary old configured bytes and unchanged hidden integrations
cannot all be guaranteed without changing one of those contracts.

Independent execution using PHP/JS from the exact RC2 ZIP and actual Core
6.3.14/7.1.4 reproduces 16/16 affected failures. Default 0.8.2 controls pass.
Evidence: `.local/independent-116-rc2-code-review/REPORT.md` and its frozen inputs.

## Accepted behavior

The server classifies the final Core-generated main script ID/source. The exact
bundled 0.8.2 URL keeps `lazy: true`. Any opaque source/version/tag-URL override
sets `lazy: false`; the external bootstrap loads that captured runtime without
reserving the custom-element name. Core attributes, dependencies, before/after
data and existing owners remain intact. Invalid consent formats are still
rejected, never bypassed. No published runtime bytes or browser APIs change.

The cost is explicit: **an overridden runtime can load on a clock-free page**.
This includes same-byte CDN mirrors and query rewrites whose renderer identity
cannot be proven from their URL. This is an explicitly accepted optimization exception to
preserve integration compatibility, not a reinterpretation of registration as
an ordinary WordPress enqueue. Default bundled pages still make zero main-runtime
requests until use; nonce/SRI filters preserving the main ID/source retain that behavior.

The alternative is to retain zero-runtime behavior for these overrides and
explicitly restrict incompatible legacy configurations. That also changes the
existing compatibility contract. The owner selected compatibility, not this
alternative. Reports continue to distinguish overrides from the default zero-runtime gate.

## Prepared verification and release boundary

The selected source and generated bootstrap pass 96 Linux browser runner tests,
167 PHP assertions and independent 84-case actual-Core/browser checks. The
independent matrix includes static, first-after-`whenDefined()` and empty pages
with default, pre-registered 0.8.1, source/tag-filter 0.8.1, 0.8.2 mirror/query
rewrites and attribute-only filters. Expected override-empty requests are one;
default-empty requests are zero. No success is inferred from definition alone.

The shared 0.8.2 artifact remains byte-identical. The selected policy is bound
to frozen RC3. Before acceptance, rerun affected exact-package and delivery
gates and require current PR checks.
Existing RC2 results remain exact-RC2 evidence. Production CDN delivery and
WordPress.org publication retain their separate authorization boundaries.
