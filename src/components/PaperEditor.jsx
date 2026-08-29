import React from 'react';
import { ALPHABET, CANVAS_SIZE } from '../utils/constants';
import { Download, ArrowLeft } from 'lucide-react';

export default function PaperEditor({
  glyphs,
  setAppMode,
  setShowMetadataModal,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
  otLoaded
}) {
  
  // Calculate how many characters were successfully extracted
  const extractedCount = ALPHABET.filter(char => glyphs[char] && glyphs[char].length > 0).length;

  return (
    <div className={`flex flex-col h-full w-full bg-gray-100 ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} overflow-hidden animate-fadeIn`}>
      
      {/* HEADER */}
      <header className={`flex items-center justify-between p-3 sm:p-6 border-b ${borderColor} ${bgSecondary} shrink-0 shadow-sm z-10 gap-2`}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setAppMode('scanner')}
            className={`p-1.5 sm:p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition shrink-0`}
            title="Back to start"
          >
            <ArrowLeft className={textSecondary} size={20} />
          </button>
          <div className="min-w-0">
            <h1 className={`text-base sm:text-xl font-bold ${textPrimary} truncate`}>Template Extractor</h1>
            <p className={`text-xs sm:text-sm ${textSecondary} truncate`}>{extractedCount} / {ALPHABET.length} Characters Extracted</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowMetadataModal(true)}
            disabled={!otLoaded || extractedCount < ALPHABET.length}
            title={extractedCount < ALPHABET.length ? "Please extract all characters before building" : "Build Font"}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base`}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Build Font</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* GRID CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-4 pb-20">
            {ALPHABET.map((char) => {
              const charGlyphs = glyphs[char] || [];
              const hasGlyph = charGlyphs.length > 0;
              
              return (
                <div 
                  key={char} 
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all ${
                    hasGlyph 
                      ? `${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} shadow-sm` 
                      : `${darkMode ? 'bg-black/20 border-gray-800/50' : 'bg-gray-50/50 border-gray-200/50'}`
                  }`}
                >
                  <span className={`absolute top-1 left-1.5 sm:top-2 sm:left-2 text-[10px] sm:text-xs font-bold ${hasGlyph ? textSecondary : 'text-gray-400 opacity-30'}`}>
                    {char}
                  </span>
                  
                  {hasGlyph ? (
                    <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className="w-4/5 h-4/5 mt-3 sm:mt-4">
                      {charGlyphs.map((stroke, index) => {
                        if (!stroke.points || stroke.points.length === 0) return null;
                        
                        return stroke.isOutline ? (
                          <polygon
                            key={index}
                            points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill={darkMode ? 'white' : 'black'}
                          />
                        ) : (
                          <polyline
                            key={index}
                            points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke={darkMode ? 'white' : 'black'}
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })}
                    </svg>
                  ) : (
                    <span className="text-gray-400 opacity-20 font-bold text-2xl sm:text-4xl mt-3 sm:mt-4">
                      {char}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

