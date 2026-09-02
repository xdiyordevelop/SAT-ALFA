'use client';

import { useEffect } from 'react';
import { useTestContext } from '../../context/TestContext';

export function useFullscreenTracking(userId: string, testId: string): void {
 const { testStatus, setFullscreenActive, isPaused, setPaused } = useTestContext();

 useEffect(() => {
 if (typeof window === 'undefined') return;

 const handleVisibilityChange = async () => {
 if (document.hidden && testStatus === 'testing') {
 setFullscreenActive(false);
 setPaused(true);
 try {
 await fetch('/api/student/proctor-violation', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 testId,
 type: 'TAB_SWITCH',
 timestamp: new Date().toISOString(),
 }),
 });
 } catch (error) {}
 }
 };

 const handleFullscreenChange = async () => {
 const isCurrentlyFullscreen =
 document.fullscreenElement !== null ||
 (document as any).webkitFullscreenElement !== null ||
 (document as any).mozFullScreenElement !== null ||
 (document as any).msFullscreenElement !== null;

 // If exiting fullscreen during test, trigger security measure
 if (!isCurrentlyFullscreen && testStatus === 'testing') {
 setFullscreenActive(false);
 setFullscreenActive(false);
 setPaused(true);

 // Log the violation to server
 try {
 const response = await fetch('/api/student/fullscreen-violation', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 testId,
 timestamp: new Date().toISOString(),
 }),
 });
 if (!response.ok) {
 console.error('Failed to log fullscreen violation');
 }
 } catch (error) {
 console.error('Error logging fullscreen violation:', error);
 }
 } else if (isCurrentlyFullscreen && testStatus === 'testing' && isPaused) {
 // Re-entering fullscreen after violation
 setFullscreenActive(true);
 setPaused(false);
 }
 };

 // Listen for fullscreen changes
 document.addEventListener('fullscreenchange', handleFullscreenChange);
 document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
 document.addEventListener('mozfullscreenchange', handleFullscreenChange);
 document.addEventListener('MSFullscreenChange', handleFullscreenChange);
 document.addEventListener('visibilitychange', handleVisibilityChange);

 return () => {
 document.removeEventListener('fullscreenchange', handleFullscreenChange);
 document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
 document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
 document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
 document.removeEventListener('visibilitychange', handleVisibilityChange);
 };
 }, [testStatus, userId, testId, setFullscreenActive, isPaused, setPaused]);
}

export function useRequestFullscreen(): (element?: HTMLElement) => Promise<void> {
 return async (element = document.documentElement) => {
 try {
 if (element.requestFullscreen) {
 await element.requestFullscreen();
 } else if ((element as any).webkitRequestFullscreen) {
 ;(element as any).webkitRequestFullscreen();
 } else if ((element as any).mozRequestFullScreen) {
 ;(element as any).mozRequestFullScreen();
 } else if ((element as any).msRequestFullscreen) {
 ;(element as any).msRequestFullscreen();
 }
 } catch (error) {
 console.error('Failed to enter fullscreen:', error);
 }
 };
}

export function useExitFullscreen(): () => Promise<void> {
 return async () => {
 try {
 if (document.fullscreenElement) {
 if (document.exitFullscreen) {
 await document.exitFullscreen();
 }
 }
 } catch (error) {
 console.error('Failed to exit fullscreen:', error);
 }
 };
}

export function isFullscreenAvailable(): boolean {
 if (typeof document === 'undefined') return false;
 return (
 document.fullscreenEnabled ||
 (document as any).webkitFullscreenEnabled ||
 (document as any).mozFullScreenEnabled ||
 (document as any).msFullscreenEnabled ||
 false
 );
}