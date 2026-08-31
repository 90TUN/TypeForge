import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

export default function FontTester({
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
  initialFontUrl,
  initialFontName,
}) {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontName, setFontName] = useState('');
  const [testText, setTestText] = useState('');
  const [fontSize, setFontSize] = useState(48);

  const bg      = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg      = darkMode ? '#f0efe9' : '#111110';
  const muted   = darkMode ? '#6b6a62' : '#8a8880';
  const divider = darkMode ? '#1f1f1c' : '#e2e0da';
  const areaBg  = darkMode ? '#13161c' : '#ffffff';

  // Auto-load a font from a blob URL (passed in after "bake & download")
  useEffect(() => {
    if (!initialFontUrl) return;
    const load = async () => {
      try {
        // Remove any previous CustomTestFont
        document.fonts.forEach(f => { if (f.family === 'CustomTestFont') document.fonts.delete(f); });
        const font = new FontFace('CustomTestFont', `url(${initialFontUrl})`);
        await font.load();
        document.fonts.add(font);
        setFontLoaded(true);
        setFontName(initialFontName || 'Your font');
      } catch (err) {
        console.error('Failed to load generated font:', err);
      }
    };
    load();
  }, [initialFontUrl, initialFontName]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      document.fonts.forEach(f => { if (f.family === 'CustomTestFont') document.fonts.delete(f); });
      const buffer = await file.arrayBuffer();
      const font = new FontFace('CustomTestFont', buffer);
      await font.load();
      document.fonts.add(font);
      setFontLoaded(true);
      setFontName(file.name);
    } catch (err) {
      console.error('Failed to load font:', err);
      alert('Failed to parse this font file. Make sure it is a valid .otf or .ttf file.');
    }
  };

  useEffect(() => {
    return () => {
      document.fonts.forEach(f => { if (f.family === 'CustomTestFont') document.fonts.delete(f); });
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full animate-fadeIn overflow-hidden"
      style={{ background: bg, color: fg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 shrink-0"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <button
          onClick={() => setAppMode('intro')}
          className="flex items-center transition-opacity hover:opacity-60 shrink-0"
          style={{ color: muted }}
        >
          <ArrowLeft size={18} />
        </button>

        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: 'sans-serif', color: muted }}
        >
          {fontLoaded ? fontName : 'Font tester'}
        </span>

        {fontLoaded ? (
          <label
            className="text-xs cursor-pointer transition-opacity hover:opacity-60 shrink-0"
            style={{ fontFamily: 'sans-serif', color: muted }}
          >
            Change font
            <input type="file" accept=".otf,.ttf,.woff,.woff2" onChange={handleFileUpload} className="hidden" />
          </label>
        ) : (
          <div className="w-20" />
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!fontLoaded ? (
          /* ── Upload prompt ── */
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
            <label
              className="flex flex-col items-center justify-center w-full max-w-lg cursor-pointer"
              style={{
                border: `2px dashed ${divider}`,
                borderRadius: 16,
                padding: '3rem 2rem',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#34d399'}
              onMouseLeave={e => e.currentTarget.style.borderColor = divider}
            >
              <Upload size={32} style={{ color: muted, marginBottom: 16 }} />
              <span className="text-lg font-bold mb-1 text-center" style={{ letterSpacing: '-0.02em' }}>
                Upload a font file
              </span>
              <span className="text-sm text-center" style={{ fontFamily: 'sans-serif', color: muted }}>
                .otf · .ttf · .woff · .woff2
              </span>
              <input type="file" accept=".otf,.ttf,.woff,.woff2" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          /* ── Preview area ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Size control */}
            <div
              className="flex items-center gap-4 px-6 sm:px-8 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${divider}` }}
            >
              <span className="text-xs uppercase tracking-widest" style={{ fontFamily: 'sans-serif', color: muted }}>
                Size
              </span>
              <input
                type="range"
                min="12"
                max="144"
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className="flex-1 accent-emerald-500"
              />
              <span
                className="text-sm tabular-nums w-10 text-right"
                style={{ fontFamily: 'monospace', color: muted }}
              >
                {fontSize}px
              </span>
            </div>

          <div className="flex-1 relative overflow-hidden">
            {/* Placeholder overlay — shown when textarea is empty, rendered in the custom font */}
            {testText === '' && (
              <div
                className="absolute inset-0 pointer-events-none select-none flex items-start"
                style={{
                  fontFamily: 'CustomTestFont',
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.4,
                  padding: '2rem',
                  color: muted,
                  opacity: 0.4,
                }}
              >
                Type here to preview font…
              </div>
            )}
            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              style={{
                fontFamily: 'CustomTestFont',
                fontSize: `${fontSize}px`,
                width: '100%',
                height: '100%',
                resize: 'none',
                padding: '2rem',
                background: areaBg,
                color: fg,
                border: 'none',
                outline: 'none',
                lineHeight: 1.4,
              }}
              spellCheck={false}
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
