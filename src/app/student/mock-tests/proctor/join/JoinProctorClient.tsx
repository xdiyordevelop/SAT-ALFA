"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { PinCodeInput } from "@/components/ui/PinCodeInput";
import { verifyProctoredCodeAction } from "@/server/actions/proctor-actions";

export default function JoinProctorClient() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, customPin?: string) => {
    if (e) e.preventDefault();
    const pinToUse = customPin || pin;
    const cleanPin = pinToUse.trim().replace(/[^0-9]/g, "");
    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit numeric exam PIN.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await verifyProctoredCodeAction(cleanPin);
      if (res.success && res.satTestId && res.sessionId) {
        router.push(
          `/student/mock-tests/${res.satTestId}/take?proctorSessionId=${res.sessionId}&code=${cleanPin}`
        );
      } else {
        setError(res.error || "Failed to join exam session. Please check the code.");
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <Link
        href="/student/mock-tests"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
      </Link>

      <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#181818] dark:to-[#0f0f0f] border border-slate-200 dark:border-white/15 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow Orbs (dark mode only) */}
        <div className="hidden dark:block absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#EBFF00]/10 blur-3xl pointer-events-none" />
        <div className="hidden dark:block absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#EBFF00]/10 border border-slate-200 dark:border-[#EBFF00]/25 text-slate-800 dark:text-[#EBFF00] text-xs font-black uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#EBFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#EBFF00]"></span>
            </span>
            Live Exam Session
          </div>
        </div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#EBFF00] mb-3 shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Join Live Exam
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Enter the 6-digit exam PIN displayed on the classroom screen or provided by your proctor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <PinCodeInput
              value={pin}
              onChange={(val) => {
                setPin(val);
                if (error) setError(null);
              }}
              onComplete={(completedPin) => {
                handleSubmit(undefined, completedPin);
              }}
              hasError={Boolean(error)}
              disabled={isVerifying}
            />
            <div className="flex justify-between items-center px-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Numeric digits only</span>
              {pin.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPin("");
                    setError(null);
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || pin.length !== 6}
            className="w-full py-4 px-6 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-base flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(235,255,0,0.25)] active:scale-[0.98]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying PIN...
              </>
            ) : (
              "Enter Exam Room"
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted & secure live examination session</span>
          </div>
        </form>
      </div>
    </div>
  );
}
