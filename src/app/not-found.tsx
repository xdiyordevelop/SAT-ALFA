import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
            <Search className="w-12 h-12 text-red-600 " />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
