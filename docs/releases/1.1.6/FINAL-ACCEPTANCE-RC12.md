# WordPress 1.1.6 RC12 local correction acceptance

Status: **LOCAL HTML-PRESERVATION FIX VERIFIED; FULL RELEASE NOT READY; NOT PUBLISHED**.

RC12 corrects the inherited Classic Editor clock-HTML loss. The reviewed subject
is the [frozen candidate](RC12.md), not the existing RC9 production PR or its
hosted checks. This review does not claim that every WordPress admin operation
is free of browser or Core failures.

## Identity and change boundary

ZIP `simple-digital-clock-1.1.6-rc12.zip`: 75,480 bytes, 18 files, SHA-256
`0652cf00405e23c278d75d8aa66dd37c24e1888c9b2dae216f60e56befb5d118`.
The [frozen manifest](manifest-rc12.json) SHA-256 is
`3b704942ae9ee7bb4e4a777cb520f56df08981276498eff95fbb8ab7dfb3bd10`.
The dirty checkout is based on `3e9cec23c6c8cabbc1e8ea79320238488fd7c747`;
per-file hashes, not that base commit alone, identify the candidate.

Exactly three package paths differ from RC9:

- `includes/simple-digital-clock-kses.php` adds normal/teeny TinyMCE settings
  and the Core dynamic-editor hook. Existing KSES and metadata functions are
  unchanged; the editor helper uses the same explicit asset version in both
  loading paths.
- `assets/admin/js/simple-digital-clock-tinymce.js` extends only the clock's
  inherited schema and nonempty-element rule. It preserves native globals,
  including IDs, and all 17 runtime attributes plus class without changing
  native spans or overriding an explicit invalid-element policy.
- `readme.txt` documents the preservation fix and upgrade behavior.

The remaining 15 RC9 files are byte-identical, including the main 0.8.4 runtime,
loader, Gutenberg block, public asset integration, header and POT. No new
translatable strings or database migration were introduced. The main runtime
remains 36,430 bytes with SHA-256
`974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b`.
All 25 tracked `src/` and `dist/` files and 53 frozen historical inputs were
rehashed without changes. RC9 and intermediate RC10/RC11 packages remain intact.

RC10 was rejected because its fixed allowlist removed IDs/native globals and
missed dynamic Text widgets. RC11 was superseded to resolve the Plugin Check
enqueue-version warning. Their failures and partial results remain separate;
none is relabelled as an RC12 pass.

## Fresh local verification

Both native WordPress suites use Core 6.3.14/PHP 7.0.33 and Core 7.1.4/PHP 8.3.35.
Browsers are actual Google Chrome 157.0.8103.51, Firefox 153.0 and WebKit 26.5.
General/runtime and focused TinyMCE suites run Chrome/WebKit on macOS and
Firefox in an owned Linux arm64 Playwright server. Native Classic/lifecycle/stack
acceptance runs Chrome on macOS and Firefox/WebKit in its owned Linux container.
This is not Chromium-only verification or an installed Safari claim.

| Scope | Result and evidence |
| --- | --- |
| Mandatory main-script HTML/WordPress × three browsers | 6/6 exact-artifact cells; single/multiple configurations and ticking verified |
| Independent general regression | 132 accepted workflows: standalone 30, installed runtime 42, public placements 36, own-block Gutenberg 6, legacy previews 6, stale Gutenberg 6, Classic blocks 6 |
| Official Plugin Check 2.1.0 | All 29 static + 5 runtime checks, zero findings; current PHP executes the checker, minimum PHP executes the actual plugin |
| Existing package, serialization, REST, i18n and inspector contracts | 57/57 after the final PHP test-harness change |
| New Classic PHP/fixture contracts | 5/5; registered hooks, dynamic action, explicit asset version, composition and unchanged server KSES policy |
| Actual TinyMCE browser contracts | 3/3; 54 positive combinations × three serialization cycles; 87 primary observations including negative and policy controls; zero page/request errors |
| Native Classic updates from public 1.1.5 and frozen RC9 | 48/48 data-preserving, 44/48 without uncaught page errors |
| Native custom-settings composition and Author KSES negatives | 12/12 functional and strict |
| Dynamic Core Text widgets and explicit teeny editors | 12/12 canonical ready-state functional and strict; original early-switch attempt retained |
| Clean installation in fresh SQL namespaces | 6/6 data-preserving, 5/6 strict; original database namespaces/configuration restored and preserved |
| Ten-plugin stack native Classic editing | 6/6 data-preserving, 5/6 strict |
| Ten-plugin stack frontend across two themes | 60/60 functional, 58/60 without uncaught page errors |

