# CLASSIC-COMMENT-P2-01: RC16 correction contract

Status: **ORDINARY COMMENT CORRECTION VERIFIED; MALFORMED-INPUT RESIDUAL OPEN;
FULL ACCEPTANCE NO-GO**.

The [original finding](CLASSIC-COMMENT-P2-01.md) is preserved as RC15 historical
evidence. This addendum records a separately authorized correction; it does not
rewrite the predecessor's failures as passes.
The [RC16 acceptance report](../releases/1.1.6/FINAL-ACCEPTANCE-RC16.md) records
fresh execution and the independent review. The scoped fix passes; the explicit
residual below and remaining release gates are not waived.

## Intended behavior

For WordPress-filtered content, complete ordinary HTML comments containing a
literal opening clock tag must remain inactive after Save, autosave and repeated
Save/reopen. Multiline comments and comments adjacent to real clocks are covered.
Actual clocks keep their settings and count. Existing escaped examples remain
escaped. Other comments, quoted attribute values, raw-text containers, block
delimiters and foreign block JSON keep native processing.

The correction intentionally normalizes the example's source:

```html
<!-- <timenow-zone-sdcw caption="example"></timenow-zone-sdcw> -->
```

becomes:

```html
<!-- &lt;timenow-zone-sdcw caption="example"&gt;&lt;/timenow-zone-sdcw&gt; -->
```

Both delimiters remain real comment delimiters. Other body text and existing
entities are not decoded. Native KSES may still apply its normal policy to the
comment text. This is an explicit normalization contract, not a claim that the
comment's literal bytes remain unchanged. Saves without KSES remain native.

## Implementation and safety boundary

`SDCW_escape_clock_comments()` runs inside the existing priority-9 `pre_kses`
callback only when that KSES context allows clock elements. The native HTML tag
processor identifies tag/attribute and raw-text spans. A small scanner handles
comments, declarations and CDATA within the remaining DATA gaps. The adapter
accounts for Core 6.3's separate raw-text closing tags and newer atomic spans,
and excludes XMP, NOSCRIPT and PLAINTEXT text explicitly.

Only literal `<` and `>` inside an eligible comment body are encoded. There are
no temporary opener tokens, no callback replacement and no restoration after
KSES. Stricter filters can still remove comments, escape all content or remove
actual clock tags. Native authorization, nonce checks and all existing attribute
and URL sanitization remain in place. Incomplete or malformed tokens stay native.

The scanner uses original-string offsets and a reusable native bookmark for
raw-text closers. It avoids reparsing every comment prefix and copying each
remaining raw-text suffix. The native seek budget is respected by renewing the
lexer over the same original string. Development timings are not release proof;
exact-artifact benchmarks and security results are recorded separately.

## Explicit residual boundary

This is not a generic malformed-HTML repair. In particular, an HTML-context
`<![CDATA[ >` declaration followed by a clock comment remains native. Browsers
end that bogus declaration at the first `>`, while the minimum Core lexer scans
CDATA through `]]>`. The subsequent comment can therefore retain the inherited
inert-to-active conversion. Its compatibility result must not be described as
an inertness pass. Genuine SVG/MathML CDATA must not be rewritten to cover this
malformed HTML case.

The exact fixture, stored output, browser DOM evidence and predecessor comparison
belong in the acceptance evidence. This residual is not silently waived or
included in a universal claim that every possible comment context is repaired.

## Required fresh evidence

- Native Author and unfiltered Administrator saves on minimum/current Core,
  Google Chrome, Firefox and WebKit; two saves and reopening each fixture.
- Actual submitted POST, stored content, DOM counts and frontend tick checks for
  mixed real clocks and comments; ordinary comments alone must produce no clock.
- Old open documents across real Core HTTP updates, including the unchanged
  stale-save protection and intentional deletion from a fresh editor.
- Genuine upgrade, files-only RC15 rollback and reupdate, separating file-state
  invariants from the predecessor's destructive native save.
- Exact KSES security, recursion, stricter policies, lexical exclusions,
  repeated-save idempotence and bounded adversarial-input execution.
- Exact main-script HTML/WordPress compatibility, official Plugin Check,
  readme/POT synchronization and independent review of the frozen package.

RC15 and runtime 0.8.4 remain unchanged. Rollback removes the correction; restoring
lost or transformed content requires an intact revision or backup. No publication
or remote deployment is part of this work.
