import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";
import { chromium, firefox, webkit } from "playwright";

// These local HTML fixtures exercise the browser loader, not native WordPress.
const loader = await readFile(new URL("../wordpress/simple-digital-clock/assets/public/js/simple-digital-clock-loader.js", import.meta.url), "utf8");
const runtime = await readFile(new URL("../wordpress/simple-digital-clock/assets/public/js/simple-digital-clock.min.js", import.meta.url));
const legacyRuntime = await readFile(new URL("../dist/0.8.1.min.js", import.meta.url));
const integrity = `sha384-${createHash("sha384").update(runtime).digest("base64")}`;
const clock = '<timenow-zone-sdcw time-zone="UTC" locale="en-GB" second="true" period="false" width="180"></timenow-zone-sdcw>';
const nonce = "sdcw-fixture-nonce";

function bootstrap({ markup = "", src = "/runtime.js", existing = "", extra = "", duplicate = false,
    trailing = "", captured, scriptNonce = nonce } = {}) {
  const tags = captured ?? `<script nonce="${nonce}">window.clockOrder = ['before']; window.clockData = { retained: true };</script>
    <script id="simple-digital-clock-js" async nonce="${scriptNonce}" data-core-filter="retained" crossorigin="anonymous"
      referrerpolicy="no-referrer" integrity="${integrity}" src="${src}"></script>
    <script nonce="${nonce}">window.clockOrder.push(customElements.get('timenow-zone-sdcw') ? 'after-defined' : 'after-missing');</script>`;
  const inline = `<script nonce="${nonce}" id="simple-digital-clock-loader-js" src="/loader.js"></script>`;
  const payload = JSON.stringify({ markup: tags }).replace(/[<>&]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>WordPress loader fixture</title><body>
    ${existing}${markup}<script type="application/json" id="simple-digital-clock-runtime">${payload}</script>${inline}${duplicate ? inline : ""}${trailing}${extra}</body></html>`;
}

async function observePage(browser, origin, html, options = {}) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const requests = [];
  const bootstrapRequests = [];
  const errors = [];
  const consoleErrors = [];
  page.on("request", request => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/loader.js") bootstrapRequests.push(request.url());
    else if (pathname.endsWith(".js")) requests.push(request.url());
  });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.addInitScript(({ accelerateTimeout }) => {
    window.clockLoadErrors = [];
    window.clockLoadTimers = 0;
    window.clockIntervals = 0;
    window.clockCspViolations = [];
    document.addEventListener("sdcw:load-error", event => window.clockLoadErrors.push(event.detail.message));
    document.addEventListener("securitypolicyviolation", event => window.clockCspViolations.push(event.violatedDirective));
    const originalTimeout = window.setTimeout;
    const originalInterval = window.setInterval;
    window.setTimeout = function (callback, delay, ...args) {
      if (delay === 15000) window.clockLoadTimers++;
      return originalTimeout(callback, accelerateTimeout && delay === 15000 ? 100 : delay, ...args);
    };
    window.setInterval = function (...args) { window.clockIntervals++; return originalInterval(...args); };
  }, { accelerateTimeout: options.accelerateTimeout ?? false });
  await page.route(`${origin}/fixture`, route => route.fulfill({
    status: 200,
    contentType: "text/html",
    headers: options.csp ? { "Content-Security-Policy": (options.csp === "external" ? "default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; font-src 'none'" : `default-src 'self'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; font-src 'none'`) } : {},
    body: html,
  }));
  await page.goto(`${origin}/fixture`, { waitUntil: "domcontentloaded" });
  return { page, requests, bootstrapRequests, errors, consoleErrors };
}

async function waitForClocks(page, count) {
  await page.waitForFunction(count => {
    const clocks = [...document.querySelectorAll("timenow-zone-sdcw")];
    return clocks.length === count && clocks.every(host => host.shadowRoot?.querySelector("a")?.textContent?.match(/\d{2}:\d{2}:\d{2}/));
  }, count);
}

async function assertReady(context, count = 1) {
  await waitForClocks(context.page, count);
  await context.page.waitForFunction(() => document.getElementById("simple-digital-clock-runtime").dataset.sdcwLoader === "ready");
  assert.deepEqual(context.errors, []);
  assert.deepEqual(await context.page.evaluate(() => window.clockLoadErrors), []);
}

async function assertFailure(context, expression) {
  await context.page.waitForFunction(() => document.getElementById("simple-digital-clock-runtime").dataset.sdcwLoader === "error");
  const messages = await context.page.evaluate(() => window.clockLoadErrors);
  assert.equal(messages.length, 1);
  assert.match(messages[0], expression);
  assert.equal(context.consoleErrors.filter(message => message.startsWith("Simple Digital Clock: ")).length, 1);
  assert.deepEqual(context.errors, []);
}

for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
  test(`${engine}: conditional WordPress loader loads the exact runtime only on use`, { timeout: 60000 }, async t => {
    const server = createServer((request, response) => {
      const pathname = new URL(request.url, "http://localhost").pathname;
      if (pathname === "/missing.js") {
        response.writeHead(404, { "Content-Type": "text/javascript" });
        response.end("Not found");
        return;
      }
      if (pathname === "/hanging.js") return;
      const bodies = {
        "/loader.js": loader, "/runtime.js": runtime, "/delayed.js": runtime, "/legacy.js": legacyRuntime,
        "/empty.js": "/* Deliberately missing initialization. */",
        "/dependency.js": "window.dependencyLoads = (window.dependencyLoads || 0) + 1;",
      };
      if (!Object.hasOwn(bodies, pathname)) {
        response.writeHead(404); response.end("Unknown fixture route"); return;
      }
      const deliver = () => {
        response.writeHead(200, { "Content-Type": "text/javascript", "Cache-Control": "no-store" });
        response.end(bodies[pathname]);
      };
      if (pathname === "/delayed.js" || pathname === "/legacy.js") setTimeout(deliver, 150);
      else deliver();
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const origin = `http://127.0.0.1:${server.address().port}`;
    let browser;
    try {
      browser = await browserType.launch({ headless: true, timeout: 15000 });

      await t.test("server-rendered clocks preserve before/runtime/after order and tick", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock.repeat(3) }));
        try {
          await assertReady(context, 3);
          assert.equal(context.requests.length, 1);
          assert.deepEqual(await context.page.evaluate(() => ({ order: window.clockOrder, data: window.clockData })),
            { order: ["before", "after-defined"], data: { retained: true } });
          const previous = await context.page.locator("timenow-zone-sdcw").first().evaluate(host => host.shadowRoot.querySelector("a").textContent);
          await context.page.waitForFunction(previous => document.querySelector("timenow-zone-sdcw").shadowRoot.querySelector("a").textContent !== previous, previous);
        } finally { await context.page.close(); }
      });

      await t.test("external-only CSP permits raw and dynamic clocks without inline initialization", async () => {
        for (const markup of [clock, ""]) {
          const captured = '<script id="simple-digital-clock-js" src="/runtime.js"></script>';
          const context = await observePage(browser, origin, bootstrap({ markup, captured }), { csp: "external" });
          try {
            if (!markup) await context.page.evaluate(clock => document.body.insertAdjacentHTML("beforeend", clock), clock);
            await assertReady(context);
            assert.equal(context.requests.length, 1);
            assert.equal(context.bootstrapRequests.length, 1);
            assert.deepEqual(await context.page.evaluate(() => window.clockCspViolations), []);
          } finally { await context.page.close(); }
        }
      });

      await t.test("the original first-after-whenDefined integration needs no enqueue workaround", async () => {
        const existing = `<script>customElements.whenDefined('timenow-zone-sdcw').then(()=>{window.auditWhenDefined=true;document.body.insertAdjacentHTML('beforeend',${JSON.stringify(clock)});});</script>`;
        const context = await observePage(browser, origin, bootstrap({ existing }));
        try {
          await assertReady(context);
          assert.equal(await context.page.evaluate(() => window.auditWhenDefined), true);
          assert.equal(context.requests.length, 1);
        } finally { await context.page.close(); }
      });

      for (const mode of ["open", "closed"]) {
        await t.test(`the first clock in an existing ${mode} shadow root renders without document discovery`, async () => {
          const existing = `<script>const host=document.createElement('div');host.id='shadow-host';const root=host.attachShadow({mode:'${mode}'});window.auditShadow=root;root.innerHTML=${JSON.stringify(clock)};document.body.append(host);</script>`;
          const context = await observePage(browser, origin, bootstrap({ existing }));
          try {
            await context.page.waitForFunction(() => window.auditShadow.querySelector('timenow-zone-sdcw')?.shadowRoot?.querySelector('a')?.textContent.match(/\d{2}:\d{2}:\d{2}/));
            assert.equal(context.requests.length, 1);
            assert.deepEqual(context.errors, []);
            assert.deepEqual(await context.page.evaluate(() => window.clockLoadErrors), []);
          } finally { await context.page.close(); }
        });
      }

      await t.test("empty, inert, foreign and removed clocks make no runtime request or polling timer", async () => {
        const inert = `<template>${clock}</template><pre>&lt;timenow-zone-sdcw&gt;&lt;/timenow-zone-sdcw&gt;</pre>
          <!-- ${clock} --><script type="application/json">${JSON.stringify(clock)}</script><textarea>${clock}</textarea>`;
        const context = await observePage(browser, origin, bootstrap({ markup: inert }));
        try {
          await context.page.evaluate(clock => {
            const removed = document.createElement("div");
            removed.innerHTML = clock;
            document.body.appendChild(removed);
            removed.remove();
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "timenow-zone-sdcw"));
            document.body.appendChild(svg);
            const inert = document.createElement("template");
            inert.innerHTML = clock;
            document.body.appendChild(inert);
          }, clock);
          await context.page.waitForTimeout(120);
          assert.equal(context.requests.length, 0);
          assert.equal(context.bootstrapRequests.length, 1);
          assert.equal(await context.page.evaluate(() => customElements.get("timenow-zone-sdcw").runtimeReady), false);
          assert.deepEqual(await context.page.evaluate(() => ({ state: document.getElementById("simple-digital-clock-runtime").dataset.sdcwLoader,
            timers: window.clockLoadTimers, intervals: window.clockIntervals, order: window.clockOrder ?? null })),
          { state: "waiting", timers: 0, intervals: 0, order: null });
          assert.deepEqual(context.errors, []);
        } finally { await context.page.close(); }
      });

      await t.test("late fragments and simultaneous additions load once, including duplicate bootstrap", async () => {
        const context = await observePage(browser, origin, bootstrap({ src: "/delayed.js", duplicate: true }));
        try {
          assert.equal(context.requests.length, 0);
          await context.page.evaluate(clock => {
            for (let index = 0; index < 5; index++) {
              const fragment = document.createElement("section");
              fragment.innerHTML = `<div>${clock}</div>`;
              document.body.appendChild(fragment);
            }
          }, clock);
          await assertReady(context, 5);
          await context.page.evaluate(clock => document.body.insertAdjacentHTML("beforeend", clock), clock);
          await waitForClocks(context.page, 6);
          assert.equal(context.requests.length, 1);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before", "after-defined"]);
        } finally { await context.page.close(); }
      });

      await t.test("clock-free transformed markup cannot trigger speculative runtime fetching", async () => {
        const captured = '<div>Unexpected optimizer output</div><script src="/runtime.js"></script>';
        const context = await observePage(browser, origin, bootstrap({ captured }));
        try {
          await context.page.waitForTimeout(120);
          assert.equal(context.requests.length, 0);
          assert.equal(await context.page.evaluate(() => window.clockLoadTimers), 0);
          assert.equal(await context.page.evaluate(() => document.getElementById("simple-digital-clock-runtime").dataset.sdcwLoader), "waiting");
          await context.page.evaluate(clock => document.body.insertAdjacentHTML("beforeend", clock), clock);
          await assertFailure(context, /unsupported/);
          assert.equal(context.requests.length, 0);
        } finally { await context.page.close(); }
      });

      await t.test("clocks parsed after the bootstrap are discovered", async () => {
        const context = await observePage(browser, origin, bootstrap({ trailing: clock }));
        try { await assertReady(context); assert.equal(context.requests.length, 1); }
        finally { await context.page.close(); }
      });

      for (const identity of ["Core handle", "normalized URL"]) {
        await t.test(`an existing async runtime is reused by ${identity}`, async () => {
          const existing = `<script async ${identity === "Core handle" ? 'id="simple-digital-clock-js"' : 'id="independent-runtime"'} src="/delayed.js#existing"></script>`;
          const context = await observePage(browser, origin, bootstrap({ markup: clock,
            src: identity === "Core handle" ? "/runtime.js" : "/delayed.js#captured", existing }));
          try {
            await assertReady(context);
            assert.equal(context.requests.length, 1);
            assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
          } finally { await context.page.close(); }
        });
      }

      for (const identity of ["Core handle", "normalized URL"]) {
        await t.test(`a pending immutable legacy runtime retains ownership by ${identity}`, async () => {
          const existing = `<script async id="${identity === "Core handle" ? "simple-digital-clock-js" : "legacy-owner"}" src="/legacy.js"></script>
            <script>customElements.whenDefined('timenow-zone-sdcw').then(()=>document.body.insertAdjacentHTML('beforeend',${JSON.stringify(clock)}));</script>`;
          const context = await observePage(browser, origin, bootstrap({ existing,
            src: identity === "Core handle" ? "/runtime.js" : "/legacy.js" }));
          try {
            await assertReady(context);
            assert.equal(context.requests.length, 1);
            assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
          } finally { await context.page.close(); }
        });
      }

      for (const src of ["/delayed.js", "/legacy.js"]) {
      await t.test(`a native ${src} runtime tag after the bootstrap keeps its ownership`, async () => {
        const trailing = `<script async id="simple-digital-clock-js" src="${src}"></script>`;
        const context = await observePage(browser, origin, bootstrap({ markup: clock, trailing }));
        try {
          await assertReady(context);
          assert.equal(context.requests.length, 1);
          assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
        } finally { await context.page.close(); }
      });
      }

      await t.test("an existing dependency is not mistaken for the clock runtime", async () => {
        const captured = '<script src="/dependency.js"></script><script id="simple-digital-clock-js" src="/runtime.js"></script>';
        const context = await observePage(browser, origin, bootstrap({ markup: clock, captured, existing: '<script src="/dependency.js"></script>' }));
        try {
          await assertReady(context);
          assert.equal(context.requests.filter(url => new URL(url).pathname === "/runtime.js").length, 1);
          assert.equal(await context.page.evaluate(() => window.dependencyLoads), 2);
        } finally { await context.page.close(); }
      });

      await t.test("an unrelated malformed script URL does not prevent clock loading", async () => {
        const existing = '<script type="application/json" src="http://["></script>';
        const context = await observePage(browser, origin, bootstrap({ markup: clock, existing }));
        try {
          await assertReady(context);
          assert.equal(context.requests.length, 1);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before", "after-defined"]);
        } finally { await context.page.close(); }
      });

      await t.test("a malformed selected runtime URL fails before fetching or executing attached data", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, src: "http://[" }));
        try {
          await assertFailure(context, /invalid script URL/);
          assert.equal(context.requests.length, 0);
          assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
        } finally { await context.page.close(); }
      });

      await t.test("an already registered element skips the captured runtime and data", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, existing: '<script src="/runtime.js"></script>' }));
        try {
          await assertReady(context);
          assert.equal(context.requests.length, 1);
          assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
          assert.equal(await context.page.evaluate(() => window.clockLoadTimers), 0);
        } finally { await context.page.close(); }
      });

      await t.test("strict nonce CSP and Core script attributes survive activation", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock }), { csp: true });
        try {
          await assertReady(context);
          const attributes = await context.page.locator("script#simple-digital-clock-js").evaluate(script => ({
            nonce: script.nonce, async: script.async, integrity: script.integrity, crossOrigin: script.crossOrigin,
            referrerPolicy: script.referrerPolicy, filtered: script.dataset.coreFilter,
          }));
          assert.deepEqual(attributes, { nonce, async: true, integrity, crossOrigin: "anonymous", referrerPolicy: "no-referrer", filtered: "retained" });
          assert.deepEqual(await context.page.evaluate(() => window.clockCspViolations), []);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before", "after-defined"]);
          assert.equal(context.requests.length, 1);
        } finally { await context.page.close(); }
      });

      await t.test("network failure is reported once without after-data execution or retries", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, src: "/missing.js" }));
        try {
          await assertFailure(context, /Unable to load/);
          await context.page.evaluate(clock => document.body.insertAdjacentHTML("beforeend", clock), clock);
          await context.page.waitForTimeout(120);
          assert.equal(context.requests.length, 1);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before"]);
          assert.equal(await context.page.evaluate(() => window.clockLoadErrors.length), 1);
        } finally { await context.page.close(); }
      });

      await t.test("an unresponsive runtime reaches the load timeout without retrying", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, src: "/hanging.js" }), { accelerateTimeout: true });
        try {
          await assertFailure(context, /Timed out/);
          await context.page.evaluate(clock => document.body.insertAdjacentHTML("beforeend", clock), clock);
          await context.page.waitForTimeout(120);
          assert.equal(context.requests.length, 1);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before"]);
          assert.equal(await context.page.evaluate(() => window.clockLoadErrors.length), 1);
        } finally { await context.page.close(); }
      });

      await t.test("a fetched script that omits registration reports an explicit error", async () => {
        const captured = '<script id="simple-digital-clock-js" src="/empty.js"></script>';
        const context = await observePage(browser, origin, bootstrap({ markup: clock, captured }));
        try {
          await assertFailure(context, /did not initialize/);
          assert.equal(context.requests.length, 1);
        } finally { await context.page.close(); }
      });

      await t.test("a failed existing runtime is not replaced by a duplicate", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, existing: '<script src="/missing.js" id="simple-digital-clock-js"></script>' }), { accelerateTimeout: true });
        try {
          await assertFailure(context, /Timed out|Unable to load/);
          assert.equal(context.requests.length, 1);
          assert.equal(await context.page.evaluate(() => window.clockOrder ?? null), null);
        } finally { await context.page.close(); }
      });

      await t.test("a completed script without registration reaches a bounded error", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, existing: '<script src="/empty.js" id="simple-digital-clock-js"></script>' }), { accelerateTimeout: true });
        try {
          await assertFailure(context, /Timed out/);
          assert.equal(context.requests.length, 1);
        } finally { await context.page.close(); }
      });

      await t.test("CSP refusal reports failure without bypassing the policy", async () => {
        const context = await observePage(browser, origin, bootstrap({ markup: clock, scriptNonce: "wrong-nonce" }), { csp: true });
        try {
          await assertFailure(context, /Unable to load/);
          assert.ok((await context.page.evaluate(() => window.clockCspViolations)).length > 0);
          assert.equal(await context.page.evaluate(() => !!customElements.get("timenow-zone-sdcw")?.runtimeReady), false);
          assert.deepEqual(await context.page.evaluate(() => window.clockOrder), ["before"]);
        } finally { await context.page.close(); }
      });

      for (const [name, captured] of [
        ["consent-transformed script", '<script type="text/plain" data-src="/runtime.js"></script>'],
        ["non-script markup", '<div>Unexpected optimizer output</div><script src="/runtime.js"></script>'],
      ]) {
        await t.test(`${name} fails closed without fetching a runtime`, async () => {
          const context = await observePage(browser, origin, bootstrap({ markup: clock, captured }));
          try {
            await assertFailure(context, /unsupported/);
            assert.equal(context.requests.length, 0);
          } finally { await context.page.close(); }
        });
      }
    } finally {
      if (browser) await browser.close();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  });
}
