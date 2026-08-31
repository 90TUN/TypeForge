import React, { useRef } from 'react';
import { X, PenLine, FolderOpen, ArrowRight } from 'lucide-react';

export default function NewProjectModal({
  show,
  onClose,
  onStartFresh,
  onImport,
  darkMode,
}) {
  const fileInputRef = useRef(null);

  if (!show) return null;

  const bg      = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg      = darkMode ? '#f0efe9' : '#111110';
  const muted   = darkMode ? '#6b6a62' : '#8a8880';
  const divider = darkMode ? '#1f1f1c' : '#e2e0da';
  const cardBg  = darkMode ? '#13161c' : '#ffffff';
  const cardBorder = darkMode ? '#2a2d34' : '#e2e0da';

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.glyphs) {
          onImport(data);
        } else {
          alert('Invalid TypeForge design file.');
        }
      } catch {
        alert('Could not read file. Make sure it is a valid TypeForge .json export.');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const options = [
    {
      icon: PenLine,
      num: '01',
      title: 'Start fresh',
      detail: 'Begin with a blank canvas. Draw each character from scratch.',
      accent: darkMode ? '#4f8ef7' : '#2563eb',
      onClick: onStartFresh,
    },
    {
      icon: FolderOpen,
      num: '02',
      title: 'Import design',
      detail: 'Load a previously exported TypeForge .json file to continue where you left off.',
      accent: darkMode ? '#34d399' : '#059669',
      onClick: () => fileInputRef.current?.click(),
    },
  ];

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[100]"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md animate-fadeIn sm:rounded-2xl overflow-hidden rounded-t-2xl"
        style={{ background: bg, border: `1px solid ${divider}`, fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${divider}` }}
        >
          <h2 className="font-bold" style={{ fontSize: 22, letterSpacing: '-0.02em', color: fg }}>
            Digital drawing
          </h2>
          <button onClick={onClose} className="transition-opacity hover:opacity-50" style={{ color: muted }}>
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.num}
              onClick={opt.onClick}
              className="group w-full text-left flex items-center gap-4 p-5 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              onMouseEnter={e => e.currentTarget.style.borderColor = opt.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: `${opt.accent}18` }}
              >
                <opt.icon size={20} style={{ color: opt.accent }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-bold mb-0.5" style={{ fontSize: 16, letterSpacing: '-0.01em', color: fg }}>
                  {opt.title}
                </p>
                <p className="text-sm leading-snug" style={{ fontFamily: 'sans-serif', color: muted }}>
                  {opt.detail}
                </p>
              </div>

              <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: muted }} />
            </button>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Bottom padding for mobile safe area */}
        <div className="pb-safe h-4 sm:h-0" />
      </div>
    </div>
  );
}

