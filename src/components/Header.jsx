import React, { memo } from 'react';
import { PenTool, Download, Settings, Menu, X } from 'lucide-react';

function Header({
  darkMode,
  showToolbar,
  setShowToolbar,
  downloadFont,
  otLoaded,
  glyphs,
  bgSecondary,
  borderColor,
  textPrimary,
  showSettings,
  setShowSettings
}) {
  return (
    <header className={`border-b ${borderColor} ${bgSecondary} px-3 sm:px-6 py-2.5 flex items-center justify-between transition-colors shrink-0`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0`}>
          <PenTool size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`text-lg sm:text-xl font-bold ${textPrimary} truncate`}>TypeForge</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <button 
          onClick={() => setShowToolbar(!showToolbar)}
          className={`p-2 ${bgSecondary} border ${borderColor} rounded-lg transition hover:opacity-75`}
          title="Toggle toolbar"
        >
          {showToolbar ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 ${bgSecondary} border ${borderColor} rounded-lg transition hover:opacity-75`}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        <button 
          onClick={downloadFont}
          disabled={!otLoaded || Object.keys(glyphs).length === 0}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-lg font-semibold text-xs sm:text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Export as .otf font file"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}

export default memo(Header);
