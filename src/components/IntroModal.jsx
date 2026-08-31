import React, { useState } from 'react';
import { PenTool, Printer, Type, ArrowUpRight } from 'lucide-react';

export default function IntroModal({
  showIntro,
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const [hovered, setHovered] = useState(null);

  if (!showIntro) return null;

  const bg     = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg     = darkMode ? '#f0efe9' : '#111110';
  const muted  = darkMode ? '#6b6a62' : '#8a8880';
  const dividerColor = darkMode ? '#1f1f1c' : '#e2e0da';

  const options = [
    {
      id: 'digital',
      icon: PenTool,
      num: '01',
      title: 'Draw digitally',
      detail: 'Mouse or stylus. Letter by letter.',
      accent: darkMode ? '#4f8ef7' : '#2563eb',
    },
    {
      id: 'paper-setup',
      icon: Printer,
      num: '02',
      title: 'Scan handwriting',
      detail: 'Print a template. Fill it in. Upload.',
      accent: darkMode ? '#a78bfa' : '#7c3aed',
    },
    {
      id: 'preview',
      icon: Type,
      num: '03',
      title: 'Test a font',
      detail: 'Drop in any .otf or .ttf to preview.',
      accent: darkMode ? '#34d399' : '#059669',
    },
  ];

  return (
    <div
      className="flex flex-col h-full w-full animate-fadeIn overflow-hidden"
      style={{ background: bg, color: fg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex items-center justify-between px-8 py-5 shrink-0"
        style={{ borderBottom: `1px solid ${dividerColor}` }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'sans-serif', color: muted }}>
            TypeForge
          </span>
          <div className="relative flex items-center">
            <button
              onClick={() => document.body.classList.toggle('override-font-90tun')}
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Toggle 90tun Font"
            >
              <Type size={16} style={{ color: fg }} />
            </button>
            {/* Thought Bubble */}
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-[10px] whitespace-nowrap rounded-lg animate-float pointer-events-none"
              style={{ 
                background: fg, 
                color: bg, 
                fontFamily: 'sans-serif',
                borderBottomLeftRadius: '0px'
              }}
            >
              click here
            </div>
          </div>
        </div>
        <span className="text-xs flex items-center gap-1.5" style={{ fontFamily: 'sans-serif', color: muted }}>
          by{' '}
          <a
            href="https://90tun.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: fg }}
          >
            90tun
          </a>
        </span>

      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT — hero */}
        <div
          className="flex flex-col justify-between p-8 sm:p-12 lg:w-1/2"
          style={{ borderRight: `1px solid ${dividerColor}` }}
        >
          <div>
            {/* big display text */}
            <h1
              className="leading-none font-bold select-none"
              style={{ fontSize: 'clamp(64px, 10vw, 120px)', letterSpacing: '-0.03em' }}
            >
              Type
              <br />
              Forge
            </h1>
          </div>

          <div>
            <p
              className="text-base sm:text-lg max-w-sm leading-relaxed mb-10"
              style={{ color: muted, fontFamily: 'sans-serif' }}
            >
              Design your own typeface — from scratch. Draw each character, scan your handwriting, or test fonts you already have.
            </p>

            {/* decorative alphabet strip */}
            <div
              className="text-xs tracking-widest overflow-hidden whitespace-nowrap select-none"
              style={{ fontFamily: 'monospace', color: muted, opacity: 0.5 }}
            >
              A B C D E F G H I J K L M N O P Q R S T U V W X Y Z &amp; 0 1 2 3 4 5 6 7 8 9
            </div>
          </div>
        </div>

        {/* RIGHT — options */}
        <div className="flex flex-col justify-center lg:w-1/2 overflow-y-auto">
          <div
            className="px-4 py-3 text-xs uppercase tracking-widest"
            style={{ fontFamily: 'sans-serif', color: muted, borderBottom: `1px solid ${dividerColor}` }}
          >
            Choose a mode
          </div>

          {options.map((opt, i) => {
            const isHov = hovered === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAppMode(opt.id)}
                onMouseEnter={() => setHovered(opt.id)}
                onMouseLeave={() => setHovered(null)}
                className="text-left w-full group relative transition-all duration-150"
                style={{
                  borderBottom: `1px solid ${dividerColor}`,
                  background: isHov ? (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                  padding: '1.75rem 2rem',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-5">
                    {/* number */}
                    <span
                      className="text-xs pt-1 shrink-0"
                      style={{ fontFamily: 'monospace', color: muted }}
                    >
                      {opt.num}
                    </span>

                    <div>
                      {/* title */}
                      <h2
                        className="font-bold transition-colors duration-150"
                        style={{
                          fontSize: 'clamp(18px, 2.5vw, 26px)',
                          color: isHov ? opt.accent : fg,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                        }}
                      >
                        {opt.title}
                      </h2>
                      {/* detail */}
                      <p
                        className="mt-1.5 text-sm"
                        style={{ fontFamily: 'sans-serif', color: muted }}
                      >
                        {opt.detail}
                      </p>
                    </div>
                  </div>

                  {/* arrow */}
                  <ArrowUpRight
                    size={20}
                    className="shrink-0 mt-1 transition-all duration-150"
                    style={{
                      color: isHov ? opt.accent : muted,
                      transform: isHov ? 'translate(3px, -3px)' : 'none',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
