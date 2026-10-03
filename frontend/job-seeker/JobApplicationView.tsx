'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Paperclip,
  UploadCloud,
  AlertCircle,
  ArrowRight,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Clock,
  User,
  Check
} from 'lucide-react';
import { NOTICE_PERIODS } from '@/lib/constants';

interface JobApplicationViewProps {
  job: {
    id: string;
    title: string;
    company?: { companyName?: string; logoUrl?: string; industry?: string; hqLocation?: string };
    location?: string;
    jobType?: string;
    workMode?: string;
    department?: string;
    expMin?: number;
    expMax?: number;
    salaryMin?: number;
    salaryMax?: number;
    hideSalary?: boolean;
    description?: string;
    skills?: string;
    customQuestions?: any;
    createdAt?: string;
  };
  currentUser?: any;
  onBack: () => void;
  onApplicationSubmitted?: () => void;
  onViewApplications?: () => void;
}

export default function JobApplicationView({
  job,
  currentUser,
  onBack,
  onApplicationSubmitted,
  onViewApplications
}: JobApplicationViewProps) {
  const profile = currentUser?.seekerProfile || currentUser || {};

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticeChoice, setNoticeChoice] = useState('30 days');
  const [customDays, setCustomDays] = useState('');
  const [customNoticeDate, setCustomNoticeDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('30 days');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Dynamic Custom Screening Answers State
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse questions from job
  const screeningQuestions: any[] = React.useMemo(() => {
    if (!job?.customQuestions) return [];
    if (typeof job.customQuestions === 'string') {
      try {
        return JSON.parse(job.customQuestions);
      } catch {
        return [];
      }
    }
    return Array.isArray(job.customQuestions) ? job.customQuestions : [];
  }, [job?.customQuestions]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleNoticeChoiceChange = (choice: string) => {
    setNoticeChoice(choice);
    if (choice === 'CUSTOM_DAYS') {
      setNoticePeriod(customDays ? `${customDays} days` : '');
    } else if (choice === 'CUSTOM_DATE') {
      if (customNoticeDate) {
        const formatted = formatDisplayDate(customNoticeDate);
        setNoticePeriod(formatted ? `Available from ${formatted}` : '');
      } else {
        setNoticePeriod('');
      }
    } else {
      setNoticePeriod(choice);
    }
  };

  const handleCustomDaysChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setCustomDays(cleaned);
    if (cleaned) {
      const num = parseInt(cleaned, 10);
      setNoticePeriod(`${num} ${num === 1 ? 'day' : 'days'}`);
    } else {
      setNoticePeriod('');
    }
  };

  const handleCustomDateChange = (dateVal: string) => {
    setCustomNoticeDate(dateVal);
    if (dateVal) {
      const formatted = formatDisplayDate(dateVal);
      setNoticePeriod(`Available from ${formatted}`);
    } else {
      setNoticePeriod('');
    }
  };

  const isInitializedRef = useRef(false);

  // Scroll to top only once when the application page initially opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Hydrate initial form fields from candidate profile once without overwriting edits or jumping scroll
  useEffect(() => {
    if (isInitializedRef.current) return;

    const name = profile.fullName || currentUser?.name || currentUser?.seekerProfile?.fullName || '';
    const email = profile.email || currentUser?.email || '';
    const phone = profile.phone || currentUser?.phone || '';

    if (name || email) {
      setApplicantName(prev => prev || name || 'Candidate');
      setApplicantEmail(prev => prev || email);
      setApplicantPhone(prev => prev || phone);
      isInitializedRef.current = true;
    }

    if (profile.resumeUrl && !resumeUrl) {
      setResumeUrl(profile.resumeUrl);
      setResumeName(profile.resumeOriginalName || 'Resume.pdf');
    }
    if (profile.expectedSalary && !expectedSalary) {
      setExpectedSalary(String(profile.expectedSalary));
    }
    if (profile.noticePeriod) {
      const standardPresets = ['Immediate', '15 days', '30 days', '60 days', '90 days'];
      if (standardPresets.includes(profile.noticePeriod)) {
        setNoticeChoice(profile.noticePeriod);
        setNoticePeriod(profile.noticePeriod);
      } else {
        const daysMatch = profile.noticePeriod.match(/^(\d+)\s*days?$/i);
        if (daysMatch) {
          setNoticeChoice('CUSTOM_DAYS');
          setCustomDays(daysMatch[1]);
          setNoticePeriod(profile.noticePeriod);
        } else {
          const dateMatch = profile.noticePeriod.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            setNoticeChoice('CUSTOM_DATE');
            setCustomNoticeDate(dateMatch[0]);
          } else {
            setNoticeChoice('CUSTOM_DAYS');
          }
          setNoticePeriod(profile.noticePeriod);
        }
      }
    }
    if (profile.portfolioUrl && !portfolioUrl) {
      setPortfolioUrl(profile.portfolioUrl);
    }
  }, [currentUser, profile]);

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleMultipleChoice = (questionId: string, option: string) => {
    setCustomAnswers(prev => {
      const currentList: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (currentList.includes(option)) {
        return { ...prev, [questionId]: currentList.filter(o => o !== option) };
      } else {
        return { ...prev, [questionId]: [...currentList, option] };
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Strict < 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit. Please upload a PDF or DOC file less than 5 MB.');
      return;
    }

    // Strictly .pdf, .doc, .docx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setError('Invalid format. Only .pdf, .doc, and .docx formats are accepted.');
      return;
    }

    setResumeName(file.name);
    setUploading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setResumeUrl(data.fileUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setResumeName('');
      setResumeUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resumeUrl) {
      setError('Please attach your Resume / CV (mandatory).');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    // Mandatory Custom Questions Validation
    for (const q of screeningQuestions) {
      if (q.required) {
        const val = customAnswers[q.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && !val.trim()) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setError(`Please answer the mandatory question: "${q.question}"`);
          return;
        }
      }
    }

    if (noticeChoice === 'CUSTOM_DAYS' && (!customDays || parseInt(customDays, 10) <= 0)) {
      setError('Please enter your notice period in days.');
      return;
    }

    if (noticeChoice === 'CUSTOM_DATE' && !customNoticeDate) {
      setError('Please select your available date for the notice period.');
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const formattedAnswers = screeningQuestions.map(q => ({
        questionId: q.id,
        question: q.question,
        type: q.type,
        required: q.required,
        answer: customAnswers[q.id] ?? ''
      }));

      let finalNoticePeriod = noticePeriod;
      if (noticeChoice === 'CUSTOM_DAYS') {
        const num = parseInt(customDays, 10);
        finalNoticePeriod = num ? `${num} ${num === 1 ? 'day' : 'days'}` : '30 days';
      } else if (noticeChoice === 'CUSTOM_DATE') {
        finalNoticePeriod = customNoticeDate ? `Available from ${formatDisplayDate(customNoticeDate)}` : 'Immediate';
      } else if (!finalNoticePeriod) {
        finalNoticePeriod = noticeChoice || '30 days';
      }

      const payload = {
        jobId: job.id,
        resumeUrl,
        resumeOriginalName: resumeName || 'Resume.pdf',
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        noticePeriod: finalNoticePeriod,
        coverLetter,
        portfolioUrl,
        customAnswers: formattedAnswers.length > 0 ? formattedAnswers : null
      };

      const res = await fetch(`${apiBase}/applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: any) {
      setError(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const companyName = job.company?.companyName || 'Verified Employer';
  const companyLogo = job.company?.logoUrl;
  const companyInitials = (companyName || 'JOB').substring(0, 2).toUpperCase();

  const formatSalary = () => {
    if (job.hideSalary) return 'Disclosed upon Request';
    const min = job.salaryMin;
    const max = job.salaryMax;
    if (min && max) {
      const minLPA = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
      const maxLPA = (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1);
      return `₹${minLPA} – ${maxLPA} LPA`;
    }
    if (min) {
      const minLPA = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
      return `₹${minLPA} LPA+`;
    }
    return 'Competitive CTC';
  };

  // =========================================================================
  // SUCCESS STATE VIEW
  // =========================================================================
  if (success) {
    return (
      <div className="font-['Helvetica',Arial,sans-serif] max-w-2xl mx-auto py-8 sm:py-16 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-lime-100 text-[#7ea81b] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#7ea81b]" />
          </div>

          <div className="space-y-2">
            <span className="bg-[#b2c359]/20 text-[#364710] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Application Submitted
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              You&apos;ve Applied to {job.title}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Your profile, resume, and screening responses have been delivered directly to the hiring team at{' '}
              <strong className="text-gray-900">{companyName}</strong>.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center text-gray-500">
              <span>Applied Role</span>
              <span className="font-bold text-gray-900">{job.title}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Employer</span>
              <span className="font-bold text-gray-900">{companyName}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Attached Resume</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]">{resumeName}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Notice Period</span>
              <span className="font-bold text-[#445612]">
                {noticeChoice === 'CUSTOM_DAYS'
                  ? `${customDays} days`
                  : noticeChoice === 'CUSTOM_DATE'
                  ? `Available from ${formatDisplayDate(customNoticeDate)}`
                  : noticeChoice}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onViewApplications && (
              <button
                type="button"
                onClick={onViewApplications}
                className="w-full sm:w-auto px-6 py-3 bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View in My Applications</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN FULL APPLICATION PAGE VIEW
  // =========================================================================
  return (
    <div className="font-['Helvetica',Arial,sans-serif] space-y-5 sm:space-y-6 pb-12">
      
      {/* 1. TOP NAVIGATION / BREADCRUMB BAR */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#b2c359] hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-[13px] transition shadow-2xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-0.5 transition" />
          <span>Back to Job Openings</span>
        </button>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span>Applying to</span>
          <span className="font-bold text-gray-800">{companyName}</span>
        </span>
      </div>

      {/* 2. MAIN FORM & SIDEBAR GRID */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* LEFT COLUMN: STICKY JOB SNAPSHOT & TIPS (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 lg:self-start order-2 lg:order-1 z-10">
            
            {/* Job Summary Sidebar Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3.5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Job Snapshot</span>
                <span className="text-[10px] font-bold text-[#7ea81b]">Overview</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Role</span>
                  <span className="font-bold text-gray-900 text-right">{job.title}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Company</span>
                  <span className="font-bold text-gray-900 text-right">{companyName}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-bold text-gray-900 text-right">{job.location || 'India'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Job Type</span>
                  <span className="font-bold text-gray-900 text-right">{job.jobType || 'Full-time'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Work Mode</span>
                  <span className="font-bold text-gray-900 text-right">{job.workMode || 'On-site'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-bold text-gray-900 text-right">{job.expMin ?? 0}–{job.expMax ?? 5} Years</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500">Package</span>
                  <span className="font-black text-gray-950 text-right">{formatSalary()}</span>
                </div>
              </div>

              {job.skills && (
                <div className="pt-3 border-t border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.split(',').map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Trust & Guidelines Card */}
            <div className="bg-lime-50/70 border border-lime-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#7ea81b]" />
                <span>Application Tips</span>
              </h4>
              <ul className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#7ea81b] font-bold">✓</span>
                  <span>Ensure your resume has updated contact details and recent achievements.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#7ea81b] font-bold">✓</span>
                  <span>Answer employer screening questions honestly and concisely.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#7ea81b] font-bold">✓</span>
                  <span>Track your application status anytime in the &apos;Applied Jobs&apos; tab.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT COLUMN: TITLE BANNER & APPLICATION FORM (8 Cols on Desktop, scrolls with Title) */}
          <div className="lg:col-span-8 space-y-5 order-1 lg:order-2">
            
            {/* 1. PROMINENT JOB SUMMARY BANNER / TITLE (Scrolls with the form) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* Company Monogram Logo */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-sm sm:text-base text-gray-800 shrink-0 overflow-hidden shadow-2xs">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-[#647a16]">{companyInitials}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="bg-[#b2c359]/20 text-[#364710] border border-[#b2c359]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {job.department || 'Job Opening'}
                      </span>
                      <span className="bg-slate-900 text-lime-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {job.jobType || 'Full-Time'}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {job.workMode || 'On-site'}
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                      Application for {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600 mt-2">
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{companyName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.location || 'India'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-gray-900">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formatSalary()}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.expMin ?? 0}–{job.expMax ?? 5} Years Exp</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-[13px] text-red-700 flex items-start gap-2.5 animate-in fade-in shadow-2xs">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* CARD 1: Applicant Profile Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#7ea81b]" />
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                    Applicant Information
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Profile Synced</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Resume / CV Upload (Mandatory) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7ea81b]" />
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                    Resume / Curriculum Vitae
                  </h3>
                </div>
                <span className="text-[11px] text-red-500 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Mandatory *
                </span>
              </div>

              {resumeUrl ? (
                <div className="p-4 bg-lime-50/70 border border-lime-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-lime-200/80 text-[#3d4f13] flex items-center justify-center shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {resumeName || 'Resume.pdf'}
                        </span>
                        <span className="bg-[#b2c359] text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                          Attached
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Ready to be submitted with your application
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs">
                      <span>Change File</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 hover:border-[#b2c359] bg-gray-50/70 hover:bg-white rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#7ea81b] group-hover:scale-105 transition mb-2.5">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800">
                    {uploading ? 'Uploading your document...' : 'Click to Upload your Resume / CV'}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1">
                    Accepts PDF, DOC, DOCX files up to 5 MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* CARD 3: Compensation & Notice Period */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#7ea81b]" />
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                    Compensation &amp; Notice Period
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expected Salary */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                    Expected Salary (₹ per annum)
                  </label>
                  <input
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. 850000 (optional)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Numerical value only (e.g. 800000 for 8 LPA)</p>
                </div>

                {/* Notice Period */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                    Notice Period
                  </label>
                  <select
                    value={noticeChoice}
                    onChange={(e) => handleNoticeChoiceChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition cursor-pointer"
                  >
                    <option value="" disabled>Select Notice Period</option>
                    {NOTICE_PERIODS.map((np) => (
                      <option key={np} value={np}>{np}</option>
                    ))}
                    <option value="90 days">90 days</option>
                    <option value="CUSTOM_DAYS">Custom Value (Days)</option>
                  </select>

                  {/* Numerical custom days field with 'Days' suffix badge */}
                  {noticeChoice === 'CUSTOM_DAYS' && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-[#b2c359] focus-within:border-[#b2c359] bg-white transition shadow-2xs">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customDays}
                          onChange={(e) => handleCustomDaysChange(e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full px-3.5 py-2 bg-transparent text-xs sm:text-[13px] text-gray-900 font-semibold placeholder-gray-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="flex items-center px-3.5 text-xs sm:text-[13px] font-bold text-gray-700 bg-gray-100 border-l border-gray-200 select-none">
                          Days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio / LinkedIn */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                  Portfolio / LinkedIn / GitHub URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username (optional)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
                />
              </div>
            </div>

            {/* CARD 4: Cover Letter (Optional) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7ea81b]" />
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                    Cover Letter / Note to Recruiter
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">(Optional)</span>
              </div>

              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the hiring team why you are a great match for this position..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition resize-y"
              />
            </div>

            {/* CARD 5: Dynamic Employer Screening Questions (if configured) */}
            {screeningQuestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#7ea81b]" />
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                      Employer Screening Questions
                    </h3>
                  </div>
                  <span className="bg-[#b2c359]/20 text-[#2c3e06] text-[10px] font-black px-2 py-0.5 rounded-full">
                    {screeningQuestions.length} {screeningQuestions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Please answer the job-specific screening questions requested by{' '}
                  <strong className="text-gray-800">{companyName}</strong>.
                </p>

                <div className="space-y-4 pt-1">
                  {screeningQuestions.map((q: any, qIdx: number) => (
                    <div
                      key={q.id || qIdx}
                      className="bg-gray-50/70 border border-gray-200/90 p-4 sm:p-5 rounded-2xl space-y-2.5"
                    >
                      <label className="block text-xs sm:text-[13px] font-bold text-gray-900 leading-snug">
                        <span>{q.question || q.label || `Question #${qIdx + 1}`}</span>
                        {q.required ? (
                          <span className="text-red-500 font-black ml-1" title="Mandatory field">*</span>
                        ) : (
                          <span className="text-gray-400 text-[10px] font-normal ml-1">(Optional)</span>
                        )}
                      </label>

                      {/* Text input */}
                      {q.type === 'TEXT' && (
                        <input
                          type="text"
                          required={q.required}
                          value={customAnswers[q.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder="Type your response here..."
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
                        />
                      )}

                      {/* Number input */}
                      {q.type === 'NUMBER' && (
                        <input
                          type="number"
                          required={q.required}
                          value={customAnswers[q.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder="e.g. 3"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      )}

                      {/* Single Choice (Radio) */}
                      {q.type === 'SINGLE_CHOICE' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || ['Yes', 'No']).map((opt: string) => {
                            const isChecked = customAnswers[q.id] === opt;
                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-lime-50/80 border-[#b2c359] text-gray-900 font-bold'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt}
                                  checked={isChecked}
                                  onChange={() => handleCustomAnswerChange(q.id, opt)}
                                  className="accent-[#b2c359]"
                                />
                                <span className="truncate">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Multiple Choice (Checkboxes) */}
                      {q.type === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || []).map((opt: string) => {
                            const currentList: string[] = Array.isArray(customAnswers[q.id]) ? customAnswers[q.id] : [];
                            const isChecked = currentList.includes(opt);
                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-lime-50/80 border-[#b2c359] text-gray-900 font-bold'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleMultipleChoice(q.id, opt)}
                                  className="accent-[#b2c359] rounded"
                                />
                                <span className="truncate">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 6: Review & Submit Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Direct Application via Torbit Jobs Platform</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 sm:flex-initial px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex-[2] sm:flex-initial px-8 py-3 bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
}
