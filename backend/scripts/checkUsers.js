const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      companyProfile: {
        select: {
          companyName: true,
          status: true,
          workEmail: true,
          phone: true
        }
      },
      seekerProfile: {
        select: {
          fullName: true,
          phone: true
        }
      }
    }
  });
  console.log('USERS_IN_DB:', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
