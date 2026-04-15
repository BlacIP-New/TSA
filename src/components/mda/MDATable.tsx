import { Mail, RotateCcw, UserPlus, UserX } from 'lucide-react';
import { MDAUser } from '../../types/mda';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { MDAStatusBadge } from './MDAStatusBadge';

interface MDATableProps {
  users: MDAUser[];
  actionKey: string | null;
  isLoading?: boolean;
  onInviteClick: () => void;
  onResendInvite: (user: MDAUser) => void;
  onDeactivate: (user: MDAUser) => void;
  onReactivate: (user: MDAUser) => void;
}

export function MDATable({
  users,
  actionKey,
  isLoading = false,
  onInviteClick,
  onResendInvite,
  onDeactivate,
  onReactivate,
}: MDATableProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-950">MDA users</h2>
          <p className="mt-1 text-sm text-gray-500">
            Invite and manage collection-scoped access for MDA portal users.
          </p>
        </div>
        <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={onInviteClick}>
          Invite MDA
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Collection Code</th>
              <th className="px-5 py-4">Service Code</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Invited Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={7}>
                    <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
                  No MDA users have been created yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8001C]/8 text-sm font-semibold text-[#E8001C]">
                        {user.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-950">{user.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{user.mdaName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-300" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700">{user.collectionCode}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">{user.serviceCode}</td>
                  <td className="px-5 py-4">
                    <MDAStatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(user.invitedAt)}</td>
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
