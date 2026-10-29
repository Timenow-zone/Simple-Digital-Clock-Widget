#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();

const FILES = {
  packageJson: path.join(ROOT, "package.json"),
  packageLock: path.join(ROOT, "package-lock.json"),
  source: path.join(ROOT, "src", "SimpleDigitalClockWidget.tsx"),
  readme: path.join(ROOT, "README.md"),
  dist: path.join(ROOT, "dist"),
};

const VERSION_RE =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const SOURCE_HEADER_RE = /^(\s*\*\s*Version:\s*)([^\s]+)(\s*)$/m;
const SOURCE_CONST_RE = /^(\s*const\s+v\s*=\s*")([^"]+)(";\s*)$/m;

const README_START = "<!-- SDCW_RELEASE_METADATA_START -->";
const README_END = "<!-- SDCW_RELEASE_METADATA_END -->";

function usage(exitCode = 0) {
  console.log(`
Simple Digital Clock Widget release metadata synchronizer

Usage:
  node scripts/sync-release-metadata.mjs --check
  node scripts/sync-release-metadata.mjs --sync
  node scripts/sync-release-metadata.mjs --version 0.7.0
  node scripts/sync-release-metadata.mjs --artifacts
  node scripts/sync-release-metadata.mjs --verify-versioned

Modes:
  --check
      Read-only gate. Verifies:
        - package-lock.json root versions
        - source Version header
        - source const v
        - README version, artifact size/SHA256, and recorded gzip metadata
      against package.json and dist/<version>.min.js.
      Gzip size records a release-time encoder measurement; it is not an
      artifact identity check and may differ with the current Node/zlib.

  --sync
      Uses package.json as source of truth and synchronizes:
        - package-lock.json top-level version
        - package-lock.json packages[""].version
        - source header "Version: ..."
        - source "const v = ..."
        - README generated release-metadata block
      This explicit update measures gzip with the current Node/zlib encoder
      and records its provenance; --check preserves that recorded measurement.

  --version <x.y.z>
      Sets package.json to the supplied version and synchronizes package-lock
      plus source version metadata. It intentionally does NOT update README
      artifact metrics. Run the final build, then --sync.

  --artifacts
      Read-only. Prints byte size, gzip size and SHA256 for current
      distributable artifacts that exist.

  --verify-versioned
      Release-only gate. Requires dist/<package-version>.min.js and verifies
      that it is byte-for-byte identical to dist/latest.min.js.

Recommended release order:
  npm run release:version -- 0.7.0
  npm run build
  npm run release:sync
  npm run release:check
  npm run release:verify

Safety:
  - No global search/replace.
  - Nested dependency versions in package-lock.json are never touched.
  - Historical dist/<old-version>.min.js files are never modified.
  - README is changed only inside explicit SDCW_RELEASE_METADATA markers.
`.trim());
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    usage(0);
  }

  const check = args.includes("--check");
  const sync = args.includes("--sync");
  const artifacts = args.includes("--artifacts");
  const verifyVersioned = args.includes("--verify-versioned");
  const versionIndex = args.indexOf("--version");
  let version = null;

  if (versionIndex !== -1) {
    version = args[versionIndex + 1];

    if (!version || version.startsWith("--")) {
      throw new Error("--version requires a value, e.g. --version 0.7.0");
    }
  }

  const selected =
    Number(check) +
    Number(sync) +
    Number(artifacts) +
    Number(verifyVersioned) +
    Number(version !== null);

  if (selected !== 1) {
    throw new Error(
      "Choose exactly one mode: --check, --sync, --version <version>, --artifacts, or --verify-versioned.",
    );
  }

  const known = new Set([
    "--check",
    "--sync",
    "--artifacts",
    "--verify-versioned",
    "--version",
    "--help",
    "-h",
  ]);

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--version") {
      i += 1;
      continue;
    }

    if (!known.has(arg)) {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return {
    mode:
      version !== null
        ? "version"
        : check
          ? "check"
          : sync
            ? "sync"
            : artifacts
              ? "artifacts"
              : "verify-versioned",
    version,
  };
}

async function readUtf8(file) {
  return fs.readFile(file, "utf8");
}

