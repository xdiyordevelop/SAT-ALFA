"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, User as UserIcon, ArrowRight } from "lucide-react";
import { loginAction } from "@/server/actions/auth.actions";

export function NeonLoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
      setError("Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm glass card-shadow p-6 sm:p-8 rounded-xl bg-white/90 dark:bg-[#131313]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 relative z-10 transition-colors duration-300">
      
      {/* Role Switcher */}
      <div className="flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg mb-8 border border-slate-200 dark:border-white/5">
        <button
          type="button"
          onClick={() => { setRole("STUDENT"); setError(""); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
            role === "STUDENT"
              ? "bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          O'quvchi
        </button>
        <button
          type="button"
          onClick={() => { setRole("ADMIN"); setError(""); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
            role === "ADMIN"
              ? "bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Admin
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Tizimga kirish</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {role === "STUDENT" ? "O'quvchi portaliga xush kelibsiz" : "Boshqaruv paneliga xush kelibsiz"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1" htmlFor="username">
            Login
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </span>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === "STUDENT" ? "Telefon raqam yoki ID" : "Admin login"}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] dark:focus:shadow-[0_0_8px_rgba(235,255,0,0.3)] transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="password">
              Parol
            </label>
            <a href="#" className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-[#EBFF00] transition-colors">
              Parolni unutdingizmi?
            </a>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </span>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] dark:focus:shadow-[0_0_8px_rgba(235,255,0,0.3)] transition-all duration-300"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full bg-[#EBFF00] text-black font-bold py-3.5 rounded-lg hover:bg-[#d4e600] active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 mt-2 shadow-[0_0_15px_rgba(235,255,0,0.15)] hover:shadow-[0_0_25px_rgba(235,255,0,0.3)] disabled:opacity-70 disabled:active:scale-100 disabled:hover:bg-[#EBFF00]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Kirish <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
      
      {role === "STUDENT" && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hisobingiz yo'qmi? <a href="#" className="text-slate-900 dark:text-[#EBFF00] font-bold hover:underline">Ro'yxatdan o'tish</a>
          </p>
        </div>
      )}
    </div>
  );
}
