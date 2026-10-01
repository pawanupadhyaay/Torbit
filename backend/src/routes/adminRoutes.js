const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");
const { sendCompanyApprovalEmail, sendCompanyRejectionEmail } = require("../services/emailService");

// In-memory system settings fallback store for fast persistence
let platformSettings = {
  brandingLogo: "",
  featuredContent: "",
  legalContent: "",
  notifications: {
    companyApprovalEmail: true,
    companyRejectionEmail: true,
    statusChangeSms: true,
    newJobAlertDigest: false
  },
  subAdmins: [
    { id: "admin-1", name: "Rahul Kapoor", role: "Super Admin", access: "Full access" },
    { id: "admin-2", name: "Sana Iyer", role: "Approvals-only Admin", access: "Company Approvals only" }
  ]
};

// 1. GET Admin Stats & Overview
router.get("/stats", async (req, res) => {
  try {
    const [
      totalSeekers,
      totalCompanies,
      pendingApprovals,
      approvedCompanies,
      blockedCompanies,
      activeJobs,
      totalApplications,
      pendingCompanies,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      prisma.seekerProfile.count(),
      prisma.companyProfile.count(),
      prisma.companyProfile.count({ where: { status: "PENDING" } }),
      prisma.companyProfile.count({ where: { status: "APPROVED" } }),
      prisma.companyProfile.count({ where: { status: "BLOCKED" } }),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.companyProfile.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" }
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { companyName: true, logoUrl: true } },
          _count: { select: { applications: true } }
        }
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          seeker: { select: { fullName: true, phone: true } },
          job: { select: { title: true, company: { select: { companyName: true } } } }
        }
      })
    ]);

    res.json({
      stats: {
        totalSeekers,
        totalCompanies,
        pendingApprovals,
        approvedCompanies,
        blockedCompanies,
        activeJobs,
        totalApplications
      },
      pendingCompanies,
      recentJobs,
      recentApplications
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 2. GET Companies (Full Details with Active Jobs and Application counts)
router.get("/companies", async (req, res) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      include: {
        user: { select: { email: true } },
        _count: { select: { jobs: true } },
        jobs: {
          select: {
            id: true,
            status: true,
            _count: { select: { applications: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = companies.map((c) => {
      const activeJobs = (c.jobs || []).filter((j) => j.status === "ACTIVE").length;
      const totalApplications = (c.jobs || []).reduce(
        (acc, job) => acc + (job._count?.applications || 0),
        0
      );
      return {
        id: c.id,
        companyName: c.companyName,
        industry: c.industry,
        workEmail: c.workEmail || c.user?.email,
        phone: c.phone,
        gstNumber: c.gstNumber,
        hqLocation: c.hqLocation,
        docUrl: c.docUrl,
        logoUrl: c.logoUrl,
        status: c.status,
        rejectionReason: c.rejectionReason,
        verifiedAt: c.verifiedAt,
        createdAt: c.createdAt,
        activeJobs: activeJobs || c._count?.jobs || 0,
        applications: totalApplications
      };
    });

    res.json({ companies: formatted });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// GET Pending Companies
router.get("/companies/pending", async (req, res) => {
  try {
    const pending = await prisma.companyProfile.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } }
      }
    });
    res.json({ companies: pending });
  } catch (err) {
    console.error("Error fetching pending companies:", err);
    res.status(500).json({ error: "Failed to fetch pending companies" });
  }
});

// 3. Company Approval Actions (Supports both POST & PUT)
const handleApproveCompany = async (req, res) => {
  try {
    const existingCompany = await prisma.companyProfile.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!existingCompany) {
      return res.status(404).json({ error: "Company profile not found." });
    }

    // Generate random 5-digit temporary password: Torbit#XXXXX
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const tempPassword = `Torbit#${randomDigits}`;
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

    // Update user password to temp password
    await prisma.user.update({
      where: { id: existingCompany.userId },
      data: { passwordHash: tempPasswordHash }
    });

    // Update company status to APPROVED and mark flag for first login
    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        verifiedAt: new Date(),
        rejectionReason: "TEMP_PASS_ISSUED"
      },
      include: { user: { select: { email: true } } }
    });

    const targetEmail = company.workEmail || company.user?.email || existingCompany.user?.email;
    const clientUrl = process.env.RECRUITER_URL || "http://localhost:3001";

    // Dispatch official approval email with temporary password in background (non-blocking)
    if (targetEmail) {
      sendCompanyApprovalEmail(targetEmail, company.companyName, tempPassword, clientUrl)
        .then(() => console.log(`✉️ [APPROVAL EMAIL SENT] Sent approval email with temporary password to ${targetEmail}`))
        .catch((mailErr) => console.error("⚠️ Failed to send approval email in background:", mailErr));
    }

    res.json({
      success: true,
      message: `Company approved successfully. Temporary password (${tempPassword}) sent to ${targetEmail}.`,
      company,
      temporaryPassword: tempPassword
    });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Failed to approve company" });
  }
};
router.post("/companies/:id/approve", handleApproveCompany);
router.put("/companies/:id/approve", handleApproveCompany);

