import { useCallback, useState } from 'react';
import { AuthUser } from '../types/auth';
import { SettlementBatchFilters } from '../types/transaction';
import { exportSettlements, ExportResult, SettlementExportTarget } from '../services/exportService';
import { triggerFileDownload } from '../utils/exportHelpers';

export type ExportFormat = 'csv' | 'xlsx';

export function useExport(user: AuthUser | null, filters: SettlementBatchFilters) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  const exportSettlementData = useCallback(
    async (format: ExportFormat, target: SettlementExportTarget) => {
      if (!user) {
        setError('No active user session available for export.');
        return;
      }

      setIsExporting(true);
      setError(null);
      setLastExportMessage(null);

      try {
        const result: ExportResult = await exportSettlements({
          user,
          filters,
          format,
          target,
        });

        triggerFileDownload(result.blob, result.filename);
        setLastExportMessage(result.successMessage);
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
    exportSettlementData,
    isExporting,
    error,
    lastExportMessage,
    clearExportMessages: () => {
      setError(null);
      setLastExportMessage(null);
    },
  };
}
