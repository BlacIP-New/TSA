import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterContext, DEFAULT_PAGE_SIZE, getDefaultSettlementFilters, PageSizeOption } from './filter-store';
import { SettlementBatchFilters } from '../types/transaction';

const STORAGE_KEY = 'tsa_settlement_batch_filters';

interface PersistedFilterState {
  settlementFilters: SettlementBatchFilters;
  settlementPageSize: PageSizeOption;
}

function getStoredFilterState(): PersistedFilterState {
  if (typeof window === 'undefined') {
    return {
      settlementFilters: getDefaultSettlementFilters(),
      settlementPageSize: DEFAULT_PAGE_SIZE,
    };
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      settlementFilters: getDefaultSettlementFilters(),
      settlementPageSize: DEFAULT_PAGE_SIZE,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedFilterState>;
    return {
      settlementFilters: {
        ...getDefaultSettlementFilters(),
        ...parsed.settlementFilters,
      },
      settlementPageSize:
        parsed.settlementPageSize === 50 || parsed.settlementPageSize === 100
          ? parsed.settlementPageSize
          : DEFAULT_PAGE_SIZE,
    };
  } catch {
    return {
      settlementFilters: getDefaultSettlementFilters(),
      settlementPageSize: DEFAULT_PAGE_SIZE,
    };
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [settlementFilters, setSettlementFilters] = useState<SettlementBatchFilters>(() => getStoredFilterState().settlementFilters);
  const [settlementPageSize, setSettlementPageSizeState] = useState<PageSizeOption>(
    () => getStoredFilterState().settlementPageSize
  );

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settlementFilters, settlementPageSize })
    );
  }, [settlementFilters, settlementPageSize]);

  const updateSettlementFilters = useCallback((updates: Partial<SettlementBatchFilters>) => {
    setSettlementFilters((current) => ({
      ...current,
      ...updates,
    }));
  }, []);

  const resetSettlementFilters = useCallback(() => {
    setSettlementFilters(getDefaultSettlementFilters());
  }, []);

  const setSettlementPageSize = useCallback((size: PageSizeOption) => {
    setSettlementPageSizeState(size);
  }, []);

  const value = useMemo(
    () => ({
      settlementFilters,
      settlementPageSize,
      updateSettlementFilters,
      resetSettlementFilters,
      setSettlementPageSize,
    }),
    [
      settlementFilters,
      settlementPageSize,
      updateSettlementFilters,
      resetSettlementFilters,
      setSettlementPageSize,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
