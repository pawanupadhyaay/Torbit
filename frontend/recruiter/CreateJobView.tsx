'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Clock, AlertTriangle, Plus } from 'lucide-react';

interface CreateJobViewProps {
  isApproved: boolean;
  companyStatus?: string;
  onJobCreated: () => void;
  onCancel?: () => void;
}

export default function CreateJobView({
  isApproved,
  companyStatus = 'APPROVED',
  onJobCreated,
  onCancel
}: CreateJobViewProps) {
  const REAL_ESTATE_32 = [
    'Sales & Business Development',
    'Pre-Sales / Inside Sales',
    'Marketing',
    'Digital Marketing',
    'Content & Creative',
    'CRM / Customer Relations',
    'Leasing',
    'Property Management',
    'Facility Management',
    'Projects & Construction',
    'Architecture & Design',
    'Land Acquisition & Development',
    'Real Estate Advisory & Consulting',
    'Research & Analytics',
    'Investment & Asset Management',
    'Legal',
    'Finance & Accounts',
    'Human Resources',
    'Procurement & Contracts',
    'Administration',
    'Operations',
    'Information Technology / IT',
    'PropTech / Product',
    'Valuation',
    'Government Liaison / Approvals',
    'Quality Assurance / Quality Control',
    'Health, Safety & Environment (HSE)',
    'Corporate Strategy',
    'Customer Experience',
    'Senior Management / Leadership',
    'Video Anchor',
    'Video Editor / Videographer',
    'Others'
  ];

  const [categoriesList, setCategoriesList] = useState<string[]>(REAL_ESTATE_32);

  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '/api';

  useEffect(() => {
    fetch(`${apiBase}/categories`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.categories && data.categories.length > 0) {
          const catNames = data.categories.map((c: any) => c.name || c).filter(Boolean);
          setCategoriesList(Array.from(new Set([...REAL_ESTATE_32, ...catNames])));
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Sales & Business Development');
  const [customDepartment, setCustomDepartment] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('On-site');
  const [location, setLocation] = useState('');
  const [experienceText, setExperienceText] = useState('3 – 5 years');
  const [salaryText, setSalaryText] = useState('₹8 – 12 LPA');
  const [hideSalary, setHideSalary] = useState(false);
  const [openings, setOpenings] = useState<number | string>(2);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['Negotiation', 'Client Relations', 'CRM Tools']);
  const [skillInput, setSkillInput] = useState('');
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle adding skill tags
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const clean = skillInput.trim().replace(/^,|,$/g, '');
      if (clean && !skills.includes(clean)) {
        setSkills([...skills, clean]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSkillManual = () => {
    if (skillInput.trim()) {
      const clean = skillInput.trim().replace(/^,|,$/g, '');
      if (clean && !skills.includes(clean)) {
        setSkills([...skills, clean]);
      }
      setSkillInput('');
    }
  };

  // Parse experience min/max from text or numbers
  const parseExperience = (text: string) => {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) {
      return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
    }
    if (nums && nums.length === 1) {
      return { min: parseInt(nums[0], 10), max: parseInt(nums[0], 10) + 2 };
    }
    return { min: 2, max: 5 };
  };

  // Parse salary min/max from text
  const parseSalary = (text: string) => {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) {
      return { min: parseInt(nums[0], 10) * 100000, max: parseInt(nums[1], 10) * 100000 };
    }
    if (nums && nums.length === 1) {
      return { min: parseInt(nums[0], 10) * 100000, max: (parseInt(nums[0], 10) + 4) * 100000 };
    }
    return { min: 600000, max: 1200000 };
  };

  const handlePublish = async (isDraft = false) => {
    if (!title.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!description.trim()) {
      setError('Job Description is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const exp = parseExperience(experienceText);
      const sal = parseSalary(salaryText);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        title: title.trim(),
        department: department === 'Others' && customDepartment ? customDepartment.trim() : department,
        jobType,
        workMode,
        location: location.trim(),
        expMin: exp.min,
        expMax: exp.max,
        salaryMin: sal.min,
        salaryMax: sal.max,
        hideSalary,
        description: description.trim(),
        skills: skills.join(', '),
        openings: typeof openings === 'number' ? openings : parseInt(openings, 10) || 1,
        deadline: deadline || null,
        isDraft
      };

      const res = await fetch(`${apiBase}/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post job listing.');
      }

      setSuccessMessage(isDraft ? 'Job saved as draft successfully!' : 'Job listing published successfully!');
      setTimeout(() => {
        onJobCreated();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Account Status Banner matching screenshot */}
      {isApproved ? (
        <div className="bg-[#EBF7EE] border border-[#C3E8CC] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-[#1E7E34] font-medium shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#28A745] shrink-0" />
          <span>
            <strong>Account Status: Approved</strong> — you can publish job listings.
          </span>
        </div>
      ) : companyStatus === 'REJECTED' || companyStatus === 'BLOCKED' ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-red-800 font-medium shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Account Status: Suspended / Rejected</strong> — job creation is locked. Please contact Torbit Admin.
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800 font-medium shadow-2xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Account Status: Pending Approval</strong> — job creation is locked until verified by Torbit Admin (24–48h SLA).
          </span>
        </div>
      )}

      {/* 2. Heading and Subtitle */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Create a New Job Posting
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fill in the details below. Fields marked mandatory are required to publish.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Main Form Card matching screenshot layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        {/* Row 1: Job Title & Department / Category */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sales Manager – Residential Projects"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition"
            />
          </div>

          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Department / Category <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white cursor-pointer transition"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Custom Department */}
        {department === 'Others' && (
          <div className="animate-in fade-in">
            <label className="block text-xs font-bold text-[#94C322] mb-1.5">
              Specify Custom Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customDepartment}
              onChange={(e) => setCustomDepartment(e.target.value)}
              placeholder="e.g. Fractional Ownership / REITs Management"
              className="w-full px-3.5 py-2.5 border-2 border-[#94C322] rounded-xl text-xs text-slate-800 focus:outline-none bg-white font-medium"
            />
          </div>
        )}

        {/* Row 2: Job Type, Work Mode, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white cursor-pointer transition"
            >
              <option value="Full-time">Full-time / Part-time / Internship / Contract</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Work Mode <span className="text-red-500">*</span>
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white cursor-pointer transition"
            >
              <option value="On-site">Remote / Hybrid / On-site</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State, Country"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition"
            />
          </div>
        </div>

        {/* Row 3: Experience Required, Salary Range, Number of Openings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Experience Required
            </label>
            <input
              type="text"
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="e.g. 3 – 5 years"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Salary Range
              </label>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSalary}
                  onChange={(e) => setHideSalary(e.target.checked)}
                  className="w-3 h-3 text-[#94C322] focus:ring-[#94C322] rounded cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Hide from candidates</span>
              </label>
            </div>
            <input
              type="text"
              value={salaryText}
              onChange={(e) => setSalaryText(e.target.value)}
              placeholder="e.g. ₹8 – 12 LPA (toggle: hide from candidates)"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Number of Openings
            </label>
            <input
              type="number"
              min={1}
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition"
            />
          </div>
        </div>

        {/* Row 4: Job Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Roles & responsibilities, day-to-day..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white transition resize-y"
          />
        </div>

        {/* Row 5: Required Skills & Application Deadline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Required Skills
            </label>
            <div className="min-h-[44px] px-3 py-2 border border-slate-200 rounded-xl bg-white flex flex-wrap items-center gap-2 focus-within:border-[#94C322] focus-within:ring-1 focus-within:ring-[#94C322] transition">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder={skills.length === 0 ? 'Type skill and press Enter...' : '+ add skill...'}
                className="flex-1 min-w-[120px] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent py-0.5"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Select date"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#94C322] focus:ring-1 focus:ring-[#94C322] bg-white cursor-pointer transition"
            />
          </div>
        </div>

        {/* Row 6: Bottom Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              ← Back to Jobs
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => handlePublish(true)}
              disabled={loading}
              className="px-4 sm:px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={loading}
              className="px-5 sm:px-6 py-2.5 bg-[#94C322] hover:bg-[#85b21c] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{loading ? 'Publishing...' : 'Publish Job Listing →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
