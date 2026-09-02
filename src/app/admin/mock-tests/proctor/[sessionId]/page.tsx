import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SessionController } from "./components/SessionController";
import { ParticipantMatrix } from "./components/ParticipantMatrix";
import { SecurityAlertTracker } from "./components/SecurityAlertTracker";
import { ProctoredControlRoom } from "./ProctoredControlRoom";

interface ProctoredControlPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ProctoredControlPage({
  params,
}: ProctoredControlPageProps) {
  const session = await getSession(); // Verify admin access
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { sessionId } = await params; // Fetch session with participants
  const proctoredSession = await prisma.proctoredSession.findUnique({
    where: { id: sessionId },
    include: {
      participants: true,
      satTest: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!proctoredSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar
            title="Proctor Control"
            breadcrumbs={[{ label: "Admin" }, { label: "Proctor Control" }]}
            userName={session.username}
            userRole={session.role}
          />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto text-center py-12">
              <p className="text-red-600 text-lg font-bold">
                Session not found
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                The proctored session could not be found.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title="Proctor Control Room"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Tests" },
            { label: "Proctor Control" },
          ]}
          userName={session.username}
          userRole={session.role}
        />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Test Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-yellow-500 mb-2">
                {proctoredSession.satTest.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Session created{" "}
                {new Date(proctoredSession.createdAt).toLocaleString()}
              </p>
            </div>
            {/* Real-time Control Room */}
            <ProctoredControlRoom
              sessionId={sessionId}
              initialSession={proctoredSession as any}
              adminUsername={session.username}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
