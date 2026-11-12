import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const { values: args } = parseArgs({
  options: {
    "run-dir": { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chromium" },
    mode: { type: "string" },
    "browser-endpoint": { type: "string" },
  },
});
assert(
  args["run-dir"] && /^[a-z0-9][a-z0-9-]+$/.test(args.label ?? ""),
  "Fresh run directory and label are required"
);
assert(["legacy-preview", "site-editor", "post-editor"].includes(args.mode), "Unknown native mode");
assert(["chromium", "firefox", "webkit"].includes(args.engine), "Unknown browser");
const root = path.resolve(args["run-dir"]);
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
const out = path.join(root, "evidence", `${args.label}-${args.engine}`);
await fs.mkdir(out);
await fs.copyFile(fileURLToPath(import.meta.url), path.join(out, "harness-browser.mjs"));
const credentials = JSON.parse(await fs.readFile(path.join(root, "lab/credentials.json"), "utf8"));
const browserType = { chromium, firefox, webkit }[args.engine];
const browser = args["browser-endpoint"]
  ? await browserType.connect(args["browser-endpoint"])
  : await browserType.launch({ timeout: 30_000 });
const blockName = "simple-digital-clock-block/widget-block";
const rows = [];
const started = Date.now();

async function installedIdentity(site) {
  const directory = path.join(root, "lab/data", site, "wp-content/plugins/simple-digital-clock");
  const files = {};
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      assert(!entry.isSymbolicLink(), "Unexpected installed symlink");
      if (entry.isDirectory()) await walk(file);
      else
        files[path.relative(directory, file)] = createHash("sha256")
          .update(await fs.readFile(file))
          .digest("hex");
    }
  }
  await walk(directory);
  const header = await fs.readFile(path.join(directory, "widget_init.php"), "utf8");
  return { version: header.match(/^Version:\s*(\S+)\s*$/m)?.[1], files };
}

async function dismissGuides(page) {
  await page
    .getByRole("dialog")
    .first()
    .waitFor({ state: "visible", timeout: 1500 })
    .catch(() => {});
  for (const label of [
    "Close",
    "Close dialog",
    "Close modal",
    "Dismiss this guide",
    "Get started",
  ]) {
    const close = page.getByRole("dialog").getByRole("button", { name: label, exact: true });
    if ((await close.count()) === 1 && (await close.isVisible())) await close.click();
  }
}

async function renderedFrames(page) {
  const frames = [];
  for (const frame of page.frames()) {
    const state = await frame
      .evaluate(() => ({
        url: location.href,
        defined: !!customElements.get("timenow-zone-sdcw"),
        clocks: [...document.querySelectorAll("timenow-zone-sdcw")].map((clock) => ({
          html: clock.outerHTML,
          rendered: !!clock.shadowRoot?.querySelector("a"),
          shadow: clock.shadowRoot?.textContent ?? null,
        })),
        scripts: [...document.scripts]
          .filter(
            (script) =>
              script.src.includes("simple-digital-clock") ||
              script.id.includes("simple-digital-clock")
          )
          .map((script) => ({ src: script.src, id: script.id, type: script.type })),
      }))
      .catch((error) => ({ error: String(error) }));
    frames.push(state);
  }
  return frames;
}

async function waitForClock(page, caption, expected = 1) {
  const deadline = Date.now() + 30_000;
  let frames;
  while (Date.now() < deadline) {
    frames = await renderedFrames(page);
    const clocks = frames
      .flatMap((frame) => frame.clocks ?? [])
      .filter((clock) => clock.rendered && (!caption || clock.shadow.includes(caption)));
    if (clocks.length >= expected) return frames;
    await page.waitForTimeout(200);
  }
  assert.fail(`Visible clock preview missing after 30 seconds: ${JSON.stringify(frames)}`);
}

