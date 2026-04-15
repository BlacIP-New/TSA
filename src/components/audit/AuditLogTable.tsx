import { AuditEntry } from '../../types/audit';
import { formatDateTime } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface AuditLogTableProps {
  entries: AuditEntry[];
  isLoading?: boolean;
}

const actionLabels: Record<AuditEntry['action'], { label: string; variant: 'info' | 'success' | 'warning' | 'neutral' }> = {
  login: { label: 'Login', variant: 'info' },
  logout: { label: 'Logout', variant: 'neutral' },
  export_csv: { label: 'Export CSV', variant: 'success' },
  export_pdf: { label: 'Export PDF', variant: 'success' },
  mda_invited: { label: 'User Invited', variant: 'info' },
  mda_deactivated: { label: 'Deactivated', variant: 'warning' },
  mda_reactivated: { label: 'Reactivated', variant: 'success' },
  invitation_resent: { label: 'Invite Resent', variant: 'info' },
  password_reset: { label: 'Password Reset', variant: 'neutral' },
  session_expired: { label: 'Session Expired', variant: 'warning' },
};

export function AuditLogTable({ entries, isLoading = false }: AuditLogTableProps) {
  return (
    <section className="app-panel border-white/70">
      <div className="overflow-x-auto">
        <table className="app-data-table">
          <thead>
            <tr>
              <th className="px-5 py-4">Timestamp</th>
              <th className="px-5 py-4">User Email</th>
              <th className="px-5 py-4">Action Type</th>
              <th className="px-5 py-4">Details</th>
              <th className="px-5 py-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                  No audit records matched the current filters.
                </td>
              </tr>
            )}

            {!isLoading &&
              entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="px-5 py-4 text-slate-600">{formatDateTime(entry.timestamp)}</td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">{entry.userEmail}</p>
                      <p className="mt-1 text-xs text-slate-500">{entry.userName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={actionLabels[entry.action].variant}>{actionLabels[entry.action].label}</Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{entry.details}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{entry.ipAddress}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
