/**
 * Transaction Service — integration-ready mock implementation for dashboard and ledger endpoints.
 *
 * Backend swap-in points:
 *   GET /collections/summary
 *   GET /collections/chart
 *   GET /transactions
 *   GET /transactions/:id
 */

import { getMockTransactionById, mockTransactions } from '../data/mockTransactions';
import {
  CollectionChart,
  CollectionChartParams,
  CollectionSummaryParams,
  MdaBreakdownRow,
  PaginatedTransactions,
  Transaction,
  TransactionQueryParams,
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

function getScopedTransactions({
  aggregatorId,
  collectionCode,
  serviceCode,
}: {
  aggregatorId: string;
  collectionCode?: string;
  serviceCode?: string;
}) {
  return mockTransactions.filter((transaction) => {
    if (transaction.aggregatorId !== aggregatorId) return false;
    if (collectionCode && transaction.collectionCode !== collectionCode) return false;
    if (serviceCode && transaction.serviceCode !== serviceCode) return false;
    return true;
  });
}

function getDateFilteredTransactions<T extends { from?: string; to?: string }>(
  transactions: Transaction[],
  params: T,
  settledOnly = false
) {
  const fromDate = params.from ? toUtcDate(params.from) : null;
  const toDate = params.to ? toUtcDate(params.to, true) : null;

  return transactions.filter((transaction) => {
    if (settledOnly && transaction.status !== 'settled') return false;

    const comparisonDate = new Date(transaction.settlementDate);
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

function buildBreakdown(currentTransactions: Transaction[], previousTransactions: Transaction[]): MdaBreakdownRow[] {
  const previousTotals = new Map<string, number>();

  previousTransactions.forEach((transaction) => {
    const key = `${transaction.collectionCode}:${transaction.serviceCode}`;
    previousTotals.set(key, (previousTotals.get(key) ?? 0) + transaction.amount);
  });

  const totalAmount = currentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const rows = new Map<string, MdaBreakdownRow>();

  currentTransactions.forEach((transaction) => {
    const key = `${transaction.collectionCode}:${transaction.serviceCode}`;
    const existing = rows.get(key);

    if (existing) {
      existing.totalAmount += transaction.amount;
      existing.transactionCount += 1;
      if (new Date(transaction.settlementDate) > new Date(existing.lastSettlementDate)) {
        existing.lastSettlementDate = transaction.settlementDate;
      }
      return;
    }

    rows.set(key, {
      mdaName: transaction.narration.split(' settlement')[0],
      collectionCode: transaction.collectionCode,
      serviceCode: transaction.serviceCode,
      totalAmount: transaction.amount,
      transactionCount: 1,
      percentageOfTotal: 0,
      periodChange: 0,
      lastSettlementDate: transaction.settlementDate,
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

  const scopedTransactions = getScopedTransactions(params);
  const currentTransactions = getDateFilteredTransactions(scopedTransactions, params, true);
  const previousRange = getPreviousRange(params);
  const previousTransactions = getDateFilteredTransactions(scopedTransactions, previousRange, true);

  const totalAmount = currentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalCount = currentTransactions.length;
  const previousPeriodAmount = previousTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const previousPeriodCount = previousTransactions.length;
  const averageAmount = totalCount === 0 ? 0 : totalAmount / totalCount;
  const previousAverageAmount = previousPeriodCount === 0 ? 0 : previousPeriodAmount / previousPeriodCount;
  const breakdown = buildBreakdown(currentTransactions, previousTransactions);

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

  const transactions = getDateFilteredTransactions(getScopedTransactions(params), params, true);
  const rangeStart = toUtcDate(params.from);
  const rangeEnd = toUtcDate(params.to);
  const stepSize = params.groupBy === 'day' ? 1 : 7;
  const points: CollectionChart['points'] = [];

  for (let offset = 0; rangeStart.getTime() + offset * DAY_MS <= rangeEnd.getTime(); offset += stepSize) {
    const bucketStart = new Date(rangeStart.getTime() + offset * DAY_MS);
    const bucketEnd = new Date(Math.min(bucketStart.getTime() + (stepSize - 1) * DAY_MS, rangeEnd.getTime()));
    const bucketTransactions = transactions.filter((transaction) => {
      const settlementTime = new Date(transaction.settlementDate).getTime();
      return settlementTime >= bucketStart.getTime() && settlementTime <= bucketEnd.getTime() + DAY_MS - 1;
    });

    points.push({
      label:
        params.groupBy === 'day'
          ? formatBucketLabel(bucketStart)
          : `${formatBucketLabel(bucketStart)} - ${formatBucketLabel(bucketEnd)}`,
      value: bucketTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      transactionCount: bucketTransactions.length,
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

export async function getTransactions(params: TransactionQueryParams): Promise<PaginatedTransactions> {
  await delay();

  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const scopedTransactions = getDateFilteredTransactions(getScopedTransactions(params), params);

  const filteredTransactions = scopedTransactions
    .filter((transaction) => {
      if (params.channel && transaction.channel !== params.channel) return false;
      if (params.status && transaction.status !== params.status) return false;
      if (params.minAmount !== '' && params.minAmount != null && transaction.amount < params.minAmount) return false;
      if (params.maxAmount !== '' && params.maxAmount != null && transaction.amount > params.maxAmount) return false;
      if (
        params.search &&
        !`${transaction.reference} ${transaction.payerName} ${transaction.collectionCode}`
          .toLowerCase()
          .includes(params.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((left, right) => new Date(right.settlementDate).getTime() - new Date(left.settlementDate).getTime());

  const total = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  return {
    data: filteredTransactions.slice(startIndex, startIndex + limit),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getTransactionById(id: string): Promise<Transaction> {
  await delay(320);
  const transaction = getMockTransactionById(id);

  if (!transaction) {
    throw new Error('Transaction not found.');
  }

  return transaction;
}

interface TransactionAccessScope {
  aggregatorId: string;
  collectionCode?: string;
  serviceCode?: string;
}

export async function getScopedTransactionById(
  id: string,
  scope: TransactionAccessScope
): Promise<Transaction> {
  const transaction = await getTransactionById(id);

  if (transaction.aggregatorId !== scope.aggregatorId) {
    throw new Error('Access denied. This transaction is outside the active aggregator scope.');
  }

  if (scope.collectionCode && transaction.collectionCode !== scope.collectionCode) {
    throw new Error('Access denied. This transaction is outside your assigned collection scope.');
  }

  if (scope.serviceCode && transaction.serviceCode !== scope.serviceCode) {
    throw new Error('Access denied. This transaction is outside your assigned service scope.');
  }

  return transaction;
}
