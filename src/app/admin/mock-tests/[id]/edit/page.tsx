"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save, Upload, X, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import "katex/dist/katex.min.css";

interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Question {
  id: string;
  prompt: string;
  passage?: string | null;
  stimulus?: string | null;
  imageUrl?: string | null;
  options: QuestionOption;
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  domain: string;
  skill: string;
  module: "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4";
  format: string;
  questionNumber: number;
  explanation?: string | null;
}

interface MockTest {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  status: string;
}

export default function MockTestEditPage() {
  const params = useParams();
  const router = useRouter();
  const testId = (params.id || params.testId) as string;

  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [showImagePreview, setShowImagePreview] = useState<{
    [key: number]: boolean;
  }>({});
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    async function fetchTest() {
      try {
        const response = await fetch(`/api/admin/mock-tests/${testId}`);
        if (!response.ok) throw new Error("Failed to fetch test");
        const data = await response.json();
        setMockTest(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [testId]);

  const handleSaveQuestion = async (
    index: number,
    updatedQuestion: Question,
  ) => {
    if (!mockTest) return;
    const updatedQuestions = [...mockTest.questions];
    updatedQuestions[index] = updatedQuestion;
    setMockTest({ ...mockTest, questions: updatedQuestions });
    setEditingQuestionIndex(null);

    try {
      const response = await fetch(
        `/api/admin/mock-tests/${testId}/questions/${updatedQuestion.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedQuestion),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to save question");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!mockTest) return;
    setUploading({ ...uploading, [index]: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads/questions", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      const updatedQuestion = { ...mockTest.questions[index], imageUrl: url };
      await handleSaveQuestion(index, updatedQuestion);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading({ ...uploading, [index]: false });
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    if (!mockTest) return;
    const question = mockTest.questions[index];
    const updatedQuestions = mockTest.questions.filter((_, i) => i !== index);
    setMockTest({ ...mockTest, questions: updatedQuestions });
    try {
      await fetch(`/api/admin/mock-tests/${testId}/questions/${question.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!mockTest) {
    return <div className="text-center py-8">Test not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-yellow-500 mb-2">
              {mockTest.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {mockTest.questions.length} questions
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white"
          >
            Back
          </Button>
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {mockTest.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            isEditing={editingQuestionIndex === index}
            onEdit={() => setEditingQuestionIndex(index)}
            onCancel={() => setEditingQuestionIndex(null)}
            onSave={(updated) => handleSaveQuestion(index, updated)}
            onDelete={() => handleDeleteQuestion(index)}
            onImageUpload={(file) => handleImageUpload(index, file)}
            isUploading={uploading[index] || false}
            showPreview={showImagePreview[index] || false}
            onTogglePreview={() =>
              setShowImagePreview({
                ...showImagePreview,
                [index]: !showImagePreview[index],
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updated: Question) => void;
  onDelete: () => void;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
}

function QuestionCard({
  question,
  index,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onImageUpload,
  isUploading,
  showPreview,
  onTogglePreview,
}: QuestionCardProps) {
  const [editData, setEditData] = useState(question);
  const [aiFixInstruction, setAiFixInstruction] = useState("");
  const [aiFixLoading, setAiFixLoading] = useState(false);
  const [aiParseLoading, setAiParseLoading] = useState(false);

  const handleAiFix = async () => {
    if (!aiFixInstruction.trim()) return;
    setAiFixLoading(true);
    try {
      const res = await fetch("/api/ai/fix-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: aiFixInstruction,
          currentData: {
            passage: editData.passage,
            prompt: editData.prompt,
            options: editData.options,
            explanation: editData.explanation,
            correctAnswer: editData.correctAnswer,
          },
        }),
      });
      if (!res.ok) throw new Error("AI Fix failed");
      const json = await res.json();
      if (json.data) {
        setEditData({
          ...editData,
          passage: json.data.passage ?? editData.passage,
          prompt: json.data.prompt ?? editData.prompt,
          options: { ...editData.options, ...json.data.options },
          explanation: json.data.explanation ?? editData.explanation,
          correctAnswer: json.data.correctAnswer ?? editData.correctAnswer,
        });
        setAiFixInstruction("");
      }
    } catch (e) {
      alert("AI Fix error:" + e);
    } finally {
      setAiFixLoading(false);
    }
  };

  const handleAiParseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiParseLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = (event.target?.result as string).split(",")[1];
        const res = await fetch("/api/ai/parse-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64String,
            isMath:
              editData.module === "MODULE_3" || editData.module === "MODULE_4",
          }),
        });
        if (!res.ok) throw new Error("AI Parse failed");
        const json = await res.json();
        if (json.data) {
          setEditData({
            ...editData,
            passage: json.data.passage || editData.passage,
            prompt: json.data.prompt || editData.prompt,
            options: { ...editData.options, ...json.data.options },
            correctAnswer: json.data.correctAnswer || editData.correctAnswer,
            explanation: json.data.explanation || editData.explanation,
            domain: json.data.domain || editData.domain,
            skill: json.data.skill || editData.skill,
          });
        }
        setAiParseLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      alert("AI Parse error:" + e);
      setAiParseLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="bg-slate-50 dark:bg-[#0a0a0a] border-yellow-600/50 p-6">
        <div className="space-y-4">
          {/* AI Tools Section */}
          <div className="bg-yellow-950/30 border border-yellow-500/30 p-4 rounded-md space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-yellow-700 font-bold flex items-center gap-2">
                <span className="text-xl">✨</span> AI Assistant
              </h3>
            </div>
            {/* AI Image Import */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white text-slate-900 dark:text-white px-3 py-2 rounded text-sm w-max transition-colors">
                {aiParseLoading ? "Parsing image..." : "Import from Screenshot"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAiParseImage}
                  disabled={aiParseLoading}
                />
              </label>
            </div>
            {/* AI Fix */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiFixInstruction}
                onChange={(e) => setAiFixInstruction(e.target.value)}
                placeholder="Tell AI to fix something (e.g.,'Fix the math formatting','Extract options')"
                className="flex-1 px-3 py-2 bg-white dark:bg-[#131313] border border-yellow-500/50 rounded text-slate-900 dark:text-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAiFix();
                }}
              />
              <Button
                onClick={handleAiFix}
                disabled={aiFixLoading || !aiFixInstruction}
                className="bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white"
              >
                {aiFixLoading ? "Fixing..." : "AI Fix"}
              </Button>
            </div>
          </div>

          {/* Question Number */}
          <div>
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
              Question #{index + 1}
            </label>
            <input
              type="number"
              value={editData.questionNumber}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  questionNumber: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
              Question Text (HTML/KaTeX)
            </label>
            <textarea
              value={editData.prompt}
              onChange={(e) =>
                setEditData({ ...editData, prompt: e.target.value })
              }
              className="w-full h-24 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white font-mono text-sm"
            />
          </div>

          {/* Passage */}
          {editData.passage && (
            <div>
              <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
                Stimulus/Passage
              </label>
              <textarea
                value={editData.passage}
                onChange={(e) =>
                  setEditData({ ...editData, passage: e.target.value })
                }
                className="w-full h-20 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Options */}
          <div>
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
              Options
            </label>
            <div className="space-y-2 bg-slate-100 dark:bg-[#1c1b1b] p-3 rounded border border-slate-600">
              {Object.keys(editData.options).map((key) => (
                <input
                  key={key}
                  type="text"
                  placeholder={`Option ${key}`}
                  value={editData.options[key as keyof QuestionOption]}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      options: {
                        ...editData.options,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-500 rounded text-slate-900 dark:text-white text-sm"
                />
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
              Correct Answer
            </label>
            <select
              value={editData.correctAnswer}
              onChange={(e) =>
                setEditData({ ...editData, correctAnswer: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
            >
              {["A", "B", "C", "D"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2 text-sm">
                Difficulty
              </label>
              <select
                value={editData.difficulty}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                  })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2 text-sm">
                Module
              </label>
              <select
                value={editData.module}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    module: e.target.value as
                      | "MODULE_1"
                      | "MODULE_2"
                      | "MODULE_3"
                      | "MODULE_4",
                  })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              >
                <option value="MODULE_1">Module 1</option>
                <option value="MODULE_2">Module 2</option>
                <option value="MODULE_3">Module 3</option>
                <option value="MODULE_4">Module 4</option>
              </select>
            </div>
          </div>

          {/* Domain & Skill */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2 text-sm">
                Domain
              </label>
              <input
                type="text"
                value={editData.domain}
                onChange={(e) =>
                  setEditData({ ...editData, domain: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2 text-sm">
                Skill
              </label>
              <input
                type="text"
                value={editData.skill}
                onChange={(e) =>
                  setEditData({ ...editData, skill: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-2">
              Explanation
            </label>
            <textarea
              value={editData.explanation || ""}
              onChange={(e) =>
                setEditData({ ...editData, explanation: e.target.value })
              }
              className="w-full h-16 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Image Upload */}
          <div className="bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded p-4">
            <label className="block text-slate-900 dark:text-yellow-500 font-bold mb-3">
              Question Image (Optional)
            </label>
            {editData.imageUrl && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-sm truncate">
                  {editData.imageUrl}
                </span>
                <Button
                  onClick={() => setEditData({ ...editData, imageUrl: null })}
                  className="bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white px-2 py-1 text-sm"
                >
                  Remove
                </Button>
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-600 rounded cursor-pointer hover:border-yellow-600 transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  Drag & drop or click to upload
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    // For now, just store the file name. In production, upload immediately
                    setEditData({ ...editData, imageUrl: file.name });
                  }
                }}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onSave(editData)}
              className="bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 font-bold flex items-center gap-2 flex-1"
            >
              <Save className="w-4 h-4" /> Save Question
            </Button>
            <Button
              onClick={onCancel}
              className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-4 hover:border-yellow-600/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-slate-900 dark:text-yellow-500 font-bold">
            Question #{index + 1}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {question.domain} • {question.difficulty} • {question.module}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onTogglePreview}
            className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white p-2"
            title="Toggle preview"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={onEdit}
            className="bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 px-3 py-1"
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {showPreview && (
        <div className="bg-slate-100 dark:bg-[#1c1b1b]/50 p-4 rounded mb-3 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <strong className="text-slate-900 dark:text-yellow-500">
              Question:
            </strong>
            <div className="mt-1 whitespace-pre-wrap break-words">
              {question.prompt}
            </div>
          </div>
          {question.passage && (
            <div>
              <strong className="text-slate-900 dark:text-yellow-500">
                Passage:
              </strong>
              <div className="mt-1 whitespace-pre-wrap break-words">
                {question.passage}
              </div>
            </div>
          )}
          {question.imageUrl && (
            <div>
              <strong className="text-slate-900 dark:text-yellow-500">
                Image:
              </strong>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {question.imageUrl}
              </div>
            </div>
          )}
          <div>
            <strong className="text-slate-900 dark:text-yellow-500">
              Options:
            </strong>
            <div className="mt-1 space-y-1">
              {Object.entries(question.options).map(([key, value]) => (
                <div
                  key={key}
                  className={
                    question.correctAnswer === key
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
          {question.explanation && (
            <div>
              <strong className="text-slate-900 dark:text-yellow-500">
                Explanation:
              </strong>
              <div className="mt-1">{question.explanation}</div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
