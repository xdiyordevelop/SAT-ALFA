"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Edit2,
  Trash2,
  BookOpen,
  UserPlus,
  X,
  Search,
} from "lucide-react";
import {
  updateGroup,
  deleteGroup,
  removeStudentFromGroup,
  addStudentToGroup,
} from "@/server/actions/group.actions";

export function GroupDetailContent({
  group,
  otherStudents,
  currentMonth,
}: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedStudentIds, setAddedStudentIds] = useState<Set<string>>(
    new Set(),
  );

  // Edit Form state
  const [editForm, setEditForm] = useState({
    name: group.name,
    monthlyFee: group.monthlyFee ? group.monthlyFee.toLocaleString() : "",
    description: group.description || "",
  });

  const formatUZS = (num: number) => {
    return num.toLocaleString() + " so'm";
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "monthlyFee") {
      const val = value.replace(/[^0-9]/g, "");
      setEditForm({
        ...editForm,
        monthlyFee: val ? parseInt(val).toLocaleString() : "",
      });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSaveEdit = () => {
    startTransition(async () => {
      await updateGroup(group.id, {
        name: editForm.name,
        monthlyFee: parseInt(editForm.monthlyFee.replace(/[^0-9]/g, "")) || 0,
        description: editForm.description,
      });
      setShowEditModal(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteGroup(group.id);
      setShowDeleteModal(false);
      router.push("/admin/groups");
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    if (
      confirm("Are you sure you want to remove this student from the group?")
    ) {
      startTransition(async () => {
        await removeStudentFromGroup(studentId, group.id);
        router.refresh();
      });
    }
  };

  const handleAddStudent = (studentId: string) => {
    setAddedStudentIds((prev) => new Set(prev).add(studentId));
    startTransition(async () => {
      await addStudentToGroup(group.id, studentId);
      router.refresh();
    });
  };

  const filteredStudents = otherStudents.filter((s: any) => {
    if (addedStudentIds.has(s.id)) return false;
    return (
      (s.firstName + " " + s.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      s.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* A. Group Header & Settings Bar */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBFF00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {group.name}
            </h1>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-xs font-bold tracking-wider">
              {group.status}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">
            {group.description || "No description provided."}
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBFF00]/10 flex items-center justify-center text-yellow-500">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {group.studentProfiles.length} Students
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBFF00]/10 flex items-center justify-center text-yellow-500 font-bold">
                $
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {formatUZS(group.monthlyFee)} / oy
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            href={`/admin/groups/${group.id}/curriculum`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-900 dark:text-yellow-500" />
            Syllabus Roadmap
          </Link>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-lg font-bold transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Group
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* B & C. Enrolled Students Management Table */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Enrolled Students
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage memberships and track current month payments.
            </p>
          </div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-lg font-bold transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {group.studentProfiles.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-700 dark:text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
              No students enrolled
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Click the button above to add students to this group.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#0a0a0a]">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Enrolled Date</th>
                  <th className="py-4 px-6">Payment ({currentMonth})</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800/50">
                {group.studentProfiles.map((student: any) => {
                  const payment = student.payments?.[0];
                  const amountPaid = payment?.amountPaid || 0;
                  const debt = Math.max(0, group.monthlyFee - amountPaid);

                  let status = "UNPAID";
                  if (amountPaid >= group.monthlyFee && group.monthlyFee > 0)
                    status = "PAID";
                  else if (amountPaid > 0) status = "PARTIAL";
                  else if (group.monthlyFee === 0) status = "PAID";

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.user?.username && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            @{student.user.username}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {student.phone || "—"}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {status === "PAID" && (
                          <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[11px] font-bold tracking-wider">
                            PAID
                          </span>
                        )}
                        {status === "PARTIAL" && (
                          <span className="inline-block px-2.5 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-yellow-500 border border-yellow-500/20 rounded-md text-[11px] font-bold tracking-wider">
                            PARTIAL (-{formatUZS(debt)})
                          </span>
                        )}
                        {status === "UNPAID" && (
                          <span className="inline-block px-2.5 py-1 bg-red-500/10 text-red-600 border border-red-500/20 rounded-md text-[11px] font-bold tracking-wider">
                            UNPAID
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Edit Group Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Monthly Fee (UZS)
                </label>
                <input
                  type="text"
                  name="monthlyFee"
                  value={editForm.monthlyFee}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1c1b1b] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 transition-colors font-bold disabled:opacity-50 flex items-center justify-center"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-slide-up text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Delete Group?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 dark:text-white">
                {group.name}
              </strong>
              ? This will remove the group from all students. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1c1b1b] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white transition-colors font-bold disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Add Student to Group
              </h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                />
              </div>
            </div>
            <div className="px-6 pb-6 overflow-y-auto min-h-[300px]">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No unassigned students found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-slate-200 dark:border-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {student.user?.username
                            ? `@${student.user.username}`
                            : "No username"}
                          {student.group && (
                            <span className="ml-2 text-yellow-500/80">
                              • Currently in {student.group.name}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        disabled={isPending}
                        className="px-4 py-2 text-sm bg-[#EBFF00]/10 hover:bg-[#EBFF00]/20 text-slate-900 dark:text-yellow-500 border border-yellow-500/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Add to Group
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
