import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface AccessDeniedViewProps {
  title?: string;
  message?: string;
  requiredRole?: string;
}

export function AccessDeniedView({
  title = "Access Restricted",
  message = "You do not have permission to view or manage this section.",
  requiredRole,
}: AccessDeniedViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
        {message}
      </p>
      {requiredRole && (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 mb-6">
          Required Role: {requiredRole}
        </span>
      )}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d6e800] text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-transform active:scale-95 shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
