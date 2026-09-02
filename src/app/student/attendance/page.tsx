import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StudentAttendanceContent } from "@/components/student/StudentAttendanceContent";

export default async function StudentAttendancePage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!student) {
    redirect("/login");
  }

  const rawAttendance = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: "desc" },
  });

  const attendance = rawAttendance.map((a) => ({
    id: a.id,
    date: a.date.toISOString(),
    status: a.status,
    note: a.note ?? undefined,
  }));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar
        username={session.username || "Student"}
        role={session.role || "STUDENT"}
      />

      <div className="lg:ml-64">
        <Topbar
          title="My Attendance"
          breadcrumbs={[{ label: "Student" }, { label: "Attendance" }]}
          userName={`${student.firstName} ${student.lastName}`}
          userEmail={user?.username}
          userRole={session.role}
        />

        <main className="pt-24 px-6 pb-12">
          <StudentAttendanceContent attendance={attendance} />
        </main>
      </div>
    </div>
  );
}
