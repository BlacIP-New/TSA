import { Building2, CalendarClock, ChevronLeft, Hash, Layers3, Wallet } from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { useSettlementBatchDetail } from '../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

interface SettlementBatchDetailDrawerProps {
  batchId: string | null;
  user: AuthUser | null;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-card px-4 py-3">
      <dt className="app-kicker">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export function SettlementBatchDetailDrawer({
  batchId,
  user,
  onClose,
}: SettlementBatchDetailDrawerProps) {
  const isOpen = batchId !== null;
  const { showToast } = useToast();
  const { detail, isLoading, error } = useSettlementBatchDetail(batchId, user);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  if (!isOpen) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-500">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              onClick={onClose}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to settlement list
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[28px] bg-slate-100" />
          ))}
        </div>
      )}

      {!isLoading && detail && (
        <>
          <section className="app-panel border-gray-300 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-slate-200/80 bg-slate-50 text-slate-700">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <p className="app-kicker">Batch ID</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950 tabular-nums">
                  {detail.batch.batchId}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{detail.batch.mdaName}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Settled date" value={formatDate(detail.batch.settledDate)} />
              <DetailItem label="Collection code" value={detail.batch.collectionCode} />
              <DetailItem label="Service code" value={detail.batch.serviceCode} />
              <DetailItem label="Status" value={detail.batch.status} />
              <DetailItem label="Item count" value={detail.batch.itemCount.toLocaleString()} />
              <DetailItem label="Total amount" value={formatCurrency(detail.batch.totalAmount)} />
              <DetailItem label="Aggregator ID" value={detail.batch.aggregatorId} />
            </dl>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                icon: <CalendarClock className="h-4 w-4" />,
                label: 'Settlement date',
                value: formatDate(detail.batch.settledDate),
              },
              {
                icon: <Layers3 className="h-4 w-4" />,
                label: 'Settlement lines',
                value: detail.lines.length.toLocaleString(),
              },
              {
                icon: <Wallet className="h-4 w-4" />,
                label: 'Batch total',
                value: formatCurrency(detail.batch.totalAmount),
              },
            ].map((item) => (
              <div key={item.label} className="app-panel border-gray-300 p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  {item.icon}
                  <p className="app-kicker">{item.label}</p>
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-950 tabular-nums">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="app-panel border-gray-300">
            <div className="border-b border-slate-200/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-950">Settlement lines</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Bank destination lines contained in this settlement batch.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="app-data-table">
                <thead>
                  <tr>
                    <th className="px-5 py-4">Bank</th>
                    <th className="px-5 py-4">Account Number</th>
                    <th className="px-5 py-4">Account Name</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {detail.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-5 py-4 text-slate-700">{line.bankName}</td>
                      <td className="px-5 py-4 font-medium text-slate-700 tabular-nums">{line.accountNumber}</td>
                      <td className="px-5 py-4 text-slate-700">{line.accountName}</td>
                      <td className="px-5 py-4">
                        <SettlementStatusBadge status={line.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-950 tabular-nums">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
