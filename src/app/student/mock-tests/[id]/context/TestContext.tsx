"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";

// ==================== TYPES ====================

export type TestStatus =
  | "idle"
  | "loading"
  | "testing"
  | "break"
  | "transition"
  | "completed";
export type TestModule = 1 | 2 | 3 | 4;
export type ModuleSection = "RW" | "MATH";

export interface UserAnswer {
  questionId: string;
  answer: string;
  timestamp: number;
}

export interface TestContextState {
  // Test Identity
  testId: string;
  studentId: string;
  userId: string;
  proctorCode: string | null;

  // Navigation & Status
  currentModule: TestModule;
  currentQuestionIndex: number;
  testStatus: TestStatus;

  // Content
  userAnswers: Record<string, string>;
  markedQuestions: Record<string, boolean>;

  // Timing
  remainingTimeMs: number;
  isPaused: boolean;
  isTimerRunning: boolean;

  // UI State
  isFullscreenActive: boolean;
  isBreakActive: boolean;
  isTransitionActive: boolean;
  isNavigatorOpen: boolean;
  isCalculatorOpen: boolean;
  isReferenceOpen: boolean;
  isAnnotateActive: boolean;

  // Questions
  realQuestions: any[];
  totalQuestions: number;
  questionsPerModule: Record<TestModule, number>;
}

export interface TestContextActions {
  // Navigation
  setCurrentModule: (module: TestModule) => void;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (questionId: string, module: TestModule) => void;
  advanceToNextModule: () => void;

  // Answers
  setAnswer: (questionId: string, answer: string) => void;
  toggleMarkForReview: (questionId: string) => void;

  // Timing
  decrementTimer: (ms: number) => void;
  setRemainingTime: (time: number | ((prev: number) => number)) => void;
  setPaused: (paused: boolean) => void;
  setTimerRunning: (running: boolean) => void;
  resetRemainingTime: (module: TestModule) => void;

  // UI
  setFullscreenActive: (active: boolean) => void;
  setBreakActive: (active: boolean) => void;
  setTransitionActive: (active: boolean) => void;
  setNavigatorOpen: (open: boolean) => void;
  setCalculatorOpen: (open: boolean) => void;
  setReferenceOpen: (open: boolean) => void;
  setAnnotateActive: (active: boolean) => void;
  setTestStatus: (status: TestStatus) => void;

  // Bulk operations
  saveState: () => void;
  restoreState: () => Promise<boolean>;
}

export interface TestContextValue extends TestContextState, TestContextActions {
  // Computed properties
  answeredCount: number;
  markedCount: number;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  moduleSection: ModuleSection;
}

// ==================== CONTEXT CREATION ====================

const TestContext = createContext<TestContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface TestProviderProps {
  children: React.ReactNode;
  testId: string;
  studentId: string;
  userId: string;
  proctorCode?: string | null;
  realQuestions: any[];
  totalQuestions: number;
  questionsPerModule: Record<TestModule, number>;
}

