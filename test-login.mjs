import { PrismaClient } from './src/lib/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcryptjs from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/sat_alfa'
});

const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const users = await prisma.user.findMany({
      include: { student: true }
    });
    
    console.log('\n✓ Database Connection: OK');
    console.log(`✓ Users in database: ${users.length}`);
    
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role})${user.student ? ' → Student Profile' : ''}`);
    });
    
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
