# CLASSIC-HTML-P1-01: Classic Editor removes clock HTML

## Confirmed defect and preserved baseline

TinyMCE 4.9.11 treats `timenow-zone-sdcw` as an unknown element. Opening existing
clock HTML in Classic Editor Visual mode, switching to Text, and clicking native
Update removes the tag from the persisted post. This was independently reproduced
on public 1.1.5 and exact RC9 during the additional acceptance of 2026-11-13.
It is an inherited content-loss defect, not a regression introduced by RC9.

The paired native-save controls used separate disposable posts, initial server
textarea captures, reopen, and database readback. Both stored
`<!-- wp:html --><!-- /wp:html -->` afterward. The original upgrade fixture was
not exposed to the destructive save. Evidence is retained in
`.local/rc9-extra-20261113/real-sites/REPORT.md` and its sealed inventory.

RC9 remains immutable: ZIP SHA-256
`f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909`,
73,184 bytes, 17 files. Its earlier results and limitations are not rewritten.

## Minimal WordPress correction

[RC12](../releases/1.1.6/RC12.md) adds the clock to the ordinary and teeny TinyMCE
configuration through `tiny_mce_before_init` and `teeny_mce_before_init`.
The inline custom-element rule preserves surrounding paragraphs. The editor
plugin extends the inherited span schema with the supported runtime attributes,
preserving native global attributes and their constraints. Both the attribute
map and its order are cloned before modification so foreign spans are unchanged.
The editor also supports `prefers` and `time-zone-name` for unfiltered HTML;
server KSES keeps its existing narrower policy for filtered users. Server value
validation, permissions and content filters remain unchanged.
Other editor settings and external plugin entries are retained. Unsupported
configuration types retain their original settings and emit a fixed-code
`sdcw_editor_diagnostic` action.

Core's dynamically initialized Text widgets bypass these PHP filters. The
`print_default_editor_scripts` action loads the same editor helper with shared
PHP configuration. Its `wp-before-tinymce-init` listener composes the external
plugin map and custom-element list before Core initializes the editor. Ordinary
frontend pages do not load this editor helper.

Configuration alone is insufficient: TinyMCE still removes a
clock when it is the only content inside a paragraph, div, list item, or deeper
container. A small editor-only TinyMCE plugin extends the live schema's
non-empty-element map during `PreInit`, for the clock name only. It does not
replace TinyMCE's default list, inject padding into the clock, disable HTML
cleanup, or load the public clock runtime. The shared runtime and its delivery
logic are byte-identical to RC9.

The WordPress hooks are documented in the official
[ordinary editor](https://developer.wordpress.org/reference/hooks/tiny_mce_before_init/)
and [teeny editor](https://developer.wordpress.org/reference/hooks/teeny_mce_before_init/)
references. Behavior is verified against WordPress's actual TinyMCE 4.9.11;
modern TinyMCE configuration syntax is not assumed compatible.

## Rejected intermediate candidate

[RC10](../releases/1.1.6/RC10.md) preserved clock tags but removed native global
attributes, including IDs, and missed the dynamic Text widget path. Independent
native Classic-block checks exposed this incomplete fix. Its ZIP, manifest and
raw failed results remain immutable. RC12 must receive fresh exact-artifact
acceptance; RC10 passes cannot be transferred to it.
RC11 was superseded by RC12 to supply the existing mtime version explicitly
to the WordPress enqueue API and resolve Plugin Check's MissingVersion warning.

## Acceptance boundaries

Required new evidence includes exact installed-package identity, native
Visual/Text switches and saves, bare and nested empty hosts, single/multiple
different clocks, Unicode/entities/backslashes, unrelated markup, administrator
and KSES-filtered author, unsafe-attribute controls, default/custom editor
configuration, native Text widgets, explicit teeny `wp_editor` contexts,
upgrade and files-only rollback/re-update.

Independent regression checks cover Gutenberg, native legacy previews, empty
and used public pages, standalone HTML and WordPress in actual Google Chrome,
Firefox and WebKit, and Plugin Check. Permanent tests must reproduce the old
normalization failure and exercise the real TinyMCE parser/serializer with the
new PHP configuration and editor plugin. Functional results and uncaught
browser errors must be reported separately.

This correction prevents future removal; it cannot reconstruct clock markup
already deleted from a saved post. Recovery of earlier loss requires an intact
revision or backup. It introduces no database migration. Replacing plugin files
with frozen RC9 is reversible, but its Visual-mode defect returns; avoid that
save path during rollback. No live preview inside the Classic Editor is added.

The candidate, local acceptance, required hosted checks, merge, CDN delivery and
WordPress.org publication remain separate gates. The owner authorized local
fixing and testing only; no merge, deployment or publication is performed here.

## Final local outcome

The [RC12 report](../releases/1.1.6/FINAL-ACCEPTANCE-RC12.md) records 84 native
data-preservation cases, 60 ten-plugin frontend cases, 132 separate general
regression workflows, all six mandatory main-script cells and Plugin Check with
zero findings. Strict page-error failures and Firefox Classic text-entry limits
remain documented with plugin-disabled controls. The local correction is
verified; this is not an unconditional full-release or all-admin-functions GO.
