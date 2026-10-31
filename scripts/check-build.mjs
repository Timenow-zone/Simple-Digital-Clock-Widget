#!/usr/bin/env node

import { createRequire } from "node:module";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

async function main() {
  const root = process.cwd();
  const require = createRequire(path.join(root, "package.json"));
  // Resolve Parcel's API from Parcel itself, independently of npm's hoisting layout.
  const parcelRequire = createRequire(require.resolve("parcel"));
  const { Parcel } = parcelRequire("@parcel/core");
  const { minify } = require("terser");
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  if (!pkg.targets?.default) {
    throw new Error("package.json must define the default Parcel target.");
  }

  const output = await mkdtemp(path.join(tmpdir(), "sdcw-build-"));
  console.log(`Building the production target into ${output}`);
  const parcel = new Parcel({
    entries: path.join(root, "src/SimpleDigitalClockWidget.tsx"),
    mode: "production",
    defaultConfig: parcelRequire.resolve("@parcel/config-default"),
    targets: { default: { ...pkg.targets.default, distDir: output } },
    shouldAutoInstall: false,
    shouldDisableCache: true,
    defaultTargetOptions: { shouldOptimize: false, shouldScopeHoist: true },
  });
  const { bundleGraph } = await parcel.run();
  const bundles = bundleGraph.getBundles();
  if (!bundles.length || bundles.some((bundle) => !bundle.filePath.startsWith(output + path.sep))) {
    throw new Error("Parcel must emit all bundles inside the temporary output directory.");
  }

  const scripts = bundles.filter((bundle) => bundle.type === "js");
  if (scripts.length !== 1) {
    throw new Error("The versioned widget release must contain one JavaScript bundle.");
  }
  for (const bundle of scripts) {
    const result = await minify(await readFile(bundle.filePath, "utf8"), { compress: true, mangle: true });
    if (typeof result.code !== "string" || !result.code.length) {
      throw new Error(`Terser emitted an empty result for ${bundle.filePath}.`);
    }
    await writeFile(`${bundle.filePath}.min.js`, result.code);
    const accepted = await readFile(path.join(root, "dist", `${pkg.version}.min.js`));
    if (!Buffer.from(result.code).equals(accepted)) {
      throw new Error(`Fresh production bytes differ from dist/${pkg.version}.min.js. Prepare a separately versioned artifact; never overwrite an immutable release.`);
    }
  }
  console.log(`PASS production build exactly matches dist/${pkg.version}.min.js; output ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