The separate Classic suite totals **84 canonical native workflows with preserved
data, 78 without uncaught page errors**, plus the 60 frontend cases above. Five
native strict failures are the known preferences/navigation rejection and one
is the exact oEmbed cancellation reproduced without this plugin. Strict failures
and earlier attempts remain in the evidence; they are not relabelled as passes.
A separate posthoc review checks 78 positive native cases and 390 captured raw
buffers: exact clock attributes, empty hosts, classed wrappers and meaningful
foreign text. Only specific Core list/blockquote formatting is normalized; a
clock-free, plugin-disabled control confirms that formatting. No generic
whitespace collapse is used. Files-only RC9 rollback/re-update preserves transition data without a database
restore. Fresh install uses new SQL table prefixes and retains the old eight
content tables and stable options. The synthetic stack pins Autoptimize 3.1.17,
Classic Editor 1.7.0, Classic Widgets 0.3, Contact Form 7 6.2.5, Elementor 4.4.0,
Redirection 5.10.1, WooCommerce 11.3.0, Yoast SEO 28.8, WP Super Cache 3.1.5 and
WPForms Lite 2.0.4, with Twenty Twenty-Five 1.5 and Twenty Twenty-One 1.9. It
runs current WordPress/PHP with an observed 512M HTTP memory limit; CLI setup
uses its observed unlimited (`-1`) limit. These plugins are not claimed to
support PHP 7.0.
The two stack frontend strict failures are residual Dashboard Yoast/WooCommerce
requests cancelled during navigation, as in the preserved baseline stack run.

The 132 workflows include actual native saves and database/raw-content readback.
Their Classic fixtures use native keyboard editing in Chrome/WebKit and a
separately identified native Bold-formatting edit in Firefox. The original
Firefox text-entry attempts remain failures; formatting is not presented as a
text-entry pass. Ordinary empty pages request no main runtime, used pages load
it once, and ordinary public placements do not request the new admin helper.
Core may also initialize an actual frontend editor through `wp_enqueue_editor`;
that editor integration is distinct from an ordinary public page.

The TinyMCE fixture uses actual bundled TinyMCE 4.9.11, product JavaScript,
PHP settings and localized configuration. Only jQuery event transport is a small
adapter. Installed Core's real jQuery, role permissions and persistence are
verified separately. The seven existing serialization tests also included in
that agent's 15-test combined command overlap the root's 57 and are not added
again to a grand total.

## Preserved limitations and operational boundaries

- Firefox native Classic-modal keyboard/IME text entry fails with the plugin
  fully disabled and a clock-free post on both tested Core versions. Plain
  editable paragraph/iframe controls work in the same browser/transport. The
  underlying Core/TinyMCE/Firefox responsibility remains undetermined.
- Classic Text widget Code switching during partial TinyMCE initialization
  reproduces the exact `getSelection` exception with the plugin disabled and
  no clocks. Normal editor workflows wait for observed initialization; the
  original early-switch RC12 failure is retained. The effect of the added
  asset on the frequency of that existing race was not measured.
- WebKit immediate navigation can produce the preserved Core preferences
  rejection, reproduced with this plugin disabled. The exact `oembed-cache`
  XMLHttpRequest access-control diagnostic and separate `Load failed` message
  were reproduced on the third bounded native Save/reopen attempt with SDCW
  fully disabled and a clock-free post in the same ten-plugin stack. Endpoint,
  cancelled request, phase and disabled identity are recorded. No network delay
  or content mutation was injected to obtain the control. These results show
  plugin independence, not a measured equality of failure frequency.
- An already initialized RC9 Classic Editor tab retains the old destructive
  schema after server files are updated. Protect unsaved work and reload it
  before editing/saving. Fresh RC12 tabs preserve stored clocks. This differs
  from the separately passing stale Gutenberg test with unchanged block.js.
- Already deleted clock HTML cannot be reconstructed by this fix. Recover it
  from an intact revision or backup. Files-only rollback to RC9 preserves data
  at the transition but restores its old Visual-mode defect.

Server KSES remains the existing sixteen-attribute policy for filtered roles.
Preserving additional native/client attributes for unfiltered authors does not
bypass that policy. Previous RC9 multisite, full cache-mismatch and Site Editor
matrices remain historical evidence; they are not claimed as fresh RC12 runs.
The current third-party environment is a synthetic site, not a production clone.

## Evidence and remaining delivery gates

Root receipts: `.local/rc12-classic-fix-20261113/`.
Independent native Classic/lifecycle/stack receipts:
`.local/rc12-classic-independent-20261113/`.
Independent general regression receipts: `.local/rc12-regression-20261113/`.
Permanent test receipts: `.local/rc12-classic-tests-20261113/`.
Each workstream retains executed methods, original failures and exact identities.
Root independently rehashed all 1,687 Classic, 447 general-regression and 27
focused-test inventory entries and cross-checked canonical counts against raw
results. The [acceptance receipt](acceptance-rc12.json) records the inventory
hashes, exact candidate identity, scoped results and remaining gates. Owned
services are stopped; databases, namespaces, packages and evidence are retained.

No commit, push, merge, Cloudflare upload/deployment, or WordPress.org publication
was performed. Required Repository checks and Browser tests must run on a future
exact RC12-containing commit. The existing RC9 checks do not accept RC12. The
separate 0.8.4 production CDN delivery remains pending. This local correction
review does not authorize any of those release actions.
