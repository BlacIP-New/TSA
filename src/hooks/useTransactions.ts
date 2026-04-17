import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from '../types/auth';
import {
  CollectionChart,
  PaginatedSettlementBatches,
  SettlementBatchDetail,
  SettlementBatchFilters,
  TransactionSummary,
} from '../types/transaction';
import {
  getCollectionsChart,
  getCollectionsSummary,
  getSettlementBatchDetail,
  getSettlementBatches,
} from '../services/transactionService';
import { PageSizeOption } from '../context/filter-store';

export interface DashboardDateRange {
  from: string;
  to: string;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthDateRange(baseDate = new Date()): DashboardDateRange {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  return {
    from: toDateInput(new Date(year, month, 1)),
    to: toDateInput(baseDate),
  };
}

export function getLast30DayDateRange(baseDate = new Date()): DashboardDateRange {
  const startDate = new Date(baseDate);
  startDate.setDate(baseDate.getDate() - 29);

  return {
    from: toDateInput(startDate),
    to: toDateInput(baseDate),
  };
}

export function useTransactionDashboard(user: AuthUser | null) {
  const [dateRange, setDateRange] = useState<DashboardDateRange>(() => getLast30DayDateRange());
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [chart, setChart] = useState<CollectionChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user?.aggregatorId) {
      setSummary(null);
      setChart(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scope = {
        aggregatorId: user.aggregatorId,
        mdaId: user.role === 'mda_admin' || user.role === 'mda_user' ? user.mdaId : undefined,
        collectionCode: user.role === 'mda_user' ? user.collectionCode : undefined,
        serviceCode: user.role === 'mda_user' ? user.serviceCode : undefined,
        from: dateRange.from,
        to: dateRange.to,
      };

      const [summaryResponse, chartResponse] = await Promise.all([
        getCollectionsSummary(scope),
        getCollectionsChart({ ...scope, groupBy: 'day' }),
      ]);

      setSummary(summaryResponse);
      setChart(chartResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load dashboard metrics right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange.from,
    dateRange.to,
    user?.aggregatorId,
    user?.mdaId,
    user?.collectionCode,
    user?.role,
    user?.serviceCode,
  ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    dateRange,
    setDateRange,
    summary,
    chart,
    isLoading,
    error,
    refresh: loadDashboard,
  };
}

const EMPTY_SETTLEMENT_BATCH_PAGE: PaginatedSettlementBatches = {
  data: [],
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
};

export function useSettlementBatchLedger(
  user: AuthUser | null,
  filters: SettlementBatchFilters,
  page: number,
  limit: PageSizeOption
) {
  const [result, setResult] = useState<PaginatedSettlementBatches>(EMPTY_SETTLEMENT_BATCH_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { from, to, batchId, minAmount, maxAmount } = filters;

  const loadSettlementBatches = useCallback(async () => {
    if (!user?.aggregatorId) {
      setResult(EMPTY_SETTLEMENT_BATCH_PAGE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSettlementBatches({
        aggregatorId: user.aggregatorId,
        mdaId: user.role === 'mda_admin' || user.role === 'mda_user' ? user.mdaId : undefined,
        collectionCode: user.role === 'mda_user' ? user.collectionCode : undefined,
        serviceCode: user.role === 'mda_user' ? user.serviceCode : undefined,
        page,
        limit,
        from,
        to,
        batchId,
        minAmount,
        maxAmount,
      });

      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load settlement batches right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    batchId,
    from,
    maxAmount,
    minAmount,
    limit,
    page,
    user?.aggregatorId,
    user?.mdaId,
    user?.collectionCode,
    user?.role,
    user?.serviceCode,
  ]);

  useEffect(() => {
    void loadSettlementBatches();
  }, [loadSettlementBatches]);

  return {
    result,
    isLoading,
    error,
    refresh: loadSettlementBatches,
  };
}

export function useSettlementBatchDetail(batchId: string | null, user: AuthUser | null) {
  const [detail, setDetail] = useState<SettlementBatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId) {
      setDetail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const currentBatchId = batchId;

    async function loadSettlementBatch() {
      setIsLoading(true);
      setError(null);

      try {
        if (!user?.aggregatorId) {
          throw new Error('Unable to verify your access scope for this settlement batch.');
        }

        const response = await getSettlementBatchDetail(currentBatchId, {
          aggregatorId: user.aggregatorId,
          mdaId: user.role === 'mda_admin' || user.role === 'mda_user' ? user.mdaId : undefined,
          collectionCode: user.role === 'mda_user' ? user.collectionCode : undefined,
          serviceCode: user.role === 'mda_user' ? user.serviceCode : undefined,
        });
        if (isMounted) setDetail(response);
      } catch (caughtError) {
        if (!isMounted) return;
        setDetail(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load settlement batch details.'
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSettlementBatch();

    return () => {
      isMounted = false;
    };
  }, [batchId, user?.aggregatorId, user?.collectionCode, user?.mdaId, user?.role, user?.serviceCode]);

  return {
    detail,
    isLoading,
    error,
  };
}