const handleRejectCompany = async (req, res) => {
  try {
    const { reason } = req.body;
    const existingCompany = await prisma.companyProfile.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!existingCompany) {
      return res.status(404).json({ error: "Company profile not found." });
    }

    const rejectionMsg = reason || "Company registration details could not be verified by the admin team.";

    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionMsg
      },
      include: { user: { select: { email: true } } }
    });

    const targetEmail = company.workEmail || company.user?.email || existingCompany.user?.email;

    // Dispatch rejection email in background (non-blocking)
    if (targetEmail) {
      sendCompanyRejectionEmail(targetEmail, company.companyName, rejectionMsg)
        .then(() => console.log(`✉️ [REJECTION EMAIL SENT] Sent rejection email to ${targetEmail}`))
        .catch((mailErr) => console.error("⚠️ Failed to send rejection email in background:", mailErr));
    }

    res.json({
      success: true,
      message: `Company rejected. Notification email sent to ${targetEmail}.`,
      company
    });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ error: "Failed to reject company" });
  }
};
router.post("/companies/:id/reject", handleRejectCompany);
router.put("/companies/:id/reject", handleRejectCompany);

// Request More Info from Company
const handleRequestInfoCompany = async (req, res) => {
  try {
    const { message } = req.body;
    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: { rejectionReason: `Info Requested: ${message || 'Please upload updated KYC documents'}` }
    });
    res.json({ success: true, company });
  } catch (err) {
    console.error("Request info error:", err);
    res.status(500).json({ error: "Failed to request info" });
  }
};
router.post("/companies/:id/request-info", handleRequestInfoCompany);
router.put("/companies/:id/request-info", handleRequestInfoCompany);

const handleBlockCompany = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: { status: "BLOCKED", rejectionReason: reason || "Account Blocked by Administrator" }
    });
    res.json({ success: true, company });
  } catch (err) {
    console.error("Block error:", err);
    res.status(500).json({ error: "Failed to block company" });
  }
};
router.post("/companies/:id/block", handleBlockCompany);
router.put("/companies/:id/block", handleBlockCompany);

const handleUnblockCompany = async (req, res) => {
  try {
    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", rejectionReason: null }
    });
    res.json({ success: true, company });
  } catch (err) {
    console.error("Unblock error:", err);
    res.status(500).json({ error: "Failed to unblock company" });
  }
};
router.post("/companies/:id/unblock", handleUnblockCompany);
router.put("/companies/:id/unblock", handleUnblockCompany);

