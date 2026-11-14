import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const source = process.env.SDCW_WORDPRESS_SOURCE || path.resolve("wordpress/simple-digital-clock");
const results = ["", "ordinary-json", "iframe-only", "rest-only", "rest-iframe", "ordinary-html"].map(mode => ({
  mode: mode || "main",
  ...spawnSync("php", ["tests/wordpress-assets.php", source, mode, process.env.SDCW_WORDPRESS_CORE || ""], {
    encoding: "utf8",
    timeout: 30_000,
  }),
}));
const groups = {
  registration: "WordPress registers guarded handles before integration data without queueing resources",
  scope: "WordPress preserves excluded render bytes and skips non-frontend request contexts",
  capture: "Private Core capture isolates live queues and dependencies, including failure cleanup",
  "core-data": "Core-generated nonce, inline data and localization survive inert JSON serialization",
  "runtime-policy": "Only the exact bundled runtime permits deferred shell registration; overrides retain ownership",
  loader: "Fallback pages receive inert configuration and one Core-owned external bootstrap",
  native: "Owned rendering and the public helper request runtime without private capture",
  "html-routing": "Rendered HTML token routing preserves bytes and excludes inert or foreign elements",
  preview: "Legacy preview requires both REST and iframe context without leaking output",
  explicit: "Explicit Core enqueues and dependencies print once without a competing loader",
  editor: "Empty block-editor preview retains assets without widening ordinary admin scope",
};
let report;
test("WordPress asset fixtures complete with structured checks and no PHP errors", () => {
  report = { checks: [], failed: 0 };
  for (const result of results) {
    assert.ifError(result.error);
    assert.equal(result.signal, null, result.mode);
    assert.equal(result.stderr, "", result.mode);
    const part = JSON.parse(result.stdout);
    assert(Array.isArray(part.checks) && part.checks.length > 0, result.mode);
    assert(part.checks.every(check => Object.hasOwn(groups, check.group) &&
      typeof check.passed === "boolean" && typeof check.name === "string"), result.mode);
    assert.equal(part.failed, part.checks.filter(check => !check.passed).length, result.mode);
    assert.equal(result.status, part.failed ? 1 : 0, result.mode);
    report.checks.push(...part.checks);
    report.failed += part.failed;
  }
});

for (const [group, title] of Object.entries(groups)) {
  test(title, () => {
    assert(report?.checks.length, results.map(result => `${result.mode}: ${result.stderr || result.stdout}`).join("\n"));
    const checks = report.checks.filter(check => check.group === group);
    assert(checks.length > 0, `Missing fixture group: ${group}`);
    assert.deepEqual(checks.filter(check => !check.passed).map(check => check.name), []);
  });
}
