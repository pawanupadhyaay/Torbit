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
    company?: { companyName?: string };
    location?: string;
    jobType?: string;
    department?: string;
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
  const [noticePeriod, setNoticePeriod] = useState('30 days');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      if (profile.noticePeriod && !noticePeriod) {
        setNoticePeriod(profile.noticePeriod);
      }
      if (profile.portfolioUrl && !portfolioUrl) {
        setPortfolioUrl(profile.portfolioUrl);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentUser, profile]);

  if (!isOpen) return null;

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

    setSubmitting(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        jobId: job.id,
        resumeUrl,
        resumeOriginalName: resumeName || 'Resume.pdf',
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        noticePeriod,
        coverLetter,
        portfolioUrl
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
      className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto font-sans antialiased"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-[22px] max-w-[540px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden max-h-[92vh] flex flex-col my-auto border border-neutral-800/20 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exact Dark Top Header */}
        <div className="bg-[#080809] text-white p-4 sm:p-6 sm:pb-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight pr-8">
            <span>Apply — </span>
            <span className="font-semibold text-neutral-100">{job.title}</span>
          </h2>

          <div className="text-[11px] sm:text-xs font-semibold text-[#9ec42c] mt-1 flex flex-wrap items-center gap-1.5">
            <span>{job.company?.companyName || 'Employer'}</span>
            <span>•</span>
            <span>{job.location || 'India'}</span>
            <span>•</span>
            <span>{job.jobType || 'Full Time'}</span>
          </div>
        </div>

        {/* Modal Form Body with hidden scrollbar track */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[#9ec42c]/15 text-[#7ea01a] rounded-full flex items-center justify-center mx-auto border border-[#9ec42c]/30">
                <CheckCircle2 className="w-8 h-8 text-[#7ea01a]" />
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/seeker/dashboard';
                  }}
                  className="bg-[#9ec42c] hover:bg-[#8eaf24] text-black font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
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
                      <span className="text-[10px] sm:text-[11px] text-[#7ea01a] font-bold bg-[#9ec42c]/20 px-2 py-0.5 rounded shrink-0">
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
                      <p className="text-[11px] text-[#7ea01a] font-bold mt-1 animate-pulse">
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
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#9ec42c] focus:border-[#9ec42c] transition resize-none"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#9ec42c] focus:border-[#9ec42c] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                    Notice Period
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#9ec42c] focus:border-[#9ec42c] transition cursor-pointer"
                  >
                    <option value="" disabled>Immediate / 15 / 30 / 60 days</option>
                    {NOTICE_PERIODS.map((np) => (
                      <option key={np} value={np}>{np}</option>
                    ))}
                  </select>
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
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#9ec42c] focus:border-[#9ec42c] transition"
                />
              </div>

              {/* 6. Current Application Status */}
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

              {/* 7. Submit Application CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full bg-[#9ec42c] hover:bg-[#8eaf24] active:scale-[0.99] text-black font-black py-3 px-4 rounded-xl text-xs sm:text-[13px] transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <span>Submitting Application...</span>
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

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}