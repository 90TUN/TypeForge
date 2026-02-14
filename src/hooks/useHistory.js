import { useCallback, useMemo } from 'react';

export const useHistory = (
  charHistory,
  charHistoryIndex,
  glyphs,
  setGlyphs,
  setCharHistory,
  setCharHistoryIndex,
  getCurrentCharKey,
  addToast,
  setCharRotation
) => {
  const currentHistory = useMemo(() => {
    const key = getCurrentCharKey();
    return charHistory[key] || [{}];
  }, [charHistory, getCurrentCharKey]);

  const currentHistoryIndex = useMemo(() => {
    const key = getCurrentCharKey();
    return charHistoryIndex[key] ?? 0;
  }, [charHistoryIndex, getCurrentCharKey]);

  const updateHistory = useCallback((charKey, newCharGlyphs) => {
    setCharHistory(prev => {
      const updated = { ...prev };
      const history = updated[charKey] || [null];
      const currentIndex = charHistoryIndex[charKey] ?? 0;
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newCharGlyphs);
      updated[charKey] = newHistory;
      return updated;
    });
    setCharHistoryIndex(prev => ({
      ...prev,
      [charKey]: (charHistory[charKey]?.length ?? 1)
    }));
  }, [charHistory, charHistoryIndex, setCharHistory, setCharHistoryIndex]);

  const undo = useCallback(() => {
    const charKey = getCurrentCharKey();
    const history = charHistory[charKey] || [{}];
    const index = charHistoryIndex[charKey] ?? 0;
    
    if (index > 0) {
      const newIndex = index - 1;
      setCharHistoryIndex(prev => ({ ...prev, [charKey]: newIndex }));
      const previousState = history[newIndex];
      setGlyphs(prev => ({ ...prev, [charKey]: previousState }));
      addToast(`Undo: '${charKey}'`, 'info');
    }
  }, [charHistory, charHistoryIndex, getCurrentCharKey, setCharHistoryIndex, setGlyphs, addToast]);

  const redo = useCallback(() => {
    const charKey = getCurrentCharKey();
    const history = charHistory[charKey] || [{}];
    const index = charHistoryIndex[charKey] ?? 0;
    
    if (index < history.length - 1) {
      const newIndex = index + 1;
      setCharHistoryIndex(prev => ({ ...prev, [charKey]: newIndex }));
      const nextState = history[newIndex];
      setGlyphs(prev => ({ ...prev, [charKey]: nextState }));
      addToast(`Redo: '${charKey}'`, 'info');
    }
  }, [charHistory, charHistoryIndex, getCurrentCharKey, setCharHistoryIndex, setGlyphs, addToast]);

  const clearCurrentChar = useCallback(() => {
    const finalKey = getCurrentCharKey();
    const newGlyphs = { ...glyphs };
    delete newGlyphs[finalKey];
    setGlyphs(newGlyphs);
    updateHistory(finalKey, []);
    setCharRotation(prev => ({ ...prev, [finalKey]: 0 }));
  }, [glyphs, getCurrentCharKey, updateHistory, setGlyphs, setCharRotation]);

  return {
    currentHistory,
    currentHistoryIndex,
    updateHistory,
    undo,
    redo,
    clearCurrentChar,
  };
};
