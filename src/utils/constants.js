// Canvas & Font Constants
export const CANVAS_SIZE = 500;
export const FONT_UNITS = 1000;
export const BASELINE_RATIO = 0.8;
export const SCALE = FONT_UNITS / CANVAS_SIZE;

// Character Set - Paired lowercase/uppercase with singles for numbers/symbols
const letterPairs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(c => [c, c.toLowerCase()]);
const numberAndSymbols = "0123456789!@#$%^&*()-_=+[]{}|;:',.<>?/~`".split("").map(c => [c]);
export const CHARACTER_GROUPS = [...letterPairs, ...numberAndSymbols];

// Flat alphabet for font generation and references
export const ALPHABET = CHARACTER_GROUPS.flat();

// Preview Sizes
export const PREVIEW_SIZES = [12, 18, 24, 32, 48, 64];
