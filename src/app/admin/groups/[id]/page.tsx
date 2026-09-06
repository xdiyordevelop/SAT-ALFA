import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { canManagePayments } from "@/lib/permissions/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GroupDetailContent } from "@/components/admin/groups/GroupDetailContent";

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  const canManageBilling = canManagePayments(session);

  const { id } = await params;
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      studentProfiles: {
        include: {
          user: true,
          ...(canManageBilling ? { payments: { where: { month: currentMonth } } } : {}),
        },
        orderBy: { firstName: "asc" },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const otherStudents = await prisma.studentProfile.findMany({
    where: { status: "ACTIVE", groupId: null },
    include: {
      user: { select: { username: true } },
      group: { select: { name: true } },
    },
    orderBy: { firstName: "asc" },
  });

  return (
    <AdminLayout
      title="Group Details"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Groups", href: "/admin/groups" },
        { label: group.name },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <GroupDetailContent
        group={group}
        otherStudents={otherStudents}
        currentMonth={currentMonth}
        canManagePayments={canManageBilling}
      />
    </AdminLayout>
  );
}
