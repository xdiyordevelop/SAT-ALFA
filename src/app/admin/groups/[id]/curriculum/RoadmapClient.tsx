"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Plus,
  Check,
} from "lucide-react";
export default function RoadmapClient({
  groupId,
  initialProgress,
  allTopics,
}: any) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
  const attachTopic = async (topicId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      if (res.ok) {
        const newProgress = await res.json();
        setProgress([...progress, newProgress]);
        setShowAddModal(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {" "}
      <div className="flex justify-end mb-6">
        {" "}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {" "}
          <Plus className="w-4 h-4" /> Add Topic to Roadmap{" "}
        </button>{" "}
      </div>{" "}
      <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 space-y-8">
        {" "}
        {progress.map((item: any, index: number) => {
          const isApproved = item.isApproved;
          const isCurrent =
            !isApproved && (index === 0 || progress[index - 1]?.isApproved);
          return (
            <div key={item.id} className="relative pl-8">
              {" "}
              <div
                className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-[#131313] { isApproved ?'border-green-500' : isCurrent ?'border-yellow-500' :'border-neutral-300' }`}
              >
                {" "}
                {isApproved && (
                  <Check className="w-3 h-3 text-green-500" />
                )}{" "}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-[#EBFF00]" />
                )}{" "}
              </div>{" "}
              <div
                className={`bg-white dark:bg-[#131313] border {isCurrent ?'border-yellow-500 shadow-sm shadow-yellow-500/20' :'border-slate-200 dark:border-white/10'} rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}
              >
                {" "}
                <div>
                  {" "}
                  <div className="flex items-center gap-2 mb-1">
                    {" "}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b]">
                      {" "}
                      Step {index + 1}{" "}
                    </span>{" "}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]">
                      {" "}
                      {item.topic.subject}{" "}
                    </span>{" "}
                  </div>{" "}
                  <h3
                    className={`font-bold text-lg {isApproved ?'text-slate-500 dark:text-slate-400 line-through decoration-neutral-500/30' :'text-slate-900 dark:text-white'}`}
                  >
                    {" "}
                    {item.topic.title}{" "}
                  </h3>{" "}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {" "}
                    {item.topic.description || "No description"}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="flex items-center gap-3">
                  {" "}
                  {isApproved ? (
                    <button
                      onClick={() => toggleApproval(item.id, true)}
                      disabled={loading}
                      className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      {" "}
                      <CheckCircle2 className="w-4 h-4" /> Approved{" "}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleApproval(item.id, false)}
                      disabled={loading}
                      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors { isCurrent ?'bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900' :'bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 hover:bg-neutral-200' }`}
                    >
                      {" "}
                      {isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}{" "}
                      {isCurrent ? "Approve Lesson" : "Pending"}{" "}
                    </button>
                  )}{" "}
                  <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400">
                    {" "}
                    <MoreVertical className="w-5 h-5" />{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          );
        })}{" "}
        {progress.length === 0 && (
          <div className="pl-8 text-slate-500 dark:text-slate-400 text-sm">
            {" "}
            No topics assigned to this group yet.{" "}
          </div>
        )}{" "}
      </div>{" "}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]/50 p-4">
          {" "}
          <div className="bg-white dark:bg-[#131313] rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-white/10">
            {" "}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Attach Topic
            </h2>{" "}
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-6">
              {" "}
              {allTopics
                .filter(
                  (t: any) => !progress.some((p: any) => p.topicId === t.id),
                )
                .map((topic: any) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10"
                  >
                    {" "}
                    <div>
                      {" "}
                      <p className="font-medium text-slate-900 dark:text-white">
                        {topic.title}
                      </p>{" "}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {topic.subject}
                      </p>{" "}
                    </div>{" "}
                    <button
                      onClick={() => attachTopic(topic.id)}
                      className="text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-yellow-500 px-3 py-1.5 rounded hover:bg-yellow-100 dark:bg-yellow-900/30"
                    >
                      {" "}
                      Add{" "}
                    </button>{" "}
                  </div>
                ))}{" "}
            </div>{" "}
            <div className="flex justify-end">
              {" "}
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-neutral-200 text-slate-900 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
