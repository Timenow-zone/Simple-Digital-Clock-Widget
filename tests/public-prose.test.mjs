import assert from "node:assert/strict";
import { test } from "node:test";
import { cyrillicProseLines, pullRequestProseFindings } from "../scripts/check-public-prose.mjs";

const localized = "\u041a\u0438\u0457\u0432";

test("English prose passes and Cyrillic prose reports its line", () => {
  assert.deepEqual(cyrillicProseLines("# Verification\nAll checks passed."), []);
  assert.deepEqual(cyrillicProseLines(`# Verification\n${localized}`), [2]);
});

test("inline localized fixtures remain exact data", () => {
  assert.deepEqual(cyrillicProseLines(`The caption fixture is \`${localized}\`.`), []);
});

test("fenced captures are preserved while following prose is checked", () => {
  assert.deepEqual(cyrillicProseLines(`\`\`\`text\n${localized}\n\`\`\`\n${localized}`), [4]);
  assert.deepEqual(cyrillicProseLines(`~~~text\n${localized}\n~~~\nEnglish.`), []);
});

test("technical anchors and link destinations do not hide link-label prose", () => {
  assert.deepEqual(cyrillicProseLines(`<a id="${localized}"></a>\n[Matrix](report.md#${localized})`), []);
  assert.deepEqual(cyrillicProseLines(`[${localized}](report.md#matrix)`), [1]);
});

test("HTML comments and visible HTML prose are checked", () => {
  assert.deepEqual(cyrillicProseLines(`<!-- ${localized} -->`), [1]);
  assert.deepEqual(cyrillicProseLines(`<p>${localized}</p>`), [1]);
});

test("HTML image descriptions are prose while technical attributes remain data", () => {
  assert.deepEqual(cyrillicProseLines(`<img alt="${localized}" src="example.png">`), [1]);
  assert.deepEqual(cyrillicProseLines(`<a title='${localized}' href="#fixture">Link</a>`), [1]);
  assert.deepEqual(cyrillicProseLines(`<img alt="Example" src="${localized}.png">`), []);
});

test("PR titles and description prose must be English", () => {
  assert.deepEqual(pullRequestProseFindings({ pull_request: { title: localized, body: "English." } }),
    [{ source: "pull request title", line: 1 }]);
  assert.deepEqual(pullRequestProseFindings({ pull_request: { title: "Translate reports", body: localized } }),
    [{ source: "pull request description", line: 1 }]);
});

test("PR descriptions may show localized code fixtures", () => {
  assert.deepEqual(pullRequestProseFindings({ pull_request: {
    title: "Preserve locale fixtures", body: `Example: \`${localized}\`.`,
  } }), []);
  assert.deepEqual(pullRequestProseFindings({}), []);
});

test("PR titles remain entirely English even when a localized value is quoted", () => {
  assert.deepEqual(pullRequestProseFindings({ pull_request: {
    title: `Fix \`${localized}\` locale selection`, body: "Use the description for exact inputs.",
  } }), [{ source: "pull request title", line: 1 }]);
});

test("malformed PR metadata fails explicitly", () => {
  assert.throws(() => pullRequestProseFindings({ pull_request: { title: 1, body: null } }), /Invalid pull request/);
  assert.throws(() => pullRequestProseFindings({ pull_request: { title: "Valid", body: [] } }), /Invalid pull request/);
});
