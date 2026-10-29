import { assert } from "@esm-bundle/chai";

import "../src/SimpleDigitalClockWidget";

const wait = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

function setFixedDate(timestamp: number): () => void {
  const OriginalDate = window.Date;
  const now = () => timestamp;

  window.Date = new Proxy(OriginalDate, {
    construct(target, args, newTarget) {
      return Reflect.construct(target, args.length ? args : [timestamp], newTarget);
    },
    apply() {
      return new OriginalDate(timestamp).toString();
    },
    get(target, key, receiver) {
      return key === "now" ? now : Reflect.get(target, key, receiver);
    },
  });

  return () => {
    window.Date = OriginalDate;
  };
}

function createWidget() {
  const el = document.createElement("timenow-zone-sdcw");
  el.setAttribute("time-zone", "UTC");
  el.setAttribute("locale", "en-GB");
  return el;
}

it("hundredths shows seconds and exactly two fractional digits", async () => {
  const el = createWidget();
  el.setAttribute("hundredths", "");
  document.body.appendChild(el);

  await wait();

  const text = el.shadowRoot!.querySelector("a")!.textContent || "";
  assert.match(text, /\b\d{1,2}:\d{2}:\d{2}\.\d{2}\b/);

  el.remove();
});

it("legacy second mode does not show fractional seconds", async () => {
  const el = createWidget();
  el.setAttribute("second", "");
  document.body.appendChild(el);

  await wait();

  const text = el.shadowRoot!.querySelector("a")!.textContent || "";
  assert.match(text, /\b\d{1,2}:\d{2}:\d{2}\b/);
  assert.notMatch(text, /\.\d{2}\b/);

  el.remove();
});

it("hundredths=false preserves legacy formatting", async () => {
  const el = createWidget();
  el.setAttribute("second", "");
  el.setAttribute("hundredths", "false");
  document.body.appendChild(el);

  await wait();

  const text = el.shadowRoot!.querySelector("a")!.textContent || "";
  assert.match(text, /\b\d{1,2}:\d{2}:\d{2}\b/);
  assert.notMatch(text, /\.\d{2}\b/);

  el.remove();
});

it("toggles hundredths at runtime without changing the second option", async () => {
  const el = createWidget();
  el.setAttribute("second", "");
  document.body.appendChild(el);

  await wait();
  assert.notMatch(el.shadowRoot!.querySelector("a")!.textContent || "", /\.\d{2}\b/);

  el.setAttribute("hundredths", "");
  await wait();
  assert.match(el.shadowRoot!.querySelector("a")!.textContent || "", /\.\d{2}\b/);

  el.removeAttribute("hundredths");
  await wait();
  assert.notMatch(el.shadowRoot!.querySelector("a")!.textContent || "", /\.\d{2}\b/);

  el.remove();
});

