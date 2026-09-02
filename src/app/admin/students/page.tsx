import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <Sidebar username={session.username} role={session.role} />

      <div className="flex flex-col min-h-screen">
        <Topbar
          title="Talabalar"
          breadcrumbs={[{ label: "Admin" }, { label: "Talabalar" }]}
          userName={session.username}
          userEmail={session.username || ""}
          userRole={session.role}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col w-full">
          <StudentsListClient students={students} groups={groups} />
        </main>
      </div>
    </div>
  );
}
