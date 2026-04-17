import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert } from '../components/ui/Alert';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info', durationMs = 3200) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const toast: ToastItem = { id, message, variant };

    setToasts((current) => [...current, toast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, durationMs);
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Alert key={toast.id} variant={toast.variant} message={toast.message} className="shadow-xl" />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
