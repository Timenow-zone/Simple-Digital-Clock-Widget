# WordPress frontend asset contract

This contract describes the unpublished [1.1.6 candidate](releases/1.1.6/README.md).
Published 1.1.5 and earlier ZIPs keep their original bytes and historical
acceptance. Shared widget 0.8.1 remains byte-identical.

## Delivery and WordPress integration

PHP registers the existing runtime handle early and retains normal editor loading.
On ordinary frontend HTML, the footer emits non-executable JSON containing
Core-generated script markup and a small inline browser loader. There is no global
output buffer, HTML response parser or Content-Length rewriting. A private,
short-lived buffer captures only the runtime's script markup from an isolated
copy of WP_Scripts; it never consumes the page response or the live script queue.
Registered dependency objects are cloned, pending items are reset and Core
concatenation is disabled in that copy. Existing done dependencies stay done.
Core still generates source URLs, loader filters, nonce attributes, translations
and attached before/after/localized data. Arbitrary filters with global side
effects are not promised to be isolated.

The loader checks for connected HTML `timenow-zone-sdcw` elements in the ordinary
document DOM. It observes added nodes for late inserts without polling, attribute
observation or repeatedly scanning the whole document. One activation serially
parses the small captured markup in a detached template and recreates the scripts, waits for each external script, and preserves
attributes and attached-data order. Existing registered or recognizable pending
runtime scripts are not duplicated. Detection stops when activation begins;
completion or failure clears the load timeout and temporary listeners.

| Frontend case | Main runtime requests | Other plugin work |
| --- | ---: | --- |
| No clocks, including inert/escaped examples | 0 | Inline loader and a waiting child-list observer |
| One or multiple ordinary DOM clocks | 1 | Inline loader; observer stops on activation |
| First clock inserted later into the document | 1 after insertion | No polling before insertion |
| Owned render later discarded; no remaining clock | 0 | Loader; owned layout CSS may remain |
| Explicit Core enqueue or dependency requesting the runtime | Core-owned | Browser loader is omitted |
| Admin/feed/JSON/robots/trackback | No frontend loader | Editor preview remains separately scoped |

An explicit enqueue is an integration's request to use the runtime even before
it creates a clock. Standard queued/done Core handles and dependency owners keep
normal execution, including a late enqueue after the default footer printer; the loader does not attempt to delay them.
`SDCW_enqueue_scripts()` continues to request frontend layout and registration,
not an unconditional runtime download. To explicitly request registration before
creating an element, an integration can enqueue the `simple-digital-clock` handle
using standard WordPress hooks. No built-in shortcode is introduced.

Inline layout remains limited to the owned block class. Raw inserts keep their
original layout. Neither saved block markup nor stored metadata is rewritten.

## Browser cost, failures and limits

A clock-free page contains inline JavaScript and inert JSON script metadata. Zero main
runtime requests does not mean zero bytes, zero PHP work or zero browser work.
The observer waits for DOM additions until the first clock or page destruction.
The only timeout is a bounded 15-second load deadline after activation; failures
emit a console error and `sdcw:load-error`, without automatic retries. A failed
request may require a page reload after its cause is corrected.

The supported capture format is direct executable script tags and whitespace or
comments. Non-executable consent types, delayed `data-src` rewrites, nomodule
scripts and arbitrary wrappers are rejected rather than bypassed. A strict CSP
must authorize both the inline loader and runtime; Core nonce filters are retained.
Existing runtime ownership is recognized by its Core ID or configured source URL.
An unrelated differently named/versioned CDN loader or arbitrary optimizer may
not be discoverable before it executes; this is not universal duplicate-loader
coordination. Avoid independently loading multiple widget versions in one document.

The first clock created only after `customElements.whenDefined()` resolves needs
explicit runtime loading. First clocks inside open or closed shadow roots are
outside document-subtree discovery. Existing standalone script/CDN URLs retain
their original registration behavior; this candidate does not rewrite them.
These are declared limits, not a claim of universal legacy JavaScript compatibility.

Normal theme footer execution is required. Full-page caches need regeneration
after installation. Core tag filters and tested nonce/data cases do not certify
all cache, consent or optimization plugins. Native Safari/assistive technology,
multisite, production latency and concurrent load need separate acceptance.

## Evidence and release boundary

See the candidate record for exact ZIP identity, fresh PHP/browser/native checks
and known limits. Historical 1.1.5 performance numbers do not characterize this
new loader. Hosted Repository checks and Browser tests must pass for the eventual
PR HEAD before release. Publication and owner-site installation are deferred.
