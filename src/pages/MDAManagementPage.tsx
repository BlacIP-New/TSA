import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { InviteMDAModal } from '../components/mda/InviteMDAModal';
import { MDATable } from '../components/mda/MDATable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SearchableDropdown } from '../components/ui/SearchableDropdown';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useMDAs } from '../hooks/useMDAs';
import { InviteMDAPayload, MDAUser } from '../types/mda';

type ConfirmState =
  | { type: 'deactivate'; user: MDAUser }
  | { type: 'reactivate'; user: MDAUser }
  | null;

type MDAUserStatusTab = 'all' | 'pending' | 'active' | 'inactive';

type ManagedUserTypeFilter = 'all' | 'system_admin' | 'system_user' | 'mda_admin' | 'mda_user';

export default function MDAManagementPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    mdas,
    allCollections,
    selectedMDAId,
    users,
    isLoading,
    error,
    createInvite,
    resendInvite,
    getInviteSetupLink,
    deactivateUser,
    reactivateUser,
    loadMDACollections,
    loadMDAServiceCodes,
  } = useMDAs(user);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [usersStatusTab, setUsersStatusTab] = useState<MDAUserStatusTab>('all');
  const [usersTypeFilter, setUsersTypeFilter] = useState<ManagedUserTypeFilter>('all');
  const [usersMdaFilterId, setUsersMdaFilterId] = useState<string>('all');
  const [usersCollectionFilterCode, setUsersCollectionFilterCode] = useState<string>('all');
  const [usersSearchQuery, setUsersSearchQuery] = useState<string>('');
  const [isUsersFilterOpen, setIsUsersFilterOpen] = useState(false);

  const canInvite = user?.role !== 'mda_user';

  const userTypeFilterOptions = [
    { label: 'All user types', value: 'all' },
    { label: 'NSW SYSTEM ADMIN', value: 'system_admin' },
    { label: 'NSW SYSTEM USER', value: 'system_user' },
    { label: 'MDA ADMIN', value: 'mda_admin' },
    { label: 'MDA USER', value: 'mda_user' },
  ];

  const userMdaFilterOptions = useMemo(
    () => [
      { label: 'All MDAs', value: 'all' },
      ...mdas.map((entry) => ({ label: `${entry.mdaCode} - ${entry.mdaName}`, value: entry.id })),
    ],
    [mdas],
  );

  const userCollectionFilterOptions = useMemo(() => {
    const scopedCollections =
      usersMdaFilterId === 'all'
        ? allCollections
        : allCollections.filter((entry) => entry.mdaId === usersMdaFilterId);

    return [
      { label: 'All collections', value: 'all' },
      ...scopedCollections.map((entry) => ({ label: `${entry.code} - ${entry.name}`, value: entry.code })),
    ];
  }, [allCollections, usersMdaFilterId]);

  const filteredUsers = useMemo(() => {
    const query = usersSearchQuery.trim().toLowerCase();

    return users.filter((entry) => {
      if (usersStatusTab !== 'all' && entry.status !== usersStatusTab) return false;
      if (usersTypeFilter !== 'all' && entry.userType !== usersTypeFilter) return false;
      if (usersMdaFilterId !== 'all' && entry.mdaId !== usersMdaFilterId) return false;
      if (usersCollectionFilterCode !== 'all' && entry.collectionCode !== usersCollectionFilterCode) {
        return false;
      }

      if (!query) return true;

      return (
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        (entry.mdaCode ?? '').toLowerCase().includes(query) ||
        (entry.mdaName ?? '').toLowerCase().includes(query) ||
        (entry.collectionCode ?? '').toLowerCase().includes(query) ||
        (entry.serviceCode ?? '').toLowerCase().includes(query)
      );
    });
  }, [users, usersStatusTab, usersTypeFilter, usersMdaFilterId, usersCollectionFilterCode, usersSearchQuery]);

  const statusSummary = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((entry) => entry.status === 'pending').length,
      active: users.filter((entry) => entry.status === 'active').length,
      inactive: users.filter((entry) => entry.status === 'inactive').length,
    }),
    [users],
  );

  const activeUsersFilterCount = [
    usersTypeFilter !== 'all',
    usersMdaFilterId !== 'all',
    usersCollectionFilterCode !== 'all',
    usersSearchQuery.trim().length > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  async function handleInvite(payload: InviteMDAPayload) {
    setActionKey('invite');
    try {
      const inviteResult = await createInvite(payload);
      showToast('Invitation sent successfully. The setup link is now shown in the invite modal.', 'success');
      return inviteResult;
    } finally {
      setActionKey(null);
    }
  }

  async function handleResendInvite(target: MDAUser) {
    setActionKey(`resend:${target.id}`);
    try {
      await resendInvite(target.id);
      showToast(`Invitation resent to ${target.email}.`, 'success');
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to resend the invitation right now.',
        'error',
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleCopyInviteLink(target: MDAUser) {
    setActionKey(`copy-link:${target.id}`);

    try {
      const result = await getInviteSetupLink(target.id);
      await navigator.clipboard.writeText(result.setupLink);
      showToast(`Setup link copied for ${result.email}.`, 'info');
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to copy setup link right now.',
        'warning',
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    const nextActionKey = `${confirmState.type}:${confirmState.user.id}`;
    setActionKey(nextActionKey);

    try {
      if (confirmState.type === 'deactivate') {
        await deactivateUser(confirmState.user.id);
        showToast(`${confirmState.user.email} has been deactivated.`, 'warning');
      } else {
        await reactivateUser(confirmState.user.id);
        showToast(`${confirmState.user.email} has been reactivated.`, 'success');
      }
      setConfirmState(null);
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to complete this action right now.',
        'error',
      );
    } finally {
      setActionKey(null);
    }
  }

  if (!user) return null;

  return (
    <>
      <div className="space-y-6 p-4 sm:p-5 lg:p-8">
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
                          Filter by user type, MDA scope, collection, and text search.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUsersTypeFilter('all');
                          setUsersMdaFilterId('all');
                          setUsersCollectionFilterCode('all');
                          setUsersSearchQuery('');
                        }}
                      >
                        Reset filters
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <SearchableDropdown
                        label="User Type"
                        value={usersTypeFilter}
                        placeholder="All user types"
                        searchPlaceholder="Search user types"
                        options={userTypeFilterOptions}
                        onChange={(nextType) => setUsersTypeFilter(nextType as ManagedUserTypeFilter)}
                      />

                      <SearchableDropdown
                        label="MDA"
                        value={usersMdaFilterId}
                        placeholder="All MDAs"
                        searchPlaceholder="Search MDAs"
                        options={userMdaFilterOptions}
                        onChange={(nextMdaId) => {
                          setUsersMdaFilterId(nextMdaId);
                          setUsersCollectionFilterCode('all');
                        }}
                      />

                      <SearchableDropdown
                        label="Collection Code"
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
          title="User management"
          description="Columns include Name, Email, User Type, MDA Code, Collection Code, Service Code, Status, and Last Login."
          canInvite={canInvite}
          onInviteClick={() => setIsInviteOpen(true)}
          onResendInvite={handleResendInvite}
          onCopyInviteLink={handleCopyInviteLink}
          onDeactivate={(target) => setConfirmState({ type: 'deactivate', user: target })}
          onReactivate={(target) => setConfirmState({ type: 'reactivate', user: target })}
        />
      </div>

      <InviteMDAModal
        open={isInviteOpen}
        mdas={mdas}
        inviterRole={user.role}
        inviterMdaId={user.mdaId}
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

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.type === 'deactivate' ? 'Deactivate user' : 'Reactivate user'}
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
