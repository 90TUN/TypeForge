import React, { useState } from 'react';
import { Type, PenTool, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

export default function IntroModal({
  showIntro,
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!showIntro) return null;

  const options = [
    {
      id: 'digital',
      icon: PenTool,
      title: 'Digital Drawing',
      desc: 'Draw your characters directly in the browser using your mouse or a digital stylus.',
      hoverBorder: darkMode ? 'hover:border-blue-500' : 'hover:border-blue-500',
      iconHover: darkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-500'
    },
    {
      id: 'paper-setup',
      icon: Printer,
      title: 'Paper Template',
      desc: 'Print a template, draw with a real pen, and scan it back in to extract your handwriting.',
      hoverBorder: darkMode ? 'hover:border-blue-500' : 'hover:border-blue-500',
      iconHover: darkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-500'
    },
    {
      id: 'preview',
      icon: Type,
      title: 'Test a Font',
      desc: 'Upload an existing .otf or .ttf file to preview and type with it instantly in the browser.',
      hoverBorder: darkMode ? 'hover:border-green-500' : 'hover:border-green-500',
      iconHover: darkMode ? 'group-hover:text-green-400' : 'group-hover:text-green-500'
    }
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % options.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
  };

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} items-center justify-center p-4 transition-colors animate-fadeIn`}>
      <div className={`max-w-4xl w-full ${bgSecondary} border ${borderColor} rounded-2xl p-6 sm:p-10 shadow-2xl transition-colors`}>
        <div className={`w-12 h-12 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl flex items-center justify-center mb-6`}>
          <Type className="text-white" size={28} />
        </div>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Welcome to TypeForge</h2>
        <p className={`${textSecondary} text-sm mb-8`}>
          How would you like to build your font today?
        </p>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {options.map((opt) => (
            <button 
              key={opt.id}
              onClick={() => setAppMode(opt.id)}
              className={`flex flex-col items-center text-center p-6 border-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} ${opt.hoverBorder} rounded-xl transition-all hover:scale-105 active:scale-95 group`}
            >
              <opt.icon size={48} className={`mb-4 text-gray-400 ${opt.iconHover}`} />
              <h3 className={`font-bold ${textPrimary} mb-2`}>{opt.title}</h3>
              <p className={`text-xs ${textSecondary}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="sm:hidden flex flex-col items-center relative w-full overflow-hidden">
          <div className="w-full flex items-center justify-between gap-1">
            <button 
              onClick={handlePrev}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-200'} shadow-md border ${borderColor} z-10 shrink-0`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex-1 overflow-hidden relative" style={{ touchAction: 'pan-y' }}>
              <div 
                className="flex transition-transform duration-300 ease-in-out w-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {options.map((opt, i) => (
                  <div key={opt.id} className="w-full shrink-0 flex justify-center px-1">
                    <button 
                      onClick={() => setAppMode(opt.id)}
                      className={`w-full flex flex-col items-center text-center p-6 border-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} ${opt.hoverBorder} rounded-xl transition-all active:scale-95 group`}
                    >
                      <opt.icon size={48} className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${opt.iconHover}`} />
                      <h3 className={`font-bold ${textPrimary} mb-2`}>{opt.title}</h3>
                      <p className={`text-xs ${textSecondary} h-12 flex items-center justify-center`}>
                        {opt.desc}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleNext}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-200'} shadow-md border ${borderColor} z-10 shrink-0`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {options.map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeIndex ? (darkMode ? 'bg-blue-500' : 'bg-blue-500') : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
