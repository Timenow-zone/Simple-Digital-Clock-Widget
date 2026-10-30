import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const name = "simple-digital-clock-block/widget-block";

test("native serializer and public predecessor fixtures match their pinned provenance", () => {
  const fixtureRoot = path.join(root, "tests/fixtures/wordpress-6.3.14");
  const provenance = JSON.parse(readFileSync(path.join(fixtureRoot, "provenance.json"), "utf8"));
  for (const fixture of [...provenance.files, provenance.legacy_clock]) {
    const bytes = readFileSync(path.join(fixtureRoot, fixture.file));
    assert.equal(bytes.length, fixture.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), fixture.sha256);
  }
});

function loadEditor() {
  let blockType;
  let recover;
  let stored = [];
  const blocks = {
    registerBlockType(blockName, settings) {
      assert.equal(blockName, name);
      blockType = { name: blockName, ...settings };
    },
    // The Core parser's HTML decoding is covered by real WordPress acceptance.
    // These unit contracts supply its decoded result to the plugin's filter.
    parseWithAttributeSchema(html, schema) {
      if (schema.source === "query") return stored;
      return stored[0]?.[schema.attribute === "time-zone" ? "timeZone" : schema.attribute];
    },
  };
  const wp = {
    blocks,
    blockEditor: {},
    components: {},
    hooks: { addFilter(hook, namespace, callback) { recover = callback; } },
  };
  wp.blockEditor.useBlockProps = { save: () => ({ className: "wp-block-simple-digital-clock-block-widget-block" }) };
  const context = { wp, blockData: { locale: "en_US", i18n: {} }, Intl, ReactDOM: {}, console, setTimeout, clearTimeout };
  context.window = context;
  context.self = context;
  vm.createContext(context);
  for (const file of ["react.min.js", "escape-html.min.js", "element.min.js"]) {
    vm.runInContext(readFileSync(path.join(root, "tests/fixtures/wordpress-6.3.14", file), "utf8"), context);
  }
  vm.runInContext(readFileSync(path.join(source, "block.js"), "utf8"), context);
  return {
    blockType,
    renderSave(attributes) {
      return wp.element.renderToString(blockType.save({ attributes }));
    },
    recover(attributes, commentAttributes, htmlAttributes) {
      stored = htmlAttributes === null ? [] : [htmlAttributes];
      return recover(attributes, blockType, "fixture HTML", commentAttributes);
    },
  };
}

// WordPress 6.3's native serialization order, retained as an explicit bug control.
function serializeCore63(attributes) {
  return JSON.stringify(attributes).replace(/--/g, "\\u002d\\u002d")
    .replace(/</g, "\\u003c").replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026").replace(/\\"/g, "\\u0022");
}

function commentAttributes(blockType, attributes) {
  return Object.fromEntries(Object.entries(blockType.attributes)
    .filter(([key, schema]) => schema.source === undefined && attributes[key] !== undefined && attributes[key] !== schema.default)
    .map(([key]) => [key, attributes[key]]));
}

test("native static markup and JSON-backed captions preserve literal entity semantics", () => {
  assert.throws(() => JSON.parse(serializeCore63({ caption: "Terminal \\" })));
  const { blockType, renderSave } = loadEditor();
  const cases = ["Terminal \\", "Terminal \\\\", "Terminal \\\\\\", 'Quote \\" and \\', "Київ 🕒 \\", "&amp;#34; \\", "literal \\u0022"];
  for (const caption of cases) {
    const attributes = { width: 180, rounded: 0, date: true, border: true, caption };
    const comment = commentAttributes(blockType, attributes);
    assert.equal(comment.caption, caption, "caption remains JSON-backed for legacy readers");
    assert.equal(blockType.save({ attributes }).props.caption, caption, "old static save props stay unchanged");
  }
  const caption = "&copy; &NotEqualTilde; &apos; &#0; &#xD800; &#1114112;";
  const attributes = { width: 180, caption };
  const comment = JSON.parse(serializeCore63(commentAttributes(blockType, attributes)));
  assert.equal(comment.caption, caption);
  assert.ok(renderSave(attributes).includes(`caption="${caption}"`), "actual Core serializer leaves entity-shaped strings in raw HTML");
});

