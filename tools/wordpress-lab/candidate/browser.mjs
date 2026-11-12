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
    "legacy-editor": { type: "boolean", default: false },
    "unsaved-lifecycle": { type: "boolean", default: false },
    lifecycle: { type: "boolean", default: false },
    site: { type: "string" },
    role: { type: "string" },
    stage: { type: "string" },
    "terminal-control": { type: "boolean", default: false },
  },
});
assert(
  args["run-dir"] && /^[a-z0-9][a-z0-9-]+$/.test(args.label ?? ""),
  "Fresh run directory and label are required"
);
assert(["legacy-preview", "site-editor", "post-editor"].includes(args.mode), "Unknown native mode");
assert(["chrome", "chromium", "firefox", "webkit"].includes(args.engine), "Unknown browser");
assert(
  !(args.engine === "chrome" && args["browser-endpoint"]),
  "Google Chrome verification requires a local channel launch, not an unverified remote endpoint"
);
const root = path.resolve(args["run-dir"]);
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
let candidate = run;
let stageManifest;
if (args.stage) {
  assert(/^[a-z0-9][a-z0-9-]{1,60}$/.test(args.stage), "Invalid frozen stage label");
  const directory = path.join(root, "stages", args.stage);
  candidate = JSON.parse(await fs.readFile(path.join(directory, "stage.json"), "utf8"));
  assert.equal(candidate.run_dir, root);
  assert.equal(candidate.initial_archive_sha256, run.archive_sha256);
  for (const [file, expected] of [
    ["manifest.json", candidate.manifest_sha256],
    ["candidate.zip", candidate.archive_sha256],
  ])
    assert.equal(
      createHash("sha256")
        .update(await fs.readFile(path.join(directory, file)))
        .digest("hex"),
      expected
    );
  stageManifest = JSON.parse(await fs.readFile(path.join(directory, "manifest.json"), "utf8"));
}
const out = path.join(root, "evidence", `${args.label}-${args.engine}`);
await fs.mkdir(out);
await fs.copyFile(fileURLToPath(import.meta.url), path.join(out, "harness-browser.mjs"));
await fs.writeFile(
  path.join(out, "INVOCATION.json"),
  JSON.stringify({ argv: process.argv, platform: process.platform }, null, 2)
);
const credentials = JSON.parse(await fs.readFile(path.join(root, "lab/credentials.json"), "utf8"));
const browserType = { chrome: chromium, chromium, firefox, webkit }[args.engine];
const launchChannel = args.engine === "chrome" ? "chrome" : undefined;
const browser = args["browser-endpoint"]
  ? await browserType.connect(args["browser-endpoint"])
  : await browserType.launch({ timeout: 30_000, channel: launchChannel });
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
  const guide = page.locator(".components-guide");
  await guide.waitFor({ state: "visible", timeout: 1500 }).catch(() => {});
  if (await guide.isVisible()) {
    await guide
      .getByRole("button", {
        name: /^(?:Close(?: dialog| modal)?|Get started|Dismiss this guide)$/,
      })
      .click();
    await guide.waitFor({ state: "hidden" });
    return;
  }
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
  const countBefore = (await blockState(page)).length;
  const selectedBefore = await page.evaluate(() =>
    wp.data.select("core/block-editor").getSelectedBlockClientId()
  );
  const toggle = page.getByRole("button", { name: /^(Toggle block inserter|Block Inserter)$/ });
  await toggle.click();
  await page.getByRole("searchbox", { name: /Search/i }).fill("clock");
  // Core debounces inserter search before wiring the native result action.
  await page.waitForTimeout(600);
  const option = page.getByRole("option", { name: "Simple Digital Clock", exact: true });
  if (await option.count()) {
    await option.waitFor({ state: "visible" });
    await option.click();
  } else {
    await page
      .locator('button[class*="editor-block-list-item-simple-digital-clock-block-widget-block"]')
      .click();
  }
  await page.waitForFunction(
    ({ name, count, previous }) => {
      const flatten = (blocks) =>
        blocks.flatMap((block) => [block, ...flatten(block.innerBlocks ?? [])]);
      const store = wp.data.select("core/block-editor");
      const selected = store.getSelectedBlockClientId();
      return (
        selected !== previous &&
        store.getBlock(selected)?.name === name &&
        flatten(store.getBlocks()).filter((block) => block.name === name).length === count + 1
      );
    },
    { name: blockName, count: countBefore, previous: selectedBefore }
  );
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
  if ((await container.getAttribute("aria-expanded")) !== "true") await container.click();
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
  row.pageErrorsBeforeFrontend = [...row.pageErrors];
  await page.screenshot({ path: path.join(out, `${row.site}-site-editor.png`), fullPage: true });
  // Keep the editor open while checking its saved template in another native tab.
  // Core editor background polling is not a frontend readiness condition.
  const frontend = await page.context().newPage();
  frontend.on("pageerror", (error) => row.pageErrors.push(error.message));
  await frontend.goto(row.origin + "/");
  row.frontend = await waitForClock(frontend, caption);
  await frontend.screenshot({
    path: path.join(out, `${row.site}-site-editor-frontend.png`),
    fullPage: true,
  });
  row.actions.push("Verified the saved template clock on the public frontend");
}

