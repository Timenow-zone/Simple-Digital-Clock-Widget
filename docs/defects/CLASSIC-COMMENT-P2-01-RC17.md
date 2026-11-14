# Inherited comment-context correction for RC17

This addendum preserves the frozen RC15 and RC16 reports. It addresses the ten
inherited comment-like clock examples reproduced during RC16 acceptance and
the subsequently reproduced loss of live clocks beside browser-empty comments.
It does not change the shared runtime or make a release-readiness claim.

## Reproduction and scope

The paired baseline is exact RC16, SHA-256
`18a1b2c67f181a0a3c719646241499eb237ce63962f5ad6f08a32fc165639601`.
The original ten vectors cover a quoted attribute, SCRIPT, XMP, NOSCRIPT,
PLAINTEXT, an unterminated comment, an incorrect `--!>` closer, SVG and MathML
CDATA, and a malformed HTML-context CDATA declaration. Each contains a literal
comment opener and clock markup. Filtered Author saves promote an unintended
clock-named node on both supported test environments.

Live scripting-enabled browser checks distinguish namespace and custom-element
registration. Nineteen of the twenty baseline observations produce HTML clock
elements. The remaining current-Core MathML case produces a foreign MathML node,
not a functioning HTML widget. Earlier node-count evidence must not be read as
twenty rendered widgets. Historical evidence remains unchanged.

The additional empty-comment control contains `<!-->` and `<!--->` before two
real clocks. Native Core filtering loses one clock. A direct normalizer check
alone misses a second problem: Core's block-attribute pass corrupts a subsequent
`<!---->` comment. Whitespace-bearing `<!-- -->` preserves both boundaries through
the actual filtered-save pipeline.

## Correction

The existing scoped pre-KSES hook normalizes eligible examples before native
sanitization. DATA comments escape literal angle brackets; malformed closers are
canonicalized. Opaque attribute and raw-text spans encode the example opener and
clock-tag tokens while preserving actual container delimiters. CDATA-shaped
regions use a bounded secondary lexical pass and resume at the known boundary.
There is no recursive suffix parsing, private offset access or dependency on the
text setter introduced after WordPress 6.6.

The allowlist, permissions, KSES callbacks and unfiltered-user path stay intact.
No unsanitized HTML is restored after filtering. Source spelling intentionally
changes; actual clocks retain their settings and native sanitization. Runtime,
loader, TinyMCE integration, stale-save guard and Gutenberg code are unchanged.

## Acceptance boundaries

- Compare exact RC16 and RC17 using actual Core filtered saves, native editor
  requests, stored content, repeated saves and scripting-enabled browser DOMs.
- Verify mixed real/example content, unrelated blocks, malicious attributes,
  stricter filters, recursive KSES calls, native autosaves and older open tabs.
- Require exact main-script standalone HTML and WordPress checks in actual Google
  Chrome, Firefox and WebKit. Chromium-only results do not satisfy Chrome.
- Keep malformed non-comment HTML, invalid clock-name delimiters and third-party
  block JSON on their native path. Compatibility comparisons for these controls
  are not claims that every malformed input remains inert or byte-idempotent.
- Preserve raw failures and distinguish functional assertions, browser
  diagnostics, prototype probes and frozen-artifact acceptance.

The working evidence is `.local/rc17-fix-20261114/`, with independent editor and
compatibility scopes in `.local/rc17-editors-20261114/` and
`.local/rc17-compatibility-20261114/`. The exploratory prototype author's security
checks are recorded separately in `.local/rc17-security-20261114/`; they do not
replace the independent source review.

A files-only rollback to RC16 restores its inherited behavior. It cannot reverse
content already normalized or previously damaged. Preserve post revisions and a
database backup for content recovery. Updating does not heuristically rewrite
real clock elements whose comment boundaries were already lost in older saves;
restore the original content from a revision before saving it again. No merge or
publication is authorized.
