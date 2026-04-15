import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from '../types/auth';
import { CollectionCode, InviteMDAPayload, MDAUser, ServiceCode } from '../types/mda';
import {
  deactivateMDAUser,
  getCollectionCodes,
  getMDAUsers,
  getServiceCodes,
  inviteMDAUser,
  reactivateMDAUser,
  resendMDAInvite,
} from '../services/mdaService';
import { logAuditEntry } from '../services/auditService';

export function useMDAs(user: AuthUser | null) {
  const [users, setUsers] = useState<MDAUser[]>([]);
  const [collectionCodes, setCollectionCodes] = useState<CollectionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!user?.aggregatorId) {
      setUsers([]);
      return;
    }

    const response = await getMDAUsers(user.aggregatorId);
    setUsers(response);
  }, [user?.aggregatorId]);

  const loadCollections = useCallback(async () => {
    if (!user?.aggregatorId) {
      setCollectionCodes([]);
      return;
    }

    const response = await getCollectionCodes(user.aggregatorId);
    setCollectionCodes(response);
  }, [user?.aggregatorId]);

  const refresh = useCallback(async () => {
    if (!user?.aggregatorId) {
      setUsers([]);
      setCollectionCodes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([loadUsers(), loadCollections()]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load MDA users right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadCollections, loadUsers, user?.aggregatorId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createInvite = useCallback(
    async (payload: InviteMDAPayload) => {
      if (!user?.aggregatorId || !user?.id) {
        throw new Error('Missing admin session context.');
      }

      await inviteMDAUser({
        ...payload,
        aggregatorId: user.aggregatorId,
        invitedBy: user.id,
      });
      await logAuditEntry({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'mda_invited',
        details: `Invitation sent for collection ${payload.collectionCode} and service ${payload.serviceCode} to ${payload.email}.`,
        aggregatorId: user.aggregatorId,
      });
      await loadUsers();
    },
    [loadUsers, user?.aggregatorId, user?.email, user?.id, user?.name]
  );

  const resendInvite = useCallback(
    async (id: string) => {
      await resendMDAInvite(id);
      if (user?.aggregatorId) {
        const target = users.find((entry) => entry.id === id);
        if (target) {
          await logAuditEntry({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            action: 'invitation_resent',
            details: `Invitation resent to ${target.email} for ${target.collectionCode} / ${target.serviceCode}.`,
            aggregatorId: user.aggregatorId,
          });
        }
      }
      await loadUsers();
    },
    [loadUsers, user, users]
  );

  const deactivateUser = useCallback(
    async (id: string) => {
      const updated = await deactivateMDAUser(id);
      if (user?.aggregatorId) {
        await logAuditEntry({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: 'mda_deactivated',
          details: `${updated.email} was deactivated for ${updated.collectionCode} / ${updated.serviceCode}.`,
          aggregatorId: user.aggregatorId,
        });
      }
      await loadUsers();
    },
    [loadUsers, user]
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
          details: `${updated.email} was reactivated for ${updated.collectionCode} / ${updated.serviceCode}.`,
          aggregatorId: user.aggregatorId,
        });
      }
      await loadUsers();
    },
    [loadUsers, user]
  );

  const loadServiceCodes = useCallback(async (collectionCode: string): Promise<ServiceCode[]> => {
    if (!collectionCode) return [];
    return getServiceCodes(collectionCode);
  }, []);

  return {
    users,
    collectionCodes,
    isLoading,
    error,
    refresh,
    createInvite,
    resendInvite,
    deactivateUser,
    reactivateUser,
    loadServiceCodes,
  };
}
