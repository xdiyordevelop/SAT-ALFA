import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getMockTestById } from "@/lib/queries/tests";
import { analyzeTestPerformance } from "@/lib/ai/analysis";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AdminSubmissionDetail } from "@/components/admin/mock-tests/AdminSubmissionDetail";
import { prisma } from "@/lib/db/prisma";
import { ResultsDashboard } from "@/app/student/mock-tests/[id]/results/ResultsDashboard";

interface ResultDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminResultDetailRoute({
  params,
}: ResultDetailPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  
  // Try finding in the old manual MockTest system
  const mockTest = await getMockTestById(id);

  if (mockTest) {
    // Parse or compute analysis
    let analysis: any = null;
    if (mockTest.notes) {
      try {
        const parsed = JSON.parse(mockTest.notes);
        analysis = parsed.analysis || parsed;
      } catch {
        // notes was plain text
      }
    }

    if (!analysis) {
      analysis = await analyzeTestPerformance({
        testId: mockTest.id,
        studentId: mockTest.studentId || "",
        testName: mockTest.testName,
        subject: mockTest.subject,
        score: mockTest.totalScore || mockTest.score,
        maxScore: mockTest.maxScore,
        mathScore: mockTest.mathScore,
        englishScore: mockTest.englishScore,
        totalScore: mockTest.totalScore || mockTest.score,
        mathTopics: (mockTest.performances || [])
          .filter((p) => p.topic?.subject?.toLowerCase() === "math")
          .map((p) => ({ title: p.topic?.title || "Math", percentCorrect: p.percentage || 0 })),
        englishTopics: (mockTest.performances || [])
          .filter((p) => p.topic?.subject?.toLowerCase() !== "math")
          .map((p) => ({ title: p.topic?.title || "English", percentCorrect: p.percentage || 0 })),
      });
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar
            title="Student Test Result"
            breadcrumbs={[
              { label: "Admin" },
              { label: "Mock Tests", href: "/admin/mock-tests" },
              { label: "Results", href: "/admin/mock-tests/results" },
              { label: mockTest.testName },
            ]}
            userName={session.username}
            userRole={session.role}
          />
          <main className="pt-24 px-6 pb-12">
            <AdminSubmissionDetail
              test={mockTest}
              analysis={analysis}
              backUrl="/admin/mock-tests/results"
            />
          </main>
        </div>
      </div>
    );
  }

  // If not found in MockTest, try Digital SAT attempt (StudentTestAttempt)
  const attempt = await prisma.studentTestAttempt.findUnique({
    where: { id },
    include: {
      satTest: true,
      student: {
        include: { user: true }
      }
    },
  });

  if (!attempt) {
    notFound();
  }

  // Fetch all questions for this test to build full review
  const questions = await prisma.sATQuestion.findMany({
    where: { satTestId: attempt.satTestId },
    orderBy: [{ module: "asc" }, { questionNumber: "asc" }],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title="Digital SAT Test Result"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Tests", href: "/admin/mock-tests" },
            { label: "Results", href: "/admin/mock-tests/results" },
            { label: attempt.satTest.name },
          ]}
          userName={session.username}
          userRole={session.role}
        />
        <main className="pt-24 px-6 pb-12">
           <div className="bg-white dark:bg-[#131313] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
             <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
               <div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student: {attempt.student.firstName} {attempt.student.lastName}</h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Digital SAT Performance Review</p>
               </div>
             </div>
             <ResultsDashboard
               attempt={attempt}
               questions={questions}
               student={attempt.student}
             />
           </div>
        </main>
      </div>
    </div>
  );
}
