import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GroupDetailContent } from "@/components/admin/groups/GroupDetailContent";

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      studentProfiles: {
        include: { user: true, payments: { where: { month: currentMonth } } },
        orderBy: { firstName: "asc" },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const otherStudents = await prisma.studentProfile.findMany({
    where: { status: "ACTIVE", NOT: { groupId: id } },
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
      />
      <GroupDetailContent
        group={group}
        otherStudents={otherStudents}
        currentMonth={currentMonth}
      />
    </AdminLayout>
  );
}
