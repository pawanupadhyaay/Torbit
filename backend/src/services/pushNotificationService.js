const fs = require("fs");
const path = require("path");
const webpush = require("web-push");

const DATA_DIR = path.join(__dirname, "../../data");
const VAPID_FILE = path.join(DATA_DIR, "vapidKeys.json");
const SUBS_FILE = path.join(DATA_DIR, "pushSubscriptions.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Initialize or load VAPID Keys
let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || ""
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  if (fs.existsSync(VAPID_FILE)) {
    try {
      vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf-8"));
    } catch (e) {
      console.warn("⚠️ Failed to read vapidKeys.json, generating new keys.");
    }
  }

  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    const generated = webpush.generateVAPIDKeys();
    vapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey
    };
    try {
      fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), "utf-8");
      console.log("🔑 [Push] Generated and stored persistent VAPID Keys.");
    } catch (e) {
      console.error("❌ Failed to write vapidKeys.json:", e.message);
    }
  }
}

// Configure web-push with VAPID details
const contactEmail = process.env.VAPID_SUBJECT || "mailto:torbitinsights@gmail.com";
try {
  webpush.setVapidDetails(contactEmail, vapidKeys.publicKey, vapidKeys.privateKey);
  console.log("✅ [Push] Web Push VAPID initialized successfully.");
} catch (err) {
  console.error("❌ [Push] Failed to initialize VAPID details:", err.message);
}

// Helper to read subscriptions safely
function getSubscriptions() {
  try {
    if (!fs.existsSync(SUBS_FILE)) return [];
    const data = fs.readFileSync(SUBS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("⚠️ [Push] Error reading subscriptions file:", err.message);
    return [];
  }
}

// Helper to write subscriptions safely
function saveSubscriptionsList(list) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("⚠️ [Push] Error writing subscriptions file:", err.message);
  }
}

/**
 * Register or update a device push subscription
 */
function subscribe(subscriptionData) {
  const { subscription, role = "ADMIN", userId = null, userAgent = "" } = subscriptionData;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return { success: false, error: "Invalid subscription payload." };
  }

  const subs = getSubscriptions();
  const existingIndex = subs.findIndex((s) => s.subscription?.endpoint === subscription.endpoint);

  const newEntry = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    role,
    userId,
    subscription,
    userAgent,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    subs[existingIndex] = { ...subs[existingIndex], ...newEntry };
  } else {
    subs.push(newEntry);
  }

  saveSubscriptionsList(subs);
  console.log(`📱 [Push] Device registered for push notifications (Role: ${role}, Total: ${subs.length})`);
  return { success: true, count: subs.length };
}

/**
 * Remove a device subscription by endpoint
 */
function unsubscribe(endpoint) {
  if (!endpoint) return { success: false };
  const subs = getSubscriptions();
  const filtered = subs.filter((s) => s.subscription?.endpoint !== endpoint);
  saveSubscriptionsList(filtered);
  return { success: true, remaining: filtered.length };
}

/**
 * Send push notification to all Admin devices
 */
async function sendToAdmins(payload) {
  const subs = getSubscriptions();
  // Target ADMIN roles (or untagged if admin configured)
  const adminSubs = subs.filter((s) => s.role === "ADMIN" || !s.role);
  if (adminSubs.length === 0) {
    console.log("ℹ️ [Push] No active admin devices registered for push notifications.");
    return { sent: 0, total: 0 };
  }

  console.log(`🔔 [Push] Sending push notification to ${adminSubs.length} admin device(s)...`);

  const notificationPayload = JSON.stringify({
    title: payload.title || "Torbit Realty Notification",
    body: payload.body || "New update received on Torbit Realty.",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    url: payload.url || "/admin",
    data: {
      url: payload.url || "/admin",
      timestamp: Date.now(),
      ...payload.data
    }
  });

  const deadEndpoints = [];
  let successCount = 0;

  await Promise.allSettled(
    adminSubs.map(async (entry) => {
      try {
        await webpush.sendNotification(entry.subscription, notificationPayload);
        successCount++;
      } catch (err) {
        // If statusCode is 404 or 410, subscription has expired or user revoked permission
        if (err.statusCode === 404 || err.statusCode === 410) {
          deadEndpoints.push(entry.subscription.endpoint);
        } else {
          console.warn(`⚠️ [Push] Failed to push to device (${entry.id}):`, err.statusCode || err.message);
        }
      }
    })
  );

  // Clean up dead/unsubscribed endpoints automatically
  if (deadEndpoints.length > 0) {
    const updated = subs.filter((s) => !deadEndpoints.includes(s.subscription?.endpoint));
    saveSubscriptionsList(updated);
    console.log(`🧹 [Push] Pruned ${deadEndpoints.length} expired device subscriptions.`);
  }

  console.log(`✅ [Push] Notification successfully delivered to ${successCount}/${adminSubs.length} device(s).`);
  return { sent: successCount, total: adminSubs.length };
}

/**
 * Send a notification to all registered devices
 */
async function sendToAll(payload) {
  const subs = getSubscriptions();
  if (subs.length === 0) return { sent: 0, total: 0 };

  const notificationPayload = JSON.stringify({
    title: payload.title || "Torbit Realty",
    body: payload.body || "",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    url: payload.url || "/",
    data: {
      url: payload.url || "/",
      timestamp: Date.now(),
      ...payload.data
    }
  });

  const deadEndpoints = [];
  let successCount = 0;

  await Promise.allSettled(
    subs.map(async (entry) => {
      try {
        await webpush.sendNotification(entry.subscription, notificationPayload);
        successCount++;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          deadEndpoints.push(entry.subscription.endpoint);
        }
      }
    })
  );

  if (deadEndpoints.length > 0) {
    const updated = subs.filter((s) => !deadEndpoints.includes(s.subscription?.endpoint));
    saveSubscriptionsList(updated);
  }

  return { sent: successCount, total: subs.length };
}

module.exports = {
  getPublicKey: () => vapidKeys.publicKey,
  subscribe,
  unsubscribe,
  sendToAdmins,
  sendToAll,
  getSubscriptions
};
