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
 setRemainingTime
 } = useTestContext();

 const lastTimeAddedRef = useRef<number>(0);

 useEffect(() => {
 if (!sessionId) return;
 if (testStatus !== 'testing') return;

 const sendHeartbeat = async (tabSwitch = false) => {
 try {
 const res = await fetch('/api/student/proctor/heartbeat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 sessionId,
 currentModule,
 currentQuestionIndex,
 timeRemaining: Math.floor(remainingTimeMs / 1000),
 tabSwitch
 })
 });
 const data = await res.json();
 if (data.success) {
 if (data.status === 'PAUSED' && !isPaused) {
 setPaused(true);
 } else if (data.status === 'TAKING' && isPaused) {
 setPaused(false);
 } else if (data.status === 'DISQUALIFIED') {
 setTestStatus('completed');
 alert('Your test has been disqualified by the proctor.');
 window.location.href = '/student/dashboard';
 } else if (data.status === 'COMPLETED') {
 setTestStatus('completed');
 }

 if (data.timeAdded !== undefined && data.timeAdded > lastTimeAddedRef.current) {
 const timeDiff = data.timeAdded - lastTimeAddedRef.current;
 lastTimeAddedRef.current = data.timeAdded;
 setRemainingTime(prev => prev + timeDiff * 1000);
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

 // Visibility change (tab switch);
 const handleVisibilityChange = () => {
 if (document.hidden) {
 sendHeartbeat(true);
 // Optionally alert the student locally
 alert('Warning: You have switched tabs. This has been reported to the proctor.');
 }
 };

 // Blur event (window focus lost);
 const handleBlur = () => {
 sendHeartbeat(true);
 };

 document.addEventListener('visibilitychange', handleVisibilityChange);
 window.addEventListener('blur', handleBlur);

 return () => {
 clearInterval(intervalId);
 document.removeEventListener('visibilitychange', handleVisibilityChange);
 window.removeEventListener('blur', handleBlur);
 };
 }, [
 sessionId,
 currentModule,
 currentQuestionIndex,
 testStatus,
 remainingTimeMs,
 isPaused,
 setPaused,
 setTestStatus,
 setRemainingTime
 ]);
}