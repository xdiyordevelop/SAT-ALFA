'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTestContext } from '../../context/TestContext';
import { getModuleDuration, SAT_CONFIG } from '@/lib/constants/sat-config';
import { useTestCompletion } from './useTestCompletion';

export function useModuleTimer(userId: string, testId: string): void {
 const completeTest = useTestCompletion(userId, testId);
 const {
 currentModule,
 testStatus,
 isPaused,
 remainingTimeMs,
 setRemainingTime,
 setPaused,
 advanceToNextModule,
 setTransitionActive,
 isBreakActive,
 } = useTestContext();

 const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
 const lastTickRef = useRef<number>(Date.now());
 const warningsPlayedRef = useRef<Set<string>>(new Set());

 // Play audio warning
 const playWarning = useCallback((type: '5min' | '1min') => {
 if (warningsPlayedRef.current.has(type)) return;
 warningsPlayedRef.current.add(type);
 try {
 const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
 if (type === '5min') {
 // 2 beeps: 1000Hz for 200ms, 100ms gap, 1000Hz for 200ms
 playTone(audioContext, 1000, 200, 0);
 playTone(audioContext, 1000, 200, 300);
 } else {
 // 3 rapid alert beeps: 1200Hz for 150ms each, 100ms gaps
 playTone(audioContext, 1200, 150, 0);
 playTone(audioContext, 1200, 150, 250);
 playTone(audioContext, 1200, 150, 500);
 }
 } catch (error) {
 console.error('Failed to play audio warning:', error);
 }
 }, []);

 // Synthesize tone using Web Audio API
 const playTone = (
 audioContext: AudioContext,
 frequency: number,
 duration: number,
 startTime: number
 ) => {
 const now = audioContext.currentTime;
 const oscillator = audioContext.createOscillator();
 const gainNode = audioContext.createGain();
 oscillator.connect(gainNode);
 gainNode.connect(audioContext.destination);
 oscillator.frequency.value = frequency;
 oscillator.type = 'sine';
 // Envelope: fade in 10ms, hold, fade out 50ms
 gainNode.gain.setValueAtTime(0, now + startTime / 1000);
 gainNode.gain.linearRampToValueAtTime(0.3, now + startTime / 1000 + 0.01);
 gainNode.gain.setValueAtTime(0.3, now + (startTime + duration - 50) / 1000);
 gainNode.gain.linearRampToValueAtTime(0, now + (startTime + duration) / 1000);
 oscillator.start(now + startTime / 1000);
 oscillator.stop(now + (startTime + duration) / 1000);
 };

 // Main timer loop
 useEffect(() => {
 if (testStatus !== 'testing' || isPaused || isBreakActive) {
 if (timerIntervalRef.current) {
 clearInterval(timerIntervalRef.current);
 timerIntervalRef.current = null;
 }
 return;
 }
 lastTickRef.current = Date.now();
 timerIntervalRef.current = setInterval(() => {
 const now = Date.now();
 const delta = now - lastTickRef.current;
 lastTickRef.current = now;
 setRemainingTime((prev: number) => {
 const newTime = Math.max(0, prev - delta);
 // Check for warnings (only once per module)
 if (newTime <= 5 * 60 * 1000 && newTime > 5 * 60 * 1000 - delta) {
 playWarning('5min');
 }
 if (newTime <= 60 * 1000 && newTime > 60 * 1000 - delta) {
 playWarning('1min');
 }
 // Auto-advance to next module when time expires
 if (newTime === 0) {
 clearInterval(timerIntervalRef.current!);
 timerIntervalRef.current = null;
 // If last module (4), finish test
 if (currentModule === 4) {
 setPaused(true);
 completeTest();
 } else {
 // Show transition overlay
 setTransitionActive(true);
 // If moving from Module 2 to Module 3, show break screen instead
 if (currentModule === 2) {
 setTimeout(() => {
 setTransitionActive(false);
 // Break screen will be displayed by TestEngine
 }, 3000);
 } else {
 // Standard module transition (1s fade, then advance)
 setTimeout(() => {
 setTransitionActive(false);
 warningsPlayedRef.current.clear();
 advanceToNextModule();
 }, 3000);
 }
 }
 }
 return newTime;
 });
 }, 100); // Update every 100ms for smooth countdown

 return () => {
 if (timerIntervalRef.current) {
 clearInterval(timerIntervalRef.current);
 }
 };
 }, [
 testStatus,
 isPaused,
 isBreakActive,
 currentModule,
 setRemainingTime,
 setPaused,
 advanceToNextModule,
 setTransitionActive,
 playWarning,
 ]);

 // Reset warnings when module changes
 useEffect(() => {
 warningsPlayedRef.current.clear();
 }, [currentModule]);
}