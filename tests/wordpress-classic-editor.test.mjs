import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const allowedAttributes = [
  "align", "background", "background-color", "border", "caption", "class", "date", "font-family",
  "hundredths", "locale", "period", "rounded", "second", "shadow", "time-zone", "width",
];

function configure(settings, mode = "classic-editor") {
  const result = spawnSync(process.env.PHP_BINARY || "php", [
    path.join(root, "tests/wordpress-serialization.php"), source, mode,
  ], { input: JSON.stringify(settings), encoding: "utf8" });
  assert.equal(result.status, 0, `${result.error || ""}\n${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

test("WordPress TinyMCE fixture and license match both pinned Core distributions", () => {
  const directory = path.join(root, "tests/fixtures/tinymce-wordpress");
  const provenance = JSON.parse(readFileSync(path.join(directory, "provenance.json"), "utf8"));
  assert.equal(provenance.tinymce, "4.9.11");
  for (const file of provenance.files) {
    const bytes = readFileSync(path.join(directory, file.file));
    assert.equal(bytes.length, file.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
  }
  assert.deepEqual(provenance.sources.map(source => source.wordpress), ["6.3.14", "7.1.4"]);
  assert.equal(new Set(provenance.sources.map(source => source.tinymce_sha256)).size, 1);
  assert.equal(provenance.files.find(file => file.file === "tinymce.min.js").sha256, provenance.sources[0].tinymce_sha256);
});

test("Classic settings add all runtime attributes without replacing native or foreign schema rules", () => {
  const [result] = configure([{}]);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.settings.custom_elements, "~timenow-zone-sdcw", "inline placement must survive inside paragraphs");
  const declaration = /export const CLOCK_ATTRIBUTES\s*=\s*(\[[\s\S]*?\]);/.exec(readFileSync(path.join(root, "src/clock-element.ts"), "utf8"));
  assert.ok(declaration, "read the runtime's public observed-attribute contract");
  const runtimeAttributes = JSON.parse(declaration[1].replace(/,\s*\]/, "]"));
  assert.deepEqual(result.settings.sdcw_clock_attributes.split("|").sort(), [...runtimeAttributes, "class"].sort());
  assert.equal(new Set(result.settings.sdcw_clock_attributes.split("|")).size, 18);
  assert.equal(Object.hasOwn(result.settings, "extended_valid_elements"), false, "retain native span globals and attribute patterns");
  assert.equal(Object.hasOwn(result.settings, "valid_elements"), false);
  assert.equal(Object.hasOwn(result.settings, "non_empty_elements"), false, "do not replace TinyMCE's global nonempty-element policy");
  const plugins = JSON.parse(result.settings.external_plugins);
  assert.deepEqual(Object.keys(plugins), ["simple_digital_clock"]);
  const url = new URL(plugins.simple_digital_clock);
  assert.equal(url.origin, "https://example.invalid");
  assert.equal(url.pathname, "/wp-content/plugins/simple-digital-clock/assets/admin/js/simple-digital-clock-tinymce.js");
  assert.match(url.searchParams.get("ver"), /^\d+$/);
  assert.deepEqual(result.repeated, result.settings);
});

test("foreign plugin maps, element rules and unrelated editor options compose idempotently", () => {
  const foreignPlugins = { vendor_plugin: "https://vendor.example/editor.js?version=7", another_plugin: "https://vendor.example/second.js" };
  for (const external_plugins of [foreignPlugins, JSON.stringify(foreignPlugins)]) {
    const input = {
      external_plugins, custom_elements: "~vendor-inline,vendor-panel",
      extended_valid_elements: "vendor-inline[data-label],vendor-panel[role|class]",
      non_empty_elements: "video,canvas,vendor-inline", valid_elements: "p,strong,a[href],div",
      toolbar1: "bold,italic,link", plugins: "paste,lists", convert_urls: false,
      vendor_configuration: { enabled: true, text: "literal & value" },
    };
    const [result] = configure([input]);
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.repeated, result.settings, "applying both editor hooks must not duplicate rules");
    for (const key of ["non_empty_elements", "valid_elements", "toolbar1", "plugins", "convert_urls", "vendor_configuration"]) {
      assert.deepEqual(result.settings[key], input[key], `preserve ${key}`);
    }
    assert.ok(result.settings.custom_elements.startsWith(input.custom_elements + ","));
    assert.equal(result.settings.extended_valid_elements, input.extended_valid_elements);
    const combined = JSON.parse(result.settings.external_plugins);
    for (const [name, url] of Object.entries(foreignPlugins)) assert.equal(combined[name], url);
    assert.equal(Object.keys(combined).length, 3);
  }
});

test("the dynamic editor hook localizes the same policy, declares a version and respects rich editing", () => {
  const result = configure([false, true], "classic-editor-bootstrap");
  assert.deepEqual(result.bootstrap[0].calls, { enqueue: [], localize: [], print: [] });
  const calls = result.bootstrap[1].calls;
  assert.equal(calls.enqueue.length, 1);
  const [handle, url, dependencies, version, footer] = calls.enqueue[0];
  assert.equal(handle, "simple-digital-clock-tinymce");
  assert.deepEqual(dependencies, ["jquery", "wp-tinymce"]);
  assert.equal(String(version), new URL(url).searchParams.get("ver"), "explicit WordPress version and TinyMCE URL agree");
  assert.ok(Number.isInteger(version) && version > 0);
  assert.equal(footer, true);
  const [settings] = configure([{}]);
  assert.deepEqual(calls.localize, [[handle, "SDCWClassicEditorSettings", {
    custom_elements: settings.settings.custom_elements,
    sdcw_clock_attributes: settings.settings.sdcw_clock_attributes,
    plugin_url: JSON.parse(settings.settings.external_plugins).simple_digital_clock,
  }]]);
  assert.deepEqual(calls.print, [[handle]]);
  assert.deepEqual(Object.keys(result.post_attributes).sort(), allowedAttributes, "server KSES remains the unchanged sixteen-attribute policy");
  assert.deepEqual(result.post_attributes.background, { value_callback: "SDCW_is_safe_clock_background" });
  assert.deepEqual(result.post_attributes["background-color"], { value_callback: "SDCW_is_safe_clock_color" });
  assert.deepEqual(result.other_context, { foreign: { id: true } });
});

test("invalid external-plugin or element-rule types retain the complete original settings and diagnose", () => {
  const cases = [
    ...[true, 42, "{broken", "null", '"scalar"'].map(external_plugins => ({ settings: { external_plugins }, diagnostic: "invalid_external_plugins" })),
    ...["custom_elements", "extended_valid_elements"].flatMap(key => [true, 42, ["vendor-element"]].map(value => ({
      settings: { external_plugins: { vendor: "https://vendor.example/plugin.js" }, [key]: value, toolbar1: "bold" },
      diagnostic: "invalid_element_rules",
    }))),
  ];
  const results = configure(cases.map(row => row.settings));
  for (const [index, result] of results.entries()) {
    assert.deepEqual(result.settings, cases[index].settings, "no partial settings mutation on an unsupported configuration");
    assert.deepEqual(result.repeated, cases[index].settings);
    assert.equal(result.diagnostics.length, 2, "both invocations emit the diagnostic");
    for (const diagnostic of result.diagnostics) assert.deepEqual(diagnostic, ["sdcw_editor_diagnostic", cases[index].diagnostic]);
  }
});
