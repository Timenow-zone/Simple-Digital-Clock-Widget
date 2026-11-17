import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { before, after, test } from "node:test";
import { chromium, firefox, webkit } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const fixture = path.join(root, "tests/fixtures/tinymce-wordpress");
const engines = (process.env.SDCW_CLASSIC_BROWSERS || "chrome,firefox,webkit").split(",").map(value => value.trim());
const types = { chrome: chromium, firefox, webkit };
assert.ok(engines.length && engines.every(engine => Object.hasOwn(types, engine)), "Use chrome, firefox, or webkit");
assert.equal(new Set(engines).size, engines.length);
const evidenceDirectory = process.env.SDCW_CLASSIC_EVIDENCE_DIR;
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const tag = "timenow-zone-sdcw";
const pluginPath = "/wp-content/plugins/simple-digital-clock/assets/admin/js/simple-digital-clock-tinymce.js";
const cases = [
  { name: "bare empty clock", html: `<${tag}></${tag}>`, bare: true },
  { name: "empty div ancestor", html: `<div><${tag}></${tag}></div>` },
  { name: "inline paragraph placement", html: `<p>Before <strong>bold</strong><${tag} caption="One"></${tag}> After</p>` },
  { name: "empty list item ancestor", html: `<ul><li><${tag}></${tag}></li></ul>` },
  { name: "deep empty ancestors", html: `<div><section><p><${tag}></${tag}></p></section></div>` },
  {
    name: "multiple clocks, all runtime attributes and literal entity semantics",
    html: `<div><${tag} id="configured-clock" class="clock custom" width="210" locale="uk-UA" rounded="0" align="right" shadow="small" date="true" second="true" hundredths="false" border="true" period="false" caption="Київ 日本語 🕒 &amp; &quot; &#92; &amp;#34;" time-zone="Europe/Kyiv" time-zone-name="short" prefers="dark" font-family="Fira Code" background="linear-gradient(45deg, #fff, #000)" background-color="#123456"></${tag}></div><p><${tag} width="300" caption="Tokyo &amp;amp;" time-zone="Asia/Tokyo" period="true"></${tag}><${tag} width="160" caption="UTC" time-zone="UTC"></${tag}></p>`,
  },
  {
    name: "forbidden active and resource attributes",
    html: `<div><${tag} caption="safe" width="220" onclick="alert(1)" ONLOAD="alert(2)" onpointerover="alert(3)" src="javascript:alert(4)" href="https://example.org/" unknown-field="drop"></${tag}></div>`,
    expectedAttributes: { caption: "safe", width: "220" },
  },
  {
    name: "native global attributes, id and benign style", nativeReference: true,
    html: `<div><${tag} id="native-clock-id" title="Київ &amp; 東京" lang="uk" dir="rtl" role="timer" aria-label="Current time" aria-live="polite" data-owner="custom integration" style="color:red; text-align:center"></${tag}></div>`,
  },
  {
    name: "native CSS filtering policy", nativeReference: true,
    html: `<p><${tag} id="style-policy" style="color:red; width:expression(alert(1)); background-image:url(javascript:alert(2))"></${tag}></p>`,
  },
];
const foreignHTML = '<p class="foreign">Before <strong>bold &amp; safe</strong> <a href="https://example.org/path?q=1&amp;x=2">link</a></p><ul><li>one</li><li>two</li></ul><blockquote><p>Quote</p></blockquote>';
const vendorHTML = '<div><vendor-marker data-label="foreign"></vendor-marker></div>';
const spanHTML = `<p><span id="foreign-span" class="native" width="210" caption="must not leak" prefers="dark" time-zone-name="short" time-zone="UTC" date="true" second="true" font-family="Fira Code">Native span</span></p>`;
const foreignPlugin = `tinymce.PluginManager.add('vendor_fixture', function(editor) {
  editor.on('PreInit', function() {
    editor.schema.getNonEmptyElements()['vendor-marker'] = {};
    editor.schema.getNonEmptyElements()['VENDOR-MARKER'] = {};
  });
  return { fixtureMarker: 'foreign-plugin-executed' };
});`;
let server, origin, metadata, settings, foreignSettings, bridgeConfiguration;
const requests = [];

