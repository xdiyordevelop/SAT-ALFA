'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ProctoredSessionData } from '@/app/admin/mock-tests/types/proctor';

interface UseSessionSyncOptions {
  sessionId: string;
  pollInterval?: number;
}

export function useSessionSync({ sessionId, pollInterval = 2000 }: UseSessionSyncOptions) {
  const [session, setSession] = useState<ProctoredSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/proctored-sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Poll for updates
  useEffect(() => {
    pollIntervalRef.current = setInterval(fetchSession, pollInterval);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchSession, pollInterval]);

  const updateSessionStatus = useCallback(
    async (status: 'ACTIVE' | 'COMPLETED' | 'REVOKED') => {
      try {
        const response = await fetch(`/api/admin/proctored-sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update session status');
        }
        await fetchSession();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update session');
        throw err;
      }
    },
    [sessionId, fetchSession]
  );

  const performParticipantAction = useCallback(
    async (action: string, participantId: string, extraData: Record<string, any> = {}) => {
      try {
        const response = await fetch('/api/admin/proctor/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            participantId,
            sessionId,
            ...extraData,
          }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to execute ${action}`);
        }
        await fetchSession();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to perform action');
        throw err;
      }
    },
    [sessionId, fetchSession]
  );

  const pauseParticipantTest = useCallback(
    async (participantId: string) => {
      return performParticipantAction('PAUSE_TEST', participantId);
    },
    [performParticipantAction]
  );

  const resumeParticipantTest = useCallback(
    async (participantId: string) => {
      return performParticipantAction('RESUME_TEST', participantId);
    },
    [performParticipantAction]
  );

  const disqualifyParticipant = useCallback(
    async (participantId: string) => {
      return performParticipantAction('DISQUALIFY', participantId);
    },
    [performParticipantAction]
  );

  const addTimeToParticipant = useCallback(
    async (participantId: string, seconds: number) => {
      return performParticipantAction('ADD_TIME', participantId, { timeToAdd: seconds });
    },
    [performParticipantAction]
  );

  const forceSubmitParticipant = useCallback(
    async (participantId: string) => {
      return performParticipantAction('FORCE_SUBMIT', participantId);
    },
    [performParticipantAction]
  );

  const clearParticipantWarnings = useCallback(
    async (participantId: string) => {
      return performParticipantAction('CLEAR_WARNINGS', participantId);
    },
    [performParticipantAction]
  );

  const disconnectParticipant = useCallback(
    async (participantId: string) => {
      try {
        const response = await fetch(
          `/api/admin/proctored-sessions/${sessionId}/participants/${participantId}`,
          {
            method: 'DELETE',
          }
        );
        if (!response.ok) {
          throw new Error('Failed to remove participant');
        }
        await fetchSession();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove participant');
        throw err;
      }
    },
    [sessionId, fetchSession]
  );

  return {
    session,
    isLoading,
    error,
    updateSessionStatus,
    pauseParticipantTest,
    resumeParticipantTest,
    disqualifyParticipant,
    addTimeToParticipant,
    forceSubmitParticipant,
    clearParticipantWarnings,
    disconnectParticipant,
    refetch: fetchSession,
  };
}
