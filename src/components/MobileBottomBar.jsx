import React from 'react';
import { ALPHABET } from '../utils/constants';

export default function MobileBottomBar({
  activeChar,
  setActiveChar,
  downloadFont,
  otLoaded,
  glyphs,
  darkMode,
  bgSecondary,
  borderColor
}) {
  return (
    <div className={`lg:hidden border-t ${borderColor} ${bgSecondary} px-3 py-2 flex items-center justify-between gap-2 shrink-0`}>
      <div className="flex-1 grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveChar(ALPHABET[Math.max(0, ALPHABET.indexOf(activeChar) - 1)])}
          disabled={activeChar === ALPHABET[0]}
          className={`px-2 py-1.5 text-xs font-bold rounded border ${borderColor} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition disabled:opacity-50`}
        >
          ←
        </button>
        <div className={`flex items-center justify-center px-2 py-1.5 text-xs font-bold rounded border ${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
          {activeChar}
        </div>
        <button
          onClick={() => setActiveChar(ALPHABET[Math.min(ALPHABET.length - 1, ALPHABET.indexOf(activeChar) + 1)])}
          disabled={activeChar === ALPHABET[ALPHABET.length - 1]}
          className={`px-2 py-1.5 text-xs font-bold rounded border ${borderColor} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition disabled:opacity-50`}
        >
          →
        </button>
      </div>
      <button 
        onClick={downloadFont}
        disabled={!otLoaded || Object.keys(glyphs).length === 0}
        className={`px-3 py-1.5 text-xs font-bold rounded ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} transition disabled:opacity-30`}
      >
        Export
      </button>
    </div>
  );
}
