"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PinCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  className?: string;
}

export const PinCodeInput: React.FC<PinCodeInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = true,
  hasError = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const digits = value.split("").slice(0, length);
  while (digits.length < length) {
    digits.push("");
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "").slice(0, length);
    onChange(rawVal);
    if (rawVal.length === length && onComplete) {
      onComplete(rawVal);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, length);

    if (pastedData) {
      onChange(pastedData);
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      onClick={handleContainerClick}
      className={cn("relative cursor-text select-none", className)}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        onChange={handleInputChange}
        onPaste={handlePaste}
        disabled={disabled}
        className="absolute inset-0 opacity-0 w-full h-full cursor-default z-10"
        aria-label="Enter PIN code"
      />

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => {
          const isFilled = digit !== "";
          const isCurrent = idx === activeIndex && !disabled;

          return (
            <div
              key={idx}
              className={cn(
                "w-11 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-mono font-black transition-all duration-150 border-2 relative",
                // Base / Inactive state (light vs dark)
                "bg-slate-50 dark:bg-[#181818] border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40",
                // Filled state
                isFilled &&
                  "border-slate-800 dark:border-white/30 bg-white dark:bg-[#202020] text-slate-900 dark:text-[#EBFF00] shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] scale-[1.02]",
                // Active / Next-to-type state
                isCurrent &&
                  !hasError &&
                  "border-slate-900 dark:border-[#EBFF00] bg-slate-100 dark:bg-[#EBFF00]/10 text-slate-900 dark:text-white ring-2 ring-slate-900/10 dark:ring-[#EBFF00]/20 shadow-[0_0_15px_rgba(0,0,0,0.08)] dark:shadow-[0_0_15px_rgba(235,255,0,0.3)] scale-105",
                // Error state
                hasError &&
                  "border-rose-500/70 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {digit ? (
                <span className="animate-in zoom-in-75 duration-100">{digit}</span>
              ) : isCurrent ? (
                <span className="w-0.5 h-6 bg-slate-900 dark:bg-[#EBFF00] animate-pulse rounded-full" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/15" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
