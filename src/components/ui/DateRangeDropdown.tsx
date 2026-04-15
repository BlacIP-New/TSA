import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

interface DateRangeDropdownProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function getDaysDifference(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPresetRanges(baseDate = new Date()) {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const makeRange = (daysAgo: number): DateRange => {
    const from = new Date(today);
    from.setDate(today.getDate() - daysAgo);
    return {
      from: toDateInput(from),
      to: toDateInput(today),
    };
  };

  return {
    last7Days: makeRange(6),
    lastWeek: makeRange(7),
    last2Weeks: makeRange(13),
    last30Days: makeRange(29),
    lastMonth: makeRange(30),
    last90Days: makeRange(89),
  };
}

function getPresetLabel(from: string, to: string): string {
  const presets = getPresetRanges();

  if (from === presets.last7Days.from && to === presets.last7Days.to) return 'Last 7 days';
  if (from === presets.lastWeek.from && to === presets.lastWeek.to) return 'Last week';
  if (from === presets.last2Weeks.from && to === presets.last2Weeks.to) return 'Last 2 weeks';
  if (from === presets.last30Days.from && to === presets.last30Days.to) return 'Last 30 days';
  if (from === presets.lastMonth.from && to === presets.lastMonth.to) return 'Last month';
  if (from === presets.last90Days.from && to === presets.last90Days.to) return 'Last 90 days';

  return 'Custom';
}

function calculateDateRange(preset: string): DateRange {
  const to = new Date();
  to.setHours(0, 0, 0, 0);
  const from = new Date(to);

  switch (preset) {
    case 'last-7-days':
      from.setDate(to.getDate() - 6);
      break;
    case 'last-week':
      from.setDate(to.getDate() - 7);
      break;
    case 'last-2-weeks':
      from.setDate(to.getDate() - 13);
      break;
    case 'last-30-days':
      from.setDate(to.getDate() - 29);
      break;
    case 'last-month':
      from.setDate(to.getDate() - 30);
      break;
    case 'last-90-days':
      from.setDate(to.getDate() - 89);
      break;
  }

  return {
    from: toDateInput(from),
    to: toDateInput(to),
  };
}

export function DateRangeDropdown({ dateRange, onDateRangeChange }: DateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(dateRange.from);
  const [customTo, setCustomTo] = useState(dateRange.to);
  const [error, setError] = useState('');

  const currentLabel = getPresetLabel(dateRange.from, dateRange.to);

  function handlePresetSelect(preset: string) {
    const newRange = calculateDateRange(preset);
    onDateRangeChange(newRange);
    setIsOpen(false);
  }

  function handleCustomSubmit() {
    setError('');

    if (!customFrom || !customTo) {
      setError('Both dates are required');
      return;
    }

    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);

    if (fromDate > toDate) {
      setError('Start date must be before end date');
      return;
    }

    const daysDiff = getDaysDifference(customFrom, customTo);
    if (daysDiff > 90) {
      setError('Date range cannot exceed 90 days');
      return;
    }

    onDateRangeChange({
      from: customFrom,
      to: customTo,
    });

    setIsCustomModalOpen(false);
    setIsOpen(false);
  }

  function handleCustomModalOpen() {
    setCustomFrom(dateRange.from);
    setCustomTo(dateRange.to);
    setError('');
    setIsCustomModalOpen(true);
    setIsOpen(false);
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Calendar className="h-4 w-4" />}
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentLabel}
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-lg border border-gray-300 bg-white shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => handlePresetSelect('last-7-days')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handlePresetSelect('last-week')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last week
                </button>
                <button
                  onClick={() => handlePresetSelect('last-2-weeks')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last 2 weeks
                </button>
                <button
                  onClick={() => handlePresetSelect('last-30-days')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => handlePresetSelect('last-month')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last month
                </button>
                <button
                  onClick={() => handlePresetSelect('last-90-days')}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Last 90 days
                </button>
                <div className="border-t border-gray-200" />
                <button
                  onClick={handleCustomModalOpen}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Custom
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={isCustomModalOpen}
        title="Select date range"
        onClose={() => setIsCustomModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsCustomModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCustomSubmit}
            >
              Apply
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900">Start date</label>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setError('');
              }}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900">End date</label>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setError('');
              }}
              className="mt-1"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <span>{error}</span>
            </div>
          )}
          <div className="text-xs text-slate-500">
            Maximum date range is 90 days
          </div>
        </div>
      </Modal>
    </>
  );
}
