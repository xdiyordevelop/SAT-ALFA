import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isStaff(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "date";
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const monthParam = searchParams.get("month"); // YYYY-MM
    const groupId = searchParams.get("groupId");

    const whereClause: any = {};

    if (groupId && groupId !== "ALL") {
      whereClause.groupId = groupId;
    }

    let filename = "attendance_report.csv";

    if (scope === "date" && dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      const endDate = new Date(year, month - 1, day + 1, 0, 0, 0);
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
      filename = `attendance_${dateParam}.csv`;
    } else if (scope === "month" && monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1, 0, 0, 0);
      const endDate = new Date(year, month, 1, 0, 0, 0);
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
      filename = `attendance_${monthParam}.csv`;
    } else if (scope === "all") {
      const todayStr = new Date().toISOString().slice(0, 10);
      filename = `all_attendance_history_${todayStr}.csv`;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { username: true } },
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const escapeCell = (cell: any) =>
      `"${String(cell ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "Date",
      "Group Name",
      "Student ID",
      "Student Name",
      "Username / Email",
      "Phone Number",
      "Attendance Status",
      "Note / Reason",
      "Recorded Date & Time",
    ];

    const rows = records.map((r) => [
      new Date(r.date).toISOString().slice(0, 10),
      r.group?.name || "No Group",
      r.studentId,
      r.student ? `${r.student.firstName} ${r.student.lastName}` : "Unknown",
      r.student?.user?.username || "",
      r.student?.phone || "",
      r.status,
      r.note || "",
      new Date(r.createdAt).toLocaleString("en-US"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    return new NextResponse("\uFEFF" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export attendance error:", error);
    return new NextResponse("Failed to export attendance data", { status: 500 });
  }
}
