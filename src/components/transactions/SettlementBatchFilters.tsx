import { Filter, Hash } from 'lucide-react';
import { SettlementBatchFilters as SettlementBatchFiltersValue, SettlementStatus } from '../../types/transaction';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { User } from '../../types/auth';

interface SettlementBatchFiltersProps {
  filters: SettlementBatchFiltersValue;
  user?: User | null;
  isLoading?: boolean;
  embedded?: boolean;
  mdaOptions?: Array<{ label: string; value: string }>;
  collectionOptions?: Array<{ label: string; value: string }>;
  serviceOptions?: Array<{ label: string; value: string }>;
  onChange: (updates: Partial<SettlementBatchFiltersValue>) => void;
  onReset: () => void;
}

const statusOptions: Array<{ label: string; value: SettlementStatus | '' }> = [
  { label: 'All statuses', value: '' },
  { label: 'Settled', value: 'Settled' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Queued', value: 'Queued' },
  { label: 'Partially Settled', value: 'Partially Settled' },
  { label: 'Refunded', value: 'Refunded' },
  { label: 'Offline Settlement', value: 'Offline Settlement' },
  { label: 'Paused Settlement', value: 'Paused Settlement' },
];

export function SettlementBatchFilters({
  filters,
  user,
  isLoading = false,
  embedded = false,
  mdaOptions = [],
  collectionOptions = [],
  serviceOptions = [],
  onChange,
  onReset,
}: SettlementBatchFiltersProps) {
  const isMdaScoped = user?.role === 'mda_admin' || user?.role === 'mda_user';
  const shouldHideMdaFilter = isMdaScoped;
  const shouldHideCollectionFilter = user?.role === 'mda_user';
  
  const filtersBody = (
    <>
      <div className={`${embedded ? '' : 'mt-5'} space-y-4`}>
        {!shouldHideMdaFilter && (
          <div className="grid gap-4">
            <SearchableDropdown
              label="MDA"
              value={filters.mdaId ?? ''}
              placeholder="All MDAs"
              searchPlaceholder="Search MDAs"
              options={[{ label: 'All MDAs', value: '' }, ...mdaOptions]}
              onChange={(value) => onChange({ mdaId: value })}
            />
          </div>
        )}

        {!shouldHideCollectionFilter && (
          <div className="grid gap-4">
            <SearchableDropdown
              label="Collection Code"
              value={filters.collectionCode ?? ''}
              placeholder="All collections"
              searchPlaceholder="Search collections"
              options={[{ label: 'All collections', value: '' }, ...collectionOptions]}
              onChange={(value) => onChange({ collectionCode: value })}
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Batch ID"
            value={filters.batchId ?? ''}
            disabled={isLoading}
            leftAddon={<Hash className="h-4 w-4" />}
            placeholder="Search batch ID"
            onChange={(event) => onChange({ batchId: event.target.value })}
          />
          <SearchableDropdown
            label="Status"
            value={filters.status ?? ''}
            placeholder="All statuses"
            searchPlaceholder="Search statuses"
            options={statusOptions}
            onChange={(value) => onChange({ status: value as SettlementStatus | '' })}
          />
          <SearchableDropdown
            label="Service Code"
            value={filters.serviceCode ?? ''}
            placeholder="All services"
            searchPlaceholder="Search services"
            options={[{ label: 'All services', value: '' }, ...serviceOptions]}
            onChange={(value) => onChange({ serviceCode: value })}
          />
        </div>
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
            <h2 className="text-sm font-semibold text-slate-950">Settlement filters</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Narrow the batch list by batch ID and total amount.
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
