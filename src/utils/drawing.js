// Douglas-Peucker path simplification
export const simplifyPath = (points, tolerance = 2.0) => {
  if (points.length < 3) return points;
  
  let maxDist = 0;
  let maxIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = pointToLineDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  
  return [start, end];
};

export const pointToLineDistance = (point, lineStart, lineEnd) => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  if (param < 0) param = 0;
  else if (param > 1) param = 1;
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Catmull-Rom spline smoothing
export const smoothStroke = (points, tension = 0.5) => {
  if (points.length < 4) return points;
  const smoothed = [points[0]];
  
  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];
    
    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const a = -0.5 * t3 + t2 - 0.5 * t;
      const b = 1.5 * t3 - 2.5 * t2 + 1;
      const c = -1.5 * t3 + 2 * t2 + 0.5 * t;
      const d = 0.5 * t3 - 0.5 * t2;
      
      smoothed.push({
        x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
      });
    }
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
};

// Load opentype.js from CDN
export const loadOpenType = () => {
  return new Promise((resolve, reject) => {
    if (window.opentype) {
      resolve(window.opentype);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js';
    script.onload = () => resolve(window.opentype);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
