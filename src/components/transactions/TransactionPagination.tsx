import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionPageSize } from '../../context/filter-store';
import { Button } from '../ui/Button';

interface TransactionPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  limit: TransactionPageSize;
  isLoading?: boolean;
  hidePageSize?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: TransactionPageSize) => void;
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
    <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-gray-950">
          Showing {start}-{end} of {total.toLocaleString()} transactions
        </p>
        <p className="mt-1 text-sm text-gray-500">Results remain in reverse chronological order.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!hidePageSize && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Rows
            <select
              value={limit}
              disabled={isLoading}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#E8001C] focus:ring-2 focus:ring-[#E8001C]/10"
              onChange={(event) => onLimitChange(Number(event.target.value) as TransactionPageSize)}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoading || page <= 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {visiblePages.map((visiblePage) => (
              <button
                key={visiblePage}
                type="button"
                disabled={isLoading}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                  visiblePage === page
                    ? 'bg-[#E8001C] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onPageChange(visiblePage)}
              >
                {visiblePage}
              </button>
            ))}
          </div>

          <span className="text-sm font-medium text-gray-600 sm:hidden">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={isLoading || page >= totalPages}
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
