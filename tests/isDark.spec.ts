// comments in English
import * as test from "node:test";
import * as assert from "node:assert/strict";
import isDark from "../src/isDark";

const save = () => {
  (globalThis as any).__bak = { window: (globalThis as any).window };
};
const restore = () => {
  if ((globalThis as any).__bak) (globalThis as any).window = (globalThis as any).__bak.window;
};

test.afterEach(() => {
  restore();
});

test.test("returns false if window is undefined", () => {
  save();
  (globalThis as any).window = undefined;
  assert.equal(isDark(), false);
});

test.test("returns false if matchMedia is missing", () => {
  save();
  (globalThis as any).window = {};
  assert.equal(isDark(), false);
});

test.test("detects dark scheme", () => {
  save();
  (globalThis as any).window = { matchMedia: (q: string) => ({ matches: q.includes("dark") }) };
  assert.equal(isDark(), true);
});

test.test("detects light scheme", () => {
  save();
  (globalThis as any).window = { matchMedia: () => ({ matches: false }) };
  assert.equal(isDark(), false);
});

test.test("matchMedia called with correct query", () => {
  save();
  let captured = "";
  (globalThis as any).window = {
    matchMedia: (q: string) => {
      captured = q;
      return { matches: true };
    },
  };
  assert.equal(isDark(), true);
  assert.equal(captured.includes("prefers-color-scheme"), true);
  assert.equal(captured.includes("dark"), true);
});
