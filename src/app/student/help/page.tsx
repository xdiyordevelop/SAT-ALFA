import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { StudentHelpCenterClient } from "@/components/student/help/StudentHelpCenterClient";

export const metadata = {
  title: "Help Center | SAT-ALFA Student",
  description: "Frequently asked questions, Digital SAT guides, and student support",
};

export default async function StudentHelpPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  const studentName = student
    ? `${student.firstName} ${student.lastName}`.trim() || session.username
    : session.username;

  return (
    <StudentLayout
      title="Help Center"
      breadcrumbs={[
        { label: "Dashboard", href: "/student/dashboard" },
        { label: "Help Center" },
      ]}
      userName={studentName}
      userEmail={session.username}
    >
      <StudentHelpCenterClient
        studentProfileId={student?.id}
        studentName={studentName}
      />
    </StudentLayout>
  );
}
