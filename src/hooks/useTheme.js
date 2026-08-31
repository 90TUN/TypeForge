import { useMemo } from 'react';
import { THEMES } from '../utils/themes';

export const useTheme = (currentTheme) => {
  return useMemo(() => {
    const darkMode = ['dark', 'nord', 'dracula', 'gruvbox', 'slate', 'cyberpunk', 'coder'].includes(currentTheme);
    const theme = THEMES[currentTheme];
    
    return {
      darkMode,
      theme,
      bgPrimary: theme.bgPrimary,
      bgSecondary: theme.bgSecondary,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      borderColor: theme.borderColor,
    };
  }, [currentTheme]);
};
