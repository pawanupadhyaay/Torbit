'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  IndianRupee,
  Users,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export interface CustomQuestion {
  id: string;
  question: string;
  type: 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'DROPDOWN';
  options?: string[];
  required: boolean;
}

export interface SpecialCompanyOption {
  name: string;
  logo?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

interface AdminPostSpecialJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
  companies: (string | SpecialCompanyOption)[];
}

export const REAL_ESTATE_DEPARTMENTS = [
  'Sales & Business Development',
  'Pre-Sales / Inside Sales',
  'Marketing',
  'Digital Marketing',
  'Content & Creative',
  'CRM / Customer Relations',
  'Leasing',
  'Property Management',
  'Facility Management',
  'Legal & Conveyancing',
  'Liaison & Approvals',
  'Land Acquisition',
  'Civil Engineering',
  'Site Supervision',
  'Project Management',
  'Quality Control / QA-QC',
  'HSE / Safety',
  'Architecture & Design',
  'Urban Planning & Master Planning',
  'Interior Design',
  'Landscape Architecture',
  'MEP Engineering',
  'Structural Engineering',
  'Estimation & Costing',
  'Billing & Quantity Survey',
  'Procurement & Contracts',
  'Finance & Accounts',
  'Investment & Fund Raising',
  'Valuation & Advisory',
  'Human Resources (HR)',
  'Administration',
  'IT & PropTech',
  'Others'
];

