"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, User, Menu } from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AdminTopNav({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/login");
  };

  return (
    <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-40">
      <div className="flex justify-between items-center w-full px-6 py-3">

        {/* Left: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-colors">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h2>
        </div>

        {/* Right: Global Controls */}
        <div className="flex items-center gap-4">

          <ThemeToggle />

          {/* Notifications */}
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] hover:bg-slate-100 dark:hover:bg-[#1c1b1b] rounded-lg transition-colors relative">
             <Bell className="w-5 h-5" />
             <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-3 bg-slate-100 dark:bg-[#131313] hover:bg-slate-200 dark:hover:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#1c1b1b] flex items-center justify-center text-white">
                 <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm hidden sm:block text-slate-900 dark:text-white">{userName || "Admin"}</span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1b1b]">
                    <p className="font-bold text-slate-900 dark:text-white">{userName || "Admin"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "admin@sat-alfa.uz"}</p>
                  </div>
                  <div className="p-2">
                     <Link href="/admin/settings/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg">
                        Profile Settings
                     </Link>
                     <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-left mt-1"
                     >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Signing out..." : "Sign Out"}
                     </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
