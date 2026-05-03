const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const mothers = await prisma.mother.count({ where: { status: { not: 'COMPLETED' } } });
  const events = await prisma.event.count({ where: { date: { gte: new Date() }, status: 'SCHEDULED' } });
  const payments = await prisma.payment.count({ where: { status: { in: ['PENDING', 'OVERDUE'] }, dueDate: { lt: new Date() } } });
  
  console.log({ mothers, events, payments });
}

check().catch(console.error).finally(() => prisma.$disconnect());
