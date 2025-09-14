// comments: English only
import { expect } from "@esm-bundle/chai";
import isDark from "../src/isDark";

const save = (key: keyof Window & "matchMedia", val: any) => {
  (window as any).__save ??= {};
  (window as any).__save[key] = (window as any)[key];
  (window as any)[key] = val;
};
const restore = (key: keyof Window & "matchMedia") => {
  if ((window as any).__save?.[key] !== undefined) {
    (window as any)[key] = (window as any).__save[key];
  }
};

afterEach(() => {
  restore("matchMedia");
});

it("returns false if matchMedia is missing", () => {
  save("matchMedia", undefined);
  expect(isDark()).to.equal(false);
});

it("detects dark scheme", () => {
  save("matchMedia", (q: string) => ({ matches: q.includes("dark") }));
  expect(isDark()).to.equal(true);
});

it("detects light scheme", () => {
  save("matchMedia", (q: string) => ({ matches: false }));
  expect(isDark()).to.equal(false);
});
