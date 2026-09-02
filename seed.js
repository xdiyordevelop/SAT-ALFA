const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Role: ADMIN");

    // Create student user
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const student = await prisma.user.create({
      data: {
        username: "student1",
        passwordHash: studentPasswordHash,
        role: "STUDENT",
      },
    });

    // Create student profile
    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: student.id,
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        monthlyFee: 100,
      },
    });

    console.log("✅ Student user created:");
    console.log("   Username: student1");
    console.log("   Password: student123");
    console.log("   Role: STUDENT");
    console.log("   Name: John Doe");

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
