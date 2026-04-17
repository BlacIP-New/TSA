/**
 * Transaction Service — settlement-batch implementation for dashboard and /transactions route.
 *
 * Backend swap-in points:
 *   GET /collections/summary
 *   GET /collections/chart
 *   GET /settlements/batches
 *   GET /settlements/batches/:batchId
 */

import { getMockSettlementBatchDetailById, mockSettlementBatches } from '../data/mockSettlements';
import {
  CollectionChart,
  CollectionChartParams,
  CollectionSummaryParams,
  MdaBreakdownRow,
  PaginatedSettlementBatches,
  SettlementBatch,
  SettlementBatchDetail,
  SettlementBatchQueryParams,
  TransactionSummary,
} from '../types/transaction';

const NETWORK_DELAY_MS = 650;
const DAY_MS = 24 * 60 * 60 * 1000;

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toUtcDate(value: string, endOfDay = false) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
  );
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatBucketLabel(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getScopedSettlementBatches({
  aggregatorId,
  mdaId,
  collectionCode,
  serviceCode,
}: {
  aggregatorId: string;
  mdaId?: string;
  collectionCode?: string;
  serviceCode?: string;
}) {
  return mockSettlementBatches.filter((batch) => {
    if (batch.aggregatorId !== aggregatorId) return false;
    if (mdaId && batch.mdaId !== mdaId) return false;
    if (collectionCode && batch.collectionCode !== collectionCode) return false;
    if (serviceCode && batch.serviceCode !== serviceCode) return false;
    return true;
  });
}

function getDateFilteredBatches<T extends { from?: string; to?: string }>(
  batches: SettlementBatch[],
  params: T,
) {
  const fromDate = params.from ? toUtcDate(params.from) : null;
  const toDate = params.to ? toUtcDate(params.to, true) : null;

  return batches.filter((batch) => {
    const comparisonDate = new Date(batch.settledDate);
    if (fromDate && comparisonDate < fromDate) return false;
    if (toDate && comparisonDate > toDate) return false;
    return true;
  });
}

function getPreviousRange({ from, to }: Pick<CollectionSummaryParams, 'from' | 'to'>) {
  const currentFrom = toUtcDate(from);
  const currentTo = toUtcDate(to, true);
  const currentDuration = currentTo.getTime() - currentFrom.getTime();

  const previousTo = new Date(currentFrom.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - currentDuration);

  return {
    from: toDateInput(previousFrom),
    to: toDateInput(previousTo),
  };
}

function buildBreakdown(currentBatches: SettlementBatch[], previousBatches: SettlementBatch[]): MdaBreakdownRow[] {
  const previousTotals = new Map<string, number>();
  const previousCounts = new Map<string, number>();

  previousBatches.forEach((batch) => {
    const key = `${batch.collectionCode}:${batch.serviceCode}`;
    previousTotals.set(key, (previousTotals.get(key) ?? 0) + batch.totalAmount);
    previousCounts.set(key, (previousCounts.get(key) ?? 0) + batch.itemCount);
  });

  const totalAmount = currentBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
  const rows = new Map<string, MdaBreakdownRow>();

  currentBatches.forEach((batch) => {
    const key = `${batch.collectionCode}:${batch.serviceCode}`;
    const existing = rows.get(key);

    if (existing) {
      existing.totalAmount += batch.totalAmount;
      existing.settlementLineCount += batch.itemCount;
      if (new Date(batch.settledDate) > new Date(existing.lastSettlementDate)) {
        existing.lastSettlementDate = batch.settledDate;
      }
      return;
    }

    rows.set(key, {
      mdaName: batch.mdaName,
      collectionCode: batch.collectionCode,
      serviceCode: batch.serviceCode,
      totalAmount: batch.totalAmount,
      settlementLineCount: batch.itemCount,
      percentageOfTotal: 0,
      periodChange: 0,
      lastSettlementDate: batch.settledDate,
    });
  });

  return [...rows.values()]
    .map((row) => {
      const previousTotal = previousTotals.get(`${row.collectionCode}:${row.serviceCode}`) ?? 0;
      return {
        ...row,
        percentageOfTotal: totalAmount === 0 ? 0 : Number(((row.totalAmount / totalAmount) * 100).toFixed(1)),
        periodChange: calculatePercentageChange(row.totalAmount, previousTotal),
      };
    })
    .sort((left, right) => right.totalAmount - left.totalAmount);
}

export async function getCollectionsSummary(params: CollectionSummaryParams): Promise<TransactionSummary> {
  await delay();

  const scopedBatches = getScopedSettlementBatches(params);
  const currentBatches = getDateFilteredBatches(scopedBatches, params);
  const previousRange = getPreviousRange(params);
  const previousBatches = getDateFilteredBatches(scopedBatches, previousRange);

  const totalAmount = currentBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
  const totalCount = currentBatches.reduce((sum, batch) => sum + batch.itemCount, 0);
  const previousPeriodAmount = previousBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
  const previousPeriodCount = previousBatches.reduce((sum, batch) => sum + batch.itemCount, 0);
  const averageAmount = totalCount === 0 ? 0 : totalAmount / totalCount;
  const previousAverageAmount = previousPeriodCount === 0 ? 0 : previousPeriodAmount / previousPeriodCount;
  const breakdown = buildBreakdown(currentBatches, previousBatches);

  return {
    totalAmount,
    totalCount,
    averageAmount,
    previousPeriodAmount,
    previousPeriodCount,
    percentageChange: calculatePercentageChange(totalAmount, previousPeriodAmount),
    countPercentageChange: calculatePercentageChange(totalCount, previousPeriodCount),
    averageAmountChange: calculatePercentageChange(averageAmount, previousAverageAmount),
    breakdown,
    topPerformer: breakdown[0] ?? null,
  };
}

export async function getCollectionsChart(params: CollectionChartParams): Promise<CollectionChart> {
  await delay();

  const batches = getDateFilteredBatches(getScopedSettlementBatches(params), params);
  const rangeStart = toUtcDate(params.from);
  const rangeEnd = toUtcDate(params.to);
  const stepSize = params.groupBy === 'day' ? 1 : 7;
  const points: CollectionChart['points'] = [];

  for (let offset = 0; rangeStart.getTime() + offset * DAY_MS <= rangeEnd.getTime(); offset += stepSize) {
    const bucketStart = new Date(rangeStart.getTime() + offset * DAY_MS);
    const bucketEnd = new Date(Math.min(bucketStart.getTime() + (stepSize - 1) * DAY_MS, rangeEnd.getTime()));
    const bucketBatches = batches.filter((batch) => {
      const settlementTime = new Date(batch.settledDate).getTime();
      return settlementTime >= bucketStart.getTime() && settlementTime <= bucketEnd.getTime() + DAY_MS - 1;
    });

    points.push({
      label:
        params.groupBy === 'day'
          ? formatBucketLabel(bucketStart)
          : `${formatBucketLabel(bucketStart)} - ${formatBucketLabel(bucketEnd)}`,
      value: bucketBatches.reduce((sum, batch) => sum + batch.totalAmount, 0),
      transactionCount: bucketBatches.reduce((sum, batch) => sum + batch.itemCount, 0),
      from: toDateInput(bucketStart),
      to: toDateInput(bucketEnd),
    });
  }

  return {
    groupBy: params.groupBy,
    points,
    totalAmount: points.reduce((sum, point) => sum + point.value, 0),
    totalCount: points.reduce((sum, point) => sum + point.transactionCount, 0),
  };
}

export async function getSettlementBatches(
  params: SettlementBatchQueryParams,
): Promise<PaginatedSettlementBatches> {
  await delay();

  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const scopedBatches = getDateFilteredBatches(getScopedSettlementBatches(params), params);

  const filteredBatches = scopedBatches
    .filter((batch) => {
      if (params.batchId && !batch.batchId.toLowerCase().includes(params.batchId.toLowerCase())) {
        return false;
      }
      if (params.minAmount !== '' && params.minAmount != null && batch.totalAmount < params.minAmount) return false;
      if (params.maxAmount !== '' && params.maxAmount != null && batch.totalAmount > params.maxAmount) return false;
      return true;
    })
    .sort((left, right) => new Date(right.settledDate).getTime() - new Date(left.settledDate).getTime());

  const total = filteredBatches.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  return {
    data: filteredBatches.slice(startIndex, startIndex + limit),
    total,
    page,
    limit,
    totalPages,
  };
}

interface SettlementAccessScope {
  aggregatorId: string;
  mdaId?: string;
  collectionCode?: string;
  serviceCode?: string;
}

export async function getSettlementBatchDetail(
  batchId: string,
  scope: SettlementAccessScope,
): Promise<SettlementBatchDetail> {
  await delay(320);
  const detail = getMockSettlementBatchDetailById(batchId);

  if (!detail) {
    throw new Error('Settlement batch not found.');
  }

  if (detail.batch.aggregatorId !== scope.aggregatorId) {
    throw new Error('Access denied. This settlement batch is outside the active aggregator scope.');
  }

  if (scope.mdaId && detail.batch.mdaId !== scope.mdaId) {
    throw new Error('Access denied. This settlement batch is outside your assigned MDA scope.');
  }

  if (scope.collectionCode && detail.batch.collectionCode !== scope.collectionCode) {
    throw new Error('Access denied. This settlement batch is outside your assigned collection scope.');
  }

  if (scope.serviceCode && detail.batch.serviceCode !== scope.serviceCode) {
    throw new Error('Access denied. This settlement batch is outside your assigned service scope.');
  }

  return detail;
}
