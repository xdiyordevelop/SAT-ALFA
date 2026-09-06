import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { getUserNotifications } from "@/server/actions/notification.actions";
import { StudentNotificationsClient } from "@/components/student/StudentNotificationsClient";

export const metadata = {
  title: "Notifications | SAT-ALFA Student",
  description: "All notifications and announcements",
};

export default async function StudentNotificationsPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const [student, notificationsData] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId: session.userId },
      select: { firstName: true, lastName: true },
    }),
    getUserNotifications({ limit: 100 }),
  ]);

  const studentName = student
    ? `${student.firstName} ${student.lastName}`.trim() || session.username
    : session.username;

  return (
    <StudentLayout
      title="Notifications"
      breadcrumbs={[
        { label: "Dashboard", href: "/student/dashboard" },
        { label: "Notifications" },
      ]}
      userName={studentName}
      userEmail={session.username}
    >
      <StudentNotificationsClient
        initialNotifications={notificationsData.notifications}
        initialUnreadCount={notificationsData.unreadCount}
      />
    </StudentLayout>
  );
}
