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
 * Formats a single CTC / Salary figure into a clean, human-friendly Indian currency format.
 * - Handles full annual rupees (e.g. 750000 -> "₹7.5 LPA", 1100000 -> "₹11 LPA")
 * - Handles direct LPA entries (e.g. 7.5 -> "₹7.5 LPA", 5 -> "₹5 LPA")
 * - Handles figures >= 1 Crore (e.g. 15000000 -> "₹1.5 Cr / yr", 50000000 -> "₹5 Cr / yr")
 * - Handles stipend / monthly figures (e.g. 5000 -> "₹5,000", 25000 -> "₹25,000")
 * - Completely avoids broken "5000 L", "5 Lakh", "5000 LPA" anomalies
 */
export function formatCtcMetric(amount: number | string | null | undefined, fallback = '—'): string {
  if (amount === null || amount === undefined || amount === '') return fallback;
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return fallback;

  // Case 1: Executive / High CTC >= 1 Crore (>= 1,00,00,000)
  if (num >= 10000000) {
    const cr = num / 10000000;
    const formatted = cr % 1 === 0 ? cr.toString() : Number(cr.toFixed(1)).toString();
    return `₹${formatted} Cr / yr`;
  }

  // Case 2: Stored in full annual rupees (>= 1,00,000, e.g. 750000 -> ₹7.5 LPA, 1100000 -> ₹11 LPA)
  if (num >= 100000) {
    const lpa = num / 100000;
    const formatted = lpa % 1 === 0 ? lpa.toString() : Number(lpa.toFixed(1)).toString();
    return `₹${formatted} LPA`;
  }

  // Case 3: Stored/entered directly in LPA (e.g. 1 to 99 LPA)
  if (num >= 1 && num < 100) {
    const formatted = num % 1 === 0 ? num.toString() : Number(num.toFixed(1)).toString();
    return `₹${formatted} LPA`;
  }

  // Case 4: Small decimal (< 1 LPA, e.g. 0.3 which was 30000 / 100000)
  if (num > 0 && num < 1) {
    const rupees = Math.round(num * 100000);
    if (rupees >= 1000) {
      return `₹${rupees.toLocaleString('en-IN')}`;
    }
    return `₹${Number(num.toFixed(1))} LPA`;
  }

  // Case 5: Entered in monthly stipend / thousands below 1 Lakh (e.g. 5000, 25000, 35000)
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Formats a min & max salary range into industry-standard Indian LPA convention.
 * e.g.:
 * - (200000, 300000) -> "₹2 - ₹3 LPA"
 * - (800000, 1200000) -> "₹8 - ₹12 LPA"
 * - (750000, 1000000) -> "₹7.5 - ₹10 LPA"
 * - (8000004, 1200000) -> "₹8 - ₹12 LPA" (floating point / typos safely rounded)
 * - (600000, null) -> "₹6 LPA+"
 * - (null, 1200000) -> "Up to ₹12 LPA"
 * - hideSalary or null -> "Competitive CTC"
 */
export function formatSalaryRange(
  min?: number | string | null,
  max?: number | string | null,
  hideSalary?: boolean
): string {
  if (hideSalary) return 'Competitive CTC';

  const parseToLPA = (val: number | string | null | undefined): { val: number; isCr?: boolean } | null => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) return null;
    if (num >= 10000000) {
      const cr = num / 10000000;
      return { val: Number(cr.toFixed(1)), isCr: true };
    }
    if (num >= 100000) {
      const rawLpa = num / 100000;
      return { val: Number(rawLpa.toFixed(1)) };
    }
    if (num > 0 && num < 1000) {
      return { val: Number(num.toFixed(1)) };
    }
    return { val: Number((num / 100000).toFixed(1)) };
  };

  const minObj = parseToLPA(min);
  const maxObj = parseToLPA(max);

  if (minObj && maxObj) {
    if (minObj.isCr || maxObj.isCr) {
      const minText = minObj.isCr ? `₹${minObj.val} Cr` : `₹${minObj.val} LPA`;
      const maxText = maxObj.isCr ? `₹${maxObj.val} Cr` : `₹${maxObj.val} LPA`;
      return `${minText} - ${maxText}`;
    }
    if (minObj.val === maxObj.val) return `₹${minObj.val} LPA`;
    return `₹${minObj.val} - ₹${maxObj.val} LPA`;
  }
  if (minObj) {
    return minObj.isCr ? `₹${minObj.val} Cr+` : `₹${minObj.val} LPA+`;
  }
  if (maxObj) {
    return maxObj.isCr ? `Up to ₹${maxObj.val} Cr` : `Up to ₹${maxObj.val} LPA`;
  }
  return 'Competitive CTC';
}

/**
 * Standard Industry Experience Ranges for Job Postings
 */
export const JOB_EXPERIENCE_RANGES = [
  'Fresher (0 Years)',
  '0 – 1 Years',
  '1 – 3 Years',
  '2 – 4 Years',
  '2 – 5 Years',
  '3 – 5 Years',
  '4 – 6 Years',
  '5 – 8 Years',
  '6 – 10 Years',
  '8 – 12 Years',
  '10 – 15 Years',
  '12 – 18 Years',
  '15+ Years'
];
