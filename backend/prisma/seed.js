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
  { name: "Sales & Business Development", color: "#10B981", count: 128 },
  { name: "Marketing", color: "#F97316", count: 96 },
  { name: "Projects & Construction", color: "#0D9488", count: 88 },
  { name: "Property Management", color: "#EA580C", count: 64 },
  { name: "Finance & Accounts", color: "#2563EB", count: 52 },
  { name: "Information Technology / IT", color: "#6366F1", count: 38 },
  { name: "Human Resources", color: "#EC4899", count: 41 },
  { name: "Legal", color: "#8B5CF6", count: 30 }
];

async function main() {
  console.log("Cleaning database...");
  await prisma.adminAuditLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.seekerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding 32 Categories...");
  for (const cat of categoriesList) {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const pop = popularCategories.find(p => p.name === cat);
    await prisma.category.create({
      data: {
        name: cat,
        slug: slug,
        iconColor: pop ? pop.color : "#b2c359",
        jobCount: pop ? pop.count : Math.floor(Math.random() * 20) + 5,
        isPopular: !!pop,
      }
    });
  }

  const hashedPassword = await bcrypt.hash("Password@123", 10);
  const adminHashedPassword = await bcrypt.hash("Admin@123", 10);

  console.log("Creating Admin User...");
  await prisma.user.create({
    data: {
      email: "admin@torbitrealty.com",
      passwordHash: adminHashedPassword,
      role: "ADMIN"
    }
  });

  console.log("Creating Companies...");
  const dlfUser = await prisma.user.create({
    data: {
      email: "hr@dlf.in",
      passwordHash: hashedPassword,
      role: "RECRUITER",
      companyProfile: {
        create: {
          companyName: "DLF Limited",
          industry: "Real Estate & Infrastructure",
          workEmail: "hr@dlf.in",
          phone: "+91 9811002233",
          gstNumber: "06AAACD1234F1Z5",
          hqLocation: "Gurugram, Haryana, India",
          logoUrl: "/logos/dlf.png",
          status: "APPROVED",
          verifiedAt: new Date(),
        }
      }
    },
    include: { companyProfile: true }
  });

  const godrejUser = await prisma.user.create({
    data: {
      email: "careers@godrejproperties.com",
      passwordHash: hashedPassword,
      role: "RECRUITER",
      companyProfile: {
        create: {
          companyName: "Godrej Properties",
          industry: "Real Estate & Construction",
          workEmail: "careers@godrejproperties.com",
          phone: "+91 9822003344",
          gstNumber: "27AAACG5678K1Z8",
          hqLocation: "Mumbai, Maharashtra, India",
          logoUrl: "/logos/godrej.png",
          status: "APPROVED",
          verifiedAt: new Date(),
        }
      }
    },
    include: { companyProfile: true }
  });

  const sobhaUser = await prisma.user.create({
    data: {
      email: "recruitment@sobha.com",
      passwordHash: hashedPassword,
      role: "RECRUITER",
      companyProfile: {
        create: {
          companyName: "SOBHA Limited",
          industry: "Luxury Real Estate",
          workEmail: "recruitment@sobha.com",
          phone: "+91 9833004455",
          gstNumber: "29AAACS9012L1Z2",
          hqLocation: "Bengaluru, Karnataka, India",
          logoUrl: "/logos/sobha.png",
          status: "APPROVED",
          verifiedAt: new Date(),
        }
      }
    },
    include: { companyProfile: true }
  });

  const skylineUser = await prisma.user.create({
    data: {
      email: "contact@skylineinfra.com",
      passwordHash: hashedPassword,
      role: "RECRUITER",
      companyProfile: {
        create: {
          companyName: "Skyline Infra Pvt Ltd",
          industry: "Infrastructure & Commercial",
          workEmail: "contact@skylineinfra.com",
          phone: "+91 9844005566",
          gstNumber: "07AAACS1122M1ZZ",
          hqLocation: "Noida, Uttar Pradesh, India",
          status: "PENDING"
        }
      }
    },
    include: { companyProfile: true }
  });

  console.log("Creating Jobs...");
  const job1 = await prisma.job.create({
    data: {
      companyId: dlfUser.companyProfile.id,
      title: "Sales Manager – Residential Projects",
      department: "Sales & Business Development",
      jobType: "Full-time",
      workMode: "On-site",
      location: "Gurugram, Haryana",
      expMin: 3,
      expMax: 5,
      salaryMin: 800000,
      salaryMax: 1200000,
      description: "Lead premium luxury residential sales across NCR. Manage HNI clients and channel partner networks.",
      skills: JSON.stringify(["Negotiation", "Client Relations", "CRM Tools", "Luxury Sales"]),
      isFeatured: true,
      openings: 2,
      status: "ACTIVE"
    }
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: godrejUser.companyProfile.id,
      title: "Marketing Executive",
      department: "Marketing",
      jobType: "Full-time",
      workMode: "Hybrid",
      location: "Mumbai, Maharashtra",
      expMin: 1,
      expMax: 3,
      salaryMin: 400000,
      salaryMax: 600000,
      description: "Execute digital and brand campaigns for residential launches in Mumbai and Pune.",
      skills: JSON.stringify(["Digital Marketing", "Brand Strategy", "Campaign Management", "Content"]),
      isFeatured: true,
      openings: 3,
      status: "ACTIVE"
    }
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: sobhaUser.companyProfile.id,
      title: "Project Manager – High-Rise Construction",
      department: "Projects & Construction",
      jobType: "Full-time",
      workMode: "On-site",
      location: "Bengaluru, Karnataka",
      expMin: 5,
      expMax: 8,
      salaryMin: 1200000,
      salaryMax: 1800000,
      description: "Oversee structural execution and quality control for high-rise luxury towers.",
      skills: JSON.stringify(["Site Management", "AutoCAD", "Quality Control", "HSE", "Budgeting"]),
      isFeatured: true,
      openings: 1,
      status: "ACTIVE"
    }
  });

  console.log("Creating Sample Job Seeker...");
  const seekerUser = await prisma.user.create({
    data: {
      email: "priya.sharma@example.com",
      passwordHash: hashedPassword,
      role: "JOB_SEEKER",
      seekerProfile: {
        create: {
          fullName: "Priya Sharma",
          phone: "+91 9876543210",
          location: "Gurugram, Haryana",
          dob: "1997-08-15",
          qualification: "Postgraduate (MBA Marketing)",
          experience: "3-5 years",
          currentSalary: 750000,
          expectedSalary: 1100000,
          noticePeriod: "30 days",
          portfolioUrl: "https://linkedin.com/in/priyasharma-realestate",
          resumeUrl: "http://localhost:5000/uploads/resumes/sample_resume.pdf",
          resumeOriginalName: "Priya_Sharma_Resume.pdf",
          skills: JSON.stringify(["Sales Management", "Negotiation", "CRM"]),
          profileCompleted: 75
        }
      }
    },
    include: { seekerProfile: true }
  });

  console.log("Creating Sample Application...");
  await prisma.application.create({
    data: {
      jobId: job1.id,
      seekerId: seekerUser.seekerProfile.id,
      resumeUrl: "http://localhost:5000/uploads/resumes/sample_resume.pdf",
      resumeOriginalName: "Priya_Sharma_Resume.pdf",
      currentSalary: 750000,
      expectedSalary: 1050000,
      noticePeriod: "30 days",
      coverLetter: "I have 4 years of proven track record selling luxury homes.",
      status: "UNDER_REVIEW"
    }
  });

  console.log("Backend database seeded successfully! 🌱");
}

main().catch(console.error).finally(() => prisma.$disconnect());
