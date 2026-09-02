"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function getPaymentsData(selectedMonth: string) {
 const session = await getSession();
 if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

 // Format selectedMonth cleanly as YYYY-MM
 const monthRegex = /^\d{4}-\d{2}$/;
 if (!monthRegex.test(selectedMonth)) {
 const d = new Date();
 selectedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 }

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
 const students = group.studentProfiles.map(student => {
 const payment = student.payments[0]; // since month and groupId are unique per student
 const amountPaid = payment?.amountPaid || 0;
 const fee = group.monthlyFee || 0;
 const debt = Math.max(0, fee - amountPaid);
 
 let status = "UNPAID";
 if (amountPaid >= fee && fee > 0) status = "PAID";
 else if (amountPaid > 0) status = "PARTIAL";
 else if (fee === 0) status = "PAID";

 totalExpected += fee;
 totalCollected += amountPaid;
 totalDebt += debt;

 return {
 id: student.id,
 name: `${student.firstName} ${student.lastName}`,
 username: student.user?.username || "",
 fee,
 amountPaid,
 debt,
 status,
 paymentId: payment?.id || null,
 notes: payment?.notes || ""
 };
 });

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
 totalDebt: totalExpected - totalCollected,
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
 if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

 const group = await prisma.group.findUnique({
 where: { id: groupId }
 });

 if (!group) {
 throw new Error("Group not found");
 }

 const monthlyFee = group.monthlyFee || 0;
 let status = "UNPAID";
 if (amountPaid >= monthlyFee && monthlyFee > 0) status = "PAID";
 else if (amountPaid > 0) status = "PARTIAL";
 else if (monthlyFee === 0) status = "PAID";

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
 notes,
 updatedAt: new Date()
 },
 create: {
 studentId,
 groupId,
 month,
 amountPaid,
 status,
 notes
 }
 });

 revalidatePath("/admin/payments");
 return { success: true };
}
