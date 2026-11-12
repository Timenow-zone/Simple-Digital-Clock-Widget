# WordPress asset delivery contract

This describes selected WordPress 1.1.6 RC4 with shared widget 0.8.3.
Current status is **EXACT-ARTIFACT ACCEPTANCE IN PROGRESS**. RC4 corrects
`STANDALONE-P2-01` in shared-runtime initialization. The rejected 0.8.2/RC3
artifacts and their [standalone review](releases/0.8.2/STANDALONE-COMPATIBILITY-REVIEW.md)
remain historical evidence. Final acceptance and production delivery are separate.
It is an implementation contract, not an acceptance or publication record.
All nine retained older versioned minified artifacts, including 0.8.1 and 0.8.2, match
their reviewed baseline bytes.
The owner approved the [opaque override policy](releases/1.1.6/OVERRIDE-POLICY.md)
on 2026-11-12; its exception is separate from default conditional loading.

## Mandatory main-script compatibility gate

This permanent requirement applies to every widget release candidate and every
change to the main widget script, including changes motivated by WordPress.
The widget remains a standalone HTML component as well as a WordPress integration.
Acceptance requires the exact built main JavaScript artifact to pass every cell:

| Environment | Google Chrome | Firefox | WebKit |
| --- | --- | --- | --- |
| Ordinary HTML with an external `<script src="...">` and clock markup | Required PASS | Required PASS | Required PASS |
| WordPress with the same main runtime artifact | Required PASS | Required PASS | Required PASS |

Standalone HTML must work without WordPress, its bootstrap, or candidate-specific
changes to an existing supported embed. Verify markup present before script
execution and markup inserted after it, one and multiple clocks, supported
attributes/JavaScript properties, and removal/reinsertion. Check visible clock
content, expected settings and actual ticking; successful download or element
registration alone is insufficient. A rendering error in one clock must remain
observable without preventing independent healthy clocks from rendering and ticking.

An installed WordPress candidate must pass its native frontend, raw HTML and
dynamic insertion paths, plus the supported editor and preview lifecycles defined below and in the
release acceptance matrix. The bundled main runtime must match the tested
standalone artifact byte-for-byte. Approved runtime URL overrides require their
own compatibility checks and do not replace verification of the default artifact.

Record the source commit, artifact SHA-256, actual browser/channel versions,
operating system, environment, scenarios and results. Run Google Chrome explicitly;
Chromium-only automation is additional engine coverage and must not be labeled a Chrome run.
Label WebKit execution accurately rather than claiming native Safari coverage.
Source-only, mocked or unit tests do not replace real-browser execution of the
exact built artifact in both environments.

A failure or missing required result blocks candidate acceptance, production
CDN promotion and WordPress publication. Passing WordPress tests cannot
compensate for a standalone failure, nor can one browser compensate for another.
After a main-script change, rerun this gate on the new exact artifact and retain
previous results as historical evidence. Existing supported embed behavior must
remain compatible; unchanged API names or preserved old files alone are not proof.
This requirement records an obligation; actual results belong in the candidate's
acceptance record. The rejected 0.8.2 artifact remains NO-GO.

## WordPress ownership

PHP registers stable handles early. A nonempty owned block render requests the
runtime through Core; explicit `SDCW_enqueue_scripts()` calls and ordinary
`wp_enqueue_script('simple-digital-clock')` requests retain that meaning. Existing
registrations, dependencies, localized data, before/after scripts and Core tag
filters remain owned by Core. Late requests are printed through Core when its
normal footer pass has already run. No global dequeue cancels another owner.

Bounded checks inspect only content already passing through `the_content`,
`widget_text_content` or `widget_custom_html_content`. Core's tag tokenizer skips
comments and raw script text; inert templates, noscript and foreign subtrees are
excluded. This conservative detector may defer unusual HTML to the browser
bootstrap. It does not scan stored placements or the complete response and does
not change content bytes. Empty owned output requests nothing. A later filter
can remove output after a real render/use signal has already requested assets;
that is normal enqueue ownership, not a promise of final-DOM absence.

