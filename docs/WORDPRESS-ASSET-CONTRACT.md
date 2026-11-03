# WordPress frontend asset contract

Applies to the local WordPress 1.1.4 streaming-r8 candidate and later releases.
It covers plugin-owned resources delivered through WordPress's asset API. Widget
runtime bytes and versioned CDN files are independent and remain unchanged.

## Required behavior

| Actual rendered frontend output | Runtime JS requests/tags | External CSS requests | Inline layout blocks |
| --- | --- | --- | --- |
| No clock | 0 | 0 | 0 |
| One clock | 1 | 0 | 1 |
| Several clocks, including mixed block/sidebar insertion | 1 | 0 | 1 |
| Clock exists only in a draft, inactive widget or another page | 0 | 0 | 0 |
| Escaped code example, HTML comment or attribute text | 0 | 0 | 0 |
| Archive/excerpt that strips the clock element | 0 | 0 | 0 |

Clocks in nested blocks, rendered synced patterns, Custom HTML, classic content,
shortcode output, dynamic blocks, active Block/Text/Custom HTML widgets and footer
sidebars must obey the same counts. Content permissions and publication status
remain Core's responsibility: the plugin observes rendered output, never scans
all posts or active sidebar options to guess whether a page needs the runtime.

Registration on `init` creates no frontend request. A streaming output observer
starts at `template_redirect` with a one-byte PHP buffer threshold. Each write is
returned immediately; the plugin never accumulates a whole page or waits for the
final flush. Its incremental lexical state survives split tags, attributes,
comments, raw-text elements and templates. A bounded 8 KiB PCRE fast path skips
ordinary complete markup; long/incomplete tokens retain only fixed state, not
their contents. Discarded nested output and CLEAN callbacks do not count. A clean
operation cannot undo bytes already flushed to the client.

No intermediate block/content/widget filter enqueues resources. Dynamic parents
and late content filters may discard or escape child clocks. SCRIPT escaped and
double-escaped states, NOSCRIPT, XMP, PLAINTEXT and inert templates are excluded.
This observer is not a sanitizer or a complete HTML tree builder: the contract
covers ordinary valid HTML documents with scripting enabled, not malformed tree
repair or clocks in foreign SVG/MathML namespaces.

Core still generates the `simple-digital-clock` and
`simple-digital-clock-block-style` handles in a small private capture at
`wp_footer` priority 19. This preserves `wp_enqueue_scripts` and earlier footer
filters, including loader attributes and inline/localized data. If a live clock
has already reached the observer, the tags are inserted at the next safe HTML
boundary. A first clock after footer gets the same tags immediately after its
opening tag. Every response has at most one insertion. Repeated footer calls do
not regenerate the capture. An empty HTML comment supplies a normal footer
insertion opportunity; it has no request or script. No unique placeholder remains
in the response. HTML bytes outside the one asset insertion are unchanged.

The source-free style handle contains only the scoped `display:block` host rule.
The widget's Shadow DOM styles and JS bytes remain unchanged. There is no external
plugin stylesheet, client loader, frontend observer or database scan. Feed,
robots, trackback, JSON and explicitly non-HTML responses bypass delivery. Empty
editors remain the explicit preview exception below.

Themes must call `wp_footer()` and produce valid HTML with an available insertion
position after resource capture. A clock followed by unclosed raw text through
EOF, filters that change content type after bytes were sent, removing the output
observer, transformations in an outer buffer after it, manual asset injection,
cache/optimizer rewrites and the first clock created solely by later client JS
are outside this contract. Existing Core/theme output buffers may still delay
TTFB; this plugin neither removes them nor credits their memory as its own.
Normal block/content/widget suppression is in scope, not an integration waiver.

## Admin and editor scope

Ordinary admin screens must not load the clock runtime, inline integration rule
or block editor bundle. Block editors need preview assets before a first clock
is inserted, including empty drafts and the iframe canvas. Each editor document
uses one handle; an iframe is a separate document. Preview resources are an
explicit editor exception to frontend publication rules.

The rating notice and its dismissal script are confined to the plugin settings
screen. A hidden notice adds no notification script or nonce payload. Editing a
draft may preview a clock; that does not make it a published frontend widget.

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
node --test tests/wordpress-assets.test.mjs tests/wordpress-package.test.mjs
node --test tests/wordpress-serialization.test.mjs
```

The first contract uses narrow routing/queue doubles and is required in CI.
Native Core/streaming and network counts are checked separately by
`tools/wordpress-lab/asset-contract.php`, `asset-contract-fixtures.php` and
`asset-contract.mjs` in fresh disposable minimum/current labs. They use 42 fixture
pages, including negative unused/draft/inactive/excerpt controls and a positive
manually rendered clock excerpt, suppressed/escaped/kept dynamic parents, a late
content filter, inert/raw-text examples, late footer output and chunk flushes. The browser
test creates a fresh context per page and counts real requests and script tags;
it also verifies all rendered clocks register and tick. Test-only MU fixtures
must never enter the release ZIP or owner sites.

After a successful fresh bootstrap for the current manifest-bound ZIP, run:

```sh
set -euo pipefail
python3 tools/wordpress-lab/verify-assets.py --id release-114-check-01
```

It refuses existing fixture evidence, verifies the lab's candidate identity,
starts only that owned project and stops it in a finalizer. `--engines` accepts
an explicit comma-separated browser list. Use a Linux Playwright environment for
Firefox if the macOS browser cannot launch. `asset-admin.mjs` separately checks
ordinary admin screens, visible/hidden notice scripts and first-insert/draft
save/reopen behavior in Chromium/WebKit; it uses generated local credentials
without printing them. These tools create fixtures only in the disposable lab.
Run browser phases sequentially with respect to automatic teardown: the default
frontend runner stops its project on completion. Start the owned project again
before independent admin/Firefox probes, and stop it after those probes finish.
Never change plugin files or themes while a browser phase is running.

Any change to these hooks, handles, editor scope or script registration must run
the relevant native HTTP/browser matrix as well as the CI routing guard. A local
candidate is not WordPress.org delivery proof; new package bytes require new
manifest/evidence and fresh acceptance before a later authorized publication.
