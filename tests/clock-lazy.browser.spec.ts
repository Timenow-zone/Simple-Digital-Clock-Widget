import { assert } from "@esm-bundle/chai";
import { Component, h, type ComponentChildren } from "preact";
import register from "preact-custom-element";
import { registerClockElement } from "../src/clock-element";
import { createClockRuntime } from "../src/clock-element-runtime";
import type { ClockElementConstructor } from "../src/clock-element";

type ClockWindow = Window & { bridge: ClockElementConstructor; requests: number };
const shellUrl = new URL("../src/clock-element.js", import.meta.url).href;
const runtimeUrl = new URL("../src/SimpleDigitalClockWidget.js", import.meta.url).href;
const tag = "timenow-zone-sdcw";

async function waitFor(predicate: () => boolean) {
  const deadline = performance.now() + 4000;
  while (!predicate()) {
    if (performance.now() >= deadline) throw new Error("Lazy clock did not reach the expected state");
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

async function fixture() {
  const frame = document.createElement("iframe");
  frame.srcdoc = "<!doctype html><html><body></body></html>";
  const loaded = new Promise<void>((resolve) => { frame.onload = () => resolve(); });
  document.body.append(frame);
  await loaded;
  const doc = frame.contentDocument!;
  const win = frame.contentWindow as ClockWindow;
  async function module(source: string) {
    const script = doc.createElement("script");
    script.type = "module";
    script.textContent = source + ';window.dispatchEvent(new Event("clock-test-module-ready"));';
    const complete = new Promise<void>((resolve, reject) => {
      win.addEventListener("clock-test-module-ready", () => resolve(), { once: true });
      script.onerror = () => reject(new Error("Clock fixture module failed"));
    });
    doc.body.append(script);
    await complete;
  }
  return {
    frame, doc, win, module,
    shell: () => module(`import { registerClockElement } from ${JSON.stringify(shellUrl)};
      window.requests = 0;
      window.bridge = registerClockElement(() => { window.requests++; });`),
    runtime: () => module(`import ${JSON.stringify(runtimeUrl)};`),
  };
}

function clock(doc: Document) {
  const element = doc.createElement(tag);
  element.setAttribute("time-zone", "UTC");
  element.setAttribute("locale", "en-GB");
  element.setAttribute("second", "true");
  return element;
}

function rendered(element: HTMLElement) {
  return /\d{2}:\d{2}/.test(element.shadowRoot?.querySelector("a")?.textContent ?? "");
}

it("defines the lightweight host without loading a runtime until a connected clock exists", async () => {
  const f = await fixture();
  try {
    await f.shell();
    assert.isFalse(f.win.bridge.runtimeReady);
    assert.equal(f.win.requests, 0);
    const template = f.doc.createElement("template");
    template.innerHTML = `<${tag}></${tag}>`;
    f.doc.body.append(template);
    const detached = clock(f.doc);
    f.doc.body.append(detached);
    detached.remove();
    await Promise.resolve();
    assert.equal(f.win.requests, 0, "inert and synchronously removed clocks do not request a runtime");

    // This is the original integration contract: there is no candidate-side enqueue.
    const first = await f.win.customElements.whenDefined(tag).then(() => {
      const element = clock(f.doc);
      element.setAttribute("caption", "Created after whenDefined");
      f.doc.body.append(element);
      return element;
    });
    await waitFor(() => f.win.requests === 1);
    assert.isFalse(f.win.bridge.runtimeReady, "definition is distinct from renderer readiness");
    await f.runtime();
    await f.win.bridge.whenRuntimeReady;
    await waitFor(() => rendered(first));
    assert.isTrue(f.win.bridge.runtimeReady);
    assert.include(first.shadowRoot!.textContent!, "Created after whenDefined");
    assert.equal(f.win.requests, 1);
  } finally { f.frame.remove(); }
}).timeout(10000);

for (const mode of ["open", "closed"] as const) {
  it(`loads for the first clock inside an existing ${mode} shadow root`, async () => {
    const f = await fixture();
    try {
      const host = f.doc.createElement("div");
      const root = host.attachShadow({ mode });
      const first = clock(f.doc);
      root.append(first);
      f.doc.body.append(host);
      await f.shell();
      await waitFor(() => f.win.requests === 1);
      assert.equal(f.doc.querySelector(tag), null, "the signal is inaccessible to a document selector");
      await f.runtime();
      await waitFor(() => rendered(first));
      assert.equal(first.getRootNode(), root, "the host remains in its original root");
      assert.equal(f.win.requests, 1);
    } finally { f.frame.remove(); }
  }).timeout(10000);
}

it("preserves pending properties, attribute updates, host identity and reconnects", async () => {
  const f = await fixture();
  try {
    await f.shell();
    const first = clock(f.doc);
    const properties = first as unknown as Record<string, unknown>;
    properties.caption = "Pending property 🕒";
    first.setAttribute("width", "240");
    f.doc.body.append(first);
    await f.runtime();
    await waitFor(() => rendered(first));
    const shadow = first.shadowRoot;
    assert.include(shadow!.textContent!, "Pending property 🕒");
    first.setAttribute("width", "320");
    await waitFor(() => (shadow!.querySelector(".widget") as HTMLElement).style.width === "320px");
    first.removeAttribute("width");
    await waitFor(() => !(shadow!.querySelector(".widget") as HTMLElement).style.width);
    first.remove();
    assert.equal(shadow!.querySelector("a"), null, "disconnect unmounts the renderer");
    f.doc.body.append(first);
    await waitFor(() => rendered(first));
    assert.equal(first.shadowRoot, shadow);
    assert.include(shadow!.textContent!, "Pending property 🕒");
    assert.equal(f.win.requests, 1);
  } finally { f.frame.remove(); }
}).timeout(10000);

it("does not report runtime readiness when adapter installation fails", async () => {
  const f = await fixture();
  try {
    await f.shell();
    f.doc.body.append(clock(f.doc));
    assert.throws(() => f.win.bridge.installRuntime({
      connect() { throw new Error("negative-control mount failure"); },
      disconnect() {},
      attributeChanged() {},
    }), "negative-control mount failure");
    assert.isFalse(f.win.bridge.runtimeReady);
    let resolved = false;
    void f.win.bridge.whenRuntimeReady.then(() => { resolved = true; });
    await Promise.resolve();
    assert.isFalse(resolved);
  } finally { f.frame.remove(); }
}).timeout(10000);

it("matches the previous adapter for context, slots, hydration and property reflection", async () => {
  interface ProbeProps { caption?: unknown; badge?: ComponentChildren; children?: ComponentChildren }
  class Probe extends Component<ProbeProps> {
    static observedAttributes = ["caption"];
    render(props: ProbeProps, _state: unknown, context: Record<string, unknown>) {
      return h("div", {
        "data-caption": typeof props.caption === "object" ? JSON.stringify(props.caption) : String(props.caption ?? ""),
        "data-token": String(context.token ?? "missing"),
      }, props.badge, props.children);
    }
  }
  register(Probe, "legacy-clock-adapter-test", undefined, { shadow: true });
  const bridge = registerClockElement();
  const parent = document.createElement("div");
  parent.addEventListener("_preact", (event) => {
    (event as CustomEvent<{ context: Record<string, unknown> }>).detail.context = { token: "inherited-context" };
  });
  document.body.append(parent);
  try {
    const pairs = [false, true].map((hydrate) => {
      const pair = ["legacy-clock-adapter-test", tag].map((name) => {
        const element = document.createElement(name);
        element.innerHTML = '<b slot="badge">Named child</b><i>Default child</i>';
        (element as unknown as Record<string, unknown>).caption = { pending: "object property" };
        if (hydrate) {
          element.setAttribute("hydrate", "");
          element.shadowRoot!.innerHTML = '<div data-caption="server" data-token="server"><slot name="badge"></slot><slot></slot></div>';
        }
        parent.append(element);
        return element;
      });
      return pair;
    });
    bridge.installRuntime(createClockRuntime(Probe));
    for (const [baseline, candidate] of pairs) {
      assert.equal(candidate.shadowRoot!.innerHTML, baseline.shadowRoot!.innerHTML);
      assert.equal(candidate.shadowRoot!.querySelector("div")!.getAttribute("data-token"),
        candidate.hasAttribute("hydrate") ? "server" : "inherited-context");
      assert.equal(candidate.shadowRoot!.querySelectorAll("slot").length, 2);
      for (const value of ["changed 🕒", false, 42, null]) {
        for (const element of [baseline, candidate]) {
          (element as unknown as Record<string, unknown>).caption = value;
        }
        assert.equal(candidate.getAttribute("caption"), baseline.getAttribute("caption"));
        assert.equal(candidate.shadowRoot!.innerHTML, baseline.shadowRoot!.innerHTML);
      }
      for (const element of [baseline, candidate]) element.remove();
      assert.equal(candidate.shadowRoot!.innerHTML, baseline.shadowRoot!.innerHTML);
      for (const element of [baseline, candidate]) parent.append(element);
      assert.equal(candidate.shadowRoot!.innerHTML, baseline.shadowRoot!.innerHTML);
    }
  } finally { parent.remove(); }
});
