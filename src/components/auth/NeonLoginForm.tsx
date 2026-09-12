"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User as UserIcon, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/server/actions/auth.actions";

export function NeonLoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            Username or Email
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder={role === "STUDENT" ? "Enter your username or email" : "Enter admin username or email"}
              className="w-full px-10 py-3 bg-white dark:bg-[#1c1b1b] border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00] focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Username or Email"
            />
            <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-3 bg-white dark:bg-[#1c1b1b] border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00] focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Password"
            />
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="group relative w-full mt-3 py-3.5 px-6 rounded-xl font-black text-sm tracking-wider uppercase text-slate-950 bg-[#EBFF00] hover:bg-[#d4e600] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#EBFF00]/20 hover:shadow-xl hover:shadow-[#EBFF00]/40 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none select-none cursor-pointer"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
