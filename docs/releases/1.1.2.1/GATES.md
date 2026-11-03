# Local editable rollback acceptance gates

This review covers the separately versioned 1.1.2.1 rollback candidate and its
interaction with the unchanged accepted 1.1.4 r8 package. Publication is excluded.

| Gate | Required evidence |
| --- | --- |
| Identity | Exact archive size/SHA, safe paths, 17-file manifest, installed byte equality, source recipe, deterministic rebuild |
| Baseline | Actual public 1.1.2, separate reproducible Core 6.3 terminal-backslash failure, retained negative controls |
| Fresh install | Direct 1.1.2.1 installation on new minimum/current databases, activation and exact installed files |
| File transitions | Public 1.1.2 → r8 → physical 1.1.2.1 → r8, whole-post/critical-option preservation at each file-only boundary, no database restore |
| Real writes | Native editor/REST saves as Administrator, Editor and Author across the cycle; title-only and caption/settings/Advanced edits; reopen validity and literal value preservation |
| Security | Scoped KSES, three post fields, repeated saves, block widgets, unrelated content, malformed/ambiguous recovery guards and native-policy metadata comparisons |
| Plugin Check | Pinned official Plugin Check on supported PHP; actual static/runtime selection and severity review, not exit code alone |
| Assets | No frontend runtime/style without live clocks; one runtime and one inline rule with one/multiple clocks; exact legacy/new runtime bytes; no external plugin CSS; editor preview |
| Operational closure | Reviewer-owned projects stopped, evidence retained, accepted r8 and normal preview unchanged, no publication |

References are the pinned **WordPress 6.3.14 / PHP 7.0.33** and
**WordPress 7.1.4 / PHP 8.3.35** environments. They are reproducible compatibility
references, not a claim about the newest available Core release. The independent
review chooses its own fixtures and records browser engines actually executed.
The author runner is Chromium-only and cannot supply an independent verdict.

The scope preserves exact captions, stored clock settings and supported Advanced
metadata. Native Core filtering remains authoritative for unrelated values;
unknown numeric-key object normalization is not silently redefined. Original
1.1.2 writes on affected Core remain a negative control, never a passing rollback
target. Data already erased from both metadata and HTML requires separate recovery.

The rollback retains widget 0.7.0 and therefore its inherited visual/Intl/resizing
behavior. Widget 0.8.1 fixes belong to 1.1.4. The final-output asset contract has
the same bounded HTML/integration scope as r8. No global-response accumulation,
database migration or persistent module surviving plugin removal is introduced.

LocalWP, TLS, multisite, native Safari/VoiceOver, external cache optimizers,
successful external-font delivery, public update offers, GitHub CI and deployment
are outside this local gate. Exclusions must remain visible in the final report.
Any changed archive requires a new identity and independent acceptance; no prior
GO is transferable to a same-version ZIP with different bytes.
