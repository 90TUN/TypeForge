import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { processTemplateImage } from '../utils/scanner';

export default function ScannerModal({
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
  onExtract
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imgObj, setImgObj] = useState(null);
  const [bounds, setBounds] = useState({ top: 0.1, bottom: 0.9, left: 0.1, right: 0.9 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [draggingHandle, setDraggingHandle] = useState(null);
  const dragOffsetRef = useRef(null);

  const bg      = darkMode ? '#0a0b0f' : '#f5f4f0';
  const fg      = darkMode ? '#f0efe9' : '#111110';
  const muted   = darkMode ? '#6b6a62' : '#8a8880';
  const divider = darkMode ? '#1f1f1c' : '#e2e0da';

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgObj) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

    const startX = bounds.left * canvas.width;
    const startY = bounds.top * canvas.height;
    const gridW = (bounds.right - bounds.left) * canvas.width;
    const gridH = (bounds.bottom - bounds.top) * canvas.height;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4f8ef7';
    ctx.strokeRect(startX, startY, gridW, gridH);

    const cols = 8, rows = 13;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(79,142,247,0.4)';
    for (let c = 1; c < cols; c++) {
      ctx.beginPath(); ctx.moveTo(startX + c * (gridW / cols), startY); ctx.lineTo(startX + c * (gridW / cols), startY + gridH); ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath(); ctx.moveTo(startX, startY + r * (gridH / rows)); ctx.lineTo(startX + gridW, startY + r * (gridH / rows)); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, startY);
    ctx.fillRect(0, startY + gridH, canvas.width, canvas.height - (startY + gridH));
    ctx.fillRect(0, startY, startX, gridH);
    ctx.fillRect(startX + gridW, startY, canvas.width - (startX + gridW), gridH);

    const drawHandle = (x, y) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f8ef7';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    };
    drawHandle(startX, startY); drawHandle(startX + gridW, startY);
    drawHandle(startX, startY + gridH); drawHandle(startX + gridW, startY + gridH);
    drawHandle(startX + gridW / 2, startY); drawHandle(startX + gridW / 2, startY + gridH);
    drawHandle(startX, startY + gridH / 2); drawHandle(startX + gridW, startY + gridH / 2);
  }, [bounds, imgObj]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      setImgObj(img);
      const canvas = canvasRef.current;
      const MAX_WIDTH = 1500;
      let w = img.width, h = img.height;
      if (w > MAX_WIDTH) { h = Math.round(h * (MAX_WIDTH / w)); w = MAX_WIDTH; }
      canvas.width = w; canvas.height = h;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY, scaleX };
  };

  const handlePointerDown = (e) => {
    const pos = getPointerPos(e);
    if (!pos || !imgObj) return;
    const canvas = canvasRef.current;
    const topY = bounds.top * canvas.height, bottomY = bounds.bottom * canvas.height;
    const leftX = bounds.left * canvas.width, rightX = bounds.right * canvas.width;
    const hitDist = 30 * pos.scaleX;
    if (Math.hypot(pos.x - leftX, pos.y - topY) < hitDist) { setDraggingHandle('tl'); return; }
    if (Math.hypot(pos.x - rightX, pos.y - topY) < hitDist) { setDraggingHandle('tr'); return; }
    if (Math.hypot(pos.x - leftX, pos.y - bottomY) < hitDist) { setDraggingHandle('bl'); return; }
    if (Math.hypot(pos.x - rightX, pos.y - bottomY) < hitDist) { setDraggingHandle('br'); return; }
    if (Math.abs(pos.y - topY) < hitDist && pos.x > leftX && pos.x < rightX) { setDraggingHandle('top'); return; }
    if (Math.abs(pos.y - bottomY) < hitDist && pos.x > leftX && pos.x < rightX) { setDraggingHandle('bottom'); return; }
    if (Math.abs(pos.x - leftX) < hitDist && pos.y > topY && pos.y < bottomY) { setDraggingHandle('left'); return; }
    if (Math.abs(pos.x - rightX) < hitDist && pos.y > topY && pos.y < bottomY) { setDraggingHandle('right'); return; }
    if (pos.x > leftX && pos.x < rightX && pos.y > topY && pos.y < bottomY) {
      setDraggingHandle('center');
      dragOffsetRef.current = { x: pos.x / canvas.width - bounds.left, y: pos.y / canvas.height - bounds.top, width: bounds.right - bounds.left, height: bounds.bottom - bounds.top };
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingHandle || !imgObj) return;
    if (e.cancelable && e.type === 'touchmove') e.preventDefault();
    const pos = getPointerPos(e);
    if (!pos) return;
    const canvas = canvasRef.current;
    const px = Math.max(0, Math.min(1, pos.x / canvas.width));
    const py = Math.max(0, Math.min(1, pos.y / canvas.height));
    setBounds(prev => {
      const next = { ...prev }, min = 0.1;
      if (draggingHandle === 'tl') { next.top = Math.min(py, next.bottom - min); next.left = Math.min(px, next.right - min); }
      if (draggingHandle === 'tr') { next.top = Math.min(py, next.bottom - min); next.right = Math.max(px, next.left + min); }
      if (draggingHandle === 'bl') { next.bottom = Math.max(py, next.top + min); next.left = Math.min(px, next.right - min); }
      if (draggingHandle === 'br') { next.bottom = Math.max(py, next.top + min); next.right = Math.max(px, next.left + min); }
      if (draggingHandle === 'top') next.top = Math.min(py, next.bottom - min);
      if (draggingHandle === 'bottom') next.bottom = Math.max(py, next.top + min);
      if (draggingHandle === 'left') next.left = Math.min(px, next.right - min);
      if (draggingHandle === 'right') next.right = Math.max(px, next.left + min);
      if (draggingHandle === 'center') {
        const o = dragOffsetRef.current;
        let nL = Math.max(0, Math.min(px - o.x, 1 - o.width));
        let nT = Math.max(0, Math.min(py - o.y, 1 - o.height));
        next.left = nL; next.right = nL + o.width; next.top = nT; next.bottom = nT + o.height;
      }
      return next;
    });
  };

  const handlePointerUp = () => setDraggingHandle(null);

  useEffect(() => {
    if (draggingHandle) {
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);
      return () => { window.removeEventListener('mouseup', handlePointerUp); window.removeEventListener('touchend', handlePointerUp); };
    }
  }, [draggingHandle]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => setImageSrc(ev.target.result); reader.readAsDataURL(file); }
  };

  const handleExtract = async () => {
    if (!imgObj) return;
    setIsProcessing(true);
    try { const glyphs = await processTemplateImage(imgObj, bounds); onExtract(glyphs); }
    catch (err) { console.error(err); alert('Failed to process image'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div
      className="flex flex-col h-full w-full animate-fadeIn"
      style={{ background: bg, color: fg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 shrink-0"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <button
          onClick={() => setAppMode('paper-setup')}
          className="flex items-center transition-opacity hover:opacity-60 shrink-0"
          style={{ fontFamily: 'sans-serif', color: muted }}
        >
          <ArrowLeft size={18} />
        </button>

        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: 'sans-serif', color: muted }}
        >
          {imageSrc ? 'Align grid to template' : 'Upload scan'}
        </span>

        {imageSrc ? (
          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-opacity disabled:opacity-50 shrink-0"
            style={{ fontFamily: 'sans-serif', background: '#4f8ef7', color: '#fff' }}
          >
            {isProcessing ? 'Processing…' : <><span>Extract</span><ArrowRight size={14} /></>}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {!imageSrc ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
            <label
              className="flex flex-col items-center justify-center w-full max-w-lg cursor-pointer"
              style={{
                border: `2px dashed ${divider}`,
                borderRadius: 16,
                padding: '2.5rem 1.5rem',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4f8ef7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = divider}
            >
              <Upload size={32} style={{ color: muted, marginBottom: 16 }} />
              <span className="text-lg font-bold mb-1 text-center" style={{ letterSpacing: '-0.02em' }}>
                Upload your scan
              </span>
              <span className="text-sm text-center" style={{ fontFamily: 'sans-serif', color: muted }}>
                JPG or PNG · All four corner marks must be visible
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <div
            className="flex-1 flex items-center justify-center overflow-hidden touch-none select-none"
            style={{ background: darkMode ? '#000' : '#ddd' }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              className="max-w-full max-h-full object-contain"
              style={{ cursor: draggingHandle === 'center' ? 'move' : draggingHandle ? 'crosshair' : 'default' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

