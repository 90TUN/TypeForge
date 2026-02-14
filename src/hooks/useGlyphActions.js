import { useCallback } from 'react';

export const useGlyphActions = (
  glyphs,
  setGlyphs,
  fontUrl,
  fontMetadata,
  clipboard,
  setClipboard,
  pendingClearAll,
  setPendingClearAll,
  getCurrentCharKey,
  updateHistory,
  addToast
) => {
  const copyGlyph = useCallback(() => {
    const finalKey = getCurrentCharKey();
    const strokes = glyphs[finalKey] || [];
    if (strokes.length === 0) {
      addToast('Nothing to copy - draw some strokes first', 'warning');
      return;
    }
    setClipboard({ strokes, sourceChar: finalKey });
    addToast(`Copied ${strokes.length} stroke(s) from '${finalKey}'`, 'success');
  }, [glyphs, getCurrentCharKey, setClipboard, addToast]);

  const pasteGlyph = useCallback(() => {
    if (!clipboard || clipboard.strokes.length === 0) {
      addToast('Clipboard is empty', 'info');
      return;
    }
    const finalKey = getCurrentCharKey();
    const newCharGlyphs = [...(glyphs[finalKey] || []), ...clipboard.strokes];
    const updated = { ...glyphs, [finalKey]: newCharGlyphs };
    setGlyphs(updated);
    updateHistory(finalKey, newCharGlyphs);
    addToast(`Pasted ${clipboard.strokes.length} stroke(s) to '${finalKey}'`, 'success');
  }, [clipboard, glyphs, setGlyphs, getCurrentCharKey, updateHistory, addToast]);

  const clearAllCharacters = useCallback(() => {
    if (!pendingClearAll) {
      setPendingClearAll(true);
      addToast('Click "Clear All" again to confirm - this cannot be undone', 'warning', 5000);
      return;
    }
    setGlyphs({});
    setPendingClearAll(false);
    addToast('All characters cleared', 'warning');
  }, [pendingClearAll, setPendingClearAll, setGlyphs, addToast]);

  const downloadFont = useCallback(() => {
    if (!fontUrl) {
      addToast('No font to download yet', 'info');
      return;
    }
    const link = document.createElement('a');
    link.href = fontUrl.url;
    link.download = `${fontMetadata.family}.otf`;
    link.click();
    addToast(`Downloaded ${fontMetadata.family}.otf`, 'success');
  }, [fontUrl, fontMetadata, addToast]);

  const exportJSON = useCallback(() => {
    const data = { glyphs, fontMetadata };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'typeforge-design.json';
    link.click();
    addToast('Design exported to JSON', 'success');
  }, [glyphs, fontMetadata, addToast]);

  return {
    copyGlyph,
    pasteGlyph,
    clearAllCharacters,
    downloadFont,
    exportJSON,
  };
};
