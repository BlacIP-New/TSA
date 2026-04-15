import { SettlementStatus } from '../../types/transaction';

interface SettlementStatusBadgeProps {
  status: SettlementStatus;
}

const statusClasses: Record<SettlementStatus, string> = {
  Settled: 'bg-emerald-100 text-emerald-900',
  Pending: 'bg-amber-100 text-amber-900',
  Failed: 'bg-red-100 text-red-700',
  Queued: 'bg-slate-100 text-slate-500',
  'Partially Settled': 'bg-amber-100 text-amber-950',
  Refunded: 'bg-slate-200 text-slate-700',
  'Offline Settlement': 'bg-slate-200 text-slate-700',
  'Paused Settlement': 'bg-red-100 text-red-700',
};

export function SettlementStatusBadge({ status }: SettlementStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
