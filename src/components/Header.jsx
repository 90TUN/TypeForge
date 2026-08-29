import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Download, Settings, X, Wrench, ArrowLeft } from 'lucide-react';
import { ALPHABET } from '../utils/constants';

function Header({
  darkMode,
  showToolbar,
  setShowToolbar,
  downloadFont,
  otLoaded,
  glyphs,
  bgSecondary,
  borderColor,
  textPrimary,
  showSettings,
  setShowSettings
}) {
  const navigate = useNavigate();
  const allFilled = ALPHABET.every(char => glyphs[char] && glyphs[char].length > 0);

  return (
    <header className={`border-b ${borderColor} ${bgSecondary} px-2 sm:px-6 py-2.5 flex items-center justify-between transition-colors shrink-0`}>
      <div className="flex items-center gap-2 min-w-0">
        <button 
          onClick={() => navigate('/')}
          className={`p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition shrink-0 mr-1`}
          title="Back to start"
        >
          <ArrowLeft className={textPrimary} size={20} />
        </button>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 hidden sm:flex`}>
          <PenTool size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`text-lg sm:text-xl font-bold ${textPrimary} truncate`}>TypeForge</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <button 
          onClick={() => setShowToolbar(!showToolbar)}
          className={`p-2 ${bgSecondary} border ${borderColor} rounded-lg transition hover:opacity-75`}
          title="Toggle toolbar"
        >
          {showToolbar ? <X size={18} /> : <Wrench size={18} />}
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 ${bgSecondary} border ${borderColor} rounded-lg transition hover:opacity-75`}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        <button 
          onClick={downloadFont}
          disabled={!otLoaded || !allFilled}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-lg font-semibold text-xs sm:text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
          title={!allFilled ? "Please draw all characters before exporting" : "Export as .otf font file"}
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}

export default memo(Header);
