/*
 * Lifecycle and DOM conversion adapted from preact-custom-element 4.6.0.
 * The MIT License (MIT)
 * Copyright (c) 2016 Bradley Spaulding
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { h, cloneElement, render, hydrate, Fragment, type AnyComponent, type ComponentChildren, type VNode } from "preact";
import type { ClockElement, ClockElementRuntime } from "./clock-element";

type Props = Record<string, unknown>;
type Context = Record<string, unknown>;
type ContextEvent = CustomEvent<{ context?: Context }>;

function ContextProvider(this: { getChildContext?: () => Context | undefined }, props: Props & {
  context?: Context;
  children?: ComponentChildren;
}) {
  const { context, children, ...rest } = props;
  this.getChildContext = () => context;
  return cloneElement(children as VNode<Props>, rest);
}

function camelCase(value: string) {
  return value.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
}

interface SlotState {
  element?: HTMLSlotElement;
  listener?: EventListener;
}

function Slot(this: SlotState, props: Props & { children?: ComponentChildren }, context: Context) {
  const ref = (element: HTMLSlotElement | null) => {
    if (!element) {
      if (this.element && this.listener) this.element.removeEventListener("_preact", this.listener);
    } else {
      this.element = element;
      if (!this.listener) {
        this.listener = (event: Event) => {
          event.stopPropagation();
          (event as ContextEvent).detail.context = context;
        };
      }
      element.addEventListener("_preact", this.listener);
    }
  };
  const { useFragment, ...rest } = props;
  return useFragment ? h(Fragment, null, props.children) : h("slot", { ...rest, ref });
}

function toVdom(element: Node, component?: AnyComponent): ComponentChildren {
  if (element.nodeType === Node.TEXT_NODE) return (element as Text).data;
  if (element.nodeType !== Node.ELEMENT_NODE) return null;
  const host = element as Element;
  const children: ComponentChildren[] = [];
  const props: Props = {};
  for (let i = host.attributes.length - 1; i >= 0; i--) {
    const attribute = host.attributes[i];
    if (attribute.name !== "slot") {
      props[attribute.name] = attribute.value;
      props[camelCase(attribute.name)] = attribute.value;
    }
  }
  for (let i = host.childNodes.length - 1; i >= 0; i--) {
    const child = host.childNodes[i];
    const vnode = toVdom(child);
    const name = child.nodeType === Node.ELEMENT_NODE ? (child as Element).getAttribute("slot") : null;
    if (name) props[name] = h(Slot, { name }, vnode);
    else children[i] = vnode;
  }
  const wrapped = component ? h(Slot, { useFragment: false }, children) : children;
  return h(component || host.nodeName.toLowerCase(), props, wrapped);
}

/** Keep Preact's context, hydration, slots and reflection behind the lazy host. */
export function createClockRuntime<P, S>(component: AnyComponent<P, S>): ClockElementRuntime {
  const Component = component as unknown as AnyComponent;
  return {
    connect(element: ClockElement) {
      element._vdomComponent = Component;
      const event: ContextEvent = new CustomEvent("_preact", {
        detail: {}, bubbles: true, cancelable: true,
      });
      element.dispatchEvent(event);
      element._vdom = h<Props>(ContextProvider, { ...element._props, context: event.detail.context },
        toVdom(element, Component));
      (element.hasAttribute("hydrate") ? hydrate : render)(element._vdom, element._root);
    },
    disconnect(element: ClockElement) {
      render((element._vdom = null), element._root);
    },
    attributeChanged(element: ClockElement, name: string, _oldValue: unknown, newValue: unknown) {
      if (!element._vdom) return;
      const value = newValue == null ? undefined : newValue;
      element._vdom = cloneElement(element._vdom, { [name]: value, [camelCase(name)]: value });
      render(element._vdom, element._root);
    },
  };
}
