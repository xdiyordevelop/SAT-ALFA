"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/server/actions/student.actions";
import { AlertCircle, Check, Eye, EyeOff, Loader, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Group {
  id: string;
  name: string;
}

export function CreateStudentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    phone: "",
    groupId: "",
    status: "ACTIVE",
    parentName: "",
    parentPhone: "",
    parentRelationship: "",
  });

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetch("/api/admin/groups");
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setGroupsLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.firstName.trim()) {
        throw new Error("First name is required");
      }
      if (!formData.lastName.trim()) {
        throw new Error("Last name is required");
      }
      if (!formData.username.trim()) {
        throw new Error("Username is required");
      }
      if (!formData.password) {
        throw new Error("Password is required");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (!formData.phone.trim()) {
        throw new Error("Phone is required");
      }

      const result = await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        groupId: formData.groupId || undefined,
        status: formData.status,
        parentName: formData.parentName || undefined,
        parentPhone: formData.parentPhone || undefined,
        parentRelationship: formData.parentRelationship || undefined,
      });

      setSuccess(true);
      setCreatedStudent({ ...result, password: formData.password });
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        phone: "",
        groupId: "",
        status: "ACTIVE",
        parentName: "",
        parentPhone: "",
        parentRelationship: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (success && createdStudent) {
    return (
      <div className="max-w-2xl animate-slide-up">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="heading-3 text-emerald-900 dark:text-emerald-100">
                Student Created Successfully
              </h2>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                {createdStudent.firstName} {createdStudent.lastName} has been added to the system
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8 p-6 bg-white dark:bg-[#131313] rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Username
                </p>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {createdStudent.username}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(createdStudent.username)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy username"
              >
                <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Temporary Password
                </p>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {showPassword ? createdStudent.password : "••••••"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(createdStudent.password)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy password"
                >
                  <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              ⚠️ Share these credentials with the student securely. The password cannot be recovered.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/admin/students")}
                variant="primary"
                size="md"
                className="flex-1"
              >
                View All Students
              </Button>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setCreatedStudent(null);
                }}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl animate-slide-up">
      <div className="bg-white dark:bg-[#131313] rounded-lg border border-slate-200 dark:border-white/10 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="heading-4 text-slate-900 dark:text-white mb-6">
            Personal Information
          </h3>

          <div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ali"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Valiyev"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998 99 123 45 67"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="mb-8">
          <h3 className="heading-4 text-slate-900 dark:text-white mb-6">
            Account Information
          </h3>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Username or Email *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. nodirbek or nodir@gmail.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all mb-1"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter either a username, phone number, or email address. The student will use this to sign in.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Password *
              </label>
              <button
                type="button"
                onClick={() => {
                  const randomDigits = Math.floor(1000 + Math.random() * 9000);
                  setFormData((prev) => ({ ...prev, password: `sat${randomDigits}!` }));
                  setShowPassword(true);
                }}
                className="text-xs font-semibold text-[#EBFF00] hover:underline"
              >
                + Auto-generate password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="mb-8">
          <h3 className="heading-4 text-slate-900 dark:text-white mb-6">
            Academic Information
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Group (Optional)
            </label>
            {groupsLoading ? (
              <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Loading groups...
              </div>
            ) : (
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              >
                <option value="">Select a group...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            {groups.length === 0 && !groupsLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                No groups available. Create a group first.
              </p>
            )}
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="mb-8">
          <h3 className="heading-4 text-slate-900 dark:text-white mb-6">
            Parent/Guardian Information (Optional)
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Parent Name
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Parent full name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Parent Phone
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="+998 99 123 45 67"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Relationship
            </label>
            <input
              type="text"
              name="parentRelationship"
              value={formData.parentRelationship}
              onChange={handleChange}
              placeholder="Father, Mother, Guardian, etc."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? "Creating..." : "Create Student"}
          </Button>
        </div>
      </div>
    </form>
  );
}
