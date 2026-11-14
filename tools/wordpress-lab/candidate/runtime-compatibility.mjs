import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { chromium, firefox, webkit } from "playwright";

const { values: args } = parseArgs({
  options: {
    "run-dir": { type: "string" },
    label: { type: "string" },
    engine: { type: "string", default: "chrome" },
  },
});
assert(args["run-dir"] && /^[a-z0-9][a-z0-9-]+$/.test(args.label ?? ""));
assert(["chrome", "chromium", "firefox", "webkit"].includes(args.engine));
const root = path.resolve(args["run-dir"]);
const run = JSON.parse(await fs.readFile(path.join(root, "run.json"), "utf8"));
assert.equal(run.run_dir, root);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifestBytes = await fs.readFile(path.join(root, "inputs/manifest.json"));
assert.equal(hash(manifestBytes), run.manifest_sha256);
const manifest = JSON.parse(manifestBytes);
assert.equal(hash(await fs.readFile(path.join(root, "inputs/candidate.zip"))), run.archive_sha256);
assert.equal(manifest.archive_sha256, run.archive_sha256);
const runtimeFile = "assets/public/js/simple-digital-clock.min.js";
const loaderFile = "assets/public/js/simple-digital-clock-loader.js";
assert(manifest.files[runtimeFile] && manifest.files[loaderFile]);
const out = path.join(root, "evidence", `${args.label}-${args.engine}`);
await fs.mkdir(out);
await fs.copyFile(new URL(import.meta.url), path.join(out, "harness-runtime-compatibility.mjs"));
await fs.copyFile(
  new URL("./runtime-fixture.php", import.meta.url),
  path.join(out, "runtime-fixture.php")
);
await fs.writeFile(
  path.join(out, "INVOCATION.json"),
  JSON.stringify(
    { argv: process.argv, platform: process.platform, architecture: process.arch },
    null,
    2
  )
);
const channel = args.engine === "chrome" ? "chrome" : undefined;
const browser = await { chrome: chromium, chromium, firefox, webkit }[args.engine].launch({
  channel,
  headless: true,
});
const scenarios = [
  { name: "owned", initial: ["healthy-1"] },
  { name: "raw-healthy", initial: ["healthy-1", "healthy-2"] },
  { name: "invalid-first", initial: ["bad-1", "healthy-1", "healthy-2"] },
  { name: "invalid-middle", initial: ["healthy-1", "bad-1", "healthy-2"] },
  { name: "all-invalid", initial: ["bad-1", "bad-2"] },
  { name: "dynamic-empty", initial: [], dynamic: ["healthy-1"] },
  {
    name: "dynamic-invalid-first",
    initial: [],
    dynamic: ["bad-1", "healthy-1", "bad-2", "healthy-2"],
  },
];
const errorsByHost = {
  "bad-1":
    "Color format not recognized. Use HEX (#RRGGBB, #RGB, with optional alpha) or rgb()/rgba().",
  "bad-2": "Invalid HEX digits.",
};
const rows = [];
const started = Date.now();
async function installed(site) {
  const directory = path.join(root, "lab/data", site, "wp-content/plugins/simple-digital-clock");
  const files = {};
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      assert(!entry.isSymbolicLink());
      if (entry.isDirectory()) await walk(file);
      else files[path.relative(directory, file)] = hash(await fs.readFile(file));
    }
  }
  await walk(directory);
  assert.deepEqual(
    files,
    manifest.files,
    "Installed plugin must match the frozen complete file map"
  );
  return files;
}
async function state(page) {
  return page.evaluate(() => ({
    audit: window.__nativeRuntimeAudit,
    ready: customElements.get("timenow-zone-sdcw")?.runtimeReady ?? null,
    loaderState:
      document.getElementById("simple-digital-clock-runtime")?.dataset.sdcwLoader ?? null,
    clocks: [...document.querySelectorAll("timenow-zone-sdcw")].map((clock) => ({
      id: clock.id,
      rendered: !!clock.shadowRoot?.querySelector("a"),
      time: clock.shadowRoot?.querySelector("a")?.textContent ?? null,
      caption: clock.shadowRoot?.querySelector("a")?.previousElementSibling?.textContent ?? null,
      width: clock.shadowRoot?.querySelector(".widget")?.style.width ?? null,
    })),
  }));
}
async function insert(page, ids) {
  await page.evaluate((ids) => {
    for (const id of ids) {
      const clock = document.createElement("timenow-zone-sdcw");
      clock.id = id;
      for (const [name, value] of Object.entries({
        locale: "en-GB",
        "time-zone": "UTC",
        second: "true",
        width: "230",
        caption: id,
      }))
        clock.setAttribute(name, value);
      if (id === "bad-1") clock.setAttribute("background-color", "invalid-color");
      if (id === "bad-2") clock.setAttribute("background-color", "#zzzzzz");
      document.body.append(clock);
    }
  }, ids);
}
async function ticking(page, ids, row, phase) {
  if (!ids.length) return;
  await page.waitForFunction(
    (ids) =>
      ids.every((id) => {
        const clock = document.getElementById(id);
        const anchor = clock?.shadowRoot?.querySelector("a");
        return (
          anchor &&
          /\d{1,2}:\d{2}:\d{2}/.test(anchor.textContent) &&
          anchor.getBoundingClientRect().width > 0 &&
          anchor.getBoundingClientRect().height > 0 &&
          anchor.previousElementSibling?.textContent === id &&
          clock.shadowRoot.querySelector(".widget")?.style.width === "230px"
        );
      }),
    ids,
    { timeout: 5000, polling: 100 }
  );
  const before = await page.evaluate(
    (ids) => ids.map((id) => document.getElementById(id).shadowRoot.querySelector("a").textContent),
    ids
  );
  await page.waitForFunction(
    ({ ids, before }) =>
      ids.every(
        (id, index) =>
          document.getElementById(id).shadowRoot.querySelector("a").textContent !== before[index]
      ),
    { ids, before },
    { timeout: 5000, polling: 100 }
  );
  row.ticks.push({
    phase,
    ids,
    before,
    after: await page.evaluate(
      (ids) =>
        ids.map((id) => document.getElementById(id).shadowRoot.querySelector("a").textContent),
      ids
    ),
  });
}
try {
  for (const [site, configuration] of Object.entries(run.sites)) {
    await installed(site);
    for (const scenario of scenarios) {
      const row = {
        site,
        scenario: scenario.name,
        pass: false,
        errors: [],
        responses: [],
        runtimeRequests: [],
        ticks: [],
      };
      const context = await browser.newContext({ viewport: { width: 1200, height: 1100 } });
      await context.route("**/*", (route) =>
        new URL(route.request().url()).origin === configuration.url
          ? route.continue()
          : route.abort()
      );
      const page = await context.newPage();
      const responseTasks = [];
      page.on("pageerror", (error) =>
        row.errors.push({ message: error.message, stack: error.stack })
      );
      page.on("request", (request) => {
        if (new URL(request.url()).pathname.endsWith("/" + runtimeFile))
          row.runtimeRequests.push(request.url());
      });
      page.on("response", (response) => {
        const file = [runtimeFile, loaderFile].find((file) =>
          new URL(response.url()).pathname.endsWith("/" + file)
        );
        if (file)
          responseTasks.push(
            (async () =>
              row.responses.push({
                file,
                url: response.url(),
                status: response.status(),
                sha256: hash(await response.body()),
              }))()
          );
      });
      try {
        await page.addInitScript(() => {
          const audit = (window.__nativeRuntimeAudit = {
            errors: [],
            loadErrors: [],
            readyEvents: 0,
          });
          addEventListener("error", (event) =>
            audit.errors.push(event.error?.message ?? event.message)
          );
          document.addEventListener("sdcw:load-error", (event) =>
            audit.loadErrors.push(event.detail)
          );
          customElements
            .whenDefined("timenow-zone-sdcw")
            .then((constructor) => constructor.whenRuntimeReady?.then(() => audit.readyEvents++));
        });
        const response = await page.goto(
          configuration.url + "/?candidate_runtime_case=" + scenario.name,
          { waitUntil: "load" }
        );
        assert.equal(response.status(), 200);
        await fs.writeFile(path.join(out, `${site}-${scenario.name}.html`), await response.text());
        row.headers = response.headers();
        if (scenario.dynamic) {
          await page.waitForTimeout(700);
          row.empty = await state(page);
          assert.equal(row.runtimeRequests.length, 0);
          assert.equal(row.empty.ready, false);
          assert.equal(row.empty.loaderState, "waiting");
          await insert(page, scenario.dynamic);
        }
        const ids = [...scenario.initial, ...(scenario.dynamic ?? [])];
        const healthy = ids.filter((id) => !id.startsWith("bad-"));
        const bad = ids.filter((id) => id.startsWith("bad-"));
        await page.waitForFunction(
          () => customElements.get("timenow-zone-sdcw")?.runtimeReady === true,
          null,
          { timeout: 5000, polling: 100 }
        );
        row.beforeLate = await state(page);
        if (scenario.name !== "owned") assert.equal(row.beforeLate.loaderState, "ready");
        await ticking(page, healthy, row, "initial");
        await insert(page, ["late-healthy"]);
        await ticking(page, [...healthy, "late-healthy"], row, "later-independent-clock");
        row.final = await state(page);
        assert.equal(row.final.ready, true);
        assert.equal(row.final.audit.readyEvents, 1);
        assert.deepEqual(row.final.audit.loadErrors, []);
        const expectedErrors = bad.map((id) => errorsByHost[id]).sort();
        assert.deepEqual(
          row.errors.map((error) => error.message).sort(),
          expectedErrors,
          "Each bad host must report its own original error"
        );
        assert.deepEqual([...row.final.audit.errors].sort(), expectedErrors);
        assert(
          row.final.clocks
            .filter((clock) => bad.includes(clock.id))
            .every((clock) => !clock.rendered)
        );
        await Promise.all(responseTasks);
        assert.equal(row.runtimeRequests.length, 1);
        assert.equal(row.responses.filter((response) => response.file === runtimeFile).length, 1);
        assert.equal(
          row.responses.filter((response) => response.file === loaderFile).length,
          scenario.name === "owned" ? 0 : 1
        );
        for (const asset of row.responses) {
          assert.equal(asset.status, 200);
          assert.equal(asset.sha256, manifest.files[asset.file]);
        }
        await page.screenshot({
          path: path.join(out, `${site}-${scenario.name}.png`),
          fullPage: true,
        });
        row.pass = true;
      } catch (error) {
        row.failure = { message: error.message, stack: error.stack };
        row.final = await state(page).catch((error) => ({ unavailable: error.message }));
        await page
          .screenshot({
            path: path.join(out, `${site}-${scenario.name}-failure.png`),
            fullPage: true,
          })
          .catch(() => {});
      } finally {
        await Promise.allSettled(responseTasks);
        await context.close();
        rows.push(row);
        await fs.writeFile(
          path.join(out, "RESULT.json"),
          JSON.stringify(
            {
              engine: args.engine,
              channel: channel ?? null,
              browserVersion: browser.version(),
              platform: process.platform,
              architecture: process.arch,
              candidateSHA256: run.archive_sha256,
              runtimeSHA256: manifest.files[runtimeFile],
              loaderSHA256: manifest.files[loaderFile],
              rows,
            },
            null,
            2
          ) + "\n"
        );
        const elapsed = (Date.now() - started) / 1000;
        const total = Object.keys(run.sites).length * scenarios.length;
        console.log(
          `[${rows.length}/${total} ${Math.round((rows.length / total) * 100)}%] ${site}/${scenario.name} ${row.pass ? "PASS" : "FAIL"}; elapsed=${elapsed.toFixed(1)}s rate=${(rows.length / elapsed).toFixed(2)}/s ETA=${((elapsed / rows.length) * (total - rows.length)).toFixed(1)}s`
        );
      }
    }
    await installed(site);
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
process.exitCode = rows.every((row) => row.pass) ? 0 : 1;
