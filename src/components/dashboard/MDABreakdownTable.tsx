import { Badge } from '../ui/Badge';
import { MdaBreakdownRow } from '../../types/transaction';
import { formatCompactCurrency, formatDate, formatPercentage } from '../../utils/formatters';

interface MDABreakdownTableProps {
  rows: MdaBreakdownRow[];
  title: string;
  description: string;
  isLoading?: boolean;
}

export function MDABreakdownTable({
  rows,
  title,
  description,
  isLoading = false,
}: MDABreakdownTableProps) {
  return (
    <section className="app-panel border-gray-300 p-5">
      <div className="mb-4">
        <p className="text-base font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="app-data-table">
          <thead>
            <tr>
              <th className="pb-3 pr-4">MDA</th>
              <th className="pb-3 pr-4">Scope</th>
              <th className="pb-3 pr-4">Settled Amount</th>
              <th className="pb-3 pr-4">Settlement Lines</th>
              <th className="pb-3 pr-4">Share</th>
              <th className="pb-3 pr-4">Period Change</th>
              <th className="pb-3">Last Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {isLoading &&
              Array.from({ length: 4 }, (_, index) => (
                <tr key={index}>
                  <td className="py-4 pr-4" colSpan={7}>
                    <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="py-10 text-center text-sm text-slate-500" colSpan={7}>
                  No settlement records available for the selected range.
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row, index) => (
                <tr key={`${row.collectionCode}-${row.serviceCode}`} className="align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-slate-700">
                        {row.mdaName
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{row.mdaName}</p>
                        {index === 0 && rows.length > 1 && (
                          <Badge variant="info" className="mt-2">
                            Highest volume
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="space-y-2">
                      <Badge variant="neutral">{row.collectionCode}</Badge>
                      <Badge variant="info">{row.serviceCode}</Badge>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-semibold text-slate-950 tabular-nums">{formatCompactCurrency(row.totalAmount)}</td>
                  <td className="py-4 pr-4 text-slate-600 tabular-nums">{row.settlementLineCount.toLocaleString()}</td>
                  <td className="py-4 pr-4 text-slate-600 tabular-nums">{row.percentageOfTotal.toFixed(1)}%</td>
                  <td className={`py-4 pr-4 font-semibold ${row.periodChange >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatPercentage(row.periodChange)}
                  </td>
                  <td className="py-4 text-slate-600">{formatDate(row.lastSettlementDate)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
