'use client';

import { useEffect, useRef } from 'react';
import { useTestContext } from '../../context/TestContext';

export function useFullscreenTracking(userId: string, testId: string): void {
  const {
    testStatus,
    setTestStatus,
    setFullscreenActive,
    isPaused,
    setPaused,
    proctorCode,
    fullscreenExitCount,
    setFullscreenExitCount,
    securityAlert,
    setSecurityAlert,
    isBreakActive,
    isTransitionActive,
    isCalculatorOpen,
  } = useTestContext();

  const lastViolationTimeRef = useRef<number>(0);
  const isDisqualifyingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDisqualification = () => {
      if (isDisqualifyingRef.current) return;
      isDisqualifyingRef.current = true;

      // Purge in-progress test cache so they can't resume
      try {
        localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }

      // Drop fullscreen
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) {}

      // Keep security alert open in DISQUALIFIED state with 5/5
      setSecurityAlert({
        isOpen: true,
        exitCount: 5,
        reason: 'TAB_SWITCH',
        remaining: 0,
        isDisqualified: true,
      });
      setTestStatus('completed');
    };

    const recordViolation = async (reason: 'TAB_SWITCH' | 'FULLSCREEN_EXIT') => {
      if (testStatus !== 'testing' || isBreakActive || isTransitionActive || isDisqualifyingRef.current) return;

      const now = Date.now();
      // 3000ms debounce cooldown prevents 1 physical tab switch triggering multiple violations
      if (now - lastViolationTimeRef.current < 3000) {
        return;
      }
      lastViolationTimeRef.current = now;

      setFullscreenActive(false);
      setPaused(true);

      const isProctored = Boolean(proctorCode);
      const optimisticCount = (fullscreenExitCount || 0) + 1;
      const isDisqualifiedOptimistic = isProctored && (optimisticCount >= 5);

      // Immediately show security warning modal on the client
      setSecurityAlert({
        isOpen: true,
        exitCount: optimisticCount,
        reason,
        remaining: isProctored ? Math.max(0, 5 - optimisticCount) : null,
        isDisqualified: isDisqualifiedOptimistic,
      });
      setFullscreenExitCount(optimisticCount);

      if (isDisqualifiedOptimistic) {
        handleDisqualification();
      }

      try {
        const response = await fetch('/api/student/fullscreen-violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            testId,
            sessionId: proctorCode,
            reason,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (typeof data.count === 'number') {
            setFullscreenExitCount(data.count);
            const isDisq = isProctored && (Boolean(data.disqualified) || data.count >= 5);
            setSecurityAlert({
              isOpen: true,
              exitCount: data.count,
              reason,
              remaining: isProctored ? Math.max(0, 5 - data.count) : null,
              isDisqualified: isDisq,
            });

            if (isDisq) {
              handleDisqualification();
            }
          }
        }
      } catch (error) {
        console.error('Error logging violation to server:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (isBreakActive || isTransitionActive || testStatus !== 'testing') return;
      if (document.hidden) {
        recordViolation('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      if (isBreakActive || isTransitionActive || testStatus !== 'testing') return;

      // When clicking inside an iframe (like Desmos Calculator), window blur fires,
      // but document.hidden is false, and focus transfers to the iframe.
      // Small timeout allows document.activeElement to update.
      setTimeout(() => {
        // If document is not hidden, inspect what received focus
        if (!document.hidden) {
          const activeEl = document.activeElement;
          // Check if focus shifted to Desmos iframe or calculator widget
          if (
            activeEl &&
            (activeEl.tagName === 'IFRAME' ||
             activeEl.getAttribute('data-desmos-calculator') === 'true' ||
             Boolean(activeEl.closest?.('[data-calculator-widget]')) ||
             (activeEl as HTMLElement).title?.includes('Calculator') ||
             (activeEl as HTMLElement).title?.includes('Desmos'))
          ) {
            return; // Normal calculator usage — NOT a tab switch!
          }

          // If calculator is currently open and document is still visible, ignore blur
          if (isCalculatorOpen) {
            return;
          }
        }

        // Only record violation if the browser tab actually became hidden (true tab switch)
        if (document.hidden) {
          recordViolation('TAB_SWITCH');
        }
      }, 100);
    };

    const handleFullscreenChange = () => {
      if (isBreakActive || isTransitionActive || testStatus !== 'testing') return;

      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        recordViolation('FULLSCREEN_EXIT');
      } else if (isCurrentlyFullscreen && isPaused && !securityAlert?.isOpen) {
        // Re-entered fullscreen (only if no security alert modal is waiting for acknowledgment)
        setFullscreenActive(true);
        setPaused(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [
    testStatus,
    userId,
    testId,
    proctorCode,
    isPaused,
    fullscreenExitCount,
    securityAlert,
    setFullscreenActive,
    setPaused,
    setTestStatus,
    setFullscreenExitCount,
    setSecurityAlert,
    isBreakActive,
    isTransitionActive,
    isCalculatorOpen,
  ]);
}

export function useRequestFullscreen(): (element?: HTMLElement) => Promise<void> {
  return async (element = document.documentElement) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
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