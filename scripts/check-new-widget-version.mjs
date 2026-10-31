import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const { version } = JSON.parse(await readFile("package.json", "utf8"));
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error("A valid widget version is required before building release artifacts.");
  }
  const artifact = path.join("dist", `${version}.min.js`);
  try {
    await lstat(artifact);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.log(`PASS new widget version ${version}; no existing immutable artifact.`);
    return;
  }
  throw new Error(`${artifact} already exists and is immutable. Bump the widget version first, or run node scripts/check-build.mjs for an isolated exact-byte verification.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
