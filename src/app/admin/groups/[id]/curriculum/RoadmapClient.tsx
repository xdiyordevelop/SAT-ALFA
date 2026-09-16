"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Check,
  Search,
  X,
  Loader2,
  Filter,
} from "lucide-react";

export default function RoadmapClient({
  groupId,
  initialProgress,
  allTopics = [],
}: any) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Multi-select modal state
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  const toggleApproval = async (progressId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/curriculum`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId, isApproved: !currentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProgress((prev: any) =>
          prev.map((p: any) =>
            p.id === progressId
              ? {
                  ...p,
                  isApproved: updated.isApproved,
                  approvedAt: updated.approvedAt,
                }
              : p,
          ),
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Available topics not yet attached to this group's curriculum
  const unattachedTopics = useMemo(() => {
    const attachedIds = new Set(progress.map((p: any) => p.topicId));
    return allTopics.filter((t: any) => !attachedIds.has(t.id));
  }, [allTopics, progress]);

  // Unique subjects for filter tabs
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    unattachedTopics.forEach((t: any) => {
      if (t.subject) subs.add(t.subject);
    });
    return Array.from(subs);
  }, [unattachedTopics]);

  // Filtered unattached topics based on search & subject tab
  const filteredTopics = useMemo(() => {
    return unattachedTopics.filter((topic: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.description &&
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject =
        selectedSubject === "ALL" || topic.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [unattachedTopics, searchQuery, selectedSubject]);

  // Toggle selection of a topic, maintaining exact selection order
  const handleToggleSelectTopic = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  // Select all currently filtered topics
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredTopics.map((t: any) => t.id);
    setSelectedTopicIds((prev) => {
      const newSelections = [...prev];
      filteredIds.forEach((id: string) => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      return newSelections;
    });
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedTopicIds([]);
  };

  // Submit bulk topics to roadmap
  const attachSelectedTopics = async () => {
    if (selectedTopicIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicIds: selectedTopicIds }),
      });
      if (res.ok) {
        const newItems = await res.json();
        const itemsArray = Array.isArray(newItems) ? newItems : [newItems];
        setProgress((prev: any) => [...prev, ...itemsArray]);
        setShowAddModal(false);
        setSelectedTopicIds([]);
        setSearchQuery("");
        setSelectedSubject("ALL");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to add topics to roadmap.");
      }
    } catch (e) {
      console.error("Bulk attach topics error:", e);
      alert("An error occurred while adding topics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header Button */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Curriculum Roadmap
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {progress.length} lesson steps configured for this group.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTopicIds([]);
            setSearchQuery("");
            setSelectedSubject("ALL");
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:shadow-[#EBFF00]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topics to Roadmap</span>
        </button>
      </div>

      {/* Roadmap Steps */}
      <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 space-y-8">
        {progress.map((item: any, index: number) => {
          const isApproved = item.isApproved;
          const isCurrent =
            !isApproved && (index === 0 || progress[index - 1]?.isApproved);
          return (
            <div key={item.id} className="relative pl-8">
              <div
                className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-[#131313] ${
                  isApproved
                    ? "border-emerald-500"
                    : isCurrent
                    ? "border-[#EBFF00]"
                    : "border-slate-300 dark:border-white/20"
                }`}
              >
                {isApproved && (
                  <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                )}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-[#EBFF00]" />
                )}
              </div>
              <div
                className={`bg-white dark:bg-[#131313] border ${
                  isCurrent
                    ? "border-[#EBFF00]/80 shadow-md shadow-[#EBFF00]/10"
                    : "border-slate-200 dark:border-white/10"
                } rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b]">
                      Step {index + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-[#EBFF00] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      {item.topic.subject}
                    </span>
                  </div>
                  <h3
                    className={`font-bold text-lg ${
                      isApproved
                        ? "text-slate-500 dark:text-slate-400 line-through decoration-slate-400/40"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {item.topic.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {item.topic.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isApproved ? (
                    <button
                      onClick={() => toggleApproval(item.id, true)}
                      disabled={loading}
                      className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approved
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleApproval(item.id, false)}
                      disabled={loading}
                      className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors ${
                        isCurrent
                          ? "bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 shadow-sm"
                          : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {isCurrent ? "Approve Lesson" : "Pending"}
                    </button>
                  )}
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {progress.length === 0 && (
          <div className="pl-8 py-8 text-slate-500 dark:text-slate-400 text-sm">
            No topics assigned to this group yet. Click &quot;Add Topics to Roadmap&quot; to build the curriculum.
          </div>
        )}
      </div>

      {/* Multi-Select Add Topics Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Topics to Roadmap
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select topics in the exact order you want them taught to this group.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="py-4 space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search available topics by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EBFF00]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Subject Tabs & Quick Select All */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedSubject === "ALL"
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    All ({unattachedTopics.length})
                  </button>

                  {availableSubjects.map((subj) => {
                    const count = unattachedTopics.filter(
                      (t: any) => t.subject === subj,
                    ).length;
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSelectedSubject(subj)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedSubject === subj
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {subj} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {filteredTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Select All Filtered
                    </button>
                  )}
                  {selectedTopicIds.length > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="font-semibold text-red-500 hover:underline"
                      >
                        Clear Selection ({selectedTopicIds.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {unattachedTopics.length === 0
                    ? "All available topics have already been added to this group's roadmap!"
                    : "No matching topics found for your search filter."}
                </div>
              ) : (
                filteredTopics.map((topic: any) => {
                  const selectionIndex = selectedTopicIds.indexOf(topic.id);
                  const isSelected = selectionIndex !== -1;
                  const orderNumber = selectionIndex + 1;

                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleSelectTopic(topic.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#EBFF00]/10 border-[#EBFF00] dark:bg-[#EBFF00]/15 dark:border-[#EBFF00]/80 shadow-sm"
                          : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        {/* Order Badge / Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                            isSelected
                              ? "bg-slate-950 dark:bg-[#EBFF00] text-[#EBFF00] dark:text-slate-950 shadow-sm"
                              : "border-2 border-slate-300 dark:border-white/20 text-transparent"
                          }`}
                        >
                          {isSelected ? orderNumber : ""}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {topic.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {topic.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-white/10 border border-slate-300/50 dark:border-white/10">
                          {topic.subject}
                        </span>

                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-[#EBFF00] bg-[#EBFF00]/30 dark:bg-[#EBFF00]/20 px-1.5 py-0.5 rounded">
                            Step #{orderNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedTopicIds.length > 0 ? (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedTopicIds.length} topic
                    {selectedTopicIds.length > 1 ? "s" : ""} selected in sequence
                  </span>
                ) : (
                  <span>Select topics to add to the roadmap</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={attachSelectedTopics}
                  disabled={loading || selectedTopicIds.length === 0}
                  className="flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        Add {selectedTopicIds.length > 0 ? selectedTopicIds.length : ""}{" "}
                        Topic{selectedTopicIds.length === 1 ? "" : "s"} to Roadmap
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
