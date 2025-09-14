// comments in English
import * as test from "node:test";
import * as assert from "node:assert/strict";
import darkenColor from "../src/darkenColor";

test.test("HEX without alpha — darken 20%", () => {
  assert.equal(darkenColor("#ffffff", -0.2), "#cccccc");
  assert.equal(darkenColor("#000000", -0.5), "#000000");
});

test.test("HEX with alpha — preserve alpha", () => {
  assert.equal(darkenColor("#112233cc", -0.5), "#081119cc");
  assert.equal(darkenColor("#112233cc", 0.5), "#889099cc");
});

test.test("short HEX (#RGB/#RGBA)", () => {
  assert.equal(darkenColor("#abc", -0.5), "#555d66");
  assert.equal(darkenColor("#abcd", -0.5), "#555d66dd");
});

test.test("rgb()/rgba() — format preserved", () => {
  assert.equal(darkenColor("rgb(255,255,255)", -0.2), "rgb(204, 204, 204)");
  assert.equal(darkenColor("rgba(100,150,200,0.5)", -0.5), "rgba(50, 75, 100, 0.5)");
  assert.equal(darkenColor("rgb(100,150,200)", 0.5), "rgb(177, 202, 227)");
});

test.test("rgb percentage channels", () => {
  assert.equal(darkenColor("rgb(100%, 100%, 100%)", -0.5), "rgb(127, 127, 127)");
  assert.equal(darkenColor("rgb(0%, 50%, 0%)", 0.5), "rgb(127, 191, 127)");
});

test.test("percent 0 returns original; clamp to [-1,1]", () => {
  assert.equal(darkenColor("#123456", 0), "#123456");
  assert.equal(darkenColor("#123456", 5), "#ffffff"); // clamp to +1
  assert.equal(darkenColor("#123456", -5), "#000000"); // clamp to -1
});

// rgba(): alpha preserved, floor rounding
test.test("rgba alpha preserved", () => {
  // (10,20,30) lighten 50% with floor: 10+(245*0.5)=132.5→132; 20+(235*0.5)=137.5→137; 30+(225*0.5)=142.5→142
  assert.equal(darkenColor("rgba(10,20,30,0.25)", 0.5), "rgba(132, 137, 142, 0.25)");
  assert.equal(darkenColor("rgba(10,20,30,1)", -1), "rgba(0, 0, 0, 1)");
});

// percentage channels in rgb(): floor
test.test("rgb percentage channels", () => {
  // 10%≈25.5→25; 20%≈51→51; 30%≈76.5→76; затем 50% темнее: 25→12.75→12; 51→25.5→25; 76→38
  assert.equal(darkenColor("rgb(10%,20%,30%)", -0.5), "rgb(12, 25, 38)");
  // осветление 50% (floor): 25+(230*0.5)=140→140; 51+(204*0.5)=153→153; 76+(179*0.5)=165.5→165
  assert.equal(darkenColor("rgb(10%,20%,30%)", 0.5), "rgb(140, 153, 165)");
});

// invalid inputs — only invalid *format* should throw
test.test("invalid inputs throw (format only)", () => {
  for (const bad of ["rgb()", "rgba(1,2)", "banana", "#12", "#12345"]) {
    assert.throws(() => darkenColor(bad as any, 0.2));
  }
  // numeric out-of-range does NOT throw in current impl
  assert.doesNotThrow(() => darkenColor("rgb(1,2,300)", 0.1));
});
