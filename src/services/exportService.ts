/**
 * Export Service — settlement export implementation for batch list and batch detail endpoints.
 *
 * Backend swap-in points:
 *   GET /settlements/export/csv
 *   GET /settlements/export/pdf
 */

import { AuthUser } from '../types/auth';
import { SettlementBatchFilters } from '../types/transaction';
import { getSettlementBatchDetail, getSettlementBatches } from './transactionService';
import {
  buildExportDateRangeLabel,
  buildExportFilename,
  buildSettlementExportAuditDetails,
  createSettlementBatchCsvBlob,
  createSettlementBatchDetailPdfBlob,
  createSettlementBatchListPdfBlob,
  createSettlementLineCsvBlob,
  ExportScopeSummary,
} from '../utils/exportHelpers';
import { formatDate } from '../utils/formatters';
import { logAuditEntry } from './auditService';

export interface ExportResult {
  blob: Blob;
  filename: string;
  successMessage: string;
}

export type SettlementExportTarget =
  | { type: 'batch-list' }
  | { type: 'batch-detail'; batchId: string };

interface ExportSettlementsParams {
  user: AuthUser;
  filters: SettlementBatchFilters;
  format: 'csv' | 'pdf';
  target: SettlementExportTarget;
}

function buildScopeSummary(user: AuthUser, filters: SettlementBatchFilters): ExportScopeSummary {
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

async function logExportAuditEvent(params: {
  user: AuthUser;
  action: 'export_csv' | 'export_pdf';
  scope: ExportScopeSummary;
  target: SettlementExportTarget;
  count: number;
}) {
  const { user, action, scope, target, count } = params;
  if (!user.aggregatorId) return;

  await logAuditEntry({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action,
    details:
      target.type === 'batch-detail'
        ? buildSettlementExportAuditDetails(action, {
            type: 'batch-detail',
            batchId: target.batchId,
            count,
          })
        : buildSettlementExportAuditDetails(action, {
            type: 'batch-list',
            count,
          }),
    aggregatorId: user.aggregatorId,
    metadata: {
      scopeLabel: scope.scopeLabel,
      collectionCode: scope.collectionCode,
      serviceCode: scope.serviceCode,
      generatedAt: scope.generatedAt,
      batchId: target.type === 'batch-detail' ? target.batchId : '',
      recordCount: String(count),
    },
  });
}

export async function exportSettlements(params: ExportSettlementsParams): Promise<ExportResult> {
  const { user, filters, format, target } = params;
  const scope = buildScopeSummary(user, filters);
  const action = format === 'csv' ? 'export_csv' : 'export_pdf';

  if (target.type === 'batch-list') {
    const batches = (
      await getSettlementBatches({
        aggregatorId: user.aggregatorId ?? '',
        collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
        serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
        page: 1,
        limit: 10_000,
        ...filters,
      })
    ).data;

    const blob =
      format === 'csv'
        ? createSettlementBatchCsvBlob(batches)
        : createSettlementBatchListPdfBlob(batches, scope);
    const filename = buildExportFilename(format, `settlement-batches-${scope.scopeLabel}`, scope.generatedAt);

    await logExportAuditEvent({
      user,
      action,
      scope,
      target,
      count: batches.length,
    });

    return {
      blob,
      filename,
      successMessage: `${format.toUpperCase()} export generated with ${batches.length} settlement batches.`,
    };
  }

  const detail = await getSettlementBatchDetail(target.batchId, {
    aggregatorId: user.aggregatorId ?? '',
    collectionCode: user.role === 'mda_viewer' ? user.collectionCode : undefined,
    serviceCode: user.role === 'mda_viewer' ? user.serviceCode : undefined,
  });

  const detailScope: ExportScopeSummary = {
    ...scope,
    batchId: detail.batch.batchId,
    mdaName: detail.batch.mdaName,
    collectionCode: detail.batch.collectionCode,
    serviceCode: detail.batch.serviceCode,
    dateRangeLabel: formatDate(detail.batch.settledDate),
    scopeLabel: `${detail.batch.collectionCode}-${detail.batch.serviceCode}`,
  };

  const blob =
    format === 'csv'
      ? createSettlementLineCsvBlob(detail.lines)
      : createSettlementBatchDetailPdfBlob(detail, detailScope);
  const filename = buildExportFilename(format, `settlement-batch-${detail.batch.batchId}`, detailScope.generatedAt);

  await logExportAuditEvent({
    user,
    action,
    scope: detailScope,
    target,
    count: detail.lines.length,
  });

  return {
    blob,
    filename,
    successMessage: `${format.toUpperCase()} export generated for batch ${detail.batch.batchId} with ${detail.lines.length} settlement lines.`,
  };
}
