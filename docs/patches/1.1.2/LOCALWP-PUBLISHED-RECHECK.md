# Rechecking public 1.1.1 in real LocalWP

28 October 2026. **Two known defects in public 1.1.1 were reproduced in native LocalWP; 1.1.2 passes those scenarios on the same test site. The cause of the particular review remains unknown.** An existing manual Locale-input defect was also confirmed in both versions. Product source and the release ZIP were unchanged during this check. Nothing has been published publicly.

## Complaint source and verified versions

The current public version on the [plugin page](https://wordpress.org/plugins/simple-digital-clock/) is 1.1.1. The [review by bernepe](https://wordpress.org/support/topic/breaks-in-localwp/) still contains only “Breaks in LocapWP”. At the time of rereading, there was one reply—our request for details—and no new information from the reviewer. Their versions, role, site settings, and exact symptom are unknown.

A fresh official `simple-digital-clock.1.1.1.zip` was downloaded, SHA-256 `b6afe710826e74370889773f0fb600a89614a18058b4f264ca12fc7df4f97c10`. Reinstallation through the official Local CLI produced exactly the archive's 14 files. An additional 1.1.1 deactivation/activation control passed.

For comparison, the unchanged local **1.1.2** candidate was installed, SHA-256 `834b1757263a7b9536990a9c64d9c698d73c3747a2a5af755a3e28d0d9e6b352`. All 15 installed files and `wordpress/simple-digital-clock/` source files match the previously accepted version. This is 1.1.2, not a separate 1.2 release.

## Environment and verification method

- Native Local **10.2.0**, macOS; the application has CFBundleVersion `10.2.0.20261015.1`.
- Only the dedicated site `SDCW-112-Isolated-20261028`, ID `ujo3kaSGV`, `http://localhost:10003`.
- WordPress **7.1.3**, PHP-FPM **8.2.29**, nginx **1.26.1**, MySQL **8.4.0**, **Twenty Twenty-Five** theme, single-site.
- Simple Digital Clock is the only active regular plugin. An isolation MU-plugin blocks mail and external WordPress HTTP and registers a test sidebar. This is not a completely unmodified Local installation.
- Browser timezones: UTC, America/New_York, Asia/Tokyo. WordPress timezone: UTC.
- Separate empty posts were created. Block insertion, caption input, Locale/Time Zone list selection, toggles, loopback publication, and subsequent editing used real Gutenberg clicks/input through Playwright Chromium. Content and validity were additionally read through REST and the editor store; blocks were not written by artificially replacing `post_content`.
- Independent reading of candidate posts, the full attribute set, and frontend were checked with WebKit in Asia/Tokyo. Firefox and the extended matrix for this same ZIP belong to the [previous acceptance](WIDGET-FALLBACK-VERIFICATION.md) and were not rerun here.

## Comparison results

| Scenario | Official 1.1.1 | Candidate 1.1.2 |
| --- | --- | --- |
| Administrator: insert clocks, publish, reopen | Works | Works |
| Administrator/Editor: caption, language from the list, timezone, seconds, hundredths, date, subsequent editing | Works | Works; all attributes retained |
| Author: insert the same block and publish | Custom element removed; block is invalid after reopening, no clock on frontend | Tag, settings, and caption retained; editor and frontend work |
| Create clocks with the default timezone in UTC, open the post in America/New_York | Visible Gutenberg warning; `isValid=false` | Valid block retaining UTC; reading does not change content |
| Create clocks in America/New_York, open in Asia/Tokyo | Visible Gutenberg warning; `isValid=false` | Valid block retaining America/New_York |
| Open a UTC post created in 1.1.1 after installing 1.1.2, using another timezone | — | Valid without changing stored content |

In a working scenario, frontend returns HTTP 200, the custom element has a shadow DOM and nonzero size, the caption is rendered as text, and `<clock>` in the caption does not create an HTML element. Time advances when seconds are enabled. Chromium has no uncaught JS exceptions. UI resaving retains every attribute except the intentionally changed caption.

Final run: **68/68 checks of expected 1.1.1 behavior**, **76/76 for 1.1.2**, **20/20 independent WebKit checks**. The number 68 does not mean the public plugin is correct: it includes assertions specifically confirming tag removal and invalid blocks. All attributes before/after resaving were additionally compared using saved JSON: four working 1.1.1 posts and five 1.1.2 posts matched.

Neither main defect is specific to LocalWP: both were previously reproduced in Docker. This check confirms their presence **also in real LocalWP**. They cannot be linked to this reviewer without a reply. If the tag was already removed in 1.1.1, an upgrade does not itself restore the lost markup; an earlier revision or block reinsertion is needed. The Author comparison used equivalently configured new blocks.

## Additional defect found: manual Locale input

**Confirmed in 1.1.1 and 1.1.2, not fixed.** This is existing UI behavior, not a new patch regression.

1. Select `Українська` in Locale: the attribute becomes `uk`.
2. Enter the valid BCP-47 code `uk-UA` and press Enter.
3. The field returns to `Українська`; the attribute remains `uk`. After normal publication, HTML also stores `locale="uk"` rather than the typed `uk-UA`.

`Intl.getCanonicalLocales('uk-UA')` itself accepts this code. The predefined language list works; manually entering a code absent from it does not pass that code to the block attribute. This contradicts the help text “Select or enter a BCP-47 tag”. The Locale control in `block.js` is byte-for-byte identical between the public version and the candidate; its hash and excerpt were saved separately. No product changes were made during this investigation. This remains a separate open defect for further work; the current patch must not be described as fixing all plugin settings.

## Controls, logs, and preservation

For Author, Gutenberg receives 403 on its auxiliary `tags/categories?context=edit` read. A check with the plugin disabled returned the same `rest_forbidden_context`; these are standard Core permissions, not a clock failure. These responses were retained separately from unexpected REST errors.

The first exploratory run, `published-chromium.json`, returned 55/68 and is retained without overwriting. It expected `Europe/Kyiv` even though the menu item stores the valid IANA alias `Europe/Kiev`, entered a language code instead of selecting an option, searched for the warning outside the iframe, and classified standard 403 responses as errors. After identifying those causes, new posts were created and run `v2` explicitly selected options and checked the warning inside the iframe. Manual language input was isolated as a separate reproduction rather than declared fixed.

There are no new PHP fatal/parse errors or messages from plugin files. `debug.log` contains eight new Core `wp_version_check/wp_update_plugins/wp_update_themes` warnings about WordPress.org being unavailable with external HTTP blocked. The nginx log has no new errors; PHP-FPM recorded only process shutdown. Logs were retained from their original byte offsets.

Before replacement, an SQL backup and content hashes were saved. All original **430 post_content rows** and block-widget content were preserved; ZIP replacements also left every record existing at each replacement unchanged. The final count is 477 rows including new test posts/revisions. After verification, the exact 1.1.2 candidate was left on the site and the site was stopped. The database was neither restored nor reset.

Native HTTPS/Site Domains, importing the reviewer's site, their theme, plugins, OS, settings, and unknown Local/PHP versions are outside this check. Information about their actual failure remains insufficient.

## Evidence and reproduction

- [Summary manifest and evidence hashes](localwp-published-evidence.json).
- Runner: `tools/wordpress-lab/localwp-published-recheck.mjs`.
- All original results, review HTML, fresh ZIP, screenshots, SQL backup, controls, and helper scripts: `.local/wordpress-lab/published-localwp-recheck/`.

Runner syntax check:

```bash
set -euo pipefail
node --check tools/wordpress-lab/localwp-published-recheck.mjs
```

The actual sequence was `localwp-published-recheck.mjs published chromium`, then `candidate chromium`, then `candidate webkit v2 read`; the default suffix is `v2`. These are sequential stages on a prepared, running site, with ZIP replacement between the first two, not a ready-to-run reproduction command set. The runner does not overwrite existing evidence files. A new UI run requires another suffix and fresh empty test drafts. These commands must not target user sites.
