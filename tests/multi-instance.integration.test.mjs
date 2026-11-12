import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, after } from "node:test";
import { chromium, firefox, webkit } from "playwright";

const fixtureURL = new URL("./fixtures/multi-instance.json", import.meta.url);
const fixtureBytes = await readFile(fixtureURL);
const fixture = JSON.parse(fixtureBytes);
const root = fileURLToPath(new URL("..", import.meta.url));
const version = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;
const runtime = await readFile(path.join(root, `dist/${version}.min.js`));
const loader = await readFile(path.join(root, "wordpress/simple-digital-clock/assets/public/js/simple-digital-clock-loader.js"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const runtimeHash = hash(runtime);
const loaderHash = hash(loader);
const browsers = (process.env.SDCW_MULTI_BROWSERS || "chrome,firefox,webkit").split(",");
assert(browsers.length && browsers.every(name => ["chrome", "firefox", "webkit"].includes(name)));
assert.equal(new Set(browsers).size, browsers.length);
const out = process.env.SDCW_MULTI_EVIDENCE_DIR ? path.resolve(process.env.SDCW_MULTI_EVIDENCE_DIR) : null;
if (out) await mkdir(out, { recursive: true });
const records = [];
const started = Date.now();
const tag = "timenow-zone-sdcw";
const escapeHTML = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const markup = config => `<${tag} id="${config.id}" ${Object.entries(config.attributes).map(([key, value]) => `${key}="${escapeHTML(value)}"`).join(" ")}></${tag}>`;
let server;
let targets;
if (process.env.SDCW_MULTI_TARGETS_FILE) {
  targets = JSON.parse(await readFile(process.env.SDCW_MULTI_TARGETS_FILE, "utf8"));
} else {
  server = createServer((request, response) => {
    if (request.url === "/runtime.js") {
      response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
      response.end(runtime);
    } else {
      const configs = request.url === "/single" ? fixture.configs.slice(0, 1) : fixture.configs;
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(`<!doctype html><html><head><meta charset="utf-8"><title>Independent clock instances</title><style>body{margin:24px}timenow-zone-sdcw{display:block;margin:20px 0}</style></head><body><main>${configs.map(markup).join("\n")}</main><script src="/runtime.js"></script></body></html>`);
    }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  targets = ["single", "multiple"].map(scenario => ({ name: `html-${scenario}`, scenario, url: `http://127.0.0.1:${server.address().port}/${scenario}` }));
}
assert(Array.isArray(targets) && targets.length > 0);
for (const target of targets) {
  assert(/^[a-z0-9-]+$/.test(target.name));
  assert(["single", "multiple"].includes(target.scenario));
  assert(["127.0.0.1", "localhost"].includes(new URL(target.url).hostname), "Use owned loopback targets only");
  if (process.env.SDCW_MULTI_TARGETS_FILE) assert([0, 1].includes(target.expectedLoader), "Declare native-owned or fallback loader expectation");
}
let commit = null;
try { commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); } catch { /* Copied snapshots may omit Git. */ }
const metadata = { startedAt: new Date(started).toISOString(), commit, runnerSHA256: hash(await readFile(new URL(import.meta.url))), fixtureSHA256: hash(fixtureBytes), platform: process.platform, architecture: process.arch, runtime: { version, bytes: runtime.length, sha256: runtimeHash }, loaderSHA256: loaderHash, browsers, targets, timeOracle: "Real Date and native Intl; maximum rendered time age 1500ms. No clock or timer override.", minuteOnlyTick: "Short live-tick checks exclude minute-only clocks; their current time and settings are still checked at every phase." };
if (out) await writeFile(path.join(out, "RUN.json"), JSON.stringify(metadata, null, 2) + "\n", { flag: "wx" });

// Expected values come from immutable fixtures, never from the observed host attributes.
function observe(configs) {
  const now = Date.now();
  const issues = [];
  const clocks = configs.map(config => {
    const a = config.attributes;
    const host = document.getElementById(config.id);
    const box = host?.shadowRoot?.querySelector(".widget");
    const anchor = host?.shadowRoot?.querySelector("a");
    if (!box || !anchor) { issues.push(`${config.id}: missing rendered clock`); return { id: config.id }; }
    const check = (condition, message) => { if (!condition) issues.push(`${config.id}: ${message}`); };
    const attributes = Object.fromEntries([...host.attributes].filter(attribute => attribute.name !== "id").map(attribute => [attribute.name, attribute.value]));
    check(JSON.stringify(Object.entries(attributes).sort()) === JSON.stringify(Object.entries(a).sort()), "attributes differ from fixture");
    const period = a.period === "true";
    const hundredths = a.hundredths === "true";
    const seconds = a.second === "true" || hundredths;
    const formatter = new Intl.DateTimeFormat(a.locale, { timeZone: a["time-zone"], hour: "numeric", minute: "numeric", hour12: period, ...(seconds ? { second: "numeric" } : {}), ...(hundredths ? { fractionalSecondDigits: 2 } : {}) });
    const text = anchor.textContent;
    let matchedTime = null;
    for (let age = 0; age <= 1500; age += 10) {
      if (formatter.format(new Date(now - age)) === text) { matchedTime = now - age; break; }
    }
    check(matchedTime !== null, `time ${JSON.stringify(text)} does not match fixture timezone/locale/format within 1500ms`);
    const style = getComputedStyle(box);
    const innerStyle = getComputedStyle(anchor.parentElement);
    const rawAlign = innerStyle.textAlign;
    const align = rawAlign === "start" ? (innerStyle.direction === "rtl" ? "right" : "left")
      : rawAlign === "end" ? (innerStyle.direction === "rtl" ? "left" : "right") : rawAlign;
    const probe = document.createElement("div");
    probe.style.color = a["background-color"];
    const color = probe.style.color;
    const caption = anchor.previousElementSibling?.textContent;
    const dates = [...anchor.parentElement.children].slice(2);
    const hasDate = Object.hasOwn(a, "date");
    const dateText = new Intl.DateTimeFormat(a.locale, { timeZone: a["time-zone"], weekday: "short", year: "numeric", month: "short", day: "numeric" }).format(new Date(matchedTime ?? now));
    const rect = anchor.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    check(caption === a.caption, "caption changed or leaked from a neighbor");
    check(host.shadowRoot.querySelectorAll("b,img,script").length === 0, "caption contains injected markup");
    check(box.style.width === `${a.width}px`, "inline width differs");
    check(Math.abs(boxRect.width - Number(a.width)) <= 2, "visible width differs");
    check(style.backgroundColor === color, "background differs");
    check(box.style.borderRadius === `${a.rounded}rem`, "radius differs");
    const expectedAlign = a.align || "center";
    check(align === expectedAlign, `alignment differs: requested ${expectedAlign}, rendered ${rawAlign} (${innerStyle.direction})`);
    check(parseFloat(style.borderTopWidth) === (Object.hasOwn(a, "border") ? 1 : 0), "border presence differs");
    check(box.classList.contains(a.shadow), "shadow class differs");
    check(style.boxShadow !== "none", "shadow is not rendered");
    check(dates.length === (hasDate ? 2 : 0), "date visibility differs");
    if (hasDate) check(dates[0]?.textContent === dateText && getComputedStyle(dates[0]).display !== "none", "visible date differs");
    check(rect.width > 0 && rect.height > 0, "time is not visible");
    check(host.shadowRoot.querySelectorAll("a").length === 1, "duplicate mounted clock");
    check(!host.shadowRoot.textContent.includes("Error, please check"), "clock reports a formatting error");
    return { id: config.id, attributes, caption, text, expectedAtNow: formatter.format(new Date(now)), timeWindow: { from: now - 1500, to: now, matchedTime }, width: box.style.width, measuredWidth: boxRect.width, background: style.backgroundColor, radius: box.style.borderRadius, align, rawAlign, direction: innerStyle.direction, border: style.borderTopWidth, shadow: style.boxShadow, dates: dates.map(element => ({ text: element.textContent, display: getComputedStyle(element).display })), version: box.dataset.version };
  });
  return { observedAt: now, issues, clocks, count: document.querySelectorAll("timenow-zone-sdcw").length, ready: customElements.get("timenow-zone-sdcw")?.runtimeReady };
}

async function verify(page, configs, record, phase) {
  await page.waitForFunction(({ source, configs }) => (0, eval)(`(${source})`)(configs).issues.length === 0, { source: observe.toString(), configs }, { timeout: 7000 });
  const snapshot = await page.evaluate(observe, configs);
  assert.deepEqual(snapshot.issues, [], `${phase}: ${JSON.stringify(snapshot)}`);
  assert.equal(snapshot.count, configs.length);
  assert.equal(snapshot.ready, true);
  for (const clock of snapshot.clocks) assert.equal(clock.version, version);
  record.phases.push({ phase, ...snapshot });
  return snapshot;
}

async function ticks(page, configs, record, phase) {
  const active = configs.filter(config => config.attributes.second === "true" || config.attributes.hundredths === "true");
  assert(active.length > 0);
  const before = await verify(page, configs, record, `${phase}-before`);
  const initial = Object.fromEntries(before.clocks.map(clock => [clock.id, clock.text]));
  await page.waitForFunction(({ ids, initial }) => ids.every(id => document.getElementById(id)?.shadowRoot?.querySelector("a")?.textContent !== initial[id]), { ids: active.map(config => config.id), initial }, { timeout: 5000 });
  const after = await verify(page, configs, record, `${phase}-after`);
  record.ticks.push({ phase, ids: active.map(config => config.id), before: initial, after: Object.fromEntries(after.clocks.map(clock => [clock.id, clock.text])) });
}

async function replaceAttributes(page, config) {
  await page.evaluate(config => {
    const host = document.getElementById(config.id);
    for (const attribute of [...host.attributes]) if (attribute.name !== "id") host.removeAttribute(attribute.name);
    for (const [key, value] of Object.entries(config.attributes)) host.setAttribute(key, value);
  }, config);
}

for (const engine of browsers) {
  test(`independent exact-bundle instances: ${engine}`, { timeout: 240000 }, async t => {
    const browser = await { chrome: chromium, firefox, webkit }[engine].launch({ headless: true, timeout: 30000, ...(engine === "chrome" ? { channel: "chrome" } : {}) });
    try {
      for (const target of targets) {
        await t.test(target.name, { timeout: 55000 }, async () => {
          const record = { target: target.name, scenario: target.scenario, engine, channel: engine === "chrome" ? "chrome" : null, browserVersion: browser.version(), pass: false, errors: [], consoleErrors: [], loadErrors: [], responses: [], requests: [], phases: [], ticks: [] };
          const page = await browser.newPage({ viewport: { width: 1200, height: 1100 } });
          let expected = target.scenario === "single" ? fixture.configs.slice(0, 1) : fixture.configs;
          const tasks = [];
          const mainURL = url => /(?:\/runtime\.js|\/simple-digital-clock\.min\.js)(?:\?|$)/.test(url);
          const loaderURL = url => /\/simple-digital-clock-loader\.js(?:\?|$)/.test(url);
          page.on("pageerror", error => record.errors.push(error.message));
          page.on("console", message => { if (message.type() === "error") record.consoleErrors.push(message.text()); });
          page.on("request", request => { if (mainURL(request.url())) record.requests.push(request.url()); });
          page.on("response", response => {
            if (mainURL(response.url()) || loaderURL(response.url())) tasks.push((async () => {
              const body = await response.body();
              record.responses.push({ kind: mainURL(response.url()) ? "main" : "loader", url: response.url(), status: response.status(), bytes: body.length, sha256: hash(body) });
            })());
          });
          try {
            await page.addInitScript(() => { window.__multiLoadErrors = []; document.addEventListener("sdcw:load-error", event => window.__multiLoadErrors.push(String(event.detail?.message ?? event.detail))); });
            assert.equal((await page.goto(target.url, { waitUntil: "load" })).status(), 200);
            await ticks(page, expected, record, "initial-real-ticks");
            await page.evaluate(() => { window.__multiOriginal = new Map([...document.querySelectorAll("timenow-zone-sdcw")].map(host => [host.id, { host, root: host.shadowRoot }])); });
            await replaceAttributes(page, fixture.mutated);
            expected = [fixture.mutated, ...expected.slice(1)];
            await verify(page, expected, record, "only-first-clock-mutated");
            await page.evaluate(() => { const host = document.getElementById("utc"); host.remove(); });
            assert.equal(await page.evaluate(() => window.__multiOriginal.get("utc").root.querySelector("a") === null), true);
            const neighbors = expected.slice(1);
            await verify(page, neighbors, record, "first-removed-neighbors-unchanged");
            if (neighbors.length) await ticks(page, neighbors, record, "neighbors-tick-while-first-absent");
            await page.evaluate(() => document.querySelector("main").append(window.__multiOriginal.get("utc").host));
            await verify(page, expected, record, "same-first-host-reinserted");
            assert.equal(await page.evaluate(() => [...window.__multiOriginal.values()].every(({ host, root }) => document.getElementById(host.id) === host && host.shadowRoot === root)), true);
            await page.evaluate(html => document.querySelector("main").insertAdjacentHTML("beforeend", html), markup(fixture.dynamic));
            expected = [...expected, fixture.dynamic];
            await ticks(page, expected, record, "dynamic-neighbor-real-ticks");
            // Prove that the oracle detects cross-instance configuration corruption.
            const victim = expected.at(-1);
            await page.locator(`#${victim.id}`).evaluate(host => host.setAttribute("width", "517"));
            await page.waitForFunction(id => document.getElementById(id).shadowRoot.querySelector(".widget").style.width === "517px", victim.id);
            const negative = await page.evaluate(observe, expected);
            assert(negative.issues.some(issue => issue.startsWith(`${victim.id}:`) && issue.includes("width")));
            record.negativeControl = { detected: true, issues: negative.issues };
            await page.locator(`#${victim.id}`).evaluate((host, width) => host.setAttribute("width", width), victim.attributes.width);
            await verify(page, expected, record, "negative-control-restored");
            const priorBody = await page.evaluate(() => ({ direction: document.body.getAttribute("dir"), textAlign: document.body.style.textAlign }));
            const priorFirst = expected[0];
            const withAlignment = value => {
              const attributes = { ...priorFirst.attributes };
              if (value === null) delete attributes.align;
              else attributes.align = value;
              return [{ ...priorFirst, attributes }, ...expected.slice(1)];
            };
            await page.evaluate(() => { document.body.dir = "ltr"; document.body.style.textAlign = "right"; document.getElementById("utc").removeAttribute("align"); });
            expected = withAlignment(null);
            await verify(page, expected, record, "removed-align-default-center-over-parent-right");
            await page.locator("#utc").evaluate(host => { host.align = ""; });
            expected = withAlignment("");
            await verify(page, expected, record, "empty-align-property-default-center");
            await page.evaluate(() => { document.body.dir = "rtl"; document.getElementById("utc").align = "left"; });
            expected = withAlignment("left");
            await verify(page, expected, record, "rtl-physical-left-property-and-independent-neighbors");
            await page.locator("#utc").evaluate(host => { host.align = "right"; });
            expected = withAlignment("right");
            await verify(page, expected, record, "rtl-physical-right-property-and-independent-neighbors");
            await page.locator("#utc").evaluate(host => host.removeAttribute("align"));
            expected = withAlignment(null);
            await verify(page, expected, record, "rtl-removed-align-default-center");
            await page.evaluate(prior => {
              if (prior.direction === null) document.body.removeAttribute("dir");
              else document.body.setAttribute("dir", prior.direction);
              document.body.style.textAlign = prior.textAlign;
            }, priorBody);
            await replaceAttributes(page, priorFirst);
            expected = [priorFirst, ...expected.slice(1)];
            await ticks(page, expected, record, "alignment-controls-restored-real-ticks");
            if (out) await page.screenshot({ path: path.join(out, `${engine}-${target.name}.png`), fullPage: true });
            await Promise.all(tasks);
            record.loadErrors = await page.evaluate(() => window.__multiLoadErrors);
            assert.deepEqual(record.errors, []);
            assert.deepEqual(record.consoleErrors, []);
            assert.deepEqual(record.loadErrors, []);
            assert.equal(record.requests.length, 1, "one main request for every instance and lifecycle phase");
            assert.equal(record.responses.filter(response => response.kind === "main").length, 1);
            for (const response of record.responses) {
              assert.equal(response.status, 200);
              assert.equal(response.sha256, response.kind === "main" ? runtimeHash : loaderHash);
              assert.equal(response.bytes, response.kind === "main" ? runtime.length : loader.length);
            }
            if (process.env.SDCW_MULTI_TARGETS_FILE) assert.equal(record.responses.filter(response => response.kind === "loader").length, target.expectedLoader);
            record.pass = true;
          } catch (error) {
            record.failure = { message: error.message, stack: error.stack };
            record.failureSnapshot = await page.evaluate(observe, expected).catch(error => ({ diagnosticError: error.message }));
            if (out) await page.screenshot({ path: path.join(out, `${engine}-${target.name}-failure.png`), fullPage: true }).catch(() => {});
            throw error;
          } finally {
            await Promise.allSettled(tasks);
            records.push(record);
            if (out) await writeFile(path.join(out, `${engine}-${target.name}.json`), JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
            await page.close();
            const elapsed = (Date.now() - started) / 1000;
            const total = targets.length * browsers.length;
            const rate = records.length / elapsed;
            console.log(`[${records.length}/${total}] ${(records.length / total * 100).toFixed(0)}% ${engine}/${target.name} ${record.pass ? "PASS" : "FAIL"}; elapsed=${elapsed.toFixed(1)}s rate=${rate.toFixed(2)}/s ETA=${((total - records.length) / rate).toFixed(1)}s`);
          }
        });
      }
    } finally { await browser.close(); }
  });
}

after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  const summary = { ...metadata, finishedAt: new Date().toISOString(), expectedRows: targets.length * browsers.length, passed: records.filter(record => record.pass).length, failed: records.filter(record => !record.pass).length, missing: targets.length * browsers.length - records.length, records };
  if (out) await writeFile(path.join(out, "RESULT.json"), JSON.stringify(summary, null, 2) + "\n", { flag: "wx" });
  console.log(`Multi-instance summary: ${summary.passed}/${summary.expectedRows} PASS; failed=${summary.failed}, missing=${summary.missing}; evidence=${out ?? "not requested"}; main SHA=${runtimeHash}`);
});
