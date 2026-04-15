import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SearchableDropdown } from '../components/ui/SearchableDropdown';
import { Select } from '../components/ui/Select';
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
type MDAUserStatusTab = 'all' | 'pending' | 'active' | 'inactive';

export default function MDAManagementPage() {
  const { user } = useAuth();
  const {
    mdas,
    allCollections,
    selectedMDAId,
    selectedMDADetail,
    selectedCollectionCode,
    users,
    settlementResult,
    isLoading,
    isSettlementLoading,
    error,
    settlementError,
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
  const [collectionsMdaFilterId, setCollectionsMdaFilterId] = useState<string>('all');
  const [usersStatusTab, setUsersStatusTab] = useState<MDAUserStatusTab>('all');
  const [usersMdaFilterId, setUsersMdaFilterId] = useState<string>('all');
  const [usersCollectionFilterCode, setUsersCollectionFilterCode] = useState<string>('all');
  const [usersSearchQuery, setUsersSearchQuery] = useState<string>('');
  const [isUsersFilterOpen, setIsUsersFilterOpen] = useState(false);

  const collectionFilterOptions = useMemo(
    () => [
      { label: 'All MDAs', value: 'all' },
      ...mdas.map((entry) => ({ label: `${entry.mdaCode} - ${entry.mdaName}`, value: entry.id })),
    ],
    [mdas],
  );

  const userMdaFilterOptions = useMemo(
    () => [
      { label: 'All MDAs', value: 'all' },
      ...mdas.map((entry) => ({ label: `${entry.mdaCode} - ${entry.mdaName}`, value: entry.id })),
    ],
    [mdas],
  );

  const userCollectionFilterOptions = useMemo(
    () => {
      const scopedCollections =
        usersMdaFilterId === 'all'
          ? allCollections
          : allCollections.filter((entry) => entry.mdaId === usersMdaFilterId);

      return [
        { label: 'All collections', value: 'all' },
        ...scopedCollections.map((entry) => ({ label: `${entry.code} - ${entry.name}`, value: entry.code })),
      ];
    },
    [allCollections, usersMdaFilterId],
  );

  const filteredCollections = useMemo(
    () =>
      collectionsMdaFilterId === 'all'
        ? allCollections
        : allCollections.filter((entry) => entry.mdaId === collectionsMdaFilterId),
    [allCollections, collectionsMdaFilterId],
  );

  const scopedUsers = useMemo(() => {
    const query = usersSearchQuery.trim().toLowerCase();

    return users.filter((entry) => {
      if (usersMdaFilterId !== 'all' && entry.mdaId !== usersMdaFilterId) return false;
      if (usersCollectionFilterCode !== 'all' && entry.collectionCode !== usersCollectionFilterCode) return false;
      if (!query) return true;

      return (
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.mdaCode.toLowerCase().includes(query) ||
        entry.mdaName.toLowerCase().includes(query) ||
        entry.collectionCode.toLowerCase().includes(query) ||
        (entry.serviceCode ?? '').toLowerCase().includes(query)
      );
    });
  }, [users, usersCollectionFilterCode, usersMdaFilterId, usersSearchQuery]);

  const filteredUsers = useMemo(
    () => (usersStatusTab === 'all' ? scopedUsers : scopedUsers.filter((entry) => entry.status === usersStatusTab)),
    [scopedUsers, usersStatusTab],
  );

  useEffect(() => {
    if (!selectedCollectionCode) {
      if (filteredCollections[0]) {
        setSelectedCollectionCode(filteredCollections[0].code);
      }
      return;
    }

    if (!filteredCollections.some((entry) => entry.code === selectedCollectionCode)) {
      setSelectedCollectionCode(filteredCollections[0]?.code ?? null);
    }
  }, [filteredCollections, selectedCollectionCode, setSelectedCollectionCode]);

  const statusSummary = useMemo(
    () => ({
      total: scopedUsers.length,
      pending: scopedUsers.filter((entry) => entry.status === 'pending').length,
      active: scopedUsers.filter((entry) => entry.status === 'active').length,
      inactive: scopedUsers.filter((entry) => entry.status === 'inactive').length,
    }),
    [scopedUsers],
  );

  const activeUsersFilterCount = [
    usersMdaFilterId !== 'all',
    usersCollectionFilterCode !== 'all',
    usersSearchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const selectedCollection = useMemo(
    () => allCollections.find((entry) => entry.code === selectedCollectionCode) ?? null,
    [allCollections, selectedCollectionCode],
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

  function handleUserMdaFilterChange(nextMdaId: string) {
    setUsersMdaFilterId(nextMdaId);
    setUsersCollectionFilterCode('all');
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
      <div className="space-y-6 p-4 sm:p-5 lg:p-8">
        {(pageAlert || error || settlementError) && (
          <Alert
            variant={pageAlert?.variant ?? 'error'}
            message={pageAlert?.message ?? settlementError ?? error ?? 'Unable to load MDA management data right now.'}
          />
        )}

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
              <section className="app-panel border-gray-300 p-5">
                <p className="app-kicker">Collection filter</p>
                <div className="mt-3">
                  <Select
                    label="MDA"
                    value={collectionsMdaFilterId}
                    options={collectionFilterOptions}
                    onChange={(event) => setCollectionsMdaFilterId(event.target.value)}
                  />
                </div>
              </section>

              <MDACollectionList
                collections={filteredCollections}
                selectedCollectionCode={selectedCollectionCode}
                isLoading={isLoading}
                onSelect={setSelectedCollectionCode}
              />
            </div>

            <div className="space-y-4">
              <section className="app-panel border-gray-300 p-5">
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
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
            <section className="app-panel border-gray-300 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex w-full flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 lg:w-auto">
                  {[
                    { key: 'all' as const, label: 'All', count: statusSummary.total },
                    { key: 'pending' as const, label: 'Pending', count: statusSummary.pending },
                    { key: 'active' as const, label: 'Active', count: statusSummary.active },
                    { key: 'inactive' as const, label: 'Inactive', count: statusSummary.inactive },
                  ].map((tab) => {
                    const isActive = usersStatusTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors lg:flex-none ${
                          isActive
                            ? 'bg-white text-slate-950 shadow-sm'
                            : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                        }`}
                        onClick={() => setUsersStatusTab(tab.key)}
                      >
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-[#335CFF]/10 text-[#335CFF]' : 'bg-slate-200 text-slate-600'}`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Filter className="h-4 w-4" />}
                    onClick={() => setIsUsersFilterOpen((current) => !current)}
                  >
                    Advanced filter{activeUsersFilterCount > 0 ? ` (${activeUsersFilterCount})` : ''}
                  </Button>

                  {isUsersFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsUsersFilterOpen(false)} />
                      <div className="absolute right-0 top-full z-30 mt-2 w-[min(92vw,56rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-[40rem]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">Advanced filters</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Narrow the user list by MDA, collection code, or text search.
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUsersMdaFilterId('all');
                              setUsersCollectionFilterCode('all');
                              setUsersSearchQuery('');
                            }}
                          >
                            Reset filters
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <SearchableDropdown
                            label="MDA"
                            value={usersMdaFilterId}
                            placeholder="All MDAs"
                            searchPlaceholder="Search MDAs"
                            options={userMdaFilterOptions}
                            onChange={handleUserMdaFilterChange}
                          />

                          <SearchableDropdown
                            label="Collection code"
                            value={usersCollectionFilterCode}
                            placeholder="All collections"
                            searchPlaceholder="Search collections"
                            options={userCollectionFilterOptions}
                            onChange={(nextCollectionCode) => setUsersCollectionFilterCode(nextCollectionCode)}
                          />

                          <Input
                            label="Search users"
                            value={usersSearchQuery}
                            placeholder="Search by name, email, or code"
                            onChange={(event) => setUsersSearchQuery(event.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <MDATable
              users={filteredUsers}
              actionKey={actionKey}
              isLoading={isLoading}
              title={usersMdaFilterId === 'all' ? 'MDA users' : `Users for ${mdas.find((entry) => entry.id === usersMdaFilterId)?.mdaCode ?? 'selected MDA'}`}
              description={
                usersMdaFilterId === 'all'
                  ? 'Invite and manage users across all MDAs, then refine the table with status tabs and advanced filters.'
                  : `Portal users mapped to ${mdas.find((entry) => entry.id === usersMdaFilterId)?.mdaName ?? 'the selected MDA'}.`
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
