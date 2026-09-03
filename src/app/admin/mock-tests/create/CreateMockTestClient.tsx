"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  PenTool,
  UploadCloud,
  Sparkles,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/uploads/FileUpload";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function CreateMockTestClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [testName, setTestName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Math");
  const [maxScore, setMaxScore] = useState(100);
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mockTestId, setMockTestId] = useState<string | null>(null);

  const addQuestion = () => {
    const newId = String(
      Math.max(...questions.map((q) => parseInt(q.id)), 0) + 1,
    );
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateQuestionOption = (
    id: string,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!testName.trim()) {
        setError("Test name is required");
        setLoading(false);
        return;
      }

      if (
        questions.some(
          (q) => !q.text.trim() || q.options.some((o) => !o.trim()),
        )
      ) {
        setError("All questions must be filled out completely");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName,
          description,
          subject,
          maxScore,
          duration,
          questions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create test");
      }

      const data = await response.json();
      setMockTestId(data.id);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Back Button */}
      <Link
        href="/admin/mock-tests"
        className="inline-flex items-center gap-2 text-slate-900 dark:text-[#EBFF00] hover:text-[#d9ff00] font-medium mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Mock Tests
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Create New Mock Test
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Select a creation method below to configure your SAT examination.
        </p>
      </div>

      {mode === "select" && !mockTestId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in">
          {/* Option 1: Manual Builder */}
          <div
            onClick={() => setMode("manual")}
            className="flex flex-col p-8 bg-white dark:bg-[#131313]/70 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-yellow-500/80 transition-all cursor-pointer group text-left shadow-lg"
          >
            <div className="w-16 h-16 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <PenTool className="w-8 h-8 text-slate-900 dark:text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-slate-900 dark:text-yellow-500 transition-colors">
              Manual Test Builder
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Construct a test step-by-step with custom sections (Math /
              Reading & Writing), questions, options, timer, and score
              configurations.
            </p>
          </div>

          {/* Option 2: AI Import */}
          <Link
            href="/admin/mock-tests/import"
            className="flex flex-col p-8 bg-white dark:bg-[#131313]/70 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-yellow-500/80 transition-all cursor-pointer group relative text-left shadow-lg block"
          >
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-yellow-500" />
              <span className="text-[11px] font-bold text-slate-900 dark:text-yellow-500 uppercase tracking-wider">
                AI Powered
              </span>
            </div>

            <div className="w-16 h-16 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-slate-900 dark:text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-slate-900 dark:text-yellow-500 transition-colors">
              AI Import & Parser
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Upload a full SAT test document (PDF/DOCX) and allow Gemini AI
              to automatically parse, extract, and structure all questions.
            </p>
          </Link>
        </div>
      )}

      {mode === "manual" && !mockTestId && (
        <div className="animate-fade-in space-y-6">
          {/* Toggle Tab */}
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl inline-flex mb-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white rounded-lg text-sm font-medium shadow-sm border border-slate-200 dark:border-white/10">
              <PenTool className="w-4 h-4" />
              Manual Builder
            </button>
            <Link
              href="/admin/mock-tests/import"
              className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 text-slate-900 dark:text-yellow-500" />
              AI Import
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Info Section */}
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
                Test Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., SAT Practice Test 1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all text-sm"
                  >
                    <option>Math</option>
                    <option>English</option>
                    <option>Combined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description about the test"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all resize-none text-sm"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
                  Questions ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
                      Question {index + 1}
                    </h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-2 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    {/* Question Text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(question.id, "text", e.target.value)
                        }
                        placeholder="Enter the question"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all resize-none text-sm"
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Answer Options *
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() =>
                                updateQuestion(
                                  question.id,
                                  "correctAnswer",
                                  optIndex,
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-yellow-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateQuestionOption(
                                  question.id,
                                  optIndex,
                                  e.target.value,
                                )
                              }
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Explanation
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(
                            question.id,
                            "explanation",
                            e.target.value,
                          )
                        }
                        placeholder="Explain the correct answer"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 rounded-xl font-medium transition-colors text-sm shadow-md"
              >
                {loading ? "Creating..." : "Create Mock Test"}
              </button>
              <button
                type="button"
                onClick={() => setMode("select")}
                className="px-8 py-3 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {mockTestId && (
        <div className="animate-fade-in mt-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                ✓
              </span>
              Mock Test Created Successfully
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Now you can upload attachments (study materials, solutions,
              etc.) for this test.
            </p>
            {mockTestId && <FileUpload mockTestId={mockTestId} />}
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  router.push("/admin/mock-tests");
                  router.refresh();
                }}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
              >
                Done & Return
              </button>
              <button
                type="button"
                onClick={() => {
                  setMockTestId(null);
                  setTestName("");
                  setDescription("");
                  setSubject("Math");
                  setMaxScore(100);
                  setDuration(60);
                  setQuestions([
                    {
                      id: "1",
                      text: "",
                      options: ["", "", "", ""],
                      correctAnswer: 0,
                      explanation: "",
                    },
                  ]);
                  setMode("select");
                }}
                className="px-8 py-3 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors text-sm"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
