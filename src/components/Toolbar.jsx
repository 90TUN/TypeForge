import React from 'react';
import { RotateCcw, RotateCw, Wand2, Scissors, Download, FileJson, AlertCircle, Copy, Clipboard } from 'lucide-react';

export default function Toolbar({
  showToolbar,
  strokeWidth,
  setStrokeWidth,
  enableSmoothing,
  setEnableSmoothing,
  enableSimplify,
  setEnableSimplify,
  undo,
  redo,
  currentHistoryIndex,
  currentHistory,
  fontMetadata,
  setFontMetadata,
  exportJSON,
  downloadFont,
  otLoaded,
  glyphs,
  clearAllCharacters,
  darkMode,
  bgSecondary,
  borderColor,
  textSecondary,
  textPrimary,
  copyGlyph,
  pasteGlyph,
  clipboard,
  leftGuidePos,
  setLeftGuidePos,
  rightGuidePos,
  setRightGuidePos
}) {
  if (!showToolbar) return null;

  const sectionBg = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const buttonBase = `h-8 rounded-md transition-all duration-200 flex items-center justify-center gap-1 hover:scale-105 active:scale-95`;
  const buttonPrimary = `${buttonBase} px-2 text-sm font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/50' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30'}`;
  const buttonSecondary = `${buttonBase} px-2 text-sm font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 hover:shadow-lg hover:shadow-gray-600/50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 hover:shadow-lg hover:shadow-gray-300/50'}`;
  const buttonDanger = `${buttonBase} px-2 text-sm font-medium ${darkMode ? 'bg-red-700 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/50' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30'}`;
  
  return (
    <div className={`border-b ${borderColor} ${bgSecondary} px-3 sm:px-6 py-2 max-h-28 overflow-y-auto transition-colors shrink-0`}>
      <div className="flex flex-wrap gap-4 items-center">
        
        {/* DRAWING SETTINGS */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${sectionBg} border ${borderColor}`}>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Stroke</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-24 cursor-pointer h-1.5 accent-blue-500"
              />
              <span className={`text-xs font-bold ${textSecondary} w-6`}>{strokeWidth}px</span>
            </div>
          </div>
        </div>

        {/* VERTICAL GUIDES */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${sectionBg} border ${borderColor}`}>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Guides</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.05"
                max="0.45"
                step="0.05"
                value={leftGuidePos}
                onChange={(e) => {
                  const newVal = parseFloat(e.target.value);
                  if (newVal < rightGuidePos - 0.1) setLeftGuidePos(newVal);
                  localStorage.setItem('typeForgeLeftGuidePos', newVal);
                }}
                className="w-20 cursor-pointer h-1.5 accent-purple-500"
                title="Left guide position"
              />
              <span className={`text-xs font-bold ${textSecondary} w-12`}>{(leftGuidePos * 100).toFixed(0)}% - {(rightGuidePos * 100).toFixed(0)}%</span>
              <input
                type="range"
                min="0.55"
                max="0.95"
                step="0.05"
                value={rightGuidePos}
                onChange={(e) => {
                  const newVal = parseFloat(e.target.value);
                  if (newVal > leftGuidePos + 0.1) setRightGuidePos(newVal);
                  localStorage.setItem('typeForgeRightGuidePos', newVal);
                }}
                className="w-20 cursor-pointer h-1.5 accent-purple-500"
                title="Right guide position"
              />
            </div>
          </div>
        </div>

        {/* EFFECTS */}
        <div className={`flex gap-2`}>
          <button
            onClick={() => setEnableSmoothing(!enableSmoothing)}
            className={`${enableSmoothing ? buttonPrimary : buttonSecondary}`}
            title="Smooth strokes"
          >
            <Wand2 size={16} />
            <span className="hidden sm:inline text-xs">Smooth</span>
          </button>
          <button
            onClick={() => setEnableSimplify(!enableSimplify)}
            className={`${enableSimplify ? buttonPrimary : buttonSecondary}`}
            title="Simplify paths"
          >
            <Scissors size={16} />
            <span className="hidden sm:inline text-xs">Simplify</span>
          </button>
        </div>

        {/* HISTORY */}
        <div className={`flex gap-1.5 px-2 py-1 rounded-lg ${sectionBg} border ${borderColor}`}>
          <button
            onClick={undo}
            disabled={currentHistoryIndex <= 0}
            className={`${buttonSecondary} disabled:opacity-40`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={redo}
            disabled={currentHistoryIndex >= currentHistory.length - 1}
            className={`${buttonSecondary} disabled:opacity-40`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* FONT METADATA */}
        <input
          type="text"
          value={fontMetadata.family}
          onChange={(e) => setFontMetadata({...fontMetadata, family: e.target.value})}
          placeholder="Font Family"
          maxLength="20"
          className={`px-3 py-1.5 text-xs rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-800' : 'bg-white'} ${textPrimary} outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
        />

        {/* COPY/PASTE */}
        <div className={`flex gap-1.5`}>
          <button
            onClick={copyGlyph}
            className={`${buttonSecondary}`}
            title="Copy current character strokes"
          >
            <Copy size={16} />
            <span className="hidden sm:inline text-xs">Copy</span>
          </button>
          <button 
            onClick={pasteGlyph}
            disabled={!clipboard}
            className={`${buttonSecondary} disabled:opacity-40`}
            title="Paste strokes from clipboard"
          >
            <Clipboard size={16} />
            <span className="hidden sm:inline text-xs">Paste</span>
          </button>
        </div>

        {/* EXPORT OPTIONS */}
        <div className={`flex gap-1.5`}>
          <button
            onClick={exportJSON}
            className={`${buttonSecondary}`}
            title="Export design as JSON"
          >
            <FileJson size={16} />
            <span className="hidden sm:inline text-xs">JSON</span>
          </button>
          <button 
            onClick={downloadFont}
            disabled={!otLoaded || Object.keys(glyphs).length === 0}
            className={`${buttonPrimary} disabled:opacity-40`}
            title="Export as .otf font file"
          >
            <Download size={16} />
            <span className="hidden sm:inline text-xs">Export</span>
          </button>
        </div>

        {/* DANGER ZONE */}
        <div className={`flex gap-1.5 ml-auto`}>
          <button
            onClick={clearAllCharacters}
            className={`${buttonDanger}`}
            title="Clear all characters (requires confirmation)"
          >
            <AlertCircle size={16} />
            <span className="hidden sm:inline text-xs">Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
}
