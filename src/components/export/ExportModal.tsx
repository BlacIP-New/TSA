import { FileSpreadsheet, FileText } from 'lucide-react';
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
          className="app-card p-5 text-left transition-colors hover:border-sky-200/80 hover:bg-sky-50/50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onSelectFormat('csv')}
        >
          <div className="mb-4 inline-flex rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-slate-700">
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
          className="app-card p-5 text-left transition-colors hover:border-sky-200/80 hover:bg-sky-50/50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onSelectFormat('pdf')}
        >
          <div className="mb-4 inline-flex rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-slate-700">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-950">PDF report</p>
          <p className="mt-2 text-sm text-slate-500">
            Paginated report with portal scope, timestamp, and page numbering.
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
