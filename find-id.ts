import { prisma } from './src/lib/db/prisma'

async function main() {
  const id = 'b43b8d15-7a18-4683-b976-f51270605471'
  const inMockTest = await prisma.mockTest.findUnique({ where: { id } }).catch(()=>null)
  const inSATMockTest = await prisma.sATMockTest.findUnique({ where: { id } }).catch(()=>null)
  const inStudentTestAttempt = await prisma.studentTestAttempt.findUnique({ where: { id } }).catch(()=>null)
  
  console.log("MockTest:", inMockTest ? "YES" : "NO")
  console.log("SATMockTest:", inSATMockTest ? "YES" : "NO")
  console.log("StudentTestAttempt:", inStudentTestAttempt ? "YES" : "NO")
}
main().finally(() => prisma.$disconnect())
