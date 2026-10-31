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

test("WordPress ships complete MIT notices for its bundled dependencies", async () => {
  const notices = await readFile(path.join(plugin, "THIRD-PARTY-NOTICES.txt"), "utf8");
  const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
  for (const [name, licenseFile] of [["preact", "LICENSE"], ["preact-custom-element", "LICENSE"], ["clsx", "license"]]) {
    const directory = path.join(root, "node_modules", name);
    const installed = JSON.parse(await readFile(path.join(directory, "package.json"), "utf8"));
    const locked = lock.packages[`node_modules/${name}`];
    assert.equal(installed.version, locked.version, `${name} must match the lockfile`);
    assert.equal(installed.license, "MIT", `${name} license must be reviewed if it changes`);
    assert.ok(notices.includes(`${name} ${locked.version}\n`), `${name} notices must identify the bundled version`);
    const license = await readFile(path.join(directory, licenseFile), "utf8");
    assert.ok(notices.includes(license.trimEnd()), `${name} must retain its complete upstream license`);
  }
});

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
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  for (const [component, currentVersion] of [["Widget runtime", pkg.version], ["WordPress source", version]]) {
    const row = readme.split("\n")
      .map((line) => line.split("|").map((cell) => cell.trim()))
      .find((cells) => cells[1] === component);
    assert.ok(row, `README must identify ${component} separately`);
    assert.equal(row[2], `**${currentVersion}**`, `${component} documentation must match current source`);
  }
  assert.ok(readme.includes(`https://simple-digital-clock-widget.yuri.ws/assets/simple-digital-clock-widget-${pkg.version}.min.js`), "README installation must use the current versioned CDN asset");
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

test("WordPress and PHP minimum versions are declared in the plugin header and match the readme", async () => {
  const readme = await readFile(path.join(plugin, "readme.txt"), "utf8");
  for (const field of ["Requires at least", "Requires PHP"]) {
    const pattern = new RegExp(`^${field}:[\\t ]*([^\\r\\n]*)`, "m");
    const headerMinimum = header.match(pattern)?.[1].trim() ?? "";
    const readmeMinimum = readme.match(pattern)?.[1].trim() ?? "";
    assert.match(headerMinimum, /^\d+\.\d+(?:\.\d+)?$/, `${field} must be a nonempty numeric version in the main PHP header`);
    assert.match(readmeMinimum, /^\d+\.\d+(?:\.\d+)?$/, `${field} must be a nonempty numeric version in the readme`);
    assert.equal(headerMinimum, readmeMinimum, `${field} must agree between the main PHP header and readme`);
  }
});