export function TestProvider({
  children,
  testId,
  studentId,
  userId,
  proctorCode = null,
  totalQuestions,
  questionsPerModule,
  realQuestions,
}: TestProviderProps) {
  const [state, setState] = useState<TestContextState>({
    testId,
    studentId,
    userId,
    proctorCode: proctorCode ?? null,
    currentModule: 1,
    currentQuestionIndex: 0,
    testStatus: "loading",
    userAnswers: {},
    markedQuestions: {},
    remainingTimeMs: 1920000, // 32 minutes for Module 1
    isPaused: false,
    isTimerRunning: false,
    isFullscreenActive: false,
    isBreakActive: false,
    isTransitionActive: false,
    isNavigatorOpen: false,
    isCalculatorOpen: false,
    isReferenceOpen: false,
    isAnnotateActive: false,
    totalQuestions,
    questionsPerModule,
    realQuestions,
  });

  // ==================== ACTION HANDLERS ====================

  const setCurrentModule = useCallback((module: TestModule) => {
    setState((prev) => ({
      ...prev,
      currentModule: module,
      currentQuestionIndex: 0,
      isCalculatorOpen: module >= 3, // Auto-open calc for Math
    }));
  }, []);

  const setCurrentQuestionIndex = useCallback(
    (index: number) => {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: Math.max(
          0,
          Math.min(index, questionsPerModule[prev.currentModule] - 1),
        ),
      }));
    },
    [questionsPerModule],
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const maxIndex = questionsPerModule[prev.currentModule] - 1;
      if (prev.currentQuestionIndex < maxIndex) {
        return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
      }
      return prev;
    });
  }, [questionsPerModule]);

  const prevQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex > 0) {
        return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 };
      }
      return prev;
    });
  }, []);

  const jumpToQuestion = useCallback(
    (questionId: string, module: TestModule) => {
      // This will be implemented with full question mapping
      setState((prev) => ({
        ...prev,
        currentModule: module,
        currentQuestionIndex: 0,
        isNavigatorOpen: false,
      }));
    },
    [],
  );

  const advanceToNextModule = useCallback(() => {
    setState((prev) => {
      if (prev.currentModule < 4) {
        const nextModule = (prev.currentModule + 1) as TestModule;
        return {
          ...prev,
          currentModule: nextModule,
          currentQuestionIndex: 0,
          isCalculatorOpen: nextModule >= 3, // Auto-open for Math modules
        };
      }
      return prev;
    });
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: answer,
      },
    }));
  }, []);

  const toggleMarkForReview = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      markedQuestions: {
        ...prev.markedQuestions,
        [questionId]: !prev.markedQuestions[questionId],
      },
    }));
  }, []);

  const decrementTimer = useCallback((ms: number) => {
    setState((prev) => ({
      ...prev,
      remainingTimeMs: Math.max(0, prev.remainingTimeMs - ms),
    }));
  }, []);

  const setRemainingTime = useCallback(
    (time: number | ((prev: number) => number)) => {
      setState((prev) => ({
        ...prev,
        remainingTimeMs:
          typeof time === "function" ? time(prev.remainingTimeMs) : time,
      }));
    },
    [],
  );

  const setPaused = useCallback((paused: boolean) => {
    setState((prev) => ({
      ...prev,
      isPaused: paused,
    }));
  }, []);

  const setTimerRunning = useCallback((running: boolean) => {
    setState((prev) => ({
      ...prev,
      isTimerRunning: running,
    }));
  }, []);

  const resetRemainingTime = useCallback((module: TestModule) => {
    const timeMs = module <= 2 ? 1920000 : 2100000;
    setState((prev) => ({
      ...prev,
      remainingTimeMs: timeMs,
    }));
  }, []);

  const setFullscreenActive = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isFullscreenActive: active,
    }));
  }, []);

  const setBreakActive = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isBreakActive: active,
      isPaused: active,
    }));
  }, []);

  const setTransitionActive = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isTransitionActive: active,
    }));
  }, []);

  const setNavigatorOpen = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isNavigatorOpen: open,
    }));
  }, []);

  const setCalculatorOpen = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isCalculatorOpen: open,
    }));
  }, []);

  const setReferenceOpen = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isReferenceOpen: open,
    }));
  }, []);

  const setAnnotateActive = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isAnnotateActive: active,
    }));
  }, []);

  const setTestStatus = useCallback((status: TestStatus) => {
    setState((prev) => ({
      ...prev,
      testStatus: status,
    }));
  }, []);

  const saveState = useCallback(() => {
    const payload = {
      userAnswers: state.userAnswers,
      markedQuestions: state.markedQuestions,
      remainingTimeMs: state.remainingTimeMs,
      currentModule: state.currentModule,
      currentQuestionIndex: state.currentQuestionIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `inProgressTest_${userId}_${testId}`,
      JSON.stringify(payload),
    );
  }, [
    state.userAnswers,
    state.markedQuestions,
    state.remainingTimeMs,
    state.currentModule,
    state.currentQuestionIndex,
    userId,
    testId,
  ]);

  const restoreState = useCallback(async () => {
    try {
      const stored = localStorage.getItem(`inProgressTest_${userId}_${testId}`);
      if (!stored) return false;

      const payload = JSON.parse(stored);
      setState((prev) => ({
        ...prev,
        userAnswers: payload.userAnswers || {},
        markedQuestions: payload.markedQuestions || {},
        remainingTimeMs: payload.remainingTimeMs || 1920000,
        currentModule: (payload.currentModule as TestModule) || 1,
        currentQuestionIndex: payload.currentQuestionIndex || 0,
      }));
      return true;
    } catch (error) {
      console.error("Failed to restore state:", error);
      return false;
    }
  }, [userId, testId]);

  // Computed properties
  const answeredCount = Object.keys(state.userAnswers).length;
  const markedCount = Object.values(state.markedQuestions).filter(
    Boolean,
  ).length;
  const isLastQuestion =
    state.currentQuestionIndex === questionsPerModule[state.currentModule] - 1;
  const isFirstQuestion = state.currentQuestionIndex === 0;
  const moduleSection: ModuleSection = state.currentModule <= 2 ? "RW" : "MATH";

  const value: TestContextValue = {
    ...state,
    // Actions
    setCurrentModule,
    setCurrentQuestionIndex,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    advanceToNextModule,
    setAnswer,
    toggleMarkForReview,
    decrementTimer,
    setRemainingTime,
    setPaused,
    setTimerRunning,
    resetRemainingTime,
    setFullscreenActive,
    setBreakActive,
    setTransitionActive,
    setNavigatorOpen,
    setCalculatorOpen,
    setReferenceOpen,
    setAnnotateActive,
    setTestStatus,
    saveState,
    restoreState,
    // Computed
    answeredCount,
    markedCount,
    isLastQuestion,
    isFirstQuestion,
    moduleSection,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

// ==================== HOOK ====================

export function useTestContext(): TestContextValue {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTestContext must be used within TestProvider");
  }
  return context;
}
