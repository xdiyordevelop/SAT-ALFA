'use client';

import { useEffect, useRef } from 'react';
import { useTestContext } from '../../context/TestContext';

export interface PersistedTestState {
 userAnswers: Record<string, string>;
 markedQuestions: Record<string, boolean>;
 remainingTimeMs: number;
 currentModule: number;
 currentQuestionIndex: number;
 timestamp: number;
}

const SYNC_INTERVAL_MS = 10000; // 10 seconds

export function useAnswerTracking(userId: string, testId: string): void {
 const {
 userAnswers,
 markedQuestions,
 remainingTimeMs,
 currentModule,
 currentQuestionIndex,
 saveState,
 } = useTestContext();

 const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

 // Save state to localStorage
 const persistToStorage = () => {
 try {
 const payload: PersistedTestState = {
 userAnswers,
 markedQuestions,
 remainingTimeMs,
 currentModule,
 currentQuestionIndex,
 timestamp: Date.now(),
 };
 localStorage.setItem(`inProgressTest_${userId}_${testId}`, JSON.stringify(payload));
 } catch (error) {
 console.error('Failed to persist test state:', error);
 }
 };

 // Set up 10-second sync interval
 useEffect(() => {
 syncTimerRef.current = setInterval(persistToStorage, SYNC_INTERVAL_MS);
 return () => {
 if (syncTimerRef.current) {
 clearInterval(syncTimerRef.current);
 }
 };
 }, [userAnswers, markedQuestions, remainingTimeMs, currentModule, currentQuestionIndex]);

 // Also persist whenever state changes (debounced by interval)
 useEffect(() => {
 persistToStorage();
 }, [userAnswers, markedQuestions, currentModule, currentQuestionIndex]);

 // Save before unload
 useEffect(() => {
 const handleBeforeUnload = () => {
 persistToStorage();
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, []);
}

export function useRestoreTestState(userId: string, testId: string): PersistedTestState | null {
 try {
 const stored = localStorage.getItem(`inProgressTest_${userId}_${testId}`);
 if (!stored) return null;
 const parsed: PersistedTestState = JSON.parse(stored);
 
 // Validate the structure
 if (
 !parsed.userAnswers ||
 !parsed.markedQuestions ||
 typeof parsed.remainingTimeMs !== 'number' ||
 typeof parsed.currentModule !== 'number' ||
 typeof parsed.currentQuestionIndex !== 'number'
 ) {
 console.warn('Invalid stored test state, clearing');
 localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
 return null;
 }
 return parsed;
 } catch (error) {
 console.error('Failed to restore test state:', error);
 return null;
 }
}

export function useClearTestState(userId: string, testId: string): () => void {
 return () => {
 try {
 localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
 } catch (error) {
 console.error('Failed to clear test state:', error);
 }
 };
}