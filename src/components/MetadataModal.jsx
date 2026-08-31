import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

export default function MetadataModal({
  show,
  setShow,
  metadata,
  setMetadata,
  onDownload,
  onPreview,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
}) {
  const [baked, setBaked] = useState(false);

  if (!show) return null;

  const bg      = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg      = darkMode ? '#f0efe9' : '#111110';
  const muted   = darkMode ? '#6b6a62' : '#8a8880';
  const divider = darkMode ? '#1f1f1c' : '#e2e0da';
  const inputBg = darkMode ? '#13161c' : '#ffffff';
  const inputBorder = darkMode ? '#2a2d34' : '#d8d6d0';

  const handleChange = (e) => {
    setMetadata(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDownload = () => {
    localStorage.setItem('typeForgeMetadata', JSON.stringify(metadata));
    onDownload();
    setBaked(true);
  };

  const handleClose = () => {
    setBaked(false);
    setShow(false);
  };

  const handlePreview = () => {
    handleClose();
    onPreview?.();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    color: fg,
    fontFamily: 'sans-serif',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'sans-serif',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: muted,
    marginBottom: 6,
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-md animate-fadeIn"
        style={{
          background: bg,
          border: `1px solid ${divider}`,
          borderRadius: 16,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${divider}` }}
        >
          <h2
            className="font-bold"
            style={{ fontSize: 22, letterSpacing: '-0.02em', color: fg }}
          >
            {baked ? 'Font baked.' : 'Export font'}
          </h2>
          <button
            onClick={handleClose}
            className="transition-opacity hover:opacity-50"
            style={{ color: muted }}
          >
            <X size={18} />
          </button>
        </div>

        {baked ? (
          /* ── SUCCESS STATE ── */
          <div className="px-6 py-8 flex flex-col items-center text-center gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#34d399', color: '#fff' }}
            >
              <Check size={28} strokeWidth={2.5} />
            </div>

            <div>
              <p
                className="font-bold mb-1"
                style={{ fontSize: 18, letterSpacing: '-0.02em', color: fg }}
              >
                {metadata.family || 'Your font'} downloaded
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: 'sans-serif', color: muted }}
              >
                Your .otf file is in your downloads folder.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handlePreview}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                style={{ fontFamily: 'sans-serif', background: fg, color: bg, fontSize: 14 }}
              >
                Test in preview <ArrowRight size={15} />
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full text-sm transition-opacity hover:opacity-60"
                style={{ fontFamily: 'sans-serif', color: muted }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <div className="px-6 py-6 flex flex-col gap-5">
            <div>
              <label style={labelStyle}>Font family name</label>
              <input
                type="text"
                name="family"
                value={metadata.family || ''}
                onChange={handleChange}
                placeholder="e.g. My Handwriting"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                onBlur={e => e.target.style.borderColor = inputBorder}
              />
            </div>

            <div>
              <label style={labelStyle}>Author</label>
              <input
                type="text"
                name="author"
                value={metadata.author || ''}
                onChange={handleChange}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                onBlur={e => e.target.style.borderColor = inputBorder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Version</label>
                <input
                  type="text"
                  name="version"
                  value={metadata.version || ''}
                  onChange={handleChange}
                  placeholder="1.0"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Copyright</label>
                <input
                  type="text"
                  name="copyright"
                  value={metadata.copyright || ''}
                  onChange={handleChange}
                  placeholder="© 2026"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-opacity hover:opacity-90 mt-2"
              style={{ fontFamily: 'sans-serif', background: fg, color: bg, fontSize: 14 }}
            >
              Bake &amp; download .otf <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
