import { redirect } from "next/navigation";

export default function PaymentsSettingsRedirect() {
  redirect("/admin/settings?tab=academic");
}
