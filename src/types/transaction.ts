export type PaymentChannel = 'bank_transfer' | 'card' | 'ussd' | 'pos' | 'internet_banking';

export type TransactionStatus = 'settled' | 'pending' | 'failed';
export type ChartGroupBy = 'day' | 'week';

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
  from?: string;
  to?: string;
  channel?: PaymentChannel | '';
  status?: TransactionStatus | '';
  minAmount?: number | '';
  maxAmount?: number | '';
  search?: string;
}

export interface CollectionSummaryParams {
  aggregatorId: string;
  collectionCode?: string;
  serviceCode?: string;
  from: string;
  to: string;
}

export interface CollectionChartParams extends CollectionSummaryParams {
  groupBy: ChartGroupBy;
}

export interface ChartPoint {
  label: string;
  value: number;
  transactionCount: number;
  from: string;
  to: string;
}

export interface MdaBreakdownRow {
  mdaName: string;
  collectionCode: string;
  serviceCode: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
  periodChange: number;
  lastSettlementDate: string;
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  previousPeriodAmount: number;
  previousPeriodCount: number;
  percentageChange: number;
  countPercentageChange: number;
  averageAmountChange: number;
  breakdown: MdaBreakdownRow[];
  topPerformer: MdaBreakdownRow | null;
}

export interface CollectionChart {
  groupBy: ChartGroupBy;
  points: ChartPoint[];
  totalAmount: number;
  totalCount: number;
}

export interface TransactionQueryParams extends TransactionFilters {
  aggregatorId: string;
  collectionCode?: string;
  serviceCode?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
