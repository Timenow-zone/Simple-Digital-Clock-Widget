// Adapted from corrected canonical-widget native completion checks.
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import { parseArgs } from "node:util";
const { values: args } = parseArgs({
  options: {
    "run-dir": { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chromium" },
  },
});
const root = path.resolve(args["run-dir"]);
assert(/^[a-z0-9][a-z0-9-]+$/.test(args.label));
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
const out = path.join(root, "evidence", args.label + "-" + args.engine);
await fs.mkdir(out);
const creds = JSON.parse(await fs.readFile(path.join(root, "lab/credentials.json")));
const browser = await { chromium, firefox, webkit }[args.engine].launch();
await fs.copyFile(fileURLToPath(import.meta.url), path.join(out, "harness-widgets-ui.mjs"));
const rows = [];
const name = "simple-digital-clock-block/widget-block";
try {
  for (const [site, url] of Object.entries(
    Object.fromEntries(Object.entries(run.sites).map(([site, value]) => [site, value.url]))
  )) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await ctx.route("**/*", (r) =>
      new URL(r.request().url()).origin === url ? r.continue() : r.abort()
    );
    const p = await ctx.newPage();
    const row = { site, pass: false, errors: [] };
    p.on("pageerror", (e) => row.errors.push(e.message));
    try {
      await p.goto(url + "/wp-login.php");
      await p.locator("#user_login").fill("audit_admin");
      await p.locator("#user_pass").fill(creds.admin);
      await p.locator("#wp-submit").click();
      await p.waitForURL((u) => u.pathname.startsWith("/wp-admin/"));
      await p.goto(url + "/wp-admin/widgets.php");
      await p.waitForFunction(() => !!window.wp?.data?.select("core/block-editor"));
      const welcome = p.getByRole("dialog").getByRole("button", { name: "Close", exact: true });
      if (await welcome.count()) await welcome.click();
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
        await p.evaluate(
          ({ id, caption }) =>
            wp.data.dispatch("core/block-editor").updateBlockAttributes(id, { caption }),
          { id, caption }
        );
        await p.waitForFunction(
          () =>
            wp.data.select("core/edit-widgets").getEditedWidgetAreas()?.length > 0 &&
            !wp.data.select("core/edit-widgets").isSavingWidgetAreas()
        );
        await p
          .getByRole("button", { name: /^(Update|Save)$/ })
          .first()
          .click();
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
      }
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
      await p.screenshot({ path: path.join(out, site + ".png"), fullPage: true });
      row.pass = true;
    } catch (e) {
      row.error = e.stack;
      await p
        .screenshot({ path: path.join(out, site + "-failure.png"), fullPage: true })
        .catch(() => {});
      await fs.writeFile(path.join(out, site + "-failure.html"), await p.content()).catch(() => {});
    } finally {
      await ctx.close();
    }
    rows.push(row);
    await fs.writeFile(
      path.join(out, "results.json"),
      JSON.stringify({ browser: browser.version(), rows }, null, 2)
    );
    console.log(site, row.pass ? "PASS" : "FAIL", row.error || "");
  }
} finally {
  await browser.close();
}
process.exitCode = rows.some((r) => !r.pass) ? 1 : 0;
