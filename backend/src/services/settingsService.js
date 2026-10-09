const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const settingsFilePath = path.join(dataDir, 'platformSettings.json');

const defaultSpecialJobCompanies = [
  { 
    name: "DLF Limited", 
    logo: "DLF", 
    logoUrl: "https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783861188/DLF_LOGO_uvd2ry.jpg",
    websiteUrl: "https://www.dlf.in/career-page"
  },
  { 
    name: "Godrej Properties", 
    logo: "GODREJ", 
    logoUrl: "https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783863242/godrej_propertiess_pbywng.jpg",
    websiteUrl: "https://careers.godrejindustries.com/in/en/godrejproperties"
  },
  { 
    name: "SOBHA Realty", 
    logo: "SOBHA", 
    logoUrl: "https://varanyam.vercel.app/sobha_logo.png",
    websiteUrl: "https://www.sobha.com/careers/"
  },
  { 
    name: "EMAAR India", 
    logo: "EMAAR", 
    logoUrl: "https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783865314/emaar_ak4iw2.jpg",
    websiteUrl: "https://www.emaar.com/en/careers"
  },
  { 
    name: "Prestige Group", 
    logo: "PRESTIGE", 
    logoUrl: "",
    websiteUrl: "https://jobs.prestigeconstructions.com/"
  },
  { 
    name: "Puravankara", 
    logo: "PURVA", 
    logoUrl: "",
    websiteUrl: "https://www.puravankara.com/careers"
  }
];

function normalizeCompanies(list) {
  if (!Array.isArray(list) || list.length === 0) return defaultSpecialJobCompanies;
  return list.map(item => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      return {
        name: trimmed,
        logo: trimmed.slice(0, 8).toUpperCase(),
        logoUrl: '',
        websiteUrl: ''
      };
    }
    if (item && typeof item === 'object') {
      const name = (item.name || '').trim();
      return {
        name,
        logo: item.logo || (name ? name.slice(0, 8).toUpperCase() : ''),
        logoUrl: item.logoUrl || '',
        websiteUrl: item.websiteUrl || ''
      };
    }
    return null;
  }).filter(Boolean);
}

// Default initial settings
const defaultSettings = {
  brandingLogo: "",
  featuredContent: "",
  legalContent: "",
  showClosedJobsOnPortal: false,
  notifications: {
    companyApprovalEmail: true,
    companyRejectionEmail: true,
    statusChangeSms: true,
    newJobAlertDigest: false
  },
  subAdmins: [
    { id: "admin-1", name: "Rahul Kapoor", role: "Super Admin", access: "Full access" },
    { id: "admin-2", name: "Sana Iyer", role: "Approvals-only Admin", access: "Company Approvals only" }
  ],
  specialJobCompanies: defaultSpecialJobCompanies
};

let inMemorySettings = { ...defaultSettings };

// Ensure data directory exists and load initial settings
function loadSettingsFromDisk() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      inMemorySettings = {
        ...defaultSettings,
        ...parsed,
        specialJobCompanies: Array.isArray(parsed.specialJobCompanies) && parsed.specialJobCompanies.length > 0 
          ? normalizeCompanies(parsed.specialJobCompanies)
          : defaultSettings.specialJobCompanies,
        notifications: {
          ...defaultSettings.notifications,
          ...(parsed.notifications || {})
        }
      };
    } else {
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error loading settings from disk:', err);
  }
}

// Save settings to disk
function saveSettingsToDisk() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(inMemorySettings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving settings to disk:', err);
  }
}

// Initial load
loadSettingsFromDisk();

function getSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      inMemorySettings = {
        ...defaultSettings,
        ...inMemorySettings,
        ...parsed,
        showClosedJobsOnPortal: parsed.showClosedJobsOnPortal !== undefined
          ? Boolean(parsed.showClosedJobsOnPortal)
          : Boolean(inMemorySettings.showClosedJobsOnPortal),
        specialJobCompanies: Array.isArray(parsed.specialJobCompanies) && parsed.specialJobCompanies.length > 0
          ? normalizeCompanies(parsed.specialJobCompanies)
          : (inMemorySettings.specialJobCompanies || defaultSettings.specialJobCompanies)
      };
    }
  } catch (err) {
    // Fallback to inMemorySettings
  }
  return inMemorySettings;
}

function updateSettings(updates) {
  if (!updates || typeof updates !== 'object') return inMemorySettings;

  if (updates.notifications) {
    inMemorySettings.notifications = {
      ...inMemorySettings.notifications,
      ...updates.notifications
    };
  }
  if (updates.subAdmins) inMemorySettings.subAdmins = updates.subAdmins;
  if (updates.brandingLogo !== undefined) inMemorySettings.brandingLogo = updates.brandingLogo;
  if (updates.featuredContent !== undefined) inMemorySettings.featuredContent = updates.featuredContent;
  if (updates.legalContent !== undefined) inMemorySettings.legalContent = updates.legalContent;
  if (updates.showClosedJobsOnPortal !== undefined) {
    inMemorySettings.showClosedJobsOnPortal = Boolean(updates.showClosedJobsOnPortal);
  }
  if (Array.isArray(updates.specialJobCompanies)) {
    inMemorySettings.specialJobCompanies = normalizeCompanies(updates.specialJobCompanies);
  }

  saveSettingsToDisk();
  return inMemorySettings;
}

module.exports = {
  getSettings,
  updateSettings
};
