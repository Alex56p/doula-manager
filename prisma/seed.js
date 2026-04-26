const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD || 'doula123!';
  const adminPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doulamanager.com' },
    update: {},
    create: {
      email: 'admin@doulamanager.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
