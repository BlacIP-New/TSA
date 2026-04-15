import { Mail, RotateCcw, UserPlus, UserX } from 'lucide-react';
import { MDAUser } from '../../types/mda';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { MDAStatusBadge } from './MDAStatusBadge';

interface MDATableProps {
  users: MDAUser[];
  actionKey: string | null;
  isLoading?: boolean;
  title?: string;
  description?: string;
  onInviteClick: () => void;
  onResendInvite: (user: MDAUser) => void;
  onDeactivate: (user: MDAUser) => void;
  onReactivate: (user: MDAUser) => void;
}

export function MDATable({
  users,
  actionKey,
  isLoading = false,
  title = 'MDA users',
  description = 'Invite and manage MDA-scoped portal access for one collection code and one service code.',
  onInviteClick,
  onResendInvite,
  onDeactivate,
  onReactivate,
}: MDATableProps) {
  return (
    <section className="app-panel border-gray-300">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={onInviteClick}>
          Invite MDA
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="app-data-table">
          <thead>
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">MDA Code</th>
              <th className="px-5 py-4">Collection Code</th>
              <th className="px-5 py-4">Service Code</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Invited Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={8}>
                    <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                  No MDA users have been created for the current selection.
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-slate-700">
                        {user.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.mdaName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-300" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{user.mdaCode}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{user.collectionCode}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{user.serviceCode}</td>
                  <td className="px-5 py-4">
                    <MDAStatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(user.invitedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {user.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={actionKey === `resend:${user.id}`}
                          leftIcon={<RotateCcw className="h-4 w-4" />}
                          onClick={() => onResendInvite(user)}
                        >
                          Resend
                        </Button>
                      )}

                      {(user.status === 'active' || user.status === 'pending') && (
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={actionKey === `deactivate:${user.id}`}
                          leftIcon={<UserX className="h-4 w-4" />}
                          onClick={() => onDeactivate(user)}
                        >
                          Deactivate
                        </Button>
                      )}

                      {user.status === 'inactive' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={actionKey === `reactivate:${user.id}`}
                          leftIcon={<UserPlus className="h-4 w-4" />}
                          onClick={() => onReactivate(user)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
