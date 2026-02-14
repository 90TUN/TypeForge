import React, { useRef, useEffect } from 'react';
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
import { loadOpenType } from './utils/drawing';
import { PREVIEW_SIZES, FONT_UNITS } from './utils/constants';
import {
  useAppState,
  useTheme,
  useToast,
  useCharacterKey,
  useDrawingActions,
  useHistory,
  useGlyphActions,
  useKeyboardNavigation,
  useFontGenerator
} from './hooks';

function App() {
  const svgRef = useRef(null);
  
  // State management
  const state = useAppState();
  const { addToast } = useToast(state.setToasts);
  const { getCurrentCharKey, currentCharKey } = useCharacterKey(state.activeChar, state.isUpperCase);
  const { darkMode, bgPrimary, bgSecondary, textPrimary, textSecondary, borderColor } = useTheme(state.currentTheme);
  
  // History, undo/redo
  const { currentHistory, currentHistoryIndex, updateHistory, undo, redo, clearCurrentChar } = useHistory(
    state.charHistory,
    state.charHistoryIndex,
    state.glyphs,
    state.setGlyphs,
    state.setCharHistory,
    state.setCharHistoryIndex,
    getCurrentCharKey,
    addToast,
    state.setCharRotation
  );

  // Drawing actions
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useDrawingActions(
    svgRef,
    state.isDrawing,
    state.enableSmoothing,
    state.enableSimplify,
    state.glyphs,
    state.setGlyphs,
    state.setIsDrawing,
    state.setCurrentStroke,
    getCurrentCharKey,
    updateHistory
  );

  // Glyph actions (copy, paste, clear, download, export)
  const { copyGlyph, pasteGlyph, clearAllCharacters, downloadFont, exportJSON } = useGlyphActions(
    state.glyphs,
    state.setGlyphs,
    state.fontUrl,
    state.fontMetadata,
    state.clipboard,
    state.setClipboard,
    state.pendingClearAll,
    state.setPendingClearAll,
    getCurrentCharKey,
    updateHistory,
    addToast
  );

  // Delete stroke helper
  const deleteStroke = (char, index) => {
    const strokes = state.glyphs[char] || [];
    const updated = strokes.filter((_, i) => i !== index);
    const newGlyphs = { ...state.glyphs, [char]: updated };
    state.setGlyphs(newGlyphs);
    updateHistory(char, updated);
  };

  // Initialize opentype
  useEffect(() => {
    loadOpenType().then(() => state.setOtLoaded(true)).catch(e => console.error('Failed to load opentype.js', e));
  }, [state]);

  // Font generation
  useFontGenerator(state.glyphs, state.fontMetadata, state.otLoaded, state.setFontUrl, state.strokeWidth);

  // Keyboard navigation
  useKeyboardNavigation(state.activeChar, state.setActiveChar, undo, redo, clearCurrentChar);

  return (
    <div className={`h-screen ${bgPrimary} ${textPrimary} flex flex-col font-sans transition-colors duration-300 overflow-hidden animate-fadeIn`}>
      <Header
        darkMode={darkMode}
        showToolbar={state.showToolbar}
        setShowToolbar={state.setShowToolbar}
        downloadFont={downloadFont}
        otLoaded={state.otLoaded}
        glyphs={state.glyphs}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        showSettings={state.showSettings}
        setShowSettings={state.setShowSettings}
      />

      <Toolbar
        showToolbar={state.showToolbar}
        strokeWidth={state.strokeWidth}
        setStrokeWidth={state.setStrokeWidth}
        enableSmoothing={state.enableSmoothing}
        setEnableSmoothing={state.setEnableSmoothing}
        enableSimplify={state.enableSimplify}
        setEnableSimplify={state.setEnableSimplify}
        undo={undo}
        redo={redo}
        currentHistoryIndex={currentHistoryIndex}
        currentHistory={currentHistory}
        fontMetadata={state.fontMetadata}
        setFontMetadata={state.setFontMetadata}
        exportJSON={exportJSON}
        downloadFont={downloadFont}
        otLoaded={state.otLoaded}
        glyphs={state.glyphs}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textSecondary={textSecondary}
        textPrimary={textPrimary}
        clearAllCharacters={clearAllCharacters}
        copyGlyph={copyGlyph}
        pasteGlyph={pasteGlyph}
        clipboard={state.clipboard}
        leftGuidePos={state.leftGuidePos}
        setLeftGuidePos={state.setLeftGuidePos}
        rightGuidePos={state.rightGuidePos}
        setRightGuidePos={state.setRightGuidePos}
      />

      <main className={`flex-1 grid grid-cols-[60px_1fr] lg:grid-cols-[280px_1fr_320px] gap-0 overflow-hidden`}>
        <LeftSidebar
          activeChar={state.activeChar}
          setActiveChar={state.setActiveChar}
          glyphs={state.glyphs}
          fontUrl={state.fontUrl}
          darkMode={darkMode}
          bgSecondary={bgSecondary}
          borderColor={borderColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />

        <Canvas
          svgRef={svgRef}
          activeChar={state.activeChar}
          glyphs={state.glyphs}
          currentStroke={state.currentStroke}
          strokeWidth={state.strokeWidth}
          darkMode={darkMode}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          deleteStroke={deleteStroke}
          clearCurrentChar={clearCurrentChar}
          bgPrimary={bgPrimary}
          textSecondary={textSecondary}
          isUpperCase={state.isUpperCase}
          setIsUpperCase={state.setIsUpperCase}
          gridEnabled={state.gridEnabled}
          gridSize={state.gridSize}
          snapToGrid={state.snapToGrid}
          guidesEnabled={state.guidesEnabled}
          copyGlyph={copyGlyph}
          pasteGlyph={pasteGlyph}
          clipboard={state.clipboard}
          showPreviewModal={state.showPreviewModal}
          setShowPreviewModal={state.setShowPreviewModal}
          textPrimary={textPrimary}
          charRotation={state.charRotation}
          setCharRotation={state.setCharRotation}
          currentCharKey={currentCharKey}
          leftGuidePos={state.leftGuidePos}
          rightGuidePos={state.rightGuidePos}
        />

        <RightSidebar
          previewText={state.previewText}
          setPreviewText={state.setPreviewText}
          fontUrl={state.fontUrl}
          previewSizes={PREVIEW_SIZES}
          glyphs={state.glyphs}
          activeChar={state.activeChar}
          otLoaded={state.otLoaded}
          FONT_UNITS={FONT_UNITS}
          darkMode={darkMode}
          bgSecondary={bgSecondary}
          borderColor={borderColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      </main>

      <MobileBottomBar
        activeChar={state.activeChar}
        setActiveChar={state.setActiveChar}
        downloadFont={downloadFont}
        otLoaded={state.otLoaded}
        glyphs={state.glyphs}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
      />

      <IntroModal
        showIntro={state.showIntro}
        setShowIntro={state.setShowIntro}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      <Settings
        showSettings={state.showSettings}
        setShowSettings={state.setShowSettings}
        currentTheme={state.currentTheme}
        setCurrentTheme={state.setCurrentTheme}
        gridEnabled={state.gridEnabled}
        setGridEnabled={state.setGridEnabled}
        gridSize={state.gridSize}
        setGridSize={state.setGridSize}
        snapToGrid={state.snapToGrid}
        setSnapToGrid={state.setSnapToGrid}
        guidesEnabled={state.guidesEnabled}
        setGuidesEnabled={state.setGuidesEnabled}
        smoothingStrength={state.smoothingStrength}
        setSmothingStrength={state.setSmothingStrength}
        simplifyTolerance={state.simplifyTolerance}
        setSimplifyTolerance={state.setSimplifyTolerance}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      <PreviewModal
        isOpen={state.showPreviewModal}
        onClose={() => state.setShowPreviewModal(false)}
        previewText={state.previewText}
        setPreviewText={state.setPreviewText}
        fontUrl={state.fontUrl}
        glyphs={state.glyphs}
        otLoaded={state.otLoaded}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      <ToastContainer toasts={state.toasts} removeToast={(id) => {
        state.setToasts(prev => prev.filter(toast => toast.id !== id));
      }} />
    </div>
  );
}

export default App;

