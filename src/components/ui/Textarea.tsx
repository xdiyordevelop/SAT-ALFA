"use client";

import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 text-slate-900 dark:text-white bg-white dark:bg-[#131313] placeholder-neutral-400 resize-vertical ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-slate-200 dark:border-white/10 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
