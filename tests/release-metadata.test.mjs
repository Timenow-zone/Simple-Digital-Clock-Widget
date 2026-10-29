import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const artifactPath = `dist/${pkg.version}.min.js`;

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "sdcw-release-metadata-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const file of ["package.json", "package-lock.json", "README.md", "src/SimpleDigitalClockWidget.tsx", artifactPath]) {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(root, file), target);
  }
  return directory;
}

function run(directory, mode = "--check") {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/sync-release-metadata.mjs"), mode], {
    cwd: directory,
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.error) throw result.error;
  assert.equal(result.signal, null);
  return { status: result.status, output: result.stdout + result.stderr };
}

async function changeReadme(directory, change) {
  const file = path.join(directory, "README.md");
  const before = await readFile(file, "utf8");
  const after = change(before);
  assert.notEqual(after, before, "The mutation must alter the fixture");
  await writeFile(file, after);
}

test("release check verifies artifact identity with recorded gzip metadata", async (t) => {
  const result = run(await fixture(t));
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /artifact size\/SHA256/);
  assert.match(result.output, /Recorded gzip:/);
  assert.match(result.output, /Current gzip:/);
});

for (const [label, change] of [
  ["version", (text) => text.replace(/\* \*\*Current version:\*\* `[^`]+`/, "* **Current version:** `999.0.0`")],
  ["artifact path", (text) => text.replace(/`dist\/[^`]+\.min\.js`;/, "`dist/wrong.min.js`;")],
  ["raw size", (text) => text.replace(/[\d,]+ bytes minified/, "1 bytes minified")],
  ["hash", (text) => text.replace(/\* \*\*Artifact SHA-256:\*\* `[a-f0-9]{64}`/, `* **Artifact SHA-256:** \`${"0".repeat(64)}\``)],
  ["gzip syntax", (text) => text.replace(/[\d,]+ bytes gzip/, "invalid bytes gzip")],
  ["zero gzip size", (text) => text.replace(/[\d,]+ bytes gzip/, "0 bytes gzip")],
  ["oversized gzip size", (text) => text.replace(/[\d,]+ bytes gzip/, "9,999,999 bytes gzip")],
  ["incoherent gzip KiB", (text) => text.replace(/[\d.]+ KiB gzipped/, "999.9 KiB gzipped")],
  ["encoder syntax", (text) => text.replace(/; zlib `[^`]+`/, "; zlib `invalid encoder`")],
]) {
  test(`release check rejects changed ${label}`, async (t) => {
    const directory = await fixture(t);
    await changeReadme(directory, change);
    const result = run(directory);
    assert.equal(result.status, 1, result.output);
  });
}

test("release check rejects a same-size artifact byte change", async (t) => {
  const directory = await fixture(t);
  const file = path.join(directory, artifactPath);
  const bytes = await readFile(file);
  bytes[0] ^= 1;
  await writeFile(file, bytes);
  const result = run(directory);
  assert.equal(result.status, 1, result.output);
});

test("release sync explicitly records the current encoder and preserves artifact bytes", async (t) => {
  const directory = await fixture(t);
  const before = await readFile(path.join(directory, artifactPath));
  const result = run(directory, "--sync");
  assert.equal(result.status, 0, result.output);
  const readme = await readFile(path.join(directory, "README.md"), "utf8");
  assert.ok(readme.includes(`Node \`${process.version}\`; zlib \`${process.versions.zlib}\``));
  assert.deepEqual(await readFile(path.join(directory, artifactPath)), before);
  assert.equal(run(directory).status, 0);
});
