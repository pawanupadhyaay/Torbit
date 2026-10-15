const express = require("express");
const router = express.Router();
const pushNotificationService = require("../services/pushNotificationService");

// 1. Get Public VAPID Key for browser subscription
router.get("/vapid-public-key", (req, res) => {
  try {
    const publicKey = pushNotificationService.getPublicKey();
    if (!publicKey) {
      return res.status(500).json({ error: "Push notification service is not configured with a public key." });
    }
    res.json({ publicKey });
  } catch (err) {
    console.error("Error retrieving VAPID public key:", err);
    res.status(500).json({ error: "Failed to retrieve public key" });
  }
});

// 2. Register Device Push Subscription
router.post("/subscribe", (req, res) => {
  try {
    const { subscription, role = "ADMIN", userId = null } = req.body;
    const userAgent = req.headers["user-agent"] || "";

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: "Invalid subscription payload." });
    }

    const result = pushNotificationService.subscribe({
      subscription,
      role,
      userId,
      userAgent
    });

    res.json({
      success: true,
      message: "Device registered for instant mobile push notifications.",
      totalDevices: result.count
    });
  } catch (err) {
    console.error("Error saving push subscription:", err);
    res.status(500).json({ error: "Failed to register device subscription." });
  }
});

// 3. Unsubscribe Device
router.post("/unsubscribe", (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint is required." });
    }

    pushNotificationService.unsubscribe(endpoint);
    res.json({ success: true, message: "Device unsubscribed successfully." });
  } catch (err) {
    console.error("Error unsubscribing device:", err);
    res.status(500).json({ error: "Failed to unsubscribe device." });
  }
});

// 4. Send Test Notification to Admin Devices
router.post("/test-admin", async (req, res) => {
  try {
    const { title, body } = req.body;

    const result = await pushNotificationService.sendToAdmins({
      title: title || "🔔 Test Notification: Torbit Realty",
      body: body || "Your mobile notification bar is active & ready for instant recruiter alerts!",
      url: "/admin",
      icon: "/logo.png"
    });

    res.json({
      success: true,
      message: `Test alert sent to ${result.sent} active device(s).`,
      deliveredCount: result.sent,
      registeredDevices: result.total
    });
  } catch (err) {
    console.error("Error sending test push notification:", err);
    res.status(500).json({ error: "Failed to send test notification." });
  }
});

module.exports = router;
