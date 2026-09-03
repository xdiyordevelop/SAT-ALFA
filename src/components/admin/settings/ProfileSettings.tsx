"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader } from "lucide-react";

export function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "Admin User",
    username: "admin",
    phone: "+998 (99) 123-45-67",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 animate-slide-up"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-3">
          <Check className="w-5 h-5" />
          Profile updated successfully
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Your Profile
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Username cannot be changed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-white/10 ">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] disabled:opacity-50 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ml-auto"
        >
          {loading && <Loader className="w-5 h-5 animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
