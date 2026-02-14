import { useState } from 'react';
import { DEFAULT_THEME } from '../utils/themes';

export const useAppState = () => {
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
  const [leftGuidePos, setLeftGuidePos] = useState(() => {
    const saved = localStorage.getItem('typeForgeLeftGuidePos');
    return saved ? parseFloat(saved) : 0.2;
  });
  const [rightGuidePos, setRightGuidePos] = useState(() => {
    const saved = localStorage.getItem('typeForgeRightGuidePos');
    return saved ? parseFloat(saved) : 0.8;
  });

  return {
    glyphs, setGlyphs,
    activeChar, setActiveChar,
    isUpperCase, setIsUpperCase,
    isDrawing, setIsDrawing,
    currentStroke, setCurrentStroke,
    previewText, setPreviewText,
    fontUrl, setFontUrl,
    showIntro, setShowIntro,
    otLoaded, setOtLoaded,
    currentTheme, setCurrentTheme,
    strokeWidth, setStrokeWidth,
    enableSmoothing, setEnableSmoothing,
    enableSimplify, setEnableSimplify,
    charHistory, setCharHistory,
    charHistoryIndex, setCharHistoryIndex,
    fontMetadata, setFontMetadata,
    showToolbar, setShowToolbar,
    showSettings, setShowSettings,
    clipboard, setClipboard,
    toasts, setToasts,
    pendingClearAll, setPendingClearAll,
    showPreviewModal, setShowPreviewModal,
    charRotation, setCharRotation,
    gridEnabled, setGridEnabled,
    gridSize, setGridSize,
    snapToGrid, setSnapToGrid,
    guidesEnabled, setGuidesEnabled,
    smoothingStrength, setSmothingStrength,
    simplifyTolerance, setSimplifyTolerance,
    leftGuidePos, setLeftGuidePos,
    rightGuidePos, setRightGuidePos,
  };
};