async function readJson(file) {
  const raw = await readUtf8(file);

  try {
    return { raw, data: JSON.parse(raw) };
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`,
    );
  }
}

function assertVersion(version, source) {
  if (typeof version !== "string" || !VERSION_RE.test(version)) {
    throw new Error(
      `${source} contains an invalid release version: ${String(version)}`,
    );
  }
}

function replaceExactlyOnce(text, regex, replacement, label) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const matches = [...text.matchAll(new RegExp(regex.source, flags))];

  if (matches.length !== 1) {
    throw new Error(
      `${label}: expected exactly 1 match, found ${matches.length}. Refusing to modify the file.`,
    );
  }

  return text.replace(regex, replacement);
}

function sourceVersions(sourceText) {
  const header = sourceText.match(SOURCE_HEADER_RE);
  const constant = sourceText.match(SOURCE_CONST_RE);

  if (!header) {
    throw new Error(
      'src/SimpleDigitalClockWidget.tsx: "Version: ..." header not found.',
    );
  }

  if (!constant) {
    throw new Error(
      'src/SimpleDigitalClockWidget.tsx: `const v = "...";` not found.',
    );
  }

  return { header: header[2], constant: constant[2] };
}

function syncSource(sourceText, version) {
  let next = replaceExactlyOnce(
    sourceText,
    SOURCE_HEADER_RE,
    `$1${version}$3`,
    "source Version header",
  );

  next = replaceExactlyOnce(
    next,
    SOURCE_CONST_RE,
    `$1${version}$3`,
    "source const v",
  );

  return next;
}

function stringifyJsonLike(originalRaw, data) {
  const newline = originalRaw.includes("\r\n") ? "\r\n" : "\n";
  const serialized = JSON.stringify(data, null, 2).replace(/\n/g, newline);
  return `${serialized}${newline}`;
}

async function writeIfChanged(file, before, after, changed) {
  if (before === after) return false;

  await fs.writeFile(file, after, "utf8");
  changed.push(path.relative(ROOT, file));
  return true;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function artifactInfo(file) {
  if (!(await fileExists(file))) return null;

  const bytes = await fs.readFile(file);

  return {
    file: path.relative(ROOT, file),
    bytes: bytes.length,
    gzipBytes: gzipSync(bytes, { level: 9 }).length,
    gzipMeasurement: { node: process.version, zlib: process.versions.zlib },
    sha256: sha256(bytes),
  };
}

async function currentVersionArtifactInfo(version) {
  const file = path.join(FILES.dist, `${version}.min.js`);
  const info = await artifactInfo(file);

  if (!info) {
    throw new Error(
      `dist/${version}.min.js does not exist; run the release build before syncing/checking README metadata.`,
    );
  }

  return info;
}

function formatInteger(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatKiB(value) {
  return (value / 1024).toFixed(1);
}

function expectedReadmeBlock(version, artifact) {
  return [
    README_START,
    `* **Current version:** \`${version}\``,
    `* **Tiny:** ${formatKiB(artifact.gzipBytes)} KiB gzipped (\`dist/${version}.min.js\`; ${formatInteger(artifact.bytes)} bytes minified, ${formatInteger(artifact.gzipBytes)} bytes gzip)`,
    `* **Artifact SHA-256:** \`${artifact.sha256}\``,
    `* **Gzip measurement:** level 9; Node \`${artifact.gzipMeasurement.node}\`; zlib \`${artifact.gzipMeasurement.zlib}\`. Other encoders may produce different sizes.`,
    README_END,
  ].join("\n");
}

function recordedGzipMetadata(block, artifactBytes) {
  const size = block.match(/, ([0-9][0-9,]*) bytes gzip\)/);
  const encoder = block.match(/^\* \*\*Gzip measurement:\*\* level 9; Node `([^`]+)`; zlib `([^`]+)`\. Other encoders may produce different sizes\.$/m);
  if (!size || !encoder) {
    throw new Error("README.md recorded gzip metadata is missing or malformed. Run release:sync with the intended release encoder.");
  }

  const gzipBytes = Number(size[1].replaceAll(",", ""));
  if (!Number.isSafeInteger(gzipBytes) || gzipBytes <= 0 || gzipBytes > artifactBytes) {
    throw new Error("README.md recorded gzip bytes must be a positive safe integer no greater than the minified artifact size.");
  }
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(encoder[1]) || !/^[0-9A-Za-z][0-9A-Za-z.+-]{0,63}$/.test(encoder[2])) {
    throw new Error("README.md recorded gzip encoder metadata is malformed.");
  }

  return { gzipBytes, gzipMeasurement: { node: encoder[1], zlib: encoder[2] } };
}

function findReadmeBlock(readmeText) {
  const start = readmeText.indexOf(README_START);
  const end = readmeText.indexOf(README_END);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      "README.md release metadata markers are missing. Apply the README hundredths documentation update first.",
    );
  }

  const secondStart = readmeText.indexOf(README_START, start + README_START.length);
  const secondEnd = readmeText.indexOf(README_END, end + README_END.length);

  if (secondStart !== -1 || secondEnd !== -1) {
    throw new Error(
      "README.md must contain exactly one release metadata marker block.",
    );
  }

  return {
    start,
    end: end + README_END.length,
    content: readmeText.slice(start, end + README_END.length),
  };
}

