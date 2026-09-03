"use client";

import {
  CreditCard,
  AlertCircle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  type: "CASH" | "CARD" | "BANK_TRANSFER";
  paidAt: string;
  notes?: string;
}

interface StudentProfile {
  monthlyFee: number;
  paid: number;
  debt: number;
}

interface StudentPaymentsContentProps {
  student: any;
  payments: any[];
}

export function StudentPaymentsContent({
  student,
  payments,
}: StudentPaymentsContentProps) {
  const remainingDebt = student.debt;
  const totalPaid = student.paid;
  const monthlyFee = student.monthlyFee;

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case "CASH":
        return "💵";
      case "CARD":
        return "💳";
      case "BANK_TRANSFER":
        return "🏦";
      default:
        return "💰";
    }
  };

  const getPaymentStatus = () => {
    if (remainingDebt === 0) {
      return { label: "Paid", color: "bg-green-100 text-green-700 " };
    } else if (remainingDebt > 0) {
      return { label: "Outstanding", color: "bg-red-100 text-red-700 " };
    }
    return { label: "Overpaid", color: "bg-blue-100 text-blue-700 " };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Payments
        </h1>
        <p className="text-slate-600 dark:text-slate-400 ">
          Track your course fees and payment history
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Monthly Fee
            </p>
            <DollarSign className="w-4 h-4 text-slate-900 dark:text-[#EBFF00] " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {monthlyFee?.toLocaleString() || 0} so'm
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current monthly fee
          </p>
        </div>

        <div
          className="bg-white dark:bg-[#131313] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 ">
              Total Paid
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-600 ">
            {totalPaid?.toLocaleString() || 0} so'm
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total payments made this month
          </p>
        </div>

        <div
          className="bg-white dark:bg-[#131313] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${remainingDebt > 0 ? "bg-red-100 text-red-600 " : "bg-green-100 text-green-600 "}`}
            >
              {remainingDebt > 0 ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 ">
              Remaining Debt
            </h3>
          </div>
          <p
            className={`text-3xl font-bold ${remainingDebt > 0 ? "text-red-600 " : "text-green-600 "}`}
          >
            {Math.abs(remainingDebt || 0).toLocaleString()} so'm
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {remainingDebt > 0 ? "amount due" : "credit balance"}
          </p>
        </div>

        <div
          className={`rounded-xl border p-6 {paymentStatus.color.includes("green") ? "bg-green-50 border-green-200 " : paymentStatus.color.includes("red") ? "bg-red-50 border-red-200 " : "bg-blue-50 border-blue-200 "}`}
        >
          <p className="text-sm font-medium mb-2">Payment Status</p>
          <p
            className={`text-3xl font-bold {paymentStatus.color.split(" ")[1]}`}
          >
            {paymentStatus.label}
          </p>
        </div>
      </div>

      {/* Payment Status Banner */}
      {remainingDebt > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 ">
              Outstanding Balance: {remainingDebt.toLocaleString()} so'm
            </p>
            <p className="text-sm text-red-800 mt-1">
              Please arrange payment at your earliest convenience to keep your
              account in good standing.
            </p>
          </div>
        </div>
      )}

      {remainingDebt === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900 ">Account Fully Paid</p>
            <p className="text-sm text-green-800 mt-1">
              Your account is in good standing. Thank you for your timely
              payments!
            </p>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Payment History
        </h3>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-white/10 ">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white ">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white ">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white ">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white ">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 ">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white ">
                        {new Date(payment.paidAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-green-600 ">
                        +{payment.amountPaid?.toLocaleString()} so'm
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getPaymentTypeIcon(payment.type)}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400 ">
                          {payment.type === "CASH" && "Cash"}
                          {payment.type === "CARD" && "Credit Card"}
                          {payment.type === "BANK_TRANSFER" && "Bank Transfer"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 ">
                        {payment.notes || "—"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 ">
              No payment records yet
            </p>
          </div>
        )}
      </div>

      {/* Payment Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">
          Payment Information
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 ">
          <li>• Monthly fee: {monthlyFee?.toLocaleString() || 0} so'm</li>
          <li>• Accepted payment methods: Cash, Credit Card, Bank Transfer</li>
          <li>• Please keep receipts for your records</li>
          <li>• Contact your instructor if you have questions about billing</li>
        </ul>
      </div>
    </div>
  );
}
