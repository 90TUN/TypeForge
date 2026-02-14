import React, { useState, memo, useEffect, useRef } from 'react';
import { PREVIEW_SIZES } from '../utils/constants';

const PreviewSection = memo(({ title, previewText, fontUrl, previewSizes, drawnCharCount, isCapsLock, darkMode, bgSecondary, borderColor, textPrimary, textSecondary }) => {
  const getDisplayText = (text) => {
    if (!text) return '';
    return isCapsLock ? text.toUpperCase() : text.toLowerCase();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h3 className={`text-xs font-bold uppercase ${textSecondary} mb-1.5 shrink-0`}>{title}</h3>
      
      {fontUrl && drawnCharCount > 0 ? (
        <div className={`flex-1 overflow-y-auto p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} hide-scrollbar`}>
          <div className="space-y-1.5">
            {previewSizes.slice(0, 3).map(size => (
              <div
                key={size}
                style={{
                  fontSize: `${size}px`,
                  fontFamily: `'${fontUrl.name}', monospace`,
                  lineHeight: '1.4',
                  letterSpacing: '0.05em'
                }}
                className={`${textPrimary} break-words`}
              >
                {getDisplayText(previewText) || 'Type text...'}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} flex items-center justify-center hide-scrollbar`}>
          <p className={`text-xs text-center ${textSecondary}`}>
            Draw characters to preview
          </p>
        </div>
      )}
    </div>
  );
})

PreviewSection.displayName = 'PreviewSection';

function RightSidebar({
  previewText,
  setPreviewText,
  fontUrl,
  previewSizes = PREVIEW_SIZES,
  glyphs,
  activeChar,
  otLoaded,
  FONT_UNITS,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [previewText2, setPreviewText2] = useState(() => {
    const saved = localStorage.getItem('typeForgePreviewText2');
    return saved || 'Quick brown fox';
  });
  const [debouncedPreviewText, setDebouncedPreviewText] = useState(previewText);
  const debounceTimerRef = useRef(null);
  const drawnCharCount = Object.values(glyphs).filter(strokes => strokes && strokes.length > 0).length;

  // Save second preview text
  React.useEffect(() => {
    localStorage.setItem('typeForgePreviewText2', previewText2);
  }, [previewText2]);

  // Debounce preview text input (500ms delay)
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedPreviewText(previewText);
    }, 500);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [previewText]);

  // Handle caps lock detection
  const handleKeyDown = (e) => {
    e.stopPropagation();
    setIsCapsLock(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e) => {
    e.stopPropagation();
    setIsCapsLock(e.getModifierState('CapsLock'));
  };

  // Apply case based on caps lock
  const getDisplayText = (text) => {
    if (!text) return '';
    return isCapsLock ? text.toUpperCase() : text.toLowerCase();
  };

  return (
    <section className={`border-l ${borderColor} p-3 sm:p-4 ${bgSecondary} transition-colors hidden lg:flex lg:flex-col overflow-hidden gap-3 h-full`}>
      
      {/* PREVIEW 1 */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className={`text-xs font-bold uppercase ${textSecondary} mb-1.5 shrink-0`}>Preview 1</h3>
        
        {/* Input */}
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Type here... (capslock controls case)"
          maxLength="100"
          className={`w-full h-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-2 ${textPrimary} text-xs outline-none border ${borderColor} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none shrink-0 mb-1.5`}
        />

        {/* Preview */}
        <PreviewSection
          title=""
          previewText={debouncedPreviewText}
          fontUrl={fontUrl}
          previewSizes={PREVIEW_SIZES}
          drawnCharCount={drawnCharCount}
          isCapsLock={isCapsLock}
          darkMode={darkMode}
          bgSecondary={bgSecondary}
          borderColor={borderColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      </div>

      {/* PREVIEW 2 */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className={`text-xs font-bold uppercase ${textSecondary} mb-1.5 shrink-0`}>Preview 2</h3>
        
        {/* Input */}
        <textarea
          value={previewText2}
          onChange={(e) => setPreviewText2(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Type here... (capslock controls case)"
          maxLength="100"
          className={`w-full h-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-2 ${textPrimary} text-xs outline-none border ${borderColor} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none shrink-0 mb-1.5`}
        />

        {/* Preview */}
        {fontUrl && drawnCharCount > 0 ? (
          <div className={`flex-1 overflow-y-auto p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} hide-scrollbar`}>
            <div
              style={{
                fontSize: '24px',
                fontFamily: `'${fontUrl.name}', monospace`,
                lineHeight: '1.4',
                letterSpacing: '0.05em'
              }}
              className={`${textPrimary} break-words`}
            >
              {getDisplayText(previewText2) || 'Type text...'}
            </div>
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} flex items-center justify-center hide-scrollbar`}>
            <p className={`text-xs text-center ${textSecondary}`}>
              Draw characters to preview
            </p>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} text-[10px] space-y-1 shrink-0`}>
        <div className="flex justify-between">
          <span className={textSecondary}>Drawn:</span>
          <span className={textPrimary}>{drawnCharCount} chars</span>
        </div>
        <div className="flex justify-between">
          <span className={textSecondary}>Current:</span>
          <span className={textPrimary}>{(glyphs[activeChar] || []).length} strokes</span>
        </div>
        <div className="flex justify-between">
          <span className={textSecondary}>Caps:</span>
          <span className={`${isCapsLock ? 'text-yellow-500 font-bold' : textPrimary}`}>
            {isCapsLock ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default RightSidebar;
