import { redirect } from "next/navigation";

export default function AttendanceSettingsRedirect() {
  redirect("/admin/settings?tab=academic");
}
