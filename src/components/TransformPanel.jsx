import React, { useState } from 'react';
import { RotateCw, ZoomIn, X } from 'lucide-react';

export default function TransformPanel({
  showTransform,
  setShowTransform,
  selectedStrokeIndex,
  glyphs,
  activeChar,
  isUpperCase,
  setGlyphs,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
}) {
  const [rotation, setRotation] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  if (!showTransform || selectedStrokeIndex === null) return null;

  const storageKey = /^[A-Za-z]$/.test(activeChar)
    ? (isUpperCase ? activeChar.toUpperCase() : activeChar.toLowerCase())
    : activeChar;

  const stroke = glyphs[storageKey]?.[selectedStrokeIndex];
  if (!stroke) return null;

  const applyTransform = () => {
    const newGlyphs = { ...glyphs };
    const centerX = 250, centerY = 250;
    
    const transformedPoints = stroke.points.map(p => {
      let x = p.x - centerX;
      let y = p.y - centerY;

      // Scale
      x *= scaleX;
      y *= scaleY;

      // Rotate
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newX = x * cos - y * sin;
      const newY = x * sin + y * cos;

      return { x: newX + centerX, y: newY + centerY };
    });

    newGlyphs[storageKey][selectedStrokeIndex] = { points: transformedPoints };
    setGlyphs(newGlyphs);
    setShowTransform(false);
    setRotation(0);
    setScaleX(1);
    setScaleY(1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className={`${bgSecondary} border ${borderColor} rounded-xl shadow-2xl max-w-sm w-full`}>
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Transform Stroke</h3>
          <button
            onClick={() => {
              setShowTransform(false);
              setRotation(0);
              setScaleX(1);
              setScaleY(1);
            }}
            className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Rotation */}
          <div>
            <label className={`text-sm font-bold ${textSecondary} flex items-center gap-2 mb-2`}>
              <RotateCw size={16} />
              Rotation: {rotation}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full cursor-pointer h-1.5"
            />
          </div>

          {/* Scale X */}
          <div>
            <label className={`text-sm font-bold ${textSecondary} flex items-center gap-2 mb-2`}>
              <ZoomIn size={16} />
              Scale X: {scaleX.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scaleX}
              onChange={(e) => setScaleX(parseFloat(e.target.value))}
              className="w-full cursor-pointer h-1.5"
            />
          </div>

          {/* Scale Y */}
          <div>
            <label className={`text-sm font-bold ${textSecondary} flex items-center gap-2 mb-2`}>
              <ZoomIn size={16} />
              Scale Y: {scaleY.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scaleY}
              onChange={(e) => setScaleY(parseFloat(e.target.value))}
              className="w-full cursor-pointer h-1.5"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setRotation(0);
                setScaleX(1);
                setScaleY(1);
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
            >
              Reset
            </button>
            <button
              onClick={applyTransform}
              className={`flex-1 px-3 py-2 text-sm font-bold rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition`}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
