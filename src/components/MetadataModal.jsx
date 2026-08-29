import React from 'react';
import { X, Download } from 'lucide-react';

export default function MetadataModal({
  show,
  setShow,
  metadata,
  setMetadata,
  onDownload,
  darkMode,
  bgSecondary,
  borderColor,
  textPrimary,
  textSecondary,
}) {
  if (!show) return null;

  const handleChange = (e) => {
    setMetadata(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDownload = () => {
    // Save metadata to localStorage
    localStorage.setItem('typeForgeMetadata', JSON.stringify(metadata));
    setShow(false);
    onDownload();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`${bgSecondary} border ${borderColor} rounded-xl shadow-2xl max-w-md w-full animate-fadeIn`}>
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
          <h2 className={`text-lg font-bold ${textPrimary}`}>Export Font</h2>
          <button
            onClick={() => setShow(false)}
            className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1`}>Font Family Name</label>
            <input
              type="text"
              name="family"
              value={metadata.family || ''}
              onChange={handleChange}
              placeholder="e.g. My Awesome Font"
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:border-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1`}>Author</label>
            <input
              type="text"
              name="author"
              value={metadata.author || ''}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:border-blue-500`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1`}>Version</label>
              <input
                type="text"
                name="version"
                value={metadata.version || ''}
                onChange={handleChange}
                placeholder="1.0"
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:border-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1`}>Copyright</label>
              <input
                type="text"
                name="copyright"
                value={metadata.copyright || ''}
                onChange={handleChange}
                placeholder="© 2026"
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:border-blue-500`}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleDownload}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white transition-transform active:scale-95 ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              <Download size={18} />
              Bake & Download .otf
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

