import { ALPHABET } from './constants';
import { CANVAS_SIZE } from './constants'; // usually 500

export const processTemplateImage = async (img, cropRect) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Outer grid dimensions in the original image based on cropRect
  const startX = img.width * cropRect.left;
  const startY = img.height * cropRect.top;
  const gridW = img.width * (cropRect.right - cropRect.left);
  const gridH = img.height * (cropRect.bottom - cropRect.top);
  
  const cols = 8;
  const rows = 12;
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  const extractedGlyphs = {};
  let charIndex = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (charIndex >= ALPHABET.length) break;
      const char = ALPHABET[charIndex];
      charIndex++;

      // We extract each cell individually to a new canvas of CANVAS_SIZE (500x500)
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // We leave a tiny padding since grid lines might bleed in
      const pW = cellW * 0.05;
      const pH = cellH * 0.05;

      ctx.drawImage(
        img,
        startX + c * cellW + pW,
        startY + r * cellH + pH,
        cellW - pW * 2,
        cellH - pH * 2,
        0, 0, CANVAS_SIZE, CANVAS_SIZE
      );

      const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const strokes = traceImage(imageData);
      
      if (strokes && strokes.length > 0) {
        // Calculate total bounding box of all strokes in this cell
        let minX = CANVAS_SIZE, minY = CANVAS_SIZE, maxX = 0, maxY = 0;
        strokes.forEach(stroke => {
          stroke.points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          });
        });
        
        const bbWidth = maxX - minX;
        const bbHeight = maxY - minY;
        
        // If the entire ink spans less than 3% of the cell, it's just a speck of dust, not a drawn letter.
        if (bbWidth > CANVAS_SIZE * 0.03 || bbHeight > CANVAS_SIZE * 0.03) {
          extractedGlyphs[char] = strokes;
        }
      }
    }
  }

  return extractedGlyphs;
};

// Extremely simple Marching Squares / Contour Tracing for binary image
const traceImage = (imageData) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Threshold image to binary (0 = white/empty, 1 = black/ink)
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    const avg = (r + g + b) / 3;
    binary[i/4] = avg < 128 ? 1 : 0; // Black threshold
  }

  // Find disconnected regions and trace them
  const visited = new Uint8Array(width * height);
  const strokes = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1 && visited[idx] === 0) {
        const contour = traceContour(x, y, binary, visited, width, height);
        if (contour.length > 10) { // filter out tiny specks of dust
          // Simplify contour heavily to reduce points for React state/OpenType limits
          const simplified = simplifyPathBasic(contour, 2.0);
          strokes.push({ points: simplified, isOutline: true });
        }
      }
    }
  }
  return strokes;
};

// Basic Moore Neighborhood tracing algorithm
const traceContour = (startX, startY, binary, visited, width, height) => {
  const contour = [];
  const dirs = [
    {dx: 1, dy: 0}, {dx: 1, dy: 1}, {dx: 0, dy: 1}, {dx: -1, dy: 1},
    {dx: -1, dy: 0}, {dx: -1, dy: -1}, {dx: 0, dy: -1}, {dx: 1, dy: -1}
  ];
  
  let x = startX, y = startY;
  let dir = 0; // Start pointing right

  let initialLoop = true;
  while (initialLoop || (x !== startX || y !== startY)) {
    initialLoop = false;
    contour.push({ x, y, pressure: 0.5 });
    visited[y * width + x] = 1;

    let found = false;
    // Check 8 neighbors clockwise starting from top-left relative to current dir
    let checkDir = (dir + 5) % 8; 
    
    for (let i = 0; i < 8; i++) {
      const nx = x + dirs[checkDir].dx;
      const ny = y + dirs[checkDir].dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (binary[ny * width + nx] === 1) {
          x = nx;
          y = ny;
          dir = checkDir;
          found = true;
          break;
        }
      }
      checkDir = (checkDir + 1) % 8;
    }
    
    if (!found) break; // Isolated pixel
    if (contour.length > 5000) break; // Safety limit
  }

  return contour;
};

// Douglas-Peucker basic path simplification (reduces point density)
const simplifyPathBasic = (points, tolerance) => {
  if (points.length < 3) return points;
  
  let maxDist = 0;
  let maxIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = pointLineDist(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  if (maxDist > tolerance) {
    const left = simplifyPathBasic(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPathBasic(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  
  return [start, end];
};

const pointLineDist = (point, start, end) => {
  const num = Math.abs((end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x);
  const den = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
  return den === 0 ? 0 : num / den;
};

