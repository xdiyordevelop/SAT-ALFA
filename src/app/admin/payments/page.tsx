"use client";

import { useState, useEffect, useTransition } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getPaymentsData,
  recordStudentPayment,
} from "@/server/actions/payment.actions";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

export default function PaymentsPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [editingPayment, setEditingPayment] = useState<{
    studentId: string;
    amount: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [month]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getPaymentsData(month);
      setData(result);
      if (result.groups.length > 0 && !expandedGroup) {
        setExpandedGroup(result.groups[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async (studentId: string, groupId: string) => {
    if (!editingPayment) return;
    const amountPaid =
      parseInt(editingPayment.amount.replace(/[^0-9]/g, "")) || 0;

    startTransition(async () => {
      await recordStudentPayment({
        studentId,
        groupId,
        month,
        amountPaid,
        notes: editingPayment.notes,
      });
      await loadData();
      setEditingPayment(null);
    });
  };

  const formatUZS = (num: number) => {
    return num.toLocaleString() + " UZS";
  };

  const formatMonthLabel = (m: string) => {
    const [year, mo] = m.split("-");
    const date = new Date(parseInt(year), parseInt(mo) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <AdminLayout
      title="Payments & Billing"
      breadcrumbs={[{ label: "Admin" }, { label: "Payments" }]}
      userName="Admin"
      userEmail="admin@satalfa.uz"
      userRole="ADMIN"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Billing Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage group payments, track debts, and record transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Select Month:
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2 outline-none focus:border-[#EBFF00] transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#EBFF00] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Expected Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatUZS(data?.totalExpected || 0)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For {formatMonthLabel(month)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Total Collected
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600">
                    {formatUZS(data?.totalCollected || 0)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actual received payments
              </p>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Total Debt
                  </p>
                  <h3 className="text-2xl font-bold text-rose-600">
                    {formatUZS(data?.totalDebt || 0)}
                  </h3>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pending collection
              </p>
            </div>
          </div>

          {/* Group Accordions */}
          <div className="space-y-4">
            {data?.groups.map((group: any) => (
              <div
                key={group.id}
                className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedGroup(
                      expandedGroup === group.id ? null : group.id,
                    )
                  }
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EBFF00]/10 flex items-center justify-center text-[#EBFF00] border border-[#EBFF00]/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {group.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Monthly Fee:{" "}
                        <span className="text-slate-900 dark:text-[#EBFF00] font-medium">
                          {formatUZS(group.monthlyFee)}
                        </span>{" "}
                        • {group.students.length} Students
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {expandedGroup === group.id ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </button>

                {expandedGroup === group.id && (
                  <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-6">
                    {group.students.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                        No active students in this group.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <th className="pb-3 px-4">Student Name</th>
                              <th className="pb-3 px-4">Monthly Fee</th>
                              <th className="pb-3 px-4">Amount Paid</th>
                              <th className="pb-3 px-4">Remaining Debt</th>
                              <th className="pb-3 px-4 text-center">Status</th>
                              <th className="pb-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {group.students.map((student: any) => (
                              <tr
                                key={student.id}
                                className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {student.name}
                                  </p>
                                  {student.username && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      @{student.username}
                                    </p>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                                  {formatUZS(student.fee)}
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                                    {formatUZS(student.amountPaid)}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-medium text-rose-600">
                                  {student.debt > 0
                                    ? formatUZS(student.debt)
                                    : "-"}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  {student.status === "PAID" && (
                                    <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[11px] font-bold tracking-wider">
                                      PAID
                                    </span>
                                  )}
                                  {student.status === "PARTIAL" && (
                                    <span className="inline-block px-2.5 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/20 rounded-md text-[11px] font-bold tracking-wider">
                                      PARTIAL (-{formatUZS(student.debt)})
                                    </span>
                                  )}
                                  {student.status === "UNPAID" && (
                                    <span className="inline-block px-2.5 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-md text-[11px] font-bold tracking-wider">
                                      UNPAID
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  {editingPayment?.studentId ===
                                  student.id ? (
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-end gap-2">
                                        <input
                                          type="text"
                                          value={
                                            editingPayment?.amount || ""
                                          }
                                          onChange={(e) => {
                                            const val =
                                              e.target.value.replace(
                                                /[^0-9]/g,
                                                "",
                                              );
                                            if (editingPayment) {
                                              setEditingPayment({
                                                ...editingPayment,
                                                amount: val
                                                  ? parseInt(
                                                      val,
                                                    ).toLocaleString()
                                                  : "",
                                              });
                                            }
                                          }}
                                          className="w-32 bg-white dark:bg-[#131313] border border-[#EBFF00]/50 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white outline-none focus:border-[#EBFF00] text-sm"
                                          placeholder="Amount..."
                                          autoFocus
                                        />
                                      </div>
                                      <div className="flex items-center justify-end gap-1.5 mb-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingPayment((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    amount:
                                                      student.fee.toLocaleString(),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 rounded hover:bg-slate-700"
                                        >
                                          Full
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingPayment((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    amount: Math.floor(
                                                      student.fee / 2,
                                                    ).toLocaleString(),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 rounded hover:bg-slate-700"
                                        >
                                          Half
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingPayment((prev) =>
                                              prev
                                                ? { ...prev, amount: "" }
                                                : prev,
                                            )
                                          }
                                          className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 rounded hover:bg-slate-700"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                      <div className="flex items-center justify-end gap-2">
                                        <input
                                          type="text"
                                          value={
                                            editingPayment?.notes || ""
                                          }
                                          onChange={(e) => {
                                            if (editingPayment) {
                                              setEditingPayment({
                                                ...editingPayment,
                                                notes: e.target.value,
                                              });
                                            }
                                          }}
                                          className="w-32 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white outline-none focus:border-[#EBFF00] text-sm"
                                          placeholder="Notes (optional)..."
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2 mt-1">
                                        <button
                                          onClick={() =>
                                            setEditingPayment(null)
                                          }
                                          className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleSavePayment(
                                              student.id,
                                              group.id,
                                            )
                                          }
                                          disabled={isPending}
                                          className="px-3 py-1.5 text-xs bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 font-bold rounded-lg transition-colors"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setEditingPayment({
                                          studentId: student.id,
                                          amount:
                                            student.amountPaid.toLocaleString(),
                                        })
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-[#EBFF00] hover:text-[#EBFF00] bg-[#EBFF00]/10 hover:bg-[#EBFF00]/20 border border-[#EBFF00]/20 rounded-lg transition-colors"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      Record Payment
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {data?.groups.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-[#131313]/40 rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
                <p className="text-slate-500 dark:text-slate-400">
                  No active groups found.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
