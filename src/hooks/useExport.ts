import { useCallback, useState } from 'react';
import { AuthUser } from '../types/auth';
import { TransactionFilters } from '../types/transaction';
import { exportTransactionsCsv, exportTransactionsPdf } from '../services/exportService';
import { triggerFileDownload } from '../utils/exportHelpers';

export type ExportFormat = 'csv' | 'pdf';

export function useExport(user: AuthUser | null, filters: TransactionFilters) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  const exportTransactions = useCallback(
    async (format: ExportFormat) => {
      if (!user) {
        setError('No active user session available for export.');
        return;
      }

      setIsExporting(true);
      setError(null);
      setLastExportMessage(null);

      try {
        const result =
          format === 'csv'
            ? await exportTransactionsCsv({ user, filters })
            : await exportTransactionsPdf({ user, filters });

        triggerFileDownload(result.blob, result.filename);
        setLastExportMessage(
          `${format.toUpperCase()} export generated with ${result.count} transactions.`
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to generate export right now.'
        );
      } finally {
        setIsExporting(false);
      }
    },
    [filters, user]
  );

  return {
    exportTransactions,
    isExporting,
    error,
    lastExportMessage,
    clearExportMessages: () => {
      setError(null);
      setLastExportMessage(null);
    },
  };
}
