import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import EditTopicClient from "./EditTopicClient";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Curriculum Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Topics", href: "/admin/topics" },
          { label: "Edit" },
        ]}
        userName={session.username}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Curriculum Authoring Restricted"
          message="Editing syllabus topics and course materials is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { groupProgress: true },
  });
  if (!topic) {
    redirect("/admin/topics");
  }
  return (
    <EditTopicClient
      topic={topic}
      username={session.username}
      role={session.role}
    />
  );
}
