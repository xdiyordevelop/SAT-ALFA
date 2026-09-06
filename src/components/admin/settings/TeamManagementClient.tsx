"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Key,
  Phone,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Lock,
  User,
} from "lucide-react";
import {
  TeamMemberItem,
  StaffRole,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/server/actions/team.actions";

interface TeamManagementClientProps {
  initialMembers: TeamMemberItem[];
  currentUserId: string;
}

export function TeamManagementClient({
  initialMembers,
  currentUserId,
}: TeamManagementClientProps) {
  const [members, setMembers] = useState<TeamMemberItem[]>(initialMembers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for Add
  const [addFullName, setAddFullName] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<StaffRole>("TEACHER");
  const [addPhone, setAddPhone] = useState("");
  const [addRoleTitle, setAddRoleTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Form states for Edit
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<StaffRole>("TEACHER");
  const [editPhone, setEditPhone] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const resetAddForm = () => {
    setAddFullName("");
    setAddUsername("");
    setAddPassword("");
    setAddRole("TEACHER");
    setAddPhone("");
    setAddRoleTitle("");
    setFormError(null);
  };

  const handleOpenEdit = (member: TeamMemberItem) => {
    setEditingMember(member);
    setEditFullName(member.fullName);
    setEditRole((member.role as StaffRole) || "TEACHER");
    setEditPhone(member.phone || "");
    setEditRoleTitle(member.roleTitle || "");
    setEditPassword("");
    setFormError(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await createTeamMember({
        fullName: addFullName,
        username: addUsername,
        password: addPassword,
        role: addRole,
        phone: addPhone,
        roleTitle: addRoleTitle,
      });

      if (!res.success) {
        setFormError(res.error || "Failed to create staff member");
      } else if (res.member) {
        setMembers((prev) => [...prev, res.member as TeamMemberItem]);
        setIsAddOpen(false);
        resetAddForm();
        setActionMessage("Staff member added successfully!");
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await updateTeamMember(editingMember.id, {
        fullName: editFullName,
        role: editRole,
        phone: editPhone,
        roleTitle: editRoleTitle,
        ...(editPassword.trim() ? { password: editPassword.trim() } : {}),
      });

      if (!res.success) {
        setFormError(res.error || "Failed to update staff member");
      } else {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingMember.id
              ? {
                  ...m,
                  fullName: editFullName,
                  role: editRole,
                  phone: editPhone || null,
                  roleTitle: editRoleTitle || null,
                }
              : m
          )
        );
        setEditingMember(null);
        setActionMessage("Staff member details updated!");
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await deleteTeamMember(id);
      if (!res.success) {
        alert(res.error || "Failed to delete staff member");
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setDeleteConfirmId(null);
        setActionMessage("Staff member removed.");
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return {
          label: "Super Admin",
          icon: ShieldAlert,
          classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        };
      case "TEACHER":
        return {
          label: "Teacher",
          icon: GraduationCap,
          classes: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
        };
      case "MANAGER":
        return {
          label: "Manager",
          icon: Briefcase,
          classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        };
      default:
        return {
          label: role,
          icon: ShieldCheck,
          classes: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/30 text-slate-900 dark:text-white flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[#EBFF00]" />
            <span className="text-sm font-semibold">{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Cards & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EBFF00]" />
            <span>Staff Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold ml-1">
              {members.length} members
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control platform roles, curriculum authors, and reception managers
          </p>
        </div>

        <button
          onClick={() => {
            resetAddForm();
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d6e800] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Members Table Card */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-6">Role & Scope</th>
                <th className="py-3.5 px-6">Contact</th>
                <th className="py-3.5 px-6">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const badge = getRoleBadge(member.role);
                  const Icon = badge.icon;
                  const isCurrent = member.id === currentUserId;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm shrink-0">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {member.fullName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-[#EBFF00]/20 text-[#EBFF00] border border-[#EBFF00]/30 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block truncate">
                              @{member.username}
                              {member.roleTitle ? ` • ${member.roleTitle}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${badge.classes}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                        {member.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {member.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Edit staff member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isCurrent && (
                            <>
                              {deleteConfirmId === member.id ? (
                                <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/20">
                                  <button
                                    onClick={() => handleDelete(member.id)}
                                    disabled={isSubmitting}
                                    className="p-1 text-rose-500 hover:bg-rose-500 hover:text-white rounded transition-colors text-xs font-bold"
                                    title="Confirm deletion"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors text-xs"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(member.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                  title="Delete staff member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add New Staff Member
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set credentials and assign specific role permissions
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jasur Aliyev"
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jasur_sat or jasur@gmail.com"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 chars"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform Role *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Super Admin */}
                  <div
                    onClick={() => setAddRole("SUPER_ADMIN")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      addRole === "SUPER_ADMIN"
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Super Admin</span>
                    </div>
                    <p className="text-[10px] mt-1 opacity-70 leading-tight">
                      Full access, team & settings
                    </p>
                  </div>

                  {/* Teacher */}
                  <div
                    onClick={() => setAddRole("TEACHER")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      addRole === "TEACHER"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Teacher</span>
                    </div>
                    <p className="text-[10px] mt-1 opacity-70 leading-tight">
                      Topics, tests, reading & groups
                    </p>
                  </div>

                  {/* Manager */}
                  <div
                    onClick={() => setAddRole("MANAGER")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      addRole === "MANAGER"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Manager</span>
                    </div>
                    <p className="text-[10px] mt-1 opacity-70 leading-tight">
                      Students, payments & attendance
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional Phone & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Role Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead SAT Instructor"
                    value={addRoleTitle}
                    onChange={(e) => setAddRoleTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d6e800] text-black text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Staff Member
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update profile, role, or reset password for @{editingMember.username}
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform Role *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setEditRole("SUPER_ADMIN")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      editRole === "SUPER_ADMIN"
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Super Admin</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setEditRole("TEACHER")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      editRole === "TEACHER"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Teacher</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setEditRole("MANAGER")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      editRole === "MANAGER"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Manager</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Phone & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>
              </div>

              {/* Password Reset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 chars)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d6e800] text-black text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
