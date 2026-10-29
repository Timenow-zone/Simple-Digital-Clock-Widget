# Review history of candidate 431b9157

**The issues described below have been fixed in a new local candidate.** See the [current fix verification](VERIFICATION.md). This report and its line numbers apply only to the earlier build with SHA-256 `431b9157…`.

Date: 27 October 2026. The unchanged ZIP with SHA-256 `431b9157d557f525727738b8164d85e416cdaf979a73239063026826c86f283b` was reviewed.

**The earlier candidate reviewed here required changes: two data-preservation issues were confirmed.** The previous passing checks remain valid for their scenarios, but their coverage was insufficient for a general backward-compatibility conclusion. Product source, version and ZIP remained unchanged during that review. Only tests and documentation were added.

## P1. Saving a clock changes the JSON of a neighboring block

Location: `includes/simple-digital-clock-kses.php:124–130`, called from `wp_insert_post_data` at line 149.

When an old clock has no `timeZone` in its JSON—a normal default in 1.1.1—the filter adds the field, then calls `serialize_blocks()` for **the entire post**. The WordPress PHP parser decodes objects as associative arrays. During subsequent serialization, empty objects and objects with sequential numeric keys become arrays:

```json
{"options":{"0":"one","1":"two"},"empty":{}}
```

becomes:

```json
{"options":["one","two"],"empty":[]}
```

These values no longer pass validation for a third-party block with attributes of type `object`. After such a save, an independent test WordPress block receives its default value instead of its original settings and becomes invalid. Its HTML remains unchanged.

The issue was reproduced through real `wp_insert_post()` and `wp_update_post()` calls as Administrator, including **title-only updates**. In all four configurations, a control with only the new `SDCW_preserve_clock_post_metadata` disabled preserves the original JSON; the enabled filter changes it. A post with the same third-party block but no clock also remains unchanged.

The ordinary WordPress post API is used to attribute this defect. Some WordPress REST paths reserialize blocks themselves and can produce a similar result without the patch; that behavior is not attributed to 1.1.2. The third-party test block is synthetic; specific external plugins were not tested.

Recommendation: remove unconditional normalization of the entire post through `wp_insert_post_data`. If server-side correction is needed, change only the clock's own metadata while preserving neighboring block JSON. Add these negative tests to the required regressions. Simply replacing the files with 1.1.1 does not restore JSON that has already changed.

## P2. The HTML caption overwrites the original JSON value

Locations: `block.js:2073–2079` and `includes/simple-digital-clock-kses.php:109–113`.

The new logic always prefers the decoded HTML `caption` attribute, even when the original string already exists in JSON. The original 1.1.1 JavaScript serializer can produce this combination:

```text
JSON caption: &amp; &lt; &#34; &#x1F552;
HTML caption: &amp; &lt; &#34; &#x1F552;
```

In HTML these are encoded characters; in JSON they are a literal string. Official 1.1.1 reads the original string from JSON. After an upgrade and title-only save, the patch replaces it with:

```text
& < " 🕒
```

The review covered 32 original posts created by the original 1.1.1 JavaScript: four caption types × Administrator/Author × four sites. The value changes in 16 posts containing entity strings. The new values remain after returning to exact official 1.1.1; replacing the ZIP did not change the database. The old reader was also checked against the original snapshots: all 32 original captions can be read without losing the string.

This confirms a change to the saved setting and editor value. Old 1.1.1 already serialized these captions ambiguously in HTML, so a change in visible frontend text is not claimed as a new regression.

An additional server-side test with correct double escaping found another related edge case: older WordPress 6.3/6.8 normalize numeric entities before `pre_kses`. This is a platform limitation, not evidence of a new defect in its normalizer introduced by the patch. The current caption-protection implementation does not cover it.

Recommendation: preserve the original `caption` string and define explicit rules for recovering missing/filtered metadata. Existing JSON must not be unconditionally replaced with decoded HTML. Separate tests are needed for literal entities, plain text, HTML-like text and repeated saves; HTML filtering does not need to be disabled.

## Check results

| Configuration | Original PHP tests | New PHP contracts | New browser review | Reading the 32 posts after rollback |
| --- | --- | --- | --- | --- |
| WP 7.1.3 / PHP 8.3.35 | 464/464 | 133/136 | 14/20 | 20/24 |
| WP 7.1.3 / PHP 8.4.27 | 464/464 | 133/136 | 14/20 | 20/24 |
| WP 6.3.2 / PHP 8.2.12 | 464/464 | 131/136 | 14/20 | 20/24 |
| WP 6.8.3 / PHP 8.3.28 | 464/464 | 131/136 | 14/20 | 20/24 |

New PHP contracts: 528/544, 16 failures. New browser review: 56/80, 24 failures. Rollback checks for the new set: 80/96, 16 failures, all involving entity-caption preservation. In all 32 cases, replacing the ZIP itself did not change the database contents, and the clock block remained valid. Repeated failures are checks of the two issues described above, not separate bugs.

The original browser regression was rerun successfully: 33 checks on each of four sites in Chromium, Firefox and WebKit, totaling 396/396. Actual insertion through the UI was also checked on all four sites: the variation applies the browser timezone. The original fixes for timezone changes and KSES tag removal continue to work in these scenarios. The earlier 64-post cycle also remains green; it did not include these neighboring-block JSON forms or literal entity captions.

The original suite's dangerous HTML/CSS checks pass; no new security issues were confirmed in the reviewed code. This is not a complete security audit of third-party integrations.

## Evidence and reproduction

- [Full review results](final-review-evidence.json).
- [Additional PHP contracts](../../../tools/wordpress-lab/final-review.php) and [four-site runner](../../../tools/wordpress-lab/final-review-php.py).
- [Independent creation, save and rollback cycle](../../../tools/wordpress-lab/final-review.mjs).
- [Lab setup and original regression](../../../tools/wordpress-lab/README.md).

With the candidate already prepared, run the additional PHP tests from the repository root:

```bash
python3 tools/wordpress-lab/final-review-php.py
```

For the ZIP reviewed here, exit code 1 and 16 failed checks are expected. They were deliberately left red: the product was not fixed as part of this review. Browser modes `seed`, `save` and `rollback` run on 1.1.1, the candidate and 1.1.1 again, respectively; snapshots are not overwritten. A new full cycle requires a separate fresh lab with prepared fixtures.

## Scope and status

Native LocalWP, multisite, the PHP 7.x/8.5 functional matrix, and third-party plugins and themes were not tested. Additional PHP 8.5.10 syntax checks and `node --check` passed; they do not replace runtime tests in those environments.

There was no publication, Git commit/push, SVN change or change to user sites. Lab data was retained. The product and ZIP were left in the reviewed state for separate fixes to both issues; the candidate's status at that point was **changes required**.

The lab containers and dedicated network were stopped and removed with compose down; local files and databases were retained.
