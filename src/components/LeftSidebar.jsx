import React, { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ALPHABET, CHARACTER_GROUPS } from '../utils/constants';

const CharButton = memo(({ group, idx, isPrimary, hasGlyph, activeChar, setActiveChar, displayText, darkMode, textPrimary, textSecondary }) => {
  return (
    <button
      onClick={() => setActiveChar(group[0])}
      className={`lg:aspect-square py-1.5 lg:py-0 px-1 lg:px-0 rounded-md border text-[10px] lg:text-xs flex items-center justify-center font-bold transition-all relative
        ${isPrimary 
          ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100/50'} ${textPrimary}` 
          : `${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'} ${textSecondary}`}
      `}
      title={`Character ${displayText}`}
    >
      {displayText}
      {hasGlyph && (
        <div className="absolute top-0.5 right-0.5">
          <CheckCircle2 size={6} className="text-green-500 hidden lg:block" />
          <CheckCircle2 size={5} className="text-green-500 lg:hidden" />
        </div>
      )}
    </button>
  );
});

CharButton.displayName = 'CharButton';

function LeftSidebar({
  activeChar,
  setActiveChar,
  glyphs,
  fontUrl,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  return (
    <section className={`border-r ${borderColor} p-1.5 sm:p-3 lg:p-4 ${bgSecondary} transition-colors flex flex-col overflow-hidden h-full`}>
      <div className="flex items-center justify-between mb-2 shrink-0 px-1 lg:px-0">
        <h3 className={`text-[10px] lg:text-xs font-bold uppercase ${textSecondary} hidden lg:block`}>Characters</h3>
        <span className={`text-[8px] lg:text-[10px] ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} px-1.5 lg:px-2 py-0.5 rounded hidden lg:block`}>
          {Object.keys(glyphs).length}/{ALPHABET.length}
        </span>
      </div>
      
      {/* Mobile: 1 column (narrow), Desktop: 5 columns (wide) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 lg:gap-1.5 overflow-y-auto flex-1 pr-1 hide-scrollbar">
        {CHARACTER_GROUPS.map((group, idx) => {
          const isPrimary = activeChar === group[0];
          const hasGlyph = group.some(char => glyphs[char]);
          const displayText = group.length === 2 ? `${group[0]}${group[1]}` : group[0];
          
          return (
            <CharButton
              key={idx}
              group={group}
              idx={idx}
              isPrimary={isPrimary}
              hasGlyph={hasGlyph}
              activeChar={activeChar}
              setActiveChar={setActiveChar}
              displayText={displayText}
              darkMode={darkMode}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
          );
        })}
      </div>
    </section>
  );
}

export default memo(LeftSidebar);