Block-editor content hooks enqueue separately in each Core script registry,
including the iframe registry. Ordinary admin pages remain unaffected. Core's
legacy-widget REST preview calls `wp_head()` inside a complete HTML iframe; its
`REST_REQUEST` plus `IFRAME_REQUEST` path explicitly enqueues the runtime during
`wp_enqueue_scripts`. Ordinary JSON/feed/XML output remains excluded.

## External fallback and registration shell

When no native runtime owner exists, the footer prints inert JSON and the
cacheable external `simple-digital-clock-loader` handle. There is no executable
inline bootstrap. The JSON carries Core-generated runtime markup captured from
a private registry clone. Dependency objects are cloned, pending queues are reset
and concatenation is disabled. The live registry and output-buffer depth remain
unchanged; filters with arbitrary global side effects are outside that isolation.
Native requests skip this capture entirely.

After parsing completes, the bootstrap checks for existing runtime owners before
registering the existing custom-element name with a lightweight
shell, without Preact or a renderer. `customElements.whenDefined()` resolves, so
existing code can create its first clock. A connected callback supplies the use
signal even from a closed shadow root. A microtask checks that the host remains
connected before requesting the main runtime; an immediately removed host does
not start a download. Activation waits for document parsing to finish before
choosing an owner, so a late Core script tag can retain ownership. No polling or
browser API replacement is used.

Widget 0.8.3 installs the Preact adapter into the same shell and host shadow root.
Standalone CDN loading registers and initializes the same component eagerly.
The adapter retains the existing observed attributes, property reflection,
context, slots, hydration and disconnect lifecycle. Element definition and
renderer readiness are distinct; acceptance requires actual rendered clock
content and ticking, never only `customElements.get()`. Initial mount errors are
reported individually without preventing independent healthy hosts from rendering.
Readiness describes the installed renderer, including when all initial hosts fail;
an invalid adapter shape is rejected before installation changes state.

| Case | Main runtime | Other work |
| --- | --- | --- |
| No clock use, inert examples | Zero requests | External bootstrap, inert JSON, lightweight definition |
| Nonempty owned block / explicit request | Normal Core enqueue | Scoped layout, no fallback capture |
| Existing raw clock / later insertion / shadow-first clock | One request on connection | Same host receives renderer |
| First clock after `whenDefined()` | One request when callback connects its clock | No integration changes required |
| Empty output at owned hook | No native request | Fallback remains available |
| Output removed after actual render signal | May remain queued | Recorded as prior use, never globally dequeued |
| Editor / legacy preview iframe | Runtime per document | Parent registry does not substitute for iframe |
| Opaque configured runtime URL/version override | One request even without a clock | Captured runtime executes eagerly without a shell, preserving legacy registration |

Only the final Core main ID and exact bundled 0.8.3 source are selected for
deferred renderer installation. Opaque source/version/tag-URL rewrites use eager
compatibility delivery; this includes same-byte CDN mirrors or query rewrites.
Registration ordinarily is not enqueue: this is an explicitly approved loading
exception, not an assertion that every registration is a use signal. Nonce/SRI
filters that preserve the main ID/source keep default conditional delivery.

## Errors, CSP and deployment boundaries

Initialization parses captured script tags in a detached template to recognize
existing owners even on a clock-free page. Configuration errors remain deferred
until actual use. Activation preserves attributes and attached-data order and
waits for each external script. An
already loaded or recognizable pending runtime keeps its existing owner. Nonce
and SRI attributes are retained; an external-only policy works when the runtime
has no separately attached inline code requiring its own authorization. Consent
types, `data-src`, nomodule and arbitrary wrapper transformations fail explicitly
rather than bypassing the policy.

Activation has a 15-second deadline and emits one `sdcw:load-error` diagnostic on
failure without retry loops. A shell definition is not successful initialization.
Unrelated independently injected widget versions are not universal cooperative
owners; avoid loading multiple versions in one document.

Normal theme footer execution is required for the fallback. Regenerate full-page
caches after updating, and verify served runtime hashes after optimizer/cache
purges. The 0.8.3 shared change requires the separate build and verified CDN
delivery contract in `AGENTS.md`. WordPress.org publication remains deferred
until an explicit owner command. Current evidence and exact candidate status
belong in the [release record](releases/1.1.6/README.md).
