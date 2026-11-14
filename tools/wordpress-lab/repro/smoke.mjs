import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const directory = path.resolve(process.argv[2]);
const sites = JSON.parse(await readFile(path.join(directory, "sites.json"), "utf8"));
const results = [];
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true });
  try {
    for (const [name, site] of Object.entries(sites)) {
      const snapshot = JSON.parse(
        await readFile(path.join(directory, `${name}-reupdate-after.json`), "utf8")
      );
      const post = snapshot.posts.find((row) => row.post_title === "Reproducible clock fixture");
      assert(post, "The seeded post must exist");
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        return url.origin === site.url ? route.continue() : route.abort();
      });
      assert.equal(
        (await page.goto(`${site.url}/?p=${post.ID}`, { waitUntil: "domcontentloaded" })).status(),
        200
      );
      const clock = page.locator("timenow-zone-sdcw").first();
      await clock.waitFor();
      await page.waitForFunction(() =>
        document
          .querySelector("timenow-zone-sdcw")
          ?.shadowRoot?.querySelector("a")
          ?.textContent?.match(/\d{1,2}:\d{2}/)
      );
      const before = await clock.evaluate((node) => node.shadowRoot.querySelector("a").textContent);
      await page.waitForFunction(
        (value) =>
          document.querySelector("timenow-zone-sdcw").shadowRoot.querySelector("a").textContent !==
          value,
        before
      );
      const scripts = await page
        .locator("script[src]")
        .evaluateAll((nodes) => nodes.map((node) => node.src));
      assert(
        scripts.some((src) =>
          src.includes(
            "/simple-digital-clock/assets/public/js/simple-digital-clock.min.js?ver=0.8.1"
          )
        )
      );
      assert.deepEqual(errors, []);
      results.push({
        engine,
        site: name,
        ticking: true,
        candidate_asset_reference: true,
        page_errors: errors,
      });
      console.log(`[${results.length}/4] ${engine} ${name}: PASS`);
      await page.close();
    }
  } finally {
    await browser.close();
    await writeFile(
      path.join(directory, "browser-smoke.json"),
      JSON.stringify(results, null, 2) + "\n"
    );
  }
}
