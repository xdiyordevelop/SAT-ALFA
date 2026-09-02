"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateArticle } from "@/server/actions/article.actions";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Save, Eye, Edit2, Plus, Trash2 } from "lucide-react";

type VocabEntry = { word: string; definition: string; context: string };

function deserializeVocab(raw: unknown): VocabEntry[] {
  if (!raw) return [];
  try {
    // Prisma may return Json as a plain JS array already, or as a JSON string
    const arr: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((v: any) => ({
      word: v?.word || "",
      definition: v?.definition || "",
      context: v?.contextSentence || v?.context || "",
    }));
  } catch {
    return [];
  }
}

export function ArticleEditor({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ...initialData,
    vocabulary: deserializeVocab(initialData?.vocabulary),
  });
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (published: boolean) => {
    setLoading(true);
    try {
      await updateArticle(formData.id, { ...formData, published });
      router.push("/admin/articles");
    } catch (err) {
      alert("Failed to save");
    }
    setLoading(false);
  };

  const handleVocabChange = (index: number, field: string, value: string) => {
    const newVocab = [...(formData.vocabulary || [])];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setFormData({ ...formData, vocabulary: newVocab });
  };

  const removeVocab = (index: number) => {
    const newVocab = [...(formData.vocabulary || [])];
    newVocab.splice(index, 1);
    setFormData({ ...formData, vocabulary: newVocab });
  };

  const addVocab = () => {
    setFormData({
      ...formData,
      vocabulary: [
        ...(formData.vocabulary || []),
        { word: "", definition: "", context: "" },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Editor
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors text-sm font-medium"
          >
            {isPreview ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {isPreview ? "Edit Mode" : "Preview Mode"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors text-sm font-medium"
          >
            Save Draft
          </button>
          <button
            disabled={loading}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl transition-colors text-sm font-bold"
          >
            <Save className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            {!isPreview ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Article Title"
                />
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-yellow-500 h-24 resize-none"
                  placeholder="Short Summary"
                />
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-yellow-500 h-[600px] font-mono text-sm"
                  placeholder="Markdown Content..."
                />
              </div>
            ) : (
              <div className="prose prose-invert prose-amber max-w-none">
                <h1>{formData.title}</h1>
                <p className="lead">{formData.summary}</p>
                <MathRenderer text={formData.content} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="SCIENCE">SCIENCE</option>
                  <option value="HISTORY">HISTORY</option>
                  <option value="LITERATURE">LITERATURE</option>
                  <option value="STRATEGY">STRATEGY</option>
                  <option value="VOCABULARY">VOCABULARY</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Read Time (min)
                </label>
                <input
                  type="number"
                  value={formData.readTimeMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      readTimeMin: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Vocabulary
              </h3>
              <button
                onClick={addVocab}
                className="text-yellow-500 hover:text-slate-900 dark:text-yellow-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {(formData.vocabulary || []).map((v: any, i: number) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-4 rounded-xl relative"
                >
                  <button
                    onClick={() => removeVocab(i)}
                    className="absolute top-2 right-2 text-slate-500 dark:text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Word"
                    value={v.word}
                    onChange={(e) =>
                      handleVocabChange(i, "word", e.target.value)
                    }
                    className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 pb-1 mb-2 text-yellow-500 font-bold outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Definition"
                    value={v.definition}
                    onChange={(e) =>
                      handleVocabChange(i, "definition", e.target.value)
                    }
                    className="w-full bg-transparent mb-2 text-slate-900 dark:text-white outline-none text-sm"
                  />
                  <textarea
                    placeholder="Context"
                    value={v.context}
                    onChange={(e) =>
                      handleVocabChange(i, "context", e.target.value)
                    }
                    className="w-full bg-transparent text-slate-500 dark:text-slate-400 outline-none text-xs resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
