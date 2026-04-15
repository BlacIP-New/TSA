import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    from.setDate(to.getDate() - 29);
    return {
      from: toDateInput(from),
      to: toDateInput(to),
    };
  });
  const [exportTarget, setExportTarget] = useState<SettlementExportTarget>({ type: 'batch-list' });
  const effectiveSettlementFilters = useMemo(
    () => ({
      ...settlementFilters,
      from: dateRange.from,
      to: dateRange.to,
    }),
    [dateRange.from, dateRange.to, settlementFilters],
  );

  const { result, isLoading, error } = useSettlementBatchLedger(
    user,
    effectiveSettlementFilters,
    page,
    settlementPageSize,
  );
  const { exportSettlementData, isExporting, error: exportError, lastExportMessage, clearExportMessages } =
    useExport(user, effectiveSettlementFilters);

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
      <div className="space-y-6 p-4 sm:p-5 lg:p-8">
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
            <div className="relative inline-block">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setIsFilterPanelOpen(true)}
              >
                Filter
              </Button>

              {isFilterPanelOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsFilterPanelOpen(false)} />
                  <div className="absolute right-0 top-full z-30 mt-2 w-[min(92vw,42rem)] rounded-2xl border border-gray-300 bg-white p-5 shadow-xl">
                    <div className="mb-5 flex items-center justify-between border-b border-gray-300 pb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Settlement filters</p>
                        <p className="mt-1 text-xs text-slate-500">Narrow by date, batch ID, and amount range</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsFilterPanelOpen(false)}>
                        Close
                      </Button>
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {lastExportMessage && <Alert variant="success" message={lastExportMessage} />}
        {exportError && <Alert variant="error" message={exportError} />}
        {error && <Alert variant="error" message={error} />}

        {selectedBatchId ? (
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
        ) : (
          <>
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
          </>
        )}
      </div>

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
