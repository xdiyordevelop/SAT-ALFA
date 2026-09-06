import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/permissions/auth";
import {
  getNotificationTargetOptions,
  getRecentNotificationsHistory,
} from "@/server/actions/notification.actions";
import { NotificationsManagementClient } from "@/components/admin/notifications/NotificationsManagementClient";

export const metadata = {
  title: "Notifications Hub | SAT-ALFA Admin",
  description: "Manage and dispatch in-app notifications and announcements",
};

export default async function AdminNotificationsPage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  const [{ groups, students }, history] = await Promise.all([
    getNotificationTargetOptions(),
    getRecentNotificationsHistory(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationsManagementClient
        groups={groups}
        students={students}
        initialHistory={history}
      />
    </div>
  );
}
