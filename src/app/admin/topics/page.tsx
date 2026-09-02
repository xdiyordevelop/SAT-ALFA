import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Plus } from "lucide-react";
import Link from "next/link";
import TopicsDashboardClient from "./TopicsDashboardClient";

export default async function TopicsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ]">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Topics & Skills"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Academics" },
            { label: "Topics" },
          ]}
        />

        <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
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
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-lg font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Topic
            </Link>
          </div>

          <TopicsDashboardClient topics={topics} groups={groups} />
        </main>
      </div>
    </div>
  );
}
