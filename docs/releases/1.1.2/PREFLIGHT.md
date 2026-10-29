# Final checks before the 1.1.2 release

This is a historical snapshot from before publication. The release was subsequently published on 29 October 2026 in SVN r3772502; later checks are documented in the [publication report](PUBLICATION.md).

29 October 2026. **Checks completed. No functional errors were found in the smoke test; Plugin Check completed with 0 ERROR and 7 WARNING. The warnings are analyzed below. Nothing had been published at this stage.** [Machine-readable evidence](preflight-evidence.json).

## Exact artifact

- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- SHA-256: `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8`.
- Installable Git tree: `18512403b0715be777a89e302831a3cc3d5117b6`; source commit `f4a2cae`.
- All 15 files in the sources, final ZIP, and local SVN `trunk` / `tags/1.1.2` match by SHA-256.

Executable code, POT, changelog, and archive were unchanged in this task. The full earlier matrix of 18 336 PHP / 1 309 248 DOM checks applies to the functional ZIP `6f896d42…`. The following is a separate new smoke test of the **exact final ZIP** `7a0e061f…`, not a rerun of the full matrix.

## Final ZIP smoke test

Two isolated contexts: real LocalWP (WP 7.1.3, PHP 8.2.29, nginx/MySQL) and Docker WP 7.2 Beta 2 / PHP 8.3.35. Chromium, Firefox, and WebKit. Fresh fixtures were created by official 1.1.1: 103 clock blocks per native post, Administrator/Editor/Author, a pattern, template part, mixed layout, Custom HTML, active/inactive block widget, and an adjacent Text widget.

| Stage | Assertions | Errors |
| --- | ---: | ---: |
| Baseline 1.1.1 and independent visual references | 8 | 0 |
| Standard upgrade and reading existing blocks | 342 | 0 |
| Title-only, full, and repeated post/widget saves | 300 | 0 |
| Actual Gutenberg Save button and reopening as Administrator/Author | 54 | 0 |
| Physical rollback to 1.1.1 after resaving | 342 | 0 |
| Standard reupgrade with the final ZIP | 342 | 0 |
| Total, including baseline references | **1388** | **0** |

36 browser runs completed. Comparisons covered editor validity and clean state, block content and settings, captions/entities, adjacent blocks, sidebars, frontend DOM, time, clock dimensions, and styles. File operations were checked using hashes of every column in every posts row and exact widget/sidebar/theme/URL/activation settings. The first upgrade preserved all **3999** posts rows; rollback and reupgrade preserved **4035**, including test posts and revisions. The database was not restored.

A new Native HTTPS check was not run; it had already been completed for byte-identical executable code in the earlier matrix. Here Local used its own `http://localhost:10003`; the shared router and certificate trust were unchanged. External fonts/CDN requests were blocked in browsers, as in the main isolated matrix.

## Plugin Check

Official [Plugin Check](https://github.com/WordPress/plugin-check#how-to-use) **2.1.0**, ZIP SHA-256 `6ff4bd2145f3befcf907df158cc466b1649dafed5686de8369907403c3013fc4`, ran on a separate WP 7.1.3 / PHP 8.5.12. Both `update` and standard `new` modes ran, including low severity. 29 static and 5 runtime checks were selected; runtime was loaded through the official `--require=.../plugin-check/cli.php`. An additional read-only hook recorded the selected check classes without changing their results.

| Installed version | ERROR | WARNING |
| --- | ---: | ---: |
| Official 1.1.1 | 0 | 1 |
| Final 1.1.2 | 0 | 7 |

All six new warnings are `WordPress.PHP.DevelopmentFunctions` in `includes/simple-digital-clock-kses.php`:

- Five `error_log` calls at lines 90, 143, 156, 211, 217. They log only fixed messages on parsing/encoding errors. Captions, HTML, arguments, stack traces, and secrets are not logged. These are failure diagnostics that preserve the original input; the code was not changed to suppress the heuristic.
- One `debug_backtrace` at line 307. It identifies the plugin's own KSES invocation using `DEBUG_BACKTRACE_IGNORE_ARGS`, a maximum of 12 frames, and no output. Function names and object identity are inspected. Replacing it requires preserving the already verified nested sanitization behavior.

The inherited `EnqueuedScriptsScope` warning concerns loading runtime JS across all frontend contexts. It is identical in 1.1.1 and 1.1.2; changing enqueueing requires separate testing of raw HTML and dynamic widgets.

These are documented contextual exceptions, not a “0 warnings” result. No justification was found for changing verified logic solely to satisfy this heuristic. Experimental and AI checks were not enabled. PCP itself declares Tested up to 7.0, but actually completed the checks on the stated WP 7.1.3. External WordPress HTTP remained blocked; this run does not validate public delivery.

The first attempt stopped before checks because `--user` was not applicable to PCP's temporary runtime tables. The driver error and all retries were retained separately. Correct runs completed without this argument. Original posts, all persistent options, tables, widgets, and activation were preserved; temporary PCP tables/drop-in and the checker were removed normally. The final ZIP was restored exactly according to the manifest.

## Remote SVN and release scope

Read-only check at `2026-10-29T07:17:25.957888+00:00`: HEAD **r3772260**, trunk unchanged relative to **r3771402** (0 paths), last change **r3659668**. Trunk remained at 1.1.1; all 14 files matched the official ZIP. Remote tag **1.1.2 was absent**.

Each local target contained exactly 15 files, with five expected differences: `block.js`, new `includes/simple-digital-clock-kses.php`, `languages/simple-digital-clock.pot`, `readme.txt`, `widget_init.php`. Tag status was `A +`, copy-from `trunk@3771402`, and properties were unchanged. The unrelated unversioned `assets/` banner was preserved and excluded from the future commit. Only the prepared `trunk` and `tags/1.1.2` were in the proposed publication scope.

No SVN update/commit/copy or Git push was performed. Remote state can change: immediately before authorized publication, repeat the reads and verify the commit scope. This result does not authorize publication.

## Completion and remaining limits

The task's own LocalWP/beta83/Firefox and separate PCP db/wp85 environment were stopped. Their loopback endpoints were closed; data and volumes were preserved. Other Local sites and beta85 were neither started nor stopped. All evidence is retained in `.local/release-final-112/` and `.local/wordpress-lab/release-smoke-112/`.

Separate checks remain after a future publication: public version/stable tag, extracted public ZIP files against the manifest, an update offer, and a control upgrade through WordPress.org on an isolated site. The reviewer's site, final WP 7.2, and arbitrary third-party combinations have not been validated. `Tested up to: 7.1` was preserved.
