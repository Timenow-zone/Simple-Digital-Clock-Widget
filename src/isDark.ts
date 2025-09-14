// isDark.ts

/**
 * Detect if user prefers dark color scheme.
 * Returns `false` if matchMedia is not available (e.g. server-side).
 */
function isDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default isDark;