export default function AdminPostSpecialJobModal({
  isOpen,
  onClose,
  onJobCreated,
  companies = []
}: AdminPostSpecialJobModalProps) {
  const [mounted, setMounted] = useState(false);

  // Form State
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [isCustomCompany, setIsCustomCompany] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Sales & Business Development');
  const [customDepartment, setCustomDepartment] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [workMode, setWorkMode] = useState('On-site');
  const [location, setLocation] = useState('Gurugram, Haryana');
  const [expMin, setExpMin] = useState<number>(1);
  const [expMax, setExpMax] = useState<number>(5);
  const [salaryMinLPA, setSalaryMinLPA] = useState<string>('6');
  const [salaryMaxLPA, setSalaryMaxLPA] = useState<string>('12');
  const [hideSalary, setHideSalary] = useState(false);
  const [openings, setOpenings] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  // Custom Screening Questions State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'DROPDOWN'>('TEXT');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedCompanies = React.useMemo(() => {
    return (companies || []).map((c) => {
      if (typeof c === 'string') {
        return { name: c, logoUrl: '', logo: c.slice(0, 8).toUpperCase(), websiteUrl: '' };
      }
      return {
        name: c.name,
        logoUrl: c.logoUrl || '',
        logo: c.logo || (c.name ? c.name.slice(0, 8).toUpperCase() : ''),
        websiteUrl: c.websiteUrl || ''
      };
    }).filter(c => Boolean(c.name));
  }, [companies]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Default to first company if available
      if (normalizedCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(normalizedCompanies[0].name);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, normalizedCompanies, selectedCompany]);

  if (!isOpen || !mounted) return null;

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    let optionsArr: string[] | undefined = undefined;
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN'].includes(newQuestionType)) {
      optionsArr = newQuestionOptions
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      if (optionsArr.length === 0) {
        setError('Please provide at least 2 options separated by comma for choice questions.');
        return;
      }
    }

    const q: CustomQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      options: optionsArr,
      required: newQuestionRequired
    };

    setCustomQuestions([...customQuestions, q]);
    setNewQuestionText('');
    setNewQuestionOptions('');
    setNewQuestionRequired(false);
    setError(null);
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCompany = isCustomCompany ? customCompanyName.trim() : selectedCompany.trim();
    if (!finalCompany) {
      setError('Please select or specify a company name.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a job title.');
      return;
    }

    if (!location.trim()) {
      setError('Please provide job location.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a job description.');
      return;
    }

    const sMin = salaryMinLPA ? parseFloat(salaryMinLPA) * 100000 : null;
    const sMax = salaryMaxLPA ? parseFloat(salaryMaxLPA) * 100000 : null;

    if (sMin && sMax && sMin > sMax) {
      setError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    if (expMin > expMax) {
      setError('Minimum experience cannot exceed maximum experience.');
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const matchedCompany = normalizedCompanies.find(c => c.name.toLowerCase() === finalCompany.toLowerCase());

      const payload = {
        companyName: finalCompany,
        logoUrl: matchedCompany?.logoUrl || undefined,
        title: title.trim(),
        department,
        customDepartment: department === 'Others' ? customDepartment.trim() : null,
        jobType,
        workMode,
        location: location.trim(),
        expMin: Number(expMin) || 0,
        expMax: Number(expMax) || 0,
        salaryMin: sMin,
        salaryMax: sMax,
        hideSalary,
        openings: Number(openings) || 1,
        description: description.trim(),
        skills: skills.trim(),
        customQuestions: customQuestions.length > 0 ? customQuestions : null,
        isFeatured
      };

      const res = await fetch(`${apiBase}/admin/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create special job');
      }

      onJobCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating special job');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto font-['Helvetica',Arial,sans-serif]">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#b2c359]/20 border border-[#b2c359]/40 flex items-center justify-center text-[#b2c359]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>Post Special Job Listing</span>
                <span className="text-[10px] uppercase font-bold bg-[#b2c359] text-black px-2 py-0.5 rounded-full">Admin Authority</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Publish a job opening directly under any big enterprise hiring brand.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Hiring Company Selection (Dropdown from Settings) */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#658A0D]" />
                <span>Select Enterprise / Big Brand Company *</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCompany(!isCustomCompany);
                  setError(null);
                }}
                className="text-[11px] text-[#658A0D] hover:underline font-bold cursor-pointer"
              >
                {isCustomCompany ? '← Choose from Settings Dropdown' : '+ Type Custom Company Name'}
              </button>
            </div>

            {!isCustomCompany ? (
              <div className="space-y-1">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b2c359] focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer"
                >
                  <option value="" disabled>-- Select a Brand Configured in Settings --</option>
                  {normalizedCompanies.map((comp) => (
                    <option key={comp.name} value={comp.name}>
                      {comp.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Companies shown here are managed in Admin Dashboard &gt; Settings &gt; Special Job Companies.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="e.g. DLF Cybercity Developers Ltd."
                  required={isCustomCompany}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b2c359] transition"
                />
                <p className="text-[10px] text-slate-400">
                  Enter the exact brand name to be displayed publicly on portal listings &amp; candidate cards.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Core Job Details */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Job Specifications (Change 14 Compliant)</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Vice President – Luxury Residential Sales"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359] transition"
              />
            </div>

            {/* Department & Job Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Category *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#b2c359] transition cursor-pointer"
                >
                  {REAL_ESTATE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employment Type *
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#b2c359] transition cursor-pointer"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {department === 'Others' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specify Custom Department *
                </label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="e.g. ESG & Sustainability"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359] transition"
                />
              </div>
            )}

            {/* Work Mode & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Mode *
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#b2c359] transition cursor-pointer"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Location (City / Region) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gurugram, Delhi NCR"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359] transition"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Salary Ranges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience Range (Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={expMin}
                    onChange={(e) => setExpMin(parseInt(e.target.value) || 0)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={expMax}
                    onChange={(e) => setExpMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Salary Range (in Lakhs/Annum)
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideSalary}
                      onChange={(e) => setHideSalary(e.target.checked)}
                      className="rounded text-[#b2c359] focus:ring-0"
                    />
                    <span>Hide Salary</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={salaryMinLPA}
                    onChange={(e) => setSalaryMinLPA(e.target.value)}
                    placeholder="Min (e.g. 8)"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={salaryMaxLPA}
                    onChange={(e) => setSalaryMaxLPA(e.target.value)}
                    placeholder="Max (e.g. 15)"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                  />
                </div>
              </div>
            </div>

            {/* Total Openings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Openings
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={openings}
                  onChange={(e) => setOpenings(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#b2c359] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Feature on Portal Homepage (Top Priority)</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Job Description &amp; Responsibilities *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the candidate roles, requirements, team hierarchy, and career benefits..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359] transition"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Skills (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Real Estate Sales, HNI Client Management, Channel Partners, CRM"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#b2c359] transition"
              />
            </div>
          </div>

          {/* Section 3: Custom Screener Questions Builder (Change 14 compliant) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#658A0D]" />
                  <span>Applicant Screener Questions (Change 14)</span>
                </h4>
                <p className="text-[10px] text-slate-500">
                  Ask specific questions to applicants. Shown during application submission.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {customQuestions.length} Questions
              </span>
            </div>

            {/* Existing Questions List */}
            {customQuestions.length > 0 && (
              <div className="space-y-2">
                {customQuestions.map((q, idx) => (
                  <div key={q.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>Q{idx + 1}. {q.question}</span>
                        {q.required && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">Mandatory</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Type: <span className="font-mono text-slate-600">{q.type}</span>
                        {q.options && ` | Options: ${q.options.join(', ')}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question Row */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Type your question here (e.g. Do you have RERA Certification?)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#b2c359]"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <select
                  value={newQuestionType}
                  onChange={(e: any) => setNewQuestionType(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="TEXT">Short Text Answer</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="SINGLE_CHOICE">Single Choice (Radio)</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice (Checkboxes)</option>
                  <option value="DROPDOWN">Dropdown List</option>
                </select>

                {['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN'].includes(newQuestionType) && (
                  <input
                    type="text"
                    value={newQuestionOptions}
                    onChange={(e) => setNewQuestionOptions(e.target.value)}
                    placeholder="Options comma-separated: Yes, No, In Progress"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#b2c359]"
                  />
                )}

                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="rounded text-[#b2c359]"
                  />
                  <span>Required</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={!newQuestionText.trim()}
                  className="px-3 py-1.5 bg-[#b2c359] hover:bg-[#84b21d] disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#b2c359] hover:bg-[#84b21d] text-slate-950 text-xs font-black rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Publishing Special Job...' : 'Publish Special Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