async function removeNativeClock(page) {
  const id = await page.evaluate(
    (name) =>
      wp.data
        .select("core/block-editor")
        .getBlocks()
        .find((block) => block.name === name).clientId,
    blockName
  );
  let selected;
  for (const frame of page.frames()) {
    const block = frame.locator(`[data-block="${id}"]`);
    if ((await block.count()) === 1) {
      selected = block;
      break;
    }
  }
  assert(selected, "The selected native clock block must exist in its editor realm");
  await selected.focus();
  await selected.press("Backspace");
  await page.waitForFunction(
    (name) =>
      !wp.data
        .select("core/block-editor")
        .getBlocks()
        .some((block) => block.name === name),
    blockName
  );
}

async function postEditor(page, row) {
  const legacy = args["legacy-editor"] ? "&candidate_legacy_editor=1" : "";
  await page.goto(
    row.origin + "/wp-admin/post-new.php" + (legacy ? "?candidate_legacy_editor=1" : "")
  );
  await page.waitForFunction(
    (name) =>
      !!window.wp?.blocks?.getBlockType(name) &&
      wp.data.select("core/editor").getCurrentPostId() > 0,
    blockName
  );
  await dismissGuides(page);
  const caption =
    `Post ${args.label} ${args.engine} ${row.role} "quotes" & Київ 🕒` +
    (args["terminal-control"] ? " terminal " + String.fromCharCode(92) : "");
  row.terminalBackslashControl = args["terminal-control"];
  await insertClock(page, row);
  row.expected = await configureClock(page, caption, row);
  row.framesBeforeSave = await waitForClock(page, caption);
  row.editorRealm = row.framesBeforeSave
    .filter((frame) => frame.clocks?.length)
    .map((frame) => frame.url);
  row.blockApiVersion = await page.evaluate(
    (name) => wp.blocks.getBlockType(name).apiVersion,
    blockName
  );
  row.metaboxPresent = await page
    .getByText("Read-only local acceptance fixture.", { exact: true })
    .count();
  if (args["legacy-editor"])
    assert.equal(row.metaboxPresent, 1, "Guarded native metabox must be present");
  if (args["legacy-editor"] && row.site === "minimum")
    assert(
      row.framesBeforeSave
        .filter((frame) => frame.clocks?.length)
        .every((frame) => frame.url.includes("post-new.php")),
      "The metabox configuration must use the parent editor document"
    );
  if (args.lifecycle) {
    if (!args["unsaved-lifecycle"]) {
      await page.getByRole("button", { name: /^Save draft$/i }).click();
      await page.waitForFunction(
        () =>
          !wp.data.select("core/editor").isSavingPost() &&
          wp.data.select("core/editor").didPostSaveRequestSucceed()
      );
      row.postId = await page.evaluate(() => wp.data.select("core/editor").getCurrentPostId());
      await page.waitForTimeout(700);
      await page.goto(row.origin + `/wp-admin/post.php?post=${row.postId}&action=edit` + legacy);
      await waitForClock(page, caption);
      row.actions.push("Native Save draft and reopen before the persisted-block lifecycle");
    }
    await removeNativeClock(page);
    await page.waitForFunction(
      () => !wp.data.select("core/editor").getEditedPostContent().includes("<timenow-zone-sdcw")
    );
    row.undoStates = [];
    for (let step = 0; step < 3; step++) {
      const state = await page.evaluate(
        (name) => ({
          blocks: wp.data
            .select("core/block-editor")
            .getBlocks()
            .map((block) => ({
              name: block.name,
              attributes: block.attributes,
              valid: block.isValid,
            })),
          hasUndo: wp.data.select("core").hasUndo(),
          restored: wp.data
            .select("core/block-editor")
            .getBlocks()
            .some((block) => block.name === name),
        }),
        blockName
      );
      row.undoStates.push({ step, state });
      if (state.restored) break;
      assert(
        step < 2 && state.hasUndo,
        "Native Undo must restore the clock within the observed Core history levels"
      );
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await page.waitForFunction(
        (before) =>
          JSON.stringify(
            wp.data
              .select("core/block-editor")
              .getBlocks()
              .map((block) => block.name)
          ) !== before,
        JSON.stringify(state.blocks.map((block) => block.name))
      );
    }
    assert(row.undoStates.at(-1).state.restored);
    row.undoClicks = row.undoStates.length - 1;
    assert.deepEqual(
      row.undoStates.at(-1).state.blocks.find((block) => block.name === blockName).attributes,
      row.expected
    );
    await waitForClock(page, caption);
    row.actions.push("Native Backspace and Undo; restored live clock preview");
    await removeNativeClock(page);
    await insertClock(page, row);
    row.expected = await configureClock(page, caption, row);
    await waitForClock(page, caption);
    row.actions.push("Native reinsertion after removal");
  }
  await insertClock(page, row);
  row.secondExpected = await configureClock(page, caption + " second", row);
  await waitForClock(page, caption, 2);
  row.actions.push("Second native clock insertion in the same document");
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
    await page.waitForTimeout(700);
    await page.goto(row.origin + `/wp-admin/post.php?post=${row.postId}&action=edit` + legacy);
    await page.waitForFunction(
      (name) =>
        wp.data
          .select("core/block-editor")
          .getBlocks()
          .some((block) => block.name === name),
      blockName
    );
    row.reopened = await blockState(page);
    assert.equal(row.reopened.length, 2);
    assert(row.reopened.every((block) => block.valid));
    assert.deepEqual(
      row.reopened.map((block) => block.attributes),
      [row.expected, row.secondExpected]
    );
    row.frames = await waitForClock(page, caption, 2);
  }
}

