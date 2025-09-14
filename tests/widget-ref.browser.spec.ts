// comments: English only
import { expect } from "@esm-bundle/chai";
import "../src/SimpleDigitalClockWidget"; // WTR rewrites to .js

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

it("mounts and toggles date/zone via clicks", async () => {
  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "Europe/London");
  el.setAttribute("locale", "en");
  el.setAttribute("date", "");
  document.body.appendChild(el);

  await wait(100);
  const root = el.shadowRoot!;
  const blocks = root.querySelectorAll("div[title]");
  expect(blocks.length).to.be.greaterThan(1);

  const dateDiv = blocks[0] as HTMLDivElement;
  const zoneDiv = blocks[1] as HTMLDivElement;

  expect(getComputedStyle(dateDiv).display).to.equal("block");
  expect(getComputedStyle(zoneDiv).display).to.equal("none");

  dateDiv.click();
  await wait(0);
  expect(getComputedStyle(dateDiv).display).to.equal("none");
  expect(getComputedStyle(zoneDiv).display).to.equal("block");
});
