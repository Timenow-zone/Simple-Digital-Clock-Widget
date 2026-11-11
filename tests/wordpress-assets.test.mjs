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
  clockless: "Final clock-free output emits no plugin JavaScript, including discarded owned renders",
  delivery: "Raw and owned clocks receive one Core runtime with separate CSS policies",
  "core-data": "Core-generated nonce, inline data and localization survive capture only for emitted clocks",
  streaming: "Late, split, cleaned and final output retain conditional delivery and deduplication",
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
