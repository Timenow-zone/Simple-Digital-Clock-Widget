import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { chromium, firefox, webkit } from "playwright";

const root = process.cwd();
const directory = path.join(root, "product-dist");
const origin = "https://simple-digital-clock-widget.yuri.ws";
const { version } = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
let server;
let base;

before(async () => {
  execFileSync(process.execPath, ["scripts/build-product-site.mjs", "--build"], { cwd: root });
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const file = path.resolve(directory, "." + (pathname === "/" ? "/index.html" : pathname));
      if (!file.startsWith(directory + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };
      response.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "text/plain" });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
  test(`generated demo examples and controls use the accepted widget: ${engine}`, { timeout: 60000 }, async () => {
    const browser = await type.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      // Keep remote-font availability outside this deterministic site contract.
      await context.route("https://fonts.googleapis.com/**", (route) => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      assert.equal((await page.goto(base, { waitUntil: "domcontentloaded" })).status(), 200);
      await page.waitForFunction(() => [...document.querySelectorAll("timenow-zone-sdcw")].length === 11 && [...document.querySelectorAll("timenow-zone-sdcw")].every((clock) => clock.shadowRoot?.querySelector("a")?.textContent?.match(/\d{1,2}:\d{2}/)));
      const clocks = await page.locator("timenow-zone-sdcw").evaluateAll((nodes) => nodes.map((node) => node.shadowRoot.querySelector("a").textContent));
      await page.waitForFunction((before) => [...document.querySelectorAll("timenow-zone-sdcw")].every((clock, index) => clock.shadowRoot.querySelector("a").textContent !== before[index]), clocks);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), origin + "/");
      assert.equal(await page.locator('script[src*="simple-digital-clock-widget-"]').getAttribute("src"), `/assets/simple-digital-clock-widget-${version}.min.js`);
      assert.equal(await page.getByRole("link", { name: "Try the WordPress preview ↗", exact: true }).getAttribute("href"), "https://wordpress.org/plugins/simple-digital-clock/?preview=1");
      await page.selectOption("#timezoneControl", "Europe/Kyiv");
      await page.selectOption("#localeControl", "uk-UA");
      await page.locator("#captionControl").fill('Kyiv <clock> "literal"');
      assert.equal(await page.locator("#builderClock").getAttribute("time-zone"), "Europe/Kyiv");
      assert.equal(await page.locator("#builderClock").getAttribute("locale"), "uk-UA");
      assert.equal(await page.locator("#builderClock").getAttribute("caption"), 'Kyiv <clock> "literal"');
      await page.locator("#hundredthsControl").check();
      assert.equal(await page.locator("#secondsControl").isChecked(), true);
      assert((await page.locator("#embedCode").textContent()).includes(`simple-digital-clock-widget-${version}.min.js`));
      assert((await page.locator("#embedCode").textContent()).includes("&lt;clock&gt;"));
      await page.locator("#resetBuilder").click();
      assert.equal(await page.locator("#captionControl").inputValue(), "London");
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator("timenow-zone-sdcw").count(), 11);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
