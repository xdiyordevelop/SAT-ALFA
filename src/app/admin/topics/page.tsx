import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import { Plus } from "lucide-react";
import Link from "next/link";
import TopicsDashboardClient from "./TopicsDashboardClient";

export default async function TopicsPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academics" },
          { label: "Topics" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Curriculum & Topics Restricted"
          message="Managing syllabus roadmaps, curriculum topics, and practice questions is restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  // Fetch all topics
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Fetch all groups with their syllabus progress
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      groupProgress: {
        orderBy: { order: "asc" },
        include: {
          topic: true,
        },
      },
    },
  });

  return (
    <AdminLayout
      title="Topics & Skills"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Academics" },
        { label: "Topics" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      {/* Page Header */}
          <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Topics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 ">
                Manage topic repository and group-specific learning roadmaps.
              </p>
            </div>
            <Link
              href="/admin/topics/create"
              className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-lg font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Topic
            </Link>
          </div>

          <TopicsDashboardClient topics={topics} groups={groups} />
    </AdminLayout>
  );
}
