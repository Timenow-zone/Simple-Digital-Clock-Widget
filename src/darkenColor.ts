// darkenColor.ts
function darkenColor(color: string, percent: number): string {
  // --- Helpers --------------------------------------------------------------
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const toByte = (n: number) => clamp(Math.floor(n), 0, 255); // <= floor for stable expectations

  // Clamp percent to [-1, 1]; negative => darken, positive => lighten
  const p = Math.max(-1, Math.min(1, percent));

  type RGB = { r: number; g: number; b: number; a: number | null };

  // Parse #RGB/#RGBA/#RRGGBB/#RRGGBBAA
  const parseHex = (hexInput: string): RGB => {
    const hex = hexInput.slice(1).trim();
    const len = hex.length;
    if (![3, 4, 6, 8].includes(len)) {
      throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
    }
    const expand = (c: string) => c + c;

    let r: number,
      g: number,
      b: number,
      a: number | null = null;

    if (len === 3 || len === 4) {
      r = parseInt(expand(hex[0]), 16);
      g = parseInt(expand(hex[1]), 16);
      b = parseInt(expand(hex[2]), 16);
      if (len === 4) a = parseInt(expand(hex[3]), 16) / 255;
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      if (len === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
    }

    if ([r, g, b].some(Number.isNaN)) throw new Error("Invalid HEX digits.");
    return { r, g, b, a };
  };

  // Parse rgb()/rgba(); supports integers and percentages
  const parseRgb = (rgbInput: string): RGB => {
    const open = rgbInput.indexOf("(");
    const close = rgbInput.lastIndexOf(")");
    if (open === -1 || close === -1 || close <= open) throw new Error("Malformed rgb()/rgba().");
    const inner = rgbInput.slice(open + 1, close).trim();

    const parts = inner.split(/\s*,\s*/);
    if (parts.length < 3) throw new Error("rgb()/rgba() must have at least 3 components.");

    const parseChan = (s: string) => {
      const m = s.match(/^(-?\d+(?:\.\d+)?)%$/);
      if (m) return toByte((parseFloat(m[1]) / 100) * 255);
      const n = Number(s);
      if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
      return toByte(n);
    };

    const r = parseChan(parts[0]);
    const g = parseChan(parts[1]);
    const b = parseChan(parts[2]);

    let a: number | null = null;
    if (parts[3] !== undefined) {
      const an = Number(parts[3]);
      if (Number.isNaN(an)) throw new Error("Invalid alpha channel.");
      a = clamp(an, 0, 1);
    }
    return { r, g, b, a };
  };

  // --- Parse input ----------------------------------------------------------
  const src = color.trim();
  const hasHex = src.startsWith("#");
  const isRGBA = src.toLowerCase().startsWith("rgba");
  const isRGB = src.toLowerCase().startsWith("rgb");

  let r: number, g: number, b: number, a: number | null;

  if (hasHex) {
    ({ r, g, b, a } = parseHex(src));
  } else if (isRGB) {
    ({ r, g, b, a } = parseRgb(src));
    if (a === null) a = isRGBA ? 1 : null; // keep family: rgba stays rgba, rgb stays rgb
  } else {
    throw new Error("Invalid color format. Use HEX (#...[,AA]) or rgb()/rgba().");
  }

  // --- Apply lighten/darken -------------------------------------------------
  const target = p < 0 ? 0 : 255;
  const pp = Math.abs(p);

  r = toByte(r + (target - r) * pp);
  g = toByte(g + (target - g) * pp);
  b = toByte(b + (target - b) * pp);

  // --- Serialize back in the original family --------------------------------
  if (hasHex) {
    const hex = (v: number) => v.toString(16).padStart(2, "0");
    const base = `#${hex(r)}${hex(g)}${hex(b)}`;
    return a !== null ? `${base}${hex(Math.floor((a ?? 1) * 255))}` : base; // keep alpha byte; floor for stability
  }

  if (isRGBA) {
    const outA = a ?? 1;
    return `rgba(${r}, ${g}, ${b}, ${outA})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export default darkenColor;
