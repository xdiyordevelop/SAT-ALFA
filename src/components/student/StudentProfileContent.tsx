"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  enrollmentDate: string;
  status: string;
  createdAt: string;
}

interface UserData {
  username: string;
}

interface Group {
  id: string;
  name: string;
  course?: string;
}

interface StudentProfileContentProps {
  student: StudentProfile;
  user: UserData | null;
  group: Group | null;
}

export function StudentProfileContent({
  student,
  user,
  group,
}: StudentProfileContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(student.phone);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      setMessage({ type: "error", text: "Phone number cannot be empty" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/student/profile/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update phone");
      }

      setMessage({
        type: "success",
        text: "Phone number updated successfully",
      });
      setEditingPhone(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error updating phone",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/student/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Error changing password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400 ">
          Manage your account information and security settings
        </p>
      </div>

      {/* Message Alerts */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border {
 message.type === "success"
 ? "bg-green-50 border-green-200 "
 : "bg-red-50 border-red-200 "
 }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 " />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 " />
          )}
          <p
            className={
              message.type === "success" ? "text-green-800 " : "text-red-800 "
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#131313] rounded-t-xl border-t border-l border-r border-slate-200 dark:border-white/10 p-4">
        <div className="flex gap-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "contact", label: "Contact Information" },
            { id: "security", label: "Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors {
 activeTab === tab.id
 ? "text-slate-900 dark:text-yellow-500 border-b-2 border-yellow-600 "
 : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white "
 }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-[#131313] rounded-b-xl border-b border-l border-r border-slate-200 dark:border-white/10 p-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Profile Overview
              </h3>

              {/* Profile Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-blue-50 rounded-xl border border-yellow-200 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-3xl flex-shrink-0">
                  {student.firstName.charAt(0).toUpperCase()}
                  {student.lastName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {user?.username}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ">
                      <Calendar className="w-4 h-4" />
                      Joined{" "}
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </div>
                    {group && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ">
                        <MapPin className="w-4 h-4" />
                        {group.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    First Name
                  </label>
                  <p className="text-lg font-medium text-slate-900 dark:text-white ">
                    {student.firstName}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Last Name
                  </label>
                  <p className="text-lg font-medium text-slate-900 dark:text-white ">
                    {student.lastName}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Email
                  </label>
                  <p className="text-lg font-medium text-slate-900 dark:text-white ">
                    {user?.username}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Phone
                  </label>
                  <p className="text-lg font-medium text-slate-900 dark:text-white ">
                    {student.phone || "Not provided"}
                  </p>
                </div>

                {group && (
                  <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                      Group
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white ">
                      {group.name}
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Status
                  </label>
                  <p className="text-lg font-medium text-slate-900 dark:text-white ">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold {
 student.status === "ACTIVE"
 ? "bg-green-100 text-green-700 "
 : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 "
 }`}
                    >
                      {student.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Update Contact Information
            </h3>

            {/* Phone Number */}
            <div className="border border-slate-200 dark:border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
                  <h4 className="font-semibold text-slate-900 dark:text-white ">
                    Phone Number
                  </h4>
                </div>
                {!editingPhone && (
                  <button
                    onClick={() => setEditingPhone(true)}
                    className="text-slate-900 dark:text-yellow-500 hover:text-yellow-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingPhone ? (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-neutral-400 "
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdatePhone}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] disabled:bg-neutral-400 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPhone(false);
                        setNewPhone(student.phone);
                      }}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-slate-600 dark:text-slate-400 ">
                  {student.phone || "Not provided"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Security Settings
            </h3>

            {/* Change Password */}
            <div className="border border-slate-200 dark:border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
                  <h4 className="font-semibold text-slate-900 dark:text-white ">
                    Change Password
                  </h4>
                </div>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="text-slate-900 dark:text-yellow-500 hover:text-yellow-700 text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>

              {changingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-neutral-400 "
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-neutral-400 "
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-neutral-400 "
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] disabled:bg-neutral-400 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 ">
                  Regularly update your password to keep your account secure.
                </p>
              )}
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">
                Security Tips
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 ">
                <li>
                  • Use a strong password with uppercase, lowercase, numbers,
                  and symbols
                </li>
                <li>• Never share your password with anyone</li>
                <li>• Change your password regularly</li>
                <li>• Log out of your account on shared devices</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
