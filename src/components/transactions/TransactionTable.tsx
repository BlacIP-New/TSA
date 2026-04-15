import { ChevronRight } from 'lucide-react';
import { Transaction } from '../../types/transaction';
import { formatChannel, formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onSelect: (transactionId: string) => void;
}

export function TransactionTable({
  transactions,
  isLoading = false,
  onSelect,
}: TransactionTableProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="px-5 py-4">Reference</th>
              <th className="px-5 py-4">Payer Name</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Channel</th>
              <th className="px-5 py-4">Settlement Date</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={6}>
                    <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500">
                  No transactions matched the current filters.
                </td>
              </tr>
            )}

            {!isLoading &&
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => onSelect(transaction.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(transaction.id);
                    }
                  }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-950">{transaction.reference}</p>
                        <p className="mt-1 text-xs text-gray-500">Collection {transaction.collectionCode}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700">{transaction.payerName}</td>
                  <td className="px-5 py-4 font-medium text-gray-950">{formatCurrency(transaction.amount)}</td>
                  <td className="px-5 py-4 text-gray-600">{formatChannel(transaction.channel)}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(transaction.settlementDate)}</td>
                  <td className="px-5 py-4">
                    <TransactionStatusBadge status={transaction.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
