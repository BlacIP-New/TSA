import { useEffect } from 'react';
import { Building2, CalendarClock, Hash, Layers3, Wallet, X } from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { useSettlementBatchDetail } from '../../hooks/useTransactions';
import { ExportButton } from '../export/ExportButton';
import { Alert } from '../ui/Alert';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SettlementBatchDetailDrawerProps {
  batchId: string | null;
  user: AuthUser | null;
  isExporting?: boolean;
  onClose: () => void;
  onExport?: (batchId: string) => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-950 break-words">{value}</dd>
    </div>
  );
}

export function SettlementBatchDetailDrawer({
  batchId,
  user,
  isExporting = false,
  onClose,
  onExport,
}: SettlementBatchDetailDrawerProps) {
  const isOpen = batchId !== null;
  const { detail, isLoading, error } = useSettlementBatchDetail(batchId, user);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-gray-200 bg-white shadow-2xl sm:max-w-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-950">Settlement batch detail</p>
            <p className="mt-1 text-sm text-gray-500">
              Batch summary and settlement lines for the selected payout batch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {detail && onExport && (
              <ExportButton
                isLoading={isExporting}
                onClick={() => onExport(detail.batch.id)}
              />
            )}
            <button
              type="button"
              className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl bg-gray-100" />
              ))}
            </div>
          )}

          {!isLoading && error && <Alert variant="error" message={error} />}

          {!isLoading && detail && (
            <>
              <section className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#E8001C]/8 p-3 text-[#E8001C]">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Batch ID</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
                      {detail.batch.batchId}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{detail.batch.mdaName}</p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem label="Settled date" value={formatDate(detail.batch.settledDate)} />
                  <DetailItem label="Collection code" value={detail.batch.collectionCode} />
                  <DetailItem label="Service code" value={detail.batch.serviceCode} />
                  <DetailItem label="Item count" value={detail.batch.itemCount.toLocaleString()} />
                  <DetailItem label="Total amount" value={formatCurrency(detail.batch.totalAmount)} />
                  <DetailItem label="Aggregator ID" value={detail.batch.aggregatorId} />
                </dl>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#E8001C]">
                    <CalendarClock className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Settlement date</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-950">{formatDate(detail.batch.settledDate)}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#E8001C]">
                    <Layers3 className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Settlement lines</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-950">{detail.lines.length}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#E8001C]">
                    <Wallet className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Batch total</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-950">{formatCurrency(detail.batch.totalAmount)}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#E8001C]" />
                    <h3 className="text-sm font-semibold text-gray-950">Settlement lines</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Bank destination lines contained in this settlement batch.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        <th className="px-5 py-4">Bank</th>
                        <th className="px-5 py-4">Account Number</th>
                        <th className="px-5 py-4">Account Name</th>
                        <th className="px-5 py-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {detail.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-5 py-4 text-gray-700">{line.bankName}</td>
                          <td className="px-5 py-4 font-medium text-gray-700">{line.accountNumber}</td>
                          <td className="px-5 py-4 text-gray-700">{line.accountName}</td>
                          <td className="px-5 py-4 font-medium text-gray-950">{formatCurrency(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
