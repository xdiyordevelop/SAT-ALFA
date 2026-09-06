import { redirect } from "next/navigation";

export default function SecuritySettingsRedirect() {
  redirect("/admin/settings?tab=credentials");
}
