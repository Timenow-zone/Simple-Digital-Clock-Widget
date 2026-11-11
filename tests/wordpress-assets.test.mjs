import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const source = process.env.SDCW_WORDPRESS_SOURCE || path.resolve("wordpress/simple-digital-clock");
const result = spawnSync("php", ["tests/wordpress-assets.php", source], {
  encoding: "utf8",
  timeout: 30_000,
});
const groups = {
  registration: "WordPress registers guarded handles before integration data without queueing resources",
  scope: "WordPress preserves excluded render bytes and skips non-frontend request contexts",
  capture: "Private Core capture isolates live queues and dependencies, including failure cleanup",
  "core-data": "Core-generated nonce, inline data and localization survive inert JSON serialization",
  loader: "Frontend pages receive one compatibility loader and no active external runtime tag",
  explicit: "Explicit Core enqueues and dependencies print once without a competing loader",
  editor: "Empty block-editor preview retains assets without widening ordinary admin scope",
};
let report;
test("WordPress asset fixture completes with structured checks and no PHP errors", () => {
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  assert.equal(result.stderr, "");
  report = JSON.parse(result.stdout);
  assert(Array.isArray(report.checks) && report.checks.length > 0);
  assert(report.checks.every(check => Object.hasOwn(groups, check.group) &&
    typeof check.passed === "boolean" && typeof check.name === "string"));
  assert.equal(report.failed, report.checks.filter(check => !check.passed).length);
  assert.equal(result.status, report.failed ? 1 : 0);
});

for (const [group, title] of Object.entries(groups)) {
  test(title, () => {
    assert(report, result.stderr || result.stdout);
    const checks = report.checks.filter(check => check.group === group);
    assert(checks.length > 0, `Missing fixture group: ${group}`);
    assert.deepEqual(checks.filter(check => !check.passed).map(check => check.name), []);
  });
}
