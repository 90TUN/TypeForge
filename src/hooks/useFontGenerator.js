import { useEffect } from 'react';
import { loadOpenType } from '../utils/drawing';
import { ALPHABET, CANVAS_SIZE, BASELINE_RATIO, SCALE, FONT_UNITS } from '../utils/constants';

export const useFontGenerator = (glyphs, fontMetadata, otLoaded, setFontUrl, strokeWidth) => {
  useEffect(() => {
    if (!otLoaded) return;
    
    const timer = setTimeout(async () => {
      // Helper function to create stroke outline from points
      const createStrokeOutline = (points, strokeWidth, scale) => {
        if (points.length < 2) return null;

        const path = new (window.opentype?.Path || require('opentype.js').Path)();
        const scaledWidth = strokeWidth * scale;
        
        const leftEdge = [];
        const rightEdge = [];

        for (let i = 0; i < points.length; i++) {
          const curr = points[i];
          const y = CANVAS_SIZE * BASELINE_RATIO - curr.y;
          const x = curr.x;
          
          let dirX = 0, dirY = 0;
          
          if (i === 0 && points.length > 1) {
            dirX = points[1].x - curr.x;
            dirY = (CANVAS_SIZE * BASELINE_RATIO - points[1].y) - y;
          } else if (i === points.length - 1 && points.length > 1) {
            dirX = curr.x - points[i - 1].x;
            dirY = y - (CANVAS_SIZE * BASELINE_RATIO - points[i - 1].y);
          } else if (i > 0 && i < points.length - 1) {
            dirX = points[i + 1].x - points[i - 1].x;
            dirY = (CANVAS_SIZE * BASELINE_RATIO - points[i + 1].y) - (CANVAS_SIZE * BASELINE_RATIO - points[i - 1].y);
          }

          const len = Math.sqrt(dirX * dirX + dirY * dirY);
          if (len > 0) {
            dirX /= len;
            dirY /= len;
          }

          const perpX = -dirY * scaledWidth / 2;
          const perpY = dirX * scaledWidth / 2;

          leftEdge.push({ x: x * scale + perpX, y: y * scale + perpY });
          rightEdge.push({ x: x * scale - perpX, y: y * scale - perpY });
        }

        if (leftEdge.length > 0) {
          path.moveTo(leftEdge[0].x, leftEdge[0].y);
          for (let i = 1; i < leftEdge.length; i++) {
            path.lineTo(leftEdge[i].x, leftEdge[i].y);
          }
        }

        if (rightEdge.length > 0) {
          for (let i = rightEdge.length - 1; i >= 0; i--) {
            path.lineTo(rightEdge[i].x, rightEdge[i].y);
          }
        }

        path.closePath();
        return path;
      };
      
      const generateFont = async () => {
        const ot = await loadOpenType();
        
        const glyphArray = [];
        const notdefGlyph = new ot.Glyph({ name: '.notdef', advanceWidth: 600 });
        const spaceGlyph = new ot.Glyph({ name: 'space', unicode: 32, advanceWidth: 250 });
        
        glyphArray.push(notdefGlyph);
        glyphArray.push(spaceGlyph);

        ALPHABET.forEach(char => {
          const strokes = glyphs[char];
          
          if (!strokes || strokes.length === 0) return;

          const path = new ot.Path();
          let hasValidPath = false;

          strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;

            const points = stroke.points;
            const strokeOutline = createStrokeOutline(points, strokeWidth, SCALE);
            
            if (strokeOutline) {
              const commands = strokeOutline.commands;
              commands.forEach(cmd => {
                if (cmd.type === 'M') path.moveTo(cmd.x, cmd.y);
                else if (cmd.type === 'L') path.lineTo(cmd.x, cmd.y);
                else if (cmd.type === 'C') path.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                else if (cmd.type === 'Q') path.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
                else if (cmd.type === 'Z') path.closePath();
              });
              hasValidPath = true;
            }
          });

          if (hasValidPath) {
            glyphArray.push(new ot.Glyph({
              name: char,
              unicode: char.charCodeAt(0),
              advanceWidth: 800,
              path
            }));
          }
        });

        const font = new ot.Font({
          familyName: fontMetadata.family || 'TypeForge',
          styleName: 'Regular',
          unitsPerEm: FONT_UNITS,
          ascender: 800,
          descender: -200,
          glyphs: glyphArray
        });

        try {
          const blob = new Blob([font.toArrayBuffer()], { type: 'font/otf' });
          const url = URL.createObjectURL(blob);
          
          setFontUrl(prev => {
            if (prev?.url) {
              URL.revokeObjectURL(prev.url);
            }
            
            const fontFace = new FontFace(fontMetadata.family, `url(${url})`);
            fontFace.load().then(() => {
              document.fonts.add(fontFace);
            }).catch(e => console.error('Failed to load font face:', e));
            
            return { name: fontMetadata.family, url };
          });
        } catch (err) {
          console.error('Font generation failed:', err);
        }
      };

      generateFont();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [glyphs, fontMetadata, otLoaded, setFontUrl, strokeWidth]);
};
