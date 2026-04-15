import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterContext, DEFAULT_TRANSACTION_PAGE_SIZE, getDefaultTransactionFilters, TransactionPageSize } from './filter-store';
import { TransactionFilters } from '../types/transaction';

const STORAGE_KEY = 'tsa_transaction_ledger_filters';

interface PersistedFilterState {
  transactionFilters: TransactionFilters;
  transactionPageSize: TransactionPageSize;
}

function getStoredFilterState(): PersistedFilterState {
  if (typeof window === 'undefined') {
    return {
      transactionFilters: getDefaultTransactionFilters(),
      transactionPageSize: DEFAULT_TRANSACTION_PAGE_SIZE,
    };
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      transactionFilters: getDefaultTransactionFilters(),
      transactionPageSize: DEFAULT_TRANSACTION_PAGE_SIZE,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedFilterState>;
    return {
      transactionFilters: {
        ...getDefaultTransactionFilters(),
        ...parsed.transactionFilters,
      },
      transactionPageSize:
        parsed.transactionPageSize === 50 || parsed.transactionPageSize === 100
          ? parsed.transactionPageSize
          : DEFAULT_TRANSACTION_PAGE_SIZE,
    };
  } catch {
    return {
      transactionFilters: getDefaultTransactionFilters(),
      transactionPageSize: DEFAULT_TRANSACTION_PAGE_SIZE,
    };
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>(() => getStoredFilterState().transactionFilters);
  const [transactionPageSize, setTransactionPageSizeState] = useState<TransactionPageSize>(
    () => getStoredFilterState().transactionPageSize
  );

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ transactionFilters, transactionPageSize })
    );
  }, [transactionFilters, transactionPageSize]);

  const updateTransactionFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setTransactionFilters((current) => ({
      ...current,
      ...updates,
    }));
  }, []);

  const resetTransactionFilters = useCallback(() => {
    setTransactionFilters(getDefaultTransactionFilters());
  }, []);

  const setTransactionPageSize = useCallback((size: TransactionPageSize) => {
    setTransactionPageSizeState(size);
  }, []);

  const value = useMemo(
    () => ({
      transactionFilters,
      transactionPageSize,
      updateTransactionFilters,
      resetTransactionFilters,
      setTransactionPageSize,
    }),
    [
      transactionFilters,
      transactionPageSize,
      updateTransactionFilters,
      resetTransactionFilters,
      setTransactionPageSize,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
