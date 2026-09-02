"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  section?: string;
  topic?: string;
}

interface MockTest {
  id: string;
  testName: string;
  description: string;
  subject: string;
  maxScore: number;
  duration: number;
  questions: string;
  status: string;
}

export default function TakeMockTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (!testStarted || testSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, testSubmitted]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/student/mock-tests/${testId}`);
      if (!response.ok) throw new Error("Failed to fetch test");
      const data = await response.json();
      setTest(data.data);
      const parsedQuestions = JSON.parse(data.data.questions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(-1));
      setTimeLeft(data.data.duration * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitTest = async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const timeSpent = test.duration * 60 - timeLeft;
      const response = await fetch(`/api/student/mock-tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit test");
      }
      const resData = await response.json();
      setSubmissionResult(resData.data || resData);
      setTestSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.filter((a) => a >= 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username="student" role="STUDENT" />
        <div className="lg:ml-64">
          <Topbar
            title="Mock Test"
            breadcrumbs={[{ label: "Student" }, { label: "Mock Tests" }]}
          />
          <main className="pt-24 px-6 pb-12 flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-slate-900 dark:text-yellow-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Loading test...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username="student" role="STUDENT" />
        <div className="lg:ml-64">
          <Topbar
            title="Mock Test"
            breadcrumbs={[{ label: "Student" }, { label: "Mock Tests" }]}
          />
          <main className="pt-24 px-6 pb-12">
            <Link
              href="/student/mock-tests"
              className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p className="font-semibold">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Submitted Confirmation Screen
  if (testSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username="student" role="STUDENT" />
        <div className="lg:ml-64">
          <Topbar
            title="Test Submitted"
            breadcrumbs={[
              { label: "Student" },
              { label: "Mock Tests" },
              { label: "Submitted" },
            ]}
          />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 text-center shadow-xl">
                <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-6 shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 uppercase tracking-wider">
                  Status: Pending Review
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
                  Test Submitted Successfully!
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Your answers for <strong>{test?.testName}</strong> have been
                  recorded. Your submission is now in the administrator's review
                  queue.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Questions Answered
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {answeredCount} / {questions.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Time Spent
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-yellow-500">
                      {formatTime((test?.duration || 0) * 60 - timeLeft)}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-yellow-200 text-xs text-yellow-900 mb-8 text-left">
                  <p className="font-semibold mb-1">ℹ️ What happens next?</p>
                  <p>
                    Your instructor will review your performance and approve
                    your scores. Once approved, your total score, section
                    breakdown, and full AI diagnostic analysis will be visible
                    on your dashboard.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/student/mock-tests"
                    className="flex-1 px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-semibold text-sm transition-colors text-center shadow-sm"
                  >
                    View My Mock Tests
                  </Link>
                  <Link
                    href="/student/dashboard"
                    className="flex-1 px-6 py-3 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] hover:bg-neutral-200 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors text-center"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Pre-test Instructions Screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Sidebar username="student" role="STUDENT" />
        <div className="lg:ml-64">
          <Topbar
            title="Start Mock Test"
            breadcrumbs={[
              { label: "Student" },
              { label: "Mock Tests" },
              { label: test?.testName || "Start" },
            ]}
          />
          <main className="pt-24 px-6 pb-12">
            <div className="max-w-2xl mx-auto">
              <Link
                href="/student/mock-tests"
                className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
              </Link>
              <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 shadow-lg space-y-6">
                <div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 uppercase tracking-wider">
                    {test?.subject} Section
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                    {test?.testName}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {test?.description ||
                      "Prepare yourself under standard timed SAT exam conditions."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Total Questions
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {questions.length} Items
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Time Allowed
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-yellow-500">
                      {test?.duration} Minutes
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-yellow-200 text-xs text-yellow-900 leading-relaxed space-y-1">
                  <p className="font-bold">Exam Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Once you click Start Test, the timer begins automatically.
                    </li>
                    <li>
                      You can navigate back and forth between questions using
                      the question palette.
                    </li>
                    <li>
                      When finished, click Submit Test to send your answers for
                      review.
                    </li>
                  </ul>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setTestStarted(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    Start Test Now
                  </button>
                  <Link
                    href="/student/mock-tests"
                    className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Active Exam Taking Screen
  const q = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username="student" role="STUDENT" />
      <div className="lg:ml-64">
        <Topbar title={test?.testName || "SAT Exam"} />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Bar: Timer & Progress */}
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {answeredCount} answered
                </span>
              </div>
              <div
                className={`flex items-center gap-2 font-mono text-xl font-extrabold ${
                  timeLeft < 300
                    ? "text-red-600 animate-pulse"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Question Card */}
            {q && (
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300">
                    {q.topic || q.section || "Question"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    SAT Practice Item
                  </span>
                </div>
                <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                  {q.text}
                </p>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = answers[currentQuestion] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                          isSelected
                            ? "border-yellow-600 bg-slate-50 dark:bg-[#0a0a0a]/70 ring-2 ring-yellow-600/30"
                            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-neutral-300"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? "bg-yellow- text-slate-900 dark:text-white"
                              : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white pt-0.5">
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation & Submit Controls */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-700 dark:text-slate-300 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-3">
                {currentQuestion < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="px-6 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-semibold text-sm transition-colors shadow-sm"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-slate-900 dark:text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Mock Test"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Questions Palette Map */}
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions Overview ({answeredCount}/{questions.length}{" "}
                  answered)
                </span>
                {currentQuestion === questions.length - 1 && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="text-xs font-bold text-green-600 hover:text-green-700"
                  >
                    Ready to Submit →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
                {questions.map((_, idx) => {
                  const isCurrent = currentQuestion === idx;
                  const isAnswered =
                    answers[idx] !== undefined && answers[idx] >= 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestion(idx)}
                      className={`h-9 rounded-xl font-bold text-xs transition-all ${
                        isCurrent
                          ? "ring-2 ring-yellow-600 bg-yellow- text-slate-900 dark:text-white"
                          : isAnswered
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 hover:bg-neutral-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
