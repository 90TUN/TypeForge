import { useCallback, useRef } from 'react';
import { smoothStroke, simplifyPath } from '../utils/drawing';

export const useDrawingActions = (
  svgRef,
  isDrawing,
  enableSmoothing,
  enableSimplify,
  glyphs,
  setGlyphs,
  setIsDrawing,
  setCurrentStroke,
  getCurrentCharKey,
  updateHistory
) => {
  const rafIdRef = useRef(null);

  const getMousePos = useCallback((e) => {
    if (!svgRef.current) return { x: 0, y: 0, pressure: 0.5 };
    
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const screenCTM = svgRef.current.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0, pressure: 0.5 };
    
    const svgCoords = point.matrixTransform(screenCTM.inverse());
    return { 
      x: svgCoords.x, 
      y: svgCoords.y,
      pressure: e.pressure ?? 0.5
    };
  }, [svgRef]);

  const handleMouseDown = useCallback((e) => {
    setIsDrawing(true);
    setCurrentStroke([getMousePos(e)]);
  }, [setIsDrawing, setCurrentStroke, getMousePos]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    if (rafIdRef.current) return;
    
    rafIdRef.current = requestAnimationFrame(() => {
      setCurrentStroke(prev => [...prev, pos]);
      rafIdRef.current = null;
    });
  }, [isDrawing, setCurrentStroke, getMousePos]);

  const handleMouseUp = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    setIsDrawing(false);
    setCurrentStroke(prev => {
      if (prev.length <= 1) return [];
      
      let stroke = prev;
      if (enableSmoothing) stroke = smoothStroke(stroke);
      if (enableSimplify) stroke = simplifyPath(stroke, 2.0);

      const finalKey = getCurrentCharKey();
      
      const updated = { ...glyphs, [finalKey]: [...(glyphs[finalKey] || []), { points: stroke, hasPresssure: prev.some(p => p.pressure && p.pressure !== 0.5) }] };
      setGlyphs(updated);
      updateHistory(finalKey, updated[finalKey]);
      return [];
    });
  }, [enableSmoothing, enableSimplify, glyphs, setGlyphs, setIsDrawing, setCurrentStroke, getCurrentCharKey, updateHistory]);

  return { getMousePos, handleMouseDown, handleMouseMove, handleMouseUp, rafIdRef };
};
