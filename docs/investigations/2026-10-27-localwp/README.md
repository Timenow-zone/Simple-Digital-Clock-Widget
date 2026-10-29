# Simple Digital Clock: source import and LocalWP investigation

> Historical snapshot of the 1.1.1 import and investigation from 27 October. Subsequent fixes and acceptance: [1.1.2 patch](../../patches/1.1.2/README.md).

Date: 27 October 2026. Plugin: **1.1.1**. JS widget: **0.7.0**. No product fixes were made.

Two reproducible WordPress-wrapper defects were found. The cause of the user's review remains unknown: its text does not provide enough information. The baseline administrator scenario works in all four tested configurations.

## Completed local phase

- 14 unchanged files from the official 1.1.1 ZIP were added to `wordpress/simple-digital-clock/`. They also matched the existing local SVN `trunk` byte-for-byte.
- Provenance and SHA-256 values for the ZIP and every file are retained in [`../../../wordpress/upstream-1.1.1.json`](../../../wordpress/upstream-1.1.1.json).
- The plugin bundle is byte-identical to `dist/0.7.0.min.js`; SHA-256: `1ac6a8d90de417b73afa8e9c93de9603313f7c423c93ad051b87f820f891d368`.
- Widget build paths were preserved. Versions and licenses remain separate: widget — MIT according to `package.json`, plugin — GPLv2 or later according to its header and `LICENSE`.
- Instructions were added to the root README and `wordpress/README.md`, an isolated environment to `tools/wordpress-lab/`, and ignore rules for `.local/`, `.wrangler/`, `.svn/`, and the Python cache.
- Local ZIP `.local/packages/simple-digital-clock-local-import-20261027.zip` was checked: 14 files, the correct root directory, and an intact archive.
- No commits, pushes, user-site installations, or release publication occurred in this phase. SVN was neither updated nor modified; the existing unversioned HTML banner was left unchanged.

## Earlier support topic

