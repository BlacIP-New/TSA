/**
 * Export Service — integration-ready mock implementation for transaction export endpoints.
 *
 * Backend swap-in points:
 *   GET /transactions/export/csv
 *   GET /transactions/export/pdf
 */

import { AuthUser } from '../types/auth';
import { Transaction, TransactionFilters } from '../types/transaction';
import { getTransactions } from './transactionService';
import {
  buildExportAuditDetails,
  buildExportDateRangeLabel,
  buildExportFilename,
  createCsvBlob,
  createPdfBlob,
  ExportScopeSummary,
} from '../utils/exportHelpers';
import { logAuditEntry } from './auditService';

interface ExportTransactionsParams {
  user: AuthUser;
  filters: TransactionFilters;
}

interface ExportResult {
  blob: Blob;
  filename: string;
  count: number;
}

async function getScopedTransactionsForExport({
  user,
  filters,
}: ExportTransactionsParams): Promise<Transaction[]> {
  const response = await getTransactions({
    aggregatorId: user.aggregatorId ?? '',
    collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
    serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
    page: 1,
    limit: 10_000,
    ...filters,
  });

  return response.data;
}

function buildScopeSummary(user: AuthUser, filters: TransactionFilters): ExportScopeSummary {
  const generatedAt = new Date().toISOString();
  const scopeLabel =
    user.role === 'mda_viewer'
      ? `${user.collectionCode ?? 'unassigned'}-${user.serviceCode ?? 'unassigned'}`
      : user.aggregatorName ?? 'aggregator-scope';

  return {
    portalName: 'TSA Collection Insight Portal',
    scopeLabel,
    mdaName: user.role === 'mda_viewer' ? user.mdaName ?? 'Assigned MDA' : 'All MDAs',
    collectionCode: user.collectionCode ?? 'All Collections',
    serviceCode: user.serviceCode ?? 'All Services',
    generatedAt,
    generatedBy: user.email,
    dateRangeLabel: buildExportDateRangeLabel(filters),
  };
}

async function logExportAuditEvent(
  user: AuthUser,
  action: 'export_csv' | 'export_pdf',
  scope: ExportScopeSummary,
  count: number
) {
  if (!user.aggregatorId) return;

  await logAuditEntry({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action,
    details: buildExportAuditDetails(action, scope.scopeLabel, count),
    aggregatorId: user.aggregatorId,
    metadata: {
      scopeLabel: scope.scopeLabel,
      collectionCode: scope.collectionCode,
      serviceCode: scope.serviceCode,
      generatedAt: scope.generatedAt,
      transactionCount: String(count),
    },
  });
}

export async function exportTransactionsCsv(params: ExportTransactionsParams): Promise<ExportResult> {
  const transactions = await getScopedTransactionsForExport(params);
  const scope = buildScopeSummary(params.user, params.filters);
  const blob = createCsvBlob(transactions);
  const filename = buildExportFilename('csv', scope.scopeLabel, scope.generatedAt);

  await logExportAuditEvent(params.user, 'export_csv', scope, transactions.length);

  return {
    blob,
    filename,
    count: transactions.length,
  };
}

export async function exportTransactionsPdf(params: ExportTransactionsParams): Promise<ExportResult> {
  const transactions = await getScopedTransactionsForExport(params);
  const scope = buildScopeSummary(params.user, params.filters);
  const blob = createPdfBlob(transactions, scope);
  const filename = buildExportFilename('pdf', scope.scopeLabel, scope.generatedAt);

  await logExportAuditEvent(params.user, 'export_pdf', scope, transactions.length);

  return {
    blob,
    filename,
    count: transactions.length,
  };
}
