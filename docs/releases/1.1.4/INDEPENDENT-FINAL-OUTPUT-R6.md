# Independent final-output-r6 exact-archive acceptance

**Verdict: GO for this exact local ZIP**, with the explicit limitations and preserved failed attempts below. All17 mandatory local gates PASS; later required GitHub CI is NOT RUN and outside this local verdict. This does not authorize or prove push, merge, deployment, WordPress.org publication, owner-site installation or public delivery.

## Frozen artifact

- Base commit `f75c98776b6b1860e916123915bed8084c879153`; reviewed source is uncommitted, frozen by `frozen-inputs.json` (**344 files**).
- ZIP `simple-digital-clock-1.1.4-final-output-r6-candidate.zip`: **67,979 bytes /16 files**.
- ZIP SHA-256 `f11d33c03be25bdd90ae14198c9b4d7bc9039ddbb89253d39e9b1e5843987989`.
- Manifest SHA-256 `b96fad397aaf4164ba4a54b253087befc36d4d0ef94ea74a962c80c56f6d0e49`.
- Independently verified CRC,safe unique regular paths,exact allowlist,source/manifest/archive hashes and four final installed file sets. Both ZIP copies and all344 frozen files remain unchanged at close. Exact rejected r4b/r5 archives remain preserved; no earlier GO is transferred.

Only installable `includes/simple-digital-clock-assets.php` and `readme.txt` differ from r5. KSES,block.js,widget0.8.1,translations,licenses and dependency notices remain byte-identical. Widget SHA-256 remains `779ff0d3be3a26ca7df8e121513d32a09fc021f985bc0fb9d53bab5e62a8ee25`.

## Resource and response behavior

**372/372 independent frontend resource observations PASS:** full40 fixtures in Chromium/WebKit on both native environments (**160**); full40 in actual LinuxFirefox on both (**80**); classic-theme late content/footer subset (**48**); original independent suppress/escape/keep/empty controls (**16**); expanded independent buffer/raw-text controls (**68**).

The resource checks count actual plugin requests and script tags,zero external CSS,one inline layout block for rendered clocks and zero resources when none survive. Full frontend runners also verify ticking and computed host `display:block`. Coverage includes nested/synced/raw/shortcode/dynamic output,Block/Text/HTML sidebars,mixed/footer output,drafts/inactive widgets,comments/escaped/attribute examples,manual/stripped excerpts,inert templates and raw text. Both previous mandatory blockers are closed for r6.

Independent raw-text probes cover NOSCRIPT/XMP on both native Core versions,real hosts after their closers,quoted fake closing tags and fake script openings. Nested buffers retained/cleaned/escaped,split-tag flushes,late clocks,repeated footer calls and text/JSON responses have expected resource counts,no duplicate assets and no leaked marker. The private analysis copy never changes delivered raw-text attributes. Six additional real feed/REST/robots responses contain no plugin assets/marker; JSON remains parseable. Native resource contracts pass23/23 checks per environment.

Actual LinuxFirefox **153.0** on Linux,Playwright**1.62.1**,was launched from verified trusted image `sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e`. Only public test source/anonymous fixture URLs and read-only public dependencies were mounted; no checkout,.git,private lab state or credentials. `linux-mount-receipt.json` records the boundary.

## Installation, compatibility and checker evidence

Actual runtimes are **WP6.3.14/PHP7.0.33** and **WP7.1.4/PHP8.3.35**,observed from native bootstraps. Two additional clean databases install r6 directly without any predecessor. Six separate public1.1.2 upgrade/physical-file-rollback/reupdate transitions preserve complete post rows and eight critical options,active status and exact installed bytes,with no DB restore/reset. This does not assert every Core transient is immutable. Eight ticking browser smokes span updated/reupdated and clean installations.

Pinned official **Plugin Check2.1.0:29 static+5 actual runtime checks,0 errors/0 warnings**,on supported PHP8.3.35. The checker was not run or credited on unsupported PHP7.0. No checker finding is waived. The single exact-code PHPCS exception at KSES line457 remains explicitly reviewed:argument-free12-frame backtrace for production owned/nested-KSES caller identity,with no broad check,severity or ruleset disabled.

Fresh native compatibility probes pass **538 observations/guards per environment** across Administrator/Editor/Author,17 captions,all three post-save fields,repeated saves,widgets,payload/foreign-context controls and frame-stack cleanup. Each environment also passes **10 recovery guards** and **6 unknown-metadata native-policy comparisons**. These sources were reused as harness only,adapted to newly owned accounts/guards,and executed against the exact installed r6 files. Historical outputs/databases were not reused. Twelve local regression contracts and nine lab safety tests pass.