before(async () => {
  const [core, plugin, php] = await Promise.all([
    readFile(path.join(fixture, "tinymce.min.js")),
    readFile(path.join(source, "assets/admin/js/simple-digital-clock-tinymce.js")),
    readFile(path.join(source, "includes/simple-digital-clock-kses.php")),
  ]);
  const provenance = JSON.parse(await readFile(path.join(fixture, "provenance.json"), "utf8"));
  assert.equal(sha(core), provenance.files.find(file => file.file === "tinymce.min.js").sha256);
  server = createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    requests.push(pathname);
    response.setHeader("Cache-Control", "no-store");
    if (pathname === "/favicon.ico") { response.writeHead(204); response.end(); return; }
    const bytes = pathname === "/tinymce.min.js" ? core : pathname === pluginPath ? plugin : pathname === "/foreign.js" ? foreignPlugin : null;
    if (bytes !== null) { response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" }); response.end(bytes); return; }
    response.writeHead(pathname === "/" ? 200 : 404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(pathname === "/" ? '<!doctype html><html><head><meta charset="utf-8"></head><body><textarea id="content"></textarea><script src="/tinymce.min.js"></script></body></html>' : "Not found");
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  foreignSettings = {
    custom_elements: "~vendor-marker", extended_valid_elements: "vendor-marker[data-label]",
    non_empty_elements: "video,canvas,vendor-marker", external_plugins: { vendor_fixture: origin + "/foreign.js" },
  };
  const result = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source, "classic-editor"], {
    input: JSON.stringify([foreignSettings]), encoding: "utf8",
  });
  assert.equal(result.status, 0, `${result.error || ""}\n${result.stdout}\n${result.stderr}`);
  const [configured] = JSON.parse(result.stdout);
  assert.deepEqual(configured.diagnostics, []);
  settings = configured.settings;
  settings.external_plugins = JSON.parse(settings.external_plugins);
  // Serve the real PHP-selected external plugin from the isolated HTTP server.
  // Absolute URLs prevent TinyMCE from treating the plugin as an internal one.
  const scriptURL = new URL(settings.external_plugins.simple_digital_clock);
  assert.equal(scriptURL.pathname, pluginPath);
  settings.external_plugins.simple_digital_clock = origin + scriptURL.pathname + scriptURL.search;
  const bootstrap = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source, "classic-editor-bootstrap"], { input: "[true]", encoding: "utf8" });
  assert.equal(bootstrap.status, 0, bootstrap.stderr);
  bridgeConfiguration = JSON.parse(bootstrap.stdout).bootstrap[0].calls.localize[0][2];
  const bridgeURL = new URL(bridgeConfiguration.plugin_url);
  assert.equal(bridgeURL.pathname, pluginPath);
  bridgeConfiguration.plugin_url = origin + bridgeURL.pathname + bridgeURL.search;
  metadata = { tinyMCE: provenance.tinymce, fixtureSHA256: sha(core), pluginSHA256: sha(plugin), phpSHA256: sha(php), node: process.version, engines, settings, bridgeConfiguration, source };
  if (evidenceDirectory) {
    await mkdir(evidenceDirectory, { recursive: true });
    await writeFile(path.join(evidenceDirectory, "RUN.json"), JSON.stringify(metadata, null, 2) + "\n", { flag: "wx" });
  }
});

after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

