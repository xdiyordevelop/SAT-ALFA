"use client";
interface LoadingSkeletonProps {
  type?: "card" | "table" | "list" | "text" | "avatar";
  count?: number;
  className?: string;
}
export function LoadingSkeleton({
  type = "card",
  count = 3,
  className = "",
}: LoadingSkeletonProps) {
  if (type === "text") {
    return (
      <div className={`space-y-3 ${className}`}>
        {" "}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-neutral-200 rounded animate-pulse"
            style={{ width: `${((i * 17) % 30) + 70}%` }}
          />
        ))}{" "}
      </div>
    );
  }
  if (type === "avatar") {
    return (
      <div className={`flex gap-3 ${className}`}>
        {" "}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse"
          />
        ))}{" "}
      </div>
    );
  }
  if (type === "list") {
    return (
      <div className={`space-y-4 ${className}`}>
        {" "}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-slate-200 dark:border-white/10 space-y-3"
          >
            {" "}
            <div className="h-4 bg-neutral-200 rounded w-1/3 animate-pulse" />{" "}
            <div className="h-3 bg-neutral-200 rounded w-2/3 animate-pulse" />{" "}
            <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse" />{" "}
          </div>
        ))}{" "}
      </div>
    );
  }
  if (type === "table") {
    return (
      <div className={`space-y-3 ${className}`}>
        {" "}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border border-slate-200 dark:border-white/10 rounded-lg"
          >
            {" "}
            <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse flex-shrink-0" />{" "}
            <div className="flex-1 space-y-2">
              {" "}
              <div className="h-4 bg-neutral-200 rounded w-1/4 animate-pulse" />{" "}
              <div className="h-3 bg-neutral-200 rounded w-1/3 animate-pulse" />{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>
    );
  }
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {" "}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4"
        >
          {" "}
          <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />{" "}
          <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />{" "}
          <div className="h-8 bg-neutral-200 rounded animate-pulse" />{" "}
          <div className="h-3 bg-neutral-200 rounded w-2/3 animate-pulse" />{" "}
        </div>
      ))}{" "}
    </div>
  );
}
