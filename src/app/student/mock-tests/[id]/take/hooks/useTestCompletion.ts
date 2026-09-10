'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTestContext } from '../../context/TestContext';

export function useTestCompletion(userId: string, testId: string) {
 const router = useRouter();
 const {
 testStatus,
 currentModule,
 userAnswers,
 markedQuestions,
 setTestStatus,
 setPaused,
 proctorCode,
 } = useTestContext();

 const completeTest = useCallback(async () => {
 try {
 // Save final state to localStorage
 const testState = {
 userAnswers,
 markedQuestions,
 completedAt: new Date().toISOString(),
 status: 'submitted',
 };
 localStorage.setItem(`completedTest_${userId}_${testId}`, JSON.stringify(testState));
  try {
    localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
  } catch {}

 // Call server action to finalize test
 const response = await fetch('/api/student/complete-test', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 testId,
 userId,
 answers: userAnswers,
 timeSpent: 1200, // Assuming a mock value for time spent
 markedQuestions,
 timestamp: new Date().toISOString(),
 proctorCode: proctorCode || undefined,
 }),
 });

 if (!response.ok) {
 const errData = await response.json();
 throw new Error(errData.error || 'Failed to complete test');
 }

 const result = await response.json();
 
 // Update test status to completed
 setTestStatus('completed');

 // Redirect to results page
 if (result.attemptId) {
 if (document.fullscreenElement) {
 document.exitFullscreen();
 }
 router.push(`/student/mock-tests/${testId}/results?attemptId=${result.attemptId}`);
 }
 } catch (error) {
 console.error('Failed to complete test:', error);
 setPaused(true); // Show error modal (handled by TestEngine)
 }
 }, [userId, testId, userAnswers, markedQuestions, setTestStatus, setPaused, router]);

 return completeTest;
}