import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const name = "simple-digital-clock-block/widget-block";

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
    element: { createElement: (type, props, ...children) => ({ type, props, children }) },
    components: {},
    hooks: { addFilter(hook, namespace, callback) { recover = callback; } },
  };
  wp.blockEditor.useBlockProps = { save: () => ({ className: "wp-block-simple-digital-clock-block-widget-block" }) };
  vm.runInNewContext(readFileSync(path.join(source, "block.js"), "utf8"), {
    window: { wp }, blockData: { locale: "en_US", i18n: {} }, Intl,
  });
  return {
    blockType,
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
  return Object.fromEntries(Object.entries(attributes).filter(([key, value]) => {
    const schema = blockType.attributes[key];
    return schema && schema.source === undefined && value !== undefined && value !== schema.default;
  }));
}

test("HTML-sourced captions avoid the Core 6.3 terminal-backslash bug", () => {
  assert.throws(() => JSON.parse(serializeCore63({ caption: "Terminal \\" })));
  const { blockType } = loadEditor();
  const cases = ["Terminal \\", "Terminal \\\\", "Terminal \\\\\\", 'Quote \\" and \\', "Київ 🕒 \\", "&amp;#34; \\", "literal \\u0022"];
  for (const caption of cases) {
    const attributes = { width: 180, rounded: 0, date: true, border: true, caption };
    const comment = commentAttributes(blockType, attributes);
    assert.equal(Object.hasOwn(comment, "caption"), false, caption);
    assert.deepEqual(JSON.parse(serializeCore63(comment)), { width: 180, rounded: 0, date: true, border: true });
    assert.equal(blockType.save({ attributes }).props.caption, caption, "HTML retains exact caption");
  }
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
