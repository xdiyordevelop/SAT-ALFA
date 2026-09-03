"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  FileText,
  Target,
  Brain,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  approveMockTestAction,
  rejectMockTestAction,
} from "@/server/actions/mock-test.actions";

interface AdminSubmissionDetailProps {
  test: any;
  analysis: any;
  backUrl?: string;
}

export function AdminSubmissionDetail({
  test,
  analysis,
  backUrl = "/admin/mock-tests",
}: AdminSubmissionDetailProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isPending = test.status === "PENDING" || test.status === "AI_PROPOSED";
  const isApproved = test.status === "CONFIRMED";
  const isRejected = test.status === "REJECTED";

  const totalScore =
    test.totalScore || test.score || (analysis?.totalScore ?? 0);
  const mathScore = test.mathScore || analysis?.mathScore || null;
  const englishScore = test.englishScore || analysis?.englishScore || null;

  const strengths: string[] = analysis?.strengths || [];
  const weaknesses: string[] = analysis?.weaknesses || [];
  const recommendations: string[] = analysis?.recommendations || [];
  const studyPriorities: string[] = analysis?.studyPriorities || [];
  const nextSteps: string[] = analysis?.nextSteps || [];
  const overallInsight =
    analysis?.overallInsight ||
    analysis?.summary ||
    "Analysis generated from student performance.";

  // Topic performances
  const topicList =
    test.performances?.map((p: any) => ({
      name: p.topic?.title || "Topic",
      subject: p.topic?.subject || "General",
      percentage: p.percentage,
    })) ||
    (analysis?.detailedTopics
      ? analysis.detailedTopics.map((dt: any) => ({
          name: dt.name,
          subject: dt.subject,
          percentage: dt.percentCorrect,
        }))
      : analysis?.topicPerformance
        ? Object.entries(analysis.topicPerformance).map(([name, pct]) => ({
            name,
            subject:
              name.toLowerCase().includes("math") ||
              name.toLowerCase().includes("algebra")
                ? "Math"
                : "English",
            percentage: Number(pct),
          }))
        : []);

  // Parse questions if available for question breakdown
  let questions: any[] = [];
  try {
    if (typeof test.questions === "string") {
      questions = JSON.parse(test.questions);
    }
  } catch {
    questions = [];
  }
  let answers: number[] = [];
  try {
    if (typeof test.answers === "string") {
      answers = JSON.parse(test.answers);
    }
  } catch {
    answers = [];
  }

  const handleApprove = async () => {
    setIsApproving(true);
    setActionError(null);
    try {
      const res = await approveMockTestAction(test.id);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(
          "Test result approved successfully! It is now visible to the student.",
        );
        setShowApproveModal(false);
        router.refresh();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("Please enter a reason for rejection.");
      return;
    }
    setIsRejecting(true);
    setActionError(null);
    try {
      const res = await rejectMockTestAction(test.id, rejectReason);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(
          "Test submission rejected. Feedback recorded for the student.",
        );
        setShowRejectModal(false);
        router.refresh();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button & Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mock Tests
        </Link>

        {/* Approval Controls */}
        <div className="flex items-center gap-3">
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setShowApproveModal(true)}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-slate-900 dark:text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Result
              </button>
            </>
          )}

          {isApproved && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 ">
              <CheckCircle2 className="w-4 h-4" />
              Approved & Locked in Metrics
            </span>
          )}

          {isRejected && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 ">
              <XCircle className="w-4 h-4" />
              Rejected Submission
            </span>
          )}
        </div>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="font-medium text-sm">{actionSuccess}</p>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="font-medium text-sm">{actionError}</p>
        </div>
      )}

      {/* Main Student & Test Header Card */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Student Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xl shadow-md">
                {test.student?.firstName?.[0] || "S"}
                {test.student?.lastName?.[0] || "T"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white ">
                  {test.student?.firstName} {test.student?.lastName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 ">
                  @{test.student?.user?.username || "student"} • Group:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300 ">
                    {test.student?.group?.name || "Ungrouped"}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 ">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Test Name
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {test.testName}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Submitted At
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {new Date(
                    test.uploadedAt || test.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Source
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {test.source === "STUDENT_UPLOADED"
                    ? "Bluebook Report"
                    : "Online Exam"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Box */}
          <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-xl p-5 border border-slate-200 dark:border-white/10 ">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Submission Status
            </span>
            <div className="flex items-center gap-2 mb-3">
              {isPending && (
                <>
                  <Clock className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
                  <span className="text-lg font-bold text-yellow-700 ">
                    Pending Admin Review
                  </span>
                </>
              )}
              {isApproved && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600 " />
                  <span className="text-lg font-bold text-green-700 ">
                    Approved Result
                  </span>
                </>
              )}
              {isRejected && (
                <>
                  <XCircle className="w-5 h-5 text-red-600 " />
                  <span className="text-lg font-bold text-red-700 ">
                    Rejected
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 ">
              {isPending &&
                "This score is not yet displayed in the student's official progress dashboard."}
              {isApproved &&
                "This score is locked into student performance metrics and visible to the student."}
              {isRejected &&
                "Student has been notified that this test submission was rejected."}
            </p>
          </div>
        </div>
      </div>

      {/* SAT Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Score */}
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl p-6 text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-yellow-200">
                Total SAT Score
              </span>
              <Award className="w-6 h-6 text-yellow-200" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold tracking-tight">
                {totalScore}
              </span>
              <span className="text-yellow-200 text-lg">/ 1600</span>
            </div>
            <div className="w-full bg-yellow-900/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white dark:bg-[#131313] h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, ((totalScore - 400) / 1200) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Math Score */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 ">
              Math Section
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ">
              200–800
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white ">
              {mathScore || "—"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              / 800
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1c1b1b] rounded-full h-2 overflow-hidden">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${mathScore ? Math.min(100, ((mathScore - 200) / 600) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Reading & Writing Score */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 ">
              Reading & Writing Section
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ">
              200–800
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white ">
              {englishScore || "—"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              / 800
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1c1b1b] rounded-full h-2 overflow-hidden">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${englishScore ? Math.min(100, ((englishScore - 200) / 600) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Topic Performance Diagnostics */}
      {topicList.length > 0 && (
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
            SAT Topic Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicList.map((topic: any, idx: number) => {
              const isHigh = topic.percentage >= 80;
              const isMedium = topic.percentage >= 70 && topic.percentage < 80;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white ">
                        {topic.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        ({topic.subject})
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isHigh
                          ? "text-green-600 "
                          : isMedium
                          ? "text-slate-900 dark:text-yellow-500 "
                          : "text-red-600 "
                      }`}
                    >
                      {topic.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isHigh ? "bg-emerald-500" : isMedium ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, topic.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 ">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Strong Points (≥80% Mastery)
            </h3>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {strengths.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50/50 border border-green-100 text-sm text-green-900 "
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No strong points recorded yet.
            </p>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 ">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Weak Areas & Improvement Focus
            </h3>
          </div>

          {weaknesses.length > 0 ? (
            <ul className="space-y-2.5">
              {weaknesses.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/50 border border-red-100 text-sm text-red-900 "
                >
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No weak areas identified. Excellent performance!
            </p>
          )}
        </div>
      </div>

      {/* AI Analysis & Recommendations */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-violet-600 flex items-center justify-center text-slate-900 dark:text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white ">
              AI Diagnostic Analysis & Insights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 ">
              Personalized analysis generated directly from student's
              performance data
            </p>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-yellow-100 ">
          <h4 className="font-semibold text-yellow-900 text-sm mb-1">
            Performance Overview
          </h4>
          <p className="text-sm text-indigo-950 leading-relaxed">
            {overallInsight}
          </p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Actionable Study Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 "
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Priorities & Next Steps */}
        {studyPriorities.length > 0 && (
          <div className="pt-4 border-t border-slate-100 ">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Targeted Next Steps
            </h4>
            <ul className="space-y-2">
              {studyPriorities.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 " />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Online Questions Analysis (if applicable) */}
      {Array.isArray(questions) && questions.length > 0 && (
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
            Question-by-Question Review ({questions.length} Questions)
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const studentAnswer = answers[idx];
              const isCorrect =
                studentAnswer !== undefined &&
                studentAnswer === q.correctAnswer;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? "border-green-200 bg-green-50/30 "
                      : "border-red-200 bg-red-50/30 "
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white ">
                        Q{idx + 1}.
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 font-medium">
                        {q.topic || q.section || "Question"}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-green-100 text-green-700 "
                          : "bg-red-100 text-red-700 "
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
                    {q.text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border ${
                          optIdx === q.correctAnswer
                            ? "border-green-500 bg-green-100/50 font-semibold text-green-900 "
                            : optIdx === studentAnswer && !isCorrect
                            ? "border-red-500 bg-red-100/50 font-medium text-red-900 "
                            : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 "
                        }`}
                      >
                        <span className="font-bold mr-1">
                          {String.fromCharCode(65 + optIdx)}:
                        </span>
                        {opt}
                        {optIdx === q.correctAnswer && " (Correct Answer)"}
                        {optIdx === studentAnswer &&
                          !isCorrect &&
                          " (Student's Answer)"}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-2.5 bg-slate-100 dark:bg-[#1c1b1b] rounded-lg text-xs text-slate-600 dark:text-slate-400 ">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 ">
                        Explanation:{" "}
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Approve Mock Test Result?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Approving will set this test to{" "}
              <strong className="text-slate-900 dark:text-white ">
                APPROVED
              </strong>{" "}
              and lock the SAT score (<strong>{totalScore}</strong>) into the
              student's official progress metrics, making the score and AI
              analysis visible on their dashboard.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={isApproving}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a0a0a] font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-slate-900 dark:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Confirm Approval"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <XCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Reject Test Submission
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Please provide feedback explaining why this submission was
              rejected:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Test score report image was unreadable / Incomplete answers..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 mb-6 resize-none"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a0a0a] font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-slate-900 dark:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
