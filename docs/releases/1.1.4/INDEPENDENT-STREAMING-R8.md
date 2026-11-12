# Independent streaming-r8 exact-archive acceptance

**GO for the exact local installable ZIP.** All18 mandatory local gates PASS; the separate later CI/public-delivery gate is NOT RUN. This is not repository,merge,publication,owner-install or production-delivery authorization. Initial failures and test qualifications remain explicit below.

## Exact input and closing identity

- ZIP `simple-digital-clock-1.1.4-streaming-r8-candidate.zip`: **69,772 bytes /17 files**.
- SHA-256 `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37`.
- Manifest SHA-256 `5e250260b65e2980a1704698e2f537af06da5ef8fe536c498400cfe8b2921deb`.
- Base commit `f75c98776b6b1860e916123915bed8084c879153` plus uncommitted source. **367 current nonignored files,one tracked CSS absence,no symlinks** were frozen. Every hash and the complete path set remain unchanged at close.
- Safe unique regular ZIP entries,CRC,allowlist,source/manifest/archive bytes and all four final installed file sets match. Accepted r6 and rejected r7 ZIPs remain preserved. No earlier verdict transfers to new bytes.

Widget0.8.1 remains byte-identical (`779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`). KSES,block.js,licenses and dependency notices match accepted r6. The new lexical observer is a separate PHP file; no shared widget/CDN change is credited or required by these unchanged bytes.

## Functional/resource results

**344 unique positive functional/resource cases:** main42 fixtures ×2 references ×3 engines (**252**),additional actual literal SELECT/SCRIPT pairs across3 engines (**12**),classic-theme subset (**48**),independent native streaming/lifecycle cases (**32**). Chromium/WebKit and actual LinuxFirefox**153.0** were executed against newly owned sites. Full runners count real runtime requests/tags,zero external plugin CSS,one-or-zero inline layout,frontend host block display and ticking. The streaming subset also checks boundary/media/lifecycle behavior and live rendering. Native frontend checks pass23/23 per reference.

The rejected r7 valid-HTML bug is genuinely discriminated: independently seeded pages use `JSON_UNESCAPED_SLASHES` plus `wp_slash` to retain literal `</select>` inside JavaScript. Native stored bytes equal intended input; negative/positive DOM and resource counts are0/1 in all3 engines. The same exact stored input is RED for the archived r7 parser and GREEN for r8. End-template and empty-final insertion are separately proven in installed native WordPress,including a negative empty-final case. CLEAN after delivered bytes and a split prefix retains correct parser history.

Actual `wp_enqueue_scripts` and footer18 callbacks register loader attributes,inline counters and localization before the plugin's footer19 capture. Controlled strict script nonce + `wp_add_inline_script` cases pass on both references; localization is separately preserved. Core6.3 localization extra does not receive the same inline nonce hook,so no blanket strict-CSP claim is made.

Chromium genuinely executes the frozen runtime before a delayed host closer,with correct final clock and single assets. WebKit final rendering/resources are correct but its definition was12–25ms after the closer in the retained experiments,including padding,instant exact-byte delivery and no interception. Eager WebKit execution was **not observed**,its cause is unconfirmed,and the original timing assertions remain failed preconditions rather than being rewritten as PASS. The contract does not promise browser scheduling.

## Streaming and performance evidence

Independent native HTTP tests deliver initial client bytes before a controlled1s pause on both references. Eight8MiB and eight32MiB text/attribute/comment/script profiles show **0 additional allocated peak** and **4 retained observer string bytes** for this fixture; two native32MiB payload runs are byte-for-byte intact with a64KiB bounded client reader. JSON/text direct capture responses are exact; six actual feed/REST/robots responses contain no plugin output.

These results establish no page-sized retained observer state; they do **not** claim constant whole-request memory. Core/themes may retain data,PHP can supply a large chunk,and inserting tags creates a temporary replacement string. Root's controlled benchmark was not rerun by this reviewer: its preserved **5,520** rows were independently parsed and hashed,with unique matching client/server IDs,HTTP200,null PHP last-error and zero post-flush buffers throughout. Current/classic2MiB/one-clock median TTFB is124.93ms buffered r6 versus71.33ms r8 (legacy69.49ms). Same21-query pairs retain about53.35ms benefit; current/block retains about57.79ms. **431/1,620 matched groups have unequal query counts**; cause of current21/25-query variation remains untraced. Whole-request peak memory is not materially reduced; small latency differences are not a causal or production-capacity claim. See `performance-independent-audit.json` and root's separate performance report/erratum.

## Installation, persistence and compatibility

Actual environments are **WP6.3.14/PHP7.0.33** and **WP7.1.4/PHP8.3.35**. Two new databases install r8 directly without a predecessor. Six actual public1.1.2 update/physical rollback/reupdate transitions preserve full post rows,eight critical options,active status and exact files,without DB restore/reset. Separate public frontend views preserve the same saved-state boundary after deliberate fixture correction. Test seeding,security/editor writes and literal-control additions are separately identified; no claim every Core transient or the entire testing database stayed immutable is made.

