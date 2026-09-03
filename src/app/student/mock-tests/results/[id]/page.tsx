import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getMockTestById } from "@/lib/queries/tests";
import { analyzeTestPerformance } from "@/lib/ai/analysis";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StudentResultDetail } from "@/components/student/StudentResultDetail";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface StudentResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentResultPage({
  params,
}: StudentResultPageProps) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const { id } = await params;
  const test = await getMockTestById(id);

  if (!test) {
    notFound();
  }

  // STRICT AUTHORIZATION CHECK: verify student ownership
  if (test.student?.userId !== session.userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar title="Access Denied" />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Unauthorized Access
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                You do not have permission to view this mock test result. You
                can only view your own test results.
              </p>
              <Link
                href="/student/mock-tests"
                className="px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-medium text-sm transition-colors"
              >
                Back to My Mock Tests
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If status is PENDING: do not show as official result yet
  if (test.status === "PENDING" || test.status === "AI_PROPOSED") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar
            title="Pending Review"
            breadcrumbs={[
              { label: "Student" },
              { label: "Mock Tests", href: "/student/mock-tests" },
              { label: "Pending Review" },
            ]}
          />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-xl mx-auto">
              <Link
                href="/student/mock-tests"
                className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
              </Link>
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-yellow-200 p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-500 mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Submission Awaiting Admin Review
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Your mock test (<strong>{test.testName}</strong>) has been
                  submitted successfully. An instructor or administrator will
                  review and approve your submission before official scores and
                  AI diagnostics are unlocked in your dashboard.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-yellow-200 text-xs text-yellow-900 font-medium">
                  Submitted on{" "}
                  {new Date(
                    test.uploadedAt || test.createdAt,
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If status is REJECTED
  if (test.status === "REJECTED") {
    let rejectionReason = "Please review your test submission and resubmit.";
    try {
      if (test.notes) {
        const parsed = JSON.parse(test.notes);
        if (parsed.rejectionReason) {
          rejectionReason = parsed.rejectionReason;
        }
      }
    } catch {
      // ignore
    }
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username={session.username} role={session.role} />
        <div className="lg:ml-64">
          <Topbar
            title="Submission Needs Attention"
            breadcrumbs={[
              { label: "Student" },
              { label: "Mock Tests", href: "/student/mock-tests" },
              { label: "Rejected" },
            ]}
          />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-xl mx-auto">
              <Link
                href="/student/mock-tests"
                className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
              </Link>
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-red-200 p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Submission Requires Correction
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Your mock test submission was not approved by the
                  administrator.
                </p>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-left mb-6">
                  <p className="text-xs font-bold text-red-900 uppercase tracking-wider mb-1">
                    Feedback from Admin:
                  </p>
                  <p className="text-sm text-red-950">{rejectionReason}</p>
                </div>
                <Link
                  href="/student/mock-tests"
                  className="px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-medium text-sm transition-colors"
                >
                  Return to Mock Tests to Resubmit
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Parse or compute analysis for approved test
  let analysis: any = null;
  if (test.notes) {
    try {
      const parsed = JSON.parse(test.notes);
      analysis = parsed.analysis || parsed;
    } catch {
      // plain text
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
      mathTopics: (test.performances || [])
        .filter((p) => p.topic?.subject?.toLowerCase() === "math")
        .map((p) => ({ title: p.topic?.title || "Math", percentCorrect: p.percentage || 0 })),
      englishTopics: (test.performances || [])
        .filter((p) => p.topic?.subject?.toLowerCase() !== "math")
        .map((p) => ({ title: p.topic?.title || "English", percentCorrect: p.percentage || 0 })),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title="Test Result Analysis"
          breadcrumbs={[
            { label: "Student" },
            { label: "Mock Tests", href: "/student/mock-tests" },
            { label: test.testName },
          ]}
          userName={session.username}
          userRole={session.role}
        />
        <main className="pt-24 px-6 pb-12">
          <StudentResultDetail test={test} analysis={analysis} />
        </main>
      </div>
    </div>
  );
}
