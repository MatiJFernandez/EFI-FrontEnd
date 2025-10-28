import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children, autoHideDuration = 4000 }) => {
  const [toastState, setToastState] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success' | 'info' | 'warning' | 'error'
  });

  const showToast = useCallback((message, severity = 'info') => {
    setToastState({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toastState.open}
        autoHideDuration={autoHideDuration}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideToast} severity={toastState.severity} variant="filled" sx={{ width: '100%' }}>
          {toastState.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