test("Core 6.3 malformed caption tokens are repaired without losing JSON values", () => {
  const editor = loadEditor();
  editor.blockType.attributes.className = { type: "string" };
  const cases = ["Terminal \\", "Terminal \\\\", "Terminal \\\\\\", 'Quote \\" and \\', "Київ 🕒 \\", "&copy; &NotEqualTilde; &apos; &#0; &#xD800; &#1114112; \\", "&amp;#34; \\", "literal \\u0022 \\", "line\u2028next\u2029end \\", "literal \\u2028 and \\u2029 \\", "<!-- wp:html --> <b>text</b> \\"];
  const rows = [];
  for (const caption of cases) {
    for (const className of [undefined, "custom-clock"]) {
      const attributes = { width: 180, rounded: 0, date: true, border: true, caption, className };
      const comment = commentAttributes(editor.blockType, attributes);
      const raw = serializeCore63(comment);
      assert.throws(() => JSON.parse(raw), "native old serializer is the explicit malformed control");
      rows.push({ comment: raw, html: editor.renderSave(attributes), expected: comment });
    }
  }
  // Preserve unknown data even where PHP and JSON.stringify spell numbers differently.
  const attributes = { unknown: { tiny: 1e-7, quote: "literal \\u0022", "0": "numeric key" }, width: 180, caption: "Unknown \\", className: "custom-clock" };
  rows.push({ comment: serializeCore63(attributes), html: editor.renderSave(attributes), expected: attributes });
  const result = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source, "repair"], { input: JSON.stringify(rows), encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.length, rows.length);
  for (const [index, row] of report.entries()) {
    assert.deepEqual(row.attributes, rows[index].expected);
    assert.equal(row.htmlUnchanged, true);
  }
});

test("caption recovery leaves valid, ambiguous, unrelated and mismatched metadata unchanged", () => {
  const editor = loadEditor();
  const caption = "Terminal \\";
  const html = editor.renderSave({ caption, width: 180 });
  const duplicate = '{"caption":"first","width":180,"caption":' + JSON.stringify(caption) + '}';
  const many = Object.fromEntries(Array.from({ length: 33 }, (_, index) => [`unknown${index}`, "unknown \\"]));
  many.caption = caption;
  const rows = [
    { comment: JSON.stringify({ caption: "literal \\u0022", width: 180 }), html: editor.renderSave({ caption: "literal \\u0022", width: 180 }) },
    { comment: duplicate.replace(/\\"/g, "\\u0022"), html },
    { comment: serializeCore63({ unknown: { caption: "Nested \\" }, caption: "Top" }), html: editor.renderSave({ caption: "Top" }) },
    { comment: serializeCore63({ caption }), html: editor.renderSave({ caption: "Different \\" }) },
    { comment: serializeCore63(many), html },
    { comment: serializeCore63({ caption }), html: html + "<!-- wp:paragraph --><p>Nested</p><!-- /wp:paragraph -->" },
    { comment: '{ "caption" : "literal \\\\u0022", "unknown" : {"tiny": 1e-7} }', html },
    { comment: '{"caption":"Terminal \\u0022}', html },
  ];
  const result = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source, "repair"], { input: JSON.stringify(rows), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  for (const row of JSON.parse(result.stdout)) assert.equal(row.unchanged, true);
});

test("missing legacy JSON recovers every saved setting without replacing explicit JSON", () => {
  const editor = loadEditor();
  const html = { width: "180", timeZone: "UTC", fontFamily: "Fira Code", backgroundColor: "#ffffff", rounded: "0", date: "true", border: "true", period: "false", align: "right", shadow: "small", caption: "Terminal \\" };
  const recovered = editor.recover({}, {}, html);
  assert.deepEqual({ ...recovered }, { width: 180, timeZone: "UTC", fontFamily: "Fira Code", backgroundColor: "#ffffff", background: "", rounded: 0, second: false, hundredths: false, period: true, date: true, border: true, shadow: "small", align: "right", caption: "Terminal \\" });
  const explicit = editor.recover({ width: 320, caption: "HTML" }, { width: 320, caption: "&amp;#34;" }, html);
  assert.equal(explicit.width, 320);
  assert.equal(explicit.caption, "&amp;#34;", "valid historical JSON caption stays authoritative");
  assert.deepEqual({ ...editor.recover({ width: 200 }, {}, null) }, { width: 200 });
});

test("legacy numeric and boolean recovery rejects malformed attribute values", () => {
  const editor = loadEditor();
  const recovered = editor.recover({ width: 200, rounded: 0.5, date: false }, {}, { width: "180px", rounded: "Infinity", date: "false" });
  assert.equal(recovered.width, 200);
  assert.equal(recovered.rounded, 0.5);
  assert.equal(recovered.date, false);
  assert.equal(editor.recover({}, {}, { width: "0", rounded: "0" }).width, 0);
});

test("clock-only PHP serializer preserves backslash parity and rejects encoding failures", () => {
  const result = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.error || ""}\n${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.failed, 0);
  assert.ok(report.assertions >= 20);
});
