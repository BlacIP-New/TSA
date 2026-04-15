import { Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuditFilters } from '../components/audit/AuditFilters';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { useAuth } from '../context/AuthContext';
import { useAuditLog, AuditLogFilters } from '../hooks/useAuditLog';

export default function AuditLogPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AuditLogFilters>({
    from: '',
    to: '',
    action: '',
    userId: '',
  });
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

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const { result, isLoading, error, userOptions } = useAuditLog(
    user,
    { ...filters, from: dateRange.from, to: dateRange.to },
    page,
    25
  );

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages);
    }
  }, [page, result.totalPages]);

  function handleFilterChange(updates: Partial<AuditLogFilters>) {
    setFilters((current) => ({
      ...current,
      ...updates,
    }));
    setPage(1);
  }

  function handleResetFilters() {
    setFilters({
      from: '',
      to: '',
      action: '',
      userId: '',
    });
    setPage(1);
  }

  if (!user) return null;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {user.aggregatorName}
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

      {error && <Alert variant="error" message={error} />}

      <AuditLogTable entries={result.data} isLoading={isLoading} />

      <TransactionPagination
        page={result.page}
        total={result.total}
        totalPages={result.totalPages}
        limit={25}
        isLoading={isLoading}
        hidePageSize
        onPageChange={setPage}
        onLimitChange={() => undefined}
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
                <p className="text-sm font-semibold text-slate-950">Audit filters</p>
                <p className="mt-1 text-xs text-slate-500">Filter by period, action, and initiating user</p>
              </div>
              <button
                type="button"
                className="rounded border border-gray-300 p-2 text-slate-500 hover:bg-gray-50 hover:text-slate-800"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AuditFilters
              embedded
              filters={filters}
              users={userOptions}
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
    </div>
  );
}
