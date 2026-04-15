import { Activity, Building2, FolderKanban, RefreshCcw, ShieldCheck, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { InviteMDAModal } from '../components/mda/InviteMDAModal';
import { MDATable } from '../components/mda/MDATable';
import { useAuth } from '../context/AuthContext';
import { useMDAs } from '../hooks/useMDAs';
import { InviteMDAPayload, MDAUser } from '../types/mda';
import { MDATabNavigation } from '../components/mda/MDATabNavigation';
import { MDARegistryTable } from '../components/mda/MDARegistryTable';
import { MDADetailPanel } from '../components/mda/MDADetailPanel';
import { MDACollectionList } from '../components/mda/MDACollectionList';
import { SettlementBatchTable } from '../components/transactions/SettlementBatchTable';
import { SettlementBatchDetailDrawer } from '../components/transactions/SettlementBatchDetailDrawer';
import { formatCompactCurrency } from '../utils/formatters';

type PageAlert = {
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;
} | null;

type ConfirmState =
  | { type: 'deactivate'; user: MDAUser }
  | { type: 'reactivate'; user: MDAUser }
  | null;

type MDATabKey = 'mdas' | 'collections' | 'users';

export default function MDAManagementPage() {
  const { user } = useAuth();
  const {
    mdas,
    selectedMDA,
    selectedMDAId,
    selectedMDADetail,
    selectedCollectionCode,
    users,
    settlementResult,
    isLoading,
    isSettlementLoading,
    error,
    settlementError,
    refresh,
    createInvite,
    resendInvite,
    deactivateUser,
    reactivateUser,
    loadMDACollections,
    loadMDAServiceCodes,
    setSelectedMDAId,
    setSelectedCollectionCode,
  } = useMDAs(user);
  const [activeTab, setActiveTab] = useState<MDATabKey>('mdas');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [pageAlert, setPageAlert] = useState<PageAlert>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const statusSummary = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((entry) => entry.status === 'pending').length,
      active: users.filter((entry) => entry.status === 'active').length,
      inactive: users.filter((entry) => entry.status === 'inactive').length,
    }),
    [users],
  );

  const selectedCollection = useMemo(
    () => selectedMDADetail?.collections.find((entry) => entry.code === selectedCollectionCode) ?? null,
    [selectedCollectionCode, selectedMDADetail?.collections],
  );

  const selectedCollectionTotal = useMemo(
    () => settlementResult.data.reduce((sum, batch) => sum + batch.totalAmount, 0),
    [settlementResult.data],
  );

  async function handleInvite(payload: InviteMDAPayload) {
    setActionKey('invite');
    setPageAlert(null);
    try {
      await createInvite(payload);
      setActiveTab('users');
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
        <section className="app-panel-strong border-white/80 px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="app-kicker">MDA Operations</p>
              <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.06em] text-slate-950">
                MDA management
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Admin workspace for MDA registry visibility, collection settlements, and MDA user access.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {user.aggregatorName}
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                leftIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="app-panel border-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-4 w-4" />
              <p className="app-kicker">Total MDAs</p>
            </div>
            <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{mdas.length}</p>
            <p className="mt-2 text-sm text-slate-500">Admin-visible MDA registry entries</p>
          </div>
          <div className="app-panel border-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <FolderKanban className="h-4 w-4" />
              <p className="app-kicker">Selected collections</p>
            </div>
            <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">
              {selectedMDADetail?.collections.length ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {selectedMDA ? `Under ${selectedMDA.mdaCode}` : 'Choose an MDA to inspect its collections'}
            </p>
          </div>
          <div className="app-panel border-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <Activity className="h-4 w-4" />
              <p className="app-kicker">Settlement batches</p>
            </div>
            <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{settlementResult.total}</p>
            <p className="mt-2 text-sm text-slate-500">
              {selectedCollection ? `${selectedCollection.code} currently selected` : 'Select a collection code'}
            </p>
          </div>
          <div className="app-panel border-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <UsersRound className="h-4 w-4" />
              <p className="app-kicker">Scoped users</p>
            </div>
            <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{statusSummary.total}</p>
            <p className="mt-2 text-sm text-slate-500">Users currently mapped to the selected MDA</p>
          </div>
        </div>

        {(pageAlert || error || settlementError) && (
          <Alert
            variant={pageAlert?.variant ?? 'error'}
            message={pageAlert?.message ?? settlementError ?? error ?? 'Unable to load MDA management data right now.'}
          />
        )}

        <section className="app-panel border-white/70 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-2 text-slate-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Scope enforcement</p>
              <p className="mt-1 text-sm text-slate-600">
                Users are bound to one MDA, one collection code, and one independently selected service code. Collection settlements shown here remain filtered strictly to the selected collection.
              </p>
            </div>
          </div>
        </section>

        <MDATabNavigation activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'mdas' && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <MDARegistryTable
              mdas={mdas}
              selectedMDAId={selectedMDAId}
              isLoading={isLoading}
              onSelect={setSelectedMDAId}
            />
            <MDADetailPanel detail={selectedMDADetail} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <section className="app-panel border-white/70 p-5">
                <p className="app-kicker">Selected MDA</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  {selectedMDA?.mdaCode ?? 'No MDA selected'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedMDA?.mdaName ?? 'Choose an MDA from the registry tab to inspect its collections.'}
                </p>
              </section>

              <MDACollectionList
                collections={selectedMDADetail?.collections ?? []}
                selectedCollectionCode={selectedCollectionCode}
                isLoading={isLoading}
                onSelect={setSelectedCollectionCode}
              />
            </div>

            <div className="space-y-4">
              <section className="app-panel border-white/70 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="app-kicker">Collection settlement scope</p>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                      {selectedCollection?.code ?? 'Select a collection code'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedCollection?.name ?? 'Settlement batches for the selected collection code will appear here.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="app-card px-4 py-3">
                      <p className="app-kicker">Batches</p>
                      <p className="mt-2 font-semibold text-slate-950 tabular-nums">{settlementResult.total}</p>
                    </div>
                    <div className="app-card px-4 py-3">
                      <p className="app-kicker">Total amount</p>
                      <p className="mt-2 font-semibold text-slate-950 tabular-nums">{formatCompactCurrency(selectedCollectionTotal)}</p>
                    </div>
                  </div>
                </div>
              </section>

              <SettlementBatchTable
                batches={settlementResult.data}
                isAdmin
                isLoading={isSettlementLoading}
                onSelect={setSelectedBatchId}
              />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="app-panel border-white/70 p-5">
                <p className="app-kicker">Selected MDA</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  {selectedMDA?.mdaCode ?? 'Not selected'}
                </p>
                <p className="mt-2 text-sm text-slate-500">{selectedMDA?.mdaName ?? 'Select an MDA to scope this tab.'}</p>
              </div>
              <div className="app-panel border-white/70 p-5">
                <p className="app-kicker">Pending invites</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{statusSummary.pending}</p>
                <p className="mt-2 text-sm text-slate-500">Awaiting first login and activation</p>
              </div>
              <div className="app-panel border-white/70 p-5">
                <p className="app-kicker">Active users</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{statusSummary.active}</p>
                <p className="mt-2 text-sm text-slate-500">Currently allowed into the portal</p>
              </div>
              <div className="app-panel border-white/70 p-5">
                <p className="app-kicker">Inactive users</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-950 tabular-nums">{statusSummary.inactive}</p>
                <p className="mt-2 text-sm text-slate-500">Disabled until reactivation</p>
              </div>
            </div>

            <MDATable
              users={users}
              actionKey={actionKey}
              isLoading={isLoading}
              title={selectedMDA ? `Users for ${selectedMDA.mdaCode}` : 'MDA users'}
              description={
                selectedMDA
                  ? `Portal users mapped to ${selectedMDA.mdaName}. Each user remains scoped to one collection code and one service code.`
                  : 'Invite and manage MDA-scoped portal access for one collection code and one service code.'
              }
              onInviteClick={() => setIsInviteOpen(true)}
              onResendInvite={handleResendInvite}
              onDeactivate={(target) => setConfirmState({ type: 'deactivate', user: target })}
              onReactivate={(target) => setConfirmState({ type: 'reactivate', user: target })}
            />
          </div>
        )}
      </div>

      <InviteMDAModal
        open={isInviteOpen}
        mdas={mdas}
        defaultMDAId={selectedMDAId}
        isSubmitting={actionKey === 'invite'}
        loadMDACollections={loadMDACollections}
        loadMDAServiceCodes={loadMDAServiceCodes}
        onClose={() => {
          if (actionKey === 'invite') return;
          setIsInviteOpen(false);
        }}
        onSubmit={handleInvite}
      />

      <SettlementBatchDetailDrawer
        batchId={selectedBatchId}
        user={user}
        onClose={() => setSelectedBatchId(null)}
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
