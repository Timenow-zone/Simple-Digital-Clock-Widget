# CLASSIC-COMMENT-P2-01: an Author save activates commented clock markup

Status: **OPEN; INHERITED FROM PUBLISHED 1.1.5; NOT AN RC15 REGRESSION**.

Exact RC15 acceptance found an unexpected content conversion in Classic Text
mode for a normal Author without `unfiltered_html`. A valid HTML comment in an
existing post becomes escaped comment delimiters surrounding a real clock tag.
The frontend then renders a clock that was previously only an example.

The measured fixture includes this fragment:

```html
<!-- <timenow-zone-sdcw caption="comment-only"></timenow-zone-sdcw> -->
```

The post is created through Core by an Administrator and assigned to the Author.
The Author opens it in native Classic Text mode, makes an unrelated edit and
clicks native Save/Update. This is a supported ownership scenario, not an
artificial grant of `unfiltered_html` to the Author. The stored result contains
escaped delimiters and a literal clock element. Substring counts in the raw
fixture are not DOM counts: the original comment contains the clock spelling
but no actual element.

## Paired evidence

Fresh native controls on WordPress 6.3.14/PHP 7.0.33 and WordPress 7.1.4/PHP
8.3.35 compare official public 1.1.5, frozen RC12, exact RC15 and a successfully
deactivated clock plugin. Actual Google Chrome 157.0.8103.51 performs all eight
paired captures; the initial six RC15 failures also cover Firefox and WebKit.

| Plugin state | Actual hosts before Save | Stored/front-end hosts after Save |
| --- | --- | --- |
| Public 1.1.5 | 0 | 1 / 1; clock renders |
| RC12 | 0 | 1 / 1; clock renders |
| RC15 | 0 | 1 / 1; clock renders |
| Plugin inactive | 0 | 0 / 0 |

The three active-plugin states produce byte-identical stored content on each
Core environment. Actual submitted POSTs retain the valid comment. The inactive
control still escapes the delimiters but removes the now-unknown clock tag.
Successful Core deactivation is recorded; this particular harness does not
record a separate zero-plugin-request oracle.

The raw captures are
`.local/rc15-editors-20261113/comment-attribution/RESULT.json`. Independent
source, map and byte review is recorded in
`.local/rc15-source-review-20261113/COMMENT-FINDING-REVIEW.json` and its companion
Markdown report. The six initial fresh-form data failures remain failures;
matching the predecessor is not a waiver of the intended inert-example contract.

## Attribution and release consequence

Installed Core's `wp_pre_kses_less_than()` code explains the delimiter conversion;
the plugin's existing KSES allowlist permits the clock tag to survive. Public
1.1.5 already has that allowlist, and RC12/RC15 KSES files are byte-identical.
The result is therefore an interaction between Core processing and the plugin's
allowlist, not an exclusive Core-only diagnosis or a new save-guard regression.

The conversion occurs during content saving. Fresh frontend tests still prove
that an unchanged, genuinely commented element does not activate the runtime.
The RC15 stale-form guard addresses loss of previously saved clocks and does not
repair this separate inert-to-active conversion.

No product or runtime change is made for this finding. It remains an open
inherited behavior requiring a separate correction or an explicit disposition
before a claim of complete acceptance. A future fix must preserve comments and
escaped examples without weakening KSES, removing actual clocks, or changing
foreign markup; it needs native filtered-role saves and predecessor controls.