async function initialize(page, editorSettings, bridge = false) {
  await page.goto(origin + "/");
  if (bridge) {
    await page.evaluate(configuration => {
      window.SDCWClassicEditorSettings = configuration;
      window.fixtureDiagnostics = [];
      document.addEventListener("sdcw-editor-diagnostic", event => window.fixtureDiagnostics.push(event.detail[0]));
      // Only jQuery's event transport is adapted; the product callback and the
      // TinyMCE editor consuming its resulting settings are the real code.
      window.jQuery = target => ({
        on(type, callback) { target.addEventListener(type.split(".")[0], event => callback(event, ...(event.detail || []))); },
        trigger(type, values) { target.dispatchEvent(new CustomEvent(type.split(".")[0], { detail: values || [] })); },
      });
    }, bridgeConfiguration);
    await page.addScriptTag({ url: bridgeConfiguration.plugin_url });
  }
  return page.evaluate(async ({ editorSettings, bridge }) => {
    let bridgeResult;
    if (bridge) {
      const before = JSON.stringify(editorSettings), originalMap = editorSettings.external_plugins;
      jQuery(document).trigger("wp-before-tinymce-init", [editorSettings]);
      const once = JSON.stringify(editorSettings);
      jQuery(document).trigger("wp-before-tinymce-init", [editorSettings]);
      bridgeResult = {
        before, once, twice: JSON.stringify(editorSettings),
        originalMapUnchanged: JSON.stringify(originalMap) === JSON.stringify(JSON.parse(before).external_plugins),
        ordinaryMap: Object.getPrototypeOf(editorSettings.external_plugins) === Object.prototype,
        hasOwnPropertyCallable: typeof editorSettings.external_plugins.hasOwnProperty === "function",
        diagnostics: window.fixtureDiagnostics.slice(),
      };
    }
    const [editor] = await Promise.race([
      tinymce.init({ selector: "#content", theme: false, skin: false, plugins: "", entity_encoding: "raw", convert_urls: false, ...editorSettings }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error("TinyMCE initialization exceeded 15 seconds")), 15000)),
    ]);
    window.fixtureEditor = editor;
    const span = editor.schema.getElementRule("span"), clock = editor.schema.getElementRule("timenow-zone-sdcw");
    return {
      version: tinymce.majorVersion + "." + tinymce.minorVersion,
      foreignPlugin: editor.plugins.vendor_fixture?.fixtureMarker,
      nonEmptyVideo: Object.hasOwn(editor.schema.getNonEmptyElements(), "video"),
      spanRule: JSON.parse(JSON.stringify({ attributes: span.attributes, attributesOrder: span.attributesOrder })),
      clockRulePresent: !!clock,
      detachedClockAttributes: !!clock && clock.attributes !== span.attributes && clock.attributesOrder !== span.attributesOrder,
      bridgeResult,
    };
  }, { editorSettings, bridge });
}

async function attributesOf(page, html, selector) {
  return page.evaluate(({ html, selector }) => Object.fromEntries([...new DOMParser().parseFromString(html, "text/html").querySelector(selector).attributes].map(attribute => [attribute.name, attribute.value])), { html, selector });
}

