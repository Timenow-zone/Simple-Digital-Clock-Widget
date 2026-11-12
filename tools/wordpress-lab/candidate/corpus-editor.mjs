import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { chromium, firefox, webkit } from "playwright";
import { parseArgs } from "node:util";
const { values: args } = parseArgs({
  options: {
    "run-dir": { type: "string" },
    mode: { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chromium" },
    "catalog-dir": { type: "string", default: "evidence/baseline112-seed-chromium" },
    "ui-dir": { type: "string", multiple: true, default: [] },
  },
});
const root = path.resolve(args["run-dir"]);
const mode = args.mode,
  phase = args.label,
  engine = args.engine;
assert(["seed", "read", "save"].includes(mode));
assert(/^[a-z0-9][a-z0-9-]+$/.test(phase));
assert(["chromium", "firefox", "webkit"].includes(engine));
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
if (mode === "seed")
  for (const site of Object.keys(run.sites)) {
    const header = await fs.readFile(
      path.join(root, "lab/data", site, "wp-content/plugins/simple-digital-clock/widget_init.php"),
      "utf8"
    );
    assert(
      /^Version:\s*1\.1\.2\s*$/m.test(header),
      "Corpus must be serialized with actual public 1.1.2"
    );
  }
// Adapted from the corrected independent RC1 method; every execution is new evidence.
const output = path.join(root, "evidence", `${phase}-${mode}-${engine}`);
await fs.mkdir(output);
const credentials = JSON.parse(await fs.readFile(path.join(root, "lab/credentials.json")));
const sites = Object.fromEntries(
  Object.entries(run.sites).map(([site, value]) => [site, value.url])
);
await fs.copyFile(fileURLToPath(import.meta.url), path.join(output, "harness-corpus-editor.mjs"));
const name = "simple-digital-clock-block/widget-block";
const hash = (s) => createHash("sha256").update(s).digest("hex");
const browser = await { chromium, firefox, webkit }[engine].launch({ headless: true });
const rows = [];
const started = Date.now();
const groups = {
  normal: [
    {
      caption: "Kyiv clock",
      timeZone: "Europe/Kyiv",
      locale: "uk",
      width: 240,
      second: true,
      date: true,
    },
    {
      caption: "Tokyo 12h",
      timeZone: "Asia/Tokyo",
      locale: "ja",
      width: 320,
      period: false,
      second: false,
      rounded: 2,
      align: "center",
      border: true,
    },
    {
      caption: "UTC hundredths",
      timeZone: "UTC",
      locale: "en-GB",
      width: 350,
      period: true,
      second: true,
      hundredths: true,
      date: true,
      background: "",
      backgroundColor: "#123456",
      shadow: "lg",
      rounded: 1,
      align: "right",
      className: "audit-class",
      lock: { move: true, remove: true },
    },
  ],
  entities: [
    {
      caption: "Quotes \"double\" and 'single' < > & 🕒 Київ 中文",
      locale: "uk",
      timeZone: "Europe/Kyiv",
    },
    {
      caption: "Literal &amp; &quot; &apos; &#39; &#x1F552; &amp;apos;",
      locale: "en-US",
      timeZone: "UTC",
    },
    { caption: "NBSP  ZWJ 👩‍💻 RTL العربية", locale: "ar", timeZone: "Asia/Dubai", date: true },
  ],
  slashes: [
    { caption: "Path C:\\clock\\folder", timeZone: "UTC" },
    { caption: 'Literal \\u0022 \\n \\"', timeZone: "UTC" },
    { caption: "Terminal \\", timeZone: "UTC" },
  ],
  nested: [
    { caption: "Nested left", width: 200, timeZone: "Europe/Paris", locale: "fr-FR" },
    {
      caption: "Nested right",
      width: 220,
      timeZone: "America/New_York",
      locale: "en-US",
      second: false,
      date: true,
    },
  ],
};
async function login(page, url, role) {
  await page.goto(url + "/wp-login.php");
  await page.locator("#user_login").fill("audit_" + role);
  await page.locator("#user_pass").fill(credentials[role]);
  await page.locator("#wp-submit").click();
  await page.waitForURL((u) => u.pathname.startsWith("/wp-admin/"));
}
async function open(page, url, id) {
  await page.goto(
    url + (id ? `/wp-admin/post.php?post=${id}&action=edit` : "/wp-admin/post-new.php"),
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(
    ({ name, id }) => {
      let e = window.wp?.data?.select("core/editor");
      return (
        !!wp?.blocks?.getBlockType(name) &&
        e?.getCurrentPostId() > 0 &&
        (!id || Number(e.getCurrentPostId()) === id) &&
        (!e.__unstableIsEditorReady || e.__unstableIsEditorReady())
      );
    },
    { name, id },
    { timeout: 30000 }
  );
  if (id)
    await page.waitForFunction(() => wp.data.select("core/block-editor").getBlocks().length > 0);
  await page.locator(".edit-post-visual-editor, .editor-visual-editor").first().waitFor();
  const welcome = page.getByRole("dialog").getByRole("button", { name: "Close", exact: true });
  if ((await welcome.count()) && (await welcome.isVisible())) await welcome.click();
  for (const label of ["Close dialog", "Close modal", "Dismiss this guide"]) {
    const b = page.getByRole("button", { name: label, exact: true });
    if ((await b.count()) === 1 && (await b.isVisible())) await b.click();
  }
}
async function fillNativeTitle(page, value) {
  for (const frame of page.frames()) {
    const field = frame.locator('[aria-label="Add title"],[aria-label="Title"]');
    if ((await field.count()) === 1 && (await field.isVisible())) {
      await field.fill(value);
      return;
    }
  }
  throw new Error("Native title control missing in actual editor realm");
}
async function inspect(page) {
  return page.evaluate((name) => {
    let flat = (bs) => bs.flatMap((b) => [b, ...flat(b.innerBlocks || [])]);
    let bs = flat(wp.data.select("core/block-editor").getBlocks());
    return {
      id: wp.data.select("core/editor").getCurrentPostId(),
      invalid: bs
        .filter((b) => b.isValid === false)
        .map((b) => ({ name: b.name, attrs: b.attributes, issues: b.validationIssues })),
      blocks: bs.map((b) => ({
        name: b.name,
        attributes: b.attributes,
        valid: b.isValid !== false,
      })),
      clocks: bs
        .filter((b) => b.name === name)
        .map((b) => ({ attributes: b.attributes, valid: b.isValid !== false })),
      serialized: wp.blocks.serialize(wp.data.select("core/block-editor").getBlocks()),
    };
  }, name);
}
async function previews(page) {
  const all = [];
  for (const f of page.frames()) {
    const clocks = await f
      .locator("timenow-zone-sdcw")
      .evaluateAll((es) =>
        es.map((e) => ({
          attrs: Object.fromEntries([...e.attributes].map((a) => [a.name, a.value])),
          rendered: !!e.shadowRoot?.querySelector("a"),
          caption: e.shadowRoot?.textContent,
          box: { width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height },
        }))
      )
      .catch(() => []);
    if (clocks.length) all.push({ frame: f.url(), clocks });
  }
  return all;
}
async function previewReady(page, count) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const frames = await previews(page);
    const clocks = frames.flatMap((f) => f.clocks);
    if (
      clocks.length >= count &&
      clocks.every((c) => c.rendered && c.box.width > 0 && c.box.height > 0)
    )
      return frames;
    await page.waitForTimeout(100);
  }
  throw new Error("Actual editor iframe preview did not render all clocks");
}
async function persist() {
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify(
      {
        mode,
        phase,
        engine,
        browserVersion: browser.version(),
        elapsedSeconds: (Date.now() - started) / 1000,
        rows,
      },
      null,
      2
    ) + "\n"
  );
}
try {
  for (const [site, url] of Object.entries(sites)) {
    const catalog =
      mode === "seed"
        ? []
        : JSON.parse(
            await fs.readFile(path.join(root, args["catalog-dir"], `${site}-catalog.json`))
          );
    if (mode !== "seed")
      for (const folder of args["ui-dir"]) {
        const data = JSON.parse(await fs.readFile(path.join(root, folder, "RESULT.json")));
        for (const row of data.rows.filter((row) => row.site === site && row.pass))
          catalog.push({
            id: row.postId,
            role: row.role,
            group: "new-" + path.basename(folder),
            type: "posts",
            baselineHealthy: true,
            baseline: {
              clocks: row.reopened.map((block) => ({
                attributes: block.attributes,
                valid: block.valid,
              })),
            },
          });
      }
    for (const role of ["admin", "author"]) {
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
        timezoneId: "Europe/Kyiv",
        serviceWorkers: "block",
      });
      await ctx.route("**/*", (r) => {
        let u = new URL(r.request().url());
        return u.origin === url || !["http:", "https:"].includes(u.protocol)
          ? r.continue()
          : r.abort();
      });
      const p = await ctx.newPage();
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      try {
        await login(p, url, role);
        if (mode === "seed") await open(p, url);
        if (mode === "seed") {
          const created = await p.evaluate(
            async ({ groups, name, role }) => {
              const result = [];
              for (const [group, attrs] of Object.entries(groups)) {
                let clocks = attrs.map((a) => wp.blocks.createBlock(name, a));
                let blocks = [
                  wp.blocks.createBlock("core/paragraph", {
                    content: "Foreign paragraph <strong>preserved</strong> 🧪",
                    className: "foreign-control",
                    style: { color: { text: "#135724" } },
                  }),
                  ...clocks,
                ];
                if (group === "nested")
                  blocks = [
                    wp.blocks.createBlock("core/group", { className: "audit-outer" }, [
                      wp.blocks.createBlock("core/columns", {}, [
                        wp.blocks.createBlock("core/column", {}, [clocks[0]]),
                        wp.blocks.createBlock("core/column", {}, [clocks[1]]),
                      ]),
                    ]),
                    wp.blocks.createBlock("core/paragraph", {
                      content: "Foreign trailing paragraph",
                    }),
                  ];
                const content = wp.blocks.serialize(blocks);
                const post = await wp.apiFetch({
                  path: "/wp/v2/posts",
                  method: "POST",
                  data: { title: `Audit ${role} ${group}`, status: "publish", content },
                });
                result.push({
                  id: post.id,
                  role,
                  group,
                  type: "posts",
                  requested: attrs,
                  serializedInput: content,
                  stored: post.content.raw,
                  link: post.link,
                });
              }
              if (role === "admin") {
                for (const type of ["pages", "blocks", "template-parts"]) {
                  const body = {
                    title: "Audit " + type,
                    slug: "audit-clock-" + type,
                    status: "publish",
                    content: wp.blocks.serialize([
                      wp.blocks.createBlock(name, {
                        caption: "Stored " + type,
                        timeZone: "UTC",
                        locale: "en-GB",
                        date: true,
                      }),
                    ]),
                  };
                  if (type === "template-parts") {
                    body.theme =
                      wp.data.select("core").getCurrentTheme()?.stylesheet || "twentytwentythree";
                    body.area = "uncategorized";
                  }
                  try {
                    const post = await wp.apiFetch({
                      path: "/wp/v2/" + type,
                      method: "POST",
                      data: body,
                    });
                    result.push({
                      id: post.id,
                      role,
                      group: type,
                      type,
                      serializedInput: body.content,
                      stored: post.content.raw,
                      link: post.link,
                    });
                  } catch (e) {
                    result.push({ role, group: type, error: e.message });
                  }
                }
              }
              return result;
            },
            { groups, name, role }
          );
          catalog.push(...created);
        }
        for (const item of catalog.filter(
          (i) => i.role === role && ["posts", "pages"].includes(i.type)
        )) {
          const row = { site, role, id: item.id, group: item.group, pass: false };
          const errorOffset = errors.length;
          try {
            await open(p, url, item.id);
            row.before = await inspect(p);
            row.beforePreview = await (row.before.invalid.length === 0
              ? previewReady(p, row.before.clocks.length)
              : previews(p));
            const original = await p.evaluate(
              async ({ id, type }) => wp.apiFetch({ path: `/wp/v2/${type}/${id}?context=edit` }),
              item
            );
            row.rawSha256 = hash(original.content.raw);
            if (mode === "seed") {
              item.baseline = row.before;
              item.stored = original.content.raw;
              item.baselineHealthy =
                row.before.invalid.length === 0 && row.before.clocks.length > 0;
              row.baselineHealthy = item.baselineHealthy;
            } else {
              row.baselineHealthy = item.baselineHealthy;
              row.settingsMatchBaseline =
                JSON.stringify(row.before.clocks) === JSON.stringify(item.baseline.clocks);
              if (item.baselineHealthy) {
                assert.deepEqual(row.before.invalid, []);
                assert.deepEqual(row.before.clocks, item.baseline.clocks);
              }
            }
            if (mode === "save" && item.baselineHealthy) {
              await fillNativeTitle(p, original.title.raw + " acceptance edit");
              await p.waitForFunction(() => wp.data.select("core/editor").isEditedPostDirty());
              const buttons = p.getByRole("button", { name: /^(Save|Update)$/ });
              await buttons.first().waitFor();
              let clicked = false;
              for (let j = 0; j < (await buttons.count()); j++) {
                const b = buttons.nth(j);
                if (await b.isVisible()) {
                  await b.click();
                  clicked = true;
                  break;
                }
              }
              assert(clicked, "Native Save/Update button required");
              await p.waitForFunction(
                () =>
                  !wp.data.select("core/editor").isSavingPost() &&
                  wp.data.select("core/editor").didPostSaveRequestSucceed() &&
                  !wp.data.select("core/editor").isEditedPostDirty()
              );
              await open(p, url, item.id);
              row.reopened = await inspect(p);
              assert.deepEqual(row.reopened.invalid, []);
              assert.deepEqual(row.reopened.clocks, row.before.clocks);
              row.saveMethod = "Native visible Save/Update button after title edit";
              await fillNativeTitle(p, original.title.raw + " acceptance repeated");
              await p.waitForFunction(() => wp.data.select("core/editor").isEditedPostDirty());
              const again = p.getByRole("button", { name: /^(Save|Update)$/ });
              await again.first().waitFor();
              for (let j = 0; j < (await again.count()); j++) {
                if (await again.nth(j).isVisible()) {
                  await again.nth(j).click();
                  break;
                }
              }
              await p.waitForFunction(
                () =>
                  !wp.data.select("core/editor").isSavingPost() &&
                  wp.data.select("core/editor").didPostSaveRequestSucceed() &&
                  !wp.data.select("core/editor").isEditedPostDirty()
              );
              await open(p, url, item.id);
              row.repeated = await inspect(p);
              assert.deepEqual(row.repeated.clocks, row.before.clocks);
              assert.deepEqual(row.repeated.invalid, []);
              const saved = await p.evaluate(
                async ({ id, type }) => wp.apiFetch({ path: `/wp/v2/${type}/${id}?context=edit` }),
                item
              );
              row.savedRawSha256 = hash(saved.content.raw);
              row.rawUnchanged = original.content.raw === saved.content.raw;
            }
            if (item.group === "normal")
              await p.screenshot({ path: path.join(output, `${site}-${role}-${item.group}.png`) });
            row.pass = true;
          } catch (e) {
            row.error = e.stack;
            await p
              .screenshot({ path: path.join(output, `${site}-${role}-${item.id}-failure.png`) })
              .catch(() => {});
            await fs
              .writeFile(
                path.join(output, `${site}-${role}-${item.id}-failure.html`),
                await p.content()
              )
              .catch(() => {});
          }
          row.pageErrors = errors.slice(errorOffset);
          rows.push(row);
          await persist();
          console.log(
            `[${rows.length}] ${site}/${role}/${item.group} ${row.pass ? "PASS" : "FAIL"} healthy=${row.baselineHealthy} elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`
          );
        }
      } catch (e) {
        rows.push({ site, role, error: e.stack, pass: false });
        await persist();
      } finally {
        await ctx.close();
      }
    }
    if (mode === "seed")
      await fs.writeFile(
        path.join(output, `${site}-catalog.json`),
        JSON.stringify(catalog, null, 2) + "\n"
      );
  }
} finally {
  await browser.close();
}
await persist();
const failed = rows.filter((r) => !r.pass).length;
console.log(JSON.stringify({ cases: rows.length, failed, output }));
process.exitCode = failed ? 1 : 0;
