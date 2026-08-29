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
    try {
      const blob = await generateTemplateImage();
      const file = new File([blob], 'TypeForge-Template.png', { type: 'image/png' });
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Only use native share on mobile devices. Desktop should always direct-download.
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'TypeForge Template',
          text: 'Print this template to draw your font!',
        });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'TypeForge-Template.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-[#0f1115]' : 'bg-gray-100'} overflow-y-auto animate-fadeIn`}>
      <header className={`sticky top-0 flex items-center justify-between p-3 sm:p-6 border-b ${borderColor} ${bgSecondary} shrink-0 shadow-sm z-20 gap-2`}>
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

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className={`max-w-5xl w-full flex flex-col md:flex-row gap-8 sm:gap-16`}>
          
          {/* Left Side: Visual Preview */}
          <div className="flex-1 flex flex-col items-center justify-center hidden md:flex" style={{ perspective: '1000px' }}>
            <div 
              className={`relative w-[320px] h-[452px] ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded shadow-2xl border ${borderColor} p-5 flex flex-col transition-transform duration-500 hover:rotate-0`}
              style={{ transform: 'rotateY(-15deg) rotateX(10deg)' }}
            >
              {/* Fake Registration Marks */}
              <div className="absolute top-3 left-3 w-4 h-4 border-[3px] border-black rounded-sm" />
              <div className="absolute top-3 right-3 w-4 h-4 border-[3px] border-black rounded-sm" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-[3px] border-black rounded-sm" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-[3px] border-black rounded-sm" />
              
              <div className={`text-center font-bold text-[10px] mt-1 mb-5 uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>TypeForge Template</div>
              
              {/* Fake Grid */}
              <div className={`flex-1 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-800'} grid grid-cols-4 grid-rows-6 gap-0`}>
                {Array.from({length: 24}).map((_, i) => (
                  <div key={i} className={`border ${darkMode ? 'border-gray-700' : 'border-gray-300'} relative flex items-end p-1`}>
                    <div className={`absolute bottom-[35%] left-0 w-full border-t border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <div className={`absolute bottom-[60%] left-0 w-full border-t border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <span className={`text-[10px] font-bold ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Instructions */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-4`}>Digitize your handwriting</h2>
            <p className={`${textSecondary} text-base sm:text-lg mb-12`}>
              No digital pen required. Just print out our template, draw your alphabet with a dark pen, and snap a picture.
            </p>

            <div className="space-y-10 relative">
              {/* Connecting vertical line */}
              <div className={`absolute left-[23px] top-[40px] bottom-[60px] w-0.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} hidden sm:block`} />

              {/* Step 1 */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 ${darkMode ? 'bg-gray-900 border-[#0f1115] text-blue-400' : 'bg-gray-100 border-gray-100 text-blue-600'} shadow-sm`}>
                  <Printer size={20} />
                </div>
                <div className="pt-0 sm:pt-2">
                  <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>1. Print & Draw</h3>
                  <p className={`${textSecondary} mb-5 text-sm sm:text-base`}>
                    Download the A4 template. Fill in all the boxes carefully using a black pen or marker.
                  </p>
                  <button 
                    onClick={handleDownloadTemplate}
                    className={`px-6 py-2.5 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-xl font-bold transition-colors shadow-md text-sm w-full sm:w-auto`}
                  >
                    Download Template
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 ${darkMode ? 'bg-gray-900 border-[#0f1115] text-blue-400' : 'bg-gray-100 border-gray-100 text-blue-600'} shadow-sm`}>
                  <Upload size={20} />
                </div>
                <div className="pt-0 sm:pt-2">
                  <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>2. Scan & Upload</h3>
                  <p className={`${textSecondary} mb-5 text-sm sm:text-base`}>
                    Take a clear, well-lit photo of your completed page. Ensure all 4 corner registration marks are visible!
                  </p>
                  <button 
                    onClick={() => setAppMode('scanner')}
                    className={`px-6 py-2.5 ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-xl font-bold transition-colors shadow-md text-sm flex items-center justify-center gap-2 w-full sm:w-auto`}
                  >
                    Upload Photo
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
