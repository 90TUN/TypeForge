import { useCallback } from 'react';
import { transformStrokes, getDefaultTransformations } from '../utils/transformations';

export const useTransformGlyph = (
  glyphs,
  setGlyphs,
  charTransformations,
  setCharTransformations,
  getCurrentCharKey,
  updateHistory,
  addToast
) => {
  const updateTransformations = useCallback((charKey, newTransformations) => {
    const updated = {
      ...charTransformations,
      [charKey]: newTransformations,
    };
    setCharTransformations(updated);
    localStorage.setItem('typeForgeCharTransformations', JSON.stringify(updated));
  }, [charTransformations, setCharTransformations]);

  const applyTransformations = useCallback((charKey) => {
    const strokes = glyphs[charKey];
    if (!strokes || strokes.length === 0) {
      addToast('No glyphs to transform', 'warning');
      return;
    }

    const transformations = charTransformations[charKey] || getDefaultTransformations();
    const transformed = transformStrokes(strokes, transformations);
    
    const updated = { ...glyphs, [charKey]: transformed };
    setGlyphs(updated);
    updateHistory(charKey, transformed);
    
    // Reset transformations after applying
    updateTransformations(charKey, getDefaultTransformations());
    addToast('Transformation applied', 'success');
  }, [glyphs, setGlyphs, charTransformations, updateTransformations, updateHistory, addToast]);

  const setRotation = useCallback((charKey, angle) => {
    const current = charTransformations[charKey] || getDefaultTransformations();
    updateTransformations(charKey, {
      ...current,
      rotation: angle,
    });
  }, [charTransformations, updateTransformations]);

  const setScale = useCallback((charKey, scaleX, scaleY) => {
    const current = charTransformations[charKey] || getDefaultTransformations();
    updateTransformations(charKey, {
      ...current,
      scaleX,
      scaleY: scaleY !== undefined ? scaleY : scaleX,
    });
  }, [charTransformations, updateTransformations]);

  const setSkew = useCallback((charKey, skewX, skewY) => {
    const current = charTransformations[charKey] || getDefaultTransformations();
    updateTransformations(charKey, {
      ...current,
      skewX,
      skewY,
    });
  }, [charTransformations, updateTransformations]);

  const toggleFlipH = useCallback((charKey) => {
    const current = charTransformations[charKey] || getDefaultTransformations();
    updateTransformations(charKey, {
      ...current,
      flipH: !current.flipH,
    });
  }, [charTransformations, updateTransformations]);

  const toggleFlipV = useCallback((charKey) => {
    const current = charTransformations[charKey] || getDefaultTransformations();
    updateTransformations(charKey, {
      ...current,
      flipV: !current.flipV,
    });
  }, [charTransformations, updateTransformations]);

  const resetTransformations = useCallback((charKey) => {
    updateTransformations(charKey, getDefaultTransformations());
    addToast('Transformations reset', 'info');
  }, [updateTransformations, addToast]);

  const flipHorizontalNow = useCallback((charKey) => {
    const strokes = glyphs[charKey];
    if (!strokes || strokes.length === 0) return;
    
    const transformed = transformStrokes(strokes, { ...getDefaultTransformations(), flipH: true });
    const updated = { ...glyphs, [charKey]: transformed };
    setGlyphs(updated);
    updateHistory(charKey, transformed);
  }, [glyphs, setGlyphs, updateHistory]);

  const flipVerticalNow = useCallback((charKey) => {
    const strokes = glyphs[charKey];
    if (!strokes || strokes.length === 0) return;
    
    const transformed = transformStrokes(strokes, { ...getDefaultTransformations(), flipV: true });
    const updated = { ...glyphs, [charKey]: transformed };
    setGlyphs(updated);
    updateHistory(charKey, transformed);
  }, [glyphs, setGlyphs, updateHistory]);

  return {
    applyTransformations,
    setRotation,
    setScale,
    setSkew,
    toggleFlipH,
    toggleFlipV,
    flipHorizontalNow,
    flipVerticalNow,
    resetTransformations,
    getCurrentTransformations: useCallback((charKey) => 
      charTransformations[charKey] || getDefaultTransformations(),
      [charTransformations]
    ),
  };
};
