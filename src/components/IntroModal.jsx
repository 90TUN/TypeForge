import React from 'react';
import { Type } from 'lucide-react';

export default function IntroModal({
  showIntro,
  setShowIntro,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  if (!showIntro) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${darkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm transition-colors`}>
      <div className={`max-w-md w-full ${bgSecondary} border ${borderColor} rounded-2xl p-6 shadow-2xl transition-colors`}>
        <div className={`w-10 h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center mb-4`}>
          <Type className="text-white" size={24} />
        </div>
        <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Welcome</h2>
        <p className={`${textSecondary} text-xs leading-relaxed mb-4`}>
          Sketch characters to create fonts. Tools in the ☰ menu. Responsive design fits any screen!
        </p>
        <button 
          onClick={() => setShowIntro(false)}
          className={`w-full py-2.5 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-lg font-bold transition-colors text-sm`}
        >
          Start
        </button>
      </div>
    </div>
  );
}
