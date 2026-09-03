"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/server/actions/group.actions";
import { AlertCircle, Check, Loader } from "lucide-react";

export function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    monthlyFee: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMonthlyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      monthlyFee: val ? parseInt(val).toLocaleString() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Group name is required");
      }
      if (!formData.monthlyFee) {
        throw new Error("Monthly fee is required");
      }

      await createGroup({
        name: formData.name,
        monthlyFee: parseInt(formData.monthlyFee.replace(/[^0-9]/g, "")),
        description: formData.description || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/groups");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl animate-slide-up">
        <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Group Created Successfully
          </h2>
          <p className="text-yellow-600 dark:text-yellow-400 mb-6">
            {formData.name} has been added to the system
          </p>
          <p className="text-sm text-yellow-500 dark:text-yellow-400">
            Redirecting to groups list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="SAT Math Advanced"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Monthly Fee (UZS) *
            </label>
            <input
              type="text"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleMonthlyFeeChange}
              placeholder="800,000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description / Schedule (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mon/Wed/Fri 14:00-16:00"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1c1b1b] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </form>
  );
}
