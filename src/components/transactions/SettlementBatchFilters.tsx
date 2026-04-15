import { Filter, Hash, Wallet } from 'lucide-react';
import { SettlementBatchFilters as SettlementBatchFiltersValue } from '../../types/transaction';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SettlementBatchFiltersProps {
  filters: SettlementBatchFiltersValue;
  isLoading?: boolean;
  onChange: (updates: Partial<SettlementBatchFiltersValue>) => void;
  onReset: () => void;
}

function toNumericValue(value: string) {
  if (value === '') return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
}

export function SettlementBatchFilters({
  filters,
  isLoading = false,
  onChange,
  onReset,
}: SettlementBatchFiltersProps) {
  return (
    <section className="app-panel border-gray-300 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-950">Settlement filters</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Narrow the batch list by settled date, batch ID, and total amount.
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
          onChange={(event) => onChange({ from: event.target.value })}
        />
        <Input
          label="To"
          type="date"
          value={filters.to ?? ''}
          min={filters.from || undefined}
          disabled={isLoading}
          onChange={(event) => onChange({ to: event.target.value })}
        />
        <Input
          label="Batch ID"
          value={filters.batchId ?? ''}
          disabled={isLoading}
          leftAddon={<Hash className="h-4 w-4" />}
          placeholder="Search batch ID"
          onChange={(event) => onChange({ batchId: event.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-1 xl:grid-cols-2">
          <Input
            label="Min total"
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.minAmount ?? ''}
            disabled={isLoading}
            leftAddon={<Wallet className="h-4 w-4" />}
            placeholder="0"
            onChange={(event) => onChange({ minAmount: toNumericValue(event.target.value) })}
          />
          <Input
            label="Max total"
            type="number"
            inputMode="numeric"
            min={0}
            value={filters.maxAmount ?? ''}
            disabled={isLoading}
            leftAddon={<Wallet className="h-4 w-4" />}
            placeholder="0"
            onChange={(event) => onChange({ maxAmount: toNumericValue(event.target.value) })}
          />
        </div>
      </div>
    </section>
  );
}
