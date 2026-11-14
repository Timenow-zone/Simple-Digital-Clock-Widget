import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const source = process.env.SDCW_WORDPRESS_SOURCE || path.resolve("wordpress/simple-digital-clock");

test("Classic stale-save guard protects data and preserves authorized native paths", () => {
  const result = spawnSync(process.env.PHP_BINARY || "php", ["tests/wordpress-save-guard.php", source, process.env.SDCW_WORDPRESS_CORE || ""], { encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  assert.ok(report.checks.length >= 35);
  assert.deepEqual(report.checks.filter(row => !row.passed), []);
  assert.equal(report.failed, 0);
  assert.equal(result.status, 0);
});

test("Core before-autosave bridge transports only the current form marker", () => {
  let callback, marker = { value: "fresh-session-bound-marker" };
  const document = { getElementById(id) { assert.equal(id, "sdcw-classic-editor"); return marker; } };
  const context = { document, jQuery(target) {
    assert.equal(target, document);
    return { on(name, listener) { assert.equal(name, "before-autosave.sdcwClock"); callback = listener; } };
  } };
  vm.runInNewContext(readFileSync(path.join(source, "assets/admin/js/simple-digital-clock-save-guard.js"), "utf8"), context);
  const data = { content: "intentional deletion", _wpnonce: "Core nonce", foreign: { untouched: true } };
  const foreign = data.foreign;
  callback({}, data);
  assert.deepEqual(data, { content: "intentional deletion", _wpnonce: "Core nonce", foreign, sdcw_classic_editor: marker.value });
  assert.equal(data.foreign, foreign);
  marker = null;
  const oldData = { content: "old document" };
  callback({}, oldData);
  assert.deepEqual(oldData, { content: "old document" });
  for (const absent of [undefined, null, "unsupported"]) callback({}, absent);
});
