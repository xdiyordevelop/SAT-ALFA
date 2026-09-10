"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
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

export interface SecurityAlertData {
  isOpen: boolean;
  exitCount: number;
  reason?: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | string;
  remaining?: number | null;
  isDisqualified: boolean;
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
  isBugReportOpen: boolean;
  autoFixNotification: {
    message: string;
    type: 'fixing' | 'success';
    questionNumber?: number;
  } | null;

  // Security & Proctoring
  fullscreenExitCount: number;
  securityAlert: SecurityAlertData | null;

  fontSize: 'standard' | 'large';

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
  setBugReportOpen: (open: boolean) => void;
  setTestStatus: (status: TestStatus) => void;
  setFullscreenExitCount: (count: number | ((prev: number) => number)) => void;
  setSecurityAlert: (
    alert: SecurityAlertData | null | ((prev: SecurityAlertData | null) => SecurityAlertData | null),
  ) => void;
  updateQuestion: (questionId: string, updatedData: Partial<any>) => void;
  trackBugReport: (reportId: string, questionId: string, questionNumber?: number) => void;
  clearAutoFixNotification: () => void;
  setFontSize: (size: 'standard' | 'large') => void;

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
  initialFullscreenExitCount?: number;
  realQuestions: any[];
  totalQuestions: number;
  questionsPerModule: Record<TestModule, number>;
  isRetake?: boolean;
}