## Admin/editor evidence and retained failures

Ordinary admin screens have zero plugin scripts/external styles/inline layout. Settings notice JS appears only while the notice is visible. Empty first insertion,ticking preview,draft save/reopen validity and iframe resources have complete positive evidence for all four Chromium/WebKit × minimum/current pairs; every observed editor uses an iframe. The preview document has one inline rule and no external plugin CSS.

The editor uses a **DIV block wrapper with the block class and computed block display**,while its inner custom host has no frontend class and computes inline. Saved/frontend markup puts that class on the host. This unchanged structure is captured in full in `admin-gate-summary.json`. An additional matching-host probe in each iframe computes block,proving the delivered inline selector works. The initial reviewer assertion demanding block display on the editor's inner host exceeded the frontend contract and failed; its exact source/log/empty result are retained,not hidden as a product fix.

The first scoped editor run completed3/4 pairs,but WebKit/current found no inserted host within the authored10s polling window. That attempt remains **FAIL/PARTIAL**. Its transient cause is **unconfirmed**; the first run had no DOM diagnostic capture. Two targeted complete WebKit/current reruns then passed iframe/CSS/first-insert/save/reopen; the confirmation observed the live preview in **327ms**. This positive evidence completes the functional gate without changing the first attempt into PASS or claiming a latency/startup guarantee.

Other preserved harness-only attempts are an incorrect unittest module invocation (direct script later passed9 checks) and an overlong inline-eval log filename (short eval-file later completed identities/teardown). `evidence.json` lists every attempt and exact raw paths.

## Gate matrix

**17 PASS /1 NOT RUN /0 FAIL gates;0 waivers.** The NOT RUN CI row is a separate later repository/release gate,not a mandatory local-artifact gate.

| Gate | Status | Scope |
| --- | --- | --- |
| G01 | PASS | Archive/source/manifest/installed identities |
| G02 | PASS | Metadata/minimums/licenses/PHPCS exception |
| G03 | PASS | Actual supported runtime identities |
| G04 | PASS | Public1.1.2 update / physical rollback / reupdate |
| G05 | PASS | Official pinned PCP2.1.0 |
| G06 | PASS | Focused regression and harness safety guards |
| G07 | PASS | Native bootstrap clock smoke |
| G08 | PASS | Original IND-INLINE-01 regressions |
| G09 | PASS | Independent buffer/raw-text compatibility |
| G10 | PASS | Fresh candidate installations |
| G11 | PASS | Full40 frontend Chromium/WebKit |
| G12 | PASS | Admin/editor/iframe scope |
| G13 | PASS | Classic-theme late content/footer assets |
| G14 | PASS | Actual Linux Firefox |
| G15 | PASS | Native captions/roles/KSES/recovery/unknown metadata |
| G16 | PASS | Real feed/REST/robots responses |
| G17 | PASS | Freeze/teardown/owner-preview preservation |
| G18 | NOT RUN | New required GitHub CI before later merge/publication |

## Limits and preservation

This final-output guarantee costs response-sized PHP memory and delays streaming. Removing/flushing away the plugin buffer,outer transformations afterward,manual script injection,client-only first clocks and external cache/optimizer integrations remain outside this server-rendered contract and need separate compatibility testing. No broad streaming/optimizer certification is inferred from these cases.

Public1.1.2's old writer/Core6.3 irreversible data-loss boundary remains:physical file rollback cannot reconstruct erased caption/Advanced/lock values. No successful unsafe old-writer or universal recovery claim is made. Fresh native probes are scoped; they do not repeat the broad historical ten-context or complete HTTP permission/nonce matrix. LocalWP,TLS,multisite,nativeSafari/VoiceOver,successful real external font transport,owner installs and public delivery are not certified. No new required CI was run; no publication permission is inferred from GO.

Debug logs are not claimed empty:minimum has11 blocked WordPress.org transport warnings;current has14 such warnings plus30 Core legacy skip-link deprecations from synthetic-footer probes. All are classified in `debug-log-review.json`;there are no unclassified PHP warning/fatal/parse errors. They are distinct from the zero-finding Plugin Check result.

Only reviewer projects `sdcw-repro-independent-r6-20261101-a` and `sdcw-repro-independent-r6-clean-20261101-b` were stopped. All four ports are closed;databases,raw results and failures remain. Original block themes are restored and verified. Normal preview `sdcw-repro-debt-20261101-h` remains running (`current`,`db`),checked read only;root's author project was untouched. `final-integrity.json` binds closing source/ZIP/manifest/installed identities,retained archives and teardown. Raw labs remain under `.local/wordpress-repro/independent-r6-20261101-a/` and `independent-r6-clean-20261101-b/`.
