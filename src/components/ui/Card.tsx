import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent = false, glass = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl p-6 transition-all duration-200",
        glass
          ? "bg-white dark:bg-[#131313]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-glass"
          : "bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10",
        accent && "border-l-4 border-l-yellow-400 shadow-brand",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";
