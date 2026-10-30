import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";
import { chromium, firefox, webkit } from "playwright";

// Local fonts make the metric change deterministic without a Google Fonts network dependency.
const fontStylesheet = `@font-face {
  font-family: "Martian Mono";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local("Liberation Mono"), local("DejaVu Sans Mono"), local("Menlo"), local("Monaco"), local("Courier New");
  size-adjust: 180%;
}`;

async function measureClocks(page) {
  return page.evaluate(() => [...document.querySelectorAll("timenow-zone-sdcw")].map(host => {
    const container = host.shadowRoot.querySelector(".widget");
    const time = host.shadowRoot.querySelector("a");
    const height = time.getBoundingClientRect().height;
    const whiteSpace = time.style.getPropertyValue("white-space");
    const priority = time.style.getPropertyPriority("white-space");
    time.style.setProperty("white-space", "nowrap", "important");
    const natural = time.getBoundingClientRect();
    if (whiteSpace) time.style.setProperty("white-space", whiteSpace, priority);
    else time.style.removeProperty("white-space");
    return {
      id: host.id,
      text: time.textContent,
      fontSize: parseFloat(getComputedStyle(time).fontSize),
      width: container.clientWidth,
      height,
      naturalHeight: natural.height,
      naturalWidth: natural.width,
    };
  }));
}

function assertClocksFit(clocks, stage) {
  assert.equal(clocks.length, 2, `${stage}: both clocks are present`);
  for (const clock of clocks) {
    assert.ok(Math.abs(clock.height - clock.naturalHeight) < 0.1,
      `${stage}, ${clock.id}: time stays on one line (${JSON.stringify(clock)})`);
    assert.ok(clock.naturalWidth <= clock.width + 0.5,
      `${stage}, ${clock.id}: time fits its container (${JSON.stringify(clock)})`);
  }
}

async function fontDiagnostics(page) {
  return page.evaluate(() => ({
    fontStatus: document.fonts.status,
    faces: [...document.fonts].map(face => ({ family: face.family, status: face.status, sizeAdjust: face.sizeAdjust })),
    samples: [...document.querySelectorAll("timenow-zone-sdcw")].map(host => {
      const time = host.shadowRoot.querySelector("a");
      if (!time) return { id: host.id };
      const previous = time.getAttribute("style");
      try {
        time.style.setProperty("white-space", "nowrap", "important");
        return {
          id: host.id,
          fontFamily: getComputedStyle(time).fontFamily,
          widths: [parseFloat(getComputedStyle(time).fontSize), 16.363636, 15.6636, 15, 14.5, 14, 13].map(size => {
            time.style.setProperty("font-size", `${size}px`, "important");
            return { size, layoutWidth: time.offsetWidth, width: time.getBoundingClientRect().width };
          }),
        };
      } finally {
        if (previous === null) time.removeAttribute("style");
        else time.setAttribute("style", previous);
      }
    }),
  }));
}

