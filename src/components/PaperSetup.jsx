import { ArrowLeft, ArrowRight } from 'lucide-react';
import { generateTemplateImage } from '../utils/templateGenerator';

export default function PaperSetup({
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const handleDownloadTemplate = async () => {
    try {
      const blob = await generateTemplateImage();
      const file = new File([blob], 'TypeForge-Template.png', { type: 'image/png' });
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'TypeForge Template', text: 'Print this template to draw your font!' });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'TypeForge-Template.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const bg           = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg           = darkMode ? '#f0efe9' : '#111110';
  const muted        = darkMode ? '#6b6a62' : '#8a8880';
  const divider      = darkMode ? '#1f1f1c' : '#e2e0da';
  const cardBg       = darkMode ? '#13161c' : '#ffffff';

  const steps = [
    {
      num: '01',
      title: 'Download the template',
      desc: 'An A4 grid sheet — one box per character. Works with any printer.',
      action: (
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: darkMode ? '#4f8ef7' : '#2563eb', fontFamily: 'sans-serif' }}
        >
          Download template <ArrowRight size={14} />
        </button>
      ),
    },
    {
      num: '02',
      title: 'Fill it in',
      desc: 'Use a dark pen or marker. Write each letter clearly inside its box. Ink bleeds are fine.',
      action: null,
    },
    {
      num: '03',
      title: 'Scan or photograph',
      desc: 'Take a clear, well-lit photo. All four corner marks must be visible for alignment.',
      action: null,
    },
    {
      num: '04',
      title: 'Upload & extract',
      desc: 'We detect the grid, crop each character, and convert your handwriting into vectors.',
      action: (
        <button
          onClick={() => setAppMode('scanner')}
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: darkMode ? '#4f8ef7' : '#2563eb', fontFamily: 'sans-serif' }}
        >
          Upload photo <ArrowRight size={14} />
        </button>
      ),
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
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <button
          onClick={() => setAppMode('intro')}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: 'sans-serif', color: muted }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <span className="text-xs" style={{ fontFamily: 'sans-serif', color: muted }}>
          Paper Workflow
        </span>
      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT ── headline */}
        <div
          className="flex flex-col justify-between p-8 sm:p-12 lg:w-5/12"
          style={{ borderRight: `1px solid ${divider}` }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: 'sans-serif', color: muted }}>
              Scan handwriting
            </p>
            <h1
              className="font-bold leading-none"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)', letterSpacing: '-0.03em' }}
            >
              Draw.<br />
              Scan.<br />
              Ship.
            </h1>
          </div>

          {/* Template preview — minimal paper sketch */}
          <div
            className="hidden lg:block mt-12 rounded-xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${divider}`, padding: '1.5rem' }}
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'sans-serif', color: muted }}>
              Template preview
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').slice(0, 32).map((c, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    border: `1px solid ${divider}`,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2px 3px',
                  }}
                >
                  <span style={{ fontSize: 8, fontFamily: 'monospace', color: muted }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ── steps */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div
            className="px-4 py-3 text-xs uppercase tracking-widest shrink-0"
            style={{ fontFamily: 'sans-serif', color: muted, borderBottom: `1px solid ${divider}` }}
          >
            Steps
          </div>

          {steps.map((step, i) => (
            <div
              key={step.num}
              className="px-8 sm:px-12 py-8"
              style={{ borderBottom: `1px solid ${divider}` }}
            >
              <div className="flex gap-5">
                <span
                  className="text-xs pt-1 shrink-0"
                  style={{ fontFamily: 'monospace', color: muted }}
                >
                  {step.num}
                </span>
                <div>
                  <h2
                    className="font-bold mb-2"
                    style={{ fontSize: 'clamp(17px, 2vw, 22px)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
                  >
                    {step.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ fontFamily: 'sans-serif', color: muted }}
                  >
                    {step.desc}
                  </p>
                  {step.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
