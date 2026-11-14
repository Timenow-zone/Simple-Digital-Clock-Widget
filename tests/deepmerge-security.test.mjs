import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const implementations = [
  ["CommonJS", require("deepmerge")],
  ["UMD", require("deepmerge/dist/umd.js")],
];

for (const [name, merge] of implementations) {
  test(`${name}: prototype keys cannot poison cloned or merged objects`, () => {
    const payload = JSON.parse('{"__proto__":{"sdcwAdmin":true},"safe":{"enabled":true}}');
    const targets = [
      Object.create(null),
      null,
      0,
      {},
      JSON.parse('{"__proto__":{"sdcwAdmin":true}}'),
    ];
    for (const target of targets) {
      for (const result of [merge(target, payload), merge(payload, target || {})]) {
        assert.equal(Object.getPrototypeOf(result), Object.prototype);
        assert.equal(result.sdcwAdmin, undefined);
        assert.equal(Object.hasOwn(result, "__proto__"), false);
        assert.equal(result.safe.enabled, true);
      }
      const nested = merge({ session: target }, { session: payload });
      assert.equal(Object.getPrototypeOf(nested.session), Object.prototype);
      assert.equal(nested.session.sdcwAdmin, undefined);
    }
    assert.equal({}.sdcwAdmin, undefined);
  });

  test(`${name}: normal configuration and extension APIs remain compatible`, () => {
    const symbol = Symbol("config");
    const date = new Date(0);
    const original = {
      extensions: [".js"],
      nested: { browser: true },
      [symbol]: { enabled: true },
      date,
    };
    const result = merge(original, { extensions: [".ts"], nested: { preferBuiltins: false } });
    assert.deepEqual(result.extensions, [".js", ".ts"]);
    assert.deepEqual(result.nested, { browser: true, preferBuiltins: false });
    assert.deepEqual(result[symbol], { enabled: true });
    assert.notEqual(result[symbol], original[symbol]);
    assert.equal(result.date, date);
    assert.deepEqual(original.extensions, [".js"]);
    assert.equal(merge({}, original, { clone: false }).nested, original.nested);
    assert.deepEqual(merge([1], [2], { arrayMerge: (_target, source) => source }), [2]);
    assert.deepEqual(merge.all([{ a: 1 }, { b: 2 }]), { a: 1, b: 2 });
    assert.deepEqual(
      merge(
        { n: { a: 1 } },
        { n: { b: 2 } },
        { customMerge: (key) => (key === "n" ? () => ({ custom: true }) : undefined) }
      ),
      { n: { custom: true } }
    );
  });
}

test("both actual dev-server consumers resolve the patched deepmerge instance", () => {
  for (const consumer of ["@web/dev-server", "@rollup/plugin-node-resolve"]) {
    const consumerRequire = createRequire(require.resolve(consumer));
    assert.equal(consumerRequire.resolve("deepmerge"), require.resolve("deepmerge"));
  }
});
