import { useCallback } from 'react';

export const useToast = (setToasts) => {
  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, [setToasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, [setToasts]);

  return { addToast, removeToast };
};
