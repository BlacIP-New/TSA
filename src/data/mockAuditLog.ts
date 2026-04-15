import { AuditEntry } from '../types/audit';
import { appConfig } from '../config/env';

export const mockAuditLog: AuditEntry[] = [
  {
    id: 'audit_001',
    timestamp: new Date('2026-04-14T08:12:00.000Z').toISOString(),
    userId: 'usr_admin_001',
    userEmail: 'admin@nsw.gov.ng',
    userName: 'Chukwuemeka Obi',
    action: 'login',
    details: 'Admin signed into the TSA Collection Insight Portal.',
    ipAddress: '10.24.18.9',
    aggregatorId: appConfig.aggregatorId,
  },
  {
    id: 'audit_002',
    timestamp: new Date('2026-04-14T10:45:00.000Z').toISOString(),
    userId: 'usr_admin_001',
    userEmail: 'admin@nsw.gov.ng',
    userName: 'Chukwuemeka Obi',
    action: 'mda_invited',
    details: 'Invitation sent to director@works.gov.ng for collection MW-002 and service MW-SVC-014.',
    ipAddress: '10.24.18.9',
    aggregatorId: appConfig.aggregatorId,
  },
];
