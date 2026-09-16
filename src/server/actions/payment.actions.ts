"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManagePayments } from "@/lib/permissions/auth";

export async function getPaymentsData(selectedMonth: string) {
 const session = await getSession();
 if (!session || !canManagePayments(session)) throw new Error('Unauthorized');

  // Format selectedMonth cleanly as YYYY-MM
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(selectedMonth)) {
    const d = new Date();
    selectedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  const [selectedYearStr, selectedMonthStr] = selectedMonth.split("-");
  const selectedYear = parseInt(selectedYearStr, 10);
  const selectedMonthNum = parseInt(selectedMonthStr, 10);
  const daysInMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
  const endOfSelectedMonth = new Date(selectedYear, selectedMonthNum - 1, daysInMonth, 23, 59, 59, 999);

  const groups = await prisma.group.findMany({
    where: { status: 'ACTIVE' },
    include: {
      studentProfiles: {
        where: { status: 'ACTIVE' },
        include: {
          user: { select: { id: true, username: true } },
          payments: {
            where: { month: selectedMonth }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalExpected = 0;
  let totalCollected = 0;
  let totalDebt = 0;

  const formattedGroups = groups.map(group => {
    const standardGroupFee = group.monthlyFee || 0;

    const students = group.studentProfiles
      .map(student => {
        const payment = student.payments[0]; // since month and groupId are unique per student
        const amountPaid = payment?.amountPaid || 0;
        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : new Date(0);

        const hasPayment = Boolean(payment && payment.amountPaid > 0);
        const isBeforeEnrollment = enrollmentDate > endOfSelectedMonth && !hasPayment;

        // Check if student enrolled in this selected month mid-month
        const enrollYear = enrollmentDate.getFullYear();
        const enrollMonth = enrollmentDate.getMonth() + 1;
        const enrollDay = enrollmentDate.getDate();
        const isEnrolledInSelectedMonth = enrollYear === selectedYear && enrollMonth === selectedMonthNum;
        const isMidMonthEnrollment = isEnrolledInSelectedMonth && enrollDay > 1;

        const isCustomFee = student.customMonthlyFee !== null && student.customMonthlyFee !== undefined;
        const baseFee = isCustomFee ? student.customMonthlyFee! : standardGroupFee;

        const activeDays = isMidMonthEnrollment ? Math.max(1, daysInMonth - enrollDay + 1) : daysInMonth;
        const calculatedProratedFee = isMidMonthEnrollment && baseFee > 0
          ? Math.round((baseFee * activeDays) / daysInMonth / 1000) * 1000
          : baseFee;

        // Monthly prorate flag is stored on the specific month payment record
        const isProrated = Boolean(isMidMonthEnrollment && payment?.notes?.includes("[PRORATED]"));

        const fee = isBeforeEnrollment
          ? (amountPaid > 0 ? amountPaid : 0)
          : isProrated
          ? calculatedProratedFee
          : baseFee;

        const debt = isBeforeEnrollment ? 0 : Math.max(0, fee - amountPaid);
        
        let status = "UNPAID";
        if (isBeforeEnrollment && amountPaid === 0) status = "NOT_ENROLLED";
        else if (amountPaid >= fee && fee > 0) status = "PAID";
        else if (amountPaid > 0) status = "PARTIAL";
        else if (fee === 0) status = "PAID";

        totalExpected += fee;
        totalCollected += amountPaid;
        totalDebt += debt;

        // Strip internal [PRORATED] tag from visible notes
        const cleanNotes = (payment?.notes || "").replace(/\[PRORATED\]\s*/g, "").trim();

        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          username: student.user?.username || "",
          groupId: group.id,
          groupName: group.name,
          fee,
          standardFee: standardGroupFee,
          isCustomFee,
          customFee: student.customMonthlyFee,
          customFeeReason: student.customFeeReason || "",
          isProrated,
          isMidMonthEnrollment,
          proratedFee: calculatedProratedFee,
          enrollmentDay: isEnrolledInSelectedMonth ? enrollDay : null,
          activeDays,
          daysInMonth,
          enrollmentDate: student.enrollmentDate ? student.enrollmentDate.toISOString() : null,
          amountPaid,
          debt,
          status,
          paymentId: payment?.id || null,
          notes: cleanNotes
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    return {
      id: group.id,
      name: group.name,
      monthlyFee: group.monthlyFee,
      students
    };
  });

  return {
    groups: formattedGroups,
    totalExpected,
    totalCollected,
    totalDebt,
    selectedMonth
  };
}

export async function recordStudentPayment({
  studentId,
  groupId,
  month,
  amountPaid,
  notes
}: {
  studentId: string;
  groupId: string;
  month: string;
  amountPaid: number;
  notes?: string;
}) {
  const session = await getSession();
  if (!session || !canManagePayments(session)) throw new Error('Unauthorized');

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { customMonthlyFee: true, enrollmentDate: true, userId: true }
  });

  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const existing = await prisma.payment.findUnique({
    where: {
      studentId_groupId_month: {
        studentId,
        groupId,
        month
      }
    }
  });

  const isPaymentProrated = Boolean(existing?.notes?.includes("[PRORATED]"));
  const standardGroupFee = group.monthlyFee || 0;
  const baseFee = student?.customMonthlyFee !== null && student?.customMonthlyFee !== undefined
    ? student.customMonthlyFee
    : standardGroupFee;

  let monthlyFee = baseFee;
  if (isPaymentProrated && student?.enrollmentDate) {
    const [yStr, mStr] = month.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const daysInM = new Date(y, m, 0).getDate();
    const enrollDate = new Date(student.enrollmentDate);
    if (enrollDate.getFullYear() === y && enrollDate.getMonth() + 1 === m && enrollDate.getDate() > 1) {
      const activeDays = Math.max(1, daysInM - enrollDate.getDate() + 1);
      monthlyFee = Math.round((baseFee * activeDays) / daysInM / 1000) * 1000;
    }
  }

  let status = "UNPAID";
  if (amountPaid >= monthlyFee && monthlyFee > 0) status = "PAID";
  else if (amountPaid > 0) status = "PARTIAL";
  else if (monthlyFee === 0) status = "PAID";

  const cleanUserNotes = (notes !== undefined ? notes : existing?.notes || "").replace(/\[PRORATED\]\s*/g, "").trim();
  const finalNotes = isPaymentProrated
    ? (cleanUserNotes ? `[PRORATED] ${cleanUserNotes}` : "[PRORATED]")
    : cleanUserNotes;

  await prisma.payment.upsert({
    where: {
      studentId_groupId_month: {
        studentId,
        groupId,
        month
      }
    },
    update: {
      amountPaid,
      status,
      notes: finalNotes,
      updatedAt: new Date()
    },
    create: {
      studentId,
      groupId,
      month,
      amountPaid,
      status,
      notes: finalNotes
    }
  });

  try {
    if (student?.userId) {
      const { createNotification } = await import("@/server/actions/notification.actions");
      const formattedAmount = Number(amountPaid).toLocaleString();
      const statusTitle = status === "PAID" ? "Payment Confirmed" : status === "PARTIAL" ? "Partial Payment Recorded" : "Payment Update";
      await createNotification(student.userId, {
        title: statusTitle,
        message: `Payment for ${month} has been recorded: ${formattedAmount} UZS (${status}).`,
        type: "PAYMENT",
        link: "/student/payments"
      });
    }
  } catch (err) {
    console.error("Failed to dispatch payment notification:", err);
  }

  revalidatePath("/admin/payments");
  return { success: true };
}

export async function toggleStudentMonthlyProrate({
  studentId,
  groupId,
  month,
}: {
  studentId: string;
  groupId: string;
  month: string;
}) {
  const session = await getSession();
  if (!session || !canManagePayments(session)) throw new Error("Unauthorized");

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { customMonthlyFee: true, enrollmentDate: true }
  });
  if (!student) throw new Error("Student not found");

  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) throw new Error("Group not found");

  const existing = await prisma.payment.findUnique({
    where: {
      studentId_groupId_month: {
        studentId,
        groupId,
        month
      }
    }
  });

  const currentlyProrated = Boolean(existing?.notes?.includes("[PRORATED]"));
  const nextProrated = !currentlyProrated;

  const baseNotes = (existing?.notes || "").replace(/\[PRORATED\]\s*/g, "").trim();
  const finalNotes = nextProrated
    ? (baseNotes ? `[PRORATED] ${baseNotes}` : "[PRORATED]")
    : baseNotes;

  const baseFee = student.customMonthlyFee !== null && student.customMonthlyFee !== undefined
    ? student.customMonthlyFee
    : (group.monthlyFee || 0);

  // Calculate effective fee
  const [yStr, mStr] = month.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const daysInM = new Date(y, m, 0).getDate();
  const enrollDate = student.enrollmentDate ? new Date(student.enrollmentDate) : new Date();
  const enrollDay = enrollDate.getDate();
  const activeDays = Math.max(1, daysInM - enrollDay + 1);

  const proratedFee = Math.round((baseFee * activeDays) / daysInM / 1000) * 1000;
  const effectiveFee = nextProrated ? proratedFee : baseFee;
  const amountPaid = existing?.amountPaid || 0;

  let newStatus = "UNPAID";
  if (amountPaid >= effectiveFee && effectiveFee > 0) newStatus = "PAID";
  else if (amountPaid > 0) newStatus = "PARTIAL";
  else if (effectiveFee === 0) newStatus = "PAID";

  await prisma.payment.upsert({
    where: {
      studentId_groupId_month: {
        studentId,
        groupId,
        month
      }
    },
    update: {
      notes: finalNotes,
      status: newStatus,
      updatedAt: new Date()
    },
    create: {
      studentId,
      groupId,
      month,
      amountPaid: 0,
      status: newStatus,
      notes: finalNotes
    }
  });

  revalidatePath("/admin/payments");
  return { success: true, isProrated: nextProrated };
}

export async function updateStudentAgreedFee({
  studentId,
  customMonthlyFee,
  customFeeReason,
  currentMonth,
}: {
  studentId: string;
  customMonthlyFee: number | null;
  customFeeReason?: string;
  currentMonth?: string;
}) {
  const session = await getSession();
  if (!session || !canManagePayments(session)) throw new Error("Unauthorized");

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      group: true,
      payments: currentMonth ? { where: { month: currentMonth } } : undefined,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  await prisma.studentProfile.update({
    where: { id: studentId },
    data: {
      customMonthlyFee,
      customFeeReason: customFeeReason?.trim() || null,
    },
  });

  // If there is an existing payment record for the current month, update its status based on the new fee
  if (currentMonth && student.payments && student.payments.length > 0) {
    const payment = student.payments[0];
    const isPaymentProrated = Boolean(payment.notes?.includes("[PRORATED]"));
    let effectiveFee = customMonthlyFee !== null ? customMonthlyFee : (student.group?.monthlyFee || 0);

    if (isPaymentProrated && student.enrollmentDate && currentMonth) {
      const [yStr, mStr] = currentMonth.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const daysInM = new Date(y, m, 0).getDate();
      const enrollDate = new Date(student.enrollmentDate);
      if (enrollDate.getFullYear() === y && enrollDate.getMonth() + 1 === m && enrollDate.getDate() > 1) {
        const activeDays = Math.max(1, daysInM - enrollDate.getDate() + 1);
        effectiveFee = Math.round((effectiveFee * activeDays) / daysInM / 1000) * 1000;
      }
    }

    let newStatus = "UNPAID";
    if (payment.amountPaid >= effectiveFee && effectiveFee > 0) newStatus = "PAID";
    else if (payment.amountPaid > 0) newStatus = "PARTIAL";
    else if (effectiveFee === 0) newStatus = "PAID";

    if (newStatus !== payment.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });
    }
  }

  revalidatePath("/admin/payments");
  return { success: true };
}
