const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const { q, category, location, jobType, featured } = req.query;
    const where = { status: "ACTIVE" };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        { company: { companyName: { contains: q, mode: "insensitive" } } }
      ];
    }
    if (category && category !== "All Categories") where.department = category;
    if (location && location !== "All Locations") where.location = { contains: location, mode: "insensitive" };
    if (jobType && jobType !== "All Job Types") where.jobType = jobType;
    if (featured === "true") where.isFeatured = true;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, companyName: true, industry: true, logoUrl: true, hqLocation: true, status: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const categories = await prisma.category.findMany({ orderBy: { jobCount: "desc" } });

    res.json({ jobs, categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET all categories
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

// POST Create Job
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ error: "Only recruiters can post jobs." });
    }

    const company = await prisma.companyProfile.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: "Company profile not found." });
    if (company.status !== "APPROVED") {
      return res.status(403).json({ error: "Company account is under verification. Job creation is locked." });
    }

    const { title, department, customDepartment, jobType, workMode, location, expMin, expMax, salaryMin, salaryMax, hideSalary, description, skills, openings } = req.body;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        department,
        customDepartment: department === "Others" ? customDepartment : null,
        jobType,
        workMode,
        location,
        expMin: Number(expMin) || 0,
        expMax: Number(expMax) || 5,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        hideSalary: Boolean(hideSalary),
        description,
        skills: typeof skills === "string" ? skills : JSON.stringify(skills || []),
        openings: Number(openings) || 1,
        status: "ACTIVE"
      }
    });

    await prisma.category.updateMany({ where: { name: department }, data: { jobCount: { increment: 1 } } });
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// GET recruiter's own job listings
router.get("/my/listings", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const company = await prisma.companyProfile.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.json({ jobs: [] });

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ jobs });
  } catch (err) {
    console.error("Error fetching recruiter jobs:", err);
    res.status(500).json({ error: "Failed to fetch company jobs" });
  }
});

// GET single job
router.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true, _count: { select: { applications: true } } }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// PUT /:id (Update Job Details)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Ensure only the company owner or admin can edit
    if (req.user.role === "RECRUITER" && job.company.userId !== req.user.id) {
      return res.status(403).json({ error: "You can only edit your own jobs." });
    }

    const {
      title,
      department,
      customDepartment,
      jobType,
      workMode,
      location,
      expMin,
      expMax,
      salaryMin,
      salaryMax,
      hideSalary,
      description,
      skills,
      openings,
      status
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (department !== undefined) data.department = department;
    if (customDepartment !== undefined) data.customDepartment = customDepartment;
    if (jobType !== undefined) data.jobType = jobType;
    if (workMode !== undefined) data.workMode = workMode;
    if (location !== undefined) data.location = location.trim();
    if (expMin !== undefined) data.expMin = Number(expMin) || 0;
    if (expMax !== undefined) data.expMax = Number(expMax) || 5;
    if (salaryMin !== undefined) data.salaryMin = salaryMin ? Number(salaryMin) : null;
    if (salaryMax !== undefined) data.salaryMax = salaryMax ? Number(salaryMax) : null;
    if (hideSalary !== undefined) data.hideSalary = Boolean(hideSalary);
    if (description !== undefined) data.description = description.trim();
    if (skills !== undefined) data.skills = typeof skills === "string" ? skills : JSON.stringify(skills || []);
    if (openings !== undefined) data.openings = Number(openings) || 1;
    if (status !== undefined) data.status = status;

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, job: updated });
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ error: err.message || "Failed to update job" });
  }
});

// PATCH /:id/status (Toggle Active / Closed / Paused)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (req.user.role === "RECRUITER" && job.company.userId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own jobs." });
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: status || "ACTIVE" }
    });

    res.json({ success: true, job: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update job status" });
  }
});

// DELETE /:id (Delete Job Posting)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (req.user.role === "RECRUITER" && job.company.userId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own jobs." });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});

module.exports = router;