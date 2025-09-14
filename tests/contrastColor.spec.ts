// comments in English
import * as test from "node:test";
import * as assert from "node:assert/strict";
import contrastColor from "../src/contrastColor";

test.test("HEX #000 / #fff", () => {
  assert.equal(contrastColor("#000000"), "white");
  assert.equal(contrastColor("#ffffff"), "black");
});

test.test("rgb ints", () => {
  assert.equal(contrastColor("rgb(0, 0, 0)"), "white");
  assert.equal(contrastColor("rgb(255, 255, 255)"), "black");
});

test.test("rgb percentages", () => {
  assert.equal(contrastColor("rgb(100%, 100%, 100%)"), "black");
  assert.equal(contrastColor("rgb(0%, 0%, 0%)"), "white");
});

test.test("invalid throws", () => {
  assert.throws(() => contrastColor("banana"));
});

// 1) Uppercase & extra spaces (covers alt parsing paths)
test.test("RGB uppercase + extra spaces", () => {
  assert.equal(contrastColor("RGB( 255 , 0 , 0 )"), "black");
  assert.equal(contrastColor("RGBA( 0 , 0 , 0 , 0.3 )"), "white"); // alpha ignored
});

// 2) Short HEX with alpha (#RGBA): alpha ignored for luminance
test.test("short HEX with alpha (#RGBA)", () => {
  assert.equal(contrastColor("#f0f8"), "black"); // #ff00ff, luminance ~ 0.284 -> white text
  assert.equal(contrastColor("#0008"), "white");
});

// 3) Boundary around 0.5 luminance (127 vs 128)
test.test("boundary luminance 0.5", () => {
  assert.equal(contrastColor("rgb(128,128,128)"), "black"); // ~0.502
});

// 4) Invalid formats
test.test("invalid formats", () => {
  assert.throws(() => contrastColor("hsl(0,100%,50%)"));
  assert.throws(() => contrastColor("#12")); // too short
  assert.throws(() => contrastColor("#12345")); // invalid length
});