// Edit Company Details & Status by Admin (Supports URL param & JSON body)
const handleStatusOrEditCompany = async (req, res) => {
  try {
    const id = req.params.id || req.body.companyId;
    if (!id) return res.status(400).json({ error: "Company ID is required" });

    const { status, reason, companyName, industry, hqLocation, gstNumber, phone, workEmail } = req.body;
    const data = {};
    if (status) {
      data.status = status;
      if (status === "APPROVED") {
        data.verifiedAt = new Date();
        data.rejectionReason = null;
      } else if (status === "REJECTED" || status === "BLOCKED") {
        data.rejectionReason = reason || `${status} by Administrator`;
      }
    }
    if (companyName) data.companyName = companyName;
    if (industry) data.industry = industry;
    if (hqLocation) data.hqLocation = hqLocation;
    if (gstNumber) data.gstNumber = gstNumber;
    if (phone) data.phone = phone;
    if (workEmail) data.workEmail = workEmail;

    const company = await prisma.companyProfile.update({
      where: { id },
      data
    });
    res.json({ success: true, company });
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ error: "Failed to update company" });
  }
};
router.patch("/companies", handleStatusOrEditCompany);
router.patch("/companies/:id", handleStatusOrEditCompany);
router.put("/companies/:id", handleStatusOrEditCompany);

// 4. GET Seekers / Candidates (Full DB Data with Application Status breakdown)
router.get("/seekers", async (req, res) => {
  try {
    const seekers = await prisma.seekerProfile.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
        applications: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = seekers.map((s) => {
      const apps = s.applications || [];
      const selectedCount = apps.filter(
        (a) => a.status === "SELECTED" || a.status === "SHORTLISTED"
      ).length;
      const rejectedCount = apps.filter((a) => a.status === "REJECTED").length;
      const pendingCount = apps.filter((a) => a.status === "APPLIED").length;

      return {
        id: s.id,
        userId: s.userId,
        fullName: s.fullName,
        email: s.user?.email || "",
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        dob: s.dob,
        profileCompleted: s.profileCompleted,
        location: s.location || "India",
        qualification: s.qualification || "Graduate",
        experience: s.experience || "Fresher",
        resumeUrl: s.resumeUrl,
        resumeOriginalName: s.resumeOriginalName,
        skills: s.skills,
        currentSalary: s.currentSalary,
        expectedSalary: s.expectedSalary,
        noticePeriod: s.noticePeriod,
        portfolioUrl: s.portfolioUrl,
        status: s.skills?.includes("__BLOCKED__") ? "Blocked" : "Active",
        applications: apps.length,
        selectedCount,
        rejectedCount,
        pendingCount,
        createdAt: s.createdAt
      };
    });

    res.json({ seekers: formatted });
  } catch (err) {
    console.error("Error fetching seekers:", err);
    res.status(500).json({ error: "Failed to fetch seekers" });
  }
});

