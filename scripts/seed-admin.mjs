import bcryptjs from "bcryptjs";
import { PrismaClient } from "../src/lib/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sat_alfa";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Connecting to database at:", connectionString);

  // 1. Generate hashes
  const adminPassword = "admin123";
  const adminHash = await bcryptjs.hash(adminPassword, 10);

  const newAdminUser = "satadmin";
  const newAdminPassword = "Admin@2026!";
  const newAdminHash = await bcryptjs.hash(newAdminPassword, 10);

  const studentPassword = "student123";
  const studentHash = await bcryptjs.hash(studentPassword, 10);

  // 2. Upsert admin (admin / admin123)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: adminHash,
      role: "ADMIN"
    },
    create: {
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN"
    }
  });
  console.log("✅ Updated / Created admin user:", admin.username);

  // 3. Create / Upsert new admin (satadmin / Admin@2026!)
  const newAdmin = await prisma.user.upsert({
    where: { username: newAdminUser },
    update: {
      passwordHash: newAdminHash,
      role: "ADMIN"
    },
    create: {
      username: newAdminUser,
      passwordHash: newAdminHash,
      role: "ADMIN"
    }
  });
  console.log("✅ Updated / Created new admin user:", newAdmin.username);

  // 4. Update student1 password
  const student = await prisma.user.upsert({
    where: { username: "student1" },
    update: {
      passwordHash: studentHash,
      role: "STUDENT"
    },
    create: {
      username: "student1",
      passwordHash: studentHash,
      role: "STUDENT"
    }
  });
  console.log("✅ Updated / Created student user:", student.username);

  // 5. Test verify passwords for all users
  const allUsers = await prisma.user.findMany();
  console.log("\n--- Current Users in Database ---");
  for (const u of allUsers) {
    let testPass = "";
    if (u.username === "admin") testPass = "admin123";
    if (u.username === "satadmin") testPass = "Admin@2026!";
    if (u.username === "student1") testPass = "student123";

    let isValid = false;
    if (testPass) {
      isValid = await bcryptjs.compare(testPass, u.passwordHash);
    }
    console.log(`User: ${u.username} | Role: ${u.role} | Test Password: ${testPass || "unknown"} | Verified: ${isValid}`);
  }

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error("Error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
