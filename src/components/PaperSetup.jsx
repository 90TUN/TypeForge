import React from 'react';
import { ArrowLeft, Printer, Upload } from 'lucide-react';
import { generateTemplateImage } from '../utils/templateGenerator';

export default function PaperSetup({
  setAppMode,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary
}) {
  const handleDownloadTemplate = async () => {
    const dataUrl = await generateTemplateImage();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'TypeForge-Template.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} overflow-y-auto animate-fadeIn`}>
      <header className={`flex items-center justify-between p-3 sm:p-6 border-b ${borderColor} ${bgSecondary} shrink-0 shadow-sm z-10 gap-2`}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setAppMode('intro')}
            className={`p-1.5 sm:p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition shrink-0`}
            title="Back to start"
          >
            <ArrowLeft className={textSecondary} size={20} />
          </button>
          <div className="min-w-0">
            <h1 className={`text-base sm:text-xl font-bold ${textPrimary} truncate`}>Paper Workflow</h1>
            <p className={`text-xs sm:text-sm ${textSecondary} truncate`}>Setup Instructions</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`max-w-4xl w-full ${bgSecondary} border ${borderColor} rounded-2xl p-8 sm:p-12 shadow-xl`}>
          <h2 className={`text-3xl font-bold ${textPrimary} mb-4 text-center`}>Digitize your handwriting</h2>
          <p className={`${textSecondary} text-center mb-10 max-w-xl mx-auto`}>
            Follow these two simple steps to turn your physical handwriting into a digital font.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`w-12 h-12 mb-6 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}>
                <Printer size={24} />
              </div>
              <h3 className={`text-xl font-bold ${textPrimary} mb-3`}>Step 1: Print & Draw</h3>
              <p className={`${textSecondary} mb-8`}>
                Download the official TypeForge template. Print it on standard A4 paper and carefully fill in the boxes with a dark pen or marker.
              </p>
              <button 
                onClick={handleDownloadTemplate}
                className={`w-full py-3 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-xl font-bold transition-colors shadow-md`}
              >
                Download Template
              </button>
            </div>

            <div className={`p-8 rounded-2xl border ${darkMode ? 'border-blue-900/50 bg-blue-900/20' : 'border-blue-100 bg-blue-50'}`}>
              <div className={`w-12 h-12 mb-6 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                <Upload size={24} />
              </div>
              <h3 className={`text-xl font-bold ${textPrimary} mb-3`}>Step 2: Scan & Upload</h3>
              <p className={`${textSecondary} mb-8`}>
                Take a clear, well-lit photo of your completed template. Upload it here, and we will extract your letters into vector paths!
              </p>
              <button 
                onClick={() => setAppMode('scanner')}
                className={`w-full py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} rounded-xl font-bold transition-colors shadow-md`}
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
