"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function CreateTestButton() {
  return (
    <Link
      href="/admin/mock-tests/create"
      className="flex items-center gap-2 px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(235,255,0,0.3)] transition-all"
    >
      <Plus className="w-4 h-4" />
      <span>Create Mock Test</span>
    </Link>
  );
}
