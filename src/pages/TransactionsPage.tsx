import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportButton } from '../components/export/ExportButton';
import { ExportModal } from '../components/export/ExportModal';
import { SettlementBatchDetailDrawer } from '../components/transactions/SettlementBatchDetailDrawer';
import { SettlementBatchFilters } from '../components/transactions/SettlementBatchFilters';
import { SettlementBatchTable } from '../components/transactions/SettlementBatchTable';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useExport } from '../hooks/useExport';
import { useFilters } from '../hooks/useFilters';
import { useSettlementBatchLedger } from '../hooks/useTransactions';
import { SettlementBatchFilters as SettlementBatchFiltersValue } from '../types/transaction';
import { SettlementExportTarget } from '../services/exportService';

export default function TransactionsPage() {
  const { user } = useAuth();
  const {
    settlementFilters,
    settlementPageSize,
    updateSettlementFilters,
    resetSettlementFilters,
    setSettlementPageSize,
  } = useFilters();
  const [page, setPage] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<SettlementExportTarget>({ type: 'batch-list' });
  const { result, isLoading, error, refresh } = useSettlementBatchLedger(
    user,
    settlementFilters,
    page,
    settlementPageSize,
  );
  const { exportSettlementData, isExporting, error: exportError, lastExportMessage, clearExportMessages } =
    useExport(user, settlementFilters);

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages);
    }
  }, [page, result.totalPages]);

  useEffect(() => {
    if (lastExportMessage) {
      setIsExportModalOpen(false);
    }
  }, [lastExportMessage]);

  function handleFilterChange(updates: Partial<SettlementBatchFiltersValue>) {
    updateSettlementFilters(updates);
    setPage(1);
  }

  function handleResetFilters() {
    resetSettlementFilters();
    setPage(1);
  }

  function handlePageSizeChange(limit: 25 | 50 | 100) {
    setSettlementPageSize(limit);
    setPage(1);
  }

  return (
    <>
      <div className="space-y-6 p-5 lg:p-8">
        <section className="app-panel-strong border-white/80 px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="app-kicker">Batch Operations</p>
              <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.06em] text-slate-950">
                Settlement batches
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Review payout batches first, then inspect the settlement lines inside each batch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {user?.role === 'aggregator_admin'
                  ? 'Aggregator-wide settlements'
                  : `${user?.collectionCode} / ${user?.serviceCode}`}
              </div>
              <ExportButton
                disabled={result.total === 0}
                isLoading={isExporting}
                onClick={() => {
                  clearExportMessages();
                  setExportTarget({ type: 'batch-list' });
                  setIsExportModalOpen(true);
                }}
              />
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                leftIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </section>

        <SettlementBatchFilters
          filters={settlementFilters}
          isLoading={isLoading}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {lastExportMessage && <Alert variant="success" message={lastExportMessage} />}
        {exportError && <Alert variant="error" message={exportError} />}
        {error && <Alert variant="error" message={error} />}

        <SettlementBatchTable
          batches={result.data}
          isAdmin={user?.role === 'aggregator_admin'}
          isLoading={isLoading}
          onSelect={setSelectedBatchId}
        />

        <TransactionPagination
          page={result.page}
          total={result.total}
          totalPages={result.totalPages}
          limit={settlementPageSize}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={handlePageSizeChange}
        />
      </div>

      <SettlementBatchDetailDrawer
        batchId={selectedBatchId}
        user={user}
        isExporting={isExporting && exportTarget.type === 'batch-detail'}
        onClose={() => setSelectedBatchId(null)}
        onExport={(batchId) => {
          clearExportMessages();
          setExportTarget({ type: 'batch-detail', batchId });
          setIsExportModalOpen(true);
        }}
      />
      <ExportModal
        open={isExportModalOpen}
        title={exportTarget.type === 'batch-list' ? 'Export settlement batches' : `Export batch ${exportTarget.batchId}`}
        description={
          exportTarget.type === 'batch-list'
            ? 'Generate a CSV or PDF from the current filtered settlement batch view.'
            : 'Generate a CSV or PDF for the selected settlement batch lines.'
        }
        isExporting={isExporting}
        onClose={() => {
          if (isExporting) return;
          setIsExportModalOpen(false);
        }}
        onSelectFormat={(format) => void exportSettlementData(format, exportTarget)}
      />
    </>
  );
}
