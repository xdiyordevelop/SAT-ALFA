"use client";

import { useState } from "react";
import { updateGeneralSettings } from "@/server/actions/settings.actions";
import { AlertCircle, Check, Loader, Save } from "lucide-react";

const DEFAULT_GENERAL = {
  centerName: "SAT ALFA Education Center",
  phone: "+998 (99) 123-45-67",
  email: "info@satalfa.uz",
  address: "Tashkent, Uzbekistan",
  website: "www.satalfa.uz",
  currency: "UZS",
  timezone: "Asia/Tashkent",
};

export function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_GENERAL);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      await updateGeneralSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 animate-slide-up"
    >
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-3">
          <Check className="w-5 h-5" />
          Settings updated successfully
        </div>
      )}

      {/* General Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          General Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Center Name
          </label>
          <input
            type="text"
            name="centerName"
            value={formData.centerName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all mb-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
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
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all mb-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Regional Settings */}
      <div className="mb-8 pt-8 border-t border-slate-200 dark:border-white/10 ">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Regional Settings
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            >
              <option value="UZS">UZS - Uzbekistan Som</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
            >
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
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
