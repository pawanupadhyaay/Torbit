const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categoriesList = [
  "Sales & Business Development",
  "Pre-Sales / Inside Sales",
  "Marketing",
  "Digital Marketing",
  "Content & Creative",
  "CRM / Customer Relations",
  "Leasing",
  "Property Management",
  "Facility Management",
  "Projects & Construction",
  "Architecture & Design",
  "Land Acquisition & Development",
  "Real Estate Advisory & Consulting",
  "Research & Analytics",
  "Investment & Asset Management",
  "Legal",
  "Finance & Accounts",
  "Human Resources",
  "Procurement & Contracts",
  "Administration",
  "Operations",
  "Information Technology / IT",
  "PropTech / Product",
  "Valuation",
  "Government Liaison / Approvals",
  "Quality Assurance / Quality Control",
  "Health, Safety & Environment (HSE)",
  "Corporate Strategy",
  "Customer Experience",
  "Senior Management / Leadership",
  "Video Anchor",
  "Video Editor / Videographer",
  "Others"
];

const popularCategories = [
  { name: "Sales & Business Development", color: "#10B981" },
  { name: "Marketing", color: "#F97316" },
  { name: "Projects & Construction", color: "#0D9488" },
  { name: "Property Management", color: "#EA580C" },
  { name: "Finance & Accounts", color: "#2563EB" },
  { name: "Information Technology / IT", color: "#6366F1" },
  { name: "Human Resources", color: "#EC4899" },
  { name: "Legal", color: "#8B5CF6" }
];

async function cleanDatabase() {
  try {
    console.log("==========================================");
    console.log("🧹 STARTING RELIABLE DATABASE CLEANUP...");
    console.log("==========================================");

    // 1. Delete all transactional & relational data in strict dependency order
    console.log("Deleting audit logs...");
    await prisma.adminAuditLog.deleteMany();

    console.log("Deleting applications...");
    await prisma.application.deleteMany();

    console.log("Deleting job alerts...");
    await prisma.jobAlert.deleteMany();

    console.log("Deleting jobs...");
    await prisma.job.deleteMany();

    console.log("Deleting company profiles...");
    await prisma.companyProfile.deleteMany();

    console.log("Deleting seeker profiles...");
    await prisma.seekerProfile.deleteMany();

    console.log("Deleting users...");
    await prisma.user.deleteMany();

    console.log("Resetting categories...");
    await prisma.category.deleteMany();

    // 2. Re-create Clean Master Categories (All ready with 0 jobs)
    console.log(`Seeding ${categoriesList.length} clean master categories with 0 job count...`);
    for (const cat of categoriesList) {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const pop = popularCategories.find(p => p.name === cat);
      await prisma.category.create({
        data: {
          name: cat,
          slug,
          iconColor: pop ? pop.color : "#b2c359",
          jobCount: 0,
          isPopular: !!pop
        }
      });
    }
    console.log("✓ Clean master categories seeded successfully.");

    // 3. Create Essential Admin Users for platform management
    const adminHashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.createMany({
      data: [
        {
          email: "admin@torbitrealty.com",
          passwordHash: adminHashedPassword,
          role: "ADMIN"
        },
        {
          email: "admin@torbit.in",
          passwordHash: adminHashedPassword,
          role: "ADMIN"
        }
      ]
    });
    console.log("✓ Essential Admin accounts provisioned:");
    console.log("  - admin@torbitrealty.com (Password: Admin@123)");
    console.log("  - admin@torbit.in (Password: Admin@123)");

    console.log("==========================================");
    console.log("✨ DATABASE CLEANUP COMPLETE & READY FOR PRODUCTION!");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Error wiping database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
