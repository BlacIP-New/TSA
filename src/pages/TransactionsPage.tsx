import { Activity, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportButton } from '../components/export/ExportButton';
import { ExportModal } from '../components/export/ExportModal';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useExport } from '../hooks/useExport';
import { useFilters } from '../hooks/useFilters';
import { useTransactionLedger } from '../hooks/useTransactions';
import { TransactionFilters as TransactionFiltersValue } from '../types/transaction';

export default function TransactionsPage() {
  const { user } = useAuth();
  const {
    transactionFilters,
    transactionPageSize,
    updateTransactionFilters,
    resetTransactionFilters,
    setTransactionPageSize,
  } = useFilters();
  const [page, setPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { result, isLoading, error, refresh } = useTransactionLedger(
    user,
    transactionFilters,
    page,
    transactionPageSize
  );
  const { exportTransactions, isExporting, error: exportError, lastExportMessage, clearExportMessages } =
    useExport(user, transactionFilters);

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

  function handleFilterChange(updates: Partial<TransactionFiltersValue>) {
    updateTransactionFilters(updates);
    setPage(1);
  }

  function handleResetFilters() {
    resetTransactionFilters();
    setPage(1);
  }

  function handlePageSizeChange(limit: 25 | 50 | 100) {
    setTransactionPageSize(limit);
    setPage(1);
  }

  return (
    <>
      <div className="space-y-6 p-5 lg:p-8">
        <div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950">Transaction ledger</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review settled and in-flight collections with scoped filters and transaction-level drill-down.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Activity className="h-3.5 w-3.5" />
                {user?.role === 'aggregator_admin'
                  ? 'Aggregator-wide ledger'
                  : `${user?.collectionCode} / ${user?.serviceCode}`}
              </div>
              <ExportButton
                disabled={result.total === 0}
                isLoading={isExporting}
                onClick={() => {
                  clearExportMessages();
                  setIsExportModalOpen(true);
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoading}
                leftIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <TransactionFilters
          filters={transactionFilters}
          isLoading={isLoading}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {lastExportMessage && <Alert variant="success" message={lastExportMessage} />}
        {exportError && <Alert variant="error" message={exportError} />}
        {error && <Alert variant="error" message={error} />}

        <TransactionTable
          transactions={result.data}
          isLoading={isLoading}
          onSelect={setSelectedTransactionId}
        />

        <TransactionPagination
          page={result.page}
          total={result.total}
          totalPages={result.totalPages}
          limit={transactionPageSize}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={handlePageSizeChange}
        />
      </div>

      <TransactionDetailDrawer
        transactionId={selectedTransactionId}
        user={user}
        onClose={() => setSelectedTransactionId(null)}
      />
      <ExportModal
        open={isExportModalOpen}
        isExporting={isExporting}
        onClose={() => {
          if (isExporting) return;
          setIsExportModalOpen(false);
        }}
        onSelectFormat={(format) => void exportTransactions(format)}
      />
    </>
  );
}
