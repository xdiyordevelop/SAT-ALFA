const { prisma } = require("../src/lib/db/prisma.ts");
const bcrypt = require("bcryptjs");

async function main() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: adminPassword,
        role: "ADMIN",
      },
    });

    console.log("✓ Admin user created:", adminUser.username);

    // Create student user
    const studentUser = await prisma.user.create({
      data: {
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

    console.log("✓ Student user created:", studentUser.username);
    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