async function insertClock(page, row) {
  const toggle = page.getByRole("button", { name: /^(Toggle block inserter|Block Inserter)$/ });
  await toggle.click();
  await page.getByRole("searchbox", { name: /Search/i }).fill("clock");
  const option = page.getByRole("option", { name: "Simple Digital Clock", exact: true });
  if (await option.count()) {
    await option.waitFor({ state: "visible" });
    await page.waitForFunction(
      (name) => wp.data.select("core/block-editor").canInsertBlockType(name),
      blockName
    );
    await option.click();
  } else {
    await page
      .locator('button[class*="editor-block-list-item-simple-digital-clock-block-widget-block"]')
      .click();
  }
  await page.waitForFunction((name) => {
    const flatten = (blocks) =>
      blocks.flatMap((block) => [block, ...flatten(block.innerBlocks ?? [])]);
    return flatten(wp.data.select("core/block-editor").getBlocks()).some(
      (block) => block.name === name
    );
  }, blockName);
  row.actions.push("Native inserter search and click");
  if (
    (await toggle.getAttribute("aria-expanded")) === "true" ||
    (await toggle.getAttribute("aria-pressed")) === "true"
  )
    await toggle.click();
}

async function configureClock(page, caption, row) {
  let container = page.getByRole("button", { name: "Container", exact: true });
  if (!(await container.count())) {
    const settings = page.getByRole("button", { name: "Settings", exact: true });
    if ((await settings.count()) === 1) await settings.click();
  }
  await container.click();
  await page.getByRole("textbox", { name: "Caption", exact: true }).fill(caption);
  const width = page.getByRole("spinbutton", { name: "Width", exact: true });
  if ((await width.count()) === 1) {
    await width.fill("275");
    await width.press("Tab");
  }
  row.actions.push("Native Caption and Width controls");
  return page.evaluate((name) => {
    const flatten = (blocks) =>
      blocks.flatMap((block) => [block, ...flatten(block.innerBlocks ?? [])]);
    const clocks = flatten(wp.data.select("core/block-editor").getBlocks()).filter(
      (block) => block.name === name
    );
    return clocks.at(-1)?.attributes;
  }, blockName);
}

async function blockState(page) {
  return page.evaluate((name) => {
    const flatten = (blocks) =>
      blocks.flatMap((block) => [block, ...flatten(block.innerBlocks ?? [])]);
    return flatten(wp.data.select("core/block-editor").getBlocks())
      .filter((block) => block.name === name)
      .map((block) => ({ attributes: block.attributes, valid: block.isValid }));
  }, blockName);
}

async function legacyPreview(page, row) {
  await page.goto(row.origin + "/wp-admin/widgets.php");
  await page.waitForFunction(() => !!window.wp?.data?.select("core/block-editor"));
  await dismissGuides(page);
  // The native widget area can be collapsed independently of its saved options.
  const area = page.getByRole("button", { name: "Candidate acceptance sidebar", exact: true });
  if ((await area.count()) === 1 && (await area.getAttribute("aria-expanded")) === "false")
    await area.click();
  const deadline = Date.now() + 30_000;
  do {
    row.frames = await renderedFrames(page);
    const documents = row.frames.filter(
      (frame) => frame.url === "about:srcdoc" && frame.clocks?.length
    );
    if (
      documents.length === 2 &&
      documents.every((frame) => frame.clocks.every((clock) => clock.rendered))
    )
      break;
    await page.waitForTimeout(200);
  } while (Date.now() < deadline);
  const previews = row.frames.filter(
    (frame) => frame.url === "about:srcdoc" && frame.clocks.length
  );
  assert.equal(previews.length, 2, "Two native legacy widget preview documents are required");
  for (const preview of previews) {
    assert(preview.defined);
    assert(preview.clocks.every((clock) => clock.rendered));
  }
  for (const [index, frame] of page.frames().entries())
    await fs.writeFile(path.join(out, `${row.site}-frame-${index}.html`), await frame.content());
  row.actions.push("Native Widgets page and two isolated Text/Custom HTML previews");
}

