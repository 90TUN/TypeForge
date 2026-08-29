import { CANVAS_SIZE, BASELINE_RATIO } from '../utils/constants';

/**
 * Calculate character metrics from strokes
 * Returns bounds, width, height, and positioning information
 */
export const calculateCharacterMetrics = (strokes, canvasSize = CANVAS_SIZE, baselineRatio = BASELINE_RATIO) => {
  if (!strokes || strokes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
      baselineDistance: 0,
      capHeight: 0,
      ascender: 0,
      descender: 0,
      isEmpty: true,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Find bounds of all points
  strokes.forEach(stroke => {
    if (stroke.points) {
      stroke.points.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    }
  });

  // Canvas baseline position (where text sits)
  const canvasBaseline = canvasSize * baselineRatio;

  // Calculate distances relative to baseline
  const baselineDistance = canvasBaseline - maxY; // Distance from baseline to bottom of glyph
  const ascender = canvasBaseline - minY; // Distance from baseline up
  const descender = canvasBaseline - maxY; // Distance from baseline down

  return {
    minX: Math.round(minX),
    maxX: Math.round(maxX),
    minY: Math.round(minY),
    maxY: Math.round(maxY),
    width: Math.round(maxX - minX),
    height: Math.round(maxY - minY),
    baselineDistance: Math.round(baselineDistance),
    capHeight: Math.round(ascender),
    ascender: Math.round(ascender),
    descender: Math.round(descender),
    isEmpty: false,
  };
};
