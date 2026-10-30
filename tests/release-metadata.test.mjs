import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

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

function git(directory, args) {
  const result = spawnSync("git", args, {
    cwd: directory, encoding: "utf8", timeout: 10000,
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout.trim();
}

async function productFixture(t) {
  const directory = await fixture(t);
  await mkdir(path.join(directory, "product-site"));
  await copyFile(path.join(root, "product-site/index.template.html"), path.join(directory, "product-site/index.template.html"));
  return directory;
}

function buildSite(directory) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/build-product-site.mjs"), "--build"], {
    cwd: directory, encoding: "utf8", timeout: 10000,
  });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

test("product build preserves legacy CDN bytes and cache headers and links an existing source commit", async (t) => {
  const directory = await productFixture(t);
  const legacy = await readFile(path.join(root, "dist/0.7.0.min.js"));
  await writeFile(path.join(directory, "dist/0.7.0.min.js"), legacy);
  await writeFile(path.join(directory, "dist/latest.min.js"), "unversioned alias");
  git(directory, ["init", "--quiet"]);
  git(directory, ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-qm", "Product site fixture"]);
  const commit = git(directory, ["rev-parse", "HEAD"]);
  const result = buildSite(directory);
  assert.equal(result.status, 0, result.output);
  const output = path.join(directory, "product-dist");
  assert.deepEqual(await readFile(path.join(output, "assets/simple-digital-clock-widget-0.7.0.min.js")), legacy);
  assert.deepEqual(await readFile(path.join(output, `assets/simple-digital-clock-widget-${pkg.version}.min.js`)), await readFile(path.join(directory, artifactPath)));
  await assert.rejects(readFile(path.join(output, "assets/simple-digital-clock-widget-latest.min.js")), { code: "ENOENT" });
  const headers = await readFile(path.join(output, "_headers"), "utf8");
  for (const version of ["0.7.0", pkg.version]) {
    assert.ok(headers.includes(`/assets/simple-digital-clock-widget-${version}.min.js\n  Cache-Control: public, max-age=31536000, immutable\n  X-Content-Type-Options: nosniff`));
  }
  const html = await readFile(path.join(output, "index.html"), "utf8");
  assert.ok(html.includes(`/tree/${commit}`));
  assert.ok(!html.includes(`/tree/v${pkg.version}`));
});

test("product build rejects a missing source commit instead of inventing a tag link", async (t) => {
  const result = buildSite(await productFixture(t));
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Git checkout with a commit is required/);
});

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

function replaceGzipMeasurement(text, gzipBytes, { node, zlib }) {
  return text
    .replace(/[\d.]+ KiB gzipped/, `${(gzipBytes / 1024).toFixed(1)} KiB gzipped`)
    .replace(/[\d,]+ bytes gzip/, `${gzipBytes.toLocaleString("en-US")} bytes gzip`)
    .replace(/Node `[^`]+`; zlib `[^`]+`/, `Node \`${node}\`; zlib \`${zlib}\``);
}

test("release check verifies artifact identity with recorded gzip metadata", async (t) => {
  const result = run(await fixture(t));
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /artifact size\/SHA256/);
  assert.match(result.output, /Recorded gzip:/);
  assert.match(result.output, /Current gzip:/);
});

test("release check rejects a coherent wrong gzip size for the current encoder", async (t) => {
  const directory = await fixture(t);
  const wrongGzip = gzipSync(await readFile(path.join(directory, artifactPath)), { level: 9 }).length + 128;
  await changeReadme(directory, (text) => replaceGzipMeasurement(text, wrongGzip, { node: process.version, zlib: process.versions.zlib }));
  const result = run(directory);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /recorded gzip size .* does not match the current encoder measurement/);
});

test("release check accepts a coherent gzip measurement recorded with another encoder", async (t) => {
  const directory = await fixture(t);
  const recordedGzip = gzipSync(await readFile(path.join(directory, artifactPath)), { level: 9 }).length + 128;
  await changeReadme(directory, (text) => replaceGzipMeasurement(text, recordedGzip, { node: "v0.0.0", zlib: "fixture-encoder" }));
  const result = run(directory);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /INFO recorded gzip differs from the current runtime measurement/);
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
