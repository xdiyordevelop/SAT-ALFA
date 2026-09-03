import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
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
    <StudentLayout
      title="My Profile"
      breadcrumbs={[{ label: "Student" }, { label: "Profile" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={user?.username}
    >
      <StudentProfileContent
        student={serializedStudent}
        user={user}
        group={serializedGroup}
      />
    </StudentLayout>
  );
}
