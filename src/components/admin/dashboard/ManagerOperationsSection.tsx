'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Users, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface RecentPaymentItem {
  id: string;
  studentName: string;
  groupName: string;
  month: string;
  amountPaid: number;
  status: string;
  paidAt: string;
}

export interface GroupBillingSummary {
  id: string;
  name: string;
  monthlyFee: number;
  studentCount: number;
}

interface ManagerOperationsSectionProps {
  recentPayments: RecentPaymentItem[];
  activeGroups: GroupBillingSummary[];
}

export function ManagerOperationsSection({
  recentPayments,
  activeGroups,
}: ManagerOperationsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#EBFF00]/10 border border-[#EBFF00]/30 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-neutral-900 dark:text-[#EBFF00]" />
              </div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                Tuition & Payment Operations
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live records of recorded student payments, tuition collection, and group billing health
            </p>
          </div>

          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-bold transition-all self-start sm:self-auto"
          >
            <span>Open Payments & Billing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Latest Recorded Payments ({recentPayments.length})
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">Actual DB Records</span>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 dark:bg-[#181818] rounded-xl border border-neutral-200 dark:border-white/5 space-y-2">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">No payment transactions recorded yet</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                When you record student tuition payments in Billing, they will appear here in real-time.
              </p>
              <Link
                href="/admin/payments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-[#EBFF00] text-white dark:text-black text-xs font-bold mt-2"
              >
                Go to Billing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Group</th>
                    <th className="py-2.5 px-3">Billing Month</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                        {p.studentName}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                        {p.groupName}
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400">
                        {p.month}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-neutral-900 dark:text-white">
                        {p.amountPaid.toLocaleString()} UZS
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.status === 'PAID'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : p.status === 'PARTIAL'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {p.status === 'PAID' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400 font-mono text-[11px]">
                        {new Date(p.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Groups Tuition Overview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Groups Tuition Schedule
            </h3>
            <Link
              href="/admin/groups"
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EBFF00] transition-colors"
            >
              All Groups →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGroups.slice(0, 6).map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {g.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 shrink-0">
                    {g.studentCount} students
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-neutral-400">Monthly Fee:</span>
                  <span className="font-bold text-neutral-900 dark:text-[#EBFF00] font-mono">
                    {g.monthlyFee ? `${g.monthlyFee.toLocaleString()} UZS` : 'Free'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