Official pinned **Plugin Check2.1.0:29 static+5 actual runtime checks,0 errors/0 warnings**,on supported PHP8.3.35. It was not run or credited on unsupported PHP7.0. The exact one-line PHPCS exception remains reviewed:argument-free12-frame backtrace for owned KSES caller identity,no broader rule/severity disablement. Native scoped compatibility per reference passes **538 observations/guards,10 recovery guards,6 unknown-metadata comparisons** across three roles,caption corpus,three save fields,repeated saves,widgets,payload and foreign-context controls. This is not a fresh full HTTP permission/nonce or historical ten-context certification.

Admin/editor positive evidence covers all4 engine/reference pairs:ordinary admin0assets,visible-only notice JS,semantically empty first insertion,iframe live preview and one inline rule,matching-host CSS,save/reopen validity. Classic48 cases pass and original block themes are restored. Linux uses only public script/anonymous URLs plus read-only public dependencies; no checkout,.git,private lab state or credentials were mounted.

## Preserved harness defects and attempts

- The **frozen repository seed is defective**: `wp_insert_post` without `wp_slash` removed JavaScript JSON escapes. Initial full42 run stopped with `Unexpected identifier 'wp'` after39 earlier cases. Raw stored rows and before/intended/after bytes are retained. Only six reviewer-owned fixture posts were corrected; affected/remaining coverage was completed without suppressing errors or editing source. The default JSON slash escaping also masked the literal regression,so separate native literal controls were added. The repository harness still needs the documented test-only `wp_slash`/`JSON_UNESCAPED_SLASHES`/stored-byte guard correction after freeze closure.
- Initial CSP fixture changed only the first script in Core's combined loader tag; it was corrected to handle all scripts and to distinguish legacy localization nonce behavior. Exact failed fixture,response and timeout are retained.
- Earlier WebKit eager-execution assertions are retained as unmet test preconditions,with final compatibility positive and no eager-execution claim there.
- A reviewer-added empty-canvas DOM readiness requirement failed before any insertion. That noncontract precondition was removed; native post/store readiness,preinsert frame records and actual insertion/CSS/save/reopen checks remained. No candidate fix occurred.

Thus the verdict is scoped artifact acceptance,**not an all-green claim for every original attempt or for the uncorrected frozen test harness**. All failed/partial outputs remain; `evidence.json` links them precisely.

## Gate matrix

**18 PASS /1 NOT RUN /0 failed mandatory local gates;0 waivers.**

| Gate | Status | Coverage |
| --- | --- | --- |
| G01 | PASS | Exact source/archive/installed identity |
| G02 | PASS | Metadata/minimums/licenses/diagnostic exception |
| G03 | PASS | Actual minimum/current runtimes |
| G04 | PASS | Six update/physical rollback/reupdate transitions |
| G05 | PASS | Two genuinely fresh direct r8 installs |
| G06 | PASS | Official PCP2.1.0 static/runtime |
| G07 | PASS | Focused/source guards |
| G08 | PASS | Full42 native frontend all three engines |
| G09 | PASS | Actual literal SELECT/SCRIPT regression |
| G10 | PASS | Native streaming boundary/lifecycle/browser behavior |
| G11 | PASS | Native media guards and data responses |
| G12 | PASS | Independent early delivery and bounded retained state |
| G13 | PASS | Controlled performance evidence audit |
| G14 | PASS | Admin/editor/iframe |
| G15 | PASS | Classic late/footer output |
| G16 | PASS | Native caption/role/KSES/recovery/unknown metadata |
| G17 | PASS | Read-only frontend saved state |
| G18 | PASS | Close freeze/owned teardown/preservation |
| G19 | NOT RUN | New required GitHub checks and public delivery |

## Limits and preservation

Supported input is ordinary valid HTML with scripting enabled; the observer is not a sanitizer/full tree builder. Foreign SVG/MathML,malformed repair,unclosed raw text through EOF after a clock,observer removal/outer transforms,manual asset insertion,client-only first clocks and external cache/optimizer integrations remain outside this scoped contract. LocalWP,TLS,multisite,nativeSafari/VoiceOver,real successful external fonts,owner installations and public delivery are not certified. No new GitHub CI,push,merge or publication occurred.

Public1.1.2's old writer/Core6.3 irreversible caption/Advanced/lock loss remains:physical file rollback cannot reconstruct erased data. No unsafe old-writer passing or universal recovery claim is made.

Debug logs are not claimed empty:classified Core blocked-WordPress.org transport warnings and synthetic-footer legacy skip-link deprecations remain;there are no unclassified PHP warnings/fatal/parse errors. Only `sdcw-repro-independent-r8-20261102-a` and `sdcw-repro-independent-r8-clean-20261102-b` were stopped. Four ports are closed,databases/raw evidence/failures remain,owner preview `current`+`db` is running,and author/performance projects were untouched. `final-integrity.json` closes the full367-file source freeze and exact ZIP/manifest/installed identity.
