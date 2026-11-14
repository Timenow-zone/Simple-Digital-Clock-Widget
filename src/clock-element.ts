import type { AnyComponent, VNode } from "preact";

export const CLOCK_TAG = "timenow-zone-sdcw";
export const CLOCK_ATTRIBUTES = [
  "background-color", "time-zone-name", "font-family", "background", "time-zone",
  "rounded", "second", "hundredths", "caption", "prefers", "locale", "shadow",
  "border", "period", "date", "width", "align",
];

export interface ClockElement extends HTMLElement {
  _root: ShadowRoot;
  _props?: Record<string, unknown>;
  _vdom?: VNode<Record<string, unknown>> | null;
  _vdomComponent?: AnyComponent;
  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void;
}

export interface ClockElementRuntime {
  connect(element: ClockElement): void;
  disconnect(element: ClockElement): void;
  attributeChanged(element: ClockElement, name: string, oldValue: unknown, newValue: unknown): void;
}

export interface ClockElementConstructor extends CustomElementConstructor {
  readonly sdcwBridgeVersion: 1;
  readonly runtimeReady: boolean;
  readonly whenRuntimeReady: Promise<void>;
  installRuntime(runtime: ClockElementRuntime): void;
  requestRuntime(load: () => void): void;
}

/** Define the host independently of the renderer, including inside closed roots. */
export function registerClockElement(load?: () => void): ClockElementConstructor {
  const existing = customElements.get(CLOCK_TAG) as ClockElementConstructor | undefined;
  if (existing) {
    if (existing.sdcwBridgeVersion !== 1) {
      throw new Error("Simple Digital Clock: the element has another registered owner.");
    }
    if (load) existing.requestRuntime(load);
    return existing;
  }

  let runtime: ClockElementRuntime | undefined;
  let installed = false;
  let request = load;
  let requested = false;
  let resolveReady: () => void;
  const ready = new Promise<void>((resolve) => { resolveReady = resolve; });
  const pending = new Set<ClockElement>();

  function requestForConnectedClock() {
    // A synchronous insert/remove is not a remaining use of the clock.
    queueMicrotask(() => {
      for (const element of pending) {
        if (!element.isConnected) pending.delete(element);
      }
      if (!runtime && !requested && pending.size && request) {
        requested = true;
        request();
      }
    });
  }

  class ClockHost extends HTMLElement implements ClockElement {
    static readonly sdcwBridgeVersion = 1;
    static readonly observedAttributes = CLOCK_ATTRIBUTES;
    static readonly whenRuntimeReady = ready;
    static get runtimeReady() { return installed; }

    _root: ShadowRoot;
    _props?: Record<string, unknown>;
    _vdom?: VNode<Record<string, unknown>> | null;
    _vdomComponent?: AnyComponent;

    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
    }

    static requestRuntime(callback: () => void) {
      if (!request) request = callback;
      requestForConnectedClock();
    }

    static installRuntime(implementation: ClockElementRuntime) {
      if (runtime) throw new Error("Simple Digital Clock: the runtime is already installed.");
      if (!implementation || typeof implementation.connect !== "function" ||
          typeof implementation.disconnect !== "function" || typeof implementation.attributeChanged !== "function") {
        throw new TypeError("Simple Digital Clock: invalid runtime adapter.");
      }
      runtime = implementation;
      for (const element of pending) {
        pending.delete(element);
        if (!element.isConnected) continue;
        try {
          runtime.connect(element);
        } catch (error) {
          // Match native custom-element reactions: report each error without blocking siblings.
          queueMicrotask(() => { throw error; });
        }
      }
      // Readiness describes the renderer, not the validity of every clock's settings.
      installed = true;
      resolveReady();
    }

    connectedCallback() {
      if (runtime) runtime.connect(this);
      else {
        pending.add(this);
        requestForConnectedClock();
      }
    }

    disconnectedCallback() {
      pending.delete(this);
      if (runtime) runtime.disconnect(this);
    }

    attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
      if (runtime) runtime.attributeChanged(this, name, oldValue, newValue);
    }
  }

  // Preserve the public property/attribute reflection of preact-custom-element.
  for (const name of CLOCK_ATTRIBUTES) {
    Object.defineProperty(ClockHost.prototype, name, {
      get(this: ClockElement) {
        return this._vdom ? (this._vdom.props as Record<string, unknown>)[name] : this._props?.[name];
      },
      set(this: ClockElement, value: unknown) {
        if (this._vdom) this.attributeChangedCallback(name, null, value);
        else (this._props ??= {})[name] = value;
        if (value == null || ["string", "boolean", "number"].includes(typeof value)) {
          this.setAttribute(name, String(value));
        }
      },
    });
  }

  customElements.define(CLOCK_TAG, ClockHost);
  return ClockHost;
}
