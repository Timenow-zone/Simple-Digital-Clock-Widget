# WordPress 1.1.6 RC8 — rejected Gutenberg candidate

RC8 is rejected and retained unchanged. Independent native acceptance found that selecting Tokyo, focusing Time Zone, pressing Escape, then Enter and Tab committed UTC from a closed suggestion list. The same native probe retained Tokyo on exact RC5, so this is treated as an RC8 regression. Evidence: `.local/gutenberg-fix-20261112/independent/rc8-collapsed-native/RESULT.json` and `rc5-collapsed-native/RESULT.json`. Passing runtime and other controls checks do not override this failure.

This WordPress-only revision attempted to fix two inherited Gutenberg inspector defects: native GradientPicker Clear ignored its unset value, and Enter after an unmatched timezone search could commit a stale UTC suggestion.

Gradient clearing now stores an explicit empty background for older readers while passing undefined to Core's cleared GradientPicker. Built-in Clear, Clear Gradient and Clear All Colors use the same storage representation. Clearing a gradient retains its solid color. The block schema, save markup and REST metadata handling are unchanged.

Time Zone verifies Core's active option in the current dropdown before allowing Enter to reach the suggestion handler. This preserves Core's matching and label/value alias behavior instead of reimplementing its search normalization. Unmatched Enter retains the selected zone and shows localized help. Query changes, successful selection, Escape and leaving the search clear the transient message. Reset, Auto Timezone and IME require explicit browser acceptance.

| Artifact | Identity |
| --- | --- |
| ZIP | `.local/packages/simple-digital-clock-1.1.6-rc8.zip` |
| ZIP SHA-256 | `21280088cdb957d1e0454f00791fca5ea8c3565cf01618fcd22bec52e6f2512f` |
| Size / files | 73,151 bytes / 17 files |
| Frozen manifest | [manifest-rc8.json](manifest-rc8.json) |
| Main 0.8.4 SHA-256 | `974ee99ae21ed2b810edcad62fd6a5d137a4f0db48b6bc6c4841d3f648b0d98b` |
| Loader SHA-256 | `7187b9ee36e188ea87d76fcd56e82300ad8f3685bd34fc2136aa35dae26cb124` |

Only `block.js`, `widget_init.php`, `languages/simple-digital-clock.pot` and `readme.txt` differ inside the package from RC5. Runtime source, immutable versioned bundles and the WordPress loader are unchanged. The manifest's `shared_runtime_changed: false` is explicitly relative to RC5's archive hash; it does not claim that upstream widget 0.8.4 has been delivered to production.

New inspector callback contracts are included in Repository checks. The mandatory standalone HTML/WordPress Chrome/Firefox/WebKit gate passed against this ZIP, but the independent keyboard failure blocks candidate acceptance. Local evidence is retained under `.local/gutenberg-fix-20261112`; no acceptance verdict is transferred from RC5, RC6 or rejected RC7.

Publication, merging, WordPress.org distribution and CDN deployment remain unauthorized. Prior candidate ZIPs/manifests and published runtime URLs remain immutable. Required remote Repository checks and Browser tests are not bypassed by local execution.
