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
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="px-5 py-4">Timestamp</th>
              <th className="px-5 py-4">User Email</th>
              <th className="px-5 py-4">Action Type</th>
              <th className="px-5 py-4">Details</th>
              <th className="px-5 py-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                  No audit records matched the current filters.
                </td>
              </tr>
            )}

            {!isLoading &&
              entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="px-5 py-4 text-gray-600">{formatDateTime(entry.timestamp)}</td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-950">{entry.userEmail}</p>
                      <p className="mt-1 text-xs text-gray-500">{entry.userName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={actionLabels[entry.action].variant}>{actionLabels[entry.action].label}</Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{entry.details}</td>
                  <td className="px-5 py-4 text-gray-600">{entry.ipAddress}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
