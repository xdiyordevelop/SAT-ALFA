import { PrismaClient } from "@/lib/prisma/index";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
 prisma: PrismaClient | undefined;
};

// If cached dev instance doesn't have recently added models, reset it
if (globalForPrisma.prisma && (!(globalForPrisma.prisma as any).notification || !(globalForPrisma.prisma as any).staffProfile)) {
  globalForPrisma.prisma = undefined;
}

const adapter = new PrismaPg({
 connectionString: process.env.DATABASE_URL,
});

export const prisma =
 globalForPrisma.prisma ??
 new PrismaClient({
 adapter,
 log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
 });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}




