import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#EBFF00] hover:bg-[#d4e600] active:bg-[#b8cc00] text-slate-950 border border-[#EBFF00] shadow-sm hover:shadow-md focus:ring-[#EBFF00]/50 font-bold",
        secondary:
          "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-[#333333] focus:ring-slate-400/50",
        danger:
          "bg-red-600 text-white border border-red-700 hover:bg-red-700 focus:ring-red-600/50",
        ghost:
          "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] focus:ring-slate-400/50",
        outline:
          "bg-transparent text-[#EBFF00] dark:text-[#EBFF00] border-2 border-[#EBFF00] hover:bg-[#EBFF00]/10 focus:ring-[#EBFF00]/50",
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
