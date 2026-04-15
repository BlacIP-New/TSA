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
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-950">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="pb-3 pr-4">MDA</th>
              <th className="pb-3 pr-4">Scope</th>
              <th className="pb-3 pr-4">Settled Amount</th>
              <th className="pb-3 pr-4">Settlement Lines</th>
              <th className="pb-3 pr-4">Share</th>
              <th className="pb-3 pr-4">Period Change</th>
              <th className="pb-3">Last Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: 4 }, (_, index) => (
                <tr key={index}>
                  <td className="py-4 pr-4" colSpan={7}>
                    <div className="h-10 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="py-10 text-center text-sm text-gray-500" colSpan={7}>
                  No settlement records available for the selected range.
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row, index) => (
                <tr key={`${row.collectionCode}-${row.serviceCode}`} className="align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8001C]/8 text-sm font-semibold text-[#E8001C]">
                        {row.mdaName
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-950">{row.mdaName}</p>
                        {index === 0 && rows.length > 1 && (
                          <Badge variant="success" className="mt-2">
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
                  <td className="py-4 pr-4 font-medium text-gray-950">{formatCompactCurrency(row.totalAmount)}</td>
                  <td className="py-4 pr-4 text-gray-600">{row.settlementLineCount.toLocaleString()}</td>
                  <td className="py-4 pr-4 text-gray-600">{row.percentageOfTotal.toFixed(1)}%</td>
                  <td className={`py-4 pr-4 font-medium ${row.periodChange >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatPercentage(row.periodChange)}
                  </td>
                  <td className="py-4 text-gray-600">{formatDate(row.lastSettlementDate)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