async function siteEditor(page, row) {
  const editorUrl =
    row.origin +
    "/wp-admin/site-editor.php?postType=wp_template&postId=twentytwentythree%2F%2Fhome&canvas=edit";
  await page.goto(editorUrl);
  await page.waitForFunction(
    (name) =>
      !!window.wp?.blocks?.getBlockType(name) &&
      !!wp.data.select("core/block-editor")?.getBlocks().length,
    blockName,
    { timeout: 30_000 }
  );
  await dismissGuides(page);
  row.before = await blockState(page);
  const caption = `Site ${args.label} ${args.engine} "quotes" & Київ 🕒`;
  await insertClock(page, row);
  row.expected = await configureClock(page, caption, row);
  assert.equal(row.expected.caption, caption);
  row.framesBeforeSave = await waitForClock(page, caption);
  const save = page.getByRole("button", { name: /^Save$/ }).first();
  await save.click();
  // Core versions use either a modal confirmation or a save sidebar.
  const confirmation = page.getByRole("dialog").getByRole("button", { name: /^Save$/ });
  if ((await confirmation.count()) === 1 && (await confirmation.isVisible()))
    await confirmation.click();
  else {
    const panelSave = page
      .locator(".entities-saved-states__panel")
      .getByRole("button", { name: /^Save$/ });
    if ((await panelSave.count()) === 1 && (await panelSave.isVisible())) await panelSave.click();
  }
  await page.waitForFunction(
    () => {
      const store = wp.data.select("core");
      return (
        !store.isSavingEntityRecord?.("postType", "wp_template", "twentytwentythree//home") &&
        !store.hasEditsForEntityRecord?.("postType", "wp_template", "twentytwentythree//home")
      );
    },
    undefined,
    { timeout: 30_000 }
  );
  row.actions.push("Native Site Editor Save and confirmation");
  await page.goto(editorUrl);
  await page.waitForFunction(
    (name) =>
      !!window.wp?.data
        ?.select("core/block-editor")
        ?.getBlocks()
        .some((block) => block.name === name || block.innerBlocks?.length),
    blockName
  );
  row.reopened = await blockState(page);
  const reopened = row.reopened.find((block) => block.attributes.caption === caption);
  assert(reopened?.valid, "Saved Site Editor clock must remain valid");
  assert.deepEqual(reopened.attributes, row.expected);
  row.frames = await waitForClock(page, caption);
  row.actions.push("Reopened same native template and verified saved attributes and preview");
  await page.waitForLoadState("networkidle");
  row.pageErrorsBeforeFrontend = [...row.pageErrors];
  await page.screenshot({ path: path.join(out, `${row.site}-site-editor.png`), fullPage: true });
  await page.goto(row.origin + "/");
  row.frontend = await waitForClock(page, caption);
  row.actions.push("Verified the saved template clock on the public frontend");
}

async function postEditor(page, row) {
  await page.goto(row.origin + "/wp-admin/post-new.php");
  await page.waitForFunction(
    (name) =>
      !!window.wp?.blocks?.getBlockType(name) &&
      wp.data.select("core/editor").getCurrentPostId() > 0,
    blockName
  );
  await dismissGuides(page);
  const caption = `Post ${args.label} ${args.engine} ${row.role} "quotes" & Київ 🕒`;
  await insertClock(page, row);
  row.expected = await configureClock(page, caption, row);
  row.framesBeforeSave = await waitForClock(page, caption);
  for (let save = 0; save < 2; save++) {
    let title;
    for (const frame of page.frames()) {
      const candidate = frame.locator('[aria-label="Add title"]');
      if ((await candidate.count()) === 1 && (await candidate.isVisible())) {
        title = candidate;
        break;
      }
    }
    assert(title, "The native post title control must be present in its actual editor realm");
    await title.fill(caption + (save ? " repeated" : ""));
    await page.getByRole("button", { name: /^Save draft$/i }).click();
    await page.waitForFunction(
      () =>
        !wp.data.select("core/editor").isSavingPost() &&
        wp.data.select("core/editor").didPostSaveRequestSucceed()
    );
    row.postId = await page.evaluate(() => wp.data.select("core/editor").getCurrentPostId());
    row.actions.push(`Native post title and Save draft ${save + 1}`);
    await page.goto(row.origin + `/wp-admin/post.php?post=${row.postId}&action=edit`);
    await page.waitForFunction(
      (name) =>
        wp.data
          .select("core/block-editor")
          .getBlocks()
          .some((block) => block.name === name),
      blockName
    );
    row.reopened = await blockState(page);
    assert(row.reopened[0]?.valid);
    assert.deepEqual(row.reopened[0].attributes, row.expected);
    row.frames = await waitForClock(page, caption);
  }
}

