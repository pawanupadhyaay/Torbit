'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useBodyScrollLock from '@/lib/useBodyScrollLock';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  DollarSign,
  Users,
  CheckCircle2,
  Share2,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onApply: (job: any) => void;
  isApplied?: boolean;
}

export default function JobDetailsModal({
  isOpen,
  onClose,
  job,
  onApply,
  isApplied = false
}: JobDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(isOpen);

  if (!isOpen || !job) return null;

  // Format Salary
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
    return 'Competitive in Industry';
  };

  // Format Time Ago
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently posted';
    if (dateStr.includes('ago')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently posted';
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} week(s) ago`;
    return `Posted ${Math.floor(diffDays / 30)} month(s) ago`;
  };

  // Parse Skills
  let skillsList: string[] = [];
  if (Array.isArray(job.skills)) {
    skillsList = job.skills;
  } else if (typeof job.skills === 'string') {
    try {
      const parsed = JSON.parse(job.skills);
      skillsList = Array.isArray(parsed) ? parsed : [job.skills];
    } catch {
      skillsList = job.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const companyName = job.company?.companyName || 'Verified Employer';
  const companyLogo = job.company?.logoUrl;
  const companyInitials = (companyName || 'JOB').substring(0, 3).toUpperCase();

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyClick = () => {
    if (job?.status === 'CLOSED' || isApplied) return;
    onClose();
    onApply(job);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto font-['Helvetica',Arial,sans-serif] antialiased [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-[24px] max-w-[740px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col my-auto border border-neutral-800/20 animate-in fade-in zoom-in-95 duration-200 [overscroll-behavior:contain] [touch-action:pan-y]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dark Header */}
        <div className="bg-[#0c1424] text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
              {/* Company Logo Monogram */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-black text-xs sm:text-sm shrink-0 overflow-hidden shadow-inner">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[#b2c359] font-black">{companyInitials}</span>
                )}
              </div>

              {/* Title & Employer */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {job.status === 'CLOSED' ? (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Applications Closed
                    </span>
                  ) : isApplied ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Applied
                    </span>
                  ) : (
                    <span className="bg-[#b2c359]/20 text-[#b2c359] border border-[#b2c359]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {job.isFeatured ? 'Featured Opening' : 'Verified Job'}
                    </span>
                  )}
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1 truncate">
                    <span>{companyName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#b2c359] inline shrink-0" />
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug tracking-tight">
                  {job.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.location || 'Pan India'}</span>
                  </span>
                  <span>•</span>
                  <span>{job.department || job.category || 'General'}</span>
                  <span>•</span>
                  <span className="text-[#b2c359] font-semibold">{formatTimeAgo(job.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Actions: Close & Share */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                title="Share job link"
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {copied && (
            <div className="mt-2 text-center bg-[#b2c359]/20 border border-[#b2c359]/30 text-[#b2c359] text-xs py-1 px-3 rounded-lg font-bold animate-in fade-in">
              ✓ Job link copied to clipboard!
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Closed Opening Alert Banner */}
          {job.status === 'CLOSED' && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-rose-900 text-xs sm:text-[13px] shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
              <div>
                <span className="font-bold text-rose-950">Applications Closed: </span>
                This opening has been closed by the hiring employer. You can review the role description and responsibilities, but new applications are no longer accepted.
              </div>
            </div>
          )}

          {/* Already Applied Status Banner */}
          {isApplied && (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-emerald-900 text-xs sm:text-[13px] shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-emerald-950">Application Submitted: </span>
                You have already applied for this opening. The recruiter has your profile under review.
              </div>
            </div>
          )}

          {/* Key Job Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                Compensation
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight block truncate">
                {formatSalary()}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                Experience
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight block">
                {job.expMin} – {job.expMax} Years
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                Job Type
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight block">
                {job.jobType || 'Full-time'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                Work Mode
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight block">
                {job.workMode || 'On-site'}
              </span>
            </div>
          </div>

          {/* Key Details Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {job.openings && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-2xs">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.openings} {job.openings === 1 ? 'Opening' : 'Openings'} Available</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.department || job.category || 'General'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.location || 'Pan India'}</span>
            </span>
          </div>

          {/* Skills Required */}
          {skillsList.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9eb047]" />
                <span>Required Skills & Competencies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-lime-50 text-[#54730f] border border-lime-200 rounded-lg text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Job Description */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#9eb047]" />
              <span>Job Description & Responsibilities</span>
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description || 'No detailed description provided by the employer.'}
            </div>
          </div>

          {/* Requirements (if present) */}
          {job.requirements && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Key Requirements & Eligibility
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {/* About Company */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9eb047]" />
              <span>About {companyName}</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-1.5">
              <p>
                <strong>Industry:</strong> {job.company?.industry || 'Corporate & Professional'}
              </p>
              {job.company?.hqLocation && (
                <p>
                  <strong>Headquarters:</strong> {job.company.hqLocation}
                </p>
              )}
              <p className="text-slate-500 pt-1">
                Verified employer on Torbit Jobs Portal. All applications are reviewed directly by the hiring team.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer (Responsive for Mobile, Tablet & Desktop) */}
        <div className="bg-white border-t border-slate-200/90 p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0 shadow-lg">
          <div className="flex items-center justify-between sm:block">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Compensation
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-950 block">
                {formatSalary()}
              </span>
            </div>
            <span className="sm:hidden bg-[#b2c359]/20 text-[#2c3e06] text-[10px] font-bold px-2.5 py-1 rounded-full">
              {job.jobType || 'Full-time'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-center"
            >
              Close
            </button>
            {job.status === 'CLOSED' ? (
              <button
                type="button"
                disabled
                className="flex-[2] sm:flex-initial bg-slate-100 text-slate-400 border border-slate-200 font-black text-xs sm:text-sm uppercase tracking-wide px-5 sm:px-7 py-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
              >
                <span>Applications Closed</span>
              </button>
            ) : isApplied ? (
              <button
                type="button"
                disabled
                className="flex-[2] sm:flex-initial bg-emerald-50 text-emerald-700 border border-emerald-300 font-black text-xs sm:text-sm uppercase tracking-wide px-5 sm:px-7 py-2.5 rounded-xl cursor-default flex items-center justify-center gap-2 shadow-none"
                title="You have already applied for this job"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Applied</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                className="flex-[2] sm:flex-initial bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-[#080809] font-black text-xs sm:text-sm uppercase tracking-wide px-5 sm:px-7 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
