# Independent acceptance of WordPress 1.1.4 i18n-r10

Verdict: **GO for the exact local i18n-r10 candidate within the fresh scope below**.
No actionable blocker was found in the correction or its retained acceptance evidence.
This verdict is not publication approval and does not transfer all 13 historical
render-r9 gates to the new archive.

## Exact candidate and preservation

- Candidate: `.local/packages/simple-digital-clock-1.1.4-i18n-r10-candidate.zip`.
- SHA-256: `46cf4faed3ab3784dd582c91ef3a49103b5840f00924eeb0b6830195f3458403`.
- Size: 66,859 bytes; 16 installable files; ZIP CRC passes.
- Manifest SHA-256: `61396bfd46e30e605b99439239aeec41a051b99170456450d46f708e22ff4860`.
- The complete ZIP, current manifest and working plugin source match byte-for-byte.
- The source remains uncommitted on top of `361b11c`; the exact manifest, not that
  older commit alone, identifies the changed installable files.

Accepted render-r9 remains 66,815 bytes, SHA-256
`5f334f9496c0c064ab4e182fdda7fa3d4493da7c99baada899cd3392d6d124e7`.
Its new `manifest-render-r9.json` and `acceptance-render-r9.json` preservation
copies exactly match the original HEAD files and pre-change recorded hashes.
The original independent r9 Markdown and JSON reports are unchanged.
All eight immutable versioned widget artifacts and the retained latest alias
keep their pre-change hashes. Widget 0.8.1 remains SHA-256
`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

Five package paths changed: `widget_init.php`, `block.js`, the admin notice PHP
file, the POT and `readme.txt`. The fifth change documents the correction.
Asset routing, clock runtime, saved block serialization and database schema did
not change in this package diff.

## Correction and translation evidence

The missing editor messages are exported, `shdowHelp` is corrected to
`shadowHelp`, and its English description now refers to container shadow.
Settings titles and rating messages invoke gettext with HTML/attribute escaping
at their PHP output contexts.

Review also corrected a defect in the prepared proposal: all 48 values in nested
`blockData.i18n` must use `__()` rather than `esc_html__()`. The nested dictionary
passes through JSON transport to component text/props. Early HTML escaping would
leave literal entities in the editor. The reviewed editor sinks do not insert
these strings as raw HTML; direct PHP output still uses escaped gettext helpers.

The actual WP-CLI 2.12.0 extraction output matches the packaged POT. The retained
PHAR hash matches the recorded generator hash. There are 63 nonempty msgids:
ten additions and removal of the obsolete shadow-description msgid. All 64
numbered source references point to the matching source messages; translations
remain empty in the template. No actual language pack was fabricated.

The new unit guard passes 6/6 against both source and the exact extracted r10 ZIP.
An independently extracted preserved r9 archive yields the four expected failures
and two passes. The failed contracts cover dictionary keys, misuse of escaping
helpers as translators, prematurely escaped dictionary values and untranslated
settings/notice output. This gatekeeper authored that unit guard; independent
package/native reviewers and raw receipt readback supply the separate acceptance
evidence. Unit registration/gettext doubles are not claimed as native transport.

The native targeted test uses a real gettext filter with 13 distinctive Unicode
translations, quotes, ampersands, markup and a closing-script/injected-script
sentinel. One final uninterrupted run passes all four Chromium/WebKit and
minimum/current WordPress pairs. Harness and raw command/result review confirm:

- Six exact nested dictionary values and literal visible help/control labels.
- Both translated reset buttons execute their expected attribute changes.
- Settings title/menu, notice text and both image alt attributes translate.
- No marked translated element is created and no sentinel script executes.
- Empty-editor first insertion, raw saved content and reopened block serialization
  preserve the original bytes after intentional control changes are restored.
- No page JavaScript errors are filtered from the final successful run.

Core's emoji replacement is handled only on a detached clone used to recover
visible text from `img.emoji` alt values. The live DOM injection check remains
unchanged. An empty post editor avoids an unrelated starter-page pattern modal;
no plugin assertion or expected translated value is weakened. Earlier welcome,
emoji and pattern-modal harness failures and partial runs are retained, and only
the complete final four-pair run is credited.

## Fresh regression and receipt readback

| Scope | Fresh result |
| --- | --- |
| WordPress references | 6.3.14/PHP 7.0.33 and 7.1.4/PHP 8.3.35 |
| Clean installations | 2; all installed files exact |
| Original-file update/rollback/reupdate transitions | 6; posts/options preserved |
| Editable-reserve transitions | 6; posts/options preserved |
| Post-transition editor saves | 108; 756 strict raw JSON checks |
| Reopened normalized blocks independently compared | 252 |
| Frontend resource contract | 180 Chromium/WebKit cases |
| Ordinary admin/editor pairs | 4 |
| Targeted translated UI pairs | 4 |
| Plugin Check 2.1.0 | 29 static + 5 runtime checks; zero findings |
| Local workflow verification steps | 20; all pass |
| Local CI tests | 235: 81 Node, 24 Python, 111 browser unit, 19 browser integration |
| Additional exact extracted-ZIP tests | 14 |

The writer readback independently parsed every saved JSON comment, verified
required explicit attributes and compared normalized reopened attributes with
the original expected records. Native snapshot comparisons independently confirm
package identity and unchanged posts/options across physical transitions.
Plugin Check ran on the current PHP reference; its PHP >=7.4 requirement prevents
execution on PHP 7.0, whose compatibility is covered by the separate real minimum
installation, writer, browser and package checks.

The Linux local CI replay includes Chromium, Firefox and WebKit, an exact
production-runtime reproduction, syntax/type/lint checks, release/preview parity,
serialization and immutable rollback safety. Its first i18n step failed because
the isolated PHP wrapper omitted the tokenizer extension. Loading the retained
extension repaired the wrapper; the unchanged failed and remaining steps passed.
The original failure is preserved. No candidate or test-source edit obtained PASS.

All 420 frozen CI source files retain their hashes; subsequent checkout changes
are documentation-only. Final documentation status/link/prose checks belong to
the integrating parent and are not retroactively attributed to the CI snapshot.
Fresh dependency audit reports five low development-only findings, with zero
moderate, high or critical findings.

## Closure and limits

All 291 native evidence hashes were verified. Six installed plugin copies and
four candidate backup directories match the accepted candidate. Temporary gettext
fixtures are absent. A separate read-only Docker query confirms all three owned
native lab projects are stopped. Candidate and r9 archives remain unchanged.
No push, merge, deployment, WordPress.org publication or owner-site installation
was performed by this review.

This is fresh, bounded acceptance for the i18n correction and listed regressions.
The broader historical r9 classic-theme, native Firefox and supplemental lifecycle
matrices were not replayed wholesale; the r9 13-gate verdict is preserved only for
r9. Native targeted UI uses Chromium/WebKit; Linux Firefox belongs to source CI.
Native Safari/VoiceOver, multisite, arbitrary optimizers, new performance numbers,
public update delivery and real WordPress.org language-pack completeness are not
certified. The existing explicit raw-HTML enqueue contract and old 1.1.2 writer
rollback limitations remain unchanged.

Raw gatekeeper records are retained under
`.local/i18n-r10-20261110/gatekeeper/`: `preliminary-readback.json`,
`ci-readback.json`, `native-readback.json`, `docker-closure.json` and `verdict.json`.
The source reports remain under sibling `package-ci/` and `native/` directories;
raw native browser/database receipts remain in their named disposable labs.
