export type AuditAction =
  | 'login'
  | 'logout'
  | 'export_csv'
  | 'export_excel'
  | 'mda_invited'
  | 'mda_deactivated'
  | 'mda_reactivated'
  | 'invitation_resent'
  | 'password_reset'
  | 'session_expired';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  details: string;
  ipAddress: string;
  aggregatorId: string;
  metadata?: Record<string, string>;
}

export interface AuditFilters {
  from?: string;
  to?: string;
  action?: AuditAction | '';
  userId?: string;
  userEmail?: string;
}
