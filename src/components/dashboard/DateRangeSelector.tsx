import { BarChart3, CalendarRange, LineChart } from 'lucide-react';
import { getCurrentMonthDateRange, getLast30DayDateRange, DashboardDateRange } from '../../hooks/useTransactions';
import { ChartGroupBy } from '../../types/transaction';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DateRangeSelectorProps {
  dateRange: DashboardDateRange;
  groupBy: ChartGroupBy;
  isLoading?: boolean;
  onDateRangeChange: (nextRange: DashboardDateRange) => void;
  onGroupByChange: (value: ChartGroupBy) => void;
}

export function DateRangeSelector({
  dateRange,
  groupBy,
  isLoading = false,
  onDateRangeChange,
  onGroupByChange,
}: DateRangeSelectorProps) {
  function updateField(field: keyof DashboardDateRange, value: string) {
    const nextRange = { ...dateRange, [field]: value };

    if (field === 'from' && nextRange.to && value > nextRange.to) {
      nextRange.to = value;
    }

    if (field === 'to' && nextRange.from && value < nextRange.from) {
      nextRange.from = value;
    }

    onDateRangeChange(nextRange);
  }

  return (
    <section className="app-panel border-gray-300 px-5 py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[440px]">
          <Input
            label="From"
            type="date"
            value={dateRange.from}
            max={dateRange.to}
            disabled={isLoading}
            leftAddon={<CalendarRange className="h-4 w-4" />}
            onChange={(event) => updateField('from', event.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={dateRange.to}
            min={dateRange.from}
            disabled={isLoading}
            leftAddon={<CalendarRange className="h-4 w-4" />}
            onChange={(event) => updateField('to', event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={isLoading}
              onClick={() => onDateRangeChange(getCurrentMonthDateRange())}
            >
              Current month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onDateRangeChange(getLast30DayDateRange())}
            >
              Last 30 days
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/75 p-1.5">
            <button
              type="button"
              disabled={isLoading}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                groupBy === 'day'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => onGroupByChange('day')}
            >
              <BarChart3 className="h-4 w-4" />
              Daily
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                groupBy === 'week'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => onGroupByChange('week')}
            >
              <LineChart className="h-4 w-4" />
              Weekly
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
