import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from '../types/auth';
import {
  ChartGroupBy,
  CollectionChart,
  PaginatedTransactions,
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from '../types/transaction';
import {
  getCollectionsChart,
  getCollectionsSummary,
  getScopedTransactionById,
  getTransactions,
} from '../services/transactionService';
import { TransactionPageSize } from '../context/filter-store';

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
  const [dateRange, setDateRange] = useState<DashboardDateRange>(() => getCurrentMonthDateRange());
  const [groupBy, setGroupBy] = useState<ChartGroupBy>('day');
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
        collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
        serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
        from: dateRange.from,
        to: dateRange.to,
      };

      const [summaryResponse, chartResponse] = await Promise.all([
        getCollectionsSummary(scope),
        getCollectionsChart({ ...scope, groupBy }),
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
    groupBy,
    user?.aggregatorId,
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
    groupBy,
    setGroupBy,
    summary,
    chart,
    isLoading,
    error,
    refresh: loadDashboard,
  };
}

const EMPTY_TRANSACTION_PAGE: PaginatedTransactions = {
  data: [],
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
};

export function useTransactionLedger(
  user: AuthUser | null,
  filters: TransactionFilters,
  page: number,
  limit: TransactionPageSize
) {
  const [result, setResult] = useState<PaginatedTransactions>(EMPTY_TRANSACTION_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!user?.aggregatorId) {
      setResult(EMPTY_TRANSACTION_PAGE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getTransactions({
        aggregatorId: user.aggregatorId,
        collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
        serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
        page,
        limit,
        ...filters,
      });

      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load transactions right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filters,
    limit,
    page,
    user?.aggregatorId,
    user?.collectionCode,
    user?.role,
    user?.serviceCode,
  ]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return {
    result,
    isLoading,
    error,
    refresh: loadTransactions,
  };
}

export function useTransactionDetail(transactionId: string | null, user: AuthUser | null) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setTransaction(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const currentTransactionId = transactionId;

    async function loadTransaction() {
      setIsLoading(true);
      setError(null);

      try {
        if (!user?.aggregatorId) {
          throw new Error('Unable to verify your access scope for this transaction.');
        }

        const response = await getScopedTransactionById(currentTransactionId, {
          aggregatorId: user.aggregatorId,
          collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
          serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
        });
        if (isMounted) setTransaction(response);
      } catch (caughtError) {
        if (!isMounted) return;
        setTransaction(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load transaction details.'
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadTransaction();

    return () => {
      isMounted = false;
    };
  }, [transactionId, user?.aggregatorId, user?.collectionCode, user?.role, user?.serviceCode]);

  return {
    transaction,
    isLoading,
    error,
  };
}
