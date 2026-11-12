import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { before, after, test } from "node:test";
import { chromium, firefox, webkit } from "playwright";

const root = process.cwd();
const { version } = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
// An explicit path also permits differential runs against preserved release artifacts.
const runtimePath = path.resolve(root, process.env.SDCW_RUNTIME_PATH || `dist/${version}.min.js`);
const engines = (process.env.SDCW_STANDALONE_BROWSERS || "chrome,firefox,webkit").split(",").map(value => value.trim());
const browserTypes = { chrome: chromium, chromium, firefox, webkit };
assert(engines.length && engines.every(engine => Object.hasOwn(browserTypes, engine)), "Use chrome, firefox, webkit or optional chromium");
assert.equal(new Set(engines).size, engines.length, "Browser names must be unique");
const evidenceDirectory = process.env.SDCW_STANDALONE_EVIDENCE_DIR
  ? path.resolve(root, process.env.SDCW_STANDALONE_EVIDENCE_DIR) : null;
const tag = "timenow-zone-sdcw";
const colorError = "Color format not recognized. Use HEX (#RRGGBB, #RGB, with optional alpha) or rgb()/rgba().";
const waitMs = 4000;
const scenarios = [
  { name: "healthy", initial: ["healthy-1", "healthy-2"], interactions: true },
  { name: "invalid-first", initial: ["bad-1", "healthy-1", "healthy-2"] },
  { name: "invalid-middle", initial: ["healthy-1", "bad-1", "healthy-2"] },
  { name: "invalid-last", initial: ["healthy-1", "healthy-2", "bad-1"] },
  { name: "multiple-errors", initial: ["bad-1", "healthy-1", "bad-2", "healthy-2", "bad-3", "healthy-3"] },
  { name: "all-invalid", initial: ["bad-1", "bad-2"] },
  { name: "dynamic", initial: [], dynamic: ["bad-1", "healthy-1", "bad-2", "healthy-2"] },
  { name: "invalid-recovery", initial: ["bad-1", "healthy-1"], recovery: true },
];
const records = [];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
let runtime;
let runtimeSHA;
let server;
let base;
let metadata;
let completed = 0;
const started = Date.now();

function markup(id) {
  return `<${tag} id="${id}" locale="en-GB" time-zone="UTC" second="true" width="230" caption="${id}"${id.startsWith("bad-") ? ' background-color="invalid-color"' : ""}></${tag}>`;
}

