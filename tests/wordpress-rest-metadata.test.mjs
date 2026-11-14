import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const blockName = "simple-digital-clock-block/widget-block";
const serializeLegacy = (value) => JSON.stringify(value)
  .replace(/--/g, "\\u002d\\u002d").replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\\"/g, "\\u0022");
const escapeCaption = (value) => value
  .replace(/&(?!([a-z0-9]+|#[0-9]+|#x[a-f0-9]+);)/gi, "&amp;")
  .replace(/"/g, "&quot;").replace(/>/g, "&gt;");
const html = (caption) => `<timenow-zone-sdcw width="180" caption="${escapeCaption(caption)}" time-zone="UTC"></timenow-zone-sdcw>`;
const block = (json, markup) => `<!-- wp:${blockName} ${json} -->${markup}<!-- /wp:${blockName} -->`;
const foreign = '<!-- wp:vendor/card { "tiny": 1e-7, "lock": { "move": true } } --><p data-value="literal &amp;">Foreign</p><!-- /wp:vendor/card -->';
const captions = [
  "Terminal\\", "Terminal\\\\", "Terminal\\\\\\", 'Quote " Київ 🕒\\',
  "&copy; &apos; &NotEqualTilde;\\", "&amp;#34;\\", "Literal \\u0022 \\u2028\\",
  "line\u2028next\u2029end\\", "<!-- wp:paragraph --> literal\\",
];
const repaired = captions.map((caption) => {
  const expected = {
    width: 180, caption, timeZone: "UTC", lock: { move: true, remove: true },
    unknown: { "0": "numeric object key", tiny: 1e-7, values: [false, 0, null], literal: "literal \\u0022 text" },
  };
  const comment = serializeLegacy(expected);
  assert.throws(() => JSON.parse(comment), "The legacy input must reproduce malformed caption JSON");
  return { content: foreign + block(comment, html(caption)) + foreign, expected, markup: html(caption) };
});
const caption = "Terminal\\";
const duplicate = '{"caption":"first","caption":' + JSON.stringify(caption) + '}';
const untouched = [
  { label: "valid JSON preserves raw spacing and unknown numbers", content: block('{ "caption": "Plain", "unknown": { "tiny": 1e-7, "0": "object" } }', html("Plain")) },
  { label: "unrelated blocks preserve exact comments and HTML", content: foreign },
  { label: "foreign malformed JSON is not a clock repair", content: '<!-- wp:vendor/card ' + serializeLegacy({ caption }) + ' --><p>Foreign</p><!-- /wp:vendor/card -->' },
  { label: "duplicate caption is not an unambiguous preimage", content: block(duplicate.replace(/\\"/g, "\\u0022"), html(caption)) },
  { label: "mismatched HTML cannot authorize JSON repair", content: block(serializeLegacy({ caption }), html("Different\\")) },
  { label: "complete child block is outside static-clock recovery", content: block(serializeLegacy({ caption }), html(caption) + '<!-- wp:paragraph --><p>Nested</p><!-- /wp:paragraph -->') },
  { label: "arbitrary malformed JSON remains unchanged", content: block('{"caption":', html(caption)) },
];
const input = { rows: [...repaired, ...untouched], untouched, repaired_count: repaired.length };
const result = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-rest-metadata.php"), source], {
  input: JSON.stringify(input), encoding: "utf8",
});
assert.equal(result.status, 0, `${result.error || ""}\n${result.stdout}\n${result.stderr}`);
const report = JSON.parse(result.stdout);

test("REST metadata protection covers existing and later REST post types before Core priority 10", () => {
  for (const name of ["post", "page", "wp_block", "wp_navigation", "wp_template", "wp_template_part", "book", "later_book", "runtime_book"]) {
    assert.equal(report.registration[name].length, 1, `${name}: register exactly one protection callback`);
    assert.ok(report.registration[name][0].priority < 10, `${name}: protect before Core Block Hooks parse metadata`);
  }
  for (const name of ["private_record", "later_private"]) {
    assert.deepEqual(report.registration[name], [], `${name}: non-REST types do not need REST hooks`);
  }
});

test("early repair preserves captions, locks and unknown JSON before destructive Core processing", () => {
  for (const [index, expected] of repaired.entries()) {
    const row = report.rows[index];
    assert.deepEqual(row.early_attributes, [expected.expected]);
    assert.ok(row.early.startsWith(foreign) && row.early.endsWith(foreign), "Foreign comment bytes remain identical");
    assert.ok(row.early.includes(expected.markup), "Early repair leaves raw HTML for native sanitization");
  }
});

test("early REST repair and the existing late repair survive legacy Core reserialization together", () => {
  for (const [index, expected] of repaired.entries()) {
    const row = report.rows[index];
    assert.deepEqual(row.final_attributes, [expected.expected], `round-trip: ${captions[index]}`);
    assert.ok(row.final.includes(expected.markup), "Metadata correction does not rewrite static HTML");
    assert.notEqual(row.after_core, row.final, "The legacy Core serializer still requires the existing late repair");
  }
});

test("valid, foreign, ambiguous and mismatched REST content remains byte-identical", () => {
  for (const [index, expected] of untouched.entries()) {
    assert.equal(report.rows[repaired.length + index].early, expected.content, expected.label);
  }
});

test("REST preparation preserves errors, missing content, non-string content and unrelated fields", () => {
  for (const [name, unchanged] of Object.entries(report.guards)) assert.equal(unchanged, true, name);
  assert.deepEqual(report.field_scope, { same_object: true, other_fields_exact: true });
});

test("metadata repair leaves earlier rejection and later REST policy callbacks intact", () => {
  assert.deepEqual(report.policies, { before_calls: 1, after_calls: 1, error_retained: true });
});


test("REST raw response correction covers every REST post type after Core priority 10", () => {
  for (const name of ["post", "page", "wp_block", "wp_navigation", "wp_template", "wp_template_part", "book", "later_book", "runtime_book"]) {
    assert.equal(report.response_registration[name].length, 1, `${name}: one raw-response callback`);
    assert.ok(report.response_registration[name][0].priority > 10, `${name}: repair after Core response serialization`);
  }
  for (const name of ["private_record", "later_private"]) assert.deepEqual(report.response_registration[name], []);
});

test("safe stored metadata survives Core raw-response serialization without changing other response fields", () => {
  for (const [index, expected] of repaired.entries()) {
    const row = report.response_rows[index];
    assert.deepEqual(row.attributes, [expected.expected], `response round-trip: ${captions[index]}`);
    assert.notEqual(row.core_raw, row.raw, "The negative control must expose Core raw-response corruption");
    const outsideClockComment = (content) => content.replace(/<!-- wp:simple-digital-clock-block\/widget-block .*? -->/gs, "CLOCK COMMENT");
    assert.equal(outsideClockComment(row.raw), outsideClockComment(row.core_raw), "Foreign JSON and all HTML stay exact relative to Core output");
    assert.equal(row.same_object, true);
    assert.equal(row.other_fields_exact, true, "Rendered/protected, excerpts and metadata remain untouched");
    assert.equal(row.status, 207);
    assert.deepEqual(row.headers, { "X-Policy": "retained", Location: "/safe" });
    assert.deepEqual(row.links, { self: [{ href: "/wp/v2/posts/42" }] });
  }
});

test("response repair adds no raw content for view or restricted fields and leaves no-op responses untouched", () => {
  for (const [name, unchanged] of Object.entries(report.response_guards)) assert.equal(unchanged, true, name);
  for (const [index, unchanged] of report.response_untouched.entries()) assert.equal(unchanged, true, untouched[index].label);
});

test("raw-response correction preserves earlier rejection and later policy callbacks", () => {
  assert.deepEqual(report.response_policies, { before_calls: 1, after_calls: 1, error_retained: true });
});

test("Block Hooks type filter receives prepared posts as its third argument before other default-priority filters", () => {
  assert.deepEqual(report.block_hook_registration, [{ priority: 9, accepted_args: 3 }]);
});

test("Block Hooks input repair preserves every type list and only repairs prepared stdClass content", () => {
  for (const [index, expected] of repaired.entries()) {
    const row = report.block_hook_rows[index];
    assert.equal(row.types_exact, true, "Empty, duplicate, arbitrary and keyed type lists remain exact");
    assert.equal(row.same_object, true);
    assert.equal(row.other_fields_exact, true);
    assert.deepEqual(row.attributes, [expected.expected]);
    assert.equal(row.type_list_rows.length, 4);
    for (const typeList of row.type_list_rows) {
      assert.deepEqual(typeList, {
        types_exact: true, same_object: true, other_fields_exact: true, attributes: [expected.expected],
      }, "Each fresh prepared post is repaired even when its type is absent from the list");
    }
    assert.ok(row.content.startsWith(foreign) && row.content.endsWith(foreign));
    assert.ok(row.content.includes(expected.markup), "Raw HTML remains available for native sanitization");
  }
});

test("Block Hooks type filtering does not mutate stored WP_Post, errors, invalid content or unrelated bytes", () => {
  for (const [name, unchanged] of Object.entries(report.block_hook_guards)) assert.equal(unchanged, true, name);
  for (const [index, unchanged] of report.block_hook_untouched.entries()) assert.equal(unchanged, true, untouched[index].label);
});

test("Block Hooks type additions before and after metadata repair remain ordered and visible", () => {
  assert.deepEqual(report.block_hook_composition, {
    before_calls: 1, after_calls: 1, before_context_exact: true, after_context_exact: true,
    after_attributes: [repaired[0].expected], types: ["post", "book", "before_book", "after_book"],
  });
});

test("the default Core parser receives the late adapter while custom parser values remain exact", () => {
  assert.deepEqual(report.parser_registration, [{ last_priority: true, accepted_args: 1 }]);
  assert.equal(report.parser_class, "SDCW_Clock_Block_Parser");
  assert.ok(report.parser_custom_values.every(Boolean));
});

test("parser adaptation repairs recognized legacy metadata before delegating once and preserves the parent result", () => {
  for (const [index, expected] of repaired.entries()) {
    const row = report.parser_rows[index];
    assert.deepEqual(row.attributes, [expected.expected]);
    assert.ok(row.first_document.startsWith(foreign) && row.first_document.endsWith(foreign));
    assert.ok(row.first_document.includes(expected.markup));
    assert.equal(row.first_calls, 1);
    assert.equal(row.calls, 2, "Each of the two explicit parse calls delegates once");
    assert.equal(row.parent_result_exact, true);
    assert.equal(row.idempotent, true, "Parsing repaired content does not rewrite it again");
  }
});

test("parser adaptation passes valid, foreign, ambiguous and mismatched content to Core byte-for-byte", () => {
  for (const [index, expected] of untouched.entries()) {
    const row = report.parser_rows[repaired.length + index];
    assert.equal(row.first_document, expected.content, expected.label);
    assert.equal(row.first_calls, 1);
    assert.equal(row.calls, 2);
    assert.equal(row.parent_result_exact, true);
    assert.equal(row.idempotent, true);
  }
});

test("non-string documents reach the parent unchanged without coercion or repair", () => {
  assert.ok(Object.values(report.parser_non_string).every(Boolean));
});

test("parser selection respects earlier custom parsers and later overrides", () => {
  assert.deepEqual(report.parser_composition, {
    before_calls: 1, after_calls: 1,
    earlier_custom_class: "Rest_Test_Custom_Block_Parser", custom_document_exact: true,
    later_input: "SDCW_Clock_Block_Parser", later_override_class: "Rest_Test_Late_Block_Parser",
  });
});
