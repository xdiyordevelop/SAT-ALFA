import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginPage from "@/app/login/page";

export default async function Home() {
  const session = await getSession();

  if (session) {
    if (session.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return <LoginPage />;
}

