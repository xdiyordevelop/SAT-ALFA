import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";

export async function GET() {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return new NextResponse("Unauthorized", { status: 401 });
 }

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        group: true,
        parent: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        attendance: {
          orderBy: { date: "desc" },
        },
        testAttempts: {
          where: {
            completedAt: { not: null },
          },
          select: {
            totalScore: true,
            mathScore: true,
            rwScore: true,
            completedAt: true,
            createdAt: true,
          },
          orderBy: { completedAt: "desc" },
        },
        mockTests: {
          where: { status: "CONFIRMED" },
          select: {
            score: true,
            mathScore: true,
            englishScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Username / Login",
      "Phone Number",
      "Group",
      "Course",
      "Account Status",
      "Enrollment Date",
      "Parent / Guardian Name",
      "Parent Phone",
      "Completed Tests",
      "Latest Score",
      "Highest Score",
      "Average Score",
      "Total Paid (UZS)",
      "Total Attendances",
      "Present Classes",
      "Absent Classes",
      "Late Classes",
      "Registered Date",
    ];

    const rows = students.map((s) => {
      // Gather all completed test scores
      const testAttemptsList = s.testAttempts.map((t) => ({
        score: t.totalScore,
        date: t.completedAt || t.createdAt,
      }));
      const legacyMockList = s.mockTests.map((m) => ({
        score: m.score,
        date: m.createdAt,
      }));

      const allTests = [...testAttemptsList, ...legacyMockList].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const validScores = allTests
        .map((t) => t.score)
        .filter((score): score is number => typeof score === "number" && score > 0);

      const latestScore = validScores.length > 0 ? validScores[0] : "—";
      const highestScore = validScores.length > 0 ? Math.max(...validScores) : "—";
      const averageScore =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : "—";

      const totalPaid = s.payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const totalAttendances = s.attendance.length;
      const presentCount = s.attendance.filter((a) => a.status === "PRESENT").length;
      const absentCount = s.attendance.filter((a) => a.status === "ABSENT").length;
      const lateCount = s.attendance.filter((a) => a.status === "LATE").length;

      return [
        s.id,
        s.firstName,
        s.lastName,
        s.user?.username || "",
        s.phone || "",
        s.group?.name || "None",
        s.group?.course || "—",
        s.status,
        s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "",
        s.parent?.fullName || "—",
        s.parent?.phone || "—",
        allTests.length,
        latestScore,
        highestScore,
        averageScore,
        totalPaid,
        totalAttendances,
        presentCount,
        absentCount,
        lateCount,
        new Date(s.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse("\uFEFF" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="students_full_export_${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
