"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, User } from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";

export function AdminTopNav({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/login");
  };

  const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon: string }) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`block px-4 py-2 font-bold transition-colors ${
          isActive
            ? "text-slate-900 dark:text-[#EBFF00] bg-slate-100 dark:bg-[#2a2a2a]"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-[#EBFF00] hover:bg-slate-100 dark:hover:bg-[#2a2a2a]"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-full">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-[#131313] border-2 border-slate-900 dark:border-[#EBFF00] flex items-center justify-center">
              <span className="font-black text-white dark:text-[#EBFF00] text-lg">S-A</span>
            </div>
            <span className="font-black text-xl text-slate-900 dark:text-[#EBFF00] tracking-tighter">SAT-ALFA</span>
          </Link>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex gap-6 items-center ml-4">
            {/* Main Group */}
            <div className="relative group">
              <button className="text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-[#EBFF00] pb-1 font-bold flex items-center gap-1 transition-colors">
                Asosiy <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-2">
                  <NavLink href="/admin/dashboard" icon="dashboard">Dashboard</NavLink>
                  <NavLink href="/admin/students" icon="group">Talabalar</NavLink>
                  <NavLink href="/admin/groups" icon="groups">Guruhlar</NavLink>
                  <NavLink href="/admin/payments" icon="payments">To'lovlar</NavLink>
                  <NavLink href="/admin/attendance" icon="fact_check">Davomat</NavLink>
                </div>
              </div>
            </div>

            {/* Academics Group */}
            <div className="relative group">
              <button className="text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-[#EBFF00] pb-1 font-bold flex items-center gap-1 transition-colors">
                Akademik <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-2">
                  <NavLink href="/admin/topics" icon="book">Mavzular</NavLink>
                  <NavLink href="/admin/mock-tests" icon="quiz">Test Banki</NavLink>
                  <NavLink href="/admin/mock-tests/proctor" icon="visibility">Jonli Nazorat</NavLink>
                </div>
              </div>
            </div>

            {/* Other Group */}
            <div className="relative group">
              <button className="text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-[#EBFF00] pb-1 font-bold flex items-center gap-1 transition-colors">
                Tizim <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-2">
                  <NavLink href="/admin/articles" icon="article">Maqolalar</NavLink>
                  <NavLink href="/admin/sms-notifications" icon="sms">SMS</NavLink>
                  <NavLink href="/admin/settings" icon="settings">Sozlamalar</NavLink>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-full transition-colors relative">
             <Bell className="w-5 h-5" />
             <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-3 bg-slate-100 dark:bg-[#131313] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] border border-slate-200 dark:border-white/5 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#1c1b1b] flex items-center justify-center text-white">
                 <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm hidden sm:block text-slate-900 dark:text-white">{userName || "Admin"}</span>
            </button>
            
            {/* Profile Dropdown */}
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
                        Profil sozlamalari
                     </Link>
                     <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-left mt-1"
                     >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Chiqilmoqda..." : "Tizimdan chiqish"}
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
