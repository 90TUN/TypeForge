import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { THEMES } from '../utils/themes';

export default function Settings({
  showSettings,
  setShowSettings,
  currentTheme,
  setCurrentTheme,
  gridEnabled,
  setGridEnabled,
  gridSize,
  setGridSize,
  snapToGrid,
  setSnapToGrid,
  guidesEnabled,
  setGuidesEnabled,
  smoothingStrength,
  setSmothingStrength,
  simplifyTolerance,
  setSimplifyTolerance,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
}) {
  if (!showSettings) return null;

  const handleResetSettings = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setGridEnabled(true);
      setGridSize(25);
      setSnapToGrid(true);
      setGuidesEnabled(true);
      setSmothingStrength(3);
      setSimplifyTolerance(2.0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgSecondary} border ${borderColor} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgSecondary}`}>
          <h2 className={`text-lg font-bold ${textPrimary}`}>Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* THEME */}
          <div>
            <h3 className={`text-sm font-bold uppercase ${textSecondary} mb-2`}>Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`p-2 rounded-lg border-2 transition ${
                    currentTheme === key
                      ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100/50'}`
                      : `border-${theme.borderColor} hover:border-blue-400`
                  }`}
                >
                  <span className={`text-xs font-medium ${currentTheme === key ? 'text-blue-500' : textSecondary}`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`border-t ${borderColor}`} />

          {/* GRID SETTINGS */}
          <div>
            <label className={`flex items-start gap-2 cursor-pointer mb-3`}>
              <input
                type="checkbox"
                checked={gridEnabled}
                onChange={(e) => setGridEnabled(e.target.checked)}
                className="w-4 h-4 mt-1 cursor-pointer"
              />
              <div>
                <span className={`text-sm font-bold ${textPrimary}`}>Show Grid</span>
                <p className={`text-xs ${textSecondary}`}>Display grid overlay on canvas</p>
              </div>
            </label>

            {gridEnabled && (
              <div className="ml-6 space-y-2">
                <div>
                  <label className={`text-xs font-bold ${textSecondary} block mb-1`}>
                    Grid Size: {gridSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value))}
                    className="w-full cursor-pointer h-1.5"
                  />
                </div>
                <label className={`flex items-center gap-2 cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${textPrimary}`}>Snap to grid</span>
                </label>
              </div>
            )}
          </div>

          <div className={`border-t ${borderColor}`} />

          {/* GUIDES */}
          <label className={`flex items-start gap-2 cursor-pointer`}>
            <input
              type="checkbox"
              checked={guidesEnabled}
              onChange={(e) => setGuidesEnabled(e.target.checked)}
              className="w-4 h-4 mt-1 cursor-pointer"
            />
            <div>
              <span className={`text-sm font-bold ${textPrimary}`}>Show Guides</span>
              <p className={`text-xs ${textSecondary}`}>Baseline, x-height, cap-height lines</p>
            </div>
          </label>

          <div className={`border-t ${borderColor}`} />

          {/* SMOOTHING */}
          <div>
            <label className={`text-xs font-bold ${textSecondary} block mb-2`}>
              Smoothing Strength: {smoothingStrength}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={smoothingStrength}
              onChange={(e) => setSmothingStrength(parseInt(e.target.value))}
              className="w-full cursor-pointer h-1.5"
            />
            <p className={`text-xs ${textSecondary} mt-1`}>Higher = smoother curves</p>
          </div>

          <div className={`border-t ${borderColor}`} />

          {/* SIMPLIFY */}
          <div>
            <label className={`text-xs font-bold ${textSecondary} block mb-2`}>
              Simplify Tolerance: {simplifyTolerance.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={simplifyTolerance}
              onChange={(e) => setSimplifyTolerance(parseFloat(e.target.value))}
              className="w-full cursor-pointer h-1.5"
            />
            <p className={`text-xs ${textSecondary} mt-1`}>Higher = more aggressive simplification</p>
          </div>

          <div className={`border-t ${borderColor}`} />

          {/* RESET */}
          <button
            onClick={handleResetSettings}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
