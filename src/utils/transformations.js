import { CANVAS_SIZE } from './constants';

// Calculate center point of all strokes
export const calculateCenter = (strokes) => {
  if (!strokes || strokes.length === 0) return { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

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

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

// Rotate points around center by angle in degrees
export const rotatePoints = (points, angle, center) => {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return points.map(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
      ...p,
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  });
};

// Scale points around center
export const scalePoints = (points, scaleX, scaleY, center) => {
  return points.map(p => ({
    ...p,
    x: center.x + (p.x - center.x) * scaleX,
    y: center.y + (p.y - center.y) * scaleY,
  }));
};

// Skew points (shear transformation)
export const skewPoints = (points, skewX, skewY, center) => {
  // skewX and skewY are in angles (degrees)
  const radX = (skewX * Math.PI) / 180;
  const radY = (skewY * Math.PI) / 180;
  const tanX = Math.tan(radX);
  const tanY = Math.tan(radY);

  return points.map(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
      ...p,
      x: center.x + dx + dy * tanX,
      y: center.y + dy + dx * tanY,
    };
  });
};

// Flip points horizontally
export const flipHorizontal = (points, center) => {
  return points.map(p => ({
    ...p,
    x: center.x - (p.x - center.x),
    y: p.y,
  }));
};

// Flip points vertically
export const flipVertical = (points, center) => {
  return points.map(p => ({
    ...p,
    x: p.x,
    y: center.y - (p.y - center.y),
  }));
};

// Apply transformations to strokes
export const transformStrokes = (strokes, transformations) => {
  if (!strokes || strokes.length === 0) return strokes;

  const center = calculateCenter(strokes);
  const canvasCenter = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

  return strokes.map(stroke => {
    if (!stroke.points || stroke.points.length === 0) return stroke;

    let points = [...stroke.points];

    // Apply transformations in order
    if (transformations.rotation !== 0) {
      points = rotatePoints(points, transformations.rotation, center);
    }

    if (transformations.scaleX !== 1 || transformations.scaleY !== 1) {
      points = scalePoints(
        points,
        transformations.scaleX,
        transformations.scaleY,
        center
      );
    }

    if (transformations.skewX !== 0 || transformations.skewY !== 0) {
      points = skewPoints(
        points,
        transformations.skewX,
        transformations.skewY,
        center
      );
    }

    if (transformations.flipH) {
      points = flipHorizontal(points, canvasCenter);
    }

    if (transformations.flipV) {
      points = flipVertical(points, canvasCenter);
    }

    return {
      ...stroke,
      points,
    };
  });
};

// Reset transformations to default
export const getDefaultTransformations = () => ({
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  flipH: false,
  flipV: false,
});
