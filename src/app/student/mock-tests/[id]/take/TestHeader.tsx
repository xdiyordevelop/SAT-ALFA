"use client";

import React, { useState } from "react";
import { useTestContext } from "../context/TestContext";
import { TimerDisplay } from "./TimerDisplay";
import { AnnotateColorPicker } from "./AnnotateTool";
import { Calculator, Edit3, BookOpen, Clock, Maximize, Bug } from "lucide-react";
import { useRequestFullscreen } from "./hooks/useFullscreenTracking";

interface TestHeaderProps {
  moduleNumber: 1 | 2 | 3 | 4;
  proctorCode: string | null | undefined;
  currentQuestionNumber: number;
  totalQuestionsInModule: number;
}

export function TestHeader({
  moduleNumber,
  proctorCode,
}: TestHeaderProps): React.ReactElement {
  const {
    remainingTimeMs,
    isPaused,
    isCalculatorOpen,
    setCalculatorOpen,
    isReferenceOpen,
    setReferenceOpen,
    isAnnotateActive,
    setAnnotateActive,
    setBugReportOpen,
    fontSize,
    setFontSize,
  } = useTestContext();

  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const requestFullscreen = useRequestFullscreen();

  const getSectionName = (): string => {
    return moduleNumber <= 2
      ? "Section 1: Reading and Writing"
      : "Section 2: Math";
  };

  const getSubTitle = (): string => {
    return moduleNumber <= 2
      ? `Module ${moduleNumber}`
      : `Module ${moduleNumber - 2}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#131313]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 h-[64px] flex items-center shrink-0 w-full transition-colors duration-300 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Branding & Module Info */}
        <div className="flex items-center gap-4">
          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-[#EBFF00] tracking-tighter">
            SAT-ALFA
          </span>
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-white/10">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-sm">
              {getSectionName()} <span className="opacity-50">/</span> {getSubTitle()}
            </span>
          </div>
          {proctorCode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE PROCTORING
            </div>
          )}
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="flex items-center justify-center bg-slate-100 dark:bg-[#1c1b1b] px-4 py-1.5 rounded-md border border-slate-200 dark:border-white/5 min-w-[120px] shadow-[0_0_10px_rgba(235,255,0,0.05)]">
            {!isTimerHidden ? (
              <TimerDisplay remainingTimeMs={remainingTimeMs} isPaused={isPaused} />
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">Hidden</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsTimerHidden(!isTimerHidden)}
            className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isTimerHidden ? "Show" : "Hide"}
          </button>
        </div>

        {/* Right: Tools Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => requestFullscreen()}
            className="flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>

          {/* Text Size (Aa) Toggle Button */}
          <button
            type="button"
            onClick={() => setFontSize(fontSize === "standard" ? "large" : "standard")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold cursor-pointer ${
              fontSize === "large"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                : "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-zinc-500 bg-transparent"
            }`}
            title={`Text Size: ${fontSize === "large" ? "Large (115%)" : "Standard (100%)"}. Click to toggle.`}
          >
            <span className="text-[13px] font-black tracking-tight">Aa</span>
            <span className="hidden md:inline text-[11px] font-semibold opacity-80">
              {fontSize === "large" ? "Large" : "Standard"}
            </span>
          </button>

          <AnnotateColorPicker />

          <button
            onClick={() => setAnnotateActive(!isAnnotateActive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold ${
              isAnnotateActive
                ? "bg-[#EBFF00]/10 dark:bg-[#EBFF00]/10 text-yellow-800 dark:text-[#EBFF00] border border-yellow-300 dark:border-[#EBFF00]/30 shadow-[0_0_10px_rgba(235,255,0,0.1)]"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] hover:text-slate-900 dark:hover:text-white"
            }`}
            title={isAnnotateActive ? "Highlighter active" : "Annotate"}
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline-block">Annotate</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-0.5 sm:mx-1"></div>

          <button
            onClick={() => setBugReportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-[#EBFF00] hover:bg-[#EBFF00]/15 dark:hover:bg-[#EBFF00]/15 border border-slate-300 dark:border-[#EBFF00]/30 hover:border-[#EBFF00] transition-all text-xs font-bold shadow-[0_0_10px_rgba(235,255,0,0.05)] cursor-pointer"
            title="Report an Issue (Wrong Answer, Typo, Missing Content)"
          >
            <Bug className="w-4 h-4 text-slate-800 dark:text-[#EBFF00] shrink-0" />
            <span className="hidden sm:inline-block">Report</span>
          </button>

          {moduleNumber >= 3 && (
            <>
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
              
              <button
                onClick={() => setReferenceOpen(!isReferenceOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold ${
                  isReferenceOpen
                    ? "bg-emerald-100 dark:bg-[#EBFF00]/10 text-emerald-800 dark:text-[#EBFF00] border border-emerald-300 dark:border-[#EBFF00]/30 shadow-[0_0_10px_rgba(235,255,0,0.1)]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Math Reference Sheet"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline-block">Reference</span>
              </button>

              <button
                onClick={() => setCalculatorOpen(!isCalculatorOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold ${
                  isCalculatorOpen
                    ? "bg-blue-100 dark:bg-[#EBFF00]/10 text-blue-800 dark:text-[#EBFF00] border border-blue-300 dark:border-[#EBFF00]/30 shadow-[0_0_10px_rgba(235,255,0,0.1)]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Desmos Graphing Calculator"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline-block">Calculator</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
