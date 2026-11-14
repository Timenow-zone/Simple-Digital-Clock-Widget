import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = process.env.SDCW_WORDPRESS_SOURCE || path.join(root, "wordpress/simple-digital-clock");

// Component callback contracts only. Native Core/React, ARIA and persistence
// are separately exercised in the real WordPress browser acceptance lab.
function inspector() {
  let definition;
  let state;
  const element = {
    createElement(type, props, ...children) {
      return { type, props: { ...props, ...(children.length ? { children } : {}) } };
    },
    useState(initial) {
      if (state === undefined) state = initial;
      return [state, (value) => { state = value; }];
    },
  };
  const components = new Proxy({}, { get: (_, name) => name });
  const useBlockProps = () => ({});
  useBlockProps.save = () => ({});
  const wp = {
    element, components,
    blocks: { registerBlockType: (_, value) => { definition = value; } },
    blockEditor: { useBlockProps },
    hooks: { addFilter() {} },
  };
  vm.runInNewContext(readFileSync(path.join(source, "block.js"), "utf8"), {
    window: { wp }, wp, Intl, blockData: { locale: "en_US", i18n: { timeZoneNoMatch: "Translated no-match help" } },
  });
  const attributes = Object.fromEntries(Object.entries(definition.attributes).map(([key, value]) => [key, value.default]));
  Object.assign(attributes, { timeZone: "Asia/Tokyo", backgroundColor: "#123456" });
  function nodes(tree) {
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    if (!tree || typeof tree !== "object") return [];
    return [tree, ...nodes(tree.props?.children)];
  }
  function find(predicate) {
    const tree = definition.edit({ attributes, setAttributes: (next) => Object.assign(attributes, next) });
    const found = nodes(tree).find(predicate);
    assert.ok(found, "Expected inspector control");
    return found;
  }
  return {
    attributes, definition, find,
    timezone() {
      const node = find((node) => node.type?.name === "TimeZoneControl");
      const wrapper = node.type(node.props);
      return { wrapper, control: nodes(wrapper).find((node) => node.type?.name === "ClockComboboxControl") };
    },
  };
}

function keyEvent({ key = "Enter", query = "Mars/Olympus_Mons", role = "combobox", expanded = true, option = null, owned = true, composing = false, keyCode = 13 } = {}) {
  const attrs = { role, "aria-expanded": String(expanded), "aria-activedescendant": option ? "suggestion" : null };
  return {
    key, keyCode, nativeEvent: { isComposing: composing }, prevented: false, stopped: false,
    target: { value: query, getAttribute: (name) => attrs[name], ownerDocument: { getElementById: () => option } },
    currentTarget: { contains: () => owned },
    preventDefault() { this.prevented = true; },
    stopPropagation() { this.stopped = true; },
  };
}

const option = { getAttribute: (name) => name === "role" ? "option" : null };

test("unmatched Enter cannot reach Core's stale UTC commit; help clears on a new query", () => {
  const ui = inspector();
  const event = keyEvent();
  ui.timezone().wrapper.props.onKeyDownCapture(event);
  // Core commits its stale selection only if the event reaches its handler.
  if (!event.stopped) ui.timezone().control.props.onChange("UTC");
  assert.equal(event.prevented, true);
  assert.equal(ui.attributes.timeZone, "Asia/Tokyo");
  assert.equal(ui.timezone().control.props.help, "Translated no-match help");
  ui.timezone().control.props.onFilterValueChange("Tokyo");
  assert.notEqual(ui.timezone().control.props.help, "Translated no-match help");
});

test("an active matching option keeps Core keyboard and label/value alias semantics", () => {
  const ui = inspector();
  const event = keyEvent({ query: "Kyiv", option });
  ui.timezone().wrapper.props.onKeyDownCapture(event);
  assert.equal(event.prevented, false);
  assert.equal(event.stopped, false);
  ui.timezone().control.props.onChange("Europe/Kiev");
  assert.equal(ui.attributes.timeZone, "Europe/Kiev");
});

