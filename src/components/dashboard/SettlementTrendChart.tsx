import { formatCompactCurrency } from '../../utils/formatters';
import { CollectionChart } from '../../types/transaction';

interface SettlementTrendChartProps {
  chart: CollectionChart | null;
  isLoading?: boolean;
}

function buildLinePath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export function SettlementTrendChart({ chart, isLoading = false }: SettlementTrendChartProps) {
  if (isLoading) {
    return (
      <section className="app-panel border-white/70 p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-36 rounded-full bg-slate-200" />
          <div className="h-8 w-48 rounded-full bg-slate-200" />
          <div className="h-64 rounded-[28px] bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!chart || chart.points.length === 0) {
    return (
      <section className="app-panel border-white/70 p-5">
        <p className="text-base font-semibold text-slate-950">Settlement trend</p>
        <p className="mt-2 text-sm text-slate-500">No settled transactions were found for the selected range.</p>
      </section>
    );
  }

  const width = 1000;
  const height = 280;
  const padding = { top: 20, right: 24, bottom: 34, left: 24 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...chart.points.map((point) => point.value), 1);
  const step = chart.points.length > 1 ? chartWidth / (chart.points.length - 1) : chartWidth / 2;
  const points = chart.points.map((point, index) => {
    const x = chart.points.length > 1 ? padding.left + index * step : padding.left + chartWidth / 2;
    const y = padding.top + chartHeight - (point.value / maxValue) * chartHeight;
    return { x, y, value: point.value };
  });

  const linePath = buildLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  const labelInterval = Math.max(1, Math.ceil(chart.points.length / 6));

  return (
    <section className="app-panel border-white/70 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950">Settlement trend</p>
          <p className="mt-1 text-sm text-slate-500">
            {chart.groupBy === 'day' ? 'Daily' : 'Weekly'} settled volume across the selected range
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <p className="app-kicker">Range total</p>
          <p className="mt-1 text-lg font-semibold text-slate-950 tabular-nums">
            {formatCompactCurrency(chart.totalAmount)}
          </p>
          <p className="text-sm text-slate-500">{chart.totalCount.toLocaleString()} settled lines</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px]">
          {Array.from({ length: 4 }, (_, index) => {
            const y = padding.top + (chartHeight / 3) * index;
            return (
              <line
                key={index}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#dbe3ee"
                strokeDasharray="6 8"
              />
            );
          })}

          {points.map((point, index) => {
            const barWidth = Math.max(14, chartWidth / Math.max(chart.points.length * 1.9, 1));
            return (
              <rect
                key={chart.points[index].label}
                x={point.x - barWidth / 2}
                y={point.y}
                width={barWidth}
                height={padding.top + chartHeight - point.y}
                rx={barWidth / 2}
                fill={index === chart.points.length - 1 ? '#8bbdff' : 'rgba(148, 163, 184, 0.22)'}
              />
            );
          })}

          <path d={areaPath} fill="rgba(125, 183, 255, 0.12)" />
          <path d={linePath} fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <circle
              key={`${chart.points[index].label}-point`}
              cx={point.x}
              cy={point.y}
              r={5}
              fill={index === chart.points.length - 1 ? '#8bbdff' : '#ffffff'}
              stroke="#334155"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
        {chart.points.map((point, index) => {
          if (index !== 0 && index !== chart.points.length - 1 && index % labelInterval !== 0) {
            return null;
          }

          return (
            <span key={`${point.label}-axis`} className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1">
              {point.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
