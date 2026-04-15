import { LayoutDashboard, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const ADMIN_STATS = [
  { label: 'Total Settled (This Month)', value: 8_940_200_000, change: 12.4, up: true },
  { label: 'Total Transactions', value: null, count: 14382, change: 8.1, up: true },
  { label: 'Active MDAs', value: null, count: 47, change: 3, up: true },
  { label: 'Pending Invitations', value: null, count: 5, change: -2, up: false },
];

const MDA_STATS = [
  { label: 'Total Settled (This Month)', value: 420_500_000, change: 6.2, up: true },
  { label: 'Total Transactions', value: null, count: 1843, change: 4.5, up: true },
  { label: 'Avg. Transaction Value', value: 228_000, change: 1.8, up: true },
  { label: 'Last Settlement', value: null, label2: '12 Apr 2025', change: 0, up: true },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'aggregator_admin';
  const stats = isAdmin ? ADMIN_STATS : MDA_STATS;

  return (
    <div className="p-5 lg:p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? `Overview of all collections under ${user?.aggregatorName}`
              : `${user?.mdaName} — Collection ${user?.collectionCode}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200">
          <Activity className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 leading-tight max-w-[140px]">{stat.label}</p>
              <div className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value != null
                ? formatCurrency(stat.value)
                : stat.label2 ?? stat.count?.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">vs. previous month</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-[#E8001C]" />
          <h2 className="font-semibold text-gray-800 text-sm">Settlement Trend</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">Daily settlement volumes — current month</p>
        <div className="h-40 flex items-end gap-1.5">
          {Array.from({ length: 15 }, (_, i) => {
            const heights = [35, 55, 45, 70, 60, 80, 50, 65, 90, 75, 85, 60, 70, 95, 80];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${heights[i]}%`,
                    background: i === 14 ? '#E8001C' : '#E8001C20',
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-0.5">
          <span>Apr 1</span>
          <span>Apr 8</span>
          <span>Apr 15</span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <LayoutDashboard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Phase 2 coming soon</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Full interactive dashboard with real-time collection metrics, MDA breakdowns, and trend charts
            will be implemented in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
