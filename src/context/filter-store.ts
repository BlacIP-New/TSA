import { createContext } from 'react';
import { SettlementBatchFilters } from '../types/transaction';

export type PageSizeOption = 25 | 50 | 100;

export interface FilterContextValue {
  settlementFilters: SettlementBatchFilters;
  settlementPageSize: PageSizeOption;
  updateSettlementFilters: (updates: Partial<SettlementBatchFilters>) => void;
  resetSettlementFilters: () => void;
  setSettlementPageSize: (size: PageSizeOption) => void;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultSettlementFilters(): SettlementBatchFilters {
  const today = new Date();
  return {
    from: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInput(today),
    batchId: '',
    minAmount: '',
    maxAmount: '',
  };
}

export const DEFAULT_PAGE_SIZE: PageSizeOption = 25;

export const FilterContext = createContext<FilterContextValue | null>(null);