function syncReadme(readmeText, version, latest) {
  const block = findReadmeBlock(readmeText);
  const expected = expectedReadmeBlock(version, latest);

  return (
    readmeText.slice(0, block.start) +
    expected +
    readmeText.slice(block.end)
  );
}

async function collectArtifacts(version) {
  const candidates = [
    path.join(FILES.dist, "SimpleDigitalClockWidget.js"),
    path.join(FILES.dist, "latest.min.js"),
    path.join(FILES.dist, `${version}.min.js`),
  ];

  const result = [];

  for (const file of candidates) {
    const info = await artifactInfo(file);
    if (info) result.push(info);
  }

  return result;
}

function printArtifacts(artifacts) {
  if (artifacts.length === 0) {
    console.log("No current distributable artifacts found.");
    return;
  }

  console.log("Artifacts:");

  for (const item of artifacts) {
    console.log(`  ${item.file}`);
    console.log(`    bytes:      ${item.bytes}`);
    console.log(`    gzip bytes: ${item.gzipBytes}`);
    console.log(`    gzip encoder: level 9; Node ${item.gzipMeasurement.node}; zlib ${item.gzipMeasurement.zlib}`);
    console.log(`    sha256:     ${item.sha256}`);
  }
}

async function verifyVersionedArtifact(version) {
  const latest = path.join(FILES.dist, "latest.min.js");
  const versioned = path.join(FILES.dist, `${version}.min.js`);

  if (!(await fileExists(versioned))) {
    throw new Error(`dist/${version}.min.js does not exist.`);
  }

  if (!(await fileExists(latest))) {
    throw new Error("dist/latest.min.js does not exist.");
  }

  const [latestBytes, versionedBytes] = await Promise.all([
    fs.readFile(latest),
    fs.readFile(versioned),
  ]);

  const latestHash = sha256(latestBytes);
  const versionedHash = sha256(versionedBytes);

  if (
    latestBytes.length !== versionedBytes.length ||
    !latestBytes.equals(versionedBytes)
  ) {
    throw new Error(
      [
        `dist/${version}.min.js is not byte-for-byte identical to dist/latest.min.js.`,
        `latest:    ${latestBytes.length} bytes ${latestHash}`,
        `versioned: ${versionedBytes.length} bytes ${versionedHash}`,
      ].join("\n"),
    );
  }

  return {
    bytes: latestBytes.length,
    sha256: latestHash,
  };
}

async function loadState({ includeReadme = true } = {}) {
  const promises = [
    readJson(FILES.packageJson),
    readJson(FILES.packageLock),
    readUtf8(FILES.source),
  ];

  if (includeReadme) {
    promises.push(readUtf8(FILES.readme));
  }

  const [pkg, lock, sourceText, readmeText] = await Promise.all(promises);

  const packageVersion = pkg.data.version;
  assertVersion(packageVersion, "package.json");

  const source = sourceVersions(sourceText);

  return {
    pkg,
    lock,
    sourceText,
    readmeText,
    versions: {
      packageVersion,
      lockTopVersion: lock.data.version,
      lockRootVersion: lock.data.packages?.[""]?.version,
      sourceHeaderVersion: source.header,
      sourceConstVersion: source.constant,
    },
  };
}

function collectVersionMismatches(versions) {
  const expected = versions.packageVersion;

  return [
    ["package-lock.json top-level version", versions.lockTopVersion],
    ['package-lock.json packages[""].version', versions.lockRootVersion],
    ["source Version header", versions.sourceHeaderVersion],
    ["source const v", versions.sourceConstVersion],
  ]
    .filter(([, actual]) => actual !== expected)
    .map(([label, actual]) => ({ label, expected, actual }));
}

async function checkMode() {
  const state = await loadState();
  const mismatches = collectVersionMismatches(state.versions);

  console.log(`Source of truth: package.json = ${state.versions.packageVersion}`);

  if (mismatches.length) {
    console.error("Metadata mismatches:");

    for (const mismatch of mismatches) {
      console.error(
        `  FAIL ${mismatch.label}: expected ${mismatch.expected}, found ${String(mismatch.actual)}`,
      );
    }

    process.exitCode = 1;
    return;
  }

  console.log("PASS package-lock.json top-level version");
  console.log('PASS package-lock.json packages[""].version');
  console.log("PASS source Version header");
  console.log("PASS source const v");

  const artifact = await currentVersionArtifactInfo(
    state.versions.packageVersion,
  );
  const actualBlock = findReadmeBlock(state.readmeText).content;
  const recordedGzip = recordedGzipMetadata(actualBlock, artifact.bytes);
  const expectedBlock = expectedReadmeBlock(
    state.versions.packageVersion,
    { ...artifact, ...recordedGzip },
  );

  if (actualBlock !== expectedBlock) {
    console.error("FAIL README.md release metadata block is stale.");
    console.error("Run: npm run release:sync");
    process.exitCode = 1;
    return;
  }

  console.log("PASS README.md version, artifact size/SHA256, and recorded gzip metadata format");
  console.log(`Recorded gzip: ${recordedGzip.gzipBytes} bytes (level 9; Node ${recordedGzip.gzipMeasurement.node}; zlib ${recordedGzip.gzipMeasurement.zlib})`);
  console.log(`Current gzip: ${artifact.gzipBytes} bytes (level 9; Node ${artifact.gzipMeasurement.node}; zlib ${artifact.gzipMeasurement.zlib})`);
  if (recordedGzip.gzipBytes !== artifact.gzipBytes) {
    console.log("INFO gzip measurements differ by encoder; artifact identity is verified by exact minified size and SHA256.");
  }
  console.log("PASS release metadata is synchronized.");
}

