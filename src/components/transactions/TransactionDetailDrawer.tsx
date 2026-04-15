import { useEffect } from 'react';
import { CalendarClock, Landmark, Receipt, ShieldCheck, X } from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { useTransactionDetail } from '../../hooks/useTransactions';
import { formatChannel, formatCurrency, formatDateTime } from '../../utils/formatters';
import { Alert } from '../ui/Alert';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionDetailDrawerProps {
  transactionId: string | null;
  user: AuthUser | null;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-950 break-words">{value}</dd>
    </div>
  );
}

export function TransactionDetailDrawer({
  transactionId,
  user,
  onClose,
}: TransactionDetailDrawerProps) {
  const isOpen = transactionId !== null;
  const { transaction, isLoading, error } = useTransactionDetail(transactionId, user);

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

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-950">Transaction detail</p>
            <p className="mt-1 text-sm text-gray-500">
              Full metadata for the selected ledger entry.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
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

          {!isLoading && transaction && (
            <>
              <section className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Reference</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
                      {transaction.reference}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{transaction.payerName}</p>
                  </div>
                  <TransactionStatusBadge status={transaction.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Amount" value={formatCurrency(transaction.amount)} />
                  <DetailItem label="Channel" value={formatChannel(transaction.channel)} />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#E8001C]" />
                  <h3 className="text-sm font-semibold text-gray-950">Payer metadata</h3>
                </div>
                <dl className="grid gap-3">
                  <DetailItem label="Payer name" value={transaction.payerName} />
                  <DetailItem label="Payer account" value={transaction.payerAccount} />
                  <DetailItem label="Payer bank" value={transaction.payerBank} />
                  <DetailItem label="Narration" value={transaction.narration} />
                </dl>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-[#E8001C]" />
                  <h3 className="text-sm font-semibold text-gray-950">Settlement metadata</h3>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Created at" value={formatDateTime(transaction.createdAt)} />
                  <DetailItem label="Settlement date" value={formatDateTime(transaction.settlementDate)} />
                  <DetailItem label="Settlement batch" value={transaction.settlementBatch ?? 'Not assigned'} />
                  <DetailItem label="Status" value={transaction.status} />
                </dl>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-[#E8001C]" />
                  <h3 className="text-sm font-semibold text-gray-950">Collection scope</h3>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Collection code" value={transaction.collectionCode} />
                  <DetailItem label="Service code" value={transaction.serviceCode} />
                  <DetailItem label="Aggregator ID" value={transaction.aggregatorId} />
                  <DetailItem label="Transaction ID" value={transaction.id} />
                </dl>
              </section>

              <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Audit-ready record</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      This drawer includes the raw settlement and scope metadata needed for reconciliation and compliance review.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
