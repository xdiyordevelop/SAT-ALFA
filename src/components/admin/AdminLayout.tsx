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

      {/* Main Content Area - explicit offset from fixed sidebar */}
      <div className="ml-0 lg:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        {/* Top Header */}
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
