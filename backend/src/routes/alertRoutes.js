const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");
const { sendJobAlertConfirmationEmail, sendMatchedJobsAlertEmail } = require("../services/emailService");

// Helper to query matching active jobs for an alert
async function findMatchingJobsForAlert(alert) {
  const { title, location, category } = alert;

  // Build OR condition for flexible yet relevant matching
  const conditions = [{ status: "ACTIVE" }];

  const orMatches = [];

  if (title && title.trim()) {
    const cleanTitle = title.trim();
    orMatches.push(
      { title: { contains: cleanTitle, mode: "insensitive" } },
      { skills: { contains: cleanTitle, mode: "insensitive" } },
      { description: { contains: cleanTitle, mode: "insensitive" } }
    );
  }

  if (category && category !== "All Departments" && category !== "All Categories") {
    orMatches.push({ department: { contains: category, mode: "insensitive" } });
  }

  if (location && location !== "All Locations" && location !== "Pan-India") {
    const locSnippet = location.split(",")[0].trim();
    orMatches.push({ location: { contains: locSnippet, mode: "insensitive" } });
  }

  const whereClause = {
    status: "ACTIVE",
    ...(orMatches.length > 0 ? { OR: orMatches } : {})
  };

  return prisma.job.findMany({
    where: whereClause,
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          hqLocation: true,
          industry: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

// 1. GET all job alerts for authenticated seeker
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "Only job seekers can access job alerts." });
    }

    const seeker = await prisma.seekerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!seeker) {
      return res.json({ alerts: [] });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { seekerId: seeker.id },
      orderBy: { createdAt: "desc" }
    });

    // Compute live matching jobs count for each alert
    const alertsWithMatchCounts = await Promise.all(
      alerts.map(async (alert) => {
        const matches = await findMatchingJobsForAlert(alert);
        return {
          ...alert,
          matchedCount: matches.length
        };
      })
    );

    res.json({ success: true, alerts: alertsWithMatchCounts });
  } catch (err) {
    console.error("Error fetching job alerts:", err);
    res.status(500).json({ error: "Failed to fetch job alerts." });
  }
});

// 2. POST create new job alert
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ error: "Only job seekers can create job alerts." });
    }

    const seeker = await prisma.seekerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found." });
    }

    const { title, location, category, minSalary, frequency, emailActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Please enter a job title or keyword for the alert." });
    }

    const newAlert = await prisma.jobAlert.create({
      data: {
        seekerId: seeker.id,
        title: title.trim(),
        location: location || "Delhi NCR",
        category: category || "Sales & Business Development",
        minSalary: minSalary || "Competitive",
        frequency: frequency || "Daily Instant Alert",
        emailActive: emailActive !== undefined ? Boolean(emailActive) : true
      }
    });

    // Calculate matching openings
    const matchingJobs = await findMatchingJobsForAlert(newAlert);

    // Asynchronously dispatch confirmation email
    if (seeker.user?.email) {
      sendJobAlertConfirmationEmail(
        seeker.user.email,
        seeker.fullName,
        newAlert,
        matchingJobs.length
      ).catch((e) => console.error("Job alert email notice error:", e.message));
    }

    res.json({
      success: true,
      message: "Job alert created and subscribed successfully!",
      alert: {
        ...newAlert,
        matchedCount: matchingJobs.length
      }
    });
  } catch (err) {
    console.error("Error creating job alert:", err);
    res.status(500).json({ error: "Failed to create job alert." });
  }
});

// 3. PATCH toggle alert status (Active vs Paused)
router.patch("/:id/toggle", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const seeker = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found." });

    const existing = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existing || existing.seekerId !== seeker.id) {
      return res.status(404).json({ error: "Alert not found or unauthorized." });
    }

    const updated = await prisma.jobAlert.update({
      where: { id },
      data: {
        emailActive: req.body.emailActive !== undefined ? Boolean(req.body.emailActive) : !existing.emailActive
      }
    });

    res.json({
      success: true,
      message: updated.emailActive ? "Alert resumed successfully!" : "Alert paused.",
      alert: updated
    });
  } catch (err) {
    console.error("Error toggling alert:", err);
    res.status(500).json({ error: "Failed to update alert status." });
  }
});

// 4. DELETE job alert
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const seeker = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found." });

    const existing = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existing || existing.seekerId !== seeker.id) {
      return res.status(404).json({ error: "Alert not found or unauthorized." });
    }

    await prisma.jobAlert.delete({ where: { id } });

    res.json({ success: true, message: "Job alert removed successfully." });
  } catch (err) {
    console.error("Error deleting alert:", err);
    res.status(500).json({ error: "Failed to delete alert." });
  }
});

// 5. GET matching jobs for a specific alert
router.get("/:id/matches", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const seeker = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seeker) return res.status(404).json({ error: "Seeker not found." });

    const alert = await prisma.jobAlert.findUnique({ where: { id } });
    if (!alert || alert.seekerId !== seeker.id) {
      return res.status(404).json({ error: "Alert not found." });
    }

    const matchingJobs = await findMatchingJobsForAlert(alert);

    res.json({ success: true, alert, matchingJobs });
  } catch (err) {
    console.error("Error fetching matching jobs:", err);
    res.status(500).json({ error: "Failed to fetch matching jobs." });
  }
});

// 6. POST send immediate matching jobs digest email (Test / Force dispatch)
router.post("/:id/send-digest", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const seeker = await prisma.seekerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });
    if (!seeker) return res.status(404).json({ error: "Seeker not found." });

    const alert = await prisma.jobAlert.findUnique({ where: { id } });
    if (!alert || alert.seekerId !== seeker.id) {
      return res.status(404).json({ error: "Alert not found." });
    }

    const matchingJobs = await findMatchingJobsForAlert(alert);

    if (seeker.user?.email) {
      await sendMatchedJobsAlertEmail(
        seeker.user.email,
        seeker.fullName,
        alert.title,
        matchingJobs
      );
    }

    res.json({
      success: true,
      message: `Digest email sent to ${seeker.user?.email || "your registered email"} with ${matchingJobs.length} openings!`,
      matchingCount: matchingJobs.length
    });
  } catch (err) {
    console.error("Error sending digest email:", err);
    res.status(500).json({ error: "Failed to send email digest." });
  }
});

module.exports = router;
