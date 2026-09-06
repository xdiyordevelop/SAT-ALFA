"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  Save,
  RotateCcw,
  Search,
  CheckSquare,
  Users,
  GraduationCap,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  bulkMarkAttendance,
  getGroupStudents,
  getAttendanceForDate,
} from "@/server/actions/attendance.actions";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  enrollmentDate?: Date;
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note: string;
}

interface AttendanceMarkingWorkspaceProps {
  onAttendanceSaved?: () => void;
  initialGroupId?: string;
  initialDate?: string;
}

const getLocalDateStr = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function AttendanceMarkingWorkspace({
  onAttendanceSaved,
  initialGroupId,
  initialDate,
}: AttendanceMarkingWorkspaceProps) {
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroupId || "");
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isFutureDate = selectedDate > todayStr;
  const isToday = selectedDate === todayStr;

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetch("/api/admin/groups");
        const data = await response.json();
        setGroups(data);
        if (!selectedGroup && data.length > 0) {
          setSelectedGroup(data[0].id);
        }
      } catch (err) {
        setError("Failed to load classes and groups");
      } finally {
        setGroupsLoading(false);
      }
    };
    loadGroups();
  }, []);

  // Load students & existing attendance when group or date changes
  useEffect(() => {
    if (!selectedGroup) return;

    const loadStudentsAndAttendance = async () => {
      setLoading(true);
      setError("");
      try {
        const studentList = await getGroupStudents(selectedGroup);
        setStudents(studentList as Student[]);

        // Load existing attendance records for the selected group & date
        const existingRecords = await getAttendanceForDate(
          selectedGroup,
          new Date(selectedDate)
        );

        const attendanceMap: Record<string, AttendanceRecord> = {};
        existingRecords.forEach((record: any) => {
          attendanceMap[record.studentId] = {
            studentId: record.studentId,
            status: record.status as AttendanceStatus,
            note: record.note || "",
          };
        });

        setAttendance(attendanceMap);
      } catch (err: any) {
        setError("Failed to load students for the selected group");
      } finally {
        setLoading(false);
      }
    };

    loadStudentsAndAttendance();
  }, [selectedGroup, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status,
        note: prev[studentId]?.note || "",
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status: prev[studentId]?.status || "PRESENT",
        note,
      },
    }));
  };

  const handleSelectAll = (status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceRecord> = { ...attendance };
    students.forEach((student) => {
      newAttendance[student.id] = {
        studentId: student.id,
        status,
        note: attendance[student.id]?.note || "",
      };
    });
    setAttendance(newAttendance);
  };

  const handleClearAll = () => {
    setAttendance({});
  };

  const handleSave = async () => {
    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    if (isFutureDate) {
      setError("This date has not arrived yet! Attendance cannot be recorded for future dates.");
      return;
    }

    const recordsToSave = Object.values(attendance);
    if (recordsToSave.length === 0) {
      setError("No attendance records marked yet. Mark students before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = recordsToSave.map((record) => ({
        studentId: record.studentId,
        groupId: selectedGroup,
        date: new Date(selectedDate),
        status: record.status,
        note: record.note,
      }));

      await bulkMarkAttendance(payload);
      setSuccess(`Attendance successfully saved for ${payload.length} student(s)!`);
      if (onAttendanceSaved) {
        onAttendanceSaved();
      }
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const query = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query))
    );
  }, [students, searchTerm]);

  // Dynamic Presence Analytics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((s) => {
      const rec = attendance[s.id];
      if (rec) {
        if (rec.status === "PRESENT") present++;
        else if (rec.status === "ABSENT") absent++;
        else if (rec.status === "LATE") late++;
        else if (rec.status === "EXCUSED") excused++;
      }
    });

    const total = students.length;
    const marked = present + absent + late + excused;
    const unmarked = total - marked;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, marked, present, absent, late, excused, unmarked, percent };
  }, [students, attendance]);

  const selectedGroupName = groups.find((g) => g.id === selectedGroup)?.name || "Select Group";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter and Group Header Card */}
      <div className="bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Group Selector */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#EBFF00]" />
              Select Group / Class
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              disabled={groupsLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 transition-all cursor-pointer"
            >
              {groups.length === 0 ? (
                <option value="">No groups found</option>
              ) : (
                groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date Selector with Today Button */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                Attendance Date
              </label>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[11px] font-bold text-[#EBFF00] hover:underline flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" /> Jump to Today
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Counters & Attendance Metrics */}
        {students.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Presence Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Total: {stats.total}
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Present: {stats.present}
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Absent: {stats.absent}
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Late: {stats.late}
                </span>

                {stats.excused > 0 && (
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Excused: {stats.excused}
                  </span>
                )}

                {stats.unmarked > 0 && (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-dashed border-slate-300 dark:border-white/20">
                    Unmarked: {stats.unmarked}
                  </span>
                )}
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll("PRESENT")}
                  disabled={isFutureDate || loading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Mark all students as Present"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>All Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAll("ABSENT")}
                  disabled={isFutureDate || loading}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Mark all students as Absent"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>All Absent</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isFutureDate || loading}
                  className="px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-1"
                  title="Clear markings"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Attendance Completion Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Check-in Progress ({stats.marked} of {stats.total} marked)</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.percent}% Attendance Rate</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
                />
                <div
                  className="bg-amber-500 transition-all duration-300"
                  style={{ width: `${(stats.late / (stats.total || 1)) * 100}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{ width: `${(stats.absent / (stats.total || 1)) * 100}%` }}
                />
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${(stats.excused / (stats.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications / Alerts */}
      {isFutureDate && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <span className="font-bold">Future Date Notice:</span> You have selected a date in the future ({selectedDate}). Attendance can only be recorded for today or earlier dates.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold">{success}</span>
        </div>
      )}

      {/* Student Attendance List Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <Loader2 className="w-8 h-8 text-[#EBFF00] animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading students for {selectedGroupName}...
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No students found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? `No student matching "${searchTerm}" found in this group.`
              : `This group does not have any active student enrollments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student, idx) => {
            const currentRecord = attendance[student.id];
            const currentStatus = currentRecord?.status;
            const currentNote = currentRecord?.note || "";
            const isNoteOpen = activeNoteStudentId === student.id || Boolean(currentNote);

            return (
              <div
                key={student.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 ${
                  currentStatus === "PRESENT"
                    ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/30"
                    : currentStatus === "ABSENT"
                    ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-500/30"
                    : currentStatus === "LATE"
                    ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-500/30"
                    : currentStatus === "EXCUSED"
                    ? "bg-blue-50/40 dark:bg-blue-950/10 border-blue-500/30"
                    : "bg-white dark:bg-[#141416] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Student Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-sm shrink-0">
                      {student.firstName.charAt(0)}
                      {student.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {student.firstName} {student.lastName}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {student.phone || "No phone number"}
                      </p>
                    </div>
                  </div>

                  {/* Tactile Status Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* PRESENT */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, "PRESENT")}
                      disabled={isFutureDate}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentStatus === "PRESENT"
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    {/* ABSENT */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, "ABSENT")}
                      disabled={isFutureDate}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentStatus === "ABSENT"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600/40"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>

                    {/* LATE */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, "LATE")}
                      disabled={isFutureDate}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentStatus === "LATE"
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/40"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>

                    {/* EXCUSED */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, "EXCUSED")}
                      disabled={isFutureDate}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentStatus === "EXCUSED"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600/40"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-500/15 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Excused</span>
                    </button>

                    {/* Note Toggle Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveNoteStudentId(
                          activeNoteStudentId === student.id ? null : student.id
                        )
                      }
                      className={`p-2 rounded-xl border text-xs transition-colors ${
                        currentNote
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                      title={currentNote ? `Note: ${currentNote}` : "Add note"}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Input */}
                {isNoteOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">Note:</span>
                    <input
                      type="text"
                      placeholder="e.g. Arrived 20 mins late, excused doctor visit..."
                      value={currentNote}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Save Action Bar */}
      {filteredStudents.length > 0 && (
        <div className="sticky bottom-4 z-30 p-4 bg-slate-900/90 dark:bg-black/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EBFF00] animate-pulse" />
            <span>
              <strong>{stats.marked}</strong> of <strong>{stats.total}</strong> students marked for{" "}
              <span className="text-[#EBFF00] font-bold">{selectedGroupName}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isFutureDate || stats.marked === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-sm bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 shadow-lg shadow-[#EBFF00]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Attendance...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
