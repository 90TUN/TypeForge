import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
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
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.strokeRect(startX, startY, gridW, gridH);

    const cols = 8;
    const rows = 13;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    
    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(startX + c * (gridW / cols), startY);
      ctx.lineTo(startX + c * (gridW / cols), startY + gridH);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + r * (gridH / rows));
      ctx.lineTo(startX + gridW, startY + r * (gridH / rows));
      ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, startY);
    ctx.fillRect(0, startY + gridH, canvas.width, canvas.height - (startY + gridH));
    ctx.fillRect(0, startY, startX, gridH);
    ctx.fillRect(startX + gridW, startY, canvas.width - (startX + gridW), gridH);

    const drawHandle = (x, y) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    };

    drawHandle(startX, startY);
    drawHandle(startX + gridW, startY);
    drawHandle(startX, startY + gridH);
    drawHandle(startX + gridW, startY + gridH);
    
    drawHandle(startX + gridW/2, startY);
    drawHandle(startX + gridW/2, startY + gridH);
    drawHandle(startX, startY + gridH/2);
    drawHandle(startX + gridW, startY + gridH/2);
  }, [bounds, imgObj]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      setImgObj(img);
      const canvas = canvasRef.current;
      const MAX_WIDTH = 1500;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
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
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      scaleX
    };
  };

  const handlePointerDown = (e) => {
    const pos = getPointerPos(e);
    if (!pos || !imgObj) return;
    
    const canvas = canvasRef.current;
    const topY = bounds.top * canvas.height;
    const bottomY = bounds.bottom * canvas.height;
    const leftX = bounds.left * canvas.width;
    const rightX = bounds.right * canvas.width;
    
    const hitDist = 30 * pos.scaleX; 

    const distTL = Math.hypot(pos.x - leftX, pos.y - topY);
    const distTR = Math.hypot(pos.x - rightX, pos.y - topY);
    const distBL = Math.hypot(pos.x - leftX, pos.y - bottomY);
    const distBR = Math.hypot(pos.x - rightX, pos.y - bottomY);

    if (distTL < hitDist) { setDraggingHandle('tl'); return; }
    if (distTR < hitDist) { setDraggingHandle('tr'); return; }
    if (distBL < hitDist) { setDraggingHandle('bl'); return; }
    if (distBR < hitDist) { setDraggingHandle('br'); return; }

    if (Math.abs(pos.y - topY) < hitDist && pos.x > leftX && pos.x < rightX) { setDraggingHandle('top'); return; }
    if (Math.abs(pos.y - bottomY) < hitDist && pos.x > leftX && pos.x < rightX) { setDraggingHandle('bottom'); return; }
    if (Math.abs(pos.x - leftX) < hitDist && pos.y > topY && pos.y < bottomY) { setDraggingHandle('left'); return; }
    if (Math.abs(pos.x - rightX) < hitDist && pos.y > topY && pos.y < bottomY) { setDraggingHandle('right'); return; }
    
    if (pos.x > leftX && pos.x < rightX && pos.y > topY && pos.y < bottomY) {
      setDraggingHandle('center');
      dragOffsetRef.current = {
        x: pos.x / canvas.width - bounds.left,
        y: pos.y / canvas.height - bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top
      };
      return;
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingHandle || !imgObj) return;
    if (e.cancelable && e.type === "touchmove") {
      e.preventDefault();
    }
    const pos = getPointerPos(e);
    if (!pos) return;
    
    const canvas = canvasRef.current;
    let px = Math.max(0, Math.min(1, pos.x / canvas.width));
    let py = Math.max(0, Math.min(1, pos.y / canvas.height));
    
    setBounds(prev => {
      let next = { ...prev };
      const minSize = 0.1;
      
      if (draggingHandle === "tl") { next.top = Math.min(py, next.bottom - minSize); next.left = Math.min(px, next.right - minSize); }
      if (draggingHandle === "tr") { next.top = Math.min(py, next.bottom - minSize); next.right = Math.max(px, next.left + minSize); }
      if (draggingHandle === "bl") { next.bottom = Math.max(py, next.top + minSize); next.left = Math.min(px, next.right - minSize); }
      if (draggingHandle === "br") { next.bottom = Math.max(py, next.top + minSize); next.right = Math.max(px, next.left + minSize); }
      
      if (draggingHandle === "top") next.top = Math.min(py, next.bottom - minSize);
      if (draggingHandle === "bottom") next.bottom = Math.max(py, next.top + minSize);
      if (draggingHandle === "left") next.left = Math.min(px, next.right - minSize);
      if (draggingHandle === "right") next.right = Math.max(px, next.left + minSize);
      
      if (draggingHandle === "center") {
        const offset = dragOffsetRef.current;
        let newLeft = px - offset.x;
        let newTop = py - offset.y;
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + offset.width > 1) newLeft = 1 - offset.width;
        if (newTop + offset.height > 1) newTop = 1 - offset.height;
        next.left = newLeft;
        next.right = newLeft + offset.width;
        next.top = newTop;
        next.bottom = newTop + offset.height;
      }
      return next;
    });
  };

  const handlePointerUp = () => {
    setDraggingHandle(null);
  };

  useEffect(() => {
    if (draggingHandle) {
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [draggingHandle]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!imgObj) return;
    setIsProcessing(true);
    try {
      const glyphs = await processTemplateImage(imgObj, bounds);
      onExtract(glyphs);
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-white'}`}>
      <header className={`flex items-center justify-between p-3 sm:p-4 border-b ${borderColor} ${bgSecondary} shrink-0 shadow-sm z-10`}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setAppMode('paper-setup')}
            className={`p-1.5 sm:p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition shrink-0`}
            title="Back to Setup"
          >
            <ArrowLeft className={textSecondary} size={20} />
          </button>
          <div className="min-w-0">
            <h1 className={`text-base sm:text-lg font-bold ${textPrimary} truncate`}>Template Scanner</h1>
            <p className={`text-xs ${textSecondary} truncate`}>Align the grid to your handwriting</p>
          </div>
        </div>
        
        {imageSrc && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setImageSrc(null)}
              className={`hidden sm:block px-4 py-2 rounded-xl font-semibold text-sm transition ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleExtract}
              disabled={isProcessing}
              className={`flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl font-bold text-sm text-white transition ${isProcessing ? 'bg-gray-500 cursor-wait' : 'bg-green-600 hover:bg-green-500'}`}
            >
              <span>{isProcessing ? 'Processing...' : 'Extract'}</span>
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className={`flex-1 flex items-center justify-center p-0 sm:p-6 overflow-hidden ${!imageSrc ? '' : (darkMode ? 'bg-black/40' : 'bg-gray-200')} transition-colors relative touch-none select-none`}>
          {!imageSrc ? (
            <div className="flex flex-col items-center max-w-lg w-full animate-fadeIn p-4">
              <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Upload size={40} />
              </div>
              <h2 className={`text-3xl font-bold ${textPrimary} mb-4 text-center`}>Upload your scanned template</h2>
              <p className={`${textSecondary} text-center mb-8`}>Make sure the photo is well-lit and all four corner markers are visible for best results.</p>
              
              <label className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'} rounded-2xl cursor-pointer transition-all shadow-sm group`}>
                <span className={`text-lg font-bold ${textPrimary} mb-2 group-hover:text-blue-500 transition-colors`}>Click to browse files</span>
                <span className={`text-sm ${textSecondary}`}>Supports JPG, PNG</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              className={`max-w-full max-h-full object-contain shadow-2xl sm:border ${darkMode ? 'border-gray-700' : 'border-gray-300'} ${draggingHandle ? (draggingHandle === 'center' ? 'cursor-move' : 'cursor-pointer') : 'cursor-default'}`} 
            />
          )}

          {imageSrc && (
            <div className="absolute bottom-4 left-4 right-4 sm:hidden flex gap-2 animate-fadeIn z-20">
              <button
                onClick={() => setImageSrc(null)}
                className={`flex-1 py-3 rounded-xl font-bold shadow-lg ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl font-bold shadow-lg text-white ${isProcessing ? 'bg-gray-500' : 'bg-green-600'}`}
              >
                {isProcessing ? 'Processing' : 'Extract Vectors'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
