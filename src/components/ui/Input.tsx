import React from "react";
import { cn } from "@/lib/utils";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = "text", ...props }, ref) => (
    <div className="w-full">
      {" "}
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          {" "}
          {label}{" "}
        </label>
      )}{" "}
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full px-4 py-3 bg-white dark:bg-[#131313] border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 rounded-lg",
          "transition-colors duration-200",
          "focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className,
        )}
        {...props}
      />{" "}
      {error && (
        <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>
      )}{" "}
      {helperText && !error && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {helperText}
        </p>
      )}{" "}
    </div>
  ),
);
Input.displayName = "Input";
