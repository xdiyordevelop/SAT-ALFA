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
 throw new Error('Failed to update session');
 }
 await fetchSession();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to update session');
 }
 },
 [sessionId, fetchSession]
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
 throw new Error('Failed to disconnect participant');
 }
 await fetchSession();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to disconnect');
 }
 },
 [sessionId, fetchSession]
 );

 const pauseParticipantTest = useCallback(
 async (participantId: string) => {
 try {
 const response = await fetch(
 `/api/admin/proctored-sessions/${sessionId}/participants/${participantId}/pause`,
 {
 method: 'POST',
 }
 );
 if (!response.ok) {
 throw new Error('Failed to pause test');
 }
 await fetchSession();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to pause test');
 }
 },
 [sessionId, fetchSession]
 );

 return {
 session,
 isLoading,
 error,
 updateSessionStatus,
 disconnectParticipant,
 pauseParticipantTest,
 refetch: fetchSession,
 };
}