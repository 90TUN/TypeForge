import { useEffect } from 'react';
import { ALPHABET } from '../utils/constants';

export const useKeyboardNavigation = (
  activeChar,
  setActiveChar,
  undo,
  redo,
  clearCurrentChar
) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const charIndex = ALPHABET.indexOf(activeChar);
      
      if (e.key.match(/^[A-Za-z0-9!@#$%^&*()\\-_=+\\[\\]{}|;:'",.<?\/~`]$/)) {
        const char = e.key.toUpperCase();
        if (ALPHABET.includes(char)) {
          e.preventDefault();
          setActiveChar(char);
        }
      }
      
      if (e.key === 'ArrowRight' && charIndex < ALPHABET.length - 1) {
        setActiveChar(ALPHABET[charIndex + 1]);
      }
      if (e.key === 'ArrowLeft' && charIndex > 0) {
        setActiveChar(ALPHABET[charIndex - 1]);
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete') {
        clearCurrentChar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChar, setActiveChar, undo, redo, clearCurrentChar]);
};
