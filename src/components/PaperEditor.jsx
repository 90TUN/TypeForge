import React from 'react';
import { ALPHABET, CANVAS_SIZE } from '../utils/constants';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
  const extractedCount = ALPHABET.filter(char => glyphs[char] && glyphs[char].length > 0).length;
  const total = ALPHABET.length;
  const progress = Math.round((extractedCount / total) * 100);
  const allDone = extractedCount === total;

  const bg      = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg      = darkMode ? '#f0efe9' : '#111110';
  const muted   = darkMode ? '#6b6a62' : '#8a8880';
  const divider = darkMode ? '#1f1f1c' : '#e2e0da';
  const cardBg  = darkMode ? '#13161c' : '#ffffff';

  return (
    <div
      className="flex flex-col h-full w-full animate-fadeIn overflow-hidden"
      style={{ background: bg, color: fg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex items-center justify-between px-6 sm:px-8 py-5 shrink-0 gap-4"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <button
          onClick={() => setAppMode('scanner')}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60 shrink-0"
          style={{ fontFamily: 'sans-serif', color: muted }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ background: divider }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: allDone ? '#34d399' : '#4f8ef7' }}
            />
          </div>
          <span
            className="text-xs tabular-nums shrink-0"
            style={{ fontFamily: 'monospace', color: muted }}
          >
            {extractedCount}/{total}
          </span>
        </div>

        <button
          onClick={() => setShowMetadataModal(true)}
          disabled={!otLoaded || !allDone}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-opacity disabled:opacity-30 shrink-0"
          style={{
            fontFamily: 'sans-serif',
            background: allDone ? '#34d399' : fg,
            color: allDone ? '#fff' : bg,
          }}
          title={!allDone ? `${total - extractedCount} characters still missing` : 'Build font'}
        >
          Build font <ArrowRight size={14} />
        </button>
      </div>

      {/* ── GRID ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div
          className="grid pb-10"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 8,
          }}
        >
          {ALPHABET.map((char) => {
            const charGlyphs = glyphs[char] || [];
            const has = charGlyphs.length > 0;

            return (
              <div
                key={char}
                className="relative flex flex-col items-center justify-center transition-all duration-200"
                style={{
                  aspectRatio: '1',
                  background: has ? cardBg : 'transparent',
                  border: `1px solid ${has ? (darkMode ? '#2a2d34' : '#d8d6d0') : divider}`,
                  borderRadius: 10,
                }}
              >
                {/* char label */}
                <span
                  className="absolute top-1.5 left-2 text-[10px]"
                  style={{ fontFamily: 'monospace', color: has ? muted : muted, opacity: has ? 1 : 0.4 }}
                >
                  {char}
                </span>

                {has ? (
                  <svg
                    viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                    className="w-4/5 h-4/5 mt-3"
                  >
                    {charGlyphs.map((stroke, index) => {
                      if (!stroke.points || stroke.points.length === 0) return null;
                      return stroke.isOutline ? (
                        <polygon
                          key={index}
                          points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill={darkMode ? '#f0efe9' : '#111110'}
                        />
                      ) : (
                        <polyline
                          key={index}
                          points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke={darkMode ? '#f0efe9' : '#111110'}
                          strokeWidth="20"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <span
                    className="font-bold mt-3"
                    style={{ fontSize: 28, color: muted, opacity: 0.15 }}
                  >
                    {char}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
