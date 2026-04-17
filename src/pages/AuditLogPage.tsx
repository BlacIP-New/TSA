import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AuditFilters } from '../components/audit/AuditFilters';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { Button } from '../components/ui/Button';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
import { TransactionPagination } from '../components/transactions/TransactionPagination';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAuditLog, AuditLogFilters } from '../hooks/useAuditLog';

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AuditLogPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({
    from: '',
    to: '',
    action: '',
    userId: '',
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
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
  const { result, isLoading, error, userOptions } = useAuditLog(
    user,
    useMemo(
      () => ({
        ...filters,
        from: dateRange.from,
        to: dateRange.to,
      }),
      [dateRange.from, dateRange.to, filters],
    ),
    page,
    25
  );

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages);
    }
  }, [page, result.totalPages]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

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
    <div className="space-y-6 p-4 sm:p-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {user.aggregatorName}
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
                      <p className="text-sm font-semibold text-slate-950">Audit filters</p>
                      <p className="mt-1 text-xs text-slate-500">Filter by period, action, and initiating user</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsFilterPanelOpen(false)}>
                      Close
                    </Button>
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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

    </div>
  );
}
