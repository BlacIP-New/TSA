import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageSizeOption } from '../../context/filter-store';
import { Button } from '../ui/Button';

interface TransactionPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  limit: PageSizeOption;
  isLoading?: boolean;
  hidePageSize?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSizeOption) => void;
}

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((left, right) => left - right);
}

export function TransactionPagination({
  page,
  total,
  totalPages,
  limit,
  isLoading = false,
  hidePageSize = false,
  onPageChange,
  onLimitChange,
}: TransactionPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="app-panel border-gray-300 flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          Showing {start}-{end} of {total.toLocaleString()} records
        </p>
        <p className="mt-1 text-sm text-slate-500">Results remain in reverse chronological order.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!hidePageSize && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Rows
            <select
              value={limit}
              disabled={isLoading}
              className="h-9 rounded border border-gray-300 bg-white/80 px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#335CFF] focus:ring-4 focus:ring-[#335CFF]/12"
              onChange={(event) => onLimitChange(Number(event.target.value) as PageSizeOption)}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        )}

        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoading || page <= 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onPageChange(page - 1)}
          >
            <span className="hidden sm:inline">Prev</span>
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {visiblePages.map((visiblePage) => (
              <button
                key={visiblePage}
                type="button"
                disabled={isLoading}
                className={`h-9 min-w-9 rounded px-3 text-sm font-semibold transition-colors ${
                  visiblePage === page
                    ? 'border border-gray-300 bg-[#335CFF] text-white'
                    : 'bg-white/70 text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => onPageChange(visiblePage)}
              >
                {visiblePage}
              </button>
            ))}
          </div>

          <span className="text-sm font-medium text-slate-600 sm:hidden">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={isLoading || page >= totalPages}
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
