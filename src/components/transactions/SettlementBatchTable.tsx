import { ChevronRight } from 'lucide-react';
import { SettlementBatch } from '../../types/transaction';
import { formatCompactCurrency, formatDate } from '../../utils/formatters';

interface SettlementBatchTableProps {
  batches: SettlementBatch[];
  isAdmin: boolean;
  isLoading?: boolean;
  onSelect: (batchId: string) => void;
}

export function SettlementBatchTable({
  batches,
  isAdmin,
  isLoading = false,
  onSelect,
}: SettlementBatchTableProps) {
  const columnCount = isAdmin ? 7 : 6;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="px-5 py-4">Settled Date</th>
              <th className="px-5 py-4">Batch ID</th>
              {isAdmin && <th className="px-5 py-4">MDA Name</th>}
              <th className="px-5 py-4">Collection Code</th>
              <th className="px-5 py-4">Service Code</th>
              <th className="px-5 py-4">Item Count</th>
              <th className="px-5 py-4">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={columnCount}>
                    <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && batches.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-5 py-12 text-center text-sm text-gray-500">
                  No settlement batches matched the current filters.
                </td>
              </tr>
            )}

            {!isLoading &&
              batches.map((batch) => (
                <tr
                  key={batch.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => onSelect(batch.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(batch.id);
                    }
                  }}
                >
                  <td className="px-5 py-4 text-gray-600">{formatDate(batch.settledDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-950">{batch.batchId}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </td>
                  {isAdmin && <td className="px-5 py-4 font-medium text-gray-700">{batch.mdaName}</td>}
                  <td className="px-5 py-4 font-medium text-gray-700">{batch.collectionCode}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">{batch.serviceCode}</td>
                  <td className="px-5 py-4 text-gray-600">{batch.itemCount.toLocaleString()}</td>
                  <td className="px-5 py-4 font-medium text-gray-950">{formatCompactCurrency(batch.totalAmount)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
