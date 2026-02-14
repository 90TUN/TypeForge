import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MobileBottomBar from './components/MobileBottomBar';
import IntroModal from './components/IntroModal';
import PreviewModal from './components/PreviewModal';
import Settings from './components/Settings';
import ToastContainer from './components/ToastContainer';
import { loadOpenType, smoothStroke, simplifyPath } from './utils/drawing';
import { ALPHABET, CANVAS_SIZE, BASELINE_RATIO, SCALE, FONT_UNITS, PREVIEW_SIZES } from './utils/constants';
import { THEMES, DEFAULT_THEME } from './utils/themes';


function App() {
  // --- STATE ---
  const [glyphs, setGlyphs] = useState(() => {
    const saved = localStorage.getItem('typeForgeGlyphs');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeChar, setActiveChar] = useState('A');
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [previewText, setPreviewText] = useState(() => {
    const saved = localStorage.getItem('typeForgePreviewText');
    return saved || 'TypeForge';
  });
  const [fontUrl, setFontUrl] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    const seen = localStorage.getItem('typeForgeIntroSeen');
    return !seen;
  });
  const [otLoaded, setOtLoaded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('typeForgeTheme');
    return saved || DEFAULT_THEME;
  });
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [enableSmoothing, setEnableSmoothing] = useState(false);
  const [enableSimplify, setEnableSimplify] = useState(true);
  const [charHistory, setCharHistory] = useState(() => {
    const saved = localStorage.getItem('typeForgeCharHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [charHistoryIndex, setCharHistoryIndex] = useState({});
  const [fontMetadata, setFontMetadata] = useState(() => {
    const saved = localStorage.getItem('typeForgeMetadata');
    return saved ? JSON.parse(saved) : { family: 'MyFont', version: '1.0', author: '', copyright: '' };
  });
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pendingClearAll, setPendingClearAll] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [charRotation, setCharRotation] = useState(() => {
    const saved = localStorage.getItem('typeForgeCharRotation');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Settings
  const [gridEnabled, setGridEnabled] = useState(() => {
    const saved = localStorage.getItem('typeForgeGridEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [gridSize, setGridSize] = useState(() => {
    const saved = localStorage.getItem('typeForgeGridSize');
    return saved ? parseInt(saved) : 25;
  });
  const [snapToGrid, setSnapToGrid] = useState(() => {
    const saved = localStorage.getItem('typeForgeSnapToGrid');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [guidesEnabled, setGuidesEnabled] = useState(() => {
    const saved = localStorage.getItem('typeForgeGuidesEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [smoothingStrength, setSmothingStrength] = useState(() => {
    const saved = localStorage.getItem('typeForgeSmoothingStrength');
    return saved ? parseInt(saved) : 3;
  });
  const [simplifyTolerance, setSimplifyTolerance] = useState(() => {
    const saved = localStorage.getItem('typeForgeSimplifyTolerance');
    return saved ? parseFloat(saved) : 2.0;
  });
  
  const svgRef = useRef(null);

  // Get history for current character (will be updated after callbacks are defined)
  // Placeholder - will be computed after getCurrentCharKey is defined
  let currentCharKey = '';
  let currentHistory = [{}];
  let currentHistoryIndex = 0;

  // --- THEME SYSTEM ---
  const darkMode = currentTheme === 'dark' || currentTheme === 'nord' || currentTheme === 'dracula' || currentTheme === 'gruvbox';
  const theme = THEMES[currentTheme] || THEMES[DEFAULT_THEME];
  const bgPrimary = theme.bgPrimary;
  const bgSecondary = theme.bgSecondary;
  const textPrimary = theme.textPrimary;
  const textSecondary = theme.textSecondary;
  const borderColor = theme.borderColor;

  // --- EFFECTS ---
  useEffect(() => {
    loadOpenType().then(() => setOtLoaded(true)).catch(e => console.error('Failed to load opentype.js', e));
  }, []);

  useEffect(() => {
    localStorage.setItem('typeForgeGlyphs', JSON.stringify(glyphs));
  }, [glyphs]);

  useEffect(() => {
    localStorage.setItem('typeForgeCharHistory', JSON.stringify(charHistory));
  }, [charHistory]);

  useEffect(() => {
    localStorage.setItem('typeForgeMetadata', JSON.stringify(fontMetadata));
  }, [fontMetadata]);

  useEffect(() => {
    localStorage.setItem('typeForgeCharRotation', JSON.stringify(charRotation));
  }, [charRotation]);

  useEffect(() => {
    localStorage.setItem('typeForgeTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('typeForgeGridEnabled', JSON.stringify(gridEnabled));
  }, [gridEnabled]);

  useEffect(() => {
    localStorage.setItem('typeForgeGridSize', gridSize.toString());
  }, [gridSize]);

  useEffect(() => {
    localStorage.setItem('typeForgeSnapToGrid', JSON.stringify(snapToGrid));
  }, [snapToGrid]);

  useEffect(() => {
    localStorage.setItem('typeForgeGuidesEnabled', JSON.stringify(guidesEnabled));
  }, [guidesEnabled]);

  useEffect(() => {
    localStorage.setItem('typeForgeSmoothingStrength', smoothingStrength.toString());
  }, [smoothingStrength]);

  useEffect(() => {
    localStorage.setItem('typeForgeSimplifyTolerance', simplifyTolerance.toString());
  }, [simplifyTolerance]);

  useEffect(() => {
    localStorage.setItem('typeForgePreviewText', previewText);
  }, [previewText]);

  // Font generation effect
  useEffect(() => {
    if (!otLoaded) return;
    
    // Helper function to create stroke outline from points
    const createStrokeOutline = (points, strokeWidth, scale) => {
      if (points.length < 2) return null;

      const path = new (window.opentype?.Path || require('opentype.js').Path)();
      const scaledWidth = strokeWidth * scale;
      
      // Convert stroke to outline by creating left and right edges
      const leftEdge = [];
      const rightEdge = [];

      for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const y = CANVAS_SIZE * BASELINE_RATIO - curr.y;
        const x = curr.x;
        
        // Get direction vector
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

        // Normalize direction
        const len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len > 0) {
          dirX /= len;
          dirY /= len;
        }

        // Perpendicular offset for stroke width
        const perpX = -dirY * scaledWidth / 2;
        const perpY = dirX * scaledWidth / 2;

        leftEdge.push({ x: x * scale + perpX, y: y * scale + perpY });
        rightEdge.push({ x: x * scale - perpX, y: y * scale - perpY });
      }

      // Draw left edge forward
      if (leftEdge.length > 0) {
        path.moveTo(leftEdge[0].x, leftEdge[0].y);
        for (let i = 1; i < leftEdge.length; i++) {
          path.lineTo(leftEdge[i].x, leftEdge[i].y);
        }
      }

      // Draw right edge backward to close shape
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
      
      // Build glyphs array - only include characters with actual strokes
      const glyphArray = [];
      const notdefGlyph = new ot.Glyph({ name: '.notdef', advanceWidth: 600 });
      const spaceGlyph = new ot.Glyph({ name: 'space', unicode: 32, advanceWidth: 250 });
      
      glyphArray.push(notdefGlyph);
      glyphArray.push(spaceGlyph);

      // Process each character
      ALPHABET.forEach(char => {
        const strokes = glyphs[char];
        
        // Only create glyph if character has strokes
        if (!strokes || strokes.length === 0) return;

        const path = new ot.Path();
        let hasValidPath = false;

        // Build path from strokes using stroke outlines
        strokes.forEach(stroke => {
          if (!stroke.points || stroke.points.length < 2) return;

          const points = stroke.points;
          const strokeOutline = createStrokeOutline(points, strokeWidth, SCALE);
          
          if (strokeOutline) {
            // Append outline to main path
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

        // Only add glyph if it has valid path data
        if (hasValidPath) {
          glyphArray.push(new ot.Glyph({
            name: char,
            unicode: char.charCodeAt(0),
            advanceWidth: 800,
            path
          }));
        }
      });

      // Create and register font
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
        
        // Remove old font if it exists
        if (fontUrl?.url) {
          URL.revokeObjectURL(fontUrl.url);
        }
        
        const fontFace = new FontFace(fontMetadata.family, `url(${url})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        setFontUrl({ name: fontMetadata.family, url });
      } catch (err) {
        console.error('Font generation failed:', err);
      }
    };

    generateFont();
  }, [glyphs, fontMetadata, otLoaded, fontUrl, strokeWidth]);

  // --- TOAST HELPER (Needed early for other functions) ---
  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // --- CHARACTER KEY HELPER ---
  const getCurrentCharKey = useCallback(() => {
    return /^[A-Za-z]$/.test(activeChar)
      ? (isUpperCase ? activeChar.toUpperCase() : activeChar.toLowerCase())
      : activeChar;
  }, [activeChar, isUpperCase]);

  // Compute current character history values
  currentCharKey = getCurrentCharKey();
  currentHistory = charHistory[currentCharKey] || [{}];
  currentHistoryIndex = charHistoryIndex[currentCharKey] ?? 0;

  // --- HISTORY (Per-Character) ---
  const updateHistory = useCallback((charKey, newCharGlyphs) => {
    setCharHistory(prev => {
      const updated = { ...prev };
      const history = updated[charKey] || [null]; // null = empty state
      const currentIndex = charHistoryIndex[charKey] ?? 0;
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newCharGlyphs);
      updated[charKey] = newHistory;
      return updated;
    });
    setCharHistoryIndex(prev => ({
      ...prev,
      [charKey]: (charHistory[charKey]?.length ?? 1)
    }));
  }, [charHistory, charHistoryIndex]);

  const undo = useCallback(() => {
    const charKey = getCurrentCharKey();
    const history = charHistory[charKey] || [{}];
    const index = charHistoryIndex[charKey] ?? 0;
    
    if (index > 0) {
      const newIndex = index - 1;
      setCharHistoryIndex(prev => ({ ...prev, [charKey]: newIndex }));
      const previousState = history[newIndex];
      setGlyphs(prev => ({ ...prev, [charKey]: previousState }));
      addToast(`Undo: '${charKey}'`, 'info');
    }
  }, [charHistory, charHistoryIndex, getCurrentCharKey, addToast]);

  const redo = useCallback(() => {
    const charKey = getCurrentCharKey();
    const history = charHistory[charKey] || [{}];
    const index = charHistoryIndex[charKey] ?? 0;
    
    if (index < history.length - 1) {
      const newIndex = index + 1;
      setCharHistoryIndex(prev => ({ ...prev, [charKey]: newIndex }));
      const nextState = history[newIndex];
      setGlyphs(prev => ({ ...prev, [charKey]: nextState }));
      addToast(`Redo: '${charKey}'`, 'info');
    }
  }, [charHistory, charHistoryIndex, getCurrentCharKey, addToast]);

  const clearCurrentChar = useCallback(() => {
    const finalKey = getCurrentCharKey();
    const newGlyphs = { ...glyphs };
    delete newGlyphs[finalKey];
    setGlyphs(newGlyphs);
    updateHistory(finalKey, []);
    setCharRotation(prev => ({ ...prev, [finalKey]: 0 }));
    addToast(`Cleared character '${finalKey}'`, 'success');
  }, [glyphs, getCurrentCharKey, updateHistory, addToast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const charIndex = ALPHABET.indexOf(activeChar);
      
      if (e.key.match(/^[A-Za-z0-9!@#$%^&*()\\-_=+\\[\\]{}|;:'",.<?\/~`]$/)) {
        const char = e.key.toUpperCase();
        if (ALPHABET.includes(char)) {
          e.preventDefault();
          setActiveChar(char);
        }
      }
      
      if (e.key === 'ArrowRight' && charIndex < ALPHABET.length - 1) {
        setActiveChar(ALPHABET[charIndex + 1]);
      }
      if (e.key === 'ArrowLeft' && charIndex > 0) {
        setActiveChar(ALPHABET[charIndex - 1]);
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete') {
        clearCurrentChar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChar, charHistory, charHistoryIndex, undo, redo, clearCurrentChar]);

  // --- MOUSE EVENTS ---
  const getMousePos = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    // Use SVG's built-in coordinate transformation for perfect accuracy
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const screenCTM = svgRef.current.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };
    
    const svgCoords = point.matrixTransform(screenCTM.inverse());
    return { x: svgCoords.x, y: svgCoords.y };
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setCurrentStroke([getMousePos(e)]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    setCurrentStroke(prev => [...prev, getMousePos(e)]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentStroke.length <= 1) {
      setIsDrawing(false);
      return;
    }

    let stroke = currentStroke;
    if (enableSmoothing) stroke = smoothStroke(stroke);
    if (enableSimplify) stroke = simplifyPath(stroke, 2.0);

    const finalKey = getCurrentCharKey();
    
    const updated = { ...glyphs, [finalKey]: [...(glyphs[finalKey] || []), { points: stroke }] };
    setGlyphs(updated);
    updateHistory(finalKey, updated[finalKey]);
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  // --- ACTIONS ---
  const deleteStroke = (char, index) => {
    const strokes = glyphs[char] || [];
    const updated = strokes.filter((_, i) => i !== index);
    const newGlyphs = { ...glyphs, [char]: updated };
    setGlyphs(newGlyphs);
    updateHistory(char, updated);
  };

  const clearAllCharacters = () => {
    if (!pendingClearAll) {
      setPendingClearAll(true);
      addToast('Click "Clear All" again to confirm - this cannot be undone', 'warning', 5000);
      return;
    }
    setGlyphs({});
    setCharHistory({});
    setCharHistoryIndex({});
    setPreviewText('TypeForge');
    setPendingClearAll(false);
    addToast('All characters cleared', 'warning');
  };

  const copyGlyph = () => {
    const finalKey = getCurrentCharKey();
    const strokes = glyphs[finalKey] || [];
    if (strokes.length === 0) {
      addToast('Nothing to copy - draw some strokes first', 'warning');
      return;
    }
    setClipboard({ strokes, sourceChar: finalKey });
    addToast(`Copied ${strokes.length} stroke(s) from '${finalKey}'`, 'success');
  };

  const pasteGlyph = () => {
    if (!clipboard || clipboard.strokes.length === 0) {
      addToast('Clipboard is empty', 'info');
      return;
    }
    const finalKey = getCurrentCharKey();
    const newCharGlyphs = [...(glyphs[finalKey] || []), ...clipboard.strokes];
    const updated = { ...glyphs, [finalKey]: newCharGlyphs };
    setGlyphs(updated);
    updateHistory(finalKey, newCharGlyphs);
    addToast(`Pasted ${clipboard.strokes.length} stroke(s) to '${finalKey}'`, 'success');
  };

  const downloadFont = async () => {
    if (!fontUrl) {
      addToast('No font to download yet', 'info');
      return;
    }
    const link = document.createElement('a');
    link.href = fontUrl.url;
    link.download = `${fontMetadata.family}.otf`;
    link.click();
    addToast(`Downloaded ${fontMetadata.family}.otf`, 'success');
  };

  const exportJSON = () => {
    const data = { glyphs, fontMetadata };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'typeforge-design.json';
    link.click();
    addToast('Design exported to JSON', 'success');
  };

  return (
    <div className={`h-screen ${bgPrimary} ${textPrimary} flex flex-col font-sans transition-colors duration-300 overflow-hidden animate-fadeIn`}>
      <Header {...{
        darkMode, showToolbar, setShowToolbar,
        downloadFont, otLoaded, glyphs, bgSecondary, borderColor, textPrimary,
        showSettings, setShowSettings
      }} />

      <Toolbar {...{
        showToolbar, strokeWidth, setStrokeWidth, enableSmoothing, setEnableSmoothing,
        enableSimplify, setEnableSimplify, undo, redo, currentHistoryIndex, currentHistory,
        fontMetadata, setFontMetadata, exportJSON, downloadFont, otLoaded, glyphs,
        darkMode, bgSecondary, borderColor, textSecondary, textPrimary,
        clearAllCharacters, copyGlyph, pasteGlyph, clipboard
      }} />

      <main className={`flex-1 grid grid-cols-[60px_1fr] lg:grid-cols-[280px_1fr_320px] gap-0 overflow-hidden`}>
        <LeftSidebar {...{
          activeChar, setActiveChar, glyphs,
          fontUrl, darkMode, bgSecondary, borderColor, textPrimary, textSecondary
        }} />

        <Canvas {...{
          svgRef, activeChar, glyphs, currentStroke, strokeWidth, darkMode,
          handleMouseDown, handleMouseMove, handleMouseUp, deleteStroke, clearCurrentChar,
          bgPrimary, textSecondary, isUpperCase, setIsUpperCase,
          gridEnabled, gridSize, snapToGrid, guidesEnabled, copyGlyph, pasteGlyph, clipboard,
          showPreviewModal, setShowPreviewModal, textPrimary,
          charRotation, setCharRotation, currentCharKey
        }} />

        <RightSidebar {...{
          previewText, setPreviewText, fontUrl, previewSizes: PREVIEW_SIZES,
          glyphs, activeChar, otLoaded, FONT_UNITS, darkMode,
          bgSecondary, borderColor, textPrimary, textSecondary
        }} />
      </main>

      <MobileBottomBar {...{
        activeChar, setActiveChar, downloadFont, otLoaded, glyphs,
        darkMode, bgSecondary, borderColor
      }} />

      <IntroModal {...{
        showIntro, setShowIntro, darkMode, bgSecondary, borderColor, textPrimary, textSecondary
      }} />

      <Settings {...{
        showSettings, setShowSettings, currentTheme, setCurrentTheme,
        gridEnabled, setGridEnabled, gridSize, setGridSize, snapToGrid, setSnapToGrid,
        guidesEnabled, setGuidesEnabled, smoothingStrength, setSmothingStrength,
        simplifyTolerance, setSimplifyTolerance, darkMode, bgSecondary, borderColor,
        textPrimary, textSecondary
      }} />

      <PreviewModal {...{
        isOpen: showPreviewModal,
        onClose: () => setShowPreviewModal(false),
        previewText, setPreviewText,
        fontUrl, glyphs, otLoaded, darkMode,
        bgSecondary, borderColor, textPrimary, textSecondary
      }} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