async function syncCore(state, version) {
  const changed = [];
  const packageData = structuredClone(state.pkg.data);
  const lockData = structuredClone(state.lock.data);

  if (packageData.version !== version) {
    packageData.version = version;
  }

  if (!lockData.packages || !lockData.packages[""]) {
    throw new Error(
      'package-lock.json does not contain packages[""]; refusing to edit it.',
    );
  }

  lockData.version = version;
  lockData.packages[""].version = version;

  const nextPackage = stringifyJsonLike(state.pkg.raw, packageData);
  const nextLock = stringifyJsonLike(state.lock.raw, lockData);
  const nextSource = syncSource(state.sourceText, version);

  await writeIfChanged(FILES.packageJson, state.pkg.raw, nextPackage, changed);
  await writeIfChanged(FILES.packageLock, state.lock.raw, nextLock, changed);
  await writeIfChanged(FILES.source, state.sourceText, nextSource, changed);

  return changed;
}

async function versionMode(targetVersion) {
  assertVersion(targetVersion, "--version");

  const state = await loadState({ includeReadme: false });
  const changed = await syncCore(state, targetVersion);

  if (changed.length === 0) {
    console.log(`Already synchronized at ${targetVersion}; no files changed.`);
  } else {
    console.log(`Synchronized core release version to ${targetVersion}:`);
    for (const file of changed) console.log(`  ${file}`);
  }

  const after = await loadState({ includeReadme: false });
  const mismatches = collectVersionMismatches(after.versions);

  if (mismatches.length) {
    throw new Error(
      `Post-write verification failed:\n${mismatches
        .map(
          (item) =>
            `  ${item.label}: expected ${item.expected}, found ${String(item.actual)}`,
        )
        .join("\n")}`,
    );
  }

  console.log("PASS core version metadata verification.");
  console.log("NEXT: npm run build");
  console.log("NEXT: npm run release:sync");
}

async function syncMode() {
  const state = await loadState();
  const version = state.versions.packageVersion;
  assertVersion(version, "package.json");

  // Validate README inputs before modifying any metadata files.
  const artifact = await currentVersionArtifactInfo(version);
  findReadmeBlock(state.readmeText);

  const changed = await syncCore(state, version);
  const nextReadme = syncReadme(state.readmeText, version, artifact);

  await writeIfChanged(
    FILES.readme,
    state.readmeText,
    nextReadme,
    changed,
  );

  if (changed.length === 0) {
    console.log(`Already synchronized at ${version}; no files changed.`);
  } else {
    console.log(`Synchronized release metadata to ${version}:`);
    for (const file of changed) console.log(`  ${file}`);
  }

  await checkMode();
}

async function artifactsMode() {
  const state = await loadState({ includeReadme: false });
  const artifacts = await collectArtifacts(state.versions.packageVersion);

  console.log(`package.json version: ${state.versions.packageVersion}`);
  printArtifacts(artifacts);
}

async function verifyVersionedMode() {
  const state = await loadState({ includeReadme: false });
  const version = state.versions.packageVersion;
  const result = await verifyVersionedArtifact(version);

  console.log(
    `PASS dist/${version}.min.js matches dist/latest.min.js byte-for-byte.`,
  );
  console.log(`  bytes:  ${result.bytes}`);
  console.log(`  sha256: ${result.sha256}`);
}

async function main() {
  const { mode, version } = parseArgs(process.argv);

  if (mode === "check") return checkMode();
  if (mode === "sync") return syncMode();
  if (mode === "version") return versionMode(version);
  if (mode === "artifacts") return artifactsMode();
  if (mode === "verify-versioned") return verifyVersionedMode();

  usage(1);
}

main().catch((error) => {
  console.error(`ERROR: ${error.stack || error.message || error}`);
  process.exitCode = 1;
});
