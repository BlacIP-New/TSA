import { ChevronRight } from 'lucide-react';
import { SettlementStatusBadge } from './SettlementStatusBadge';
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
  const columnCount = isAdmin ? 8 : 7;

  return (
    <section className="app-panel border-gray-300">
      <div className="overflow-x-auto">
        <table className="app-data-table">
          <thead>
            <tr>
              <th className="px-5 py-4">Settled Date</th>
              <th className="px-5 py-4">Batch ID</th>
              {isAdmin && <th className="px-5 py-4">MDA Name</th>}
              <th className="px-5 py-4">Collection Code</th>
              <th className="px-5 py-4">Service Code</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Item Count</th>
              <th className="px-5 py-4">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={columnCount}>
                    <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && batches.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-5 py-12 text-center text-sm text-slate-500">
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
                  className="cursor-pointer transition-colors focus:bg-slate-50 focus:outline-none"
                  onClick={() => onSelect(batch.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(batch.id);
                    }
                  }}
                >
                  <td className="px-5 py-4 text-slate-600">{formatDate(batch.settledDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-950 tabular-nums">{batch.batchId}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </td>
                  {isAdmin && <td className="px-5 py-4 font-medium text-slate-700">{batch.mdaName}</td>}
                  <td className="px-5 py-4 font-medium text-slate-700">{batch.collectionCode}</td>
                  <td className="px-5 py-4 font-medium text-slate-700">{batch.serviceCode}</td>
                  <td className="px-5 py-4">
                    <SettlementStatusBadge status={batch.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600 tabular-nums">{batch.itemCount.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-slate-950 tabular-nums">{formatCompactCurrency(batch.totalAmount)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