it("cancels the animation frame when disconnected", async () => {
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  let cancelCount = 0;

  window.cancelAnimationFrame = ((handle: number) => {
    cancelCount += 1;
    originalCancelAnimationFrame.call(window, handle);
  }) as typeof window.cancelAnimationFrame;

  try {
    const el = createWidget();
    el.setAttribute("hundredths", "");
    document.body.appendChild(el);

    await wait();
    el.remove();
    await wait(0);

    assert.isAbove(cancelCount, 0);
  } finally {
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

it("hundredths respects period=true", async () => {
  const el = createWidget();
  el.setAttribute("period", "");
  el.setAttribute("hundredths", "");
  document.body.appendChild(el);

  await wait();

  const text = el.shadowRoot!.querySelector("a")!.textContent || "";
  assert.match(text, /\.\d{2}\b/);
  assert.match(text.toUpperCase(), /\bAM|PM\b/);

  el.remove();
});

it("hundredths respects period=false", async () => {
  const el = createWidget();
  el.setAttribute("locale", "en-US");
  el.setAttribute("period", "false");
  el.setAttribute("hundredths", "");
  document.body.appendChild(el);

  await wait();

  const text = el.shadowRoot!.querySelector("a")!.textContent || "";
  assert.match(text, /\.\d{2}\b/);
  assert.notMatch(text.toUpperCase(), /\bAM|PM\b/);

  el.remove();
});

it("legacy mode keeps metadata formatting errors visible", async () => {
  const originalConsoleError = console.error;
  const el = createWidget();

  console.error = () => {};

  try {
    el.setAttribute("time-zone-name", "invalid-time-zone-name");
    document.body.appendChild(el);

    await wait(120);

    const text = el.shadowRoot!.textContent || "";
    assert.include(text, "Error, please check attributes of tag.");
  } finally {
    el.remove();
    console.error = originalConsoleError;
  }
});

it("hundredths keeps metadata formatting errors visible", async () => {
  const originalConsoleError = console.error;
  const el = createWidget();

  console.error = () => {};

  try {
    el.setAttribute("hundredths", "");
    el.setAttribute("time-zone-name", "invalid-time-zone-name");
    document.body.appendChild(el);

    await wait(120);

    const text = el.shadowRoot!.textContent || "";
    assert.include(text, "Error, please check attributes of tag.");
  } finally {
    el.remove();
    console.error = originalConsoleError;
  }
});

it("hundredths fits responsive widths without wrapping", async () => {
  const widths = [80, 120, 200, 300];
  const locales = ["en-US", "de-DE", "uk-UA", "bg", "ko"];
  const periodModes = [
    { label: "12h", value: "" },
    { label: "24h", value: "false" },
  ];
  const widgets: HTMLElement[] = [];
  const restoreDate = setFixedDate(Date.UTC(2026, 9, 29, 12, 41, 14, 690));

  try {
    for (const width of widths) {
      for (const locale of locales) {
        for (const period of periodModes) {
          const el = createWidget();
          el.setAttribute("width", String(width));
          el.setAttribute("locale", locale);
          el.setAttribute("period", period.value);
          el.setAttribute("hundredths", "");
          document.body.appendChild(el);
          widgets.push(el);
        }
      }
    }

    await wait(120);

    for (const el of widgets) {
      const root = el.shadowRoot!;
      const container = root.querySelector("div[data-version]") as HTMLDivElement;
      const time = root.querySelector("a") as HTMLAnchorElement;
      const rects = Array.from(time.getClientRects());
      const width = el.getAttribute("width");
      const locale = el.getAttribute("locale");
      const period = el.getAttribute("period") === "false" ? "24h" : "12h";
      const text = time.textContent || "";
      const style = getComputedStyle(time);
      const layout = {
        font: style.font,
        fontSize: style.fontSize,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        containerWidth: container.getBoundingClientRect().width,
        rects: rects.map(({ x, y, width, height }) => ({ x, y, width, height })),
        fonts: document.fonts.status,
      };
      const context = `${width}px ${locale} ${period}: "${text}"; layout=${JSON.stringify(layout)}`;

      assert.lengthOf(rects, 1, `time must stay on one line at ${context}`);
      assert.isAtMost(
        rects[0].width,
        container.getBoundingClientRect().width + 0.5,
        `time must fit the widget width at ${context}`
      );
    }
  } finally {
    for (const el of widgets) el.remove();
    restoreDate();
  }
});

it("hundredths refits locale labels after runtime changes", async () => {
  const restoreDate = setFixedDate(Date.UTC(2026, 9, 29, 12, 41, 14, 690));
  const el = createWidget();
  el.setAttribute("width", "80");
  el.setAttribute("locale", "bg");
  el.setAttribute("period", "false");
  el.setAttribute("hundredths", "");

  try {
    document.body.appendChild(el);
    await wait(120);

    const root = el.shadowRoot!;
    const container = root.querySelector("div[data-version]") as HTMLDivElement;
    const time = root.querySelector("a") as HTMLAnchorElement;
    const shortFontSize = Number.parseFloat(getComputedStyle(time).fontSize);
    const assertFits = () => {
      const rects = Array.from(time.getClientRects());
      assert.lengthOf(rects, 1, "updated time must stay on one line");
      assert.isAtMost(rects[0].width, container.getBoundingClientRect().width + 0.5);
    };

    time.style.setProperty("white-space", "normal", "important");
    el.setAttribute("period", "");
    await wait(120);
    assertFits();
    assert.equal(time.style.getPropertyValue("white-space"), "normal");
    assert.equal(time.style.getPropertyPriority("white-space"), "important");

    el.setAttribute("period", "false");
    await wait(120);
    assertFits();
    assert.approximately(Number.parseFloat(getComputedStyle(time).fontSize), shortFontSize, 0.01);

    el.setAttribute("locale", "ko");
    el.setAttribute("period", "");
    await wait(120);
    assertFits();
    const narrowFontSize = Number.parseFloat(getComputedStyle(time).fontSize);

    el.setAttribute("width", "120");
    await wait(120);
    assertFits();
    assert.isAbove(Number.parseFloat(getComputedStyle(time).fontSize), narrowFontSize);
  } finally {
    el.remove();
    restoreDate();
  }
});

it("hundredths fitting stays consistent when an ancestor is scaled", async () => {
  const restoreDate = setFixedDate(Date.UTC(2026, 9, 29, 12, 41, 14, 690));
  const el = createWidget();
  el.style.display = "inline-block";
  el.setAttribute("width", "80");
  el.setAttribute("locale", "bg");
  el.setAttribute("period", "");
  el.setAttribute("hundredths", "");

  try {
    document.body.appendChild(el);
    await wait(120);

    const root = el.shadowRoot!;
    const container = root.querySelector("div[data-version]") as HTMLDivElement;
    const time = root.querySelector("a") as HTMLAnchorElement;
    const narrowFontSize = Number.parseFloat(getComputedStyle(time).fontSize);
    el.setAttribute("width", "120");
    await wait(120);
    const wideFontSize = Number.parseFloat(getComputedStyle(time).fontSize);

    for (const scale of [0.5, 2]) {
      el.style.transform = `scale(${scale})`;

      for (const [width, expectedFontSize] of [[80, narrowFontSize], [120, wideFontSize]]) {
        el.setAttribute("width", String(width));
        await wait(120);

        const rects = Array.from(time.getClientRects());
        assert.lengthOf(rects, 1, `scaled time must stay on one line at scale ${scale}`);
        assert.isAtMost(rects[0].width, container.getBoundingClientRect().width + 0.5);
        assert.approximately(Number.parseFloat(getComputedStyle(time).fontSize), expectedFontSize, 0.01);
      }
    }
  } finally {
    el.remove();
    restoreDate();
  }
});

it("hundredths refreshes its cached formatter when period changes", async () => {
  const el = createWidget();
  el.setAttribute("locale", "en-US");
  el.setAttribute("period", "false");
  el.setAttribute("hundredths", "");
  document.body.appendChild(el);

  try {
    await wait();
    assert.notMatch(el.shadowRoot!.querySelector("a")!.textContent || "", /\bAM|PM\b/i);

    el.setAttribute("period", "");
    await wait();

    const text = el.shadowRoot!.querySelector("a")!.textContent || "";
    assert.match(text, /\.\d{2}\b/);
    assert.match(text.toUpperCase(), /\bAM|PM\b/);
  } finally {
    el.remove();
  }
});

it("hundredths recovers its cached formatter after an invalid time zone is replaced", async () => {
  const el = createWidget();
  const originalConsoleError = console.error;

  console.error = () => {};

  el.setAttribute("locale", "en-US");
  el.setAttribute("time-zone", "Invalid/TimeZone");
  el.setAttribute("hundredths", "");
  document.body.appendChild(el);

  try {
    await wait();

    assert.include(
      el.shadowRoot?.textContent || "",
      "Error, please check attributes of tag.",
    );

    el.setAttribute("time-zone", "UTC");

    let recovered = false;

    for (let i = 0; i < 30; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const shadowText = el.shadowRoot?.textContent || "";
      const timeText = el.shadowRoot?.querySelector("a")?.textContent || "";

      if (
        !shadowText.includes("Error, please check attributes of tag.") &&
        /\.\d{2}\b/.test(timeText)
      ) {
        recovered = true;
        break;
      }
    }

    assert.isTrue(
      recovered,
      "widget should recover after replacing the invalid time zone",
    );
  } finally {
    console.error = originalConsoleError;
    el.remove();
  }
});
