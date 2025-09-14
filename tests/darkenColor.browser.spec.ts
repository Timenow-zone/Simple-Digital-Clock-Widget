// comments: English only
import { expect } from "@esm-bundle/chai";
import darkenColor from "../src/darkenColor";

it("HEX without alpha — darken 20%", () => {
  expect(darkenColor("#ffffff", -0.2)).to.equal("#cccccc");
  expect(darkenColor("#000000", -0.5)).to.equal("#000000");
});

it("HEX with alpha — preserve alpha", () => {
  expect(darkenColor("#112233cc", -0.5)).to.equal("#081119cc");
  expect(darkenColor("#112233cc", 0.5)).to.equal("#889099cc");
});

it("short HEX (#RGB/#RGBA)", () => {
  expect(darkenColor("#abc", -0.5)).to.equal("#555d66");
  expect(darkenColor("#abcd", -0.5)).to.equal("#555d66dd");
});

it("rgb()/rgba() — format preserved", () => {
  expect(darkenColor("rgb(255,255,255)", -0.2)).to.equal("rgb(204, 204, 204)");
  expect(darkenColor("rgba(100,150,200,0.5)", -0.5)).to.equal("rgba(50, 75, 100, 0.5)");
  expect(darkenColor("rgb(100,150,200)", 0.5)).to.equal("rgb(177, 202, 227)");
});

it("rgb percentage channels", () => {
  expect(darkenColor("rgb(100%, 100%, 100%)", -0.5)).to.equal("rgb(127, 127, 127)");
  expect(darkenColor("rgb(0%, 50%, 0%)", 0.5)).to.equal("rgb(127, 191, 127)");
});
