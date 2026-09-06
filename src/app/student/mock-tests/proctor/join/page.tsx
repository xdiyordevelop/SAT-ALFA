import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import JoinProctorClient from "./JoinProctorClient";

export default async function JoinProctorPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  const userName = student
    ? `${student.firstName} ${student.lastName}`.trim()
    : session.username;

  return (
    <StudentLayout
      title="Join Live Exam"
      breadcrumbs={[
        { label: "Student" },
        { label: "Mock Examinations", href: "/student/mock-tests" },
        { label: "Live Exam PIN" },
      ]}
      userName={userName}
      userEmail={session.username || ""}
    >
      <JoinProctorClient />
    </StudentLayout>
  );
}