function documentHTML(scenario) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Standalone clock compatibility</title></head><body>${scenario.initial.map(markup).join("\n")}<script src="/runtime.js"></script></body></html>`;
}

before(async () => {
  runtime = await readFile(runtimePath);
  runtimeSHA = hash(runtime);
  let checkoutCommit = null;
  try { checkoutCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { /* A copied test snapshot need not contain Git metadata. */ }
  metadata = {
    startedAt: new Date(started).toISOString(), checkoutCommit,
    // Do not infer a historical artifact's source from the current checkout HEAD.
    artifactSourceCommit: process.env.SDCW_SOURCE_COMMIT ?? null,
    runtime: { path: runtimePath, bytes: runtime.length, sha256: runtimeSHA },
    runnerSHA256: hash(await readFile(new URL(import.meta.url))),
    node: process.version, playwright: createRequire(import.meta.url)("playwright/package.json").version,
    platform: { system: os.platform(), release: os.release(), architecture: os.arch() },
    engines, scenarios: scenarios.map(scenario => scenario.name), waitMs,
  };
  if (evidenceDirectory) {
    await mkdir(evidenceDirectory, { recursive: true });
    // Refuse to replace a previous acceptance receipt.
    await writeFile(path.join(evidenceDirectory, "RUN.json"), JSON.stringify(metadata, null, 2) + "\n", { flag: "wx" });
  }
  server = createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/runtime.js") {
      response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
      response.end(runtime);
      return;
    }
    const scenario = scenarios.find(value => pathname === `/${value.name}.html`);
    response.writeHead(scenario ? 200 : 404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(scenario ? documentHTML(scenario) : "Not found");
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
  if (!metadata) return;
  const summary = {
    ...metadata, finishedAt: new Date().toISOString(),
    expectedCases: engines.length * scenarios.length,
    completedCases: records.length,
    passedCases: records.filter(record => record.pass).length,
    failedCases: records.filter(record => !record.pass).length,
    pass: records.length === engines.length * scenarios.length && records.every(record => record.pass),
    results: records,
  };
  if (evidenceDirectory) {
    await writeFile(path.join(evidenceDirectory, "RESULT.json"), JSON.stringify(summary, null, 2) + "\n", { flag: "wx" });
  }
  console.log(`Standalone summary: ${summary.passedCases}/${summary.expectedCases} passed, ${summary.failedCases} failed, ${summary.expectedCases - summary.completedCases} missing; runtime SHA-256 ${runtimeSHA}; evidence ${evidenceDirectory ?? "not requested"}`);
});

async function snapshot(page) {
  return page.evaluate(() => ({
    audit: window.__sdcwCompatibilityAudit,
    bridgeVersion: customElements.get("timenow-zone-sdcw")?.sdcwBridgeVersion ?? null,
    runtimeReady: customElements.get("timenow-zone-sdcw")?.runtimeReady ?? null,
    clocks: [...document.querySelectorAll("timenow-zone-sdcw")].map(element => ({
      id: element.id, connected: element.isConnected,
      text: element.shadowRoot?.querySelector("a")?.textContent ?? null,
      version: element.shadowRoot?.querySelector("[data-version]")?.getAttribute("data-version") ?? null,
      width: element.shadowRoot?.querySelector(".widget")?.style.width ?? null,
      caption: element.getAttribute("caption"),
    })),
  }));
}

async function renderedAndTicking(page, ids, record, phase) {
  assert(ids.length > 0, "a ticking check must observe at least one clock");
  await page.waitForFunction(ids => ids.every(id => {
    const anchor = document.getElementById(id)?.shadowRoot?.querySelector("a");
    return anchor && /\d{1,2}:\d{2}:\d{2}/.test(anchor.textContent) && anchor.getBoundingClientRect().width > 0 && anchor.getBoundingClientRect().height > 0;
  }), ids, { timeout: waitMs });
  const before = await page.evaluate(ids => ids.map(id => document.getElementById(id).shadowRoot.querySelector("a").textContent), ids);
  await page.waitForFunction(({ ids, before }) => ids.every((id, index) => document.getElementById(id)?.shadowRoot?.querySelector("a")?.textContent !== before[index]), { ids, before }, { timeout: waitMs });
  record.ticks.push({ phase, ids, before, after: await page.evaluate(ids => ids.map(id => document.getElementById(id).shadowRoot.querySelector("a").textContent), ids) });
}

async function insertClocks(page, ids) {
  await page.evaluate(markup => document.body.insertAdjacentHTML("beforeend", markup), ids.map(markup).join("\n"));
}

async function checkInteractions(page, record) {
  const caption = 'Literal <b>clock</b> "property" 🕒';
  await page.evaluate(caption => {
    const element = document.getElementById("healthy-1");
    element.caption = caption;
    element.setAttribute("width", "320");
  }, caption);
  await page.waitForFunction(caption => {
    const element = document.getElementById("healthy-1");
    return element.shadowRoot.textContent.includes(caption) && element.shadowRoot.querySelector(".widget").style.width === "320px";
  }, caption, { timeout: waitMs });
  assert.equal(await page.locator("#healthy-1").getAttribute("caption"), caption);
  assert.equal(await page.locator("#healthy-1").locator("b").count(), 0, "caption remains literal text");
  await page.evaluate(() => document.getElementById("healthy-1").removeAttribute("width"));
  await page.waitForFunction(() => !document.getElementById("healthy-1").shadowRoot.querySelector(".widget").style.width, null, { timeout: waitMs });
  await checkReconnect(page, "healthy-1");
  assert.equal(await page.locator("#healthy-1").getAttribute("caption"), caption);
  await renderedAndTicking(page, ["healthy-1", "healthy-2", "late-healthy"], record, "after-properties-and-reconnect");
}

async function checkReconnect(page, id) {
  assert.deepEqual(await page.evaluate(id => {
    const element = document.getElementById(id);
    const root = element.shadowRoot;
    element.remove();
    const unmounted = root.querySelector("a") === null;
    document.body.append(element);
    return { unmounted, sameHost: document.getElementById(id) === element, sameRoot: element.shadowRoot === root };
  }, id), { unmounted: true, sameHost: true, sameRoot: true });
}

function checkReadiness(state) {
  if (state.bridgeVersion === 1) {
    assert.equal(state.runtimeReady, true, "individual configuration errors must not block renderer readiness");
    assert.equal(state.audit.events.filter(event => event.kind === "runtime-ready").length, 1);
  }
}

for (const engine of engines) {
  test(`exact standalone runtime: ${engine}`, { timeout: 180000, concurrency: false }, async t => {
    // The chrome gate is branded Google Chrome, never a renamed Chromium run.
    const browser = await browserTypes[engine].launch({ headless: true, timeout: 30000, ...(engine === "chrome" ? { channel: "chrome" } : {}) });
    try {
      for (const scenario of scenarios) {
        await t.test(scenario.name, { timeout: 25000 }, async () => {
          const record = { engine, channel: engine === "chrome" ? "chrome" : null, browserVersion: browser.version(), scenario: scenario.name, pass: false, errors: [], ticks: [] };
          const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
          page.setDefaultTimeout(waitMs);
          page.on("pageerror", error => record.errors.push({ message: error.message, stack: error.stack }));
          try {
            await page.addInitScript(() => {
              const audit = window.__sdcwCompatibilityAudit = { events: [], errors: [] };
              const event = kind => audit.events.push({ kind, milliseconds: performance.now() });
              addEventListener("error", value => {
                audit.errors.push({ message: value.error?.message ?? value.message, milliseconds: performance.now() });
                event("error");
              });
              document.addEventListener("load", value => {
                if (value.target instanceof HTMLScriptElement) event("script-load");
              }, true);
              customElements.whenDefined("timenow-zone-sdcw").then(constructor => {
                event("when-defined");
                if (constructor.whenRuntimeReady) constructor.whenRuntimeReady.then(() => event("runtime-ready"));
              });
            });
            const runtimeResponse = page.waitForResponse(response => response.url() === `${base}/runtime.js`);
            assert.equal((await page.goto(`${base}/${scenario.name}.html`, { waitUntil: "load" })).status(), 200);
            const response = await runtimeResponse;
            const body = await response.body();
            record.response = { url: response.url(), status: response.status(), contentType: response.headers()["content-type"], bytes: body.length, sha256: hash(body) };
            assert.equal(record.response.status, 200);
            assert.match(record.response.contentType, /charset=utf-8/i);
            assert.equal(record.response.bytes, runtime.length);
            assert.equal(record.response.sha256, runtimeSHA, "browser must execute the exact input artifact");
            record.afterLoad = await snapshot(page);
            if (scenario.dynamic) await insertClocks(page, scenario.dynamic);
            const ids = [...scenario.initial, ...(scenario.dynamic ?? [])];
            const healthy = ids.filter(id => !id.startsWith("bad-"));
            const bad = ids.filter(id => id.startsWith("bad-"));
            if (healthy.length) await renderedAndTicking(page, healthy, record, "initial-clocks");
            else checkReadiness(record.afterLoad);
            await insertClocks(page, ["late-healthy"]);
            await renderedAndTicking(page, [...healthy, "late-healthy"], record, "later-healthy-clock");
            if (scenario.interactions) await checkInteractions(page, record);
            if (scenario.recovery) {
              await page.evaluate(() => document.getElementById("bad-1").removeAttribute("background-color"));
              await renderedAndTicking(page, ["bad-1", ...healthy], record, "corrected-invalid-clock");
              await checkReconnect(page, "bad-1");
              await renderedAndTicking(page, ["bad-1", ...healthy], record, "reconnected-corrected-clock");
            }
            const state = await snapshot(page);
            assert.deepEqual(state.audit.errors.map(error => error.message), bad.map(() => colorError), "window error events must remain observable");
            // WebKit's inspector can deduplicate identical exceptions; DOM error events above retain every host's error.
            if (engine === "webkit" && bad.length) {
              assert(record.errors.length >= 1 && record.errors.length <= bad.length, "WebKit must expose the original errors through its inspector");
              assert(record.errors.every(error => error.message === colorError), "unexpected inspector error");
            } else {
              assert.deepEqual(record.errors.map(error => error.message), bad.map(() => colorError), "each invalid host must report its original error exactly once");
            }
            assert.equal(state.audit.events.filter(event => event.kind === "script-load").length, 1);
            assert.equal(state.audit.events.filter(event => event.kind === "when-defined").length, 1);
            checkReadiness(state);
            record.pass = true;
          } catch (error) {
            record.failure = { message: error.message, stack: error.stack };
            if (evidenceDirectory) {
              try { await page.screenshot({ path: path.join(evidenceDirectory, `${engine}-${scenario.name}-failure.png`) }); }
              catch (screenshotError) { record.screenshotError = screenshotError.message; }
            }
            throw error;
          } finally {
            record.finalState = await snapshot(page).catch(error => ({ unavailable: error.message }));
            records.push(record);
            if (evidenceDirectory) await writeFile(path.join(evidenceDirectory, `${engine}-${scenario.name}.json`), JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
            await page.close();
            completed++;
            const elapsed = (Date.now() - started) / 1000;
            const total = engines.length * scenarios.length;
            console.log(`[standalone ${completed}/${total} ${Math.round(completed / total * 100)}%] ${engine}/${scenario.name}: ${record.pass ? "PASS" : "FAIL"}; elapsed ${elapsed.toFixed(1)}s, rate ${(completed / elapsed).toFixed(2)}/s, ETA ${(elapsed / completed * (total - completed)).toFixed(1)}s`);
          }
        });
      }
    } finally { await browser.close(); }
  });
}
