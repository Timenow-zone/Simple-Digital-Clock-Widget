import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = path.join(root, "wordpress/simple-digital-clock");
const header = await readFile(path.join(plugin, "widget_init.php"), "utf8");
const version = header.match(/^Version:\s*(\d+\.\d+\.\d+)\s*$/m)?.[1];
assert.ok(version, "The plugin must declare a release version");
const manifest = JSON.parse(await readFile(path.join(root, `docs/releases/${version}/manifest.json`), "utf8"));

async function installedFiles(directory, prefix = "") {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    assert.ok(!entry.name.startsWith(".") && !entry.isSymbolicLink(), `Unexpected package entry: ${relative}`);
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, await installedFiles(file, relative + "/"));
    else {
      assert.ok(entry.isFile(), `Unsupported package entry: ${relative}`);
      files[relative] = createHash("sha256").update(await readFile(file)).digest("hex");
    }
  }
  return files;
}

test("WordPress source matches its release manifest and immutable widget bundle", async () => {
  assert.equal(manifest.version, version);
  assert.match(manifest.widget, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(await installedFiles(plugin), manifest.files);
  assert.deepEqual(
    await readFile(path.join(plugin, "assets/public/js/simple-digital-clock.min.js")),
    await readFile(path.join(root, `dist/${manifest.widget}.min.js`)),
    "WordPress must ship the exact accepted versioned widget",
  );
});

test("WordPress header, stable tag, POT, source reference and script cache version agree", async () => {
  const readme = await readFile(path.join(plugin, "readme.txt"), "utf8");
  const pot = await readFile(path.join(plugin, "languages/simple-digital-clock.pot"), "utf8");
  assert.equal(readme.match(/^Stable tag:\s*(\S+)/m)?.[1], version);
  assert.ok(pot.includes(`Project-Id-Version: Simple Digital Clock 🕒 ${version}\\n`));
  const enqueue = header.match(/function SDCW_enqueue_scripts\(\)\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(enqueue, "The widget script registration must be identifiable");
  assert.equal(enqueue.match(/wp_register_script\(\s*'simple-digital-clock'\s*,[\s\S]*?\[\]\s*,\s*'([^']+)'/)?.[1], manifest.widget);
  assert.ok(readme.includes(`Bundled upstream version: ${manifest.widget}`));
  assert.match(manifest.widget_source_commit, /^[a-f0-9]{40}$/);
  assert.ok(readme.includes(`/tree/${manifest.widget_source_commit}`), "Source documentation must identify the accepted commit");
});
