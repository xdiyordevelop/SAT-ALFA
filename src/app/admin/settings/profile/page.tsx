import { redirect } from "next/navigation";

export default function ProfileSettingsRedirect() {
  redirect("/admin/settings?tab=profile");
}