async function bridgeConfigurationChecks(page) {
  return page.evaluate(() => {
    const emit = settings => jQuery(document).trigger("wp-before-tinymce-init", [settings]);
    const invalid = [
      ...[true, null, 42, [], "{bad", '"scalar"'].map(external_plugins => ({ settings: { external_plugins, toolbar: "bold" }, diagnostic: "invalid_external_plugins" })),
      ...[true, 42, ["custom"]].map(custom_elements => ({ settings: { custom_elements, external_plugins: {}, toolbar: "bold" }, diagnostic: "invalid_element_rules" })),
    ].map(row => {
      const before = JSON.stringify(row.settings), offset = window.fixtureDiagnostics.length;
      emit(row.settings);
      return { expectedDiagnostic: row.diagnostic, unchanged: before === JSON.stringify(row.settings), diagnostics: window.fixtureDiagnostics.slice(offset) };
    });
    const safeMap = JSON.parse('{"__proto__":"https://example.org/proto.js","constructor":"https://example.org/constructor.js","vendor_fixture":"https://example.org/vendor.js"}');
    const original = JSON.stringify(safeMap), safe = { external_plugins: safeMap, extended_valid_elements: "vendor-marker[data-label]", non_empty_elements: "video,canvas" };
    emit(safe);
    const inherited = Object.create({ inherited_plugin: "https://example.org/inherited.js" });
    inherited.vendor_fixture = "https://example.org/vendor.js";
    const inheritedSettings = { external_plugins: inherited }; emit(inheritedSettings);
    const jsonSettings = { external_plugins: JSON.stringify({ vendor_fixture: "https://example.org/vendor.js" }) }; emit(jsonSettings);
    return {
      invalid,
      ownKeysRetained: Object.hasOwn(safe.external_plugins, "__proto__") && Object.hasOwn(safe.external_plugins, "constructor"),
      ownProtoValue: safe.external_plugins.__proto__, ordinaryPrototype: Object.getPrototypeOf(safe.external_plugins) === Object.prototype,
      originalMapUnchanged: JSON.stringify(safeMap) === original,
      noInheritedPlugin: !Object.hasOwn(inheritedSettings.external_plugins, "inherited_plugin"),
      foreignJSONMapPreserved: jsonSettings.external_plugins.vendor_fixture === "https://example.org/vendor.js",
      extendedRulesPreserved: safe.extended_valid_elements === "vendor-marker[data-label]", nonemptySettingPreserved: safe.non_empty_elements === "video,canvas",
    };
  });
}

async function roundTrip(page, html) {
  return page.evaluate(html => {
    const editor = window.fixtureEditor;
    const snapshot = value => {
      const body = new DOMParser().parseFromString(value, "text/html").body;
      return [...body.querySelectorAll("timenow-zone-sdcw")].map(clock => {
        const ancestors = []; let parent = clock.parentElement;
        while (parent && parent !== body) { ancestors.unshift(parent.localName); parent = parent.parentElement; }
        return { attributes: Object.fromEntries([...clock.attributes].map(attribute => [attribute.name, attribute.value]).sort(([a], [b]) => a.localeCompare(b))), ancestors };
      });
    };
    const expected = snapshot(html), cycles = [];
    let input = html;
    for (let cycle = 0; cycle < 3; cycle++) {
      editor.setContent(input);
      const output = editor.getContent();
      editor.save();
      cycles.push({ output, textarea: document.getElementById("content").value, clocks: snapshot(output) });
      input = output;
    }
    return { input: html, expected, cycles };
  }, html);
}

