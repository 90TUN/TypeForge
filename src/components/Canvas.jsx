import React, { useState, useRef } from 'react';
import { Copy, Clipboard, HelpCircle, X, Eye } from 'lucide-react';
import { CANVAS_SIZE } from '../utils/constants';

export default function Canvas({
  svgRef,
  activeChar,
  glyphs,
  currentStroke,
  strokeWidth,
  darkMode,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  deleteStroke,
  clearCurrentChar,
  bgPrimary,
  textPrimary,
  textSecondary,
  isUpperCase,
  setIsUpperCase,
  gridEnabled,
  gridSize,
  snapToGrid,
  guidesEnabled,
  copyGlyph,
  pasteGlyph,
  clipboard,
  showPreviewModal,
  setShowPreviewModal,
  charRotation,
  setCharRotation,
  currentCharKey
}) {
  const [showGuideHelp, setShowGuideHelp] = useState(false);
  const [activePenId, setActivePenId] = useState(null);
  const pointerIdRef = useRef(new Set());
  const rafIdRef = useRef(null);
  const isLetter = /^[A-Za-z]$/.test(activeChar);
  const displayChar = isLetter && !isUpperCase ? activeChar.toLowerCase() : activeChar;
  const storageKey = isLetter
    ? (isUpperCase ? activeChar.toUpperCase() : activeChar.toLowerCase())
    : activeChar;

  // Helper function to rotate a point around canvas center
  const rotatePoint = (point, angle) => {
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const x = point.x - centerX;
    const y = point.y - centerY;
    
    return {
      x: x * cos - y * sin + centerX,
      y: x * sin + y * cos + centerY
    };
  };

  // Get current rotation angle
  const currentRotation = charRotation[currentCharKey] ?? 0;

  // Pointer event handlers with palm rejection and pressure sensitivity
  const handlePointerDown = (e) => {
    // Pen and mouse events (primary pointers)
    if (e.isPrimary) {
      if (e.pointerType === 'pen') {
        setActivePenId(e.pointerId);
      }
      const eventData = {
        clientX: e.clientX,
        clientY: e.clientY,
        pressure: e.pressure || 0.5,
        pointerType: e.pointerType,
        preventDefault: () => e.preventDefault()
      };
      handleMouseDown(eventData);
    }
    // Ignore non-primary touch points (multi-touch)
    pointerIdRef.current.add(e.pointerId);
  };

  const handlePointerMove = (e) => {
    // Only process primary pointer or pen
    if (e.isPrimary || (activePenId && e.pointerId === activePenId)) {
      // Throttle move events using requestAnimationFrame
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const eventData = {
          clientX: e.clientX,
          clientY: e.clientY,
          pressure: e.pressure || 0.5,
          pointerType: e.pointerType,
          preventDefault: () => e.preventDefault()
        };
        handleMouseMove(eventData);
      });
    }
  };

  const handlePointerUp = (e) => {
    if (e.isPrimary || (activePenId && e.pointerId === activePenId)) {
      handleMouseUp({});
      if (e.pointerId === activePenId) {
        setActivePenId(null);
      }
    }
    pointerIdRef.current.delete(e.pointerId);
  };

  const handlePointerCancel = (e) => {
    if (e.pointerId === activePenId) {
      setActivePenId(null);
    }
    pointerIdRef.current.delete(e.pointerId);
  };

  // Touch event handlers - coordinates are scaled in App.jsx getMousePos
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, pressure: 0.5, preventDefault: () => {} });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, pressure: 0.5, preventDefault: () => {} });
  };

  return (
    <section className={`flex flex-col items-center justify-center p-2 sm:p-4 ${bgPrimary} relative overflow-hidden`}>
      <div className="mb-2 shrink-0 flex items-center gap-3 flex-wrap relative">
        <h2 className={`text-xl sm:text-2xl font-bold ${textSecondary}`}>{displayChar}</h2>
        {isLetter && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsUpperCase(true)}
              className={`px-2 py-1 text-xs font-bold rounded transition ${
                isUpperCase
                  ? `${darkMode ? 'bg-blue-900 text-white' : 'bg-blue-500 text-white'}`
                  : `${darkMode ? 'border border-gray-700 text-gray-400 hover:text-white' : 'border border-gray-300 text-gray-600 hover:text-black'}`
              }`}
            >
              UPPER
            </button>
            <button
              onClick={() => setIsUpperCase(false)}
              className={`px-2 py-1 text-xs font-bold rounded transition ${
                !isUpperCase
                  ? `${darkMode ? 'bg-blue-900 text-white' : 'bg-blue-500 text-white'}`
                  : `${darkMode ? 'border border-gray-700 text-gray-400 hover:text-white' : 'border border-gray-300 text-gray-600 hover:text-black'}`
              }`}
            >
              lower
            </button>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={copyGlyph}
            className={`p-1.5 rounded transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            title="Copy strokes"
          >
            <Copy size={14} className={textSecondary} />
          </button>
          <button
            onClick={pasteGlyph}
            disabled={!clipboard}
            className={`p-1.5 rounded transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-40' : 'bg-gray-300 hover:bg-gray-400 disabled:opacity-40'}`}
            title="Paste strokes"
          >
            <Clipboard size={14} className={textSecondary} />
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className={`p-1.5 rounded transition lg:hidden ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            title="Preview (mobile)"
          >
            <Eye size={14} className={textSecondary} />
          </button>
        </div>
        <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-lg border border-gray-500">
          <label className={`text-xs font-bold ${textSecondary}`}>Rotate:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={charRotation[currentCharKey] ?? 0}
            onChange={(e) => setCharRotation(prev => ({ ...prev, [currentCharKey]: parseInt(e.target.value) }))}
            className="w-20 cursor-pointer h-1.5"
          />
          <span className={`text-xs font-bold ${textSecondary} w-10 text-right`}>{charRotation[currentCharKey] ?? 0}°</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowGuideHelp(!showGuideHelp)}
            className={`p-1.5 rounded-full transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            title="Guide help"
          >
            <HelpCircle size={16} className={textSecondary} />
          </button>
          {/* Guide Help Popup */}
          {showGuideHelp && (
            <div className={`absolute top-full right-0 mt-2 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg shadow-2xl p-4 w-64 whitespace-normal`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-sm font-bold ${textPrimary}`}>Guide Lines</h3>
                <button
                  onClick={() => setShowGuideHelp(false)}
                  className={`p-0.5 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <X size={16} className={textSecondary} />
                </button>
              </div>
              <div className={`space-y-2.5 text-xs ${textSecondary}`}>
                <div className="flex gap-2 items-start">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-red-600">Baseline (60%)</div>
                    <div>Letters sit on this line, like 'a', 'e', 'n'</div>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-orange-600">X-height (35%)</div>
                    <div>Height of lowercase letters like 'x', 'a', 'e'</div>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-blue-600">Cap-height (10%)</div>
                    <div>Top of capitals (A, B, C) and ascenders (b, d, h, k, l)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full min-h-0">
        <svg
          ref={svgRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg shadow-lg cursor-crosshair touch-none border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors max-w-full max-h-full`}
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Grid Background */}
          <defs>
            {gridEnabled && (
              <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={darkMode ? '#444' : '#ddd'} strokeWidth="0.5" />
              </pattern>
            )}
          </defs>
          {gridEnabled && <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#grid)" />}

          {/* GUIDES */}
          {guidesEnabled && (
            <>
              {/* Baseline - 60% */}
              <line
                x1="0"
                y1={CANVAS_SIZE * 0.6}
                x2={CANVAS_SIZE}
                y2={CANVAS_SIZE * 0.6}
                stroke={darkMode ? '#ef4444' : '#dc2626'}
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.7"
                className="animate-pulse"
              />
              
              {/* X-height - 35% */}
              <line
                x1="0"
                y1={CANVAS_SIZE * 0.35}
                x2={CANVAS_SIZE}
                y2={CANVAS_SIZE * 0.35}
                stroke={darkMode ? '#f59e0b' : '#d97706'}
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.6"
                className="animate-pulse"
              />
              
              {/* Cap-height & Ascender - 10% (same line for both) */}
              <line
                x1="0"
                y1={CANVAS_SIZE * 0.1}
                x2={CANVAS_SIZE}
                y2={CANVAS_SIZE * 0.1}
                stroke={darkMode ? '#60a5fa' : '#2563eb'}
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.6"
                className="animate-pulse"
              />
            </>
          )}

          {/* Draw existing strokes */}
          {(glyphs[storageKey] || []).map((stroke, i) => {
            const rotatedPoints = currentRotation !== 0 
              ? stroke.points.map(p => rotatePoint(p, currentRotation))
              : stroke.points;
            const rotatedFirstPoint = currentRotation !== 0 
              ? rotatePoint(stroke.points[0], currentRotation)
              : stroke.points[0];
            
            // Check if stroke has pressure data
            const hasPressure = stroke.hasPresssure || stroke.points.some(p => p.pressure && p.pressure !== 0.5);
            
            return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => deleteStroke(storageKey, i)} title={`Click to delete stroke ${i + 1}`}>
              {hasPressure ? (
                // Render with pressure-aware circles
                <>
                  {rotatedPoints.map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r={Math.max((strokeWidth / 2) * (point.pressure ?? 0.5), 1)}
                      fill={darkMode ? 'white' : 'black'}
                      opacity="0.8"
                    />
                  ))}
                </>
              ) : (
                // Standard polyline for non-pressure strokes
                <polyline
                  points={rotatedPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={darkMode ? 'white' : 'black'}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.8 }}
                />
              )}
              <circle
                cx={rotatedFirstPoint?.x}
                cy={rotatedFirstPoint?.y}
                r="6"
                fill={darkMode ? '#ef4444' : '#dc2626'}
                opacity="0"
                className="hover:opacity-100 transition-opacity"
              />
            </g>
            );
          })}

          {/* Current stroke being drawn - render with pressure-aware circles */}
          {currentStroke.map((point, idx) => {
            const pressure = point.pressure ?? 0.5;
            const radiusBase = (strokeWidth / 2) * pressure; // Radius scales with pressure
            return (
              <circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r={Math.max(radiusBase, 1)}
                fill="#3b82f6"
                opacity="0.7"
              />
            );
          })}
        </svg>
      </div>

      <div className={`mt-2 shrink-0 text-xs ${textSecondary}`}>
        {(glyphs[storageKey] || []).length} stroke{(glyphs[storageKey] || []).length !== 1 ? 's' : ''} • {Math.round(CANVAS_SIZE * 0.9)}×{Math.round(CANVAS_SIZE * 0.9)}
      </div>

      {/* Clear Current Character */}
      <button 
        onClick={clearCurrentChar}
        className={`mt-2 px-4 py-2 text-sm font-bold rounded-lg transition ${darkMode ? 'bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50' : 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'}`}
      >
        Clear Current
      </button>
    </section>
  );
}
