// tests/period-override.browser.spec.ts
import { assert } from "@esm-bundle/chai";
import "../src/SimpleDigitalClockWidget";

// EN helper: freeze time at 13:05 UTC for predictable output
function freezeTime(iso: string) {
  const fixed = new Date(iso);
  class FakeDate extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) super(fixed.getTime());
      else if (args.length === 1) super(args[0]);
      else super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    static now() {
      return fixed.getTime();
    }
  }
  window.Date = FakeDate as unknown as DateConstructor;
}

// EN small wait utility
const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms));

it("period=true forces 12h even if locale default is 24h (en-GB)", async () => {
  freezeTime("2020-01-02T13:05:00Z");

  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "UTC");
  el.setAttribute("locale", "en-GB"); // en-GB defaults to 24h
  el.setAttribute("period", ""); // explicit -> 12h expected
  document.body.appendChild(el);

  await wait(60);

  const a = el.shadowRoot!.querySelector("a")!;
  const text = a.textContent || "";
  // Example: "1:05 PM"
  assert.match(text, /\b(1|01):05\b/i, "should show 1:05 in 12h format for 13:05 UTC");
  assert.match(text.toUpperCase(), /\bAM|PM\b/);
});

it("period unset -> follow locale (en-GB stays 24h)", async () => {
  freezeTime("2020-01-02T13:05:00Z");

  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "UTC");
  el.setAttribute("locale", "en-GB"); // default 24h
  // no 'period' attribute -> follow locale
  document.body.appendChild(el);

  await wait(60);

  const a = el.shadowRoot!.querySelector("a")!;
  const text = a.textContent || "";
  // Example: "13:05"
  assert.match(text, /\b13:05\b/, "should show 13:05 in 24h format");
  assert.ok(!/\bAM|PM\b/i.test(text));
});

it("period=false forces 24h even if locale default is 12h (en-US)", async () => {
  freezeTime("2020-01-02T13:05:00Z");

  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "UTC");
  el.setAttribute("locale", "en-US"); // en-US defaults to 12h
  el.setAttribute("period", "false"); // explicit false -> 24h expected
  document.body.appendChild(el);

  await wait(60);

  const a = el.shadowRoot!.querySelector("a")!;
  const text = a.textContent || "";
  assert.match(text, /\b13:05\b/, "should show 13:05 in 24h format");
  assert.ok(!/\bAM|PM\b/i.test(text));
});
