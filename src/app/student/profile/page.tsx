import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StudentProfileContent } from "@/components/student/StudentProfileContent";

export default async function StudentProfilePage() {
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

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const group = student.groupId
    ? await prisma.group.findUnique({
        where: { id: student.groupId },
      })
    : null;

  const serializedStudent = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    phone: student.phone,
    enrollmentDate: student.enrollmentDate.toISOString(),
    status: student.status,
    createdAt: student.createdAt.toISOString(),
  };

  const serializedGroup = group
    ? {
        id: group.id,
        name: group.name,
        course: group.course ?? undefined,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar
        username={session.username || "Student"}
        role={session.role || "STUDENT"}
      />

      <div className="lg:ml-64">
        <Topbar
          title="My Profile"
          breadcrumbs={[{ label: "Student" }, { label: "Profile" }]}
          userName={`${student.firstName} ${student.lastName}`}
          userEmail={user?.username}
          userRole={session.role}
        />

        <main className="pt-24 px-6 pb-12">
          <StudentProfileContent
            student={serializedStudent}
            user={user}
            group={serializedGroup}
          />
        </main>
      </div>
    </div>
  );
}
