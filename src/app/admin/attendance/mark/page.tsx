import { redirect } from "next/navigation";

export default function MarkAttendanceRedirect() {
  redirect("/admin/attendance?tab=mark");
}
