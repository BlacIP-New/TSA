export type PaymentChannel = 'bank_transfer' | 'card' | 'ussd' | 'pos' | 'internet_banking';

export type TransactionStatus = 'settled' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  reference: string;
  payerName: string;
  payerAccount: string;
  payerBank: string;
  amount: number;
  channel: PaymentChannel;
  settlementDate: string;
  createdAt: string;
  status: TransactionStatus;
  collectionCode: string;
  serviceCode: string;
  aggregatorId: string;
  narration: string;
  settlementBatch?: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  channel?: PaymentChannel | '';
  status?: TransactionStatus | '';
  minAmount?: number | '';
  maxAmount?: number | '';
  search?: string;
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  previousPeriodAmount: number;
  previousPeriodCount: number;
  percentageChange: number;
  countPercentageChange: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
