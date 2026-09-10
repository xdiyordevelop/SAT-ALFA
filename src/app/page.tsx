import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginPage from "@/app/login/page";

export const metadata: Metadata = {
  title: "SAT ALFA — Digital SAT Tayyorgarlik Platformasi",
  description:
    "SAT ALFA — Digital SAT tayyorgarlik platformasi. Real Bluebook mock testlar, AI ball hisoblash va natijalar tahlili.",
};

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

