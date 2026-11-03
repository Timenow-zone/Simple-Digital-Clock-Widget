import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("WordPress asset registration, rendered-output routing and editor scope remain bounded", () => {
  const source = process.env.SDCW_WORDPRESS_SOURCE || path.resolve("wordpress/simple-digital-clock");
  const result = spawnSync("php", ["tests/wordpress-assets.php", source], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.failed, 0);
  assert(report.checks.length >= 19);
});
