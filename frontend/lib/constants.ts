export const DEPARTMENT_CATEGORIES = [
  "Sales & Business Development",
  "Pre-Sales / Inside Sales",
  "Marketing",
  "Digital Marketing",
  "Content & Creative",
  "CRM / Customer Relations",
  "Leasing",
  "Property Management",
  "Facility Management",
  "Projects & Construction",
  "Architecture & Design",
  "Land Acquisition & Development",
  "Real Estate Advisory & Consulting",
  "Research & Analytics",
  "Investment & Asset Management",
  "Legal",
  "Finance & Accounts",
  "Human Resources",
  "Procurement & Contracts",
  "Administration",
  "Operations",
  "Information Technology / IT",
  "PropTech / Product",
  "Valuation",
  "Government Liaison / Approvals",
  "Quality Assurance / Quality Control",
  "Health, Safety & Environment (HSE)",
  "Corporate Strategy",
  "Customer Experience",
  "Senior Management / Leadership",
  "Video Anchor",
  "Video Editor / Videographer",
  "Others"
] as const;

export const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"] as const;
export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;
export const NOTICE_PERIODS = ["Immediate", "15 days", "30 days", "60 days"] as const;
export const QUALIFICATIONS = [
  "Graduate (B.Tech / B.E / B.Sc / B.Com / BBA)",
  "Postgraduate (MBA / M.Tech / MS / M.Com)",
  "Diploma in Civil / Real Estate",
  "Doctorate / PhD",
  "Higher Secondary (12th)",
  "Others"
] as const;

export const QUALIFICATION_CATEGORIES = [
  {
    category: "Postgraduate / Master's (Tech & IT)",
    options: [
      "M.Tech / M.E. (Computer Science / IT / Electronics / Civil / Mechanical)",
      "MCA (Master of Computer Applications)",
      "M.Sc. (Computer Science / IT)",
      "M.Sc. (Data Science / AI / Analytics / Mathematics / Statistics)",
      "MS / M.S. (Tech / Engineering / Computer Science)"
    ]
  },
  {
    category: "Postgraduate / Master's (Management & Business)",
    options: [
      "MBA / PGDM - Marketing",
      "MBA / PGDM - Finance",
      "MBA / PGDM - Human Resources (HR)",
      "MBA / PGDM - Operations & Supply Chain",
      "MBA / PGDM - Real Estate & Urban Infrastructure",
      "MBA / PGDM - General Management / International Business",
      "Executive MBA (EMBA)"
    ]
  },
  {
    category: "Postgraduate / Master's (Non-Tech, Commerce, Arts & Law)",
    options: [
      "M.Com (Master of Commerce)",
      "M.A. (Economics / English / Mass Comm / Journalism / Psychology)",
      "M.Sc. (General / Physics / Chemistry / Biology / Applied Sciences)",
      "M.Arch (Master of Architecture)",
      "M.Des (Master of Design)",
      "LL.M. (Master of Laws)",
      "MSW (Master of Social Work)",
      "Other Master's / Postgraduate Degree"
    ]
  },
  {
    category: "Undergraduate / Bachelor's (Tech & IT)",
    options: [
      "B.Tech / B.E. - Civil Engineering",
      "B.Tech / B.E. - Computer Science & Engineering / IT",
      "B.Tech / B.E. - Mechanical Engineering",
      "B.Tech / B.E. - Electrical / Electronics & Communication",
      "B.Tech / B.E. - Chemical / Biotechnology / Environmental",
      "B.Tech / B.E. - Other Engineering Branches",
      "BCA (Bachelor of Computer Applications)",
      "B.Sc. (Computer Science / Information Technology / Electronics)"
    ]
  },
  {
    category: "Undergraduate / Bachelor's (Non-Tech, Commerce, Management & Arts)",
    options: [
      "BBA / BBM / BMS (Management Studies)",
      "B.Com / B.Com (Hons)",
      "B.A. (Economics / English / Mass Comm / Journalism / Arts)",
      "B.Sc. (General / Physics / Chemistry / Maths / Life Sciences)",
      "B.Arch (Bachelor of Architecture)",
      "B.Plan (Bachelor of Urban Planning)",
      "B.Des / B.F.Tech (Design / Fashion / Interior)",
      "LL.B. / B.A. LL.B. / B.B.A. LL.B. (Law)",
      "B.Ed (Bachelor of Education)",
      "B.Pharma / B.Sc. Nursing",
      "BHM (Hotel & Hospitality Management)",
      "Other Bachelor's / Undergraduate Degree"
    ]
  },
  {
    category: "Doctorate & Research",
    options: [
      "Ph.D. / Doctorate",
      "M.Phil."
    ]
  },
  {
    category: "Diploma & Vocational",
    options: [
      "Diploma in Civil Engineering",
      "Diploma in Architecture / Interior Design",
      "Diploma in Mechanical / Electrical Engineering",
      "Diploma in Computer Science / IT",
      "Polytechnic Diploma (General)",
      "ITI / Vocational Certification"
    ]
  },
  {
    category: "School & Higher Secondary",
    options: [
      "12th Pass (Higher Secondary / Intermediate)",
      "10th Pass (Matriculation / Secondary)"
    ]
  },
  {
    category: "Other / General",
    options: [
      "Graduate (B.Tech / B.E / B.Sc / B.Com / BBA)",
      "Postgraduate (MBA / M.Tech / MS / M.Com)",
      "Diploma in Civil / Real Estate",
      "Others"
    ]
  }
];

