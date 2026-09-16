"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Layers,
  MonitorPlay,
  Map,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { deleteTopic } from "./actions";
import GroupCurriculumManager, {
  Topic,
  GroupTopicProgress,
} from "@/components/admin/curriculum/GroupCurriculumManager";

interface Group {
  id: string;
  name: string;
  groupProgress: GroupTopicProgress[];
}

interface Props {
  topics: Topic[];
  groups: Group[];
  initialTab?: string;
  initialGroupId?: string;
}

export default function TopicsDashboardClient({
  topics,
  groups,
  initialTab,
  initialGroupId,
}: Props) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<"bank" | "roadmap">(
    initialTab === "roadmap" ? "roadmap" : "bank",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId && groups.some((g) => g.id === initialGroupId)
      ? initialGroupId
      : groups[0]?.id || "",
  );
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null); // holds topicId
  const [assigning, setAssigning] = useState(false);

  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  const handleTabChange = (mode: "bank" | "roadmap") => {
    setActiveMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", mode);
      if (mode === "roadmap" && selectedGroupId) {
        url.searchParams.set("groupId", selectedGroupId);
      } else {
        url.searchParams.delete("groupId");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "roadmap");
      url.searchParams.set("groupId", groupId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Filtered Topics for Bank Mode
  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject =
      subjectFilter === "ALL" || t.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    await deleteTopic(topicId);
  };

  const handleAssignToGroup = async (groupId: string, topicId: string) => {
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicIds: [topicId] }),
      });
      if (res.ok) {
        setAssignModalOpen(null);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to assign topic");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to assign topic");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mode Selector (Tabs) */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => handleTabChange("bank")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeMode === "bank"
              ? "border-[#EBFF00] text-slate-900 dark:text-[#EBFF00]"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Topic Repository
        </button>
        <button
          onClick={() => handleTabChange("roadmap")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeMode === "roadmap"
              ? "border-[#EBFF00] text-slate-900 dark:text-[#EBFF00]"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <Map className="w-4 h-4" />
          Group Roadmap
        </button>
      </div>

      {/* Mode 1: Topic Repository (Bank) */}
      {activeMode === "bank" && (
        <div className="animate-slide-up">
          {/* Search & Filter */}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics by title..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00] outline-none transition-all"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00] outline-none transition-all min-w-[200px]"
            >
              <option value="ALL">All Subjects</option>
              <option value="MATH">Math</option>
              <option value="READING_WRITING">Reading & Writing</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col shadow-sm"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md flex-shrink-0 ${
                      topic.subject === "MATH"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-[#EBFF00]/20 text-slate-900 dark:text-[#EBFF00]"
                    }`}
                  >
                    {topic.subject === "MATH" ? "Math" : "Reading & Writing"}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/topics/${topic.id}/edit`}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#EBFF00] dark:hover:text-[#d9ff00] hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {topic.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                  {topic.videoPath && (
                    <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                      <MonitorPlay className="w-3 h-3" /> Video
                    </span>
                  )}
                  {topic.bookPdfPath && (
                    <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                      <Layers className="w-3 h-3" /> PDF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setAssignModalOpen(topic.id)}
                  className="w-full py-2 bg-slate-100 hover:bg-[#EBFF00] hover:text-slate-950 dark:bg-white/5 dark:hover:bg-[#EBFF00] dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs transition-colors mt-auto border border-slate-200 dark:border-white/10"
                >
                  + Assign to Group
                </button>
              </div>
            ))}

            {filteredTopics.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl">
                <BookOpen className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No topics found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Unified Group Roadmap */}
      {activeMode === "roadmap" && (
        <div className="animate-slide-up">
          {activeGroup ? (
            <GroupCurriculumManager
              key={activeGroup.id}
              groupId={activeGroup.id}
              groupName={activeGroup.name}
              initialProgress={activeGroup.groupProgress}
              allTopics={topics}
              groupSelector={
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                    Class / Group:
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] outline-none transition-all font-semibold text-sm"
                  >
                    {groups.length === 0 && (
                      <option value="">No groups available</option>
                    )}
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.groupProgress.length} topics)
                      </option>
                    ))}
                  </select>
                </div>
              }
            />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl">
              <Map className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Please select a group to view and configure its curriculum roadmap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assign Modal (From Bank Mode) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-white/10">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Assign Topic to Group
              </h3>
              <button
                onClick={() => setAssignModalOpen(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Choose Target Group
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {groups.map((g) => {
                  const isAssigned = g.groupProgress.some(
                    (gp) => gp.topicId === assignModalOpen,
                  );
                  return (
                    <button
                      key={g.id}
                      disabled={isAssigned || assigning}
                      onClick={() => handleAssignToGroup(g.id, assignModalOpen)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-[#EBFF00] flex justify-between items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {g.name}
                      </span>
                      {isAssigned && (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                          Already Added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
