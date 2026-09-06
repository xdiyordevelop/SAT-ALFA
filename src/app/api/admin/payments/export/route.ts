import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManagePayments } from "@/lib/permissions/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !canManagePayments(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "month";
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const escapeCell = (cell: any) =>
      `"${String(cell ?? "").replace(/"/g, '""')}"`;

    if (scope === "all") {
      // Full historical transaction ledger
      const payments = await prisma.payment.findMany({
        include: {
          student: {
            include: { user: { select: { username: true } } },
          },
          group: {
            select: { name: true, monthlyFee: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "Payment ID",
        "Billing Month",
        "Student ID",
        "Student Name",
        "Username / Email",
        "Phone Number",
        "Group Name",
        "Amount Paid (UZS)",
        "Payment Status",
        "Notes / Reference",
        "Recorded Date",
      ];

      const rows = payments.map((p) => [
        p.id,
        p.month,
        p.studentId,
        p.student ? `${p.student.firstName} ${p.student.lastName}` : "Unknown",
        p.student?.user?.username || "",
        p.student?.phone || "",
        p.group?.name || "Unknown",
        p.amountPaid,
        p.status,
        p.notes || "",
        new Date(p.createdAt).toLocaleDateString("en-US"),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCell).join(","))
        .join("\r\n");

      const dateStr = new Date().toISOString().slice(0, 10);

      return new NextResponse("\uFEFF" + csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="all_payments_history_${dateStr}.csv"`,
        },
      });
    }

    // Default: Month billing sheet
    const groups = await prisma.group.findMany({
      where: { status: "ACTIVE" },
      include: {
        studentProfiles: {
          where: { status: "ACTIVE" },
          include: {
            user: { select: { username: true } },
            payments: {
              where: { month },
            },
          },
          orderBy: { firstName: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const headers = [
      "Billing Month",
      "Group Name",
      "Student ID",
      "Student Name",
      "Username / Email",
      "Phone Number",
      "Monthly Fee (UZS)",
      "Amount Paid (UZS)",
      "Remaining Debt (UZS)",
      "Payment Status",
      "Notes / Reference",
      "Last Recorded Date",
    ];

    const rows: (string | number)[][] = [];

    for (const group of groups) {
      const fee = group.monthlyFee || 0;
      for (const student of group.studentProfiles) {
        const payment = student.payments[0];
        const amountPaid = payment?.amountPaid || 0;
        const debt = Math.max(0, fee - amountPaid);

        let status = "UNPAID";
        if (amountPaid >= fee && fee > 0) status = "PAID";
        else if (amountPaid > 0) status = "PARTIAL";
        else if (fee === 0) status = "PAID";

        rows.push([
          month,
          group.name,
          student.id,
          `${student.firstName} ${student.lastName}`,
          student.user?.username || "",
          student.phone || "",
          fee,
          amountPaid,
          debt,
          status,
          payment?.notes || "",
          payment ? new Date(payment.updatedAt).toLocaleDateString("en-US") : "—",
        ]);
      }
    }

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    return new NextResponse("\uFEFF" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payments_${month}_report.csv"`,
      },
    });
  } catch (error) {
    console.error("Export payments error:", error);
    return new NextResponse("Failed to export payment data", { status: 500 });
  }
}
