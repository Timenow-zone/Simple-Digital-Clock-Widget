# WordPress 1.1.6 RC9 candidate

This WordPress-only candidate fixes Gutenberg gradient clearing and stale Time Zone selection. The main widget runtime and loader remain byte-identical to RC5. No database migration, block schema change or save-markup change is included.

The native gradient Clear action now persists an explicit empty background while the Core GradientPicker receives undefined. Clear Gradient and Clear Colors use the same representation. Clearing only the gradient preserves the solid color. This also prevents the inspector crash when reopening a previously cleared block in the updated editor.

Time Zone allows Enter to select only a current active option in an open suggestion list. An unmatched query retains the committed zone and displays translatable help. Enter on a closed list is a no-op, preventing the hidden UTC selection found during independent RC8 acceptance. Arrow navigation, valid aliases, Reset, Auto Timezone and IME have separate acceptance coverage. Synthetic composition events do not prove physical operating-system IME behavior.

| Artifact | Identity |
| --- | --- |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc9.zip` |
| ZIP SHA-256 | `f2f2f1856093c34ec7bd56b02c920de26c56c1ad78de700e4a20244a40b45909` |
| Size / files | 73,184 bytes / 17 files |
| Frozen manifest | [manifest-rc9.json](manifest-rc9.json) |
| Main 0.8.4 SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Loader SHA-256 | `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |
| Source checkout base | `7f79a03df112e4cb84f2ed4f7de21896337e6bc0` |

The manifest identifies the dirty checkout by all 17 file hashes; the checkout base alone does not identify the candidate. Four package files differ from RC5: `block.js`, `widget_init.php`, the POT and `readme.txt`. Only `block.js` and `readme.txt` differ from RC8. The frozen manifest retains its creation-time `NOT_RUN` value; acceptance is recorded separately rather than rewriting the frozen subject.

RC6 was superseded during source review. RC7 is rejected for passing an empty string directly to GradientPicker. RC8 is rejected because native Escape followed by Enter changed Tokyo to UTC while the same RC5 probe retained Tokyo. Their archives, manifests and failed attempts remain immutable. A source-intercepted RC9 preflight passed, but it is explicitly excluded from installed-candidate acceptance.

Backward compatibility must distinguish stored data from old editor behavior. RC5 itself crashes when its own cleared-gradient document is reopened and Background Color is expanded. Native files-only rollback of an RC9-created cleared document also reproduces the inspector crash in both exact RC5 and public 1.1.2 on Core 6.3.14 / Google Chrome, with both blocks valid before the panel opens and no post write. The updated editor normalizes that value; an immutable older package does not gain the fix during rollback. A nonempty replacement such as a duplicated solid color would break subsequent independent color editing and is not used to conceal this limitation.

The [final scoped acceptance](FINAL-ACCEPTANCE-RC9.md) and [machine-readable receipt](acceptance-rc9.json) record fresh execution and the two explicit compatibility/navigation boundaries. Fresh local acceptance is collected under `.local/gutenberg-fix-20261112`. No result from another candidate establishes RC9 acceptance. Publication, merging, WordPress.org distribution and CDN deployment remain unauthorized. Remote Repository checks and Browser tests must still pass before any authorized merge; local results do not substitute for those checks. The unchanged widget 0.8.4 production CDN delivery remains pending.
