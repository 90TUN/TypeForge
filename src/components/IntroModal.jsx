import React from 'react';
import { Type, PenTool, Printer } from 'lucide-react';

export default function IntroModal({
  showIntro,
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  if (!showIntro) return null;

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} items-center justify-center p-4 transition-colors animate-fadeIn`}>
      <div className={`max-w-xl w-full ${bgSecondary} border ${borderColor} rounded-2xl p-6 sm:p-10 shadow-2xl transition-colors`}>
        <div className={`w-12 h-12 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl flex items-center justify-center mb-6`}>
          <Type className="text-white" size={28} />
        </div>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Welcome to TypeForge</h2>
        <p className={`${textSecondary} text-sm mb-8`}>
          How would you like to build your font today?
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setAppMode('digital')}
            className={`flex flex-col items-center text-center p-6 border-2 ${darkMode ? 'border-gray-700 hover:border-blue-500 bg-gray-800' : 'border-gray-200 hover:border-blue-500 bg-gray-50'} rounded-xl transition-all hover:scale-105 active:scale-95 group`}
          >
            <PenTool size={48} className={`mb-4 ${darkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`} />
            <h3 className={`font-bold ${textPrimary} mb-2`}>Digital Drawing</h3>
            <p className={`text-xs ${textSecondary}`}>
              Draw your characters directly in the browser using your mouse or a digital stylus.
            </p>
          </button>

          <button 
            onClick={() => setAppMode('paper-setup')}
            className={`flex flex-col items-center text-center p-6 border-2 ${darkMode ? 'border-gray-700 hover:border-blue-500 bg-gray-800' : 'border-gray-200 hover:border-blue-500 bg-gray-50'} rounded-xl transition-all hover:scale-105 active:scale-95 group`}
          >
            <Printer size={48} className={`mb-4 ${darkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`} />
            <h3 className={`font-bold ${textPrimary} mb-2`}>Paper Template</h3>
            <p className={`text-xs ${textSecondary}`}>
              Print a template, draw with a real pen, and scan it back in to extract your handwriting.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
