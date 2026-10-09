'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { NOTICE_PERIODS } from '@/lib/constants';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company?: { companyName?: string; logoUrl?: string };
    location?: string;
    jobType?: string;
    department?: string;
    customQuestions?: any;
  };
  currentUser?: any;
  onApplicationSubmitted?: () => void;
}

export default function ApplyJobModal({
  isOpen,
  onClose,
  job,
  currentUser,
  onApplicationSubmitted
}: ApplyJobModalProps) {
  const [mounted, setMounted] = useState(false);
  const profile = currentUser?.seekerProfile || {};
  
  const [applicantName, setApplicantName] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticeChoice, setNoticeChoice] = useState('30 days');
  const [customDays, setCustomDays] = useState('');
  const [customNoticeDate, setCustomNoticeDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('30 days');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Dynamic Custom Screener Answers State
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when modal opens or user profile is loaded
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const name = profile.fullName || currentUser?.name || 'Candidate';
      setApplicantName(name);
      
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
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, currentUser, profile, onClose]);

  if (!isOpen || !job) return null;

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
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: any) {
      setError(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans antialiased"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exact Dark Top Header */}
        <div className="bg-[#080809] text-white p-4 sm:p-6 sm:pb-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5"
          >
            <span className="text-xs font-semibold hidden sm:inline">Close</span>
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 pr-12">
            {(job.company?.logoUrl || job.company?.companyName) && (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-inner">
                {job.company?.logoUrl ? (
                  <img
                    src={job.company.logoUrl}
                    alt={job.company?.companyName || 'Company'}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[#b2c359] font-black">
                    {(job.company?.companyName || 'JOB').substring(0, 3).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white leading-snug tracking-tight">
                <span>Apply — </span>
                <span className="font-semibold text-neutral-100">{job.title}</span>
              </h2>

              <div className="text-[11px] sm:text-xs font-semibold text-[#b2c359] mt-1 flex flex-wrap items-center gap-1.5">
                <span>{job.company?.companyName || 'Employer'}</span>
                <span>•</span>
                <span>{job.location || 'India'}</span>
                <span>•</span>
                <span>{job.jobType || 'Full Time'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form Body with hidden scrollbar track */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[#b2c359]/15 text-[#9eb047] rounded-full flex items-center justify-center mx-auto border border-[#b2c359]/30">
                <CheckCircle2 className="w-8 h-8 text-[#9eb047]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Application Submitted!</h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your application for <strong className="text-neutral-900">{job.title}</strong> at{' '}
                  <strong className="text-neutral-900">{job.company?.companyName || 'the employer'}</strong> has been received.
                </p>
              </div>

              <div className="bg-[#fef9ee] text-[#8f6b1e] text-xs p-3 rounded-xl max-w-sm mx-auto border border-[#f5deb3] flex items-center justify-between font-medium">
                <span>Application Status:</span>
                <span className="font-bold bg-[#8f6b1e] text-white px-2 py-0.5 rounded text-[11px]">
                  Applied
                </span>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/seeker/dashboard';
                  }}
                  className="bg-[#b2c359] hover:bg-[#9eb047] text-black font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Go to My Applications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs sm:text-[13px]">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* 1. Applicant Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Applicant Name
                </label>
                <div className="w-full px-3.5 py-2.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl text-xs sm:text-[13px] text-neutral-600 font-medium cursor-not-allowed">
                  Auto-filled from profile — {applicantName}
                </div>
              </div>

              {/* 2. Resume / CV * */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Resume / CV *
                </label>

                {resumeUrl ? (
                  <div className="border border-neutral-200/80 bg-neutral-50/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="text-xs sm:text-[13px] font-medium text-neutral-800 truncate">
                        {resumeName || 'Resume.pdf'}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-[#9eb047] font-bold bg-[#b2c359]/20 px-2 py-0.5 rounded shrink-0">
                        ✓ Attached
                      </span>
                    </div>
                    <label className="shrink-0 text-xs font-bold text-neutral-800 hover:text-black cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition">
                      <span>Change</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="border border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl p-3 sm:p-3.5 text-center bg-neutral-50/50 hover:bg-neutral-50 transition block cursor-pointer group">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-[13px] text-neutral-600 font-medium">
                      <Paperclip className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                      <span>Upload PDF or DOC (max 5MB) — mandatory</span>
                    </div>
                    {uploading && (
                      <p className="text-[11px] text-[#9eb047] font-bold mt-1 animate-pulse">
                        Uploading resume...
                      </p>
                    )}
                  </label>
                )}
              </div>

              {/* 3. Cover Letter */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Cover Letter
                </label>
                <textarea
                  rows={2}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Optional — tell the employer why you're a fit"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition resize-none"
                />
              </div>

              {/* 4. Expected Salary & Notice Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                    Expected Salary
                  </label>
                  <input
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="₹ per annum (optional)"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                    Notice Period
                  </label>
                  <select
                    value={noticeChoice}
                    onChange={(e) => handleNoticeChoiceChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition cursor-pointer"
                  >
                    <option value="" disabled>Immediate / 15 / 30 / 60 days</option>
                    {NOTICE_PERIODS.map((np) => (
                      <option key={np} value={np}>{np}</option>
                    ))}
                    <option value="90 days">90 days</option>
                    <option value="CUSTOM_DAYS">Custom Value (Days)</option>
                  </select>

                  {/* Numerical custom days field with 'Days' suffix */}
                  {noticeChoice === 'CUSTOM_DAYS' && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-1 focus-within:ring-[#b2c359] focus-within:border-[#b2c359] bg-white transition shadow-sm">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customDays}
                          onChange={(e) => handleCustomDaysChange(e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full px-3.5 py-2 bg-transparent text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="flex items-center px-3.5 text-xs sm:text-[13px] font-bold text-neutral-700 bg-neutral-100 border-l border-neutral-200 select-none">
                          Days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Portfolio / LinkedIn URL */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Portfolio / LinkedIn URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https:// (optional)"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
                />
              </div>

              {/* 6. Dynamic Employer Screening Questions (if configured on this job) */}
              {screeningQuestions.length > 0 && (
                <div className="pt-2.5 pb-1 border-t border-neutral-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-neutral-900 tracking-tight flex items-center gap-1.5">
                        <span>Employer Screening Questions</span>
                        <span className="bg-[#b2c359]/20 text-[#2c3e06] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {screeningQuestions.length} {screeningQuestions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Please answer the job-specific questions requested by {job.company?.companyName || 'the recruiter'}.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {screeningQuestions.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="bg-neutral-50/70 border border-neutral-200/80 p-3 sm:p-3.5 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-neutral-800 leading-snug">
                          <span>{q.question || q.label || `Question #${qIdx + 1}`}</span>
                          {q.required ? (
                            <span className="text-red-500 font-black ml-1" title="Mandatory field">*</span>
                          ) : (
                            <span className="text-neutral-400 text-[10px] font-normal ml-1">(Optional)</span>
                          )}
                        </label>

                        {/* Text input */}
                        {q.type === 'TEXT' && (
                          <input
                            type="text"
                            required={q.required}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                            placeholder="Type your response..."
                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
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
                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                  onClick={() => handleCustomAnswerChange(q.id, opt)}
                                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                                    isChecked
                                      ? 'border-[#b2c359] bg-[#b2c359]/10 text-neutral-900 font-bold'
                                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`sq_${q.id}`}
                                    checked={isChecked}
                                    onChange={() => handleCustomAnswerChange(q.id, opt)}
                                    className="w-3.5 h-3.5 text-[#b2c359] focus:ring-[#b2c359]"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Multiple Choice (Checkboxes) */}
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(q.options || []).map((opt: string) => {
                              const isChecked = Array.isArray(customAnswers[q.id]) && customAnswers[q.id].includes(opt);
                              return (
                                <label
                                  key={opt}
                                  onClick={() => handleToggleMultipleChoice(q.id, opt)}
                                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                                    isChecked
                                      ? 'border-[#b2c359] bg-[#b2c359]/10 text-neutral-900 font-bold'
                                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleMultipleChoice(q.id, opt)}
                                    className="w-3.5 h-3.5 text-[#b2c359] focus:ring-[#b2c359] rounded"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Dropdown */}
                        {q.type === 'DROPDOWN' && (
                          <select
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition cursor-pointer"
                          >
                            <option value="" disabled>Select an answer</option>
                            {(q.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Current Application Status */}
              <div className="pt-0.5 space-y-1">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                  Current Application Status
                </label>
                <div>
                  <span className="inline-block bg-[#fef7eb] text-[#8f6b1e] border border-[#f5deb3] text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    Not yet applied
                  </span>
                </div>
              </div>

              {/* 8. Submit Application CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.99] text-black font-black py-3 px-4 rounded-xl text-xs sm:text-[13px] transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Application →</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted || !isOpen || !job) return null;
  return createPortal(modalContent, document.body);
}