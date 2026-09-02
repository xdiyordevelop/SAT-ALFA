import "dotenv/config";
import { PrismaClient } from "@/lib/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seeding...\n");

  const adminPassword = await bcryptjs.hash("admin123", 10);
  const studentPassword = await bcryptjs.hash("student123", 10);

  // 1. Upsert Admin User (Ensure admin always exists with correct credentials)
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: adminPassword,
      role: "ADMIN",
    },
    create: {
      username: "admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user ready:", adminUser.username);

  // 2. Upsert Student User
  const studentUser = await prisma.user.upsert({
    where: { username: "student1" },
    update: {
      passwordHash: studentPassword,
      role: "STUDENT",
    },
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

  // Check if we already have the SATMockTest to avoid duplication errors
  const existingTest = await prisma.sATMockTest.findFirst({
    where: { name: "SAT Practice Test 1" },
  });

  let satTestId = existingTest?.id;

  if (!existingTest) {
    const satTest = await prisma.sATMockTest.create({
      data: {
        name: "SAT Practice Test 1",
        description: "Full-length SAT mock test with sample questions",
        status: "ACTIVE",
        createdById: adminUser.id,
        questions: {
          create: [
            {
              prompt: "<p>Which of the following is the capital of France?</p>",
              options: { A: "London", B: "Paris", C: "Berlin", D: "Madrid" },
              correctAnswer: "B",
              difficulty: "EASY",
              domain: "Reading",
              skill: "Comprehension",
              explanation: "<p>Paris is the capital city of France.</p>",
              module: "MODULE_1" as any,
              format: "MCQ" as any,
              questionNumber: 1,
            },
            {
              prompt: "<p>Solve: 2 + 2 = ?</p>",
              options: { A: "3", B: "4", C: "5", D: "6" },
              correctAnswer: "B",
              difficulty: "EASY",
              domain: "Algebra",
              skill: "Basic Operations",
              explanation: "<p>2 + 2 equals 4.</p>",
              module: "MODULE_3" as any,
              format: "MCQ" as any,
              questionNumber: 1,
            },
            {
              prompt: "<p>Which best describes the main idea?</p>",
              options: { A: "First idea", B: "Second idea", C: "Third idea", D: "Fourth idea" },
              correctAnswer: "A",
              difficulty: "MEDIUM",
              domain: "Reading",
              skill: "Main Idea",
              explanation: "<p>The correct interpretation is the first option.</p>",
              passage: "Sample passage text for reading comprehension.",
              module: "MODULE_1" as any,
              format: "MCQ" as any,
              questionNumber: 2,
            },
          ],
        },
      },
    });
    satTestId = satTest.id;
    console.log(`✓ SAT test created: ${satTest.name}`);
  } else {
    console.log(`✓ SAT test already exists: ${existingTest.name}`);
  }

  // Sample student test attempts
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: studentUser.id },
  });

  if (studentProfile && satTestId) {
    const existingAttempt = await prisma.studentTestAttempt.findFirst({
      where: { studentId: studentProfile.id, satTestId },
    });

    if (!existingAttempt) {
      await prisma.studentTestAttempt.create({
        data: {
          studentId: studentProfile.id,
          satTestId: satTestId,
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          rwRaw: 38,
          mathRaw: 35,
          rwScore: 680,
          mathScore: 650,
          totalScore: 1330,
          totalTimeMs: 10800000,
          userAnswers: { q1: "B", q2: "B" },
          scoringStatus: "PUBLISHED",
        },
      });

      await prisma.studentTestAttempt.create({
        data: {
          studentId: studentProfile.id,
          satTestId: satTestId,
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          rwRaw: 41,
          mathRaw: 38,
          rwScore: 720,
          mathScore: 700,
          totalScore: 1420,
          totalTimeMs: 10800000,
          userAnswers: { q1: "B", q2: "B", q3: "A" },
          scoringStatus: "PUBLISHED",
        },
      });
      console.log(`✓ Sample test attempts created for analytics dashboard`);
    } else {
      console.log(`✓ Sample test attempts already exist`);
    }
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Admin account: admin / admin123`);
  console.log(`   - Student account: student1 / student123\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
