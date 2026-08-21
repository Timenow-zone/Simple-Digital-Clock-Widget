#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "product-site");
const TEMPLATE_FILE = path.join(SOURCE_DIR, "index.template.html");
const OUTPUT_DIR = path.join(ROOT, "product-dist");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");

const VERSION_RE =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const TOKENS = [
  "__SDCW_VERSION__",
  "__SDCW_WIDGET_ASSET__",
  "__SDCW_GZIP_KIB__",
];

function usage(exitCode = 0) {
  console.log(`
Simple Digital Clock product-site builder

Usage:
  node scripts/build-product-site.mjs --check
  node scripts/build-product-site.mjs --build

--check
    Read-only release gate. Verifies that:
      - package.json contains a valid version
      - dist/<version>.min.js exists
      - the product template contains all required generated placeholders
      - the template can be rendered with no unresolved SDCW placeholders

--build
    Generates product-dist/ for Cloudflare Pages:
      - product-dist/index.html
      - product-dist/assets/simple-digital-clock-widget-<version>.min.js
      - product-dist/version.json
      - product-dist/_headers
      - product-dist/robots.txt

Source of truth:
    package.json -> current release version
    dist/<version>.min.js -> deployed widget artifact and size/hash metadata

The generated product-dist/ directory is disposable and must not be committed.
`.trim());
  process.exit(exitCode);
}

function parseMode(argv) {
  const args = argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    usage(0);
  }

  const check = args.includes("--check");
  const build = args.includes("--build");

  if (Number(check) + Number(build) !== 1 || args.length !== 1) {
    throw new Error("Choose exactly one mode: --check or --build.");
  }

  return check ? "check" : "build";
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function replaceToken(text, token, value) {
  const count = text.split(token).length - 1;

  if (count < 1) {
    throw new Error(
      `${path.relative(ROOT, TEMPLATE_FILE)}: required token ${token} is missing.`,
    );
  }

  return text.split(token).join(value);
}

async function releaseState() {
  const packageFile = path.join(ROOT, "package.json");
  const pkg = JSON.parse(await fs.readFile(packageFile, "utf8"));
  const version = pkg.version;

  if (typeof version !== "string" || !VERSION_RE.test(version)) {
    throw new Error(`package.json contains invalid version: ${String(version)}`);
  }

  const artifactFile = path.join(ROOT, "dist", `${version}.min.js`);

  if (!(await exists(artifactFile))) {
    throw new Error(
      `dist/${version}.min.js does not exist. Build the release artifact first.`,
    );
  }

  const artifact = await fs.readFile(artifactFile);
  const gzipBytes = gzipSync(artifact, { level: 9 }).length;
  const artifactName = `simple-digital-clock-widget-${version}.min.js`;
  const assetPath = `/assets/${artifactName}`;

  return {
    version,
    artifactFile,
    artifact,
    artifactName,
    assetPath,
    bytes: artifact.length,
    gzipBytes,
    gzipKiB: (gzipBytes / 1024).toFixed(1),
    sha256: sha256(artifact),
  };
}

async function render(state) {
  let template = await fs.readFile(TEMPLATE_FILE, "utf8");

  for (const token of TOKENS) {
    if (!template.includes(token)) {
      throw new Error(
        `${path.relative(ROOT, TEMPLATE_FILE)}: required token ${token} is missing.`,
      );
    }
  }

  template = replaceToken(template, "__SDCW_VERSION__", state.version);
  template = replaceToken(
    template,
    "__SDCW_WIDGET_ASSET__",
    state.assetPath,
  );
  template = replaceToken(
    template,
    "__SDCW_GZIP_KIB__",
    state.gzipKiB,
  );

  const unresolved = template.match(/__SDCW_[A-Z0-9_]+__/g);

  if (unresolved) {
    throw new Error(
      `Unresolved product-site placeholders: ${[...new Set(unresolved)].join(", ")}`,
    );
  }

  return template;
}

function printState(state) {
  console.log(`Product site release: ${state.version}`);
  console.log(`Widget artifact: dist/${state.version}.min.js`);
  console.log(`  bytes:      ${state.bytes}`);
  console.log(`  gzip bytes: ${state.gzipBytes}`);
  console.log(`  sha256:     ${state.sha256}`);
}

async function checkMode() {
  const state = await releaseState();
  await render(state);
  printState(state);
  console.log("PASS product-site source is release-synchronized.");
}

async function buildMode() {
  const state = await releaseState();
  const html = await render(state);

  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  await fs.writeFile(path.join(OUTPUT_DIR, "index.html"), html, "utf8");
  await fs.copyFile(
    state.artifactFile,
    path.join(ASSETS_DIR, state.artifactName),
  );

  const versionJson = {
    version: state.version,
    widget: {
      path: state.assetPath,
      bytes: state.bytes,
      gzipBytes: state.gzipBytes,
      sha256: state.sha256,
    },
  };

  await fs.writeFile(
    path.join(OUTPUT_DIR, "version.json"),
    `${JSON.stringify(versionJson, null, 2)}\n`,
    "utf8",
  );

  const headers = `/
  Cache-Control: public, max-age=0, must-revalidate

/version.json
  Cache-Control: public, max-age=0, must-revalidate

${state.assetPath}
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

  await fs.writeFile(
    path.join(OUTPUT_DIR, "_headers"),
    headers,
    "utf8",
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, "robots.txt"),
    "User-agent: *\nAllow: /\n",
    "utf8",
  );

  printState(state);
  console.log(`PASS generated ${path.relative(ROOT, OUTPUT_DIR)}/`);
}

async function main() {
  const mode = parseMode(process.argv);

  if (mode === "check") {
    await checkMode();
  } else {
    await buildMode();
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.stack || error.message}`);
  process.exitCode = 1;
});
