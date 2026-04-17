import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ExportButton } from '../components/export/ExportButton';
import { ExportModal } from '../components/export/ExportModal';
import { SettlementBatchDetailDrawer } from '../components/transactions/SettlementBatchDetailDrawer';
import { SettlementBatchFilters } from '../components/transactions/SettlementBatchFilters';
import { SettlementBatchTable } from '../components/transactions/SettlementBatchTable';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { Button } from '../components/ui/Button';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../context/PageTitleContext';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
  const { setTitleOverride } = usePageTitle();
  const {
    settlementFilters,
    settlementPageSize,
    updateSettlementFilters,
    resetSettlementFilters,
    setSettlementPageSize,
  } = useFilters();

  const [page, setPage] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
  const effectiveSettlementFilters = useMemo(
    () => ({
      ...settlementFilters,
      from: dateRange.from,
      to: dateRange.to,
    }),
    [dateRange.from, dateRange.to, settlementFilters],
  );
  const [exportTarget, setExportTarget] = useState<SettlementExportTarget>({ type: 'batch-list' });

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
    setTitleOverride(selectedBatchId ? 'Settlement batch detail' : null);

    return () => {
      setTitleOverride(null);
    };
  }, [selectedBatchId, setTitleOverride]);

  useEffect(() => {
    if (lastExportMessage) {
      setIsExportModalOpen(false);
      showToast(lastExportMessage, 'success');
    }
  }, [lastExportMessage, showToast]);

  useEffect(() => {
    if (exportError) {
      showToast(exportError, 'error');
    }
  }, [exportError, showToast]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

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
        {!selectedBatchId && (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <DateRangeDropdown dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ExportButton
              disabled={result.total === 0}
              isLoading={isExporting}
              onClick={() => {
                clearExportMessages();
                setExportTarget({ type: 'batch-list' });
                setIsExportModalOpen(true);
              }}
            />
            <div className="relative inline-block">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setIsFilterPanelOpen((current) => !current)}
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
        )}

        {selectedBatchId ? (
          <SettlementBatchDetailDrawer
            batchId={selectedBatchId}
            user={user}
            onClose={() => setSelectedBatchId(null)}
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
        title="Export settlement batches"
        description="Generate a CSV or PDF from the current filtered settlement batch view."
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
