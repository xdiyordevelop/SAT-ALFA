import { prisma } from "@/lib/db/prisma";
import bcryptjs from "bcryptjs";

async function main() {
  try {
    // Hash passwords
    const adminPassword = await bcryptjs.hash("admin123", 10);
    const studentPassword = await bcryptjs.hash("student123", 10);

    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { username: "admin" },
      update: { passwordHash: adminPassword },
      create: {
        username: "admin",
        passwordHash: adminPassword,
        role: "ADMIN",
      },
    });

    console.log("✓ Admin user ready:", adminUser.username);

    // Create or update student user
    const studentUser = await prisma.user.upsert({
      where: { username: "student1" },
      update: { passwordHash: studentPassword },
      create: {
        username: "student1",
        passwordHash: studentPassword,
        role: "STUDENT",
        student: {
          create: {
            firstName: "Test",
            lastName: "Student",
            phone: "+998901234567",
            status: "ACTIVE",
            monthlyFee: 100000,
            paid: 50000,
            debt: 50000,
          },
        },
      },
    });

    console.log("✓ Student user ready:", studentUser.username);
    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
