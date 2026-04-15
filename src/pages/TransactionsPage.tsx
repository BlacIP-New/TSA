import { List } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="p-5 lg:p-8">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3 max-w-lg">
        <List className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Phase 3 — Transaction Ledger</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Paginated, filterable transaction table with detail view will be implemented in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