export const EXPERIENCE_RANGES = ["Fresher", "1–3 years", "3–5 years", "5+ years"] as const;

export function calculateSeekerProfileScore(p: {
  fullName?: string | null;
  phone?: string | null;
  location?: string | null;
  qualification?: string | null;
  experience?: string | null;
  noticePeriod?: string | null;
  currentSalary?: number | string | null;
  expectedSalary?: number | string | null;
  skills?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
}): number {
  let score = 0;
  if (p.fullName && p.fullName.trim().length >= 2) score += 10;
  if (p.phone && p.phone.trim().length >= 5) score += 10;
  if (p.location && p.location.trim().length >= 2) score += 10;
  if (p.qualification && p.qualification.trim().length >= 2) score += 10;
  if (p.experience && p.experience.trim().length >= 1) score += 10;
  if (p.noticePeriod && p.noticePeriod.trim().length >= 1) score += 5;
  
  const curSal = Number(p.currentSalary);
  const expSal = Number(p.expectedSalary);
  if ((!isNaN(curSal) && curSal > 0) || (!isNaN(expSal) && expSal > 0)) {
    score += 5;
  }
  
  if (p.skills && p.skills.trim().length >= 2) score += 10;
  if (p.avatarUrl && p.avatarUrl.trim().length > 0) score += 10;
  if (p.resumeUrl && p.resumeUrl.trim().length > 0) score += 20;

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Formats a CTC / Salary figure into a clean, human-friendly Indian currency format.
 * - Handles full annual rupees (e.g. 750000 -> "₹7.5 LPA", 1100000 -> "₹11 LPA")
 * - Handles direct LPA entries (e.g. 7.5 -> "₹7.5 LPA", 5 -> "₹5 LPA")
 * - Handles stipend / monthly figures (e.g. 5000 -> "₹5,000", 50000 -> "₹50,000")
 * - Completely avoids broken "L LPA" redundancy
 */
export function formatCtcMetric(amount: number | string | null | undefined, fallback = '—'): string {
  if (amount === null || amount === undefined || amount === '') return fallback;
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return fallback;

  // Case 1: Stored in full annual rupees (>= 1,00,000, e.g. 750000, 1100000)
  if (num >= 100000) {
    const lpa = num / 100000;
    const formatted = lpa % 1 === 0 ? lpa.toString() : lpa.toFixed(1);
    return `₹${formatted} LPA`;
  }

  // Case 2: Stored/entered directly in LPA (e.g. 1 to 99 LPA)
  if (num >= 1 && num < 100) {
    const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1);
    return `₹${formatted} LPA`;
  }

  // Case 3: Small decimal (< 1 LPA, e.g. 0.3 which was 30000 / 100000)
  if (num > 0 && num < 1) {
    const rupees = Math.round(num * 100000);
    if (rupees >= 1000) {
      return `₹${rupees.toLocaleString('en-IN')}`;
    }
    return `₹${num.toFixed(1)} LPA`;
  }

  // Case 4: Entered in thousands / monthly stipend / below 1 Lakh (e.g. 5000, 15000, 50000)
  return `₹${num.toLocaleString('en-IN')}`;
}
