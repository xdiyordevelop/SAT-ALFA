"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";
import { loginAction } from "@/server/actions/auth.actions";

export function NeonLoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: "STUDENT" | "ADMIN") => {
    setRole(newRole);
    setError("");
    setUsername("");
    setPassword("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await loginAction({ username, password });
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.redirectUrl) {
        router.push(res.redirectUrl);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 relative z-10 transition-all duration-300 shadow-lg">

      {/* Role Selector */}
      <div className="flex gap-1 bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg mb-8 border border-slate-200 dark:border-white/5">
        <button
          type="button"
          onClick={() => handleRoleChange("STUDENT")}
          className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-md transition-all duration-300 ${
            role === "STUDENT"
              ? "bg-[#EBFF00] text-black shadow-lg shadow-[#EBFF00]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2a2a2a]"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange("ADMIN")}
          className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-md transition-all duration-300 ${
            role === "ADMIN"
              ? "bg-[#EBFF00] text-black shadow-lg shadow-[#EBFF00]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2a2a2a]"
          }`}
        >
          Admin
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Sign In
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {role === "STUDENT"
            ? "Access your learning portal"
            : "Admin control panel"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-400 dark:border-rose-500 rounded-lg flex items-start gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email or Username
          </label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder={role === "STUDENT" ? "Enter your phone or ID" : "Enter admin username"}
              className="input-primary pl-12"
              aria-label="Username"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <a
              href="#"
              className="text-xs text-slate-500 hover:text-[#EBFF00] transition-colors font-medium"
              onClick={(e) => e.preventDefault()}
              title="Coming soon"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              className="input-primary pl-12"
              aria-label="Password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="btn-primary mt-2 w-full flex justify-center items-center gap-2"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Footer Text */}
      <p className="text-[11px] text-slate-600 text-center mt-8 font-medium">
        🔒 Secure connection • Unauthorized access prohibited
      </p>
    </div>
  );
}
