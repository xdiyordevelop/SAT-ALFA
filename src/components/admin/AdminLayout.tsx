"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function AdminLayout({
  children,
  title,
  breadcrumbs = [],
  userName,
  userEmail,
  userRole = "ADMIN",
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar username={userName || "Admin"} role={userRole} />

      {/* Main Content Area with proper sidebar offset */}
      <div className="lg:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        {/* Top Header - fixed, offset from sidebar */}
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />

        {/* Page Content - offset from fixed navbar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden mt-16">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
