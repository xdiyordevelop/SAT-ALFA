// Re-export everything from the generated Prisma client
export * from './prisma/index'
export type { Prisma } from './prisma/index'

// Export singleton instance from db/prisma
export { prisma } from './db/prisma';
