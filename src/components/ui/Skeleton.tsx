import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  count = 1,
  height = "h-4",
  width = "w-full",
  circle = false,
  ...props
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800",
            "animate-pulse",
            circle ? "rounded-full" : "rounded-lg",
            height,
            width,
            i < count - 1 && "mb-3",
            className,
          )}
          {...props}
        />
      ))}
    </>
  );
};
Skeleton.displayName = "Skeleton";
