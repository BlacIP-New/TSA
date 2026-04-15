import { Filter, RotateCcw, Wallet } from 'lucide-react';
import { TransactionFilters as TransactionFiltersValue } from '../../types/transaction';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TransactionFiltersProps {
  filters: TransactionFiltersValue;
  isLoading?: boolean;
  onChange: (updates: Partial<TransactionFiltersValue>) => void;
  onReset: () => void;
}

const channelOptions = [
  { label: 'All channels', value: '' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Card', value: 'card' },
  { label: 'USSD', value: 'ussd' },
  { label: 'POS', value: 'pos' },
];

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Settled', value: 'settled' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

function toNumericValue(value: string) {
  if (value === '') return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
}

export function TransactionFilters({
  filters,
  isLoading = false,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#E8001C]" />
            <h2 className="text-sm font-semibold text-gray-950">Advanced filters</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Filter selections persist while you move across the portal.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          onClick={onReset}
        >
          Reset filters
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <Select
          label="Payment channel"
          value={filters.channel ?? ''}
          options={channelOptions}
          disabled={isLoading}
          onChange={(event) => onChange({ channel: event.target.value as TransactionFiltersValue['channel'] })}
        />
        <Select
          label="Settlement status"
          value={filters.status ?? ''}
          options={statusOptions}
          disabled={isLoading}
          onChange={(event) => onChange({ status: event.target.value as TransactionFiltersValue['status'] })}
        />
        <Input
          label="Minimum amount"
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
          label="Maximum amount"
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
    </section>
  );
}
