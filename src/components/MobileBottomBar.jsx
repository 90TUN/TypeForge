import React from 'react';
import { ALPHABET } from '../utils/constants';

export default function MobileBottomBar({
  activeChar,
  setActiveChar,
  otLoaded,
  glyphs,
  darkMode,
  bgSecondary,
  borderColor
}) {
  return (
    <div className={`lg:hidden border-t ${borderColor} ${bgSecondary} px-3 py-3 flex items-center justify-between gap-3 shrink-0`}>
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={() => setActiveChar(ALPHABET[Math.max(0, ALPHABET.indexOf(activeChar) - 1)])}
          disabled={activeChar === ALPHABET[0]}
          className={`px-3 py-2 text-sm font-bold rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-black'} shadow-sm transition disabled:opacity-50`}
        >
          ←
        </button>
        
        <div className="relative flex-1">
          <select 
            value={activeChar}
            onChange={(e) => setActiveChar(e.target.value)}
            className={`w-full appearance-none px-3 py-2 text-center text-lg font-bold rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-sm focus:ring-2 focus:ring-blue-500 outline-none`}
          >
            {ALPHABET.map(char => (
              <option key={char} value={char}>
                {char} {glyphs[char]?.length ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setActiveChar(ALPHABET[Math.min(ALPHABET.length - 1, ALPHABET.indexOf(activeChar) + 1)])}
          disabled={activeChar === ALPHABET[ALPHABET.length - 1]}
          className={`px-3 py-2 text-sm font-bold rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-black'} shadow-sm transition disabled:opacity-50`}
        >
          →
        </button>
      </div>
    </div>
  );
}
