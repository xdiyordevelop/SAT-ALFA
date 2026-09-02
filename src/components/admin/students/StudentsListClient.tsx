"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, Phone, Calendar, Search, Download } from "lucide-react";

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Student Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 ">
              Manage and track all students in the system
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="/api/admin/students/export"
              className="px-6 py-3 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </a>
            <Link
              href="/admin/students/create"
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 mb-6 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
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
            className="px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div
        className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] ">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hidden lg:table-cell">
                    Group
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white ">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                    style={{
                      animation: `slideUp 0.3s ease-out ${200 + index * 30}ms backwards`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-sm">
                          {student.firstName.charAt(0).toUpperCase()}
                          {student.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white ">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                            {student.user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 ">
                        <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">{student.user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 ">
                        <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">{student.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-700 dark:text-slate-300 ">
                        {student.group?.name || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 ">
                        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 "
                            : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 "
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${student.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`}
                        />
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 dark:text-yellow-500 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
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
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
              No students found
            </p>
            <p className="text-slate-500 dark:text-slate-400 ">
              Try adjusting your filters or add a new student
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div
          className="mt-6 flex items-center justify-between animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 ">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      )}
    </>
  );
}
