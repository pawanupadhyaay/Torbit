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
  "Others"
];

async function cleanDatabase() {
  try {
    console.log("Starting full database wipe...");

    // 1. Delete all relational data
    await prisma.adminAuditLog.deleteMany();
    console.log("✓ Deleted all AdminAuditLogs");

    await prisma.application.deleteMany();
    console.log("✓ Deleted all Applications");

    await prisma.job.deleteMany();
    console.log("✓ Deleted all Jobs");

    await prisma.companyProfile.deleteMany();
    console.log("✓ Deleted all Company Profiles");

    await prisma.seekerProfile.deleteMany();
    console.log("✓ Deleted all Seeker Profiles");

    await prisma.user.deleteMany();
    console.log("✓ Deleted all Users");

    await prisma.category.deleteMany();
    console.log("✓ Reset Categories");

    // 2. Re-create clean Master Categories with 0 job count
    console.log("Seeding clean master categories (0 jobs)...");
    for (const cat of categoriesList) {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await prisma.category.create({
        data: {
          name: cat,
          slug,
          iconColor: "#94C322",
          jobCount: 0,
          isPopular: false
        }
      });
    }
    console.log("✓ Clean master categories created");

    // 3. Create Admin Users for login access
    const adminHashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.createMany({
      data: [
        {
          email: "admin@torbit.in",
          passwordHash: adminHashedPassword,
          role: "ADMIN"
        },
        {
          email: "admin@torbitrealty.com",
          passwordHash: adminHashedPassword,
          role: "ADMIN"
        }
      ]
    });
    console.log("✓ Admin users created (admin@torbit.in / Admin@123)");

    console.log("Database is now 100% clean and ready for fresh live registrations!");
  } catch (error) {
    console.error("Error wiping database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
