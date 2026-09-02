import { prisma } from './src/lib/db/prisma'
async function main() {
  const test = await prisma.mockTest.findUnique({ where: { id: 'b43b8d15-7a18-4683-b976-f51270605471' } })
  console.log("TEST:", test ? test.id : "NOT FOUND")
}
main().finally(() => prisma.$disconnect())
