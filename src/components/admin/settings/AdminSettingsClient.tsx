"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  KeyRound,
  Building2,
  GraduationCap,
  Users,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ArrowRight,
  Send,
  Lock,
  UserCheck,
  Check,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  updateSuperAdminCredentialsAction,
  updateGeneralSettings,
  updateAcademicSettings,
} from "@/server/actions/settings.actions";

interface AdminSettingsClientProps {
  currentUsername: string;
  userRole: string;
  defaultSettings?: {
    general?: {
      centerName?: string;
      phone?: string;
      email?: string;
      address?: string;
      website?: string;
      telegramSupport?: string;
      currency?: string;
      timezone?: string;
    };
    academic?: {
      satTargetScore?: number;
      mockFullscreenExitLimit?: number;
      defaultMonthlyFee?: number;
      lateThresholdMinutes?: number;
    };
  };
  initialTab?: "credentials" | "profile" | "academic" | "team";
}

export function AdminSettingsClient({
  currentUsername,
  userRole,
  defaultSettings,
  initialTab = "credentials",
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "credentials" | "profile" | "academic" | "team"
  >(initialTab);

  // Super Admin Credentials state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState("");
  const [credSuccess, setCredSuccess] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [displayedUsername, setDisplayedUsername] = useState(currentUsername);

  // Center Profile state
  const [profileData, setProfileData] = useState({
    centerName:
      defaultSettings?.general?.centerName || "SAT ALFA Education Center",
    phone: defaultSettings?.general?.phone || "+998 (99) 123-45-67",
    email: defaultSettings?.general?.email || "info@satalfa.uz",
    address: defaultSettings?.general?.address || "Tashkent, Uzbekistan",
    website: defaultSettings?.general?.website || "https://satalfa.uz",
    telegramSupport:
      defaultSettings?.general?.telegramSupport || "@satalfa_support",
    currency: defaultSettings?.general?.currency || "UZS",
    timezone: defaultSettings?.general?.timezone || "Asia/Tashkent",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Academic Rules state
  const [academicData, setAcademicData] = useState({
    satTargetScore: defaultSettings?.academic?.satTargetScore || 1200,
    mockFullscreenExitLimit:
      defaultSettings?.academic?.mockFullscreenExitLimit || 5,
    defaultMonthlyFee: defaultSettings?.academic?.defaultMonthlyFee || 500000,
    lateThresholdMinutes: defaultSettings?.academic?.lateThresholdMinutes || 15,
  });
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState("");
  const [academicSuccess, setAcademicSuccess] = useState("");

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };
  const passwordStrength = getPasswordStrength(newPassword);

  const handleCredentialsSubmitPreCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");
    setCredSuccess("");

    if (!currentPassword) {
      setCredError("You must enter your current password to verify identity.");
      return;
    }

    const trimmedUsername = newUsername.trim().toLowerCase();
    const hasUsernameChange = trimmedUsername !== displayedUsername.toLowerCase();
    const hasPasswordChange = newPassword.trim().length > 0;

    if (!hasUsernameChange && !hasPasswordChange) {
      setCredError(
        "No changes detected. Specify a new username or new master password."
      );
      return;
    }

    if (hasUsernameChange && trimmedUsername.length < 3) {
      setCredError("New username must be at least 3 characters long.");
      return;
    }

    if (hasPasswordChange) {
      if (newPassword.length < 8) {
        setCredError("New master password must be at least 8 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError("New password confirmation does not match.");
        return;
      }
    }

    // Open confirmation modal
    setConfirmModalOpen(true);
  };

  const handleExecuteCredentialsChange = async () => {
    setConfirmModalOpen(false);
    setCredLoading(true);
    setCredError("");
    setCredSuccess("");

    try {
      const res = await updateSuperAdminCredentialsAction({
        currentPassword,
        newUsername: newUsername.trim(),
        newPassword: newPassword.trim() || undefined,
      });

      if (!res.success) {
        setCredError(res.error || "Failed to update master credentials.");
      } else {
        if (res.newUsername) {
          setDisplayedUsername(res.newUsername);
          setNewUsername(res.newUsername);
        }
        setCredSuccess(
          res.message || "Master credentials have been updated successfully."
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setCredError(err.message || "An unexpected error occurred.");
    } finally {
      setCredLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      await updateGeneralSettings(profileData);
      setProfileSuccess("Center and brand details saved successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to save center settings.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAcademicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicError("");
    setAcademicSuccess("");
    setAcademicLoading(true);

    try {
      await updateAcademicSettings(academicData);
      setAcademicSuccess("Academic and testing rules saved successfully.");
      setTimeout(() => setAcademicSuccess(""), 4000);
    } catch (err: any) {
      setAcademicError(err.message || "Failed to save academic rules.");
    } finally {
      setAcademicLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === "credentials"
              ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
          }`}
        >
          <div className="relative">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <span>Super Admin Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === "profile"
              ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>Center Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === "academic"
              ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-500" />
          <span>Academic & Testing Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === "team"
              ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>Team & Staff</span>
        </button>
      </div>

      {/* TAB 1: Super Admin Security & Master Credentials */}
      {activeTab === "credentials" && (
        <div className="space-y-6 animate-fade-in">
          {/* Glowing Eye-Catching Danger Warning Banner */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 dark:border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/5 p-6 shadow-lg shadow-amber-500/5 dark:shadow-amber-500/10 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-md flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                      CRITICAL SECURITY ZONE
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40">
                      ROOT ACCESS
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-amber-200 mt-1">
                    Master Super Admin Credentials
                  </h3>
                </div>
              </div>
              <div className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-black/10 dark:bg-black/30 text-slate-700 dark:text-amber-300/90 border border-amber-500/20">
                Current Identity: <span className="font-bold">@{displayedUsername}</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-800 dark:text-amber-100/90 font-medium">
              <span className="font-bold underline text-amber-900 dark:text-amber-300">
                ATTENTION:
              </span>{" "}
              Changes made here immediately modify the root administrative account for the
              entire SAT-ALFA platform. Modifying your username or password will automatically
              refresh your active session. Be certain to record and store new master
              credentials in a verified password manager before proceeding.
            </p>
          </div>

          {/* Credential Update Form */}
          <form
            onSubmit={handleCredentialsSubmitPreCheck}
            className="bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6"
          >
            {/* Feedback Banners */}
            {credError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Security Update Failed</p>
                  <p>{credError}</p>
                </div>
              </div>
            )}

            {credSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Security Update Successful</p>
                  <p>{credSuccess}</p>
                </div>
              </div>
            )}

            {/* Section: Identity Verification */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Current Master Password <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Required to verify that you are the authenticated root Super Admin.
              </p>
              <div className="relative mt-2">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current master password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showCurrentPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Username field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Super Admin Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="superadmin"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white font-mono text-sm placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum 3 alphanumeric characters. Used to log into root admin portals.
                </p>
              </div>

              {/* Empty placeholder for grid alignment */}
              <div className="hidden md:block" />

              {/* New Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    New Master Password
                  </label>
                  <span className="text-xs text-slate-400 font-normal">
                    (Leave blank to keep unchanged)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong master password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showNewPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Security strength:</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength <= 25
                            ? "text-rose-500"
                            : passwordStrength <= 50
                            ? "text-amber-500"
                            : passwordStrength <= 75
                            ? "text-blue-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {passwordStrength <= 25
                          ? "Weak"
                          : passwordStrength <= 50
                          ? "Fair"
                          : passwordStrength <= 75
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 25
                            ? "bg-rose-500"
                            : passwordStrength <= 50
                            ? "bg-amber-500"
                            : passwordStrength <= 75
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new master password"
                    disabled={!newPassword}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white disabled:opacity-50 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    disabled={!newPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <p
                    className={`text-xs flex items-center gap-1 font-medium ${
                      newPassword === confirmPassword
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Passwords match perfectly
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Encrypted using bcrypt standard (cost factor 10)</span>
              </div>

              <button
                type="submit"
                disabled={credLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {credLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>Update Super Admin Credentials</span>
              </button>
            </div>
          </form>

          {/* High-Impact Confirmation Modal */}
          {confirmModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#18181B] border-2 border-amber-500 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/30">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Confirm Master Credential Update
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Super Administrator Root Security
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-800 dark:text-amber-200/90 leading-relaxed space-y-2">
                  <p className="font-bold">Summary of changes to apply:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {newUsername.trim().toLowerCase() !== displayedUsername.toLowerCase() ? (
                      <li>
                        Username will change from{" "}
                        <span className="font-mono font-bold">@{displayedUsername}</span> to{" "}
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          @{newUsername.trim().toLowerCase()}
                        </span>
                      </li>
                    ) : (
                      <li>Username remains unchanged: @{displayedUsername}</li>
                    )}
                    {newPassword.trim() ? (
                      <li className="text-rose-600 dark:text-rose-400 font-semibold">
                        Master password will be updated to the new secret hash.
                      </li>
                    ) : (
                      <li>Master password will remain unchanged.</li>
                    )}
                  </ul>
                  <p className="pt-1 text-[11px] text-slate-600 dark:text-amber-300/80">
                    Your active JWT session cookie will be immediately re-issued. Do not
                    forget these credentials!
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteCredentialsChange}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Yes, Apply Root Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Center & Brand Profile */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleProfileSubmit}
          className="bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Center & Brand Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              General institutional details, contacts, and public student support channels.
            </p>
          </div>

          {profileError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              {profileSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Education Center Name
              </label>
              <input
                type="text"
                value={profileData.centerName}
                onChange={(e) =>
                  setProfileData({ ...profileData, centerName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-sky-500" />
                Telegram Support Link / Handle
              </label>
              <input
                type="text"
                value={profileData.telegramSupport}
                onChange={(e) =>
                  setProfileData({ ...profileData, telegramSupport: e.target.value })
                }
                placeholder="@satalfa_support or https://t.me/your_bot"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Used by the Student Help Center & Telegram support redirect buttons.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                Official Phone Number
              </label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                Official Contact Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Physical Address / Campus
              </label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                Website URL
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) =>
                  setProfileData({ ...profileData, website: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Platform Default Currency
              </label>
              <select
                value={profileData.currency}
                onChange={(e) =>
                  setProfileData({ ...profileData, currency: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              >
                <option value="UZS">UZS - Uzbekistan Som (so'm)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Timezone
              </label>
              <select
                value={profileData.timezone}
                onChange={(e) =>
                  setProfileData({ ...profileData, timezone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              >
                <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                <option value="Asia/Samarkand">Asia/Samarkand (UTC+5)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {profileLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Profile Information</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Academic & Testing Rules */}
      {activeTab === "academic" && (
        <form
          onSubmit={handleAcademicSubmit}
          className="bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              Academic & Examination Policies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Global thresholds for mock exam proctoring, attendance penalties, and tuition.
            </p>
          </div>

          {academicError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {academicError}
            </div>
          )}

          {academicSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              {academicSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>SAT Benchmark Target Score</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {academicData.satTargetScore} / 1600
                </span>
              </label>
              <input
                type="number"
                min="400"
                max="1600"
                step="10"
                value={academicData.satTargetScore}
                onChange={(e) =>
                  setAcademicData({
                    ...academicData,
                    satTargetScore: parseInt(e.target.value) || 1200,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Target score highlighted in student scorecards, rankings, and analytics.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Mock Fullscreen Exit Limit</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {academicData.mockFullscreenExitLimit} violations
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={academicData.mockFullscreenExitLimit}
                onChange={(e) =>
                  setAcademicData({
                    ...academicData,
                    mockFullscreenExitLimit: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Number of tab or window switches permitted before the Proctor automatically
                flags the test taker.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Standard Monthly Tuition Fee (UZS)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={academicData.defaultMonthlyFee}
                onChange={(e) =>
                  setAcademicData({
                    ...academicData,
                    defaultMonthlyFee: parseInt(e.target.value) || 500000,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Default rate auto-assigned when creating new student enrollment records.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Late Attendance Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={academicData.lateThresholdMinutes}
                onChange={(e) =>
                  setAcademicData({
                    ...academicData,
                    lateThresholdMinutes: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0D0D0E] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Arrivals after this threshold from lesson start time are classified as "LATE".
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={academicLoading}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {academicLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Academic Policies</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Team & Staff Management Shortcut */}
      {activeTab === "team" && (
        <div className="bg-white dark:bg-[#141416] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Team & Staff Administration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage administrative staff, teachers, mentors, and assign role-based
                permissions.
              </p>
            </div>
            <Link
              href="/admin/settings/team"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all"
            >
              <span>Open Staff Manager</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Super Admin
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master access to all settings, credentials, finances, and system controls.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Admin
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Day-to-day center operations, student records, courses, and exam schedules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Teacher
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Classroom management, student attendance tracking, homework, and mock grading.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Mentor
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student counseling, practice session oversight, and study progress tracking.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-purple-500" />
              <span>
                To invite new faculty members, reset staff passwords, or alter roles, visit
                the dedicated Staff Directory.
              </span>
            </div>
            <Link
              href="/admin/settings/team"
              className="font-bold underline whitespace-nowrap hover:text-purple-700 dark:hover:text-purple-200"
            >
              Go to Directory &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
