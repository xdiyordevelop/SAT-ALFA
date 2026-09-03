"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PenTool,
  History,
  CreditCard,
  Target,
  LogOut,
  Menu,
  X,
  FileBarChart,
  GraduationCap,
  Clock,
  Settings,
  FileText,
  HelpCircle,
  Zap
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";

interface SidebarProps {
  username: string;
  role: string;
}

export function Sidebar({ username, role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const adminMenu = [
    {
      label: "Main",
      items: [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/students", icon: Users, label: "Students" },
        { href: "/admin/groups", icon: GraduationCap, label: "Groups" },
        { href: "/admin/payments", icon: CreditCard, label: "Payments" },
        { href: "/admin/attendance", icon: Clock, label: "Attendance" },
      ],
    },
    {
      label: "Academics",
      items: [
        { href: "/admin/topics", icon: BookOpen, label: "Topics & Lessons" },
        { href: "/admin/mock-tests", icon: PenTool, label: "Test Bank" },
        { href: "/admin/mock-tests/proctor", icon: Target, label: "Proctoring" },
        { href: "/admin/mock-tests/analytics", icon: FileBarChart, label: "Analytics" },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/articles", icon: FileText, label: "Articles & Reading" },
      ],
    },
  ];

  const studentMenu = [
    {
      label: "Study Portal",
      items: [
        { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/student/topics", icon: BookOpen, label: "Practice" },
        { href: "/student/mock-tests", icon: PenTool, label: "Mock Tests" },
        { href: "/student/articles", icon: FileText, label: "Reading Library" },
        { href: "/student/results", icon: History, label: "Results" },
        { href: "/student/payments", icon: CreditCard, label: "Payments" },
      ],
    },
  ];

  const menuGroups = role === "ADMIN" ? adminMenu : studentMenu;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="fixed top-3 left-4 z-[60] lg:hidden p-2 rounded-md bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-lg text-slate-700 dark:text-[#EBFF00] hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-[50]"
        />
      )}

      {/* Sidebar Container */}
      <nav
        className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-white/5 flex flex-col z-[55] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Profile Area */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex flex-col gap-4">
          <Link href={role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"} className="flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
              <Image
                src="/images/sat-alfa.jpg"
                alt="SAT ALFA Logo"
                fill
                className="object-contain p-0.5"
                sizes="32px"
              />
            </div>
            <h1 className="heading-5 text-slate-900 dark:text-white group-hover:text-[#EBFF00] transition-colors">
              SAT-ALFA
            </h1>
          </Link>

          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {role === "ADMIN" ? "Administrator" : "Student"}
              </p>
            </div>
          </div>

          {role === "STUDENT" && (
            <button className="w-full bg-[#EBFF00] text-slate-950 font-bold py-2.5 px-4 rounded-lg hover:bg-[#d4e600] active:bg-[#b8cc00] transition-all flex items-center justify-center gap-2 shadow-sm">
              <Zap className="w-4 h-4" /> Upgrade
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-6 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="flex flex-col gap-1 mt-2">
                {group.items.map((item) => {
                  const active =
                    pathname.startsWith(item.href) &&
                    ((item.href !== "/admin/dashboard" && item.href !== "/student/dashboard") ||
                      pathname === item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-3 px-4 py-2.5 flex items-center gap-3 rounded-lg transition-all duration-150 ${
                        active
                          ? "bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-[#EBFF00] border-l-2 border-[#EBFF00] font-semibold pl-[14px]"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20 font-medium border-l-2 border-transparent"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200 dark:border-white/5 px-3 py-4 flex flex-col gap-1">
          {role === "ADMIN" && (
            <Link
              href="/admin/settings"
              className="px-4 py-2.5 flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-lg transition-colors font-medium text-sm"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Settings</span>
            </Link>
          )}
          <Link
            href="#"
            className="px-4 py-2.5 flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-lg transition-colors font-medium text-sm"
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>Help Center</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors font-medium text-sm text-left disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
