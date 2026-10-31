import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { Linter } from "eslint";
import react from "eslint-plugin-react";
import { glob, globSync } from "glob";
import { minimatch, Minimatch } from "minimatch";

const linter = new Linter();

function lint(rule, options, code) {
  const messages = linter.verify(code, [{
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    settings: { react: { version: "16.0", pragma: "h" } },
    rules: { [`react/${rule}`]: ["error", options] },
  }]);
  assert.equal(messages.some((message) => message.fatal), false, JSON.stringify(messages));
  return messages.filter((message) => message.ruleId === `react/${rule}`);
}

test("forbidden component props retain wildcard matching and allowed controls", () => {
  const options = { forbid: [{ propNamePattern: "secret*", disallowedForPatterns: ["Widget*"] }] };
  assert.equal(lint("forbid-component-props", options, 'const x = <WidgetBox secretKey="x" />;').length, 1);
  assert.equal(lint("forbid-component-props", options, 'const x = <WidgetBox safeKey="x" />;').length, 0);
  assert.equal(lint("forbid-component-props", options, 'const x = <OtherBox secretKey="x" />;').length, 0);
});

test("dangerous HTML remains rejected on matched custom components", () => {
  const options = { customComponentNames: ["Widget*"] };
  assert.equal(lint("no-danger", options, 'const x = <WidgetBox dangerouslySetInnerHTML={{__html: "x"}} />;').length, 1);
  assert.equal(lint("no-danger", options, 'const x = <WidgetBox title="x" />;').length, 0);
});

test("handler-name matching retains explicit ignored-component patterns", () => {
  const options = { ignoreComponentNames: ["Ignored*"], checkLocalVariables: true };
  const source = 'function wrongName() {} const x = <WidgetBox onClick={wrongName} />;';
  assert.equal(lint("jsx-handler-names", options, source).length, 1);
  assert.equal(lint("jsx-handler-names", options, source.replace("WidgetBox", "IgnoredBox")).length, 0);
});

test("unstable nested components retain render-prop matching", () => {
  const options = { propNamePattern: "render*" };
  const source = 'function Parent() { return <WidgetBox itemRenderer={() => <div />} />; }';
  assert.equal(lint("no-unstable-nested-components", options, source).length, 1);
  assert.equal(lint("no-unstable-nested-components", options, source.replace("itemRenderer", "renderItem")).length, 0);
});

test("PascalCase rules retain matched ignore patterns", () => {
  const options = { ignore: ["Allowed*"] };
  assert.equal(lint("jsx-pascal-case", options, 'const x = <BAD_component />;').length, 1);
  assert.equal(lint("jsx-pascal-case", options, 'const x = <Allowed_component />;').length, 0);
});

test("configuration selectors preserve braces, dotfiles, matchBase and negation", () => {
  const cases = [
    ["src/clock.tsx", "src/**/*.{ts,tsx}", {}, true],
    ["src/nested/clock.ts", "src/**/*.{ts,tsx}", {}, true],
    ["src/clock.js", "src/**/*.{ts,tsx}", {}, false],
    [".hidden.ts", "*.ts", { dot: true }, true],
    [".hidden.ts", "*.ts", {}, false],
    ["src/test.ts", "*.ts", { matchBase: true }, true],
    ["src/test.ts", "*.ts", {}, false],
    ["clock.ts", "!*.js", {}, true],
    ["clock.js", "!*.js", {}, false],
    ["Clock.TS", "*.ts", { nocase: true }, true],
  ];
  for (const [file, pattern, options, expected] of cases) {
    assert.equal(minimatch(file, pattern, options), expected, `${file}: ${pattern}`);
    assert.equal(new Minimatch(pattern, options).match(file), expected, `${file}: class ${pattern}`);
  }
});

test("coverage glob API retains asynchronous and synchronous file selection", async () => {
  const pattern = "src/**/*.{ts,tsx}";
  const sync = globSync(pattern).sort();
  assert(sync.includes("src/SimpleDigitalClockWidget.tsx"));
  assert(sync.every((file) => /\.(ts|tsx)$/.test(file)));
  assert.deepEqual((await glob(pattern)).sort(), sync);
  assert.deepEqual(glob.sync(pattern).sort(), sync);

  const require = createRequire(import.meta.url);
  const coverageRequire = createRequire(require.resolve("c8"));
  const TestExclude = coverageRequire("test-exclude");
  const exclude = new TestExclude({ include: ["src/**"], exclude: ["tests/**"], extension: [".ts", ".tsx"] });
  assert.equal(exclude.shouldInstrument(path.resolve("src/SimpleDigitalClockWidget.tsx")), true);
  assert.equal(exclude.shouldInstrument(path.resolve("tests/example.ts")), false);
  assert.equal(exclude.shouldInstrument(path.resolve("src/example.txt")), false);
});
