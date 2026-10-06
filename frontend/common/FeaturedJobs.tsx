'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

interface Job {
  id: string;
  title: string;
  jobType: string;
  workMode: string;
  location: string;
  expMin: number;
  expMax: number;
  salaryMin?: number;
  salaryMax?: number;
  hideSalary?: boolean;
  createdAt: string;
  status?: string;
  company: {
    companyName: string;
    logoUrl?: string;
  };
}

interface FeaturedJobsProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
  appliedJobIds?: Set<string>;
  isLoading?: boolean;
}

export default function FeaturedJobs({ jobs, onApply, onViewDetails, appliedJobIds, isLoading }: FeaturedJobsProps) {
  const [activeTab, setActiveTab] = useState('All Jobs');
  const filterTabs = ['All Jobs', 'Full Time', 'Part Time', 'Contract', 'Internship'];

  // 1. Sort real jobs: ACTIVE first, CLOSED at the very bottom, then latest createdAt
  const sortedJobs = [...(jobs || [])].sort((a, b) => {
    const isClosedA = a.status === 'CLOSED';
    const isClosedB = b.status === 'CLOSED';
    if (isClosedA !== isClosedB) {
      return isClosedA ? 1 : -1;
    }
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // 2. Filter by active job type tab and limit to max 5 recent jobs
  const filtered = sortedJobs.filter((j) => {
    if (activeTab === 'All Jobs') return true;
    const jt = (j.jobType || '').toLowerCase().replace(/[\s\-_]/g, '');
    const at = activeTab.toLowerCase().replace(/[\s\-_]/g, '');
    return jt.includes(at) || at.includes(jt);
  }).slice(0, 5);

  const formatSalary = (job: Job) => {
    if (job.hideSalary) return 'Disclosed upon request';
    if (job.salaryMin && job.salaryMax) {
      return `₹ ${Math.round(job.salaryMin / 100000)} - ${Math.round(job.salaryMax / 100000)} LPA`;
    }
    if (job.salaryMin) {
      return `₹ ${Math.round(job.salaryMin / 100000)} LPA+`;
    }
    return 'Disclosed upon request';
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    if (dateStr.includes('ago')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
    return `${Math.floor(diffDays / 30)} month(s) ago`;
  };

  // 3. View All Jobs URL based on selected tab
  const viewAllUrl = activeTab === 'All Jobs' 
    ? '/jobs' 
    : `/jobs?jobType=${encodeURIComponent(activeTab)}`;

  const handleCardClick = (job: Job) => {
    if (onViewDetails) {
      onViewDetails(job);
    } else if (job.status !== 'CLOSED' && !appliedJobIds?.has(job.id)) {
      onApply(job);
    }
  };

  return (
    <section id="featured-jobs" className="py-2 sm:py-4 font-['Helvetica',Arial,sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-['Helvetica',Arial,sans-serif] font-bold text-[#111827]">
              Featured Jobs
            </h3>
            <Link 
              href={viewAllUrl}
              className="sm:hidden font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-tight text-[#b2c359] hover:text-[#9eb047] flex items-center gap-1 transition"
            >
              <span>VIEW ALL</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
          
          {/* Scrollable Filter Pills on Mobile */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b sm:border-b-0 border-gray-100">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-gray-100/80 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <Link 
          href={viewAllUrl}
          className="hidden sm:inline-flex font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] text-[#b2c359] hover:text-[#9eb047] items-center gap-1 transition"
        >
          <span>VIEW ALL JOBS</span>
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#b2c359] rounded-full animate-spin mb-3"></div>
            <h4 className="text-sm font-bold text-gray-800">Loading featured opportunities...</h4>
            <p className="text-xs text-gray-400 mt-1">Fetching live openings from verified employers</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/90 p-8 sm:p-10 text-center shadow-xs">
            <WorkOutlineOutlinedIcon className="text-gray-300 mx-auto mb-2" sx={{ fontSize: 36 }} />
            <h4 className="text-sm font-bold text-gray-800">
              No {activeTab !== 'All Jobs' ? activeTab : ''} jobs currently available
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Check back soon for new openings or browse all available vacancies.
            </p>
            <Link
              href={viewAllUrl}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#b2c359] hover:text-[#9eb047] uppercase"
            >
              <span>Browse All Jobs</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
            </Link>
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              onClick={() => handleCardClick(job)}
              className="bg-white hover:border-[#b2c359] border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-3.5 group cursor-pointer"
            >
              <div className="flex items-start gap-3 sm:gap-3.5">
                {/* Company Logo Monogram / Image */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 font-black text-xs flex-shrink-0 tracking-tighter shadow-xs overflow-hidden">
                  {job.company?.logoUrl ? (
                    <img 
                      src={job.company.logoUrl} 
                      alt={job.company.companyName || 'Company'} 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span>
                      {(job.company?.companyName || 'JOB').substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.status === 'CLOSED' ? (
                        <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider">
                          Closed
                        </span>
                      ) : appliedJobIds?.has(job.id) ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          ✓ Applied
                        </span>
                      ) : (
                        <span className="bg-lime-50 text-[#9eb047] text-[10px] font-extrabold px-2 py-0.5 rounded border border-lime-200">
                          Featured
                        </span>
                      )}
                      <span className="text-xs text-gray-600 font-bold truncate">
                        {job.company?.companyName || 'Verified Employer'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#b2c359] transition leading-snug">
                    {job.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1 bg-gray-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded border sm:border-0 border-gray-100">
                      <LocationOnOutlinedIcon className="text-gray-400 flex-shrink-0" sx={{ fontSize: 14 }} />
                      <span className="truncate">{job.location || 'Pan India'}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded border sm:border-0 border-gray-100">
                      <WorkOutlineOutlinedIcon className="text-gray-400 flex-shrink-0" sx={{ fontSize: 14 }} />
                      <span>{job.jobType || 'Full Time'}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded border sm:border-0 border-gray-100">
                      <AccessTimeOutlinedIcon className="text-gray-400 flex-shrink-0" sx={{ fontSize: 14 }} />
                      <span>{job.expMin}–{job.expMax} Yrs</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row / Action Bar */}
              <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 mt-1 md:mt-0">
                <div className="text-left md:text-right">
                  <div className="font-black text-xs sm:text-sm text-gray-950">
                    {formatSalary(job)}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {formatTimeAgo(job.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'CLOSED' ? (
                    <button
                      type="button"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-100 text-gray-400 border border-gray-200 font-['Helvetica',Arial,sans-serif] font-bold text-[13px] sm:text-[14px] leading-[14px] uppercase px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-lg shadow-none cursor-not-allowed whitespace-nowrap"
                      title="Hiring for this job is closed"
                    >
                      Closed
                    </button>
                  ) : appliedJobIds?.has(job.id) ? (
                    <button
                      type="button"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-['Helvetica',Arial,sans-serif] font-bold text-[13px] sm:text-[14px] leading-[14px] uppercase px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-lg shadow-none cursor-default whitespace-nowrap"
                      title="You have already applied for this job"
                    >
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply(job);
                      }}
                      className="bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-xl sm:rounded-lg shadow-xs transition whitespace-nowrap cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}