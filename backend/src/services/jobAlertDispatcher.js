const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendNewJobAlertMatchEmail, sendJobAlertBroadcastEmail } = require("./emailService");
const jobAlertSubscriberService = require("./jobAlertSubscriberService");

/**
 * Dispatch job alert notification emails to:
 * 1. Registered job seekers with matching saved JobAlert criteria
 * 2. General subscribers who subscribed via the "Get Job Alerts" widget on the dashboard
 *
 * @param {Object} job - The newly posted job object
 * @param {string} companyName - Company / Developer name
 */
async function dispatchJobAlertNotifications(job, companyName) {
  if (!job || !job.title) return;

  const resolvedCompany = companyName || job.companyName || (job.company && job.company.companyName) || "Real Estate Enterprise";
  const sentEmails = new Set();

  console.log(`📡 [Job Alert Dispatcher] Broadcasting new job alert for "${job.title}" at "${resolvedCompany}"...`);

  // 1. Notify registered job seekers with matching saved alerts
  try {
    const activeAlerts = await prisma.jobAlert.findMany({
      where: { emailActive: true },
      include: {
        seeker: {
          include: { user: true }
        }
      }
    });

    for (const alert of activeAlerts) {
      const seekerEmail = alert.seeker?.user?.email;
      if (!seekerEmail) continue;

      const normEmail = seekerEmail.trim().toLowerCase();
      if (sentEmails.has(normEmail)) continue;

      const titleMatch = !alert.title || alert.title.trim() === '' || 
        job.title.toLowerCase().includes(alert.title.toLowerCase()) || 
        alert.title.toLowerCase().includes(job.title.toLowerCase());

      const locationMatch = !alert.location || alert.location === 'All Locations' || 
        (job.location && job.location.toLowerCase().includes(alert.location.toLowerCase())) ||
        (alert.location && alert.location.toLowerCase().includes((job.location || '').toLowerCase()));

      const categoryMatch = !alert.category || alert.category === 'All Categories' || alert.category === 'All Departments' || 
        (job.department && job.department.toLowerCase().includes(alert.category.toLowerCase())) ||
        (alert.category && alert.category.toLowerCase().includes((job.department || '').toLowerCase()));

      if (titleMatch && (locationMatch || categoryMatch)) {
        sentEmails.add(normEmail);
        sendNewJobAlertMatchEmail({
          seekerEmail: normEmail,
          seekerName: alert.seeker?.fullName || "Candidate",
          alertTitle: alert.title || alert.category || "Real Estate Alert",
          job: {
            title: job.title,
            companyName: resolvedCompany,
            location: job.location,
            jobType: job.jobType,
            workMode: job.workMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            hideSalary: job.hideSalary
          }
        }).catch((err) => {
          console.error(`⚠️ [Job Alert Dispatcher] Error sending alert email to seeker ${normEmail}:`, err.message);
        });
      }
    }
  } catch (err) {
    console.error("⚠️ [Job Alert Dispatcher] Error querying registered seeker alerts:", err.message);
  }

  // 2. Broadcast to all active subscribers from the "Get Job Alerts" widget
  try {
    const activeSubscribers = jobAlertSubscriberService.getActiveSubscribers();
    console.log(`📋 [Job Alert Dispatcher] Found ${activeSubscribers.length} active newsletter subscribers`);

    for (const sub of activeSubscribers) {
      if (!sub.email) continue;
      const normEmail = sub.email.trim().toLowerCase();
      if (sentEmails.has(normEmail)) continue;

      sentEmails.add(normEmail);

      // Asynchronously send job alert broadcast email
      sendJobAlertBroadcastEmail({
        toEmail: normEmail,
        recipientName: sub.name || "Job Seeker",
        job: {
          title: job.title,
          companyName: resolvedCompany,
          location: job.location,
          jobType: job.jobType,
          workMode: job.workMode,
          expMin: job.expMin,
          expMax: job.expMax,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          hideSalary: job.hideSalary
        }
      })
      .then(() => {
        jobAlertSubscriberService.recordAlertSent(normEmail);
      })
      .catch((err) => {
        console.error(`⚠️ [Job Alert Dispatcher] Error broadcasting to subscriber ${normEmail}:`, err.message);
      });
    }
  } catch (err) {
    console.error("⚠️ [Job Alert Dispatcher] Error querying dashboard subscribers:", err.message);
  }

  console.log(`✅ [Job Alert Dispatcher] Dispatched notifications to ${sentEmails.size} recipients.`);
}

module.exports = {
  dispatchJobAlertNotifications
};
