import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginPage from "@/app/login/page";

export const metadata: Metadata = {
  title: "SAT ALFA — Digital SAT Preparation Platform",
  description:
    "SAT ALFA is a premier Digital SAT preparation platform. Experience realistic Bluebook-style mock tests, AI score analytics, and comprehensive SAT strategy.",
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

