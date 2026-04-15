import { Activity, MailPlus, RefreshCcw, ShieldCheck, UserCheck, UserMinus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { InviteMDAModal } from '../components/mda/InviteMDAModal';
import { MDATable } from '../components/mda/MDATable';
import { useAuth } from '../context/AuthContext';
import { useMDAs } from '../hooks/useMDAs';
import { InviteMDAPayload, MDAUser } from '../types/mda';

type PageAlert = {
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;
} | null;

type ConfirmState =
  | { type: 'deactivate'; user: MDAUser }
  | { type: 'reactivate'; user: MDAUser }
  | null;

export default function MDAManagementPage() {
  const { user } = useAuth();
  const { users, collectionCodes, isLoading, error, refresh, createInvite, resendInvite, deactivateUser, reactivateUser, loadServiceCodes } =
    useMDAs(user);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [pageAlert, setPageAlert] = useState<PageAlert>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const statusSummary = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((entry) => entry.status === 'pending').length,
      active: users.filter((entry) => entry.status === 'active').length,
      inactive: users.filter((entry) => entry.status === 'inactive').length,
    }),
    [users]
  );

  async function handleInvite(payload: InviteMDAPayload) {
    setActionKey('invite');
    setPageAlert(null);
    try {
      await createInvite(payload);
      setPageAlert({
        variant: 'success',
        message: 'Invitation sent successfully. The new MDA user is now pending activation.',
      });
    } finally {
      setActionKey(null);
    }
  }

  async function handleResendInvite(target: MDAUser) {
    setActionKey(`resend:${target.id}`);
    setPageAlert(null);
    try {
      await resendInvite(target.id);
      setPageAlert({
        variant: 'success',
        message: `Invitation resent to ${target.email}.`,
      });
    } catch (caughtError) {
      setPageAlert({
        variant: 'error',
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to resend the invitation right now.',
      });
    } finally {
      setActionKey(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    const nextActionKey = `${confirmState.type}:${confirmState.user.id}`;
    setActionKey(nextActionKey);
    setPageAlert(null);

    try {
      if (confirmState.type === 'deactivate') {
        await deactivateUser(confirmState.user.id);
        setPageAlert({
          variant: 'warning',
          message: `${confirmState.user.email} has been deactivated.`,
        });
      } else {
        await reactivateUser(confirmState.user.id);
        setPageAlert({
          variant: 'success',
          message: `${confirmState.user.email} has been reactivated.`,
        });
      }
      setConfirmState(null);
    } catch (caughtError) {
      setPageAlert({
        variant: 'error',
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to complete this action right now.',
      });
    } finally {
      setActionKey(null);
    }
  }

  if (!user) return null;

  return (
    <>
      <div className="space-y-6 p-5 lg:p-8">
        <div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950">MDA management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Admin-only controls for onboarding and managing scoped MDA portal access.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user.aggregatorName}
              </div>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoading}
                leftIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total MDA users</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{statusSummary.total}</p>
            <p className="mt-1 text-sm text-gray-500">Across all collection and service scopes</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <MailPlus className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Pending invites</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{statusSummary.pending}</p>
            <p className="mt-1 text-sm text-gray-500">Awaiting initial login and activation</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <UserCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active users</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{statusSummary.active}</p>
            <p className="mt-1 text-sm text-gray-500">Currently allowed into the portal</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <UserMinus className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Inactive users</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{statusSummary.inactive}</p>
            <p className="mt-1 text-sm text-gray-500">Disabled until reactivation</p>
          </div>
        </div>

        {(pageAlert || error) && (
          <Alert
            variant={pageAlert?.variant ?? 'error'}
            message={pageAlert?.message ?? error ?? 'Unable to load MDA users right now.'}
          />
        )}

        <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-2 text-[#E8001C]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950">Scope enforcement</p>
              <p className="mt-1 text-sm text-gray-600">
                Every invite is bound to a single collection code and service code. Admin actions here should mirror the same server-side access restrictions in production.
              </p>
            </div>
          </div>
        </div>

        <MDATable
          users={users}
          actionKey={actionKey}
          isLoading={isLoading}
          onInviteClick={() => setIsInviteOpen(true)}
          onResendInvite={handleResendInvite}
          onDeactivate={(target) => setConfirmState({ type: 'deactivate', user: target })}
          onReactivate={(target) => setConfirmState({ type: 'reactivate', user: target })}
        />
      </div>

      <InviteMDAModal
        open={isInviteOpen}
        collectionCodes={collectionCodes}
        isSubmitting={actionKey === 'invite'}
        loadServiceCodes={loadServiceCodes}
        onClose={() => {
          if (actionKey === 'invite') return;
          setIsInviteOpen(false);
        }}
        onSubmit={handleInvite}
      />

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.type === 'deactivate' ? 'Deactivate MDA user' : 'Reactivate MDA user'}
        message={
          confirmState?.type === 'deactivate'
            ? `This will immediately remove portal access for ${confirmState.user.email}.`
            : `This will restore portal access for ${confirmState?.user.email}.`
        }
        confirmLabel={confirmState?.type === 'deactivate' ? 'Deactivate user' : 'Reactivate user'}
        confirmVariant={confirmState?.type === 'deactivate' ? 'danger' : 'primary'}
        isLoading={actionKey === (confirmState ? `${confirmState.type}:${confirmState.user.id}` : null)}
        onClose={() => {
          if (actionKey?.startsWith('deactivate:') || actionKey?.startsWith('reactivate:')) return;
          setConfirmState(null);
        }}
        onConfirm={() => void handleConfirmAction()}
      />
    </>
  );
}
