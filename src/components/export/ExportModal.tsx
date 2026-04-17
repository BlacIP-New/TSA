import { FileSpreadsheet } from 'lucide-react';
import { ExportFormat } from '../../hooks/useExport';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ExportModalProps {
  open: boolean;
  title?: string;
  description?: string;
  isExporting?: boolean;
  onClose: () => void;
  onSelectFormat: (format: ExportFormat) => void;
}

export function ExportModal({
  open,
  title = 'Export settlements',
  description = 'Generate a file using the current settlement view and scope.',
  isExporting = false,
  onClose,
  onSelectFormat,
}: ExportModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          disabled={isExporting}
          className="app-card p-5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onSelectFormat('csv')}
        >
          <div className="mb-4 inline-flex rounded-lg border border-gray-300 bg-white p-3 text-slate-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-950">CSV export</p>
          <p className="mt-2 text-sm text-slate-500">
            Spreadsheet-friendly export of the current filtered settlement view.
          </p>
        </button>

        <button
          type="button"
          disabled={isExporting}
          className="app-card p-5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onSelectFormat('xlsx')}
        >
          <div className="mb-4 inline-flex rounded-lg border border-gray-300 bg-white p-3 text-slate-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-950">Excel export (default)</p>
          <p className="mt-2 text-sm text-slate-500">
            Microsoft Excel-friendly export of the current filtered settlement view.
          </p>
        </button>
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="secondary" disabled={isExporting} onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
