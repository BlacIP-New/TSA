import { ClipboardList, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuditFilters } from '../components/audit/AuditFilters';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
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
  const [page, setPage] = useState(1);
  const { result, isLoading, error, userOptions, refresh } = useAuditLog(user, filters, page, 25);

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
      <section className="app-panel-strong border-white/80 px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <p className="app-kicker">Compliance Trail</p>
            <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.06em] text-slate-950">
              Audit log
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Timestamped activity for compliance review, export traceability, and admin oversight.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {user.aggregatorName}
            </div>
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="app-panel border-white/70 p-5">
          <p className="app-kicker">Visible records</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{result.total}</p>
          <p className="mt-2 text-sm text-slate-500">Matching the current audit filters</p>
        </div>
        <div className="app-panel border-white/70 p-5">
          <p className="app-kicker">Tracked users</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{userOptions.length}</p>
          <p className="mt-2 text-sm text-slate-500">Unique users with logged portal activity</p>
        </div>
        <div className="app-panel border-white/70 p-5">
          <div className="flex items-center gap-2 text-slate-600">
            <ClipboardList className="h-4 w-4" />
            <p className="app-kicker">Compliance note</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Export events, login activity, and MDA admin actions are all captured as immutable records.
          </p>
        </div>
      </div>

      <AuditFilters
        filters={filters}
        users={userOptions}
        isLoading={isLoading}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

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
    </div>
  );
}
