import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getMockTestById } from "@/lib/queries/tests";
import { analyzeTestPerformance } from "@/lib/ai/analysis";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AdminSubmissionDetail } from "@/components/admin/mock-tests/AdminSubmissionDetail";
import Link from "next/link";
import { ArrowLeft, Brain, Clock, Award, HelpCircle } from "lucide-react";

interface AdminMockTestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMockTestDetailPage({
  params,
}: AdminMockTestDetailPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const test = await getMockTestById(id);
  if (!test) {
    notFound();
  }

  // If this is a student submission, show the full submission detail / review UI
  if (test.studentId) {
    let analysis: any = null;
    if (test.notes) {
      try {
        const parsed = JSON.parse(test.notes);
        analysis = parsed.analysis || parsed;
      } catch {
        // notes was plain text
      }
    }
    if (!analysis) {
      analysis = await analyzeTestPerformance({
        testId: test.id,
        studentId: test.studentId || "",
        testName: test.testName,
        subject: test.subject,
        score: test.totalScore || test.score,
        maxScore: test.maxScore,
        mathScore: test.mathScore,
        englishScore: test.englishScore,
        totalScore: test.totalScore || test.score,
        mathTopics: test.performances
          .filter((p) => p.topic.subject.toLowerCase() === "math")
          .map((p) => ({ title: p.topic.title, percentCorrect: p.percentage })),
        englishTopics: test.performances
          .filter((p) => p.topic.subject.toLowerCase() !== "math")
          .map((p) => ({ title: p.topic.title, percentCorrect: p.percentage })),
      });
    }
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar
            title="Mock Test Submission"
            breadcrumbs={[
              { label: "Admin" },
              { label: "Mock Tests", href: "/admin/mock-tests" },
              { label: test.testName },
            ]}
            userName={session.username}
            userRole={session.role}
          />
          <main className="pt-24 px-6 pb-12">
            <AdminSubmissionDetail
              test={test}
              analysis={analysis}
              backUrl="/admin/mock-tests"
            />
          </main>
        </div>
      </div>
    );
  }

  // Otherwise, this is a test template created by Admin
  let questions: any[] = [];
  try {
    questions = JSON.parse(test.questions);
  } catch {
    questions = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title="Practice Test Details"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Tests", href: "/admin/mock-tests" },
            { label: test.testName },
          ]}
          userName={session.username}
          userRole={session.role}
        />
        <main className="pt-24 px-6 pb-12">
          <div className="space-y-8">
            <Link
              href="/admin/mock-tests"
              className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
            </Link>
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 uppercase tracking-wider">
                    {test.subject}
                  </span>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {test.testName}
                  </h1>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-2xl">
                {test.description ||
                  "Official SAT Mock Test template for students to practice online."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Duration
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {test.duration} Minutes
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Questions
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {questions.length} Items
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] flex items-center gap-3">
                  <Award className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Max Score
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {test.maxScore} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Test Questions ({questions.length})
                </h2>
                <div className="space-y-4">
                  {questions.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Question {idx + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-50 dark:bg-[#0a0a0a] text-yellow-700 font-medium">
                          {q.topic || q.section || "Question"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {q.text}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options?.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border ${
                              optIdx === q.correctAnswer
                                ? "border-green-500 bg-green-50 text-green-900 font-semibold"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span className="font-bold mr-1">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            {opt}
                            {optIdx === q.correctAnswer && " ✓ (Correct)"}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
