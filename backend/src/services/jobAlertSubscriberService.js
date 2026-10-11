const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const subscribersFilePath = path.join(dataDir, 'jobAlertSubscribers.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory for subscribers:', err);
  }
}

/**
 * Read all subscribers from storage
 */
function getAllSubscribers() {
  try {
    if (!fs.existsSync(subscribersFilePath)) {
      return [];
    }
    const rawData = fs.readFileSync(subscribersFilePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading jobAlertSubscribers.json:', err);
    return [];
  }
}

/**
 * Save subscribers list to storage
 */
function saveSubscribers(subscribers) {
  try {
    fs.writeFileSync(subscribersFilePath, JSON.stringify(subscribers, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing jobAlertSubscribers.json:', err);
    return false;
  }
}

/**
 * Get all active subscribers
 */
function getActiveSubscribers() {
  const all = getAllSubscribers();
  return all.filter((s) => s.isActive !== false && s.email);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Subscribe an email address to job alerts
 */
function subscribe(email, metadata = {}) {
  if (!isValidEmail(email)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getAllSubscribers();
  const existingIndex = subscribers.findIndex(
    (s) => s.email && s.email.toLowerCase() === cleanEmail
  );

  if (existingIndex !== -1) {
    const existing = subscribers[existingIndex];
    if (existing.isActive !== false) {
      return {
        success: true,
        message: 'You are already subscribed to Torbit Realty Job Alerts!',
        isNew: false,
        subscriber: existing
      };
    }

    // Reactivate subscription
    existing.isActive = true;
    existing.reactivatedAt = new Date().toISOString();
    existing.source = metadata.source || existing.source || 'common_dashboard';
    subscribers[existingIndex] = existing;
    saveSubscribers(subscribers);

    return {
      success: true,
      message: 'Welcome back! Your job alert subscription has been reactivated.',
      isNew: true,
      subscriber: existing
    };
  }

  // Create new subscriber
  const newSubscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    email: cleanEmail,
    name: metadata.name || '',
    subscribedAt: new Date().toISOString(),
    isActive: true,
    source: metadata.source || 'common_dashboard',
    lastAlertSentAt: null
  };

  subscribers.unshift(newSubscriber);
  saveSubscribers(subscribers);

  return {
    success: true,
    message: 'Subscribed successfully! You will receive new real estate job alerts in your inbox.',
    isNew: true,
    subscriber: newSubscriber
  };
}

/**
 * Unsubscribe an email
 */
function unsubscribe(email) {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getAllSubscribers();
  const target = subscribers.find((s) => s.email && s.email.toLowerCase() === cleanEmail);
  if (target) {
    target.isActive = false;
    target.unsubscribedAt = new Date().toISOString();
    saveSubscribers(subscribers);
    return true;
  }
  return false;
}

/**
 * Update subscriber's last alert sent timestamp
 */
function recordAlertSent(email) {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getAllSubscribers();
  const target = subscribers.find((s) => s.email && s.email.toLowerCase() === cleanEmail);
  if (target) {
    target.lastAlertSentAt = new Date().toISOString();
    saveSubscribers(subscribers);
  }
}

module.exports = {
  getAllSubscribers,
  getActiveSubscribers,
  isValidEmail,
  subscribe,
  unsubscribe,
  recordAlertSent
};
