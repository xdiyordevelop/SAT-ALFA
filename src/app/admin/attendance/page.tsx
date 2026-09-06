import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/permissions/auth";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = resolvedParams.tab === "mark" ? "mark" : "history";

  return (
    <AttendanceClient
      userRole={session.role}
      userName={session.username}
      userEmail={session.username || "admin@satalfa.uz"}
      initialTab={initialTab}
    />
  );
}
