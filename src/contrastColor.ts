function contrastColor(inputColor: string): string {
  let r: number, g: number, b: number;

  if (inputColor.startsWith("#")) {
    // If input is HEX, with or without alpha
    const hex = inputColor.slice(1); // Remove the '#'
    const isShort = hex.length === 4 || hex.length === 3; // Short hex #RGB or #RGBA
    const multiplier = isShort ? 1 : 2;

    r = parseInt(hex.substring(0, multiplier), 16);
    g = parseInt(hex.substring(multiplier, 2 * multiplier), 16);
    b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

    if (isShort) {
      // Convert short hex to full hex values
      r = r * 16 + r;
      g = g * 16 + g;
      b = b * 16 + b;
    }
  } else if (inputColor.startsWith("rgb")) {
    // If input is RGB or RGBA
    const colors = inputColor
      .substring(inputColor.indexOf("(") + 1, inputColor.lastIndexOf(")"))
      .split(/,\s*/);
    [r, g, b] = colors.map(Number); // Convert string array to number array
  } else {
    throw new Error("Color format not recognized. Please input HEX, RGB, or RGBA format.");
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "black" : "white";
}

export default contrastColor;
