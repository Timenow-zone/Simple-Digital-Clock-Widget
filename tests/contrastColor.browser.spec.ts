// comments: English only
import { expect } from "@esm-bundle/chai";
import contrastColor from "../src/contrastColor";

it("HEX #000 / #fff", () => {
  expect(contrastColor("#000000")).to.equal("white");
  expect(contrastColor("#ffffff")).to.equal("black");
});

it("rgb ints", () => {
  expect(contrastColor("rgb(0, 0, 0)")).to.equal("white");
  expect(contrastColor("rgb(255, 255, 255)")).to.equal("black");
});

it("rgb percentages", () => {
  expect(contrastColor("rgb(100%, 100%, 100%)")).to.equal("black");
  expect(contrastColor("rgb(0%, 0%, 0%)")).to.equal("white");
});

it("invalid throws", () => {
  expect(() => contrastColor("banana")).to.throw();
});