test("leaving an unmatched search clears transient help without changing the saved zone", () => {
  const ui = inspector();
  ui.timezone().wrapper.props.onKeyDownCapture(keyEvent());
  assert.equal(ui.timezone().control.props.help, "Translated no-match help");
  ui.timezone().wrapper.props.onBlurCapture();
  assert.notEqual(ui.timezone().control.props.help, "Translated no-match help");
  assert.equal(ui.attributes.timeZone, "Asia/Tokyo");
});

test("another control's active descendant cannot authorize a stale selection", () => {
  const ui = inspector();
  const event = keyEvent({ option, owned: false });
  ui.timezone().wrapper.props.onKeyDownCapture(event);
  assert.equal(event.stopped, true);
  assert.equal(ui.attributes.timeZone, "Asia/Tokyo");
});

test("Reset Enter preserves its native default action but does not bubble into Core suggestions", () => {
  const ui = inspector();
  const event = keyEvent({ role: null });
  ui.timezone().wrapper.props.onKeyDownCapture(event);
  assert.equal(event.stopped, true);
  assert.equal(event.prevented, false);
  ui.timezone().control.props.onChange(null);
  assert.equal(ui.attributes.timeZone, "");
});

test("closed-dropdown Enter cannot commit a hidden stale suggestion after Escape", () => {
  const ui = inspector();
  const event = keyEvent({ expanded: false, query: "Asia/Tokyo" });
  ui.timezone().wrapper.props.onKeyDownCapture(event);
  if (!event.stopped) ui.timezone().control.props.onChange("UTC");
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.equal(ui.attributes.timeZone, "Asia/Tokyo");
  assert.notEqual(ui.timezone().control.props.help, "Translated no-match help");
});

test("IME, Escape, Tab and arrow navigation remain owned by Core", () => {
  for (const args of [{ composing: true }, { keyCode: 229 }, { key: "Tab" }, { key: "ArrowDown", expanded: false }]) {
    const event = keyEvent(args);
    inspector().timezone().wrapper.props.onKeyDownCapture(event);
    assert.equal(event.prevented, false);
    assert.equal(event.stopped, false);
  }
  const ui = inspector();
  ui.timezone().wrapper.props.onKeyDownCapture(keyEvent());
  ui.timezone().wrapper.props.onKeyDownCapture(keyEvent({ key: "Escape" }));
  assert.notEqual(ui.timezone().control.props.help, "Translated no-match help");
});

test("both gradient clear actions preserve solid color and explicit legacy-readable empty JSON", () => {
  for (const action of ["native", "dedicated", "all"]) {
    const ui = inspector();
    if (action === "native") ui.find((node) => node.type === "GradientPicker").props.onChange(undefined);
    else ui.find((node) => node.type === "Button" && node.props.children?.[0] === (action === "all" ? "Clear Colors" : "Clear Gradient")).props.onClick();
    assert.equal(ui.attributes.background, "");
    assert.equal(ui.find((node) => node.type === "GradientPicker").props.value, undefined,
      "Core's picker needs undefined even though persisted JSON needs an empty string");
    assert.equal(ui.attributes.backgroundColor, action === "all" ? "" : "#123456");
    const comment = Object.fromEntries(Object.entries(ui.definition.attributes)
      .filter(([key, schema]) => schema.source === undefined && ui.attributes[key] !== undefined && ui.attributes[key] !== schema.default)
      .map(([key]) => [key, ui.attributes[key]]));
    assert.equal(JSON.parse(JSON.stringify(comment)).background, "", "Old readers must not restore the default gradient from missing JSON");
  }
});

test("selecting a nonempty gradient still updates its representative solid color", () => {
  const ui = inspector();
  const gradient = "linear-gradient(45deg, #123456 0%, #abcdef 100%)";
  ui.find((node) => node.type === "GradientPicker").props.onChange(gradient);
  assert.equal(ui.attributes.background, gradient);
  assert.equal(ui.attributes.backgroundColor.toLowerCase(), "#123456");
});
