# Complete Master Specification: Torbit Realty Enterprise Multi-Portal Job Platform
**Document Reference:** Omrie Digital Job Portal Specification, Torbit Realty Guidelines & Client Instructions

---

## 1. System Architecture & Portals Overview

The system consists of 4 core panels/portals built over a shared database and authentication engine:
1. **Common Public Portal (`/`):** Torbit Realty branding, breaking news ticker, multi-filter search (by keyword, location & 32 categories), popular categories grid, featured jobs list, right sidebar widgets, floating/modal auth, one-click apply modal.
2. **Job Seeker Portal (`/seeker/dashboard`):** Candidate profile completion (75%), experience & skills, Current CTC & Expected CTC metrics, strictly `< 2MB` PDF/DOCX resume vault, real-time application tracking (`APPLIED` ➔ `UNDER_REVIEW` ➔ `SELECTED` / `REJECTED`).
3. **Recruiter / Builder Portal (`/recruiter/dashboard`):** Recruiter registration with GSTIN & HQ, 24–48h KYC verification lock banner/popup, Create Job engine with **32 Real Estate Domain Categories** + conditional **"Others"** custom department text input, candidate pipeline review with resume downloads.
4. **Super Admin Console (`/admin/dashboard`):** Modern SaaS Enterprise Console (Stripe/Vercel standard) with fixed dark left sidebar, KPI metrics cards, Fast KYC Approvals Queue (one-click Approve / Reject with reason), Company Directory (Block / Unblock), Candidate Pool, Job Postings Governance, 32 Categories Master, and CTC & Hiring Analytics.

---

## 2. Core Flows & Lifecycle State Machines

### A. Company Verification State Machine
```
[Company Registers with GSTIN & Work Email]
        │
        ▼
[Status: PENDING] ──► (Job creation locked, 24-48h notice displayed)
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[Admin: REJECT]            [Admin: APPROVE]
   │                               │
   ▼                               ▼
[Status: REJECTED]          [Status: APPROVED]
(Reason logged & shown,     (Job posting unlocked,
 Posting remains locked)     Live listings published)
                                   │
                                   ├──► [Admin: BLOCK] ──► [Status: BLOCKED]
                                   └──► [Admin: UNBLOCK] ──► [Status: APPROVED]
```

### B. Job Application Lifecycle
```
[Job Seeker Applies (<2MB Resume + Current CTC)]
        │
        ▼
[Status: APPLIED] ──► [Status: UNDER_REVIEW] ──► [Status: SHORTLISTED] ──► [SELECTED / REJECTED]
```

---

## 3. Field & Schema Specifications

### 3.1 Job Seeker
- **Auth / Sign Up:**
  - `Full Name` (Text, Mandatory)
  - `Email Address` (Email, Unique)
  - `Phone Number` (Number)
  - `Password` (Bcrypt hashed)
  - `Location` (City, State)
  - `Qualification` (Highest qualification)
  - `Total Experience` (Fresher, 1–3 years, 3–5 years, 5+ years)
- **Profile & Application Fields:**
  - `Resume / CV` (File upload: **Strictly `.pdf`, `.doc`, `.docx` only**, **Size limit: < 2 MB**)
  - `Current Salary / CTC` (**Mandatory for experienced applicants**)
  - `Expected Salary / CTC` (LPA number)
  - `Notice Period` (Immediate, 15 Days, 30 Days, 60 Days)
  - `Portfolio / LinkedIn URL` (URL, Optional)
  - `Skills` (Tags array)

### 3.2 Company / Recruiter
- **Auth / Sign Up:**
  - `Company Name` (Text, Mandatory)
  - `Industry / Sector` (Real Estate & Construction)
  - `Work Email Address` (Corporate domain)
  - `Phone Number` (Company contact)
  - `GST Number / Reg No.` (Mandatory for KYC verification)
  - `HQ Location` (City, State)
  - `Initial Status`: Defaults to `PENDING` with 24–48h notice.
- **Job Creation Fields:**
  - `Job Title` (Text, Mandatory)
  - `Department / Category` (Dropdown, Mandatory) — **Pre-populated with 32 Industry Categories + "Others"**:
    1. Sales & Business Development
    2. Pre-Sales / Inside Sales
    3. Marketing
    4. Digital Marketing
    5. Content & Creative
    6. CRM / Customer Relations
    7. Leasing
    8. Property Management
    9. Facility Management
    10. Projects & Construction
    11. Architecture & Design
    12. Land Acquisition & Development
    13. Real Estate Advisory & Consulting
    14. Research & Analytics
    15. Investment & Asset Management
    16. Legal
    17. Finance & Accounts
    18. Human Resources
    19. Procurement & Contracts
    20. Administration
    21. Operations
    22. Information Technology / IT
    23. PropTech / Product
    24. Valuation
    25. Government Liaison / Approvals
    26. Quality Assurance / Quality Control
    27. Health, Safety & Environment (HSE)
    28. Corporate Strategy
    29. Customer Experience
    30. Senior Management / Leadership
    31. Video Anchor
    32. Video Editor / Videographer
    33. **Others** ➔ *When selected, a conditional text input dynamically appears: "Specify Custom Department / Category"*
  - `Job Type` (Full-time, Part-time, Internship, Contract)
  - `Work Mode` (Remote, Hybrid, On-site)
  - `Location` (City, State)
  - `Experience Required` (Min-Max Range in years)
  - `Salary Range` (Min-Max Range + Hide Salary toggle)
  - `Job Description` (Rich Text)
  - `Required Skills` (Tags)
  - `Application Deadline` (Date picker)
  - `Number of Openings` (Integer)
  - `Status` (ACTIVE, CLOSED, EXPIRED)

---

## 4. Environment Architecture

Strictly 2 Environment Files per folder:
- **Development**: `.env.local`
  - Backend: `PORT=5000`, `DATABASE_URL="file:./dev.db"` (SQLite), `JWT_SECRET`
  - Frontend: `NEXT_PUBLIC_API_URL="http://localhost:5000/api"`
- **Production**: `.env.production`
  - Backend: `PORT=5000`, `DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"` (PostgreSQL), Cloudflare R2 credentials, `JWT_SECRET`
  - Frontend: `NEXT_PUBLIC_API_URL="https://api.torbitrealty.com/api"`

---

## 5. Directory Structure

```text
Job Portal/
├── MASTER_JOB_PORTAL_SPECIFICATION.md
├── backend/
│   ├── .env.local
│   ├── .env.production
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── server.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── uploadMiddleware.js (< 2MB PDF/DOCX filter)
│       └── routes/
│           ├── authRoutes.js
│           ├── jobRoutes.js
│           ├── applicationRoutes.js
│           └── adminRoutes.js
└── frontend/
    ├── .env.local
    ├── .env.production
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx (Common Landing Portal)
    │   ├── seeker/dashboard/page.tsx
    │   ├── recruiter/dashboard/page.tsx
    │   └── admin/dashboard/page.tsx
    └── components/
        ├── 1-common-portal/
        ├── 2-job-seeker-panel/
        ├── 3-recruiter-panel/
        └── 4-admin-panel/
```
