import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Type } from 'lucide-react';

export default function FontTester({
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const [fontUrl, setFontUrl] = useState(null);
  const [fontName, setFontName] = useState('');
  const [testText, setTestText] = useState('The quick brown fox jumps over the lazy dog.\n\n1234567890\n\n!@#$%^&*()_+');
  const [fontSize, setFontSize] = useState(48);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFontUrl(url);
      setFontName(file.name);
    }
  };

  useEffect(() => {
    if (fontUrl) {
      const style = document.createElement('style');
      style.innerHTML = `
        @font-face {
          font-family: 'CustomTestFont';
          src: url('${fontUrl}');
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [fontUrl]);

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} animate-fadeIn`}>
      {/* Header */}
      <header className={`flex items-center p-3 sm:p-4 border-b ${borderColor} ${bgSecondary} shrink-0 shadow-sm z-10`}>
        <button 
          onClick={() => setAppMode('intro')}
          className={`p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition shrink-0 mr-4`}
          title="Back to Setup"
        >
          <ArrowLeft className={textPrimary} size={20} />
        </button>
        <div>
          <h1 className={`text-lg sm:text-xl font-bold ${textPrimary}`}>Font Tester</h1>
          <p className={`text-xs ${textSecondary}`}>Upload any font file to preview it</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        {!fontUrl ? (
          <div className={`max-w-md w-full ${bgSecondary} border ${borderColor} rounded-2xl p-8 shadow-xl text-center flex flex-col items-center`}>
            <div className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-600'}`}>
              <Upload size={32} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Upload a Font</h2>
            <p className={`${textSecondary} text-sm mb-8`}>Select any .otf, .ttf, .woff, or .woff2 file from your device to test it instantly.</p>
            
            <label className={`w-full py-4 border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-green-500 hover:bg-gray-800' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'} rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center group`}>
              <span className={`font-bold ${textPrimary} group-hover:text-green-500 transition-colors`}>Browse Files</span>
              <input type="file" accept=".otf,.ttf,.woff,.woff2" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col max-w-5xl mx-auto gap-4">
            <div className={`flex items-center justify-between p-4 ${bgSecondary} border ${borderColor} rounded-xl shadow-sm shrink-0 flex-wrap gap-4`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800 text-green-400' : 'bg-green-100 text-green-600'} shrink-0`}>
                  <Type size={20} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs ${textSecondary} uppercase font-bold tracking-wider mb-0.5`}>Current Font</p>
                  <p className={`font-bold ${textPrimary} truncate`}>{fontName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className={`text-xs font-bold ${textSecondary} uppercase`}>Size</label>
                  <input 
                    type="range" 
                    min="12" 
                    max="144" 
                    value={fontSize} 
                    onChange={e => setFontSize(e.target.value)}
                    className="w-24 sm:w-32 accent-green-500"
                  />
                  <span className={`text-sm ${textPrimary} w-8 text-right`}>{fontSize}</span>
                </div>
                
                <button 
                  onClick={() => { setFontUrl(null); setFontName(''); }}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-200'} transition-colors`}
                >
                  Change
                </button>
              </div>
            </div>

            <div className={`flex-1 ${bgSecondary} border ${borderColor} rounded-xl shadow-sm overflow-hidden flex flex-col relative`}>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                style={{ fontFamily: 'CustomTestFont', fontSize: `${fontSize}px` }}
                className={`w-full h-full p-6 sm:p-10 bg-transparent resize-none focus:outline-none ${textPrimary}`}
                placeholder="Start typing to test your font..."
                spellCheck="false"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

