"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Layers,
  MonitorPlay,
  Map,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react";
import {
  toggleTopicApproval,
  assignTopicToGroup,
  removeTopicFromGroup,
  reorderGroupSyllabus,
  deleteTopic,
} from "./actions";

interface Topic {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  bookTitle: string | null;
  bookPdfPath: string | null;
  videoPath: string | null;
}

interface GroupTopicProgress {
  id: string;
  groupId: string;
  topicId: string;
  order: number;
  isApproved: boolean;
  approvedAt: Date | null;
  topic: Topic;
}

interface Group {
  id: string;
  name: string;
  groupProgress: GroupTopicProgress[];
}

interface Props {
  topics: Topic[];
  groups: Group[];
}

export default function TopicsDashboardClient({ topics, groups }: Props) {
  const [activeMode, setActiveMode] = useState<"bank" | "roadmap">("bank");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups[0]?.id || "",
  );
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null); // holds topicId
  const [roadmapAssignModal, setRoadmapAssignModal] = useState(false);

  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  // Filtered Topics for Bank Mode
  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject =
      subjectFilter === "ALL" || t.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Action Handlers
  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    await deleteTopic(topicId);
  };

  const handleToggleApproval = async (
    groupId: string,
    topicId: string,
    currentStatus: boolean,
  ) => {
    await toggleTopicApproval(groupId, topicId, !currentStatus);
  };

  const handleRemoveFromGroup = async (groupId: string, topicId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this topic from the group syllabus?",
      )
    )
      return;
    await removeTopicFromGroup(groupId, topicId);
  };

  const handleAssignToGroup = async (groupId: string, topicId: string) => {
    await assignTopicToGroup(groupId, topicId);
    setAssignModalOpen(null);
    setRoadmapAssignModal(false);
  };

  const handleReorder = async (
    direction: "up" | "down",
    currentIndex: number,
  ) => {
    if (!activeGroup) return;
    const items = [...activeGroup.groupProgress].sort(
      (a, b) => a.order - b.order,
    );
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === items.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap order values
    const tempOrder = items[currentIndex].order;
    items[currentIndex].order = items[swapIndex].order;
    items[swapIndex].order = tempOrder;

    await reorderGroupSyllabus(activeGroup.id, [
      {
        topicId: items[currentIndex].topicId,
        order: items[currentIndex].order,
      },
      { topicId: items[swapIndex].topicId, order: items[swapIndex].order },
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mode Selector (Tabs) */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveMode("bank")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeMode === "bank"
              ? "border-yellow-500 text-slate-900 dark:text-yellow-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Topic Repository
        </button>
        <button
          onClick={() => setActiveMode("roadmap")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeMode === "roadmap"
              ? "border-yellow-500 text-slate-900 dark:text-yellow-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <Map className="w-4 h-4" />
          Group Roadmap
        </button>
      </div>

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
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 outline-none transition-all"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all min-w-[200px]"
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      topic.subject === "MATH"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {topic.subject === "MATH" ? "Math" : "Reading & Writing"}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/topics/${topic.id}/edit`}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
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

                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                  {topic.description || "No description"}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                  {topic.videoPath && (
                    <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      <MonitorPlay className="w-3 h-3" /> Video
                    </span>
                  )}
                  {topic.bookPdfPath && (
                    <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      <Layers className="w-3 h-3" /> PDF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setAssignModalOpen(topic.id)}
                  className="w-full py-2 bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white rounded font-medium text-xs transition-colors mt-auto"
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

      {activeMode === "roadmap" && (
        <div className="animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#131313] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Select Group
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all font-medium"
              >
                {groups.length === 0 && (
                  <option value="">No groups available</option>
                )}
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {activeGroup && (
              <button
                onClick={() => setRoadmapAssignModal(true)}
                className="px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 sm:mt-6"
              >
                <Plus className="w-4 h-4" /> Add Lesson to Group
              </button>
            )}
          </div>

          {activeGroup ? (
            <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 space-y-6 pb-12">
              {activeGroup.groupProgress.length > 0 ? (
                [...activeGroup.groupProgress]
                  .sort((a, b) => a.order - b.order)
                  .map((progress, index, arr) => {
                    const isApproved = progress.isApproved;
                    const isCurrent =
                      !isApproved &&
                      (index === 0 || arr[index - 1]?.isApproved);

                    return (
                      <div key={progress.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div
                          className={`absolute -left-[11px] top-5 w-5 h-5 rounded-full border-2 bg-white dark:bg-[#131313] ] flex items-center justify-center {
 isApproved ? 'border-emerald-500' : isCurrent ? 'border-yellow-500' : 'border-neutral-300 '
 }`}
                        >
                          {isApproved && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          )}
                          {isCurrent && (
                            <div className="w-2 h-2 rounded-full bg-[#EBFF00]" />
                          )}
                        </div>

                        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 ">
                                Step {index + 1}
                              </span>
                              <span
                                className={`text-xs font-bold {
 isApproved ? 'text-emerald-600 ' :
 isCurrent ? 'text-slate-900 dark:text-yellow-500 ' :
 'text-slate-500 dark:text-slate-400'
 }`}
                              >
                                {isApproved
                                  ? "Completed"
                                  : isCurrent
                                    ? "Current Lesson"
                                    : "Upcoming"}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
                              {progress.topic.title}
                            </h3>
                            <div className="flex gap-4 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <span>
                                {progress.topic.subject === "MATH"
                                  ? "Math"
                                  : "Reading & Writing"}
                              </span>
                              {isApproved && progress.approvedAt && (
                                <span className="text-emerald-600">
                                  Unlocked on:{" "}
                                  {new Date(
                                    progress.approvedAt,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-[#0a0a0a] p-2 rounded-lg">
                            {/* Up/Down */}
                            <div className="flex flex-col gap-1 mr-2">
                              <button
                                onClick={() => handleReorder("up", index)}
                                disabled={index === 0}
                                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-30 transition-colors bg-white dark:bg-[#131313] rounded border border-slate-200 dark:border-white/10 "
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleReorder("down", index)}
                                disabled={index === arr.length - 1}
                                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-30 transition-colors bg-white dark:bg-[#131313] rounded border border-slate-200 dark:border-white/10 "
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Approve Toggle */}
                            <button
                              onClick={() =>
                                handleToggleApproval(
                                  activeGroup.id,
                                  progress.topicId,
                                  progress.isApproved,
                                )
                              }
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors border {
 progress.isApproved 
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 '
 : 'bg-white dark:bg-[#131313] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] '
 }`}
                            >
                              {progress.isApproved ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" /> Unlocked
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" /> Unlock
                                </>
                              )}
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() =>
                                handleRemoveFromGroup(
                                  activeGroup.id,
                                  progress.topicId,
                                )
                              }
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                              title="Remove from syllabus"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="pl-8 text-slate-500 dark:text-slate-400 ">
                  This group has no topics in its syllabus yet.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl">
              <Map className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Please select a group to view its roadmap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assign Modal (From Bank) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]/60 p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 ">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white ">
                Assign to Group
              </h3>
              <button
                onClick={() => setAssignModalOpen(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white "
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Group
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {groups.map((g) => {
                  const isAssigned = g.groupProgress.some(
                    (gp) => gp.topicId === assignModalOpen,
                  );
                  return (
                    <button
                      key={g.id}
                      disabled={isAssigned}
                      onClick={() => handleAssignToGroup(g.id, assignModalOpen)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-yellow-500 flex justify-between items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-medium text-slate-900 dark:text-white ">
                        {g.name}
                      </span>
                      {isAssigned && (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          Biriktirilgan
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

      {/* Assign Modal (From Roadmap) */}
      {roadmapAssignModal && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]/60 p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10 ">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white ">
                Add Lesson to Syllabus
              </h3>
              <button
                onClick={() => setRoadmapAssignModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white "
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {topics.map((t) => {
                  const isAssigned = activeGroup.groupProgress.some(
                    (gp) => gp.topicId === t.id,
                  );
                  return (
                    <button
                      key={t.id}
                      disabled={isAssigned}
                      onClick={() => handleAssignToGroup(activeGroup.id, t.id)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-xs font-bold text-yellow-500 mb-1">
                        {t.subject === "MATH" ? "Math" : "Reading & Writing"}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                        {t.title}
                      </div>
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