try {
  for (const [site, configuration] of Object.entries(run.sites)) {
    for (const role of args.mode === "post-editor" ? ["admin", "author"] : ["admin"]) {
      const row = {
        site,
        role,
        origin: configuration.url,
        mode: args.mode,
        pass: false,
        actions: [],
        pageErrors: [],
        responses: [],
      };
      row.installed = await installedIdentity(site);
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
        timezoneId: "Asia/Tokyo",
      });
      await context.route("**/*", (route) =>
        new URL(route.request().url()).origin === row.origin ? route.continue() : route.abort()
      );
      const page = await context.newPage();
      page.on("pageerror", (error) => row.pageErrors.push(error.message));
      const responses = [];
      page.on("response", (response) => {
        if (response.url().includes("/simple-digital-clock/"))
          responses.push(
            (async () => {
              const body = await response.body().catch(() => null);
              row.responses.push({
                url: response.url(),
                status: response.status(),
                sha256: body && createHash("sha256").update(body).digest("hex"),
                frame: response.request().frame().url(),
              });
            })()
          );
      });
      try {
        await page.goto(row.origin + "/wp-login.php");
        await page.locator("#user_login").fill("audit_" + role);
        await page.locator("#user_pass").fill(credentials[role]);
        await page.locator("#wp-submit").click();
        await page.waitForURL((url) => url.pathname.startsWith("/wp-admin/"));
        await {
          "legacy-preview": legacyPreview,
          "site-editor": siteEditor,
          "post-editor": postEditor,
        }[args.mode](page, row);
        assert.deepEqual(row.pageErrors, [], "Uncaught native editor errors");
        assert.deepEqual(
          await installedIdentity(site),
          row.installed,
          "Installed files changed during the browser pass"
        );
        await page.screenshot({ path: path.join(out, `${site}-${role}.png`), fullPage: true });
        row.pass = true;
      } catch (error) {
        row.error = error.stack;
        row.failureFrames = await renderedFrames(page).catch(() => []);
        await page
          .screenshot({ path: path.join(out, `${site}-${role}-failure.png`), fullPage: true })
          .catch(() => {});
        await fs
          .writeFile(path.join(out, `${site}-${role}-failure.html`), await page.content())
          .catch(() => {});
      } finally {
        await Promise.allSettled(responses);
        await context.close();
        rows.push(row);
        await fs.writeFile(
          path.join(out, "RESULT.json"),
          JSON.stringify(
            {
              engine: args.engine,
              browser: browser.version(),
              mode: args.mode,
              candidateInputSha256: run.archive_sha256,
              rows,
            },
            null,
            2
          ) + "\n"
        );
        console.log(
          `[${rows.length}/${Object.keys(run.sites).length * (args.mode === "post-editor" ? 2 : 1)}] ${site}/${role}: ${row.pass ? "PASS" : "FAIL"} elapsed=${((Date.now() - started) / 1000).toFixed(1)}s ${row.error ?? ""}`
        );
      }
    }
  }
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({
    passed: rows.filter((row) => row.pass).length,
    failed: rows.filter((row) => !row.pass).length,
    output: out,
  })
);
process.exitCode = rows.some((row) => !row.pass) ? 1 : 0;
