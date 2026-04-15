import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
  onClose: () => void;
}

const sizeClasses = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  size = 'md',
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 backdrop-blur-sm sm:items-center sm:px-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative z-10 w-full max-h-[92dvh] rounded-t-xl border border-gray-300 bg-white sm:max-h-[85vh] sm:rounded-lg ${sizeClasses[size]}`}>
        <div className="flex items-start justify-between border-b border-gray-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            type="button"
            className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[68dvh] overflow-y-auto px-4 py-4 sm:max-h-[62vh] sm:px-5 sm:py-5">{children}</div>

        {footer && <div className="border-t border-gray-300 px-4 py-4 sm:px-5">{footer}</div>}
      </div>
    </div>
  );
}
