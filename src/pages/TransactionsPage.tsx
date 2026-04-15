import { Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportButton } from '../components/export/ExportButton';
import { ExportModal } from '../components/export/ExportModal';
import { SettlementBatchDetailDrawer } from '../components/transactions/SettlementBatchDetailDrawer';
import { SettlementBatchFilters } from '../components/transactions/SettlementBatchFilters';
import { SettlementBatchTable } from '../components/transactions/SettlementBatchTable';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
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
  const getDefaultDateRange = () => {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    from.setDate(to.getDate() - 29);
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  };

  const [page, setPage] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [exportTarget, setExportTarget] = useState<SettlementExportTarget>({ type: 'batch-list' });
  const { result, isLoading, error } = useSettlementBatchLedger(
    user,
    { ...settlementFilters, from: dateRange.from, to: dateRange.to },
    page,
    settlementPageSize,
  );
  const { exportSettlementData, isExporting, error: exportError, lastExportMessage, clearExportMessages } =
    useExport(user, { ...settlementFilters, from: dateRange.from, to: dateRange.to });

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
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeDropdown dateRange={dateRange} onDateRangeChange={setDateRange} />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setIsFilterPanelOpen(true)}
            >
              Filter
            </Button>
          </div>
        </div>

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

      {isFilterPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsFilterPanelOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-gray-300 bg-white p-5">
            <div className="mb-5 flex items-center justify-between border-b border-gray-300 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Settlement filters</p>
                <p className="mt-1 text-xs text-slate-500">Narrow by date, batch ID, and amount range</p>
              </div>
              <button
                type="button"
                className="rounded border border-gray-300 p-2 text-slate-500 hover:bg-gray-50 hover:text-slate-800"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SettlementBatchFilters
              embedded
              filters={settlementFilters}
              isLoading={isLoading}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setIsFilterPanelOpen(false)}>
                Done
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
