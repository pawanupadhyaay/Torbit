const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const companies = await prisma.companyProfile.count();
  const seekers = await prisma.seekerProfile.count();
  const jobs = await prisma.job.count();
  const applications = await prisma.application.count();
  const categories = await prisma.category.count();
  const alerts = await prisma.jobAlert.count();
  const logs = await prisma.adminAuditLog.count();

  console.log("DATABASE STATS:");
  console.log("Users:", users.length, users);
  console.log("Companies:", companies);
  console.log("Seekers:", seekers);
  console.log("Jobs:", jobs);
  console.log("Applications:", applications);
  console.log("Categories:", categories);
  console.log("JobAlerts:", alerts);
  console.log("AdminAuditLogs:", logs);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
