"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bug,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Maximize2,
  Send,
  FileCheck,
} from "lucide-react";
import { useTestContext } from "../context/TestContext";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  testId: string;
  testName?: string;
  moduleNumber: number;
  studentId: string;
}

export function BugReportModal({
  isOpen,
  onClose,
  question,
  testId,
  testName = "SAT Mock Test",
  moduleNumber,
  studentId,
}: BugReportModalProps): React.ReactElement | null {
  const { updateQuestion, trackBugReport } = useTestContext();
  const [issueType, setIssueType] = useState("wrong-answer");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    autoFixed?: boolean;
    autoFixDetails?: any;
    sourceVerified?: boolean;
    sourceReference?: string | null;
    updatedQuestion?: any;
    aiAnalysis?: any;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewZoomed, setPreviewZoomed] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(0);

  useEffect(() => {
    if (!isSubmitting) {
      setSubmittingStep(0);
      return;
    }
    const timer1 = setTimeout(() => setSubmittingStep(1), 2500);
    const timer2 = setTimeout(() => setSubmittingStep(2), 6500);
    const timer3 = setTimeout(() => setSubmittingStep(3), 11000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isSubmitting]);

  // Capture screen snapshot using html2canvas-pro (supports Tailwind v4 oklch colors)
  const captureScreen = useCallback(async () => {
    setIsCapturing(true);
    setCaptureError(null);

    try {
      // Dynamic import of html2canvas-pro to avoid any SSR issues
      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default;

      // Small delay to ensure layout is completely painted
      await new Promise((resolve) => setTimeout(resolve, 80));

      const targetEl =
        (document.getElementById("test-main-container") as HTMLElement) ||
        (document.querySelector("main") as HTMLElement) ||
        document.body;

      const canvas = await html2canvas(targetEl, {
        scale: 0.9,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        ignoreElements: (el) => {
          return (
            el.classList?.contains("bug-report-backdrop") ||
            el.classList?.contains("bug-report-modal") ||
            el.id === "bug-report-container"
          );
        },
      });

      const base64 = canvas.toDataURL("image/jpeg", 0.82);
      setScreenshot(base64);
    } catch (err: any) {
      console.warn("[BugReportModal] html2canvas-pro capture failed:", err);
      // Fallback: try capturing document.body directly
      try {
        const html2canvasModule = await import("html2canvas-pro");
        const html2canvas = html2canvasModule.default;
        const fallbackCanvas = await html2canvas(document.body, {
          scale: 0.75,
          useCORS: true,
          logging: false,
          ignoreElements: (el) => el.id === "bug-report-container",
        });
        setScreenshot(fallbackCanvas.toDataURL("image/jpeg", 0.75));
      } catch (fallbackErr: any) {
        console.error("[BugReportModal] Fallback screen capture failed:", fallbackErr);
        setCaptureError("Unable to capture screen automatically. You can still submit your report.");
      }
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // When modal opens, initialize and capture
  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setIssueType("wrong-answer");
      setSubmitResult(null);
      setErrorMessage(null);
      setPreviewZoomed(false);
      captureScreen();
    } else {
      setScreenshot(null);
      setSubmitResult(null);
    }
  }, [isOpen, captureScreen]);

  if (!isOpen) return null;

  const sectionName = moduleNumber <= 2 ? "Reading & Writing" : "Math";
  const moduleLabel =
    moduleNumber <= 2 ? `Module ${moduleNumber}` : `Module ${moduleNumber - 2}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage("Please provide a brief description of the issue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/student/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          testId,
          questionId: question?.id,
          issueType,
          message: message.trim(),
          screenshot,
          questionContext: {
            testName,
            testId,
            section: sectionName,
            module: moduleLabel,
            questionNumber: question?.questionNumber || 1,
            prompt: question?.prompt || "",
            passage: question?.passage || "",
            options: question?.options || {},
            correctAnswer: question?.correctAnswer || "",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit bug report.");
      }

      setSubmitResult(data);

      if (data.reportId && question?.id) {
        trackBugReport(data.reportId, question.id, question.questionNumber);
      }

      // Auto-close modal after 1.8 seconds so student can resume immediately without wasting time
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="bug-report-container"
      className="bug-report-backdrop fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bug-report-modal w-full max-w-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#181818]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBFF00]/15 border border-[#EBFF00]/40 flex items-center justify-center text-slate-900 dark:text-[#EBFF00] shadow-[0_0_15px_rgba(235,255,0,0.15)]">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Report an Issue
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {testName} • {sectionName} ({moduleLabel}) • Q{question?.questionNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {submitResult?.success ? (
          <div className="p-7 text-center space-y-4">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EBFF00]/15 border border-[#EBFF00]/40 flex items-center justify-center text-slate-900 dark:text-[#EBFF00] shadow-[0_0_20px_rgba(235,255,0,0.2)]">
                <CheckCircle2 className="w-8 h-8 text-yellow-500 dark:text-[#EBFF00]" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Issue Reported Successfully! 🎉
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Your report has been submitted. Our team and automated verification will review it against the original test document. You can now resume your test!
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(235,255,0,0.2)] hover:shadow-[0_0_20px_rgba(235,255,0,0.35)] transition-all cursor-pointer"
            >
              Resume Test
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Issue Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#EBFF00] transition-colors"
              >
                <option value="wrong-answer">❌ Wrong Answer Key</option>
                <option value="typo">📝 Typo / Text / Formula Error</option>
                <option value="image-issue">🖼️ Image Missing or Incorrect</option>
                <option value="passage">📄 Missing Passage or Stimulus</option>
                <option value="other">💬 Other Technical Issue</option>
              </select>
            </div>

            {/* Describe Issue */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Describe the issue
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="e.g., The correct answer should be B, not C because... / Formula fraction is not rendering properly..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#EBFF00] placeholder:text-slate-400 resize-none transition-colors"
              />
            </div>

            {/* Auto Screenshot Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-yellow-500 dark:text-[#EBFF00]" />
                  Automatic Screenshot
                </span>
                <button
                  type="button"
                  onClick={captureScreen}
                  disabled={isCapturing}
                  className="text-xs text-slate-600 dark:text-[#EBFF00] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isCapturing ? "animate-spin" : ""}`} />
                  Retake
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#161616] p-2.5 overflow-hidden flex items-center justify-center min-h-[110px]">
                {isCapturing ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-500 dark:text-[#EBFF00]" />
                    Capturing screen...
                  </div>
                ) : screenshot ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={screenshot}
                      alt="Screen Capture"
                      className="max-h-36 w-auto rounded-lg object-contain border border-slate-200 dark:border-white/10 shadow-sm"
                    />
                    <div className="mt-2 flex items-center justify-between w-full px-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Captured successfully
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewZoomed(!previewZoomed)}
                        className="hover:underline text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" /> Enlarge
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-400 py-4 font-semibold text-center">
                    {captureError || "Screen capture unavailable. You can still submit."}
                  </div>
                )}
              </div>
            </div>

            {/* Enlarged Screenshot Modal */}
            {previewZoomed && screenshot && (
              <div
                className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                onClick={() => setPreviewZoomed(false)}
              >
                <img
                  src={screenshot}
                  alt="Enlarged Screenshot"
                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                />
              </div>
            )}

            {/* Footer Buttons & Progress */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isSubmitting ? (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-[#EBFF00]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>
                      {submittingStep === 0 && "Testning asl PDF hujjati olinmoqda..."}
                      {submittingStep === 1 && "AI asl testdan ayni shu savolni qidirmoqda..."}
                      {submittingStep === 2 && "Matn va to'g'ri kalit solishtirilmoqda..."}
                      {submittingStep >= 3 && "Savol avtomatik to'g'irlanmoqda..."}
                    </span>
                  </div>
                ) : (
                  <span>AI asl manba PDF hujjati bilan solishtiradi</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(235,255,0,0.2)] hover:shadow-[0_0_20px_rgba(235,255,0,0.35)] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Tekshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
