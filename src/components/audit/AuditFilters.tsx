import { Filter } from 'lucide-react';
import { AuditAction } from '../../types/audit';
import { AuditLogFilters } from '../../hooks/useAuditLog';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  users: Array<{ id: string; label: string }>;
  isLoading?: boolean;
  embedded?: boolean;
  onChange: (updates: Partial<AuditLogFilters>) => void;
  onReset: () => void;
}

const actionOptions: Array<{ label: string; value: AuditAction | '' }> = [
  { label: 'All actions', value: '' },
  { label: 'Login', value: 'login' },
  { label: 'CSV Export', value: 'export_csv' },
  { label: 'Excel Export', value: 'export_excel' },
  { label: 'User Invited', value: 'mda_invited' },
  { label: 'Invitation Resent', value: 'invitation_resent' },
  { label: 'User Deactivated', value: 'mda_deactivated' },
  { label: 'User Reactivated', value: 'mda_reactivated' },
];

export function AuditFilters({
  filters,
  users,
  isLoading = false,
  embedded = false,
  onChange,
  onReset,
}: AuditFiltersProps) {
  const filtersBody = (
    <>
      <div className={`${embedded ? '' : 'mt-5'} grid gap-4 md:grid-cols-2 xl:grid-cols-2`}>
        <Select
          label="Action type"
          value={filters.action ?? ''}
          disabled={isLoading}
          options={actionOptions}
          onChange={(event) => onChange({ action: event.target.value as AuditAction | '' })}
        />
        <Select
          label="User"
          value={filters.userId ?? ''}
          disabled={isLoading}
          options={[
            { label: 'All users', value: '' },
            ...users.map((user) => ({ label: user.label, value: user.id })),
          ]}
          onChange={(event) => onChange({ userId: event.target.value })}
        />
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" disabled={isLoading} onClick={onReset}>
            Reset filters
          </Button>
        </div>
        {filtersBody}
      </div>
    );
  }

  return (
    <section className="app-panel border-gray-300 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-950">Audit filters</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Narrow results by action type and initiating user.
          </p>
        </div>
        <Button variant="ghost" size="sm" disabled={isLoading} onClick={onReset}>
          Reset filters
        </Button>
      </div>

      {filtersBody}
    </section>
  );
}
