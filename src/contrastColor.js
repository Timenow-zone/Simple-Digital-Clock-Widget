"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function contrastColor(inputColor) {
  // --- Helpers --------------------------------------------------------------
  var _a, _b;
  // Clamp number into [min, max]
  var clamp = function (v, min, max) {
    return Math.min(Math.max(v, min), max);
  };
  // Convert sRGB channel [0..255] to linear light
  var srgbToLinear = function (c255) {
    var c = c255 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  // Relative luminance per WCAG (0..1)
  var relativeLuminance = function (r, g, b) {
    var R = srgbToLinear(r);
    var G = srgbToLinear(g);
    var B = srgbToLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  // Contrast ratio between two luminances (L1 lighter, L2 darker)
  var contrastRatio = function (L1, L2) {
    return (L1 + 0.05) / (L2 + 0.05);
  };
  // Parse #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  var parseHex = function (hexInput) {
    var hex = hexInput.slice(1).trim();
    var len = hex.length;
    if (len !== 3 && len !== 4 && len !== 6 && len !== 8) {
      throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
    }
    var toByte = function (h) {
      return parseInt(h, 16);
    };
    var r, g, b;
    if (len === 3 || len === 4) {
      // Expand short form (#abc[#d] -> #aabbcc[dd])
      r = toByte(hex[0] + hex[0]);
      g = toByte(hex[1] + hex[1]);
      b = toByte(hex[2] + hex[2]);
      // alpha (hex[3]) is ignored for contrast background
    } else {
      r = toByte(hex.slice(0, 2));
      g = toByte(hex.slice(2, 4));
      b = toByte(hex.slice(4, 6));
      // alpha (hex[6..8]) is ignored
    }
    if (
      [r, g, b].some(function (v) {
        return Number.isNaN(v);
      })
    ) {
      throw new Error("Invalid HEX digits.");
    }
    return { r: r, g: g, b: b };
  };
  // Parse rgb()/rgba(); supports integers 0..255 or percentages 0%..100%
  var parseRgbFunc = function (rgbInput) {
    // Normalize and extract content inside parentheses
    var open = rgbInput.indexOf("(");
    var close = rgbInput.lastIndexOf(")");
    if (open === -1 || close === -1 || close <= open) {
      throw new Error("Malformed rgb()/rgba() string.");
    }
    var inner = rgbInput.slice(open + 1, close).trim();
    // Split by commas, tolerate extra spaces
    var parts = inner.split(/\s*,\s*/);
    if (parts.length < 3) {
      throw new Error("rgb()/rgba() must have at least 3 components.");
    }
    var parseChannel = function (s) {
      // Percentage form e.g., "80%"
      var percentMatch = s.match(/^(-?\d+(?:\.\d+)?)%$/);
      if (percentMatch) {
        var p = parseFloat(percentMatch[1]);
        return clamp(Math.round((p / 100) * 255), 0, 255);
      }
      // Integer 0..255 (also accepts floats and rounds)
      var n = Number(s);
      if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
      return clamp(Math.round(n), 0, 255);
    };
    var r = parseChannel(parts[0]);
    var g = parseChannel(parts[1]);
    var b = parseChannel(parts[2]);
    // Alpha (parts[3]) is intentionally ignored for background color
    return { r: r, g: g, b: b };
  };
  // --- Main -----------------------------------------------------------------
  var r, g, b;
  var color = inputColor.trim();
  if (color.startsWith("#")) {
    ((_a = parseHex(color)), (r = _a.r), (g = _a.g), (b = _a.b));
  } else if (color.toLowerCase().startsWith("rgb")) {
    ((_b = parseRgbFunc(color)), (r = _b.r), (g = _b.g), (b = _b.b));
  } else {
    // Keep API behavior: only HEX or rgb()/rgba() are accepted
    throw new Error(
      "Color format not recognized. Use HEX (#RRGGBB, #RGB, with optional alpha) or rgb()/rgba()."
    );
  }
  // Compute relative luminance
  var Lbg = relativeLuminance(r, g, b);
  // Compare contrast vs black (#000) and white (#fff); pick better
  var Lwhite = 1.0; // luminance of #fff
  var Lblack = 0.0; // luminance of #000
  var contrastWithWhite = contrastRatio(Math.max(Lwhite, Lbg), Math.min(Lwhite, Lbg));
  var contrastWithBlack = contrastRatio(Math.max(Lbg, Lblack), Math.min(Lbg, Lblack));
  // Return "black" or "white" to keep original API
  return contrastWithBlack >= contrastWithWhite ? "black" : "white";
}
exports.default = contrastColor;
