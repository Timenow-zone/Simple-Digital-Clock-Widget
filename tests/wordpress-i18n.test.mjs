import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin =
  process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");
const block = readFileSync(path.join(plugin, "block.js"), "utf8");
const result = spawnSync("php", [path.join(root, "tests/wordpress-i18n.php"), plugin], {
  encoding: "utf8",
});
assert.equal(result.status, 0, result.stderr + result.stdout);
const report = JSON.parse(result.stdout);
const translation = (text) =>
  `Переклад [${text}] </script><img src=x onerror="alert(1)"> & "цитата" 'апостроф'`;
const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const consumedKeys = [
  ...new Set(
    [...block.matchAll(/\bi18n\s*(?:\[\s*["']([^"']+)["']\s*\]|\.([A-Za-z_$][\w$]*))/g)].map(
      (match) => match[1] || match[2]
    )
  ),
].sort();
const gettextCalls = report.calls.filter(
  (call) => !["esc_html", "esc_attr"].includes(call.function)
);

function potMessages(source) {
  const messages = new Set();
  let current = null;
  let reading = false;
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith("msgid ") || line.startsWith("msgid_plural ")) {
      if (current !== null) messages.add(current);
      current = JSON.parse(line.slice(line.indexOf(" ") + 1));
      reading = true;
    } else if (reading && line.startsWith('"')) {
      current += JSON.parse(line);
    } else {
      reading = false;
    }
  }
  if (current !== null) messages.add(current);
  messages.delete("");
  return messages;
}

test("every static editor translation key is exported without stale or misspelled keys", () => {
  assert.ok(consumedKeys.length >= 48, "The guard must inspect the complete editor dictionary");
  assert.deepEqual(Object.keys(report.dictionary).sort(), consumedKeys);
  const accesses = block.match(/\bi18n\s*(?:\[|\.)/g) || [];
  const staticAccesses = [
    ...block.matchAll(/\bi18n\s*(?:\[\s*["']([^"']+)["']\s*\]|\.([A-Za-z_$][\w$]*))/g),
  ];
  assert.equal(
    accesses.length,
    staticAccesses.length,
    "Dynamic dictionary access needs an explicit parity test"
  );
});

test("all gettext messages and plural forms are extractable in the plugin POT", () => {
  const messages = potMessages(
    readFileSync(path.join(plugin, "languages/simple-digital-clock.pot"), "utf8")
  );
  assert.ok(gettextCalls.length > 0, "The extractor must identify source gettext calls");
  for (const call of gettextCalls) {
    const location = `${call.file}:${call.line} ${call.function}`;
    assert.equal(
      call.arguments.at(-1),
      "simple-digital-clock",
      `${location}: literal plugin domain required`
    );
    const ids =
      call.function === "_n" || call.function === "_nx"
        ? call.arguments.slice(0, 2)
        : call.arguments.slice(0, 1);
    for (const id of ids) {
      assert.equal(typeof id, "string", `${location}: a static msgid is required for extraction`);
      assert.ok(messages.has(id), `${location}: POT is missing ${JSON.stringify(id)}`);
    }
  }
});

test("escaping helpers are not mistaken for gettext functions", () => {
  for (const call of report.calls.filter((entry) =>
    ["esc_html", "esc_attr"].includes(entry.function)
  )) {
    assert.equal(
      call.arguments.length,
      1,
      `${call.file}:${call.line}: ${call.function} does not accept a translation domain`
    );
  }
});

test("editor translations reach the JavaScript dictionary as literal Unicode text", () => {
  const messages = new Set(gettextCalls.map((call) => call.arguments[0]));
  const expected = new Set([...messages].map(translation));
  for (const [key, value] of Object.entries(report.dictionary)) {
    assert.ok(
      expected.has(value),
      `${key}: translation must not be HTML-escaped before JSON serialization`
    );
    assert.equal(
      JSON.parse(JSON.stringify(value)),
      value,
      `${key}: JSON must preserve the exact translation`
    );
  }
  assert.equal(report.dictionary.localeInvalid, translation("Invalid BCP-47 locale tag."));
  assert.equal(report.dictionary.useSiteLocale, translation("Auto language"));
  assert.equal(report.dictionary.resetToSiteTz, translation("Auto Timezone"));
  assert.equal(report.dictionary.shadowHelp, translation("Select the shadow of the container."));
});

test("Core's element renderer escapes translated markup exactly once", () => {
  const context = vm.createContext({ wp: {}, ReactDOM: {}, console });
  context.window = context;
  context.self = context;
  for (const file of ["react.min.js", "escape-html.min.js", "element.min.js"]) {
    vm.runInContext(
      readFileSync(path.join(root, "tests/fixtures/wordpress-6.3.14", file), "utf8"),
      context
    );
  }
  for (const [key, value] of Object.entries(report.dictionary)) {
    const html = context.wp.element.renderToString(
      context.wp.element.createElement("span", null, value)
    );
    assert.match(html, /&lt;\/script(?:>|&gt;)&lt;img/, `${key}: markup must remain text`);
    assert.ok(
      !html.includes("&amp;lt;") && !html.includes("&amp;amp;"),
      `${key}: labels must not expose escaped entities`
    );
    assert.ok(
      !html.includes("<img") && !html.includes("</script>"),
      `${key}: translation must not create injected elements`
    );
  }
});

test("settings titles and notice text and attributes translate with context escaping", () => {
  assert.deepEqual(
    report.options_page,
    ["Settings Admin", "Simple Digital Clock"].map((text) => escapeHtml(translation(text)))
  );
  for (const text of [
    "Please rate our free",
    "Simple Digital Clock 🕒",
    "Your valuable feedback will help us improve.",
    "It will only take a few minutes",
    "Rate it now",
    "Rating",
  ]) {
    assert.ok(
      report.notice.includes(escapeHtml(translation(text))),
      `Notice must translate and escape ${JSON.stringify(text)}`
    );
  }
  for (const text of ["Simple Digital Clock 🕒", "Rating"]) {
    assert.ok(
      report.notice.includes(`alt="${escapeHtml(translation(text))}"`),
      "Image alt text must be attribute-escaped"
    );
  }
  assert.ok(
    !report.notice.includes("</script>") && !report.notice.includes("<img src=x"),
    "Notice translations cannot inject markup"
  );
});
