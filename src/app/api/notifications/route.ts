import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ notifications: [] });

  const notifications: any[] = [];

  try {
    if (session.role === "ADMIN") {
      // 1. Pending Tests
      const pendingTests = await prisma.studentTestAttempt.findMany({
        where: {
          completedAt: { not: null },
          totalScore: null,
        },
        include: {
          student: true,
          satTest: true,
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      });

      pendingTests.forEach((test) => {
        notifications.push({
          id: `test-${test.id}`,
          title: "Pending Test Review",
          message: `${test.student.firstName} submitted ${test.satTest.name}.`,
          time: test.completedAt,
          type: "TEST_SUBMISSION",
          href: `/admin/mock-tests/pending/${test.id}`,
          isRead: false,
        });
      });

      // 2. Pending Payments
      const pendingPayments = await prisma.payment.findMany({
        where: { status: "UNPAID" },
        include: { student: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      pendingPayments.forEach((p) => {
        notifications.push({
          id: `pay-${p.id}`,
          title: "Pending Payment",
          message: `${p.student.firstName} has a pending payment of ${p.amountPaid} UZS.`,
          time: p.createdAt,
          type: "PAYMENT",
          href: `/admin/payments`,
          isRead: false,
        });
      });
    } else {
      // Student Notifications
      const student = await prisma.studentProfile.findUnique({
        where: { userId: session.userId },
      });

      if (student) {
        // Graded tests
        const gradedTests = await prisma.studentTestAttempt.findMany({
          where: {
            studentId: student.id,
            totalScore: { not: null },
          },
          include: { satTest: true },
          orderBy: { completedAt: "desc" },
          take: 3,
        });

        gradedTests.forEach((test) => {
          notifications.push({
            id: `test-${test.id}`,
            title: "Test Graded",
            message: `Your score for ${test.satTest.name} is ready: ${test.totalScore}`,
            time: test.completedAt,
            type: "TEST_GRADED",
            href: `/student/results/${test.id}`,
            isRead: false,
          });
        });

        // Recent Payments
        const payments = await prisma.payment.findMany({
          where: { studentId: student.id, status: "PAID" },
          orderBy: { createdAt: "desc" },
          take: 2,
        });

        payments.forEach((p) => {
          notifications.push({
            id: `pay-${p.id}`,
            title: "Payment Confirmed",
            message: `Your payment of ${p.amountPaid} UZS was successful.`,
            time: p.createdAt,
            type: "PAYMENT",
            href: `/student/payments`,
            isRead: false,
          });
        });
      }
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ notifications: [] });
  }
}
