import { createContext } from 'react';
import { TransactionFilters } from '../types/transaction';

export type TransactionPageSize = 25 | 50 | 100;

export interface FilterContextValue {
  transactionFilters: TransactionFilters;
  transactionPageSize: TransactionPageSize;
  updateTransactionFilters: (updates: Partial<TransactionFilters>) => void;
  resetTransactionFilters: () => void;
  setTransactionPageSize: (size: TransactionPageSize) => void;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultTransactionFilters(): TransactionFilters {
  const today = new Date();
  return {
    from: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInput(today),
    channel: '',
    status: '',
    minAmount: '',
    maxAmount: '',
  };
}

export const DEFAULT_TRANSACTION_PAGE_SIZE: TransactionPageSize = 25;

export const FilterContext = createContext<FilterContextValue | null>(null);
