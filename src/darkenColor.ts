function darkenColor(color: string, percent: number): string {
  let R: number, G: number, B: number, A: number;

  // Check for HEX format with alpha channel and parse it
  if (color[0] === "#" && (color.length === 9 || color.length === 5)) {
    const hex =
      color.length === 9
        ? color.slice(1)
        : color
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("");
    const f = parseInt(hex, 16);
    R = (f >> 24) & 0xff;
    G = (f >> 16) & 0xff;
    B = (f >> 8) & 0xff;
    A = (f & 0xff) / 255;
  }
  // Check for HEX format without alpha channel and parse it
  else if (color[0] === "#" && (color.length === 7 || color.length === 4)) {
    const hex =
      color.length === 7
        ? color.slice(1)
        : color
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("");
    const f = parseInt(hex, 16);
    R = f >> 16;
    G = (f >> 8) & 0xff;
    B = f & 0xff;
    A = 1; // Default alpha value is 1 for fully opaque
  }
  // Check for RGB or RGBA format and parse it
  else if (color.startsWith("rgb")) {
    const components = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.?\d*))?\)/i);
    if (components) {
      R = parseInt(components[1], 10);
      G = parseInt(components[2], 10);
      B = parseInt(components[3], 10);
      A = components[4] !== undefined ? parseFloat(components[4]) : 1;
    } else {
      throw new Error("Invalid color format");
    }
  } else {
    throw new Error("Invalid color format");
  }

  // Apply darkening
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? -percent : percent;
  R = Math.round((t - R) * p) + R;
  G = Math.round((t - G) * p) + G;
  B = Math.round((t - B) * p) + B;

  // Return color in original format
  if (color[0] === "#" && (color.length === 9 || color.length === 5)) {
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}${(A * 255)
      .toString(16)
      .padStart(2, "0")}`;
  } else if (color[0] === "#") {
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  } else if (color.startsWith("rgba")) {
    return `rgba(${R}, ${G}, ${B}, ${A})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

export default darkenColor;
