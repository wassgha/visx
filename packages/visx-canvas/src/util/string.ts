// Adapted from canvg
// Original: https://github.com/canvg/canvg/blob/master/src/util/string.ts

/**
 * HTML-safe compress white-spaces.
 * @param str - String to compress.
 * @returns String.
 */
export function compressSpaces(str: string) {
  return str.replace(/(?!\u3000)\s+/gm, ' ');
}

/**
 * Transform floats to integers in rgb colors.
 * @param color - Color to normalize.
 * @returns Normalized color.
 */
export function normalizeColor(color: string) {
  if (!color.startsWith('rgb')) {
    return color;
  }

  let rgbParts = 3;
  const normalizedColor = color.replace(/\d+(\.\d+)?/g, (num, isFloat) =>
    // eslint-disable-next-line no-plusplus
    rgbParts-- && isFloat ? String(Math.round(parseFloat(num))) : num,
  );

  return normalizedColor;
}
