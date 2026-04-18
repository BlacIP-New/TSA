export type ChartGroupBy = 'day' | 'week';

export type SettlementStatus =
  | 'Settled'
  | 'Pending'
  | 'Failed'
  | 'Queued'
  | 'Partially Settled'
  | 'Refunded'
  | 'Offline Settlement'
  | 'Paused Settlement';

export type SettlementChannel = 'Credo Gateway' | 'Revhup' | 'NSW';

export interface SettlementLine {
  id: string;
  batchId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  settledDate: string;
  channel: SettlementChannel;
  collectionCode: string;
  serviceCode: string;
  mdaId: string;
  mdaName: string;
  aggregatorId: string;
  status: SettlementStatus;
}

export interface SettlementBatch {
  id: string;
  batchId: string;
  settledDate: string;
  channel: SettlementChannel;
  mdaId: string;
  mdaName: string;
  collectionCode: string;
  serviceCode: string;
  itemCount: number;
  totalAmount: number;
  aggregatorId: string;
  status: SettlementStatus;
}

export interface SettlementBatchDetail {
  batch: SettlementBatch;
  lines: SettlementLine[];
}

export interface SettlementBatchFilters {
  from?: string;
  to?: string;
  batchId?: string;
  status?: SettlementStatus | '';
  mdaId?: string;
  collectionCode?: string;
  serviceCode?: string;
}

export interface CollectionSummaryParams {
  aggregatorId: string;
  mdaId?: string;
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
  settlementLineCount: number;
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

export interface SettlementBatchQueryParams extends SettlementBatchFilters {
  aggregatorId: string;
  mdaId?: string;
  collectionCode?: string;
  serviceCode?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSettlementBatches {
  data: SettlementBatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
