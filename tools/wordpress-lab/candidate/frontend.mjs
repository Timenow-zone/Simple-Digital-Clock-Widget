// Adapted from corrected independent RC1 methods; results are never inherited.
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
const { values: args } = parseArgs({
  options: {
    "run-dir": { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chromium" },
    theme: { type: "string", default: "block" },
  },
});
const root = path.resolve(args["run-dir"]);
const phase = args.label,
  engine = args.engine;
assert(/^[a-z0-9][a-z0-9-]+$/.test(phase));
assert(["block", "classic"].includes(args.theme));
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
const output = path.join(root, "evidence", `${phase}-frontend-${engine}`);
await fs.mkdir(output);
const browser = await { chromium, firefox, webkit }[engine].launch({ headless: true });
const rows = [];
const started = Date.now();
await fs.copyFile(fileURLToPath(import.meta.url), path.join(output, "harness-frontend.mjs"));
try {
  for (const [site, url] of Object.entries(
    Object.fromEntries(Object.entries(run.sites).map(([name, value]) => [name, value.url]))
  )) {
    const catalog = JSON.parse(
      await fs.readFile(path.join(root, `evidence/baseline112-seed-chromium/${site}-catalog.json`))
    );
    const seed = JSON.parse(
      JSON.parse(await fs.readFile(path.join(root, `evidence/${site}-integration-seed.json`)))
        .stdout
    );
    const cases = [
      ...catalog
        .filter((c) => ["posts", "pages"].includes(c.type))
        .map((c) => ({
          name: c.role + "-" + c.group,
          url: url + "/?p=" + c.id,
          count: c.baseline.clocks.length,
        })),
      { name: "custom-html-page", url: url + "/?page_id=" + seed.custom_html_page, count: 2 },
      ...Object.entries({
        widgets: 5,
        raw: 2,
        pattern: 4,
        "template-part": 1,
        "native-pattern": 3,
        "native-template-part": args.theme === "classic" ? 0 : 1,
        late: 1,
        explicit: 1,
        "late-explicit": 2,
        dependencies: 1,
        "capture-dependencies": 1,
        empty: 0,
        escaped: 0,
      }).map(([name, count]) => ({ name, url: url + "/?audit_case=" + name, count })),
    ];
    for (const c of cases) {
      const row = { site, case: c.name, pass: false };
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        serviceWorkers: "block",
        timezoneId: "Europe/Kyiv",
      });
      await ctx.route("**/*", (r) => {
        let u = new URL(r.request().url());
        return u.origin === url || !["http:", "https:"].includes(u.protocol)
          ? r.continue()
          : r.abort();
      });
      const page = await ctx.newPage();
      row.requests = [];
      row.responses = [];
      row.errors = [];
      const responseTasks = [];
      page.on("request", (r) => {
        if (r.url().includes("simple-digital-clock.min.js")) row.requests.push(r.url());
      });
      page.on("pageerror", (e) => row.errors.push(e.message));
      page.on("response", (r) => {
        if (r.url().includes("/simple-digital-clock/"))
          responseTasks.push(
            (async () => {
              const bytes = await r.body().catch(() => null);
              row.responses.push({
                url: r.url(),
                status: r.status(),
                sha256: bytes && createHash("sha256").update(bytes).digest("hex"),
              });
            })()
          );
      });
      try {
        await page.addInitScript(() => {
          const OriginalDate = Date;
          const fixed = Date.parse("2026-11-12T12:34:56.780Z");
          window.Date = class extends OriginalDate {
            constructor(...args) {
              super(...(args.length ? args : [fixed]));
            }
            static now() {
              return fixed;
            }
          };
        });
        const res = await page.goto(c.url, { waitUntil: "load" });
        row.status = res.status();
        await fs.writeFile(path.join(output, `${site}-${c.name}.html`), await res.text());
        if (c.count)
          await page.waitForFunction(
            (n) => {
              const es = [...document.querySelectorAll("timenow-zone-sdcw")];
              return es.length === n && es.every((e) => !!e.shadowRoot?.querySelector("a"));
            },
            c.count,
            { timeout: 30000 }
          );
        else await page.waitForTimeout(400);
        row.clocks = await page.locator("timenow-zone-sdcw").evaluateAll((es) =>
          es.map((e) => {
            const a = e.shadowRoot?.querySelector("a");
            const box = e.shadowRoot?.querySelector(".widget");
            const styles = box ? getComputedStyle(box) : null;
            return {
              attributes: Object.fromEntries([...e.attributes].map((a) => [a.name, a.value])),
              rendered: !!a,
              time: a?.textContent,
              caption: a?.previousElementSibling?.textContent,
              version: box?.getAttribute("data-version"),
              width: box?.getBoundingClientRect().width,
              height: box?.getBoundingClientRect().height,
              styles: styles
                ? {
                    background: styles.background,
                    borderRadius: styles.borderRadius,
                    fontFamily: getComputedStyle(a).fontFamily,
                  }
                : null,
            };
          })
        );
        assert.equal(row.clocks.length, c.count);
        for (const clock of row.clocks) {
          assert(clock.rendered);
          assert(clock.width > 0 && clock.height > 0);
          if (clock.attributes.caption) assert.equal(clock.caption, clock.attributes.caption);
        }
        if (!phase.startsWith("baseline112")) {
          assert.equal(row.requests.length, c.count ? 1 : 0);
          assert.equal(row.errors.length, 0);
        }
        row.coreOrder = await page.evaluate(() => ({
          order: window.auditOrder,
          after: window.auditAfter,
        }));
        if (["dependencies", "capture-dependencies"].includes(c.name)) {
          assert.deepEqual(row.coreOrder.order, ["dependency", "before", "after"]);
          assert.deepEqual(row.coreOrder.after, { defined: true, data: "Localized caption" });
        }
        if (c.name === "admin-normal" || c.name === "widgets")
          await page.screenshot({
            path: path.join(output, `${site}-${c.name}.png`),
            fullPage: true,
          });
        row.pass = true;
      } catch (e) {
        row.error = e.stack;
      } finally {
        await Promise.allSettled(responseTasks);
        await ctx.close();
      }
      rows.push(row);
      await fs.writeFile(
        path.join(output, "results.json"),
        JSON.stringify({ phase, engine, browserVersion: browser.version(), rows }, null, 2) + "\n"
      );
      console.log(
        `[${rows.length}] ${site}/${c.name} ${row.pass ? "PASS" : "FAIL"} requests=${row.requests.length} elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`
      );
    }
    const nonhtml = [
      ["rest", "/?rest_route=/wp/v2/posts"],
      ["feed", "/?feed=rss2"],
      ["robots", "/?robots=1"],
      ["trackback", "/wp-trackback.php"],
      ["json", "/?audit_case=json"],
      ["xml", "/?audit_case=xml"],
    ];
    const ctx = await browser.newContext();
    for (const [name, suffix] of nonhtml) {
      const response = await ctx.request.get(url + suffix);
      const body = await response.text();
      await fs.writeFile(path.join(output, `${site}-${name}.body`), body);
      const row = {
        site,
        case: name,
        url: response.url(),
        status: response.status(),
        contentType: response.headers()["content-type"],
        loaderLeaked:
          body.includes("simple-digital-clock-loader.js") ||
          body.includes('id="simple-digital-clock-runtime"') ||
          body.includes('id=\"simple-digital-clock-runtime\"'),
        pass: true,
      };
      row.pass = !row.loaderLeaked;
      rows.push(row);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(output, "results.json"),
  JSON.stringify({ phase, engine, browserVersion: browser.version(), rows }, null, 2) + "\n"
);
console.log(
  JSON.stringify({ cases: rows.length, failed: rows.filter((r) => !r.pass).length, output })
);
process.exitCode = rows.some((r) => !r.pass) ? 1 : 0;