export function TestProvider({
  children,
  testId,
  studentId,
  userId,
  proctorCode = null,
  initialFullscreenExitCount = 0,
  totalQuestions,
  questionsPerModule,
  realQuestions,
  isRetake = false,
}: TestProviderProps) {
  const availableModules = ([1, 2, 3, 4] as TestModule[]).filter(
    (m) => (questionsPerModule[m] || 0) > 0
  );
  const initialModule: TestModule = availableModules[0] || 1;

  const [state, setState] = useState<TestContextState>({
    testId,
    studentId,
    userId,
    proctorCode: proctorCode ?? null,
    currentModule: initialModule,
    currentQuestionIndex: 0,
    testStatus: "loading",
    userAnswers: {},
    markedQuestions: {},
    remainingTimeMs: initialModule >= 3 ? 2100000 : 1920000, // 35m for Math, 32m for RW
    isPaused: false,
    isTimerRunning: false,
    isFullscreenActive: false,
    isBreakActive: false,
    isTransitionActive: false,
    isNavigatorOpen: false,
    isCalculatorOpen: false,
    isReferenceOpen: false,
    isAnnotateActive: false,
    isBugReportOpen: false,
    autoFixNotification: null,
    fullscreenExitCount: initialFullscreenExitCount,
    securityAlert: null,
    fontSize: 'standard',
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
      const nextAvailable = ([1, 2, 3, 4] as TestModule[]).find(
        (m) => m > prev.currentModule && (questionsPerModule[m] || 0) > 0
      );
      if (nextAvailable) {
        return {
          ...prev,
          currentModule: nextAvailable,
          currentQuestionIndex: 0,
          isCalculatorOpen: nextAvailable >= 3, // Auto-open for Math modules
          remainingTimeMs: nextAvailable >= 3 ? 2100000 : 1920000,
        };
      }
      return prev;
    });
  }, [questionsPerModule]);

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

  const setBugReportOpen = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isBugReportOpen: open,
    }));
  }, []);

  const setTestStatus = useCallback((status: TestStatus) => {
    setState((prev) => ({
      ...prev,
      testStatus: status,
    }));
  }, []);

  const setFullscreenExitCount = useCallback(
    (count: number | ((prev: number) => number)) => {
      setState((prev) => ({
        ...prev,
        fullscreenExitCount:
          typeof count === "function" ? count(prev.fullscreenExitCount) : count,
      }));
    },
    [],
  );

  const setSecurityAlert = useCallback(
    (
      alert:
        | SecurityAlertData
        | null
        | ((prev: SecurityAlertData | null) => SecurityAlertData | null),
    ) => {
      setState((prev) => ({
        ...prev,
        securityAlert: typeof alert === "function" ? alert(prev.securityAlert) : alert,
      }));
    },
    [],
  );

  const updateQuestion = useCallback(
    (questionId: string, updatedData: Partial<any>) => {
      setState((prev) => ({
        ...prev,
        realQuestions: prev.realQuestions.map((q) => {
          if (q.id === questionId) {
            let optionsObj = updatedData.options !== undefined ? updatedData.options : q.options;
            if (typeof optionsObj === "string") {
              try {
                optionsObj = JSON.parse(optionsObj);
              } catch (e) {}
            }
            return {
              ...q,
              ...updatedData,
              options: optionsObj,
            };
          }
          return q;
        }),
      }));
    },
    [],
  );

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
    if (isRetake) {
      try {
        localStorage.removeItem(`inProgressTest_${userId}_${testId}`);
        localStorage.removeItem(`completedTest_${userId}_${testId}`);
      } catch {}
      return false;
    }

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

  // ==================== LIVE BUG REPORT AUTO-FIX SYNC ====================
  const [trackedReports, setTrackedReports] = useState<
    Array<{ reportId: string; questionId: string; startedAt: number; questionNumber?: number }>
  >([]);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const trackBugReport = useCallback(
    (reportId: string, questionId: string, questionNumber?: number) => {
      setTrackedReports((prev) => [
        ...prev,
        { reportId, questionId, startedAt: Date.now(), questionNumber },
      ]);
      setState((prev) => ({
        ...prev,
        autoFixNotification: {
          message: `🤖 AI ground-truth analysis running for Question #${questionNumber || ""}...`,
          type: "fixing",
          questionNumber,
        },
      }));
    },
    [],
  );

  const clearAutoFixNotification = useCallback(() => {
    setState((prev) => ({ ...prev, autoFixNotification: null }));
  }, []);

  useEffect(() => {
    if (trackedReports.length === 0) return;

    const intervalId = setInterval(async () => {
      const now = Date.now();
      const nextActive: typeof trackedReports = [];

      for (const item of trackedReports) {
        if (now - item.startedAt > 90000) {
          // Timeout tracking after 90 seconds
          continue;
        }

        try {
          const res = await fetch(`/api/student/bug-report?reportId=${item.reportId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "resolved" && data.question) {
              // Real-time in-place update!
              updateQuestion(item.questionId, data.question);

              setState((prev) => ({
                ...prev,
                autoFixNotification: {
                  message: `✨ Question #${data.question.questionNumber || item.questionNumber || ""} auto-corrected and updated with verified source content!`,
                  type: "success",
                  questionNumber: data.question.questionNumber || item.questionNumber,
                },
              }));

              if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
              notificationTimerRef.current = setTimeout(() => {
                setState((prev) => ({ ...prev, autoFixNotification: null }));
              }, 7000);

              continue; // Resolved, remove from tracking
            }
          }
        } catch (e) {
          console.warn("[BugReportSync] Error polling report status:", e);
        }

        nextActive.push(item);
      }

      setTrackedReports(nextActive);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [trackedReports, updateQuestion]);

  const setFontSize = useCallback((size: 'standard' | 'large') => {
    setState((prev) => ({ ...prev, fontSize: size }));
    try {
      localStorage.setItem('sat_alfa_font_size', size);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sat_alfa_font_size');
      if (saved === 'standard' || saved === 'large') {
        setState((prev) => ({ ...prev, fontSize: saved }));
      }
    } catch {}
  }, []);

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
    setBugReportOpen,
    setTestStatus,
    setFullscreenExitCount,
    setSecurityAlert,
    updateQuestion,
    trackBugReport,
    clearAutoFixNotification,
    setFontSize,
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