Before posting, the [hundredths-of-a-second topic](https://wordpress.org/support/topic/possible-to-display-hundredths-of-seconds/) was checked again: there had been no new messages since YYRI's reply on 21 August.

A [reply by YYRI on 27 October](https://wordpress.org/support/topic/possible-to-display-hundredths-of-seconds/#post-19056210) was published explaining closure due to inactivity. It stated that hundredths were added in 1.1.0, while arbitrary date formatting remains a separate feature request. The user was thanked and invited to ask for further help.

The **resolved** status was confirmed in the WordPress.org interface. This marks the topic as resolved; it is not an administrative block on new messages.

[Status screenshot](topic-resolved.png) · [Published reply](topic-reply.png).

## What the review establishes

Source: [Breaks in LocalWP](https://wordpress.org/support/topic/breaks-in-localwp/), author `bernepe`, 3/5, 27 October 2026. Full text: **“Breaks in LocapWP”**. There were no replies when checked. No reply to this author had been published.

The title points to LocalWP; the typo in the text supplies no additional technical information. Plugin, WordPress, PHP, Local, OS, and browser versions, user role, theme, other plugins, site-creation method, and exact symptom are unknown. This review does not distinguish an activation failure, PHP warning, invalid block, empty preview, missing clock, or routing problem.

## Environment and results

LocalWP was not found in system/user application directories or standard data directories. Existing official Docker images, Apache, and a separate MariaDB 11.4.8 were used. This tests compatible WordPress scenarios; it does not reproduce the Local application itself.

| WordPress | PHP | Activation | Editor, save, iframe preview, frontend | Browser timezone change | Save by Author |
| --- | --- | --- | --- | --- | --- |
| 6.3.2 | 8.2.12 | PASS | PASS | Invalid block | Tag removed |
| 6.8.3 | 8.3.28 | PASS | PASS | Invalid block | Tag removed |
| 7.1.3 | 8.3.35 | PASS | PASS | Invalid block | Tag removed |
| 7.1.3 | 8.4.27 | PASS | PASS | Invalid block | Tag removed |

Browser: headless Chromium. In the baseline scenario, saving succeeds, `wp.blocks.parse` considers the block valid, shadow DOM is present in the editor and frontend, HTTP is 200, and time advances. There were no uncaught JS exceptions. With Google Fonts deliberately blocked, the clock continues to run; the expected network error was recorded separately from product errors.

`WP_DEBUG`, `WP_DEBUG_LOG`, and `WP_DEBUG_DISPLAY` were enabled. PHP logs contain Core warnings about WordPress.org being unavailable and secondary `headers already sent` warnings: the environment intentionally blocks external WordPress HTTP requests. A control `wp_version_check()` with the plugin deactivated reproduced the same warning. The plugin was reactivated after that control.

Existing release checks and ESLint passed; Node tests: **22/22**. All four plugin PHP files and two environment PHP scripts passed `php -l` on local PHP 8.5.10. `block.js` and the browser scenario pass `node --check`. All 14 imported files were verified unchanged.

## Defect 1: saved-block dependence on the browser timezone

**Reproduced 4/4; confirmed by a saved post and a visible Gutenberg message.**

Steps:

1. Create a block with default settings in a browser using timezone `UTC` and save the post.
2. Open the same post in a browser using timezone `America/New_York`.
3. Gutenberg shows `Block contains unexpected or invalid content`; `isValid === false`.

Cause: `block.js:2086` defines `timeZone` with a dynamic `default: browserTz`. WordPress omits an attribute from the JSON comment when its value equals the default. However, `save` (`block.js:3229`) saves `time-zone="UTC"` in HTML. In another browser, the default changes, and the HTML attribute is not read through `source: "attribute"`.

Example saved JSON: `{"caption":"Timezone transfer fixture"}` — `timeZone` is absent. In another browser, the validator expects `time-zone="America/New_York"` but receives `time-zone="UTC"`.

Impact: an invalid-block warning and a risk of changing the time during recovery/resaving. The frontend with the original HTML may continue to work. Copying a site to a computer in another timezone is a possible trigger, but changing the server timezone while keeping the same browser does not itself demonstrate this scenario.

Comparing official 1.1.0 and 1.1.1 `block.js` files showed a difference only in the version comment. This mechanism was not introduced in 1.1.1.

Proposed fix direction, subject to agreement: a stable timezone storage contract and reading the actual value from old markup, with compatibility for existing blocks. Simply replacing the default does not solve migration. Checks must cover existing posts, different browser timezones, explicitly selected values, and saving without unwanted time changes.

[Error screenshot](wp71-timezone-invalid.png).

## Defect 2: clocks disappear when saved by a user without unfiltered_html

**Reproduced 4/4 through the standard WordPress save pipeline.**

Steps:

1. Create a working block as an administrator.
2. Save a copy of the same markup in the `author` role context with standard KSES filters applied.
3. Compare the saved `post_content`.

For the administrator, `unfiltered_html === true` and the tag is preserved. For the author, `unfiltered_html === false` and `<timenow-zone-sdcw>` is removed. Only block comments remain in the content:

```html
<!-- wp:simple-digital-clock-block/widget-block {"hundredths":true,"date":true,"caption":"Clock QA"} -->

<!-- /wp:simple-digital-clock-block/widget-block -->
```

Cause: the plugin saves a custom element as static HTML markup but does not align the permitted tag and its attributes with standard WordPress filtering. After that save, the frontend no longer contains an element in which to render the JS widget.

Impact: the clock disappears after saving. This does not prove the specific reviewer's issue and is not behavior unique to LocalWP. A multisite administrator can also have `unfiltered_html` restrictions, but multisite was not tested in this phase.

Proposed fix direction, subject to agreement: a minimal allow-list for the custom element and required safe attributes, limited to the post context, or separately justified server-side rendering. Do not grant authors `unfiltered_html` or disable KSES. Test saving through REST/editor, unsafe attributes, existing posts, and multisite. Since this defect deletes markup, it is reasonable to fix it first.

## Remaining hypotheses and limits

| Hypothesis | Result |
| --- | --- |
| Plugin fails to activate on PHP 8.2–8.4 | Not reproduced in four configurations |
| Gutenberg iframe preview is missing | Baseline preview works in every tested version |
| Clock depends on an external JS CDN | Runtime loads from the plugin; external Google Fonts failure did not stop the clock |
| Changed save markup in 1.1.1 breaks 1.1.0 blocks | `block.js` differs only in the version comment |
| Local displays warnings hidden in production | A possible class of symptom; the user's specific warning is unknown. The environment's external-network warning was also reproduced without the plugin |
| SSL, incorrect domain, port, Local Router, PHP-FPM | Not tested without LocalWP and the user's parameters |
| Theme/other-plugin conflict, old clock version, cache | Not tested; the review provides no data |
| PHP 7.x/8.5, multisite, Firefox/Safari | Not tested in this investigation |

The distinction between an actual failure and visible warnings is also covered in the [official Local troubleshooting guide](https://localwp.com/help-docs/troubleshooting/troubleshooting-local/). WP_DEBUG flag semantics were checked against the [WordPress documentation](https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/).

Establishing the review's cause requires the exact symptom/error, Local/WordPress/PHP/plugin versions, user role, failure location, and whether the site was created from scratch or migrated. Until those details are available, the discovered defects cannot be attributed to the review.

## Reproduction and rollback

Environment setup: [`../../../tools/wordpress-lab/README.md`](../../../tools/wordpress-lab/README.md). Machine-readable results and original markup: [`evidence.json`](evidence.json). Complete runtime logs and remaining screenshots: `.local/wordpress-lab/`.

After starting the prepared environment:

```bash
set -euo pipefail
node tools/wordpress-lab/smoke.mjs
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml exec -T wp71 \
  php /lab/wp-cli.phar --allow-root eval-file /lab/source/role-probe.php 4
```

In the last command, `4` is the fixture post ID created in this run; for a new setup, use the ID from `.local/wordpress-lab/sites.json`.

Stop the environment with the command below. Data remains in ignored `.local/`; existing containers from other projects are unaffected.

```bash
docker compose --env-file .local/wordpress-lab/env -f tools/wordpress-lab/compose.yaml down
```

This command was run after the investigation completed: `docker compose ps -a` showed no containers for this environment. Data and logs were preserved. Exact Docker image IDs are recorded in `evidence.json`.

Import rollback: inspect `git diff`/`git status`, remove only the new `wordpress/`, `tools/wordpress-lab/`, this report, and the added README/`.gitignore` lines. Original JS source, its dist, and the existing SVN checkout were unchanged in this phase. Patches for the discovered defects await a separate user decision.
