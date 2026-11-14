# WordPress 1.1.6 RC7 — rejected Gutenberg candidate

RC7 is rejected and retained unchanged. Native Gutenberg checks reproduced disappearing inspector controls after gradient clearing. Core's GradientPicker received an empty string, whose parsed gradient AST is absent. The failure was not exposed by callback-only unit contracts.

The next candidate separates storage from the Core control value: persisted JSON retains an explicit empty gradient for older readers, while GradientPicker receives undefined for its cleared UI state. No serializer/schema or main-runtime change is required.

- ZIP: `.local/packages/simple-digital-clock-1.1.6-rc7.zip`.
- SHA-256: `72ae0b525f1b99043b19aa523ce7305bc1246edaf1a0b1bf8a122857c25da3ab`.
- Frozen file map: [manifest-rc7.json](manifest-rc7.json).
- Main runtime 0.8.4 and loader are unchanged from RC5.
- Original failing native runs are retained under `.local/gutenberg-fix-20261112/regression/controls/rc7-primary-*`.
- Any successful runtime-only checks against RC7 do not establish Gutenberg acceptance or acceptance of another ZIP.
- No publication occurred.
