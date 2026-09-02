import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StudentsListClient } from "@/components/admin/students/StudentsListClient";

export default async function StudentsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const studentsWithUsers = await prisma.studentProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      group: true,
    },
  });

  const userIds = studentsWithUsers.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));
  const students = studentsWithUsers.map((s) => ({
    ...s,
    user: userMap.get(s.userId)!,
  }));

  return (
    <AdminLayout
      title="Students"
      breadcrumbs={[{ label: "Admin" }, { label: "Students" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <StudentsListClient students={students} groups={groups} />
    </AdminLayout>
  );
}
