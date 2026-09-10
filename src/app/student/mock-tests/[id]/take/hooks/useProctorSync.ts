import { useEffect, useRef } from 'react';
import { useTestContext } from '../../context/TestContext';

export function useProctorSync(sessionId: string | null) {
  const {
    currentModule,
    currentQuestionIndex,
    testStatus,
    setTestStatus,
    isPaused,
    setPaused,
    remainingTimeMs,
    setRemainingTime,
    setFullscreenExitCount,
    securityAlert,
    setSecurityAlert,
    userId,
    testId,
  } = useTestContext();

  const lastTimeAddedRef = useRef<number>(0);

  useEffect(() => {
    if (!sessionId) return;
    if (testStatus !== 'testing') return;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/student/proctor/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            currentModule,
            currentQuestionIndex,
            timeRemaining: Math.floor(remainingTimeMs / 1000),
            tabSwitch: false,
          }),
        });

        const data = await res.json();
        if (data.success) {
          if (
            data.disqualified ||
            data.status === 'DISQUALIFIED' ||
            (typeof data.exitCount === 'number' && data.exitCount >= 5)
          ) {
            try {
              localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
            } catch (e) {}
            const count = Math.max(5, data.exitCount || 5);
            setFullscreenExitCount(count);
            setPaused(true);
            setSecurityAlert({
              isOpen: true,
              exitCount: count,
              reason: 'TAB_SWITCH',
              remaining: 0,
              isDisqualified: true,
            });
            setTestStatus('completed');
            return;
          }

          if (data.status === 'PAUSED' && !isPaused) {
            setPaused(true);
          } else if (data.status === 'TAKING' && isPaused) {
            // NEVER unpause if a local security violation alert modal is open!
            if (!securityAlert?.isOpen) {
              const isCurrentlyFullscreen = Boolean(
                typeof document !== 'undefined' && (
                  document.fullscreenElement ||
                  (document as any).webkitFullscreenElement ||
                  (document as any).mozFullScreenElement ||
                  (document as any).msFullscreenElement
                )
              );
              if (isCurrentlyFullscreen) {
                setPaused(false);
              }
            }
          } else if (data.status === 'COMPLETED') {
            setTestStatus('completed');
          }

          if (typeof data.exitCount === 'number') {
            setFullscreenExitCount(data.exitCount);
          }

          if (data.timeAdded !== undefined && data.timeAdded > lastTimeAddedRef.current) {
            const timeDiff = data.timeAdded - lastTimeAddedRef.current;
            lastTimeAddedRef.current = data.timeAdded;
            setRemainingTime((prev) => prev + timeDiff * 1000);
          }
        }
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    // 10s interval heartbeat
    const intervalId = setInterval(() => {
      sendHeartbeat();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    sessionId,
    currentModule,
    currentQuestionIndex,
    testStatus,
    remainingTimeMs,
    isPaused,
    userId,
    testId,
    securityAlert,
    setPaused,
    setTestStatus,
    setRemainingTime,
    setFullscreenExitCount,
    setSecurityAlert,
  ]);
}