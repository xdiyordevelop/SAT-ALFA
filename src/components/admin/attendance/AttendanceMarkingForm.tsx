"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  markAttendance,
  bulkMarkAttendance,
  getGroupStudents,
  getAttendanceForDate,
} from "@/server/actions/attendance.actions";
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
} from "lucide-react";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  enrollmentDate: Date;
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note: string;
}

export function AttendanceMarkingForm() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetch("/api/admin/groups");
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError("Failed to load groups");
      }
    };
    loadGroups();
  }, []);

  // Load students when group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await getGroupStudents(selectedGroup);
        setStudents(data as Student[]);
        setAttendance({});

        // Load existing attendance
        const existingAttendance = await getAttendanceForDate(
          selectedGroup,
          new Date(selectedDate),
        );

        const attendanceMap: Record<string, AttendanceRecord> = {};
        existingAttendance.forEach((record: any) => {
          attendanceMap[record.studentId] = {
            studentId: record.studentId,
            status: record.status,
            note: record.note || "",
          };
        });
        setAttendance(attendanceMap);
      } catch (err) {
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
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
    const newAttendance: Record<string, AttendanceRecord> = {};
    students.forEach((student) => {
      newAttendance[student.id] = {
        studentId: student.id,
        status,
        note: attendance[student.id]?.note || "",
      };
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    setSaving(true);
    try {
      const records = Object.values(attendance).map((record) => ({
        studentId: record.studentId,
        groupId: selectedGroup,
        date: new Date(selectedDate),
        status: record.status,
        note: record.note,
      }));

      await bulkMarkAttendance(records);
      setSuccess("Attendance marked successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAttendance({});
    setError("");
    setSuccess("");
  };

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm),
  );

  const statusConfig: Record<
    AttendanceStatus,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    PRESENT: {
      color: "bg-green-100 text-green-700 border-green-300 ",
      icon: <Check className="w-4 h-4" />,
      label: "Present",
    },
    ABSENT: {
      color: "bg-red-100 text-red-700 border-red-300 ",
      icon: <X className="w-4 h-4" />,
      label: "Absent",
    },
    LATE: {
      color:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 border-yellow-300 ",
      icon: <Clock className="w-4 h-4" />,
      label: "Late",
    },
    EXCUSED: {
      color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 ",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Excused",
    },
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-3">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 mb-6 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            >
              <option value="">Select a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {students.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-white/10 ">
            <button
              onClick={() => handleSelectAll("PRESENT")}
              className="px-4 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Mark All Present
            </button>
            <button
              onClick={() => handleSelectAll("ABSENT")}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg font-medium text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Mark All Absent
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-[#EBFF00] rounded-full" />
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 ">
            Loading students...
          </p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] ">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                    style={{
                      animation: `slideUp 0.3s ease-out {100 + index * 30}ms backwards`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white ">
                        {student.firstName} {student.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-600 dark:text-slate-400 ">
                        {student.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(
                          ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const
                        ).map((status) => {
                          const config = statusConfig[status];
                          const isActive =
                            attendance[student.id]?.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() =>
                                handleStatusChange(student.id, status)
                              }
                              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                isActive
                                  ? config.color
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 "
                              }`}
                              title={config.label}
                            >
                              {config.icon}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={attendance[student.id]?.note || ""}
                        onChange={(e) =>
                          handleNoteChange(student.id, e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 outline-none transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {selectedGroup
              ? "No students in this group"
              : "Select a group to get started"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {filteredStudents.length > 0 && (
        <div className="mt-8 flex gap-4 justify-end animate-slide-up">
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedGroup}
            className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] disabled:opacity-50 text-slate-900 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}
