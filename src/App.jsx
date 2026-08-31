import React, { useRef, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MobileBottomBar from './components/MobileBottomBar';
import IntroModal from './components/IntroModal';
import PreviewModal from './components/PreviewModal';
import Settings from './components/Settings';
import MetadataModal from './components/MetadataModal';
import ScannerModal from './components/ScannerModal';
import PaperSetup from './components/PaperSetup';
import PaperEditor from './components/PaperEditor';
import FontTester from './components/FontTester';
import ToastContainer from './components/ToastContainer';
import TransformPanel from './components/TransformPanel';
import NewProjectModal from './components/NewProjectModal';
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
  useFontGenerator,
  useTransformGlyph
} from './hooks';

function App() {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  // Declare state first so setAppMode can reference showNewProject
  const [showNewProject, setShowNewProject] = useState(false);
  const [showTransform, setShowTransform] = React.useState(false);
  const [selectedStrokeIndex, setSelectedStrokeIndex] = React.useState(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [previewFontUrl, setPreviewFontUrl] = useState(null);
  const [charBearings, setCharBearings] = useState(() => {
    const saved = localStorage.getItem('typeForgeCharBearings');
    return saved ? JSON.parse(saved) : {};
  });

  const setAppMode = (mode) => {
    switch (mode) {
      case 'intro': navigate('/'); break;
      case 'digital': setShowNewProject(true); break;
      case 'paper-setup': navigate('/paper-setup'); break;
      case 'scanner': navigate('/scanner'); break;
      case 'paper': navigate('/paper'); break;
      case 'preview': navigate('/preview'); break;
      default: navigate('/');
    }
  };

  // State management
  const state = useAppState();
  const location = useLocation();
  const isPaperMode = location.pathname.startsWith('/paper') || location.pathname.startsWith('/scanner');
  
  const activeGlyphs = isPaperMode ? state.paperGlyphs : state.glyphs;
  const setActiveGlyphs = (newGlyphs) => {
    if (isPaperMode) {
      state.setPaperGlyphs(newGlyphs);
      localStorage.setItem('typeForgePaperGlyphs', JSON.stringify(typeof newGlyphs === 'function' ? newGlyphs(state.paperGlyphs) : newGlyphs));
    } else {
      state.setGlyphs(newGlyphs);
      localStorage.setItem('typeForgeGlyphs', JSON.stringify(typeof newGlyphs === 'function' ? newGlyphs(state.glyphs) : newGlyphs));
    }
  };

  const { addToast } = useToast(state.setToasts);
  const { getCurrentCharKey, currentCharKey } = useCharacterKey(state.activeChar, state.isUpperCase);
  const { darkMode, bgPrimary, bgSecondary, textPrimary, textSecondary, borderColor } = useTheme(state.currentTheme);
  
  // History, undo/redo
  const { currentHistory, currentHistoryIndex, updateHistory, undo, redo, clearCurrentChar } = useHistory(
    state.charHistory,
    state.charHistoryIndex,
    activeGlyphs,
    setActiveGlyphs,
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
    activeGlyphs,
    setActiveGlyphs,
    state.setIsDrawing,
    state.setCurrentStroke,
    getCurrentCharKey,
    updateHistory
  );

  // Transform actions
  const transformActions = useTransformGlyph(
    activeGlyphs,
    setActiveGlyphs,
    state.charTransformations,
    state.setCharTransformations,
    getCurrentCharKey,
    updateHistory,
    addToast
  );

  // Glyph actions (copy, paste, clear, download, export)
  const { copyGlyph, pasteGlyph, clearAllCharacters, downloadFont, exportJSON } = useGlyphActions(
    activeGlyphs,
    setActiveGlyphs,
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
    const strokes = activeGlyphs[char] || [];
    const updated = strokes.filter((_, i) => i !== index);
    const newGlyphs = { ...activeGlyphs, [char]: updated };
    setActiveGlyphs(newGlyphs);
    updateHistory(char, updated);
  };

  // Initialize opentype
  useEffect(() => {
    loadOpenType().then(() => state.setOtLoaded(true)).catch(e => console.error('Failed to load opentype.js', e));
  }, [state]);

  // Setup font generation
  useFontGenerator(
    activeGlyphs,
    state.fontMetadata,
    state.otLoaded,
    state.setFontUrl,
    state.strokeWidth,
    state.charRotation,
    state.leftGuidePos,
    state.rightGuidePos,
    charBearings
  );

  // Keyboard navigation
  useKeyboardNavigation(state.activeChar, state.setActiveChar, undo, redo, clearCurrentChar);

  return (
    <div className={`h-screen ${bgPrimary} ${textPrimary} flex flex-col font-sans transition-colors duration-300 overflow-hidden animate-fadeIn`}>
      <style>{`
        @font-face {
          font-family: '90tun';
          src: url('${process.env.PUBLIC_URL || ''}/assets/90tun.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        body.override-font-90tun * {
          font-family: '90tun', sans-serif !important;
        }
      `}</style>
      <Routes>
        <Route path="/" element={
          <IntroModal showIntro={true} setAppMode={setAppMode} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} />
        } />
        
        <Route path="/digital" element={
          <>
            <Header darkMode={darkMode} showToolbar={state.showToolbar} setShowToolbar={state.setShowToolbar} downloadFont={() => setShowMetadataModal(true)} otLoaded={state.otLoaded} glyphs={activeGlyphs} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} showSettings={state.showSettings} setShowSettings={state.setShowSettings} />
            <Toolbar showToolbar={state.showToolbar} strokeWidth={state.strokeWidth} setStrokeWidth={state.setStrokeWidth} enableSmoothing={state.enableSmoothing} setEnableSmoothing={state.setEnableSmoothing} enableSimplify={state.enableSimplify} setEnableSimplify={state.setEnableSimplify} undo={undo} redo={redo} currentHistoryIndex={currentHistoryIndex} currentHistory={currentHistory} fontMetadata={state.fontMetadata} setFontMetadata={state.setFontMetadata} exportJSON={exportJSON} downloadFont={() => setShowMetadataModal(true)} otLoaded={state.otLoaded} glyphs={activeGlyphs} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textSecondary={textSecondary} textPrimary={textPrimary} copyGlyph={copyGlyph} pasteGlyph={pasteGlyph} clipboard={state.clipboard} leftGuidePos={state.leftGuidePos} setLeftGuidePos={state.setLeftGuidePos} rightGuidePos={state.rightGuidePos} setRightGuidePos={state.setRightGuidePos} transformActions={transformActions} currentCharKey={currentCharKey} charBearings={charBearings} setCharBearings={setCharBearings} />
            <main className={`flex-1 grid grid-cols-[64px_1fr] lg:grid-cols-[280px_1fr_320px] gap-0 overflow-hidden`}>
              <LeftSidebar activeChar={state.activeChar} setActiveChar={state.setActiveChar} glyphs={activeGlyphs} fontUrl={state.fontUrl} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} />
              <Canvas svgRef={svgRef} activeChar={state.activeChar} glyphs={activeGlyphs} currentStroke={state.currentStroke} strokeWidth={state.strokeWidth} darkMode={darkMode} handleMouseDown={handleMouseDown} handleMouseMove={handleMouseMove} handleMouseUp={handleMouseUp} deleteStroke={deleteStroke} setSelectedStrokeIndex={setSelectedStrokeIndex} setShowTransform={setShowTransform} clearCurrentChar={clearCurrentChar} clearAllCharacters={clearAllCharacters} bgPrimary={bgPrimary} textSecondary={textSecondary} isUpperCase={state.isUpperCase} setIsUpperCase={state.setIsUpperCase} gridEnabled={state.gridEnabled} gridSize={state.gridSize} snapToGrid={state.snapToGrid} guidesEnabled={state.guidesEnabled} copyGlyph={copyGlyph} pasteGlyph={pasteGlyph} clipboard={state.clipboard} showPreviewModal={state.showPreviewModal} setShowPreviewModal={state.setShowPreviewModal} textPrimary={textPrimary} charRotation={state.charRotation} setCharRotation={state.setCharRotation} currentCharKey={currentCharKey} leftGuidePos={state.leftGuidePos} rightGuidePos={state.rightGuidePos} />
              <div className="hidden lg:block">
                <RightSidebar previewText={state.previewText} setPreviewText={state.setPreviewText} fontUrl={state.fontUrl} previewSizes={PREVIEW_SIZES} glyphs={activeGlyphs} activeChar={state.activeChar} otLoaded={state.otLoaded} FONT_UNITS={FONT_UNITS} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} />
              </div>
            </main>
            <MobileBottomBar activeChar={state.activeChar} setActiveChar={state.setActiveChar} otLoaded={state.otLoaded} glyphs={activeGlyphs} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} />
          </>
        } />

        <Route path="/paper-setup" element={<PaperSetup setAppMode={setAppMode} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} />} />
        
        <Route path="/scanner" element={
          <ScannerModal
            setAppMode={setAppMode}
            darkMode={darkMode}
            bgSecondary={bgSecondary}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            onExtract={(extractedGlyphs) => {
              setActiveGlyphs(prev => {
                const next = { ...prev };
                for (const char in extractedGlyphs) {
                  next[char] = extractedGlyphs[char];
                }
                return next;
              });
              setAppMode('paper');
              addToast('success', `Successfully extracted ${Object.keys(extractedGlyphs).length} characters from template!`);
            }}
          />
        } />
        
        <Route path="/paper" element={<PaperEditor glyphs={activeGlyphs} setAppMode={setAppMode} setShowMetadataModal={setShowMetadataModal} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} otLoaded={state.otLoaded} />} />
        
        <Route path="/preview" element={<FontTester setAppMode={setAppMode} darkMode={darkMode} bgSecondary={bgSecondary} borderColor={borderColor} textPrimary={textPrimary} textSecondary={textSecondary} initialFontUrl={previewFontUrl} initialFontName={state.fontMetadata?.family} />} />
      </Routes>

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

      <TransformPanel
        showTransform={showTransform}
        setShowTransform={setShowTransform}
        selectedStrokeIndex={selectedStrokeIndex}
        glyphs={activeGlyphs}
        activeChar={state.activeChar}
        isUpperCase={state.isUpperCase}
        setGlyphs={setActiveGlyphs}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        deleteStroke={deleteStroke}
      />

      <PreviewModal
        isOpen={state.showPreviewModal}
        onClose={() => state.setShowPreviewModal(false)}
        previewText={state.previewText}
        setPreviewText={state.setPreviewText}
        fontUrl={state.fontUrl}
        glyphs={activeGlyphs}
        otLoaded={state.otLoaded}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      <MetadataModal
        show={showMetadataModal}
        setShow={setShowMetadataModal}
        metadata={state.fontMetadata}
        setMetadata={state.setFontMetadata}
        onDownload={downloadFont}
        onPreview={() => {
          if (state.fontUrl?.url) {
            setPreviewFontUrl(state.fontUrl.url);
          }
          setAppMode('preview');
        }}
        darkMode={darkMode}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      <NewProjectModal
        show={showNewProject}
        onClose={() => setShowNewProject(false)}
        darkMode={darkMode}
        onStartFresh={() => {
          state.setGlyphs({});
          localStorage.removeItem('typeForgeGlyphs');
          localStorage.removeItem('typeForgeCharHistory');
          setShowNewProject(false);
          navigate('/digital');
        }}
        onImport={(data) => {
          state.setGlyphs(data.glyphs || {});
          localStorage.setItem('typeForgeGlyphs', JSON.stringify(data.glyphs || {}));
          if (data.fontMetadata) {
            state.setFontMetadata(data.fontMetadata);
            localStorage.setItem('typeForgeMetadata', JSON.stringify(data.fontMetadata));
          }
          setShowNewProject(false);
          navigate('/digital');
          addToast('Design imported successfully', 'success');
        }}
      />

      <ToastContainer toasts={state.toasts} removeToast={(id) => {
        state.setToasts(prev => prev.filter(toast => toast.id !== id));
      }} />
    </div>
  );
}

export default App;
