import { Activity, Building2, Rows3, Wallet } from 'lucide-react';
import { MDABreakdownTable } from '../components/dashboard/MDABreakdownTable';
import { SettlementTrendChart } from '../components/dashboard/SettlementTrendChart';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { DateRangeDropdown } from '../components/ui/DateRangeDropdown';
import { useAuth } from '../context/AuthContext';
import { useTransactionDashboard } from '../hooks/useTransactions';
import { formatCompactCurrency, formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'aggregator_admin';
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
    {
      label: 'Average Settled Value',
      value: formatCurrency(summary?.averageAmount ?? 0),
      helper: isAdmin
        ? `${summary?.breakdown.length ?? 0} MDA scopes active in this window`
        : `${user.collectionCode} / ${user.serviceCode}`,
      change: summary?.averageAmountChange,
      icon: <Activity className="h-5 w-5" />,
    },
    isAdmin
      ? {
          label: 'Leading MDA',
          value: formatCompactCurrency(summary?.topPerformer?.totalAmount ?? 0),
          helper: summary?.topPerformer?.mdaName ?? 'No settled collections in this range',
          change: summary?.topPerformer?.periodChange,
          icon: <Building2 className="h-5 w-5" />,
        }
      : {
          label: 'Assigned Scope',
          value: user.collectionCode ?? 'Not assigned',
          helper: user.serviceCode ? `Service ${user.serviceCode}` : 'No service code assigned',
          icon: <Building2 className="h-5 w-5" />,
        },
  ];

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <DateRangeDropdown dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {error && (
        <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-slate-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            {isAdmin
              ? 'All dashboard metrics roll up across every MDA under the active aggregator.'
              : 'This view is already restricted to the signed-in MDA assignment.'}
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
            {!isAdmin && (
              <div className="app-card px-4 py-3">
                <dt className="app-kicker">Collection scope</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-950">
                  {user.collectionCode} / {user.serviceCode}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <MDABreakdownTable
        rows={summary?.breakdown ?? []}
        isLoading={isLoading}
        title={isAdmin ? 'Per-MDA breakdown' : 'Assigned collection snapshot'}
        description={
          isAdmin
            ? 'Settled collections ranked by volume for the selected window.'
            : 'Only your assigned collection and service code are included in this breakdown.'
        }
      />
    </div>
  );
}
