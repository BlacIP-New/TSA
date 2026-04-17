import { Building2, Rows3, Wallet } from 'lucide-react';
import { MDABreakdownTable } from '../components/dashboard/MDABreakdownTable';
import { SettlementTrendChart } from '../components/dashboard/SettlementTrendChart';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
import { useAuth } from '../context/AuthContext';
import { useTransactionDashboard } from '../hooks/useTransactions';
import { formatCompactCurrency, formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const isSystemRole = user?.role === 'system_admin' || user?.role === 'system_user';
  const { dateRange, setDateRange, summary, chart, isLoading, error } =
    useTransactionDashboard(user);

  if (!user) return null;

  const summaryCards = [
    {
      label: 'Total Settled Amount',
      value: formatCurrency(summary?.totalAmount ?? 0),
      helper: `Previous period: ${formatCompactCurrency(summary?.previousPeriodAmount ?? 0)}`,
      change: summary?.percentageChange,
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      label: 'Settlement Lines',
      value: (summary?.totalCount ?? 0).toLocaleString(),
      helper: `Previous period: ${(summary?.previousPeriodCount ?? 0).toLocaleString()} lines`,
      change: summary?.countPercentageChange,
      icon: <Rows3 className="h-5 w-5" />,
    },
    isSystemRole
      ? {
          label: 'Leading MDA',
          value: formatCompactCurrency(summary?.topPerformer?.totalAmount ?? 0),
          helper: summary?.topPerformer?.mdaName ?? 'No settled collections in this range',
          change: summary?.topPerformer?.periodChange,
          icon: <Building2 className="h-5 w-5" />,
        }
      : {
          label: 'Assigned Scope',
          value: user.role === 'mda_admin' ? user.mdaCode ?? 'MDA scope' : user.collectionCode ?? 'Not assigned',
          helper:
            user.role === 'mda_admin'
              ? 'All collection codes under your MDA'
              : user.serviceCode
                ? `Service ${user.serviceCode}`
                : 'No service code assigned',
          icon: <Building2 className="h-5 w-5" />,
        },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <DateRangeDropdown dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {error && (
        <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-slate-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <SettlementTrendChart chart={chart} isLoading={isLoading} />

        <section className="app-panel border-gray-300 p-5">
          <p className="text-base font-semibold text-slate-950">Current scope</p>
          <p className="mt-1 text-sm text-slate-500">
            {isSystemRole
              ? 'All dashboard metrics roll up across every MDA under the active aggregator.'
              : user.role === 'mda_admin'
                ? 'This view is restricted to your MDA and aggregated across all collections under it.'
                : 'This view is already restricted to your assigned MDA collection scope.'}
          </p>

          <dl className="mt-5 space-y-3">
            <div className="app-card px-4 py-3">
              <dt className="app-kicker">Date window</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-950">
                {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
              </dd>
            </div>
            <div className="app-card px-4 py-3">
              <dt className="app-kicker">Aggregator</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-950">{user.aggregatorName}</dd>
            </div>
            {!isSystemRole && (
              <div className="app-card px-4 py-3">
                <dt className="app-kicker">Scope</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-950">
                  {user.role === 'mda_admin'
                    ? `${user.mdaCode} (all collections)`
                    : `${user.collectionCode} / ${user.serviceCode}`}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <MDABreakdownTable
        rows={summary?.breakdown ?? []}
        isLoading={isLoading}
        title={isSystemRole ? 'Per-MDA breakdown' : user.role === 'mda_admin' ? 'MDA collection snapshot' : 'Assigned collection snapshot'}
        description={
          isSystemRole
            ? 'Settled collections ranked by volume for the selected window.'
            : user.role === 'mda_admin'
              ? 'All collection codes under your MDA are included in this breakdown.'
              : 'Only your assigned collection and service code are included in this breakdown.'
        }
      />
    </div>
  );
}
