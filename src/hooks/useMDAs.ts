import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../types/auth';
import {
  InviteMDAPayload,
  MDADetail,
  MDARecord,
  MDAServiceCode,
  MDAUser,
  MDACollectionCode,
} from '../types/mda';
import { PaginatedSettlementBatches } from '../types/transaction';
import {
  deactivateMDAUser,
  getMDADetail,
  getMDAs,
  getMDAServiceCodes,
  getMDAUsers,
  getMDACollections,
  getMDAInviteSetupLink,
  inviteMDAUser,
  reactivateMDAUser,
  resendMDAInvite,
} from '../services/mdaService';
import { getSettlementBatches } from '../services/transactionService';
import { logAuditEntry } from '../services/auditService';

const EMPTY_SETTLEMENT_RESULT: PaginatedSettlementBatches = {
  data: [],
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
};

export function useMDAs(user: AuthUser | null) {
  const [mdas, setMdas] = useState<MDARecord[]>([]);
  const [allCollections, setAllCollections] = useState<MDACollectionCode[]>([]);
  const [selectedMDAId, setSelectedMDAId] = useState<string | null>(null);
  const [selectedMDADetail, setSelectedMDADetail] = useState<MDADetail | null>(null);
  const [selectedCollectionCode, setSelectedCollectionCode] = useState<string | null>(null);
  const [users, setUsers] = useState<MDAUser[]>([]);
  const [settlementResult, setSettlementResult] = useState<PaginatedSettlementBatches>(EMPTY_SETTLEMENT_RESULT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settlementError, setSettlementError] = useState<string | null>(null);

  const loadMDACollections = useCallback(async (mdaId: string): Promise<MDACollectionCode[]> => {
    if (!mdaId) return [];
    return getMDACollections(mdaId);
  }, []);

  const loadMDAServiceCodes = useCallback(async (mdaId: string, collectionCode?: string): Promise<MDAServiceCode[]> => {
    if (!mdaId) return [];
    return getMDAServiceCodes(mdaId, collectionCode);
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.aggregatorId) {
      setMdas([]);
      setAllCollections([]);
      setSelectedMDAId(null);
      setSelectedMDADetail(null);
      setSelectedCollectionCode(null);
      setUsers([]);
      setSettlementResult(EMPTY_SETTLEMENT_RESULT);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextMdas = await getMDAs(user.aggregatorId);

      const scopedMdas =
        user.role === 'mda_admin' && user.mdaId
          ? nextMdas.filter((entry) => entry.id === user.mdaId)
          : nextMdas;

      const nextSelectedMDAId =
        selectedMDAId && scopedMdas.some((entry) => entry.id === selectedMDAId)
          ? selectedMDAId
          : scopedMdas[0]?.id ?? null;
      const collectionsByMda = await Promise.all(
        scopedMdas.map((entry) => getMDACollections(entry.id)),
      );

      setMdas(scopedMdas);
      setAllCollections(collectionsByMda.flat());

      if (!nextSelectedMDAId) {
        setSelectedMDAId(null);
        setSelectedMDADetail(null);
        setUsers([]);
        setSelectedCollectionCode(null);
        setSettlementResult(EMPTY_SETTLEMENT_RESULT);
        return;
      }

      const [detail, nextUsers] = await Promise.all([
        getMDADetail(nextSelectedMDAId),
        getMDAUsers(user.aggregatorId),
      ]);

      const scopedUsers =
        user.role === 'mda_admin' && user.mdaId
          ? nextUsers.filter((entry) => entry.mdaId === user.mdaId)
          : nextUsers;

      setSelectedMDAId(nextSelectedMDAId);
      setSelectedMDADetail(detail);
      setUsers(scopedUsers);
      setSelectedCollectionCode((current) => {
        if (current && collectionsByMda.flat().some((entry) => entry.code === current)) {
          return current;
        }
        return collectionsByMda.flat()[0]?.code ?? null;
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load MDA records right now.',
      );
      setMdas([]);
      setAllCollections([]);
      setSelectedMDAId(null);
      setSelectedMDADetail(null);
      setUsers([]);
      setSelectedCollectionCode(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMDAId, user?.aggregatorId, user?.mdaId, user?.role]);

  const loadSelectedContext = useCallback(async () => {
    if (!user?.aggregatorId || !selectedMDAId) {
      setSelectedMDADetail(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detail = await getMDADetail(selectedMDAId);

      setSelectedMDADetail(detail);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load the selected MDA context right now.',
      );
      setSelectedMDADetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMDAId, user?.aggregatorId]);

  const loadSelectedCollectionSettlements = useCallback(async () => {
    if (!user?.aggregatorId || !selectedCollectionCode) {
      setSettlementResult(EMPTY_SETTLEMENT_RESULT);
      setSettlementError(null);
      setIsSettlementLoading(false);
      return;
    }

    setIsSettlementLoading(true);
    setSettlementError(null);

    try {
      const response = await getSettlementBatches({
        aggregatorId: user.aggregatorId,
        collectionCode: selectedCollectionCode,
        page: 1,
        limit: 100,
      });
      setSettlementResult(response);
    } catch (caughtError) {
      setSettlementResult(EMPTY_SETTLEMENT_RESULT);
      setSettlementError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load collection settlements right now.',
      );
    } finally {
      setIsSettlementLoading(false);
    }
  }, [selectedCollectionCode, user?.aggregatorId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void loadSelectedContext();
  }, [loadSelectedContext]);

  useEffect(() => {
    void loadSelectedCollectionSettlements();
  }, [loadSelectedCollectionSettlements]);

  const createInvite = useCallback(
    async (payload: InviteMDAPayload) => {
      if (!user?.aggregatorId || !user?.id) {
        throw new Error('Missing admin session context.');
      }

      const inviteMdaId = payload.mdaId ?? user.mdaId;
      const detail = inviteMdaId ? await getMDADetail(inviteMdaId) : null;
      const inviteResult = await inviteMDAUser({
        ...payload,
        aggregatorId: user.aggregatorId,
        invitedBy: user.id,
        invitedByRole: user.role,
        invitedByMdaId: user.mdaId,
      });
      await logAuditEntry({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'mda_invited',
        details: `Invitation sent for ${detail?.record.mdaCode ?? 'SYSTEM'} (${payload.collectionCode ?? 'n/a'}${payload.serviceCode ? ` / ${payload.serviceCode}` : ''}) to ${payload.email}.`,
        aggregatorId: user.aggregatorId,
      });
      await refresh();
      if (inviteMdaId) {
        setSelectedMDAId(inviteMdaId);
      }
      return inviteResult;
    },
    [refresh, user],
  );

  const resendInvite = useCallback(
    async (id: string) => {
      const resendResult = await resendMDAInvite(id);
      if (user?.aggregatorId) {
        const target = users.find((entry) => entry.id === id);
        if (target) {
          await logAuditEntry({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            action: 'invitation_resent',
            details: `Invitation resent to ${target.email} for ${target.mdaCode ?? 'SYSTEM'} (${target.collectionCode ?? 'n/a'}${target.serviceCode ? ` / ${target.serviceCode}` : ''}).`,
            aggregatorId: user.aggregatorId,
          });
        }
      }
      await refresh();
      return resendResult;
    },
    [refresh, user, users],
  );

  const getInviteSetupLink = useCallback(async (id: string) => {
    return getMDAInviteSetupLink(id);
  }, []);

  const deactivateUser = useCallback(
    async (id: string) => {
      const updated = await deactivateMDAUser(id);
      if (user?.aggregatorId) {
        await logAuditEntry({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: 'mda_deactivated',
          details: `${updated.email} was deactivated for ${updated.mdaCode ?? 'SYSTEM'} (${updated.collectionCode ?? 'n/a'}${updated.serviceCode ? ` / ${updated.serviceCode}` : ''}).`,
          aggregatorId: user.aggregatorId,
        });
      }
      await refresh();
    },
    [refresh, user],
  );

  const reactivateUser = useCallback(
    async (id: string) => {
      const updated = await reactivateMDAUser(id);
      if (user?.aggregatorId) {
        await logAuditEntry({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: 'mda_reactivated',
          details: `${updated.email} was reactivated for ${updated.mdaCode ?? 'SYSTEM'} (${updated.collectionCode ?? 'n/a'}${updated.serviceCode ? ` / ${updated.serviceCode}` : ''}).`,
          aggregatorId: user.aggregatorId,
        });
      }
      await refresh();
    },
    [refresh, user],
  );

  const selectedMDA = useMemo(
    () => mdas.find((entry) => entry.id === selectedMDAId) ?? null,
    [mdas, selectedMDAId],
  );

  return {
    mdas,
    allCollections,
    selectedMDAId,
    selectedMDA,
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
    getInviteSetupLink,
    deactivateUser,
    reactivateUser,
    loadMDACollections,
    loadMDAServiceCodes,
    setSelectedMDAId,
    setSelectedCollectionCode,
  };
}
