import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox, webkit } from "playwright";

// Input contains only public fixture URLs/counts. No credentials are needed.
const directory = path.resolve(process.argv[2]);
const sites = JSON.parse(await readFile(path.join(directory, "asset-sites.json"), "utf8"));
const selected = (process.env.SDCW_ENGINES || "chromium,webkit").split(",");
const engines = { chromium, firefox, webkit };
const results = [];
const total = selected.length * sites.length;
const start = Date.now();
try {
  for (const name of selected) {
    assert(engines[name], `Unknown engine: ${name}`);
    const browser = await engines[name].launch({ headless: true });
    try {
      for (const site of sites) {
        assert.match(site.url, /^http:\/\/127\.0\.0\.1:\d+$/);
        for (const [fixture, row] of Object.entries(site.cases)) {
          const resources = row.resources ?? Number(row.clocks > 0);
          const context = await browser.newContext();
          try {
            const page = await context.newPage();
            const requests = [];
            const errors = [];
            page.on("request", request => {
              if (request.url().includes("/plugins/simple-digital-clock/")) requests.push(request.url());
            });
            page.on("pageerror", error => errors.push(error.message));
            await page.route("**/*", async route => {
              const url = new URL(route.request().url());
              if (url.origin !== site.url) return route.abort();
              if (process.env.SDCW_PROXY_HOST) {
                assert.equal(process.env.SDCW_PROXY_HOST, "host.docker.internal");
                const proxied = new URL(url);
                proxied.hostname = process.env.SDCW_PROXY_HOST;
                const response = await route.fetch({ url: proxied.href, headers: { ...route.request().headers(), host: url.host } });
                return route.fulfill({ response });
              }
              return route.continue();
            });
            const response = await page.goto(row.url, { waitUntil: "networkidle" });
            assert.equal(response.status(), fixture === "draft" ? 404 : 200, fixture);
            assert.equal(await page.locator("timenow-zone-sdcw").count(), row.clocks, fixture);
            if (row.clocks && resources) {
              await page.waitForFunction(count => [...document.querySelectorAll("timenow-zone-sdcw")].filter(clock => clock.shadowRoot?.querySelector("a")?.textContent?.match(/\d{1,2}:\d{2}/)).length === count, row.clocks);
              const initial = await page.locator("timenow-zone-sdcw").evaluateAll(nodes => nodes.map(node => node.shadowRoot.querySelector("a").textContent));
              await page.waitForFunction(before => [...document.querySelectorAll("timenow-zone-sdcw")].every((clock, index) => clock.shadowRoot.querySelector("a").textContent !== before[index]), initial);
            }
            const scripts = requests.filter(url => url.includes("/assets/public/js/simple-digital-clock.min.js"));
            const styles = requests.filter(url => url.includes("/assets/public/css/simple-digital-clock.css"));
            assert.equal(scripts.length, resources, `${fixture}: actual runtime network requests`);
            assert.equal(styles.length, 0, `${fixture}: no external integration CSS request`);
            assert.equal(requests.length, scripts.length + styles.length, `${fixture}: no admin/editor resources on frontend`);
            assert.equal(await page.locator('script[src*="/plugins/simple-digital-clock/assets/public/js/"]').count(), resources, `${fixture}: script tags`);
            const inline = page.locator('#simple-digital-clock-block-style-inline-css');
            assert.equal(await inline.count(), resources, `${fixture}: inline integration rule appears once`);
            if (row.clocks && resources) {
              assert.match(await inline.textContent(), /display\s*:\s*block/);
              const displays = await page.locator('timenow-zone-sdcw').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).display));
              assert(displays.every(display => display === 'block'), `${fixture}: host layout rule applies`);
            }
            if (row.clocks && !resources) {
              assert.equal(await page.evaluate(() => customElements.get('timenow-zone-sdcw') === undefined), true, 'Unmanaged raw HTML requires explicit enqueue');
            }
            assert.deepEqual(errors, [], fixture);
            results.push({ engine: name, site: site.name, fixture, clocks: row.clocks, scripts: scripts.length, styles: styles.length, expected_resources: resources, inline_styles: await inline.count(), passed: true });
          } finally {
            await context.close();
          }
        }
        const completed = results.length / Object.keys(site.cases).length;
        const elapsed = (Date.now() - start) / 1000;
        console.log(`[${completed}/${total}] ${name} ${site.name}: ${Object.keys(site.cases).length} cases PASS; elapsed=${elapsed.toFixed(1)}s; ETA=${(elapsed / completed * (total - completed)).toFixed(1)}s`);
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await writeFile(path.join(directory, "asset-browser-results.json"), JSON.stringify(results, null, 2) + "\n");
}