// Seeker Block / Unblock (Dual POST & PUT)
const handleBlockSeeker = async (req, res) => {
  try {
    const seeker = await prisma.seekerProfile.findUnique({ where: { id: req.params.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found" });

    const updatedSkills = (seeker.skills || "") + " __BLOCKED__";
    const updated = await prisma.seekerProfile.update({
      where: { id: req.params.id },
      data: { skills: updatedSkills.trim() }
    });
    res.json({ success: true, seeker: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to block seeker" });
  }
};
router.post("/seekers/:id/block", handleBlockSeeker);
router.put("/seekers/:id/block", handleBlockSeeker);

const handleUnblockSeeker = async (req, res) => {
  try {
    const seeker = await prisma.seekerProfile.findUnique({ where: { id: req.params.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found" });

    const updatedSkills = (seeker.skills || "").replace(/__BLOCKED__/g, "").trim();
    const updated = await prisma.seekerProfile.update({
      where: { id: req.params.id },
      data: { skills: updatedSkills }
    });
    res.json({ success: true, seeker: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to unblock seeker" });
  }
};
router.post("/seekers/:id/unblock", handleUnblockSeeker);
router.put("/seekers/:id/unblock", handleUnblockSeeker);

// 5. GET All Jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            status: true,
            industry: true,
            hqLocation: true
          }
        },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = jobs.map((j) => {
      let displayStatus = "Active";
      if (j.company?.status === "BLOCKED") {
        displayStatus = "Blocked co.";
      } else if (j.status === "DRAFT") {
        displayStatus = "Draft";
      } else if (j.status === "CLOSED") {
        displayStatus = "Closed";
      } else if (j.status === "EXPIRED") {
        displayStatus = "Expired";
      } else {
        displayStatus = "Active";
      }

      return {
        id: j.id,
        title: j.title,
        company: j.company?.companyName || "Unknown Company",
        companyStatus: j.company?.status || "APPROVED",
        category: j.department || "General",
        location: j.location,
        type: j.jobType,
        workMode: j.workMode,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        applicants: j._count?.applications || 0,
        status: displayStatus,
        rawStatus: j.status,
        isFeatured: j.isFeatured,
        description: j.description,
        skills: j.skills,
        postedOn: new Date(j.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        createdAt: j.createdAt
      };
    });

    res.json({ jobs: formatted });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Delete Job (Moderation)
router.delete("/jobs/:id", async (req, res) => {
  try {
    await prisma.job.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: "Job listing removed permanently" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Update Job Status / Featured
const handleUpdateJob = async (req, res) => {
  try {
    const jobId = req.params.id || req.body.jobId;
    const { status, isFeatured } = req.body;
    const data = {};
    if (status !== undefined) data.status = status;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;

    const job = await prisma.job.update({
      where: { id: jobId },
      data
    });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: "Failed to update job" });
  }
};
router.patch("/jobs", handleUpdateJob);
router.patch("/jobs/:id", handleUpdateJob);
router.put("/jobs/:id", handleUpdateJob);



// 7. Categories API
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name required" });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/categories/:idOrName", async (req, res) => {
  try {
    const { idOrName } = req.params;
    const decoded = decodeURIComponent(idOrName);
    const slug = decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    await prisma.category.deleteMany({
      where: {
        OR: [
          { id: decoded },
          { name: { equals: decoded, mode: "insensitive" } },
          { slug: slug }
        ]
      }
    });
    res.json({ success: true, message: `Category '${decoded}' deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// 7.5. Dedicated Analytics & Business Intelligence API
router.get("/analytics", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "7D";
    const now = new Date();

    // 1. Parallel Database Queries for Platform Metrics
    const [
      allSeekers,
      allCompanies,
      totalApplications,
      shortlistedCount,
      selectedCount,
      rejectedCount,
      categoryGroups,
      locationGroups,
      topHiringCompanies
    ] = await Promise.all([
      prisma.seekerProfile.findMany({ select: { id: true, createdAt: true } }),
      prisma.companyProfile.findMany({ select: { id: true, createdAt: true } }),
      prisma.application.count(),
      prisma.application.count({
        where: {
          status: { in: ["SHORTLISTED", "INTERVIEW", "Shortlisted", "Interview"] }
        }
      }),
      prisma.application.count({
        where: {
          status: { in: ["SELECTED", "HIRED", "Selected", "Hired", "OFFERED"] }
        }
      }),
      prisma.application.count({
        where: {
          status: { in: ["REJECTED", "Rejected"] }
        }
      }),
      prisma.job.groupBy({
        by: ["department"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6
      }),
      prisma.job.groupBy({
        by: ["location"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6
      }),
      prisma.companyProfile.findMany({
        where: { status: { in: ["APPROVED", "ACTIVE"] } },
        take: 5,
        orderBy: { jobs: { _count: "desc" } },
        select: {
          id: true,
          companyName: true,
          industry: true,
          logoUrl: true,
          _count: { select: { jobs: true } }
        }
      })
    ]);

    // 2. Compute Exact Sign-up Trends based on Timeframe
    let signUpTrends = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (timeframe === "7D") {
      // Past 7 Days (consecutive calendar days ending today)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const seekersCount = allSeekers.filter(s => {
          const cDate = new Date(s.createdAt);
          return cDate >= startOfDay && cDate <= endOfDay;
        }).length;

        const companiesCount = allCompanies.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate >= startOfDay && cDate <= endOfDay;
        }).length;

        const isToday = i === 0;
        const dayLabel = dayNames[d.getDay()];
        const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;

        signUpTrends.push({
          day: isToday ? `${dayLabel} (Today)` : dayLabel,
          shortDay: dayLabel,
          date: dateLabel,
          isoDate: startOfDay.toISOString().split("T")[0],
          seekers: seekersCount,
          companies: companiesCount,
          total: seekersCount + companiesCount
        });
      }
    } else if (timeframe === "30D") {
      // Past 30 Days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const seekersCount = allSeekers.filter(s => {
          const cDate = new Date(s.createdAt);
          return cDate >= startOfDay && cDate <= endOfDay;
        }).length;

        const companiesCount = allCompanies.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate >= startOfDay && cDate <= endOfDay;
        }).length;

        const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;

        signUpTrends.push({
          day: dateLabel,
          shortDay: dayNames[d.getDay()],
          date: dateLabel,
          isoDate: startOfDay.toISOString().split("T")[0],
          seekers: seekersCount,
          companies: companiesCount,
          total: seekersCount + companiesCount
        });
      }
    } else if (timeframe === "90D") {
      // Past 12 Weeks
      for (let i = 11; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const startOfRange = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0, 0);
        const endOfRange = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59, 999);

        const seekersCount = allSeekers.filter(s => {
          const cDate = new Date(s.createdAt);
          return cDate >= startOfRange && cDate <= endOfRange;
        }).length;

        const companiesCount = allCompanies.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate >= startOfRange && cDate <= endOfRange;
        }).length;

        const label = `Wk ${12 - i} (${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]})`;

        signUpTrends.push({
          day: `Wk ${12 - i}`,
          date: label,
          isoDate: startOfRange.toISOString().split("T")[0],
          seekers: seekersCount,
          companies: companiesCount,
          total: seekersCount + companiesCount
        });
      }
    } else {
      // ALL: Past 6 Months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const seekersCount = allSeekers.filter(s => {
          const cDate = new Date(s.createdAt);
          return cDate >= startOfMonth && cDate <= endOfMonth;
        }).length;

        const companiesCount = allCompanies.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate >= startOfMonth && cDate <= endOfMonth;
        }).length;

        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;

        signUpTrends.push({
          day: label,
          date: label,
          isoDate: startOfMonth.toISOString().split("T")[0],
          seekers: seekersCount,
          companies: companiesCount,
          total: seekersCount + companiesCount
        });
      }
    }

    // 3. Conversion Rates
    const appliedToShortlistedRate = totalApplications > 0
      ? Math.round((shortlistedCount / totalApplications) * 100)
      : 0;
    const shortlistedToSelectedRate = shortlistedCount > 0
      ? Math.round((selectedCount / shortlistedCount) * 100)
      : 0;
    const overallPlacementRate = totalApplications > 0
      ? Math.round((selectedCount / totalApplications) * 100)
      : 0;

    // 4. Formatted Categories & Locations
    const topCategories = categoryGroups.map(cg => ({
      name: cg.department || "General",
      count: cg._count.id
    }));

    const topLocations = locationGroups.map(lg => ({
      city: lg.location || "Pan-India",
      jobs: lg._count.id
    }));

    const mostActiveCompanies = topHiringCompanies.map(c => ({
      id: c.id,
      name: c.companyName,
      industry: c.industry,
      logoUrl: c.logoUrl,
      activeJobs: c._count.jobs
    }));

    res.json({
      timeframe,
      totalSeekers: allSeekers.length,
      totalCompanies: allCompanies.length,
      appliedCount: totalApplications,
      shortlistedCount,
      selectedCount,
      rejectedCount,
      conversionRates: {
        appliedToShortlistedRate,
        shortlistedToSelectedRate,
        overallPlacementRate
      },
      signUpTrends,
      topCategories,
      topLocations,
      mostActiveCompanies
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({ error: "Failed to generate analytics report" });
  }
});

// 8. Settings API
router.get("/settings", async (req, res) => {
  res.json({ settings: platformSettings });
});

router.put("/settings", async (req, res) => {
  try {
    const { notifications, subAdmins, brandingLogo, featuredContent, legalContent } = req.body;
    if (notifications) platformSettings.notifications = notifications;
    if (subAdmins) platformSettings.subAdmins = subAdmins;
    if (brandingLogo !== undefined) platformSettings.brandingLogo = brandingLogo;
    if (featuredContent !== undefined) platformSettings.featuredContent = featuredContent;
    if (legalContent !== undefined) platformSettings.legalContent = legalContent;

    res.json({ success: true, settings: platformSettings });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

module.exports = router;