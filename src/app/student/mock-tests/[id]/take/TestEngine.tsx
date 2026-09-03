"use client";

import React, { useEffect, useState } from "react";
import { useTestContext } from "../context/TestContext";
import {
  useAnswerTracking,
  useRestoreTestState,
} from "./hooks/useAnswerTracking";
import { useModuleTimer } from "./hooks/useModuleTimer";
import { useTimerInitialization } from "./hooks/useTimerInitialization";
import { useProctorSync } from "./hooks/useProctorSync";
import {
  useFullscreenTracking,
  useRequestFullscreen,
} from "./hooks/useFullscreenTracking";
import { useAnnotateTool } from "./AnnotateTool";
import { TestHeader } from "./TestHeader";
import { TestFooter } from "./TestFooter";
import { StimulusPane } from "./StimulusPane";
import { QuestionPane } from "./QuestionPane";
import { CalculatorWidget } from "./CalculatorWidget";
import { ReferenceModal } from "./ReferenceModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { BreakScreen } from "./BreakScreen";
import { ModuleTransitionOverlay } from "./ModuleTransitionOverlay";
import { QuestionNavigatorModal } from "./QuestionNavigatorModal";
import { FullscreenWarning } from "./FullscreenWarning";
import { Maximize2, ShieldAlert } from "lucide-react";

interface TestEngineProps {
  testId: string;
  studentId: string;
  userId: string;
  proctorCode?: string | null;
}

export function TestEngine({
  testId,
  studentId,
  userId,
  proctorCode = null,
}: TestEngineProps): React.ReactElement {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [preFlightPassed, setPreFlightPassed] = useState(false);

  const {
    currentModule,
    currentQuestionIndex,
    testStatus,
    setTestStatus,
    restoreState,
    realQuestions,
    isFullscreenActive,
    setFullscreenActive,
    setPaused,
  } = useTestContext();

  useAnswerTracking(userId, testId);
  useProctorSync(proctorCode);
  useTimerInitialization();
  useModuleTimer(userId, testId);
  useFullscreenTracking(userId, testId);
  useAnnotateTool();

  const requestFullscreen = useRequestFullscreen();

  useEffect(() => {
    const restore = async () => {
      setIsRestoringState(true);
      try {
        await restoreState();
      } catch (error) {
        console.error("Failed to restore test state:", error);
      } finally {
        setIsRestoringState(false);
        setIsHydrated(true);
      }
    };
    restore();
  }, [restoreState, realQuestions]);

  const startExam = async () => {
    try {
      await requestFullscreen();
      setFullscreenActive(true);
      setTestStatus("testing");
      setPaused(false);
      setPreFlightPassed(true);
    } catch (err) {
      console.error("Could not start fullscreen", err);
      alert(
        "Your browser blocked fullscreen mode. Please click again or allow fullscreen permissions.",
      );
    }
  };

  if (!isHydrated || isRestoringState) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Skeleton count={3} height="h-12" width="w-64" />
          <p className="text-slate-500 dark:text-slate-400 mt-6 font-bold uppercase tracking-widest text-xs">
            Test muhiti yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // Pre-Flight Fullscreen Modal
  if (!preFlightPassed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00] dark:bg-[#EBFF00] opacity-10 blur-[40px]"></div>
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#1c1b1b] rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-slate-900 dark:text-[#EBFF00]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
            Xavfsizlik Tekshiruvi
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium text-sm leading-relaxed relative z-10">
            Digital SAT to'liq ekran (Fullscreen) rejimini talab qiladi. Ekrandan chiqish yoki boshqa oynaga o'tish qoidabuzarlik sifatida qayd etiladi.
          </p>
          <button
            onClick={startExam}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-[#EBFF00] dark:bg-[#EBFF00] text-slate-950 hover:bg-[#d9ff00] dark:hover:bg-white shadow-[0_0_15px_rgba(235,255,0,0.15)] relative z-10"
          >
            <Maximize2 className="w-5 h-5" /> To'liq ekranga o'tish va Boshlash
          </button>
        </div>
      </div>
    );
  }

  const moduleQuestions = realQuestions.filter(
    (q: any) => q.module === currentModule,
  );
  const currentQuestion = moduleQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-600 text-lg font-bold">Savol topilmadi</p>
        </div>
      </div>
    );
  }

  const hasStimulus = !!currentQuestion.passage || !!currentQuestion.imageUrl;

  return (
    <div className="h-screen bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-[#EBFF00] dark:selection:bg-[#EBFF00] selection:text-slate-950">
      <TestHeader
        moduleNumber={currentModule}
        proctorCode={proctorCode}
        currentQuestionNumber={currentQuestion.questionNumber}
        totalQuestionsInModule={moduleQuestions.length}
      />
      <main className="flex-1 flex overflow-hidden">
        {hasStimulus ? (
          <>
            <div className="w-1/2 h-full overflow-y-auto p-6 lg:p-10 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131313] custom-scrollbar relative">
              <div className="max-w-2xl mx-auto">
                <StimulusPane
                  passage={currentQuestion.passage}
                  imageUrl={currentQuestion.imageUrl}
                  imagePosition={currentQuestion.imagePosition}
                />
              </div>
            </div>
            <div className="w-1/2 h-full overflow-y-auto p-6 lg:p-10 bg-white dark:bg-[#0a0a0a] custom-scrollbar flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full">
                <QuestionPane
                  question={currentQuestion}
                  moduleNumber={currentModule}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full overflow-y-auto p-6 lg:p-10 bg-white dark:bg-[#0a0a0a] custom-scrollbar flex flex-col justify-center">
            <div className="max-w-3xl mx-auto w-full">
              <QuestionPane
                question={currentQuestion}
                moduleNumber={currentModule}
              />
            </div>
          </div>
        )}
      </main>
      <FullscreenWarning />
      <ModuleTransitionOverlay />
      <BreakScreen />
      <QuestionNavigatorModal />
      {/* Floating Tools */}
      <CalculatorWidget />
      <ReferenceModal />
      <TestFooter
        currentQuestionNumber={currentQuestion.questionNumber}
        totalQuestionsInModule={moduleQuestions.length}
        canGoPrevious={currentQuestionIndex > 0}
        canGoNext={true}
        isLastQuestionOfModule={
          currentQuestionIndex === moduleQuestions.length - 1
        }
        isLastQuestionOfTest={
          currentModule === 4 &&
          currentQuestionIndex === moduleQuestions.length - 1
        }
      />
    </div>
  );
}
