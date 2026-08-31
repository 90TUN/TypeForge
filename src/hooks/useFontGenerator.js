import { useEffect } from 'react';
import { loadOpenType } from '../utils/drawing';
import { ALPHABET, CANVAS_SIZE, BASELINE_RATIO, SCALE, FONT_UNITS } from '../utils/constants';

export const useFontGenerator = (glyphs, fontMetadata, otLoaded, setFontUrl, strokeWidth, charRotation = {}, defaultLeftGuidePos, defaultRightGuidePos, charBearings = {}) => {
  useEffect(() => {
    if (!otLoaded) return;
    
    const timer = setTimeout(async () => {
      // Helper function to calculate bounding box from path commands
      const getPathBounds = (commands) => {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        commands.forEach(cmd => {
          if (cmd.x !== undefined) {
            minX = Math.min(minX, cmd.x);
            maxX = Math.max(maxX, cmd.x);
            minY = Math.min(minY, cmd.y);
            maxY = Math.max(maxY, cmd.y);
          }
          if (cmd.x1 !== undefined) {
            minX = Math.min(minX, cmd.x1);
            maxX = Math.max(maxX, cmd.x1);
            minY = Math.min(minY, cmd.y1);
            maxY = Math.max(maxY, cmd.y1);
          }
          if (cmd.x2 !== undefined) {
            minX = Math.min(minX, cmd.x2);
            maxX = Math.max(maxX, cmd.x2);
            minY = Math.min(minY, cmd.y2);
            maxY = Math.max(maxY, cmd.y2);
          }
        });

        return {
          minX: minX === Infinity ? 0 : minX,
          maxX: maxX === -Infinity ? 0 : maxX,
          minY: minY === Infinity ? 0 : minY,
          maxY: maxY === -Infinity ? 0 : maxY,
        };
      };

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

          const pointPressure = curr.pressure ?? 0.5;
          const currentScaledWidth = scaledWidth * pointPressure * 2;

          const perpX = -dirY * currentScaledWidth / 2;
          const perpY = dirX * currentScaledWidth / 2;

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

        // Check if there are any drawn glyphs
        const hasAnyGlyphs = ALPHABET.some(char => glyphs[char] && glyphs[char].length > 0);
        
        if (!hasAnyGlyphs) {
          setFontUrl(prev => {
            if (prev?.url) URL.revokeObjectURL(prev.url);
            
            document.fonts.forEach(f => {
              if (f.family.startsWith(fontMetadata.family || 'TypeForge')) {
                document.fonts.delete(f);
              }
            });
            
            return null;
          });
          return;
        }
        
        const glyphArray = [];
        const notdefGlyph = new ot.Glyph({ name: '.notdef', advanceWidth: 600 });
        const spaceGlyph = new ot.Glyph({ name: 'space', unicode: 32, advanceWidth: 250 });
        
        glyphArray.push(notdefGlyph);
        glyphArray.push(spaceGlyph);

        // Track bounds for all glyphs to calculate dynamic metrics
        let globalMinY = Infinity;
        let globalMaxY = -Infinity;
        const glyphBounds = {};

        ALPHABET.forEach(char => {
          const strokes = glyphs[char];
          
          if (!strokes || strokes.length === 0) return;

          const path = new ot.Path();
          let hasValidPath = false;
          
          const angle = charRotation[char] || 0;
          const centerX = CANVAS_SIZE / 2;
          const centerY = CANVAS_SIZE / 2;
          const rad = (angle * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;

            let points = stroke.points;
            if (angle !== 0) {
              points = points.map(p => {
                const x = p.x - centerX;
                const y = p.y - centerY;
                return {
                  ...p,
                  x: x * cos - y * sin + centerX,
                  y: x * sin + y * cos + centerY
                };
              });
            }

            if (stroke.isOutline) {
              // Points are already a closed contour/polygon (e.g. from Scanner)
              // We just need to map coordinates to font space
              const mappedPoints = points.map(p => ({
                x: p.x * SCALE,
                y: (CANVAS_SIZE * BASELINE_RATIO - p.y) * SCALE
              }));
              path.moveTo(mappedPoints[0].x, mappedPoints[0].y);
              for (let i = 1; i < mappedPoints.length; i++) {
                path.lineTo(mappedPoints[i].x, mappedPoints[i].y);
              }
              path.closePath();
              hasValidPath = true;
            } else {
              // Regular drawn stroke - needs to be expanded into an outline based on strokeWidth
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
            }
          });

          if (hasValidPath) {
            // Get initial bounds for this glyph
            const bounds = getPathBounds(path.commands);
            
            // Calculate dynamic typographic sidebearings based on letter shape
            const getPadding = (c) => {
              const STRAIGHT = 18; // Tight handwriting feel
              const ROUND = 12;
              const ANGLED = 5;    // Very tight for shapes with lots of empty space
              const DEFAULT = 12;
              
              let left = DEFAULT;
              if ('HIMNUBDEFKLPRbhijklmnpru'.includes(c)) left = STRAIGHT;
              else if ('OQCGSoceadq'.includes(c)) left = ROUND;
              else if ('VWTAYJXZvwxyz'.includes(c)) left = ANGLED;
              
              let right = DEFAULT;
              if ('HIMNUahilmnudq'.includes(c)) right = STRAIGHT;
              else if ('OQbpceo'.includes(c)) right = ROUND;
              else if ('VWTAYFKLPRXZCGcefgkrsstvwxyz'.includes(c)) right = ANGLED;
              
              return { left, right };
            };
            
            const { left: leftVal, right: rightVal } = getPadding(char);
            
            // Allow manual overrides if user set custom charBearings, else use shape-based defaults
            const customBearings = charBearings[char];
            const finalLeftVal = customBearings?.left !== undefined ? customBearings.left : leftVal;
            const finalRightVal = customBearings?.right !== undefined ? customBearings.right : rightVal;
            
            const leftPadding = finalLeftVal * SCALE;
            const rightPadding = finalRightVal * SCALE;
            
            // Shift X so the leftmost ink starts exactly at leftPadding
            const leftBearingShift = bounds.minX - leftPadding;
            
            const commands = path.commands;
            commands.forEach(cmd => {
              if (cmd.x !== undefined) cmd.x -= leftBearingShift;
              if (cmd.x1 !== undefined) cmd.x1 -= leftBearingShift;
              if (cmd.x2 !== undefined) cmd.x2 -= leftBearingShift;
            });

            const inkWidth = bounds.maxX - bounds.minX;

            // Update bounds after shift
            glyphBounds[char] = {
              minX: leftPadding,
              maxX: inkWidth + leftPadding,
              minY: bounds.minY,
              maxY: bounds.maxY
            };
            
            globalMinY = Math.min(globalMinY, bounds.minY);
            globalMaxY = Math.max(globalMaxY, bounds.maxY);

            // Advance width is ink width + left padding + right padding
            const advanceWidth = inkWidth + leftPadding + rightPadding;

            glyphArray.push(new ot.Glyph({
              name: char,
              unicode: char.charCodeAt(0),
              advanceWidth: Math.max(Math.ceil(advanceWidth), 100), // Minimum width
              path
            }));
          }
        });

        // --- AUTO-NORMALIZATION ---
        // Legibility of a font in body text is almost entirely driven by its x-height.
        let xHeightSum = 0;
        let xHeightCount = 0;
        const flatLowercase = 'acemnorsuvwxz'.split('');
        
        flatLowercase.forEach(c => {
          if (glyphBounds[c]) {
            // True height from baseline (ignoring floaters or descenders below 0)
            const h = glyphBounds[c].maxY - Math.max(0, glyphBounds[c].minY);
            if (h > 0) {
              xHeightSum += h;
              xHeightCount++;
            }
          }
        });
        
        let measuredXHeight = xHeightCount > 0 ? (xHeightSum / xHeightCount) : 0;
        
        // Fallback to uppercase if no lowercase letters were drawn
        if (measuredXHeight === 0) {
          let capHeightSum = 0;
          let capHeightCount = 0;
          const flatUppercase = 'HIMNTUVWXZ'.split('');
          flatUppercase.forEach(c => {
            if (glyphBounds[c]) {
              const h = glyphBounds[c].maxY - Math.max(0, glyphBounds[c].minY);
              if (h > 0) {
                capHeightSum += h;
                capHeightCount++;
              }
            }
          });
          const measuredCapHeight = capHeightCount > 0 ? (capHeightSum / capHeightCount) : globalMaxY;
          measuredXHeight = measuredCapHeight * 0.72; // Standard ratio (approx 530 / 730)
        }

        // Define normalization scale globally so kerning can use it
        const TARGET_X_HEIGHT = 530;
        let normalizeScale = 1;

        if (measuredXHeight > 0 && measuredXHeight !== TARGET_X_HEIGHT) {
          normalizeScale = TARGET_X_HEIGHT / measuredXHeight;
          
          glyphArray.forEach(glyph => {
            glyph.advanceWidth = Math.round(glyph.advanceWidth * normalizeScale);
            
            if (glyph.path && glyph.path.commands) {
              glyph.path.commands.forEach(cmd => {
                if (cmd.x !== undefined) cmd.x = Math.round(cmd.x * normalizeScale);
                if (cmd.y !== undefined) cmd.y = Math.round(cmd.y * normalizeScale);
                if (cmd.x1 !== undefined) cmd.x1 = Math.round(cmd.x1 * normalizeScale);
                if (cmd.y1 !== undefined) cmd.y1 = Math.round(cmd.y1 * normalizeScale);
                if (cmd.x2 !== undefined) cmd.x2 = Math.round(cmd.x2 * normalizeScale);
                if (cmd.y2 !== undefined) cmd.y2 = Math.round(cmd.y2 * normalizeScale);
              });
            }
          });
        }

        const FINAL_ASCENDER = 960;
        const FINAL_DESCENDER = -250;

        const font = new ot.Font({
          familyName: fontMetadata.family || 'TypeForge',
          styleName: 'Regular',
          version: fontMetadata.version || 'Version 1.0',
          designer: fontMetadata.author || '',
          copyright: fontMetadata.copyright || '',
          unitsPerEm: FONT_UNITS, // 1000
          ascender: FINAL_ASCENDER,
          descender: FINAL_DESCENDER,
          lineGap: 0,
          glyphs: glyphArray
        });

        // --- KERNING INJECTION ---
        font.kerningPairs = {};

        // 1. GLOBAL RULE: Automatically tighten the gap between ANY Capital and ANY lowercase letter.
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const GLOBAL_CAP_LOWER_TUCK = -40;

        uppercaseChars.forEach(cap => {
          lowercaseChars.forEach(low => {
            const leftGlyph = glyphArray.find(g => g.name === cap);
            const rightGlyph = glyphArray.find(g => g.name === low);
            
            if (leftGlyph && rightGlyph) {
              const leftIdx = glyphArray.indexOf(leftGlyph);
              const rightIdx = glyphArray.indexOf(rightGlyph);
              font.kerningPairs[`${leftIdx},${rightIdx}`] = Math.round(GLOBAL_CAP_LOWER_TUCK * normalizeScale);
            }
          });
        });

        // 2. SPECIFIC OVERRIDES: Extreme tucks for letters with large overhangs
        const standardKerning = [
          // 'T' tucks (Increased heavily to pull lowercase under the crossbar)
          ['T', 'o', -140], ['T', 'e', -140], ['T', 'a', -140], ['T', 'i', -80], ['T', 'u', -80], ['T', 'w', -100], ['T', 'y', -100],
          // Angled capitals
          ['V', 'A', -100], ['A', 'V', -100],
          ['W', 'A', -80], ['A', 'W', -80],
          ['Y', 'A', -100], ['A', 'Y', -100],
          // Straight and angled
          ['F', 'A', -60], ['P', 'A', -60],
          ['L', 'T', -90], ['L', 'V', -90], ['L', 'W', -70], ['L', 'Y', -90],
          // Lowercase tucks under angled capitals
          ['V', 'e', -90], ['V', 'o', -90], ['V', 'a', -90], ['V', 'u', -60], ['V', 'i', -50],
          ['W', 'e', -80], ['W', 'o', -80], ['W', 'a', -80], ['W', 'u', -50], ['W', 'i', -40],
          ['Y', 'e', -110], ['Y', 'o', -110], ['Y', 'a', -110], ['Y', 'u', -70], ['Y', 'i', -60],
          // Tucks under F and P
          ['F', 'e', -70], ['F', 'o', -70], ['F', 'a', -70], ['F', 'r', -60],
          ['P', 'e', -40], ['P', 'o', -40], ['P', 'a', -40],
          // Overhanging lowercase 'r'
          ['r', 'a', -40], ['r', 'e', -40], ['r', 'o', -40], ['r', 'c', -40], ['r', 'q', -40]
        ];

        standardKerning.forEach(([leftChar, rightChar, value]) => {
          const leftGlyph = glyphArray.find(g => g.name === leftChar);
          const rightGlyph = glyphArray.find(g => g.name === rightChar);
          
          if (leftGlyph && rightGlyph) {
            const leftIdx = glyphArray.indexOf(leftGlyph);
            const rightIdx = glyphArray.indexOf(rightGlyph);
            // This overwrites the global rule with the specific extreme value
            font.kerningPairs[`${leftIdx},${rightIdx}`] = Math.round(value * normalizeScale);
          }
        });

        try {
          const blob = new Blob([font.toArrayBuffer()], { type: 'font/otf' });
          const url = URL.createObjectURL(blob);
          
          // Generate a unique family name for this specific build to prevent browser font fallback caching
          const uniqueFamilyName = `${fontMetadata.family || 'TypeForge'}-${Date.now()}`;
          
          setFontUrl(prev => {
            if (prev?.url) {
              URL.revokeObjectURL(prev.url);
            }
            
            const fontFace = new FontFace(uniqueFamilyName, `url(${url})`);
            fontFace.load().then(() => {
              // Clean up old fonts with similar names from this session
              document.fonts.forEach(f => {
                if (f.family.startsWith(fontMetadata.family || 'TypeForge')) {
                  document.fonts.delete(f);
                }
              });
              document.fonts.add(fontFace);
            }).catch(e => console.error('Failed to load font face:', e));
            
            return { name: uniqueFamilyName, url };
          });
        } catch (err) {
          console.error('Font generation failed:', err);
        }
      };

      generateFont();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [glyphs, fontMetadata, otLoaded, setFontUrl, strokeWidth, charRotation, defaultLeftGuidePos, defaultRightGuidePos, charBearings]);
};