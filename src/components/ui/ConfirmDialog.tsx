import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto sm:min-w-[128px]">
            Cancel
          </Button>
          <Button variant={confirmVariant} isLoading={isLoading} onClick={onConfirm} className="w-full sm:w-auto sm:min-w-[128px]">
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-gray-300 bg-white p-4">
        <div className="rounded bg-white p-2 text-slate-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </Modal>
  );
}
