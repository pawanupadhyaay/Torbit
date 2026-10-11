'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useBodyScrollLock from '@/lib/useBodyScrollLock';
import { formatSalaryRange } from '@/lib/constants';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  Share2,
  ArrowRight,
  Sparkles,
  Calendar,
  Copy,
  Check
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  useBodyScrollLock(isOpen);

  if (!isOpen || !job) return null;

  // Format Salary
  const formatSalary = () => {
    return formatSalaryRange(job.salaryMin, job.salaryMax, job.hideSalary);
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

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}/jobs?jobId=${job?.id || ''}`;
  };

  const getShareText = () => {
    const salary = formatSalary();
    const url = getShareUrl();
    return `🔥 *Job Opening: ${job?.title}*\n🏢 *Company:* ${companyName}\n📍 *Location:* ${job?.location || 'Pan India'}\n💼 *Experience:* ${job?.experience || 'All levels'}\n💰 *Salary:* ${salary}\n\n👉 *Apply here on Torbit Realty:* ${url}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const text = getShareText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTelegram = () => {
    const shareUrl = getShareUrl();
    const summary = `🔥 Job Opening: ${job?.title} at ${companyName}\nApply here:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    const shareUrl = getShareUrl();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${job?.title} at ${companyName}`,
          text: `Check out this opening for ${job?.title} at ${companyName} on Torbit Realty:`,
          url: getShareUrl()
        });
      } catch (err) {
        // User dismissed native share
      }
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
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

        {/* Share Job Modal / Bottom Sheet (Mobile & Desktop) */}
        {shareModalOpen && (
          <div
            className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShareModalOpen(false);
            }}
          >
            <div
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Swipe / Drag Pill Handle */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>

              {/* Share Header */}
              <div className="px-5 pt-3 sm:pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#b2c359]/20 text-[#2f4204] flex items-center justify-center font-bold shrink-0">
                    <Share2 className="w-4 h-4 text-[#658A0D]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      Share Job Opening
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-[280px]">
                      {job.title} • {companyName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  aria-label="Close share dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share Channels */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200/80 transition cursor-pointer group text-center shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.539 1.95.825 2.791.825 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766m0 10.518c-.81 0-1.637-.234-2.39-.672l-.17-.099-1.579.414.421-1.54-.112-.178c-.482-.767-.737-1.604-.737-2.677 0-2.613 2.126-4.739 4.74-4.739 2.614 0 4.74 2.126 4.74 4.739 0 2.613-2.126 4.739-4.74 4.739m2.775-3.528c-.152-.076-.899-.444-1.038-.495-.14-.051-.241-.076-.343.076-.101.152-.393.495-.482.597-.089.102-.178.114-.33.038-.152-.076-.642-.237-1.222-.754-.452-.403-.757-.902-.846-1.054-.089-.152-.009-.235.067-.31.069-.068.152-.178.228-.267.076-.089.102-.152.152-.254.051-.102.025-.191-.013-.267-.038-.076-.343-.826-.47-1.131-.123-.298-.249-.257-.343-.262-.089-.004-.191-.005-.292-.005-.102 0-.267.038-.406.191-.14.152-.533.521-.533 1.27 0 .749.546 1.473.622 1.575.076.102 1.074 1.639 2.602 2.298.363.157.647.251.868.321.365.116.697.1.959.061.293-.044.899-.368 1.026-.723.127-.355.127-.659.089-.723-.038-.063-.14-.102-.292-.178" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2 block">
                      WhatsApp
                    </span>
                    <span className="text-[10px] text-slate-500">Chats</span>
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={handleTelegram}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 border border-sky-200/80 transition cursor-pointer group text-center shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.18 3.35-1.39 3.73-1.39.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2 block">
                      Telegram
                    </span>
                    <span className="text-[10px] text-slate-500">Channels</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    type="button"
                    onClick={handleLinkedIn}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200/80 transition cursor-pointer group text-center shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.86 0 1.56-.7 1.56-1.56s-.7-1.56-1.56-1.56a1.56 1.56 0 0 0-1.56 1.56c0 .86.7 1.56 1.56 1.56m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2 block">
                      LinkedIn
                    </span>
                    <span className="text-[10px] text-slate-500">Network</span>
                  </button>

                  {/* Native Device Share (when supported) */}
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 border border-indigo-200/80 transition cursor-pointer group text-center shadow-2xs"
                    >
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 mt-2 block">
                        More Apps
                      </span>
                      <span className="text-[10px] text-slate-500">Device</span>
                    </button>
                  )}
                </div>

                {/* Copy Link Section */}
                <div className="pt-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Direct Link
                  </label>
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="text"
                      readOnly
                      value={getShareUrl()}
                      className="bg-transparent flex-1 text-xs text-slate-600 font-mono pl-2 focus:outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