function registerFontTest(engine, browserType, pendingUnrelatedFont = false) {
  const scenario = pendingUnrelatedFont ? "independently of unrelated pending fonts" : "after a delayed font and locale changes";
  test(`${engine}: production clocks refit ${scenario}`, { timeout: 60000 }, async () => {
    const bundle = await readFile(new URL("../dist/latest.min.js", import.meta.url));
    const html = `<!doctype html><html lang="en"><meta charset="utf-8">
      <style>body { margin: 20px; } timenow-zone-sdcw { display: block; margin-bottom: 20px; }</style>
      <timenow-zone-sdcw id="ordinary" width="80" time-zone="UTC" locale="bg-BG" period="true" second="true" font-family="Martian Mono"></timenow-zone-sdcw>
      <timenow-zone-sdcw id="hundredths" width="180" time-zone="UTC" locale="en-GB" period="false" hundredths="true" font-family="Martian Mono"></timenow-zone-sdcw>
      <script src="/widget.js"></script></html>`;
    const server = createServer((request, response) => {
      const isBundle = request.url === "/widget.js";
      response.writeHead(200, { "Content-Type": isBundle ? "text/javascript" : "text/html", "Cache-Control": "no-store" });
      response.end(isBundle ? bundle : html);
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    let releaseStylesheet;
    const stylesheetGate = new Promise(resolve => { releaseStylesheet = resolve; });
    let releaseUnrelatedFont;
    const unrelatedFontGate = new Promise(resolve => { releaseUnrelatedFont = resolve; });
    let browser;
    let page;
    const errors = [];
    try {
      browser = await browserType.launch({ headless: true });
      page = await browser.newPage({ viewport: { width: 800, height: 600 } });
      page.setDefaultTimeout(5000);
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      await page.route("https://fonts.googleapis.com/**", async route => {
        await stylesheetGate;
        await route.fulfill({ status: 200, contentType: "text/css", body: fontStylesheet });
      });
      await page.route("**/unrelated-font.ttf", async route => {
        await unrelatedFontGate;
        await route.abort();
      });
      await page.addInitScript(() => {
        const OriginalDate = Date;
        const timestamp = OriginalDate.UTC(2026, 9, 30, 12, 41, 14, 690);
        window.Date = new Proxy(OriginalDate, {
          construct(target, args, newTarget) { return Reflect.construct(target, args.length ? args : [timestamp], newTarget); },
          apply() { return new OriginalDate(timestamp).toString(); },
          get(target, key, receiver) { return key === "now" ? () => timestamp : Reflect.get(target, key, receiver); },
        });
      });
      // WebKit can delay DOMContentLoaded while the dynamically inserted stylesheet is held.
      await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "commit" });
      await page.waitForFunction(() => {
        const clocks = [...document.querySelectorAll("timenow-zone-sdcw")];
        return clocks.length === 2 && clocks.every(host => host.shadowRoot?.querySelector("a")?.textContent?.includes("41"));
      }, undefined, { polling: 20 });
      const before = await measureClocks(page);

      if (pendingUnrelatedFont) {
        const unrelatedRequest = page.waitForRequest("**/unrelated-font.ttf");
        await page.evaluate(() => {
          window.unrelatedFontFace = new FontFace("Unrelated", `url("${location.origin}/unrelated-font.ttf")`);
          document.fonts.add(window.unrelatedFontFace);
          // The controlled request is aborted only after the assertions and cleanup.
          void window.unrelatedFontFace.load().catch(() => {});
        });
        await unrelatedRequest;
      }
      releaseStylesheet();
      await page.waitForFunction(() => [...document.fonts].some(face => face.family.includes("Martian Mono") && face.status === "loaded"), undefined, { polling: 20 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      if (pendingUnrelatedFont) assert.deepEqual(await page.evaluate(() => ({ face: window.unrelatedFontFace.status, set: document.fonts.status })),
        { face: "loading", set: "loading" }, `${engine}: the unrelated font remains pending`);
      const after = await measureClocks(page);
      assertClocksFit(after, `${engine}, loaded font`);
      for (const clock of after) {
        const previous = before.find(item => item.id === clock.id);
        assert.ok(clock.fontSize < previous.fontSize - 0.5,
          `${engine}, ${clock.id}: the loaded font requires a real metric refit`);
      }

      await page.evaluate(() => {
        document.getElementById("ordinary").setAttribute("locale", "ko-KR");
        document.getElementById("hundredths").setAttribute("locale", "bg-BG");
        document.getElementById("hundredths").setAttribute("period", "true");
      });
      await page.waitForFunction(() => document.getElementById("ordinary").shadowRoot.querySelector("a").textContent.includes("오후"));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assertClocksFit(await measureClocks(page), `${engine}, changed locale`);

      await page.evaluate(() => {
        for (const clock of document.querySelectorAll("timenow-zone-sdcw")) {
          clock.remove();
          document.body.appendChild(clock);
        }
      });
      await page.waitForFunction(() => {
        const clocks = [...document.querySelectorAll("timenow-zone-sdcw")];
        return clocks.length === 2 && clocks.every(host => host.shadowRoot?.querySelector("a")?.textContent?.includes("41"));
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assertClocksFit(await measureClocks(page), `${engine}, reconnected`);
      assert.deepEqual(errors, [], `${engine}: no browser or font loading errors`);
    } catch (error) {
      if (page && !page.isClosed()) console.error(JSON.stringify({ engine, errors, clocks: await measureClocks(page).catch(() => []),
        fonts: await fontDiagnostics(page).catch(() => null) }));
      throw error;
    } finally {
      releaseStylesheet();
      if (page && !page.isClosed()) await page.evaluate(() => {
        if (window.unrelatedFontFace) document.fonts.delete(window.unrelatedFontFace);
      });
      releaseUnrelatedFont();
      if (page) await page.unrouteAll({ behavior: "wait" });
      if (browser) await browser.close();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  });
}

for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) registerFontTest(engine, browserType);
// This pending-face regression is reproduced in Chromium. The base font cases run in every engine.
registerFontTest("chromium", chromium, true);
