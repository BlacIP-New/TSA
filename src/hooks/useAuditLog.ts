import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from '../types/auth';
import { AuditAction, AuditEntry } from '../types/audit';
import { getAuditLog } from '../services/auditService';

export interface AuditLogFilters {
  from?: string;
  to?: string;
  action?: AuditAction | '';
  userId?: string;
}

interface AuditLogResult {
  data: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const EMPTY_AUDIT_RESULT: AuditLogResult = {
  data: [],
  total: 0,
  page: 1,
  totalPages: 1,
};

export function useAuditLog(
  user: AuthUser | null,
  filters: AuditLogFilters,
  page: number,
  limit: number
) {
  const [result, setResult] = useState<AuditLogResult>(EMPTY_AUDIT_RESULT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<Array<{ id: string; label: string }>>([]);

  const loadAuditLog = useCallback(async () => {
    if (!user?.aggregatorId) {
      setResult(EMPTY_AUDIT_RESULT);
      setUserOptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [pagedLog, allEntries] = await Promise.all([
        getAuditLog({
          aggregatorId: user.aggregatorId,
          from: filters.from,
          to: filters.to,
          action: filters.action,
          userId: filters.userId,
          page,
          limit,
        }),
        getAuditLog({
          aggregatorId: user.aggregatorId,
          page: 1,
          limit: 500,
        }),
      ]);

      setResult(pagedLog);
      setUserOptions(
        [...new Map(
          allEntries.data.map((entry) => [entry.userId, { id: entry.userId, label: `${entry.userEmail} — ${entry.userName}` }])
        ).values()]
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load audit log right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.action,
    filters.from,
    filters.to,
    filters.userId,
    limit,
    page,
    user?.aggregatorId,
  ]);

  useEffect(() => {
    void loadAuditLog();
  }, [loadAuditLog]);

  return {
    result,
    isLoading,
    error,
    userOptions,
    refresh: loadAuditLog,
  };
}
