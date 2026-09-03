"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, Phone, Calendar, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function StudentsListClient({
  students,
  groups,
}: {
  students: any[];
  groups: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        (student.firstName + " " + student.lastName)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.user.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGroup =
        selectedGroup === "All Groups" || student.group?.id === selectedGroup;

      const matchesStatus =
        selectedStatus === "All Status" ||
        student.status === selectedStatus.toUpperCase();

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [students, searchQuery, selectedGroup, selectedStatus]);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-slate-900 dark:text-white mb-2">
              Student Management
            </h1>
            <p className="subtitle text-slate-600 dark:text-slate-400">
              Manage and track all students in the system
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="/api/admin/students/export"
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </a>
            <Link href="/admin/students/create" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                Add Student
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 md:p-6 mb-6 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all text-sm"
          >
            <option value="All Groups">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all text-sm"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div
        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider hidden lg:table-cell">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    style={{
                      animation: `slideUp 0.3s ease-out ${200 + index * 30}ms backwards`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-sm">
                          {student.firstName.charAt(0).toUpperCase()}
                          {student.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                            {student.user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="text-sm">{student.user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="text-sm">{student.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {student.group?.name || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="text-sm">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === "ACTIVE"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            student.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No students found"
            description="Try adjusting your filters or add a new student to get started."
            action={{
              label: "Add Student",
              onClick: () => window.location.href = "/admin/students/create",
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div
          className="mt-6 flex items-center justify-between animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      )}
    </>
  );
}
