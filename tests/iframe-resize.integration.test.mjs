import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import { chromium, firefox, webkit } from "playwright";

// Use the actual production bundle and CSS; WTR's virtual CSS cannot cover this regression.
for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
  test(`${engine}: production clocks fit inside iframes without observer errors`, { timeout: 60000 }, async () => {
    const routes = new Map(await Promise.all([
      ["/", new URL("./fixtures/iframe-layout.html", import.meta.url), "text/html"],
      ["/frame.html", new URL("./fixtures/iframe-clock.html", import.meta.url), "text/html"],
      ["/widget.js", new URL("../dist/latest.min.js", import.meta.url), "text/javascript"],
    ].map(async ([route, file, type]) => [route, { body: await readFile(file), type }])));
    const server = createServer((request, response) => {
      const resource = routes.get(request.url);
      response.writeHead(resource ? 200 : 404, { "Content-Type": resource?.type ?? "text/plain", "Cache-Control": "no-store" });
      response.end(resource?.body ?? "Not found");
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    let browser;
    try {
      browser = await browserType.launch({ headless: true });
      for (let visit = 0; visit < 5; visit++) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        page.setDefaultTimeout(5000);
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        try {
          await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "load" });
          await page.waitForFunction(() => window.clockLayoutReady);
          assert.deepEqual(errors, [], `${engine}, visit ${visit}: page errors`);
          assert.deepEqual(await page.evaluate(() => window.allClockErrors()), [], `${engine}, visit ${visit}: child-window errors`);
          for (const width of [240, 480, 120, 600]) {
            await page.evaluate(width => window.setClockWidth(width), width);
            await page.waitForFunction(width => window.measureClocks().every(clock => clock.width === width && Math.abs(clock.font - width / 7) < 0.01), width);
          }
          // Resizing the outer viewport produces real resize events in the iframe windows.
          await page.setViewportSize({ width: 1200, height: 850 });
          await page.evaluate(() => window.setClockWidth(240));
          await page.waitForFunction(() => window.measureClocks().every(clock => clock.width === 240 && Math.abs(clock.font - 240 / 7) < 0.01));
          for (const frame of page.frames().slice(1)) {
            await frame.evaluate(() => { document.getElementById("parent").style.display = "none"; });
            await frame.waitForFunction(() => document.querySelector("timenow-zone-sdcw").shadowRoot.querySelector(".widget").offsetWidth === 0);
            await frame.evaluate(() => { document.getElementById("parent").style.display = "block"; });
          }
          await page.waitForFunction(() => window.measureClocks().every(clock => clock.width === 240 && Math.abs(clock.font - 240 / 7) < 0.01));
          await page.waitForTimeout(100);
          assert.deepEqual(errors, []);
          assert.deepEqual(await page.evaluate(() => window.allClockErrors()), []);
        } catch (error) {
          console.error(JSON.stringify({ engine, visit, errors, state: await page.evaluate(() => ({ clocks: window.measureClocks?.(), errors: window.allClockErrors?.() })) }));
          throw error;
        } finally { await page.close(); }
      }
    } finally {
      if (browser) await browser.close();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  });
}
