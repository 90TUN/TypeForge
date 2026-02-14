import { useCallback, useMemo } from 'react';

export const useCharacterKey = (activeChar, isUpperCase) => {
  const getCurrentCharKey = useCallback(() => {
    return /^[A-Za-z]$/.test(activeChar)
      ? (isUpperCase ? activeChar.toUpperCase() : activeChar.toLowerCase())
      : activeChar;
  }, [activeChar, isUpperCase]);

  const currentCharKey = useMemo(() => {
    return /^[A-Za-z]$/.test(activeChar)
      ? (isUpperCase ? activeChar.toUpperCase() : activeChar.toLowerCase())
      : activeChar;
  }, [activeChar, isUpperCase]);

  return { getCurrentCharKey, currentCharKey };
};
