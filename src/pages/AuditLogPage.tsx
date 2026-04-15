import { Activity, ClipboardList, RefreshCcw } from 'lucide-react';
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">Audit log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Timestamped activity for compliance review, export traceability, and admin oversight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <Activity className="h-3.5 w-3.5" />
            {user.aggregatorName}
          </div>
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Visible records</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{result.total}</p>
          <p className="mt-1 text-sm text-gray-500">Matching the current audit filters</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Tracked users</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{userOptions.length}</p>
          <p className="mt-1 text-sm text-gray-500">Unique users with logged portal activity</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#E8001C]" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Compliance note</p>
          </div>
          <p className="mt-2 text-sm text-gray-700">
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
