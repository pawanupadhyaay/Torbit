const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const settingsFilePath = path.join(dataDir, 'recruiterSettings.json');

const defaultRecruiterPreferences = {
  instantAlerts: true,
  dailyDigest: true,
  jobStatusAlerts: true,
  autoAcknowledge: true,
  updatedAt: new Date().toISOString()
};

let inMemorySettings = {};

function loadSettingsFromDisk() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf8');
      inMemorySettings = JSON.parse(raw);
    } else {
      fs.writeFileSync(settingsFilePath, JSON.stringify({}, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error loading recruiter settings from disk:', err.message);
  }
}

function saveSettingsToDisk() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(inMemorySettings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving recruiter settings to disk:', err.message);
  }
}

loadSettingsFromDisk();

function getRecruiterSettings(identifier) {
  if (!identifier) return defaultRecruiterPreferences;
  loadSettingsFromDisk();
  return inMemorySettings[identifier] || { ...defaultRecruiterPreferences };
}

function updateRecruiterSettings(identifier, updates) {
  if (!identifier || !updates) return defaultRecruiterPreferences;
  loadSettingsFromDisk();
  const current = inMemorySettings[identifier] || { ...defaultRecruiterPreferences };
  inMemorySettings[identifier] = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveSettingsToDisk();
  return inMemorySettings[identifier];
}

module.exports = {
  getRecruiterSettings,
  updateRecruiterSettings,
  defaultRecruiterPreferences
};
