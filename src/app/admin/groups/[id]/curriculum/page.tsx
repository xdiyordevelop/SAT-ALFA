import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import RoadmapClient from "./RoadmapClient";
export default async function GroupTopicsRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }
  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      groupProgress: { orderBy: { order: "asc" }, include: { topic: true } },
    },
  });
  if (!group) {
    redirect("/admin/groups");
  }
  const allTopics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <AdminLayout
      title="Group Roadmap"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Groups" },
        { label: group.name },
        { label: "Roadmap" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Syllabus Roadmap: {group.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage the learning progression, approve completed lessons, and
          organize the curriculum.
        </p>
      </div>
      <RoadmapClient
        groupId={group.id}
        initialProgress={group.groupProgress}
        allTopics={allTopics}
      />
    </AdminLayout>
  );
}
