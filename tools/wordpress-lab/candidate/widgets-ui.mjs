// Adapted from corrected canonical-widget native completion checks.
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { chromium, firefox, webkit } from "playwright";
import { parseArgs } from "node:util";
const { values: args, tokens } = parseArgs({
  tokens: true,
  options: {
    "run-dir": { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chromium" },
    site: { type: "string" },
  },
});
const root = path.resolve(args["run-dir"]);
assert(/^[a-z0-9][a-z0-9-]+$/.test(args.label));
assert(["chrome", "chromium", "firefox", "webkit"].includes(args.engine), "Unknown browser");
assert(args.site === undefined || ["minimum", "current"].includes(args.site), "Unknown site");
assert(
  tokens.filter((token) => token.kind === "option" && token.name === "site").length <= 1,
  "Duplicate site selection"
);
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
const selectedSites = Object.entries(run.sites).filter(
  ([site]) => !args.site || site === args.site
);
assert(selectedSites.length > 0, "No selected site exists in run.sites");
const manifest = JSON.parse(await fs.readFile(path.join(root, "inputs/manifest.json"), "utf8"));
assert.equal(manifest.archive_sha256, run.archive_sha256);
const out = path.join(root, "evidence", args.label + "-" + args.engine);
await fs.mkdir(out);
const creds = JSON.parse(await fs.readFile(path.join(root, "lab/credentials.json")));
const launchChannel = args.engine === "chrome" ? "chrome" : undefined;
const browser = await { chrome: chromium, chromium, firefox, webkit }[args.engine].launch({
  channel: launchChannel,
});
await fs.copyFile(fileURLToPath(import.meta.url), path.join(out, "harness-widgets-ui.mjs"));
const rows = [];
const name = "simple-digital-clock-block/widget-block";
try {
  for (const [site, { url }] of selectedSites) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await ctx.route("**/*", (r) =>
      new URL(r.request().url()).origin === url ? r.continue() : r.abort()
    );
    let p = await ctx.newPage();
    const row = {
      site,
      pass: false,
      errors: [],
      errorDetails: [],
      responses: [],
      previews: [],
      actions: [],
      settling: [],
    };
    const responseTasks = [];
    const pending = new Set();
    let lastRelevantActivity = Date.now();
    const isCoreSettingsSchema = (request) => {
      const requestUrl = new URL(request.url());
      return (
        request.method() === "OPTIONS" &&
        requestUrl.origin === url &&
        requestUrl.pathname === "/index.php" &&
        requestUrl.searchParams.get("rest_route") === "/wp/v2/settings"
      );
    };
    const settle = async () => {
      const started = Date.now();
      while (Date.now() - started < 30000) {
        const active = [...pending].filter((request) => !isCoreSettingsSchema(request));
        if (active.length === 0 && Date.now() - Math.max(started, lastRelevantActivity) >= 500) {
          row.settling.push({
            elapsedMs: Date.now() - started,
            pendingCoreSchema: [...pending].map((request) => ({
              method: request.method(),
              url: request.url(),
            })),
          });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(
        "Native requests did not settle: " +
          JSON.stringify([...pending].map((request) => request.url()))
      );
    };
    const observe = (page) => {
      page.on("request", (request) => {
        pending.add(request);
        if (!isCoreSettingsSchema(request)) lastRelevantActivity = Date.now();
      });
      const finished = (request) => {
        pending.delete(request);
        if (!isCoreSettingsSchema(request)) lastRelevantActivity = Date.now();
      };
      page.on("requestfinished", finished);
      page.on("requestfailed", finished);
      page.on("pageerror", (e) => {
        row.errors.push(e.message);
        row.errorDetails.push({ message: e.message, stack: e.stack });
      });
      page.on("response", (response) => {
        const file = new URL(response.url()).pathname.split("/simple-digital-clock/")[1];
        if (manifest.files[file])
          responseTasks.push(
            (async () =>
              row.responses.push({
                file,
                url: response.url(),
                status: response.status(),
                sha256: createHash("sha256")
                  .update(await response.body())
                  .digest("hex"),
              }))()
          );
      });
    };
    observe(p);
    try {
      await p.goto(url + "/wp-login.php");
      await p.locator("#user_login").fill("audit_admin");
      await p.locator("#user_pass").fill(creds.admin);
      await p.locator("#wp-submit").click();
      await p.waitForURL((u) => u.pathname.startsWith("/wp-admin/"));
      // Keep Core Dashboard Events requests alive while the editor uses another tab.
      p = await ctx.newPage();
      observe(p);
      await p.goto(url + "/wp-admin/widgets.php");
      await p.waitForFunction(() => !!window.wp?.data?.select("core/block-editor"));
      const welcome = p.getByRole("dialog").getByRole("button", { name: "Close", exact: true });
      if (await welcome.count()) await welcome.click();
      const area = p.getByRole("button", { name: "Candidate acceptance sidebar", exact: true });
      if ((await area.count()) === 1 && (await area.getAttribute("aria-expanded")) === "false")
        await area.click();
      await p.waitForFunction(
        (name) => {
          const flat = (x) =>
            x.flatMap((b) => [
              b,
              ...flat(wp.data.select("core/block-editor").getBlocks(b.clientId)),
            ]);
          return (
            flat(wp.data.select("core/block-editor").getBlocks()).filter((b) => b.name === name)
              .length === 3
          );
        },
        name,
        { timeout: 15000 }
      );
      const inspect = () =>
        p.evaluate((name) => {
          const flat = (x) =>
            x.flatMap((b) => [
              b,
              ...flat(wp.data.select("core/block-editor").getBlocks(b.clientId)),
            ]);
          const bs = flat(wp.data.select("core/block-editor").getBlocks());
          return {
            invalid: bs.filter((b) => b.isValid === false).map((b) => b.name),
            clocks: bs
              .filter((b) => b.name === name)
              .map((b) => ({ id: b.clientId, attrs: b.attributes, valid: b.isValid })),
          };
        }, name);
      row.before = await inspect();
      assert.deepEqual(row.before.invalid, []);
      const first = row.before.clocks[0];
      for (const caption of [first.attrs.caption + " widgets UI", first.attrs.caption]) {
        const fresh = await inspect();
        const id = fresh.clocks.find(
          (c) => c.attrs.__internalWidgetId === first.attrs.__internalWidgetId
        ).id;
        await p.locator(`[data-block="${id}"]`).click({ position: { x: 6, y: 6 } });
        let container = p.getByRole("button", { name: "Container", exact: true });
        if (!(await container.count()))
          await p.getByRole("button", { name: "Settings", exact: true }).click();
        if ((await container.getAttribute("aria-expanded")) !== "true") await container.click();
        await p.getByRole("textbox", { name: "Caption", exact: true }).fill(caption);
        await p.waitForFunction(
          ({ id, caption }) => {
            const clock = document.querySelector(`[data-block="${id}"] timenow-zone-sdcw`);
            const time = clock?.shadowRoot?.querySelector("a");
            return (
              time &&
              /\d{1,2}:\d{2}/.test(time.textContent) &&
              time.previousElementSibling?.textContent === caption &&
              time.getBoundingClientRect().width > 0
            );
          },
          { id, caption }
        );
        row.previews.push({ caption, renderedBeforeSave: true });
        row.actions.push("Native widget block selection and Caption input");
        await p.waitForFunction(
          () =>
            wp.data.select("core/edit-widgets").getEditedWidgetAreas()?.length > 0 &&
            !wp.data.select("core/edit-widgets").isSavingWidgetAreas()
        );
        await p
          .getByRole("button", { name: /^(Update|Save)$/ })
          .first()
          .click();
        row.actions.push("Native Widgets Update and REST persistence");
        await p.waitForFunction(
          () =>
            !wp.data.select("core/edit-widgets").isSavingWidgetAreas() &&
            wp.data.select("core/edit-widgets").getEditedWidgetAreas()?.length === 0
        );
        await p.waitForFunction(
          async ({ caption, name, id }) => {
            const w = await wp.apiFetch({ path: "/wp/v2/widgets/" + id + "?context=edit" });
            return (
              wp.blocks.parse(w.instance.raw.content).find((b) => b.name === name)?.attributes
                .caption === caption
            );
          },
          { caption, name, id: first.attrs.__internalWidgetId },
          { timeout: 15000 }
        );
        // Wait for native renders; Core's read-only settings OPTIONS can remain pending.
        await settle();
        await p.reload();
        await p.waitForFunction((name) => {
          const flat = (x) =>
            x.flatMap((b) => [
              b,
              ...flat(wp.data.select("core/block-editor").getBlocks(b.clientId)),
            ]);
          return (
            flat(wp.data.select("core/block-editor").getBlocks()).filter((b) => b.name === name)
              .length === 3
          );
        }, name);
        const reopened = await inspect();
        assert.equal(
          reopened.clocks.find((c) => c.attrs.__internalWidgetId === first.attrs.__internalWidgetId)
            .attrs.caption,
          caption
        );
        const reopenedId = reopened.clocks.find(
          (c) => c.attrs.__internalWidgetId === first.attrs.__internalWidgetId
        ).id;
        await p.waitForFunction(
          ({ id, caption }) => {
            const clock = document.querySelector(`[data-block="${id}"] timenow-zone-sdcw`);
            const time = clock?.shadowRoot?.querySelector("a");
            return (
              time &&
              /\d{1,2}:\d{2}/.test(time.textContent) &&
              time.previousElementSibling?.textContent === caption
            );
          },
          { id: reopenedId, caption }
        );
        row.actions.push("Reopened native Widgets editor and live caption preview");
      }
      await settle();
      await p.reload();
      await p.waitForFunction((name) => {
        const flat = (x) =>
          x.flatMap((b) => [b, ...flat(wp.data.select("core/block-editor").getBlocks(b.clientId))]);
        return flat(wp.data.select("core/block-editor").getBlocks()).some((b) => b.name === name);
      }, name);
      row.after = await inspect();
      assert.deepEqual(
        row.after.clocks.map((c) => c.attrs),
        row.before.clocks.map((c) => c.attrs)
      );
      assert.deepEqual(row.after.invalid, []);
      await settle();
      await Promise.all(responseTasks);
      assert.deepEqual(row.errors, []);
      assert(
        row.responses.some(
          (response) => response.file === "assets/public/js/simple-digital-clock.min.js"
        )
      );
      for (const response of row.responses) {
        assert.equal(response.status, 200);
        assert.equal(response.sha256, manifest.files[response.file]);
      }
      await p.screenshot({ path: path.join(out, site + ".png"), fullPage: true });
      row.pass = true;
    } catch (e) {
      row.error = e.stack;
      await p
        .screenshot({ path: path.join(out, site + "-failure.png"), fullPage: true })
        .catch(() => {});
      await fs.writeFile(path.join(out, site + "-failure.html"), await p.content()).catch(() => {});
    } finally {
      await Promise.allSettled(responseTasks);
      await ctx.close();
    }
    rows.push(row);
    await fs.writeFile(
      path.join(out, "results.json"),
      JSON.stringify(
        {
          engine: args.engine,
          channel: launchChannel ?? null,
          platform: process.platform,
          architecture: process.arch,
          browser: browser.version(),
          selectedSite: args.site ?? null,
          availableSites: Object.keys(run.sites),
          rows,
        },
        null,
        2
      )
    );
    console.log(site, row.pass ? "PASS" : "FAIL", row.error || "");
  }
} finally {
  await browser.close();
}
process.exitCode = rows.some((r) => !r.pass) ? 1 : 0;
