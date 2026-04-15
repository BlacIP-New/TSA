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
  const changeTone = 'border-gray-300 bg-white text-slate-600';

  return (
    <article className="app-panel border-gray-300 p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-700">
          {icon}
        </div>
        {change != null && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${changeTone}`}>
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {formatPercentage(change)}
          </span>
        )}
      </div>
      <p className="app-kicker">{label}</p>
      <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{helper}</p>
    </article>
  );
}
