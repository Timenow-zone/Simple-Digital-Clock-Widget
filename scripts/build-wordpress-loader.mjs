import { createRequire } from "node:module";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const parcelRequire = createRequire(require.resolve("parcel"));
const { Parcel } = parcelRequire("@parcel/core");
const { minify } = require("terser");
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const output = await mkdtemp(path.join(tmpdir(), "sdcw-loader-"));
const mode = process.argv[2];
if (!["--build", "--check"].includes(mode) || process.argv.length !== 3) {
  throw new Error("Usage: node scripts/build-wordpress-loader.mjs --build|--check");
}
const parcel = new Parcel({
  entries: path.join(root, "src/wordpress-loader.js"),
  mode: "production",
  defaultConfig: parcelRequire.resolve("@parcel/config-default"),
  targets: { default: { ...pkg.targets.default, distDir: output } },
  shouldAutoInstall: false,
  shouldDisableCache: true,
  defaultTargetOptions: { shouldOptimize: false, shouldScopeHoist: true },
});
const { bundleGraph } = await parcel.run();
const bundles = bundleGraph.getBundles();
if (bundles.length !== 1 || bundles[0].type !== "js" || !bundles[0].filePath.startsWith(output + path.sep)) {
  throw new Error("The WordPress bootstrap must produce exactly one isolated JavaScript bundle.");
}
const result = await minify(await readFile(bundles[0].filePath, "utf8"), { compress: true, mangle: true });
if (!result.code) throw new Error("Empty WordPress bootstrap output");
const target = path.join(root, "wordpress/simple-digital-clock/assets/public/js/simple-digital-clock-loader.js");
if (mode === "--build") await writeFile(target, result.code);
else if (!(await readFile(target)).equals(Buffer.from(result.code))) {
  throw new Error("WordPress bootstrap differs from its source; regenerate and reaccept the candidate.");
}
console.log(`PASS WordPress bootstrap ${mode}: ${Buffer.byteLength(result.code)} bytes; ${target}`);
