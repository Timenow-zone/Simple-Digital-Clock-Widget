import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { chromium, firefox, webkit } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const fixtures = path.join(root, "tests/fixtures/wordpress-6.3.14");

for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
  test(`native Core static captions retain JSON authority and legacy DOM validity: ${engine}`, { timeout: 60000 }, async () => {
    const browser = await browserType.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.evaluate(() => {
        window.ReactDOM = {};
        window.blockData = { locale: "en_US", i18n: {} };
        window.wp = {
          blocks: {
            registerBlockType(name, definition) {
              definition.name = name;
              // Core's default custom-class support appends this JSON attribute.
              definition.attributes.className = { type: "string" };
              window.__definition = definition;
            },
            parseWithAttributeSchema(html, schema) {
              const document = new DOMParser().parseFromString(html, "text/html");
              if (schema.source === "query") {
                return [...document.querySelectorAll(schema.selector)].map((node) => Object.fromEntries(
                  Object.entries(schema.query).map(([key, field]) => [key, node.getAttribute(field.attribute) ?? undefined])
                ));
              }
              return document.querySelector(schema.selector)?.getAttribute(schema.attribute) ?? undefined;
            },
          },
          hooks: { addFilter(hook, namespace, callback) { window.__recover = callback; } },
          blockEditor: {
            useBlockProps: {
              save: () => ({ className: "wp-block-simple-digital-clock-block-widget-block" + (window.__saveAttributes.className ? " " + window.__saveAttributes.className : "") }),
            },
          },
          components: {},
        };
      });
      for (const file of ["react.min.js", "escape-html.min.js", "element.min.js", "legacy-clock-1.1.2.js"]) {
        await page.addScriptTag({ content: await readFile(path.join(fixtures, file), "utf8") });
      }
      await page.evaluate(() => { window.__legacy = { type: window.__definition, recover: window.__recover }; });
      await page.addScriptTag({ content: await readFile(path.join(source, "block.js"), "utf8") });
      await page.evaluate(() => {
        window.__current = { type: window.__definition, recover: window.__recover };
        window.__render = (reader, attributes) => {
          window.__saveAttributes = attributes;
          return wp.element.renderToString(reader.type.save({ attributes }));
        };
        window.__comment = (reader, attributes) => Object.fromEntries(Object.entries(reader.type.attributes)
          .filter(([key, schema]) => schema.source === undefined && attributes[key] !== undefined && attributes[key] !== schema.default)
          .map(([key]) => [key, attributes[key]]));
        window.__serialize63 = (attributes) => JSON.stringify(attributes).replace(/--/g, "\\u002d\\u002d")
          .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\\"/g, "\\u0022");
        window.__read = (reader, html, comment) => {
          const document = new DOMParser().parseFromString(html, "text/html");
          const attributes = {};
          for (const [key, schema] of Object.entries(reader.type.attributes)) {
            const value = schema.source === "attribute"
              ? document.querySelector(schema.selector)?.getAttribute(schema.attribute) ?? undefined
              : comment[key];
            if (value !== undefined) attributes[key] = value;
            else if (schema.default !== undefined) attributes[key] = schema.default;
          }
          return reader.recover(attributes, reader.type, html, comment);
        };
        window.__domAttributes = (html) => {
          const node = new DOMParser().parseFromString(html, "text/html").querySelector("timenow-zone-sdcw");
          return [...node.attributes].map(({ name, value }) => [name, value]).sort(([a], [b]) => a.localeCompare(b));
        };
      });
      let rows = await page.evaluate(() => {
        const captions = [
          "&copy; &NotEqualTilde; &apos; &#0; &#xD800; &#1114112;",
          "&amp;#34; &amp;amp; layered",
          "Terminal \\", "Terminal \\\\", "Terminal \\\\\\", 'Quote \\" and \\',
          "Київ 日本語 🕒 \\", "&copy; &apos; &#0; &#xD800; \\",
          "line\u2028next\u2029end \\", "literal \\u2028 and \\u2029 \\",
          "<!-- wp:html --> <b>text</b> \\",
        ];
        return captions.map((caption, index) => {
          const attributes = {
            width: 180, timeZone: "UTC", fontFamily: "", backgroundColor: "#ffffff", background: "",
            locale: "en-US", rounded: 0, second: true, hundredths: false, period: false,
            date: true, border: true, shadow: "", align: "left", caption, className: "custom-clock",
          };
          return {
            index, expected: attributes,
            html: window.__render(window.__current, attributes),
            legacyHTML: window.__render(window.__legacy, attributes),
            comment: window.__serialize63(window.__comment(window.__current, attributes)),
          };
        });
      });
      for (const row of rows) assert.equal(row.html, row.legacyHTML, "native legacy static markup remains byte-identical");
      for (let cycle = 0; cycle < 2; cycle++) {
        const repaired = spawnSync(process.env.PHP_BINARY || "php", [path.join(root, "tests/wordpress-serialization.php"), source, "repair"], { input: JSON.stringify(rows), encoding: "utf8" });
        assert.equal(repaired.status, 0, repaired.stderr);
        const reports = JSON.parse(repaired.stdout);
        rows = await page.evaluate(({ rows, reports }) => rows.map((row, index) => {
          const comment = reports[index].attributes;
          if (!comment) throw new Error(`Unrepaired caption ${row.index}`);
          for (const reader of [window.__current, window.__legacy]) {
            const attributes = window.__read(reader, row.html, comment);
            if (attributes.caption !== row.expected.caption || attributes.width !== 180 || attributes.date !== true || attributes.rounded !== 0) {
              throw new Error(`Caption/settings changed: ${JSON.stringify({ index: row.index, expected: row.expected.caption, actual: attributes })}`);
            }
            const rendered = window.__render(reader, attributes);
            if (JSON.stringify(window.__domAttributes(rendered)) !== JSON.stringify(window.__domAttributes(row.html))) {
              throw new Error(`Legacy/current DOM validation mismatch: ${row.index}`);
            }
          }
          const attributes = window.__read(window.__current, row.html, comment);
          return { ...row, html: window.__render(window.__current, attributes), comment: window.__serialize63(window.__comment(window.__current, attributes)) };
        }), { rows, reports });
        for (const report of reports) assert.equal(report.htmlUnchanged, true);
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
