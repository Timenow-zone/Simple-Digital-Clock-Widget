import { assert } from "@esm-bundle/chai";
import "../src/SimpleDigitalClockWidget";

async function waitFor(predicate: () => boolean): Promise<void> {
  const deadline = performance.now() + 2000;
  while (!predicate()) {
    if (performance.now() >= deadline) throw new Error("Clock did not follow its container width");
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

function fixture(width = 900) {
  const parent = document.createElement("div");
  parent.style.width = `${width}px`;
  const clock = document.createElement("timenow-zone-sdcw");
  clock.setAttribute("width", "0");
  clock.setAttribute("time-zone", "UTC");
  clock.setAttribute("locale", "en-GB");
  clock.setAttribute("second", "true");
  parent.appendChild(clock);
  return { parent, clock };
}

function fitted(clock: HTMLElement): boolean {
  const container = clock.shadowRoot?.querySelector("div[data-version]") as HTMLDivElement | null;
  const time = clock.shadowRoot?.querySelector("a");
  return !!container && !!time?.textContent && container.offsetWidth > 0 &&
    Math.abs(Number.parseFloat(getComputedStyle(time).fontSize) - container.offsetWidth / 7) < 0.01;
}

it("preserves clock and label sizes with explicit, automatic and minimum widths", async () => {
  const { parent, clock } = fixture(500);
  clock.setAttribute("caption", "Clock <caption> & date");
  clock.setAttribute("date", "true");
  clock.setAttribute("width", "210");
  document.body.appendChild(parent);
  try {
    for (const [attribute, expectedWidth] of [["210", 210], ["330", 330], ["20", 80], ["0", 500]] as const) {
      clock.setAttribute("width", attribute);
      await waitFor(() => fitted(clock) && (clock.shadowRoot!.querySelector("div[data-version]") as HTMLElement).offsetWidth === expectedWidth);
      const labels = clock.shadowRoot!.querySelectorAll("div[data-version] > div > div");
      assert.equal(labels.length, 3, "caption, date and timezone labels remain rendered");
      for (const label of labels) {
        assert.approximately(Number.parseFloat(getComputedStyle(label).fontSize), expectedWidth / 15, 0.01);
      }
      assert.equal(labels[0].textContent, "Clock <caption> & date");
    }
    clock.removeAttribute("width");
    parent.style.width = "40px";
    await waitFor(() => fitted(clock) && (clock.shadowRoot!.querySelector("div[data-version]") as HTMLElement).offsetWidth === 80);
  } finally {
    parent.remove();
  }
}).timeout(12000);

it("auto width follows parent layout changes without a window resize", async () => {
  const { parent, clock } = fixture();
  document.body.appendChild(parent);
  try {
    await waitFor(() => fitted(clock));
    for (const width of [240, 645, 120, 480]) {
      parent.style.width = `${width}px`;
      await waitFor(() => fitted(clock));
      assert.equal((clock.shadowRoot!.querySelector("div[data-version]") as HTMLElement).offsetWidth, width);
    }
  } finally {
    parent.remove();
  }
}).timeout(10000);

it("an initially hidden clock fits when its container becomes visible", async () => {
  const { parent, clock } = fixture(240);
  parent.style.display = "none";
  document.body.appendChild(parent);
  try {
    await waitFor(() => !!clock.shadowRoot?.querySelector("a")?.textContent);
    parent.style.display = "block";
    await waitFor(() => fitted(clock));
    assert.approximately(Number.parseFloat(getComputedStyle(clock.shadowRoot!.querySelector("a")!).fontSize), 240 / 7, 0.01);
  } finally {
    parent.remove();
  }
});

it("removes resize subscriptions when a clock is disconnected and reconnected", async () => {
  const originalAdd = window.addEventListener;
  const originalRemove = window.removeEventListener;
  const OriginalObserver = window.ResizeObserver;
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const observers = new Set<ResizeObserver>();
  window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    if (type === "resize") listeners.add(listener);
    originalAdd.call(window, type, listener, options);
  }) as typeof window.addEventListener;
  window.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
    if (type === "resize") listeners.delete(listener);
    originalRemove.call(window, type, listener, options);
  }) as typeof window.removeEventListener;
  window.ResizeObserver = class extends OriginalObserver {
    observe(target: Element, options?: ResizeObserverOptions): void {
      observers.add(this);
      super.observe(target, options);
    }
    disconnect(): void {
      observers.delete(this);
      super.disconnect();
    }
  };
  const { parent, clock } = fixture(240);
  try {
    for (let cycle = 0; cycle < 2; cycle++) {
      document.body.appendChild(parent);
      await waitFor(() => fitted(clock));
      assert.equal(observers.size, 1, "the connected clock observes its container");
      parent.remove();
      await waitFor(() => listeners.size === 0 && observers.size === 0);
    }
  } finally {
    parent.remove();
    for (const observer of observers) observer.disconnect();
    for (const listener of listeners) originalRemove.call(window, "resize", listener);
    window.addEventListener = originalAdd;
    window.removeEventListener = originalRemove;
    window.ResizeObserver = OriginalObserver;
  }
});
