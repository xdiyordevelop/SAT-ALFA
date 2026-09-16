import { PrismaClient } from "@/lib/prisma/index";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// If cached dev instance doesn't have recently added models or fields, reset it
if (
  globalForPrisma.prisma &&
  (!(globalForPrisma.prisma as any).notification ||
    !(globalForPrisma.prisma as any).staffProfile ||
    (globalForPrisma.prisma as any)._schemaVersion !== "v2_custom_fee")
) {
  globalForPrisma.prisma = undefined;
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Maintain singleton in both development and production to prevent connection leaks
if (!globalForPrisma.prisma) {
  (prisma as any)._schemaVersion = "v2_custom_fee";
  globalForPrisma.prisma = prisma;
}




