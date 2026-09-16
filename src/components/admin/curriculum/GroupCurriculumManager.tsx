"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Plus,
  Search,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Lock,
  BookOpen,
} from "lucide-react";

export interface Topic {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  bookTitle?: string | null;
  bookPdfPath?: string | null;
  videoPath?: string | null;
}

export interface GroupTopicProgress {
  id: string;
  groupId: string;
  topicId: string;
  order: number;
  isApproved: boolean;
  approvedAt?: string | Date | null;
  topic: Topic;
}

interface Props {
  groupId: string;
  groupName?: string;
  initialProgress: GroupTopicProgress[];
  allTopics: Topic[];
  onProgressChange?: (newProgress: GroupTopicProgress[]) => void;
}

export default function GroupCurriculumManager({
  groupId,
  groupName,
  initialProgress,
  allTopics,
  onProgressChange,
}: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState<GroupTopicProgress[]>(initialProgress);
  const [loading, setLoading] = useState(false);

  // Sync state whenever groupId or initialProgress changes
  useEffect(() => {
    setProgress(initialProgress);
  }, [groupId, initialProgress]);

  const updateProgressState = (newProgress: GroupTopicProgress[]) => {
    setProgress(newProgress);
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  };

  // Multi-select modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  // Toggle approval status
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
        const updatedList = progress.map((p) =>
          p.id === progressId
            ? {
                ...p,
                isApproved: updated.isApproved,
                approvedAt: updated.approvedAt,
              }
            : p,
        );
        updateProgressState(updatedList);
        router.refresh();
      }
    } catch (e) {
      console.error("Toggle approval error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Reorder roadmap items
  const handleReorder = async (direction: "up" | "down", currentIndex: number) => {
    const sorted = [...progress].sort((a, b) => a.order - b.order);
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sorted.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const tempOrder = sorted[currentIndex].order;
    sorted[currentIndex].order = sorted[swapIndex].order;
    sorted[swapIndex].order = tempOrder;

    // Sort again
    sorted.sort((a, b) => a.order - b.order);
    updateProgressState(sorted);

    try {
      await fetch(`/api/admin/groups/${groupId}/curriculum`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: sorted.map((p, idx) => ({ id: p.id, order: idx + 1 })),
        }),
      });
      router.refresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  };

  // Remove topic from group
  const handleRemoveTopic = async (progressId: string, topicTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${topicTitle}" from this group's syllabus?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/curriculum?progressId=${progressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const remaining = progress.filter((p) => p.id !== progressId);
        updateProgressState(remaining);
        router.refresh();
      }
    } catch (err) {
      console.error("Remove topic error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Available topics not yet attached to this group's curriculum
  const unattachedTopics = useMemo(() => {
    const attachedIds = new Set(progress.map((p) => p.topicId));
    return allTopics.filter((t) => !attachedIds.has(t.id));
  }, [allTopics, progress]);

  // Unique subjects for filter tabs
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    unattachedTopics.forEach((t) => {
      if (t.subject) subs.add(t.subject);
    });
    return Array.from(subs);
  }, [unattachedTopics]);

  // Filtered unattached topics based on search & subject tab
  const filteredTopics = useMemo(() => {
    return unattachedTopics.filter((topic) => {
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
    const filteredIds = filteredTopics.map((t) => t.id);
    setSelectedTopicIds((prev) => {
      const newSelections = [...prev];
      filteredIds.forEach((id) => {
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
        updateProgressState([...progress, ...itemsArray]);
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

  const sortedProgress = [...progress].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131313] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#EBFF00]" />
            {groupName ? `Curriculum Roadmap: ${groupName}` : "Curriculum Roadmap"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sortedProgress.length} lesson steps configured. Topics unlock for students sequentially or upon approval.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTopicIds([]);
            setSearchQuery("");
            setSelectedSubject("ALL");
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:shadow-[#EBFF00]/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topics to Roadmap</span>
        </button>
      </div>

      {/* Roadmap Steps */}
      <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 space-y-6 pb-6">
        {sortedProgress.map((item, index) => {
          const isApproved = item.isApproved;
          const isCurrent =
            !isApproved && (index === 0 || sortedProgress[index - 1]?.isApproved);

          return (
            <div key={item.id} className="relative pl-8">
              {/* Status Circle indicator */}
              <div
                className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-[#131313] transition-colors ${
                  isApproved
                    ? "border-emerald-500 text-emerald-500"
                    : isCurrent
                    ? "border-[#EBFF00] text-[#EBFF00]"
                    : "border-slate-300 dark:border-white/20"
                }`}
              >
                {isApproved ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-[#EBFF00]" />
                ) : null}
              </div>

              {/* Step Card */}
              <div
                className={`bg-white dark:bg-[#131313] border ${
                  isCurrent
                    ? "border-[#EBFF00] dark:border-[#EBFF00]/80 shadow-md shadow-[#EBFF00]/10"
                    : "border-slate-200 dark:border-white/10"
                } rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b]">
                      Step {index + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-[#EBFF00] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      {item.topic.subject}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isApproved
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                          ? "text-slate-900 dark:text-[#EBFF00]"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {isApproved
                        ? "Completed"
                        : isCurrent
                        ? "Current Active Lesson"
                        : "Upcoming"}
                    </span>
                  </div>

                  <h3
                    className={`font-bold text-base md:text-lg ${
                      isApproved
                        ? "text-slate-500 dark:text-slate-400 line-through decoration-slate-400/40"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {item.topic.title}
                  </h3>

                  {item.topic.description && (
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.topic.description}
                    </p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2.5 shrink-0 bg-slate-50/70 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100 dark:border-white/5">
                  {/* Up / Down Reorder */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder("up", index)}
                      disabled={index === 0 || loading}
                      title="Move Up"
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors bg-white dark:bg-[#131313] rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder("down", index)}
                      disabled={index === sortedProgress.length - 1 || loading}
                      title="Move Down"
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors bg-white dark:bg-[#131313] rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Approve / Lock Toggle */}
                  {isApproved ? (
                    <button
                      onClick={() => toggleApproval(item.id, true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleApproval(item.id, false)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 shadow-sm"
                          : "bg-white dark:bg-[#131313] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      {isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                      <span>{isCurrent ? "Approve / Unlock" : "Unlock"}</span>
                    </button>
                  )}

                  {/* Remove from Group */}
                  <button
                    onClick={() => handleRemoveTopic(item.id, item.topic.title)}
                    disabled={loading}
                    title="Remove from group roadmap"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedProgress.length === 0 && (
          <div className="pl-8 py-12 text-center bg-white dark:bg-[#131313] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
              No topics assigned to this group yet.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Click &quot;Add Topics to Roadmap&quot; to build the group syllabus in your desired sequence.
            </p>
          </div>
        )}
      </div>

      {/* Multi-Select Add Topics Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Topics to Roadmap
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click topics in the exact sequence you want them added to this group.
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics by title or description..."
                  className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Subject Filter Tabs & Quick Actions */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedSubject === "ALL"
                        ? "bg-slate-950 dark:bg-[#EBFF00] text-[#EBFF00] dark:text-slate-950"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    All ({unattachedTopics.length})
                  </button>
                  {availableSubjects.map((sub) => {
                    const count = unattachedTopics.filter(
                      (t) => t.subject === sub,
                    ).length;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubject(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedSubject === sub
                            ? "bg-slate-950 dark:bg-[#EBFF00] text-[#EBFF00] dark:text-slate-950"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                      >
                        {sub} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 text-xs">
                  {filteredTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] font-medium transition-colors"
                    >
                      Select All Filtered
                    </button>
                  )}
                  {selectedTopicIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-red-500 hover:text-red-600 font-medium transition-colors ml-2"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[400px]">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {unattachedTopics.length === 0
                    ? "All available topics have already been added to this group's curriculum."
                    : "No matching topics found for your search filter."}
                </div>
              ) : (
                filteredTopics.map((topic) => {
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
