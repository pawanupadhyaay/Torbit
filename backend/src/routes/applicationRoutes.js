const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");

// POST Apply to Job
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "Only job seekers can apply for jobs." });
    }

    const seeker = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker profile not found" });

    const {
      jobId,
      resumeUrl,
      resumeOriginalName,
      currentSalary,
      expectedSalary,
      noticePeriod,
      coverLetter,
      portfolioUrl,
      customAnswers
    } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: "Job listing not found" });

    if (job.status === "CLOSED") {
      return res.status(400).json({ error: "This job listing is closed. Applications are no longer being accepted." });
    }

    const existing = await prisma.application.findFirst({ where: { jobId, seekerId: seeker.id } });
    if (existing) return res.status(400).json({ error: "You have already applied for this job." });

    // Validate mandatory screener questions if defined
    let parsedAnswers = null;
    if (customAnswers) {
      parsedAnswers = typeof customAnswers === "string" ? JSON.parse(customAnswers) : customAnswers;
    }

    if (job.customQuestions && Array.isArray(job.customQuestions)) {
      for (const q of job.customQuestions) {
        if (q.required) {
          const matchingAns = Array.isArray(parsedAnswers)
            ? parsedAnswers.find(a => a.questionId === q.id || a.question === q.question)
            : parsedAnswers?.[q.id] || parsedAnswers?.[q.question];

          const ansVal = matchingAns && typeof matchingAns === "object" ? matchingAns.answer : matchingAns;
          if (ansVal === undefined || ansVal === null || (typeof ansVal === "string" && !ansVal.trim()) || (Array.isArray(ansVal) && ansVal.length === 0)) {
            return res.status(400).json({ error: `Please answer the mandatory question: "${q.question || q.label}"` });
          }
        }
      }
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        seekerId: seeker.id,
        resumeUrl,
        resumeOriginalName: resumeOriginalName || "Resume.pdf",
        currentSalary: currentSalary ? Number(currentSalary) : null,
        expectedSalary: expectedSalary ? Number(expectedSalary) : null,
        noticePeriod: noticePeriod || "Immediate",
        coverLetter: coverLetter || "",
        portfolioUrl: portfolioUrl || "",
        customAnswers: parsedAnswers,
        status: "APPLIED"
      }
    });

    res.json({ success: true, message: "Application submitted successfully!", application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// GET applications
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role === "JOB_SEEKER") {
      const seeker = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
      if (!seeker) return res.json({ applications: [] });

      const applications = await prisma.application.findMany({
        where: { seekerId: seeker.id },
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ applications });
    }

    if (req.user.role === "RECRUITER") {
      const company = await prisma.companyProfile.findUnique({ where: { userId: req.user.id } });
      if (!company) return res.json({ applications: [] });

      const applications = await prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: { seeker: true, job: true },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ applications });
    }

    if (req.user.role === "ADMIN") {
      const { jobId } = req.query;
      const where = jobId ? { jobId } : {};
      const applications = await prisma.application.findMany({
        where,
        include: {
          seeker: true,
          job: { include: { company: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ applications });
    }

    res.json({ applications: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// PATCH status (Supports both body.applicationId and param /:id)
const handleStatusUpdate = async (req, res) => {
  try {
    const applicationId = req.params.id || req.body.applicationId;
    const { status } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({ error: "Missing applicationId or status" });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });
    res.json({ success: true, application: updated });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
};

router.patch("/", authenticateToken, handleStatusUpdate);
router.patch("/:id", authenticateToken, handleStatusUpdate);
router.patch("/:id/status", authenticateToken, handleStatusUpdate);

module.exports = router;