for (const engine of engines) {
  test(`WordPress-bundled TinyMCE preserves clock HTML and native schema policy: ${engine}`, { timeout: 90000 }, async () => {
    const report = { engine, rows: [], errors: [], failedRequests: [] };
    const started = Date.now();
    const requestOffset = requests.length;
    let browser;
    try {
      browser = engine === "firefox" && process.env.SDCW_CLASSIC_FIREFOX_WS_ENDPOINT
        ? await firefox.connect(process.env.SDCW_CLASSIC_FIREFOX_WS_ENDPOINT, { exposeNetwork: `127.0.0.1:${new URL(origin).port}` })
        : await types[engine].launch({ headless: true, ...(engine === "chrome" ? { channel: "chrome" } : {}) });
      report.browser = { name: engine === "chrome" ? "Google Chrome" : engine === "firefox" ? "Firefox" : "WebKit", version: browser.version() };
      const page = await browser.newPage();
      page.on("pageerror", error => report.errors.push(error.message));
      page.on("requestfailed", request => report.failedRequests.push({ url: request.url(), error: request.failure() }));
      const initial = await initialize(page, {});
      assert.equal(initial.version, "4.9.11");
      const red = await roundTrip(page, cases[0].html);
      report.rows.push({ name: "default schema RED", ...red });
      assert.equal(red.expected.length, 1);
      assert.equal(red.cycles[0].clocks.length, 0, "sensitivity control: the default editor drops the clock");
      const foreignBaseline = await roundTrip(page, foreignHTML);
      report.foreignBaseline = foreignBaseline;
      const spanBaseline = await roundTrip(page, spanHTML);
      report.spanBaseline = spanBaseline;
      const nativeReferences = {};
      for (const scenario of cases.filter(row => row.nativeReference)) {
        const html = scenario.html.replaceAll(`<${tag}`, "<span").replaceAll(`</${tag}>`, "Native reference</span>");
        const row = await roundTrip(page, html);
        nativeReferences[scenario.name] = { ...row, attributes: await attributesOf(page, row.cycles[0].output, "span") };
      }
      report.nativeReferences = nativeReferences;
      assert.equal(nativeReferences["native global attributes, id and benign style"].attributes.id, "native-clock-id");

      const schemaOnly = { ...settings, external_plugins: { vendor_fixture: settings.external_plugins.vendor_fixture } };
      await initialize(page, schemaOnly);
      const nestedRed = await roundTrip(page, cases[1].html);
      report.rows.push({ name: "schema-only nested ancestor RED", ...nestedRed });
      assert.equal(nestedRed.cycles[0].clocks.length, 0, "schema declarations alone do not preserve an empty clock's ancestors");

      report.editors = [];
      for (const bridge of [false, true]) {
        const delivery = bridge ? "dynamic event bridge" : "PHP settings";
        const fixed = await initialize(page, bridge ? foreignSettings : settings, bridge);
        report.editors.push({ delivery, ...fixed });
        assert.equal(fixed.foreignPlugin, "foreign-plugin-executed", "the existing external plugin still executes in real TinyMCE");
        assert.equal(fixed.nonEmptyVideo, true, "the native nonempty-element policy remains available");
        assert.equal(fixed.detachedClockAttributes, true, "clock attribute map and order are detached from native span");
        assert.deepEqual(fixed.spanRule, initial.spanRule, "clock attributes do not leak into native span's schema or order");
        if (bridge) {
          assert.equal(fixed.bridgeResult.once, fixed.bridgeResult.twice, "repeated Core initialization events are idempotent");
          assert.equal(fixed.bridgeResult.originalMapUnchanged, true);
          assert.equal(fixed.bridgeResult.ordinaryMap, true);
          assert.equal(fixed.bridgeResult.hasOwnPropertyCallable, true, "TinyMCE 4 consumes an ordinary map, not a null-prototype map");
          assert.deepEqual(fixed.bridgeResult.diagnostics, []);
          const configured = JSON.parse(fixed.bridgeResult.once), previous = JSON.parse(fixed.bridgeResult.before);
          assert.equal(configured.extended_valid_elements, previous.extended_valid_elements);
          assert.equal(configured.non_empty_elements, previous.non_empty_elements);
          assert.equal(configured.external_plugins.vendor_fixture, previous.external_plugins.vendor_fixture);
          report.bridgeChecks = await bridgeConfigurationChecks(page);
          for (const row of report.bridgeChecks.invalid) {
            assert.equal(row.unchanged, true, "invalid event settings remain unchanged");
            assert.deepEqual(row.diagnostics, [row.expectedDiagnostic]);
          }
          for (const name of ["ownKeysRetained", "ordinaryPrototype", "originalMapUnchanged", "noInheritedPlugin", "foreignJSONMapPreserved", "extendedRulesPreserved", "nonemptySettingPreserved"]) assert.equal(report.bridgeChecks[name], true, name);
          assert.equal(report.bridgeChecks.ownProtoValue, "https://example.org/proto.js");
        }
        for (const [index, scenario] of cases.entries()) {
          const row = await roundTrip(page, scenario.html);
          report.rows.push({ delivery, name: scenario.name, ...row });
          for (const [cycle, output] of row.cycles.entries()) {
            assert.equal(output.clocks.length, row.expected.length, `${scenario.name}: clock count, cycle ${cycle}`);
            for (const [clockIndex, clock] of output.clocks.entries()) {
              const expected = scenario.nativeReference ? nativeReferences[scenario.name].attributes : scenario.expectedAttributes || row.expected[clockIndex].attributes;
              assert.deepEqual(clock.attributes, expected, `${scenario.name}: decoded attributes, cycle ${cycle}`);
              if (!scenario.bare) assert.deepEqual(clock.ancestors, row.expected[clockIndex].ancestors, `${scenario.name}: ancestor/inline placement`);
            }
            assert.equal(output.textarea, output.output, "editor.save writes the serialized content back to the form");
            if (cycle) assert.equal(output.output, row.cycles[0].output, "repeated parser/serializer cycles are stable");
          }
          console.log(`[${engine}/${delivery} ${index + 1}/${cases.length}] ${scenario.name}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
        }
        const foreign = await roundTrip(page, foreignHTML);
        report.rows.push({ delivery, name: "foreign markup equivalence", ...foreign });
        assert.deepEqual(foreign.cycles, foreignBaseline.cycles, "the clock extension does not change foreign markup serialization");
        const span = await roundTrip(page, spanHTML);
        report.rows.push({ delivery, name: "native span attribute filtering remains unchanged", ...span });
        assert.deepEqual(span.cycles, spanBaseline.cycles, "clock-only attributes do not become valid on span");
        const vendor = await roundTrip(page, vendorHTML);
        report.rows.push({ delivery, name: "foreign plugin nonempty custom element", ...vendor });
        for (const cycle of vendor.cycles) assert.match(cycle.output, /<div><vendor-marker data-label="foreign"><\/vendor-marker><\/div>/);
        const blocked = await initialize(page, { ...(bridge ? foreignSettings : settings), invalid_elements: tag }, bridge);
        const blockedRow = await roundTrip(page, `<p>Before<${tag} caption="blocked"></${tag}>After</p>`);
        report.rows.push({ delivery, name: "explicit invalid_elements policy", editor: blocked, ...blockedRow });
        assert.equal(blocked.clockRulePresent, false);
        for (const cycle of blockedRow.cycles) {
          assert.equal(cycle.clocks.length, 0, "an explicitly forbidden clock is not recreated");
          assert.equal(cycle.output, "<p>BeforeAfter</p>");
        }
      }
      const jsonBridge = await initialize(page, { ...foreignSettings, external_plugins: JSON.stringify(foreignSettings.external_plugins) }, true);
      assert.equal(jsonBridge.foreignPlugin, "foreign-plugin-executed", "a JSON plugin map also initializes the real foreign plugin");
      assert.equal(jsonBridge.bridgeResult.ordinaryMap, true);
      assert.equal(jsonBridge.bridgeResult.hasOwnPropertyCallable, true);
      assert.equal(jsonBridge.bridgeResult.once, jsonBridge.bridgeResult.twice);
      const jsonRow = await roundTrip(page, cases[5].html);
      report.rows.push({ delivery: "dynamic event bridge", name: "JSON external-plugin map consumed by real TinyMCE", editor: jsonBridge, ...jsonRow });
      for (const cycle of jsonRow.cycles) assert.deepEqual(cycle.clocks, jsonRow.expected);
      assert.deepEqual(report.errors, []);
      assert.deepEqual(report.failedRequests, []);
      assert.ok(requests.every(url => ["/", "/favicon.ico", "/tinymce.min.js", "/foreign.js", pluginPath].includes(url)), "no spurious internal plugin or theme requests");
      report.passed = true;
    } catch (error) {
      report.passed = false;
      report.failure = error.stack;
      throw error;
    } finally {
      report.elapsedMs = Date.now() - started;
      report.requests = requests.slice(requestOffset);
      if (evidenceDirectory) await writeFile(path.join(evidenceDirectory, engine + ".json"), JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
      await browser?.close();
    }
  });
}
