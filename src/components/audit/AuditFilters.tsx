import { CalendarRange, Filter } from 'lucide-react';
import { AuditAction } from '../../types/audit';
import { AuditLogFilters } from '../../hooks/useAuditLog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  users: Array<{ id: string; label: string }>;
  isLoading?: boolean;
  onChange: (updates: Partial<AuditLogFilters>) => void;
  onReset: () => void;
}

const actionOptions: Array<{ label: string; value: AuditAction | '' }> = [
  { label: 'All actions', value: '' },
  { label: 'Login', value: 'login' },
  { label: 'CSV Export', value: 'export_csv' },
  { label: 'PDF Export', value: 'export_pdf' },
  { label: 'User Invited', value: 'mda_invited' },
  { label: 'Invitation Resent', value: 'invitation_resent' },
  { label: 'User Deactivated', value: 'mda_deactivated' },
  { label: 'User Reactivated', value: 'mda_reactivated' },
];

export function AuditFilters({
  filters,
  users,
  isLoading = false,
  onChange,
  onReset,
}: AuditFiltersProps) {
  return (
    <section className="app-panel border-white/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-950">Audit filters</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Narrow results by timeframe, action type, and initiating user.
          </p>
        </div>
        <Button variant="ghost" size="sm" disabled={isLoading} onClick={onReset}>
          Reset filters
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="From"
          type="date"
          value={filters.from ?? ''}
          max={filters.to || undefined}
          disabled={isLoading}
          leftAddon={<CalendarRange className="h-4 w-4" />}
          onChange={(event) => onChange({ from: event.target.value })}
        />
        <Input
          label="To"
          type="date"
          value={filters.to ?? ''}
          min={filters.from || undefined}
          disabled={isLoading}
          leftAddon={<CalendarRange className="h-4 w-4" />}
          onChange={(event) => onChange({ to: event.target.value })}
        />
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
    </section>
  );
}
