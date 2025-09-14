// comments: English only (per your rule)
import { expect } from "@esm-bundle/chai";

// Import the custom element definition
import "../src/SimpleDigitalClockWidget.tsx";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

it("mounts and exposes container via shadowRoot (ref works)", async () => {
  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "Europe/London");
  el.setAttribute("locale", "en");
  el.setAttribute("second", "");
  el.setAttribute("background-color", "#00416a");

  document.body.appendChild(el);
  await wait(100); // allow mount

  const container = el.shadowRoot?.querySelector("[data-version]");
  expect(container).to.exist;
  expect(container).to.be.instanceOf(HTMLDivElement);
});

it("toggles date <-> zone name on clicks (dateContainerRef/zoneContainerRef)", async () => {
  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "Europe/London");
  el.setAttribute("locale", "en");
  el.setAttribute("date", "");
  document.body.appendChild(el);
  await wait(100);

  const blocks = el.shadowRoot!.querySelectorAll("div[title]");
  expect(blocks.length).to.be.greaterThan(1);

  const dateDiv = blocks[0] as HTMLDivElement;
  const zoneDiv = blocks[1] as HTMLDivElement;

  expect(getComputedStyle(dateDiv).display).to.equal("block");
  expect(getComputedStyle(zoneDiv).display).to.equal("none");

  dateDiv.click();
  await wait(0);
  expect(getComputedStyle(dateDiv).display).to.equal("none");
  expect(getComputedStyle(zoneDiv).display).to.equal("block");

  zoneDiv.click();
  await wait(0);
  expect(getComputedStyle(dateDiv).display).to.equal("block");
  expect(getComputedStyle(zoneDiv).display).to.equal("none");
});

it("applies background-color when attribute is set (over background)", async () => {
  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "Europe/London");
  el.setAttribute("locale", "en");
  el.setAttribute("date", "");
  el.setAttribute("background-color", "rgb(255, 0, 0)");
  // ensure no 'background' present to override
  el.removeAttribute("background");
  document.body.appendChild(el);
  await wait(100);

  const container = el.shadowRoot!.querySelector("[data-version]") as HTMLDivElement;
  // Check computed background inside shadow DOM
  const bg = getComputedStyle(container).backgroundColor;
  expect(bg).to.equal("rgb(255, 0, 0)");
});
