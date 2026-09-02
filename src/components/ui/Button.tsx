import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  {
    variants: {
      variant: {
        primary:
          "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 border border-amber-500 shadow-sm focus:ring-amber-500/50",
        secondary:
          "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-[#333333] focus:ring-slate-400/50",
        danger:
          "bg-red-600 text-white border border-red-700 hover:bg-red-700 focus:ring-red-600/50",
        ghost:
          "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] focus:ring-slate-400/50",
        outline:
          "bg-transparent text-amber-600 dark:text-amber-400 border-2 border-amber-500 hover:bg-amber-500/10 focus:ring-amber-500/50",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, children, disabled, ...props },
    ref,
  ) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || disabled}
      ref={ref}
      {...props}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