try {
  for (const [site, configuration] of Object.entries(run.sites)) {
    if (args.site && args.site !== site) continue;
    for (const role of args.mode === "post-editor" ? ["admin", "author"] : ["admin"]) {
      if (args.role && args.role !== role) continue;
      const row = {
        site,
        role,
        origin: configuration.url,
        mode: args.mode,
        pass: false,
        actions: [],
        pageErrors: [],
        pageErrorDetails: [],
        responses: [],
      };
      row.installed = await installedIdentity(site);
      if (stageManifest) assert.deepEqual(row.installed.files, stageManifest.files);
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
        timezoneId: "Asia/Tokyo",
      });
      await context.route("**/*", (route) =>
        new URL(route.request().url()).origin === row.origin ? route.continue() : route.abort()
      );
      let page = await context.newPage();
      const responses = [];
      function observePage(page) {
        page.on("pageerror", (error) => {
          row.pageErrors.push(error.message);
          row.pageErrorDetails.push({ message: error.message, stack: error.stack });
        });
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
      }
      observePage(page);
      try {
        await page.goto(row.origin + "/wp-login.php");
        await page.locator("#user_login").fill("audit_" + role);
        await page.locator("#user_pass").fill(credentials[role]);
        await page.locator("#wp-submit").click();
        await page.waitForURL((url) => url.pathname.startsWith("/wp-admin/"));
        const dashboard = page;
        row.dashboard = await renderedFrames(dashboard);
        if (row.installed.version !== "1.1.2")
          assert(
            row.dashboard.every(
              (frame) =>
                !frame.defined &&
                !frame.clocks?.length &&
                !frame.scripts?.some((script) =>
                  /assets\/public\/js|clock-bootstrap/.test(script.src)
                )
            ),
            "Ordinary dashboard must not load clock runtime or bootstrap"
          );
        page = await context.newPage();
        observePage(page);
        await {
          "legacy-preview": legacyPreview,
          "site-editor": siteEditor,
          "post-editor": postEditor,
        }[args.mode](page, row);
        row.dashboardAfter = await renderedFrames(dashboard);
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
              channel: launchChannel ?? null,
              platform: process.platform,
              architecture: process.arch,
              browser: browser.version(),
              mode: args.mode,
              candidateInputSha256: candidate.archive_sha256,
              initialCandidateInputSha256: run.archive_sha256,
              stage: args.stage ?? null,
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
