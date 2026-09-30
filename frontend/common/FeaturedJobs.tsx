'use client';
import React, { useState } from 'react';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
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
  company: {
    companyName: string;
    logoUrl?: string;
  };
}

interface FeaturedJobsProps {
  jobs: Job[];
  onApply: (job: Job) => void;
}

export default function FeaturedJobs({ jobs, onApply }: FeaturedJobsProps) {
  const [activeTab, setActiveTab] = useState('All Jobs');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const filterTabs = ['All Jobs', 'Full Time', 'Part Time', 'Contract', 'Internship'];

  const defaultJobs: Job[] = [
    {
      id: 'job-1',
      title: 'Sales Manager – Residential Projects',
      jobType: 'Full Time',
      workMode: 'On-site',
      location: 'Gurugram, Haryana',
      expMin: 3,
      expMax: 5,
      salaryMin: 800000,
      salaryMax: 1200000,
      createdAt: '2 days ago',
      company: { companyName: 'DLF Limited' }
    },
    {
      id: 'job-2',
      title: 'Marketing Executive',
      jobType: 'Full Time',
      workMode: 'On-site',
      location: 'Mumbai, Maharashtra',
      expMin: 1,
      expMax: 3,
      salaryMin: 400000,
      salaryMax: 600000,
      createdAt: '4 days ago',
      company: { companyName: 'Godrej Properties' }
    },
    {
      id: 'job-3',
      title: 'Project Manager',
      jobType: 'Full Time',
      workMode: 'On-site',
      location: 'Bengaluru, Karnataka',
      expMin: 5,
      expMax: 8,
      salaryMin: 1200000,
      salaryMax: 1800000,
      createdAt: '1 week ago',
      company: { companyName: 'SOBHA Limited' }
    }
  ];

  const displayJobs = jobs && jobs.length > 0 ? jobs : defaultJobs;

  const filtered = displayJobs.filter((j) => {
    if (activeTab === 'All Jobs') return true;
    return (j.jobType || '').toLowerCase().replace('-', ' ') === activeTab.toLowerCase().replace('-', ' ');
  });

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatSalary = (job: Job) => {
    if (job.hideSalary) return 'Disclosed upon request';
    if (job.salaryMin && job.salaryMax) {
      return `₹ ${Math.round(job.salaryMin / 100000)} - ${Math.round(job.salaryMax / 100000)} LPA`;
    }
    return '₹ 8 - 12 LPA';
  };

  return (
    <section id="featured-jobs" className="py-2 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-['Helvetica',Arial,sans-serif] font-bold text-[#111827]">Featured Jobs</h3>
            <a 
              href="#featured-jobs"
              className="sm:hidden font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] text-[#94C322] hover:text-[#82ad1b] flex items-center gap-1 transition"
            >
              <span>VIEW ALL</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
            </a>
          </div>
          
          {/* Scrollable Filter Pills on Mobile */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b sm:border-b-0 border-gray-100">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] transition whitespace-nowrap ${
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

        <a 
          href="#featured-jobs"
          className="hidden sm:inline-flex font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] text-[#94C322] hover:text-[#82ad1b] items-center gap-1 transition"
        >
          <span>VIEW ALL JOBS</span>
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </a>
      </div>

      <div className="space-y-3">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="bg-white hover:border-[#94C322] border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-3.5 group"
          >
            <div className="flex items-start gap-3 sm:gap-3.5">
              {/* Company Logo Monogram */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 font-black text-xs flex-shrink-0 tracking-tighter shadow-xs">
                {job.company.companyName.includes('DLF') ? 'DLF' :
                 job.company.companyName.includes('Godrej') ? 'GODREJ' :
                 job.company.companyName.includes('SOBHA') ? 'SOBHA' :
                 job.company.companyName.substring(0, 2).toUpperCase()}
              </div>

              {/* Job Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-lime-50 text-[#82ad1b] text-[10px] font-extrabold px-2 py-0.5 rounded border border-lime-200">
                      Featured
                    </span>
                    <span className="text-xs text-gray-600 font-bold truncate">{job.company.companyName}</span>
                  </div>

                  {/* Bookmark Button on Mobile Top-Right */}
                  <button
                    onClick={(e) => toggleSave(job.id, e)}
                    className={`md:hidden p-1.5 rounded-lg border transition ${
                      savedIds.includes(job.id)
                        ? 'bg-lime-50 border-[#94C322] text-[#94C322]'
                        : 'border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label="Bookmark job"
                  >
                    {savedIds.includes(job.id) ? (
                      <BookmarkOutlinedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <BookmarkBorderOutlinedIcon sx={{ fontSize: 16 }} />
                    )}
                  </button>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#94C322] transition leading-snug">
                  {job.title}
                </h4>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1 bg-gray-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded border sm:border-0 border-gray-100">
                    <LocationOnOutlinedIcon className="text-gray-400 flex-shrink-0" sx={{ fontSize: 14 }} />
                    <span className="truncate">{job.location}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded border sm:border-0 border-gray-100">
                    <WorkOutlineOutlinedIcon className="text-gray-400 flex-shrink-0" sx={{ fontSize: 14 }} />
                    <span>{job.jobType}</span>
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
                <div className="font-black text-xs sm:text-sm text-gray-950">{formatSalary(job)}</div>
                <div className="text-[10px] text-gray-400">{job.createdAt.includes('ago') ? job.createdAt : '2 days ago'}</div>
              </div>

              <div className="flex items-center gap-2">
                {/* Bookmark Button on Desktop */}
                <button
                  onClick={(e) => toggleSave(job.id, e)}
                  className={`hidden md:block p-2 rounded-lg border transition ${
                    savedIds.includes(job.id)
                      ? 'bg-lime-50 border-[#94C322] text-[#94C322]'
                      : 'border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Bookmark job"
                >
                  {savedIds.includes(job.id) ? (
                    <BookmarkOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <BookmarkBorderOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
                <button
                  onClick={() => onApply(job)}
                  className="bg-[#94C322] hover:bg-[#82ad1b] active:scale-[0.98] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-xl sm:rounded-lg shadow-xs transition whitespace-nowrap"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}