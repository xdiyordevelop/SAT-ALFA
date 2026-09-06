"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  Calendar,
  FileText,
  Printer,
  X,
  Building2,
  ShieldCheck,
  Receipt,
  Info,
} from "lucide-react";

export interface PaymentItem {
  id: string;
  amountPaid: number;
  month: string;
  status: "PAID" | "PARTIAL" | "UNPAID" | string;
  notes: string | null;
  paidAt: string;
  createdAt: string;
  groupId: string;
  groupName: string;
  groupMonthlyFee: number;
}

export interface FinancialSummary {
  currentMonth: string;
  currentMonthlyFee: number;
  currentMonthPaid: number;
  currentMonthDebt: number;
  currentMonthStatus: string;
  totalLifetimePaid: number;
}

interface StudentPaymentsContentProps {
  student: any;
  payments: PaymentItem[];
  financialSummary: FinancialSummary;
}

export function StudentPaymentsContent({
  student,
  payments,
  financialSummary,
}: StudentPaymentsContentProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>("ALL");

  const formatMonthYear = (monthStr: string) => {
    if (!monthStr || !monthStr.includes("-")) return monthStr;
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatUZS = (amount: number) => {
    return `${(amount || 0).toLocaleString("en-US")} UZS`;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(payments.map((p) => p.month))).filter(Boolean);
    return months.sort().reverse();
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (filterMonth === "ALL") return payments;
    return payments.filter((p) => p.month === filterMonth);
  }, [payments, filterMonth]);

  const groupName =
    student.group?.name ||
    payments[0]?.groupName ||
    "SAT Preparation Group";

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30 rounded-lg text-xs font-bold tracking-wider uppercase mb-2">
            <Building2 className="w-3.5 h-3.5" /> Student Financial Ledger
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Tuition & Payments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track your monthly course fees, administrative payment records, and balances.
          </p>
        </div>

        {/* Quick Student Badge */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 self-start sm:self-auto shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-900 dark:text-[#EBFF00] text-sm">
            {student.firstName?.[0]}
            {student.lastName?.[0]}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {groupName}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Primary Financial Summary Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Tuition */}
        <div className="bg-white dark:bg-[#131313] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Monthly Tuition
            </span>
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-900 dark:text-[#EBFF00]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatUZS(financialSummary.currentMonthlyFee)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              Group: {groupName}
            </p>
          </div>
        </div>

        {/* Card 2: Paid for Current Month */}
        <div className="bg-white dark:bg-[#131313] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Paid This Month
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatUZS(financialSummary.currentMonthPaid)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Cycle: {formatMonthYear(financialSummary.currentMonth)}
            </p>
          </div>
        </div>

        {/* Card 3: Current Month Balance / Debt */}
        <div className="bg-white dark:bg-[#131313] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Remaining Balance
            </span>
            <div
              className={`p-2 rounded-xl ${
                financialSummary.currentMonthDebt > 0
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {financialSummary.currentMonthDebt > 0 ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                financialSummary.currentMonthDebt > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatUZS(financialSummary.currentMonthDebt)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {financialSummary.currentMonthDebt > 0
                ? "Due for current month"
                : "No pending balance"}
            </p>
          </div>
        </div>

        {/* Card 4: Lifetime Total Paid */}
        <div className="bg-white dark:bg-[#131313] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Lifetime Paid
            </span>
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-900 dark:text-white">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatUZS(financialSummary.totalLifetimePaid)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {payments.length} verified transactions
            </p>
          </div>
        </div>
      </div>

      {/* 2. Current Month Status Announcement Banner */}
      {financialSummary.currentMonthStatus === "PAID" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
              Account Fully Paid for {formatMonthYear(financialSummary.currentMonth)}
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 leading-relaxed">
              Your tuition for this month has been fully recorded and verified by the administration. Thank you for your punctual payment!
            </p>
          </div>
        </div>
      )}

      {financialSummary.currentMonthStatus === "PARTIAL" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
              Partial Payment Recorded for {formatMonthYear(financialSummary.currentMonth)}
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
              You have paid{" "}
              <strong className="font-bold text-amber-900 dark:text-amber-200">
                {formatUZS(financialSummary.currentMonthPaid)}
              </strong>
              . Outstanding balance for this month is{" "}
              <strong className="font-bold text-rose-600 dark:text-rose-400">
                {formatUZS(financialSummary.currentMonthDebt)}
              </strong>
              . Please complete your fee with the administration.
            </p>
          </div>
        </div>
      )}

      {financialSummary.currentMonthStatus === "UNPAID" && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">
              Tuition Pending for {formatMonthYear(financialSummary.currentMonth)}
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-400 mt-1 leading-relaxed">
              Tuition for the current month is{" "}
              <strong className="font-bold text-rose-900 dark:text-rose-200">
                {formatUZS(financialSummary.currentMonthlyFee)}
              </strong>
              . Please contact the center administration or reception to confirm your payment.
            </p>
          </div>
        </div>
      )}

      {/* 3. Transaction History Card */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
              Official Payment History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified ledger records entered by the administration
            </p>
          </div>

          {/* Month Filter Dropdown */}
          {availableMonths.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Filter by Month:
              </span>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                aria-label="Filter payment history by month"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] cursor-pointer"
              >
                <option value="ALL">All Recorded Months ({payments.length})</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthYear(m)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Course / Group</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Billing Month */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatMonthYear(payment.month)}</span>
                      </div>
                    </td>

                    {/* Group / Course */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {payment.groupName}
                    </td>

                    {/* Amount Paid */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{formatUZS(payment.amountPaid)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {payment.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : payment.status === "PARTIAL" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" /> Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>

                    {/* Recorded Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(payment.paidAt)}
                    </td>

                    {/* Admin Notes */}
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {payment.notes || "—"}
                    </td>

                    {/* Receipt Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(payment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-[#EBFF00] hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-white/10"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No payment records found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {filterMonth !== "ALL"
                ? `No payment records entered for ${formatMonthYear(filterMonth)}.`
                : "No administrative payment transactions have been logged for your account yet."}
            </p>
          </div>
        )}
      </div>

      {/* 4. Administration Policy & Verification Notice Box */}
      <div className="bg-slate-50 dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tuition Accounting & Policy
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00]" />
                All tuition payments are received and verified by the academy administration.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00]" />
                Once recorded by an administrator, payments immediately reflect in your ledger.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00]" />
                For billing inquiries or receipts, please contact the academy administration.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Printable / Viewable Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-900 dark:text-white">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-[#EBFF00] dark:text-slate-950 uppercase tracking-wider">
                  Receipt
                </span>
                <span className="text-xs font-bold text-slate-500">
                  #{selectedReceipt.id.slice(0, 10).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Voucher Body */}
            <div className="space-y-6 text-left">
              {/* Branding Header */}
              <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  SAT-ALFA ACADEMY
                </h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Official Tuition Payment Slip
                </p>
              </div>

              {/* Amount Display */}
              <div className="text-center bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Amount Recorded
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  +{formatUZS(selectedReceipt.amountPaid)}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed by Administration
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Course / Group:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.groupName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Billing Cycle:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatMonthYear(selectedReceipt.month)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Date Recorded:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatDate(selectedReceipt.paidAt)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Administrative Notes:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.notes || "Tuition fee recorded by administration"}
                  </span>
                </div>
              </div>

              {/* Security Seal Notice */}
              <div className="pt-2 text-center text-[10px] text-slate-400">
                <p>This is a verified digital transaction record from SAT-ALFA.</p>
                <p className="mt-0.5 font-mono">sat-alfa.uz • Document ID: #{selectedReceipt.id.slice(0, 14)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
