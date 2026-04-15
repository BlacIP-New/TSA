import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  change?: number;
}

export function SummaryCard({ label, value, helper, icon, change }: SummaryCardProps) {
  const changeTone =
    change == null ? 'text-gray-500 bg-gray-100' : change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50';

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-[#E8001C]/8 p-3 text-[#E8001C]">{icon}</div>
        {change != null && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${changeTone}`}>
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {formatPercentage(change)}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{helper}</p>
    </article>
  );
}
