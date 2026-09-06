import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/permissions/auth";
import { SmsNotificationsClient } from "./SmsNotificationsClient";

export default async function SmsNotificationsPage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  return (
    <SmsNotificationsClient
      userRole={session.role}
      userName={session.username}
      userEmail={session.username || "admin@satalfa.uz"}
    />
  );
}
