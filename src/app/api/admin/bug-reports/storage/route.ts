import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import fs from "fs/promises";
import path from "path";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// GET: Calculate storage metrics for bug screenshots & database records
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bugsDir = path.join(process.cwd(), "public", "uploads", "bugs");
    let fileEntries: { name: string; size: number }[] = [];

    try {
      const files = await fs.readdir(bugsDir);
      for (const file of files) {
        try {
          const stat = await fs.stat(path.join(bugsDir, file));
          if (stat.isFile()) {
            fileEntries.push({ name: file, size: stat.size });
          }
        } catch {
          // ignore stat errors
        }
      }
    } catch {
      // directory does not exist or cannot be read
    }

    const totalFiles = fileEntries.length;
    const totalBytes = fileEntries.reduce((acc, f) => acc + f.size, 0);

    // Fetch reports with status
    const reports = await prisma.bugReport.findMany({
      select: { id: true, status: true, screenshot: true },
    });

    const totalReports = reports.length;
    const openReportsCount = reports.filter((r) => r.status === "open").length;
    const resolvedReportsCount = reports.filter(
      (r) => r.status === "resolved" || r.status === "dismissed"
    ).length;

    const activeScreenshots = new Set(
      reports
        .filter((r) => r.status === "open" && r.screenshot)
        .map((r) => path.basename(r.screenshot!))
    );

    const resolvedOrDismissedScreenshots = new Set(
      reports
        .filter((r) => (r.status === "resolved" || r.status === "dismissed") && r.screenshot)
        .map((r) => path.basename(r.screenshot!))
    );

    // Cleanable files: files attached to resolved/dismissed reports OR orphaned files not in active reports
    let cleanableCount = 0;
    let cleanableBytes = 0;

    for (const f of fileEntries) {
      if (resolvedOrDismissedScreenshots.has(f.name) || !activeScreenshots.has(f.name)) {
        cleanableCount++;
        cleanableBytes += f.size;
      }
    }

    return NextResponse.json({
      totalFiles,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      cleanableCount,
      cleanableBytes,
      cleanableFormatted: formatBytes(cleanableBytes),
      totalReports,
      openReportsCount,
      resolvedReportsCount,
    });
  } catch (error: any) {
    console.error("[StorageMetrics] GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to inspect storage" }, { status: 500 });
  }
}

// POST: Safely clean screenshot image files AND/OR resolved bug history records from database
// CRITICAL NOTE: Questions in SATQuestion and mock tests in SATMockTest are NEVER touched or deleted!
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let deleteDatabaseRecords = true;
    try {
      const body = await req.json();
      if (typeof body?.deleteDatabaseRecords === "boolean") {
        deleteDatabaseRecords = body.deleteDatabaseRecords;
      }
    } catch {
      // Empty or non-JSON body defaults to true
    }

    const bugsDir = path.join(process.cwd(), "public", "uploads", "bugs");

    // 1. Fetch resolved & dismissed bug reports
    const cleanableReports = await prisma.bugReport.findMany({
      where: {
        status: { in: ["resolved", "dismissed"] },
      },
      select: { id: true, screenshot: true },
    });

    // 2. Fetch open reports to protect their screenshots
    const openReports = await prisma.bugReport.findMany({
      where: {
        status: "open",
        screenshot: { not: null },
      },
      select: { screenshot: true },
    });

    const protectedFileNames = new Set(
      openReports.map((r) => path.basename(r.screenshot!)).filter(Boolean)
    );

    let freedBytes = 0;
    let deletedFilesCount = 0;

    // 3. Delete disk files for cleanable reports
    for (const report of cleanableReports) {
      if (!report.screenshot) continue;
      const filename = path.basename(report.screenshot);
      if (protectedFileNames.has(filename)) continue;

      const filePath = path.join(bugsDir, filename);
      try {
        const stat = await fs.stat(filePath);
        await fs.unlink(filePath);
        freedBytes += stat.size;
        deletedFilesCount++;
      } catch {
        // File may already have been removed
      }
    }

    // 4. Purge any remaining orphaned files in bugsDir that don't belong to any open report
    try {
      const allFiles = await fs.readdir(bugsDir);
      for (const file of allFiles) {
        if (!protectedFileNames.has(file)) {
          const filePath = path.join(bugsDir, file);
          try {
            const stat = await fs.stat(filePath);
            await fs.unlink(filePath);
            freedBytes += stat.size;
            deletedFilesCount++;
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore readdir error
    }

    let deletedReportsCount = 0;

    // 5. Database Cleanup:
    if (deleteDatabaseRecords) {
      // Permanently remove the resolved/dismissed bug report tickets from PostgreSQL
      // Notice: SATQuestion and SATMockTest records are untouched!
      const deleteResult = await prisma.bugReport.deleteMany({
        where: {
          status: { in: ["resolved", "dismissed"] },
        },
      });
      deletedReportsCount = deleteResult.count;
    } else {
      // Only set screenshot: null on those bug reports to keep the text history
      const reportIdsToNullify = cleanableReports.map((r) => r.id);
      if (reportIdsToNullify.length > 0) {
        await prisma.bugReport.updateMany({
          where: { id: { in: reportIdsToNullify } },
          data: { screenshot: null },
        });
      }
    }

    let message = "";
    if (deletedReportsCount > 0 && deletedFilesCount > 0) {
      message = `Cleaned ${deletedReportsCount} resolved bug history records from database and freed ${formatBytes(freedBytes)} disk space (${deletedFilesCount} screenshots). All SAT questions remain 100% intact.`;
    } else if (deletedReportsCount > 0) {
      message = `Cleaned ${deletedReportsCount} resolved bug history records from database. All SAT questions remain 100% intact.`;
    } else {
      message = `Cleaned ${deletedFilesCount} screenshot image files (${formatBytes(freedBytes)} freed). All question content and test records remain intact.`;
    }

    return NextResponse.json({
      success: true,
      deletedFilesCount,
      deletedReportsCount,
      freedBytes,
      freedFormatted: formatBytes(freedBytes),
      message,
    });
  } catch (error: any) {
    console.error("[StorageCleanup] POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to clean storage" }, { status: 500 });
  }
}
