# WordPress frontend asset contract

Applies to the local WordPress 1.1.4 render-r9 candidate. It supersedes the
streaming-r8 final-response discovery contract at the owner's explicit request.
Historical r8 and rollback archives retain their original behavior and evidence.
Shared widget 0.8.1 bytes are unchanged.

## Required behavior

| Render event in this request | Runtime requests/tags | External CSS | Inline layout rules |
| --- | --- | --- | --- |
| No owned clock block rendered | 0 | 0 | 0 |
| One owned clock block rendered | 1 | 0 | 1 |
| Multiple owned clocks, including block widget sidebars | 1 | 0 | 1 |
| Clock only in another page, draft or inactive sidebar | 0 | 0 | 0 |
| Clock skipped before rendering or empty owned render result | 0 | 0 | 0 |
| Automatic text excerpt generation | 0 | 0 | 0 |

The only automatic frontend trigger is
`render_block_simple-digital-clock-block/widget-block`. Nested blocks and synced
patterns work through the same Core render event. The callback returns the saved
markup unchanged. Registration is lazy. Stable Core handles deduplicate resources;
Core generates script tags and applies loader/inline-data filters normally. The
inline `display:block` host rule is printed in the head when available, otherwise
at footer priority 19. Explicit rendering after Core's footer script action prints
only pending resources immediately. Themes must call `wp_footer()` normally.

There is no output buffer, stream lexer, global `render_block`, content/excerpt
scanner, database lookup, response rewrite or client-side discovery loader.
Pages without an owned render get no clock runtime/layout handle registration or
clock footer hook. The editor-script handle is still registered on `init`; this
registration does not enqueue it or create a frontend request.
The plugin still boots and registers its named block/filter like other WordPress
plugins; this is not a claim of zero PHP execution.

## Compatibility and explicit integrations

Existing Simple Digital Clock blocks from 1.1.2 retain their name, saved markup,
settings, captions and serialization. Block-based widget areas remain automatic.
The reader/writer fixes and runtime are byte-identical to accepted r8. No database
migration or automatic content rewrite is performed.

Raw custom elements in Custom HTML/Text widgets, classic content, custom templates
or third-party shortcode/dynamic output cannot be automatically discovered under
this contract. Such renderers must call the existing `SDCW_enqueue_scripts()`
helper when they actually output a clock, or render the owned block through Core.
For example, in a PHP template's clock branch:

```php
if ($show_clock) {
    SDCW_enqueue_scripts();
    echo '<timenow-zone-sdcw class="wp-block-simple-digital-clock-block-widget-block" second="true"></timenow-zone-sdcw>';
}
```

This changes incidental raw-HTML support from 1.1.2's global enqueue and r8's
response discovery. It is an explicit integration boundary, not a blanket claim
that every possible 1.1.2 embedding remains automatic. An unmanaged raw-HTML
negative control must show zero resources and an unregistered custom element.

If another plugin renders an owned child and later removes or escapes it, its
resources may remain queued. The parent/content suppression fixtures deliberately
expect zero live clocks and one resource set. This is the accepted architectural
tradeoff of removing global observation, not proof of the former final-HTML
contract. Cached/pre-rendered HTML bypassing Core's block render event also needs
explicit integration. First clocks added solely by client JS are not discovered.

## Admin and editor scope

Ordinary admin pages have no clock runtime or layout rule. Block editors are an
explicit preview exception: even empty editors need first-insert previews,
including iframe canvases. Each document uses one handle; an iframe is a separate
document. Rating-notice resources remain scoped to a visible notice on the plugin
settings page. Feed, robots, trackback, JSON and automatic excerpt rendering do
not enqueue frontend assets through the owned hook.

## Diagnostics and security

Metadata failures retain the existing fail-closed return values and emit the
`sdcw_metadata_diagnostic` action with exactly one fixed code, without caption,
post content, stack arguments or other user data. Applications may subscribe to
that event for logging; the plugin itself writes no unconditional PHP error log.
Codes are `metadata_encoding_failed`, `legacy_caption_ambiguous`,
`legacy_caption_unrecognized`, `metadata_parse_failed`,
`caption_unicode_encoding_failed`, `caption_attribute_not_found`,
`caption_reference_encoding_failed` and `caption_entities_normalization_failed`.

The bounded argument-free `debug_backtrace` remains production security logic:
it distinguishes the owned KSES callback from unrelated/nested sanitization.
Only that line has a documented exact-code PHPCS exception. No check, severity,
Plugin Check result or broader ruleset is disabled. Removing that boundary to
silence a development-function warning would weaken caption/KSES isolation.

## Regression checks

```sh
set -euo pipefail
node --test tests/wordpress-assets.test.mjs tests/wordpress-package.test.mjs tests/wordpress-serialization.test.mjs
python3 tests/wordpress-rollback.test.py
```

Routing tests assert no global observer/buffer, lazy registration, zero assets for
excluded requests, unchanged owned markup, stable handles and late deduplication.
The disposable Core lab checks 45 frontend cases, including explicit raw-HTML
integrations, an unmanaged negative control, early/late rendering, excerpts and
post-render suppression. Browser tests count requests and tags, inline rules,
layout and ticking clocks. Admin tests wait for an initialized post before first
insertion and verify draft save/reopen and iframe previews. Test-only fixtures
must never enter the release ZIP or an owner site.

Use `tools/wordpress-lab/verify-assets.py` only with a successfully bootstrapped
fresh lab bound to the current manifest. Retain the exact ZIP, manifest, test
source identity and raw results. Old independent GO/performance measurements do
not transfer to these new bytes. This contract does not authorize publication; it requires
separate authorization and the required repository checks.
