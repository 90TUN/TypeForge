import React, { memo } from 'react';
import { Ruler } from 'lucide-react';
import { calculateCharacterMetrics } from '../utils/metrics';

const MetricsPanel = memo(({
  glyphs,
  activeChar,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
}) => {
  const strokes = glyphs[activeChar] || [];
  const metrics = calculateCharacterMetrics(strokes);

  const metricItems = [
    { label: 'Width', value: metrics.width, unit: 'px' },
    { label: 'Height', value: metrics.height, unit: 'px' },
    { label: 'Cap Height', value: metrics.capHeight, unit: 'px' },
    { label: 'Ascender', value: metrics.ascender, unit: 'px' },
    { label: 'Descender', value: metrics.descender, unit: 'px' },
    { label: 'Baseline', value: metrics.baselineDistance, unit: 'px' },
    { label: 'Left', value: metrics.minX, unit: 'px' },
    { label: 'Top', value: metrics.minY, unit: 'px' },
  ];

  return (
    <div className={`border-t ${borderColor} ${bgSecondary} rounded-lg overflow-hidden shrink-0`}>
      {/* Header */}
      <div className={`px-3 py-3 border-b ${borderColor} flex items-center gap-2`}>
        <Ruler size={16} className={textSecondary} />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
          Metrics
        </h3>
        {!metrics.isEmpty && (
          <span className={`ml-auto text-xs ${textSecondary}`}>
            {activeChar}
          </span>
        )}
      </div>

      {/* Content */}
      {metrics.isEmpty ? (
        <div className={`px-3 py-4 flex items-center justify-center`}>
          <p className={`text-xs text-center ${textSecondary}`}>
            Draw a character to see metrics
          </p>
        </div>
      ) : (
        <div className={`divide-y ${borderColor}`}>
          <div className="grid grid-cols-2 gap-2 p-3">
            {metricItems.map(item => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>
                  {item.label}
                </label>
                <div className={`text-sm font-mono ${textPrimary} px-2 py-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${borderColor}`}>
                  {item.value}
                  <span className={`text-xs ${textSecondary} ml-1`}>{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual representation */}
          <div className="p-3">
            <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-2`}>
              Bounds
            </p>
            <div className={`border ${borderColor} rounded p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <svg
                viewBox="0 0 100 120"
                className="w-full h-auto"
                style={{ maxHeight: '120px' }}
              >
                {/* Baseline */}
                <line
                  x1="10"
                  y1="80"
                  x2="90"
                  y2="80"
                  stroke={darkMode ? '#4b5563' : '#d1d5db'}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text x="92" y="83" fontSize="8" fill={darkMode ? '#9ca3af' : '#6b7280'}>
                  BL
                </text>

                {/* Character bounds */}
                <rect
                  x={10 + (metrics.minX / metrics.width) * 70}
                  y={10 + (Math.max(0, 100 - metrics.ascender) / 100) * 60}
                  width={Math.max(5, (metrics.width / (metrics.width || 1)) * 70)}
                  height={Math.max(5, (metrics.height / 100) * 60)}
                  fill={darkMode ? '#3b82f6' : '#60a5fa'}
                  opacity="0.3"
                  stroke={darkMode ? '#1e40af' : '#1d4ed8'}
                  strokeWidth="1"
                />

                {/* Cap height indicator */}
                <line
                  x1="5"
                  y1={10 + (Math.max(0, 100 - metrics.capHeight) / 100) * 60}
                  x2="8"
                  y2={10 + (Math.max(0, 100 - metrics.capHeight) / 100) * 60}
                  stroke={darkMode ? '#ec4899' : '#f43f5e'}
                  strokeWidth="2"
                />
                <text
                  x="92"
                  y={13 + (Math.max(0, 100 - metrics.capHeight) / 100) * 60}
                  fontSize="8"
                  fill={darkMode ? '#9ca3af' : '#6b7280'}
                >
                  CH
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MetricsPanel.displayName = 'MetricsPanel';

export default MetricsPanel;
