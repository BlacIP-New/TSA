/**
 * Audit Service — integration-ready mock implementation for audit log endpoints.
 *
 * Backend swap-in points:
 *   GET /admin/audit-log
 */

import { mockAuditLog } from '../data/mockAuditLog';
import { AuditAction, AuditEntry, AuditFilters } from '../types/audit';

const NETWORK_DELAY_MS = 300;
let auditLogStore = [...mockAuditLog];

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GetAuditLogParams extends AuditFilters {
  aggregatorId: string;
  page?: number;
  limit?: number;
}

interface LogAuditEntryParams {
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  details: string;
  ipAddress?: string;
  aggregatorId: string;
  metadata?: Record<string, string>;
}

export async function getAuditLog(params: GetAuditLogParams) {
  await delay();

  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const fromDate = params.from ? new Date(`${params.from}T00:00:00.000Z`) : null;
  const toDate = params.to ? new Date(`${params.to}T23:59:59.999Z`) : null;

  const filtered = auditLogStore
    .filter((entry) => {
      if (entry.aggregatorId !== params.aggregatorId) return false;
      if (params.action && entry.action !== params.action) return false;
      if (params.userId && entry.userId !== params.userId) return false;
      if (params.userEmail && !entry.userEmail.toLowerCase().includes(params.userEmail.toLowerCase())) return false;
      const timestamp = new Date(entry.timestamp);
      if (fromDate && timestamp < fromDate) return false;
      if (toDate && timestamp > toDate) return false;
      return true;
    })
    .slice()
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;

  return {
    data: filtered.slice(startIndex, startIndex + limit),
    total,
    page,
    totalPages,
  };
}

export async function logAuditEntry(params: LogAuditEntryParams): Promise<AuditEntry> {
  await delay(80);

  const entry: AuditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: params.action,
    details: params.details,
    ipAddress: params.ipAddress ?? '10.24.18.9',
    aggregatorId: params.aggregatorId,
    metadata: params.metadata,
  };

  auditLogStore = [entry, ...auditLogStore];
  return entry;
}
