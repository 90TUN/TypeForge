import React, { useState, memo, useRef } from 'react';
import { X } from 'lucide-react';

const PreviewSection = memo(({ title, previewText, fontUrl, drawnCharCount, isCapsLock, darkMode, bgSecondary, borderColor, textPrimary, textSecondary }) => {
  const getDisplayText = (text) => {
    if (!text) return '';
    return isCapsLock ? text.toUpperCase() : text.toLowerCase();
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className={`text-sm font-semibold ${textSecondary}`}>{title}</h3>
      {fontUrl && drawnCharCount > 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 border ${borderColor}`}>
          <div className="space-y-2">
            {[12, 18, 24].map(size => (
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
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${borderColor} flex items-center justify-center h-20`}>
          <p className={`text-sm text-center ${textSecondary}`}>
            Draw characters to preview
          </p>
        </div>
      )}
    </div>
  );
})

PreviewSection.displayName = 'PreviewSection';

function PreviewModal({
  isOpen,
  onClose,
  previewText,
  setPreviewText,
  fontUrl,
  glyphs,
  otLoaded,
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

  const drawnCharCount = Object.values(glyphs).filter(strokes => strokes && strokes.length > 0).length;

  const handleKeyDown = (e) => {
    e.stopPropagation();
    setIsCapsLock(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e) => {
    e.stopPropagation();
    setIsCapsLock(e.getModifierState('CapsLock'));
  };

  const getDisplayText = (text) => {
    if (!text) return '';
    return isCapsLock ? text.toUpperCase() : text.toLowerCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgSecondary} rounded-lg shadow-2xl flex flex-col max-w-2xl w-full max-h-[90vh] border ${borderColor}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className={`text-lg font-bold ${textPrimary}`}>Font Preview</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-4">
          {/* Preview 1 */}
          <div className="flex flex-col gap-2">
            <h3 className={`text-sm font-semibold ${textSecondary}`}>Preview 1</h3>
            <textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder="Type here... (capslock controls case)"
              maxLength="100"
              className={`w-full h-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-2 ${textPrimary} text-sm outline-none border ${borderColor} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none`}
            />
            <PreviewSection
              title=""
              previewText={previewText}
              fontUrl={fontUrl}
              drawnCharCount={drawnCharCount}
              isCapsLock={isCapsLock}
              darkMode={darkMode}
              bgSecondary={bgSecondary}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
          </div>

          {/* Preview 2 */}
          <div className="flex flex-col gap-2">
            <h3 className={`text-sm font-semibold ${textSecondary}`}>Preview 2</h3>
            <textarea
              value={previewText2}
              onChange={(e) => setPreviewText2(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder="Type here... (capslock controls case)"
              maxLength="100"
              className={`w-full h-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-2 ${textPrimary} text-sm outline-none border ${borderColor} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none`}
            />
            {fontUrl && drawnCharCount > 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 border ${borderColor}`}>
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
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${borderColor} flex items-center justify-center h-20`}>
                <p className={`text-sm text-center ${textSecondary}`}>
                  Draw characters to preview
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${borderColor} text-xs space-y-1`}>
            <div className="flex justify-between">
              <span className={textSecondary}>Drawn:</span>
              <span className={textPrimary}>{drawnCharCount} chars</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>Font Loaded:</span>
              <span className={textPrimary}>{otLoaded ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PreviewModal);
