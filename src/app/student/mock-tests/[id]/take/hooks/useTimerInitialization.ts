'use client';

import { useEffect } from 'react';
import { useTestContext } from '../../context/TestContext';
import { getModuleDuration } from '@/lib/constants/sat-config';

export function useTimerInitialization(): void {
 const {
 currentModule,
 remainingTimeMs,
 setRemainingTime,
 testStatus,
 } = useTestContext();

 // Initialize or reset timer when module changes
 useEffect(() => {
 if (testStatus !== 'testing') return;

 // Only initialize if we don't have remaining time for this module
 // (i.e., module just changed or test just started)
 if (remainingTimeMs === 0 || remainingTimeMs > getModuleDuration(currentModule) + 1000) {
 const moduleDuration = getModuleDuration(currentModule);
 setRemainingTime(moduleDuration);
 }
 }, [currentModule, testStatus, remainingTimeMs, setRemainingTime]);
}