'use client';
import React from 'react';
import { calculateSeekerProfileScore } from '@/lib/constants';

interface SeekerOverviewProps {
  profile: any;
  applications: any[];
  recommendedJobs: any[];
  setActiveTab: (tab: string) => void;
}

export default function SeekerOverview({
  profile,
  applications,
  recommendedJobs,
  setActiveTab
}: SeekerOverviewProps) {
  const firstName = (profile.fullName || 'Priya').split(' ')[0];
  const profileScore = profile.profileCompleted !== undefined && profile.profileCompleted !== null 
    ? profile.profileCompleted 
    : calculateSeekerProfileScore(profile);
  const appliedCount = applications.length;
  const savedCount = 6;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  const getStatusTextAndColor = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return { text: 'Selected', color: 'text-emerald-700 font-bold' };
      case 'SHORTLISTED':
        return { text: 'Shortlisted', color: 'text-purple-700 font-bold' };
      case 'REJECTED':
        return { text: 'Rejected', color: 'text-red-600 font-bold' };
      case 'UNDER_REVIEW':
        return { text: 'Under Review', color: 'text-blue-600 font-bold' };
      default:
        return { text: 'Pending', color: 'text-amber-600 font-bold' };
    }
  };

  // Demo fallback applications matching design mockup
  const displayApplications = applications.length > 0
    ? applications.slice(0, 4).map((app: any) => ({
        id: app.id,
        title: app.job ? `${app.job.title} — ${app.job.company?.companyName || 'Developer'}` : app.title,
        statusText: getStatusTextAndColor(app.status).text,
        statusColor: getStatusTextAndColor(app.status).color
      }))
    : [
        { id: '1', title: 'Sales Manager — DLF Limited', statusText: 'Pending', statusColor: 'text-amber-600 font-bold' },
        { id: '2', title: 'Marketing Executive — Godrej Properties', statusText: 'Selected', statusColor: 'text-emerald-700 font-bold' },
        { id: '3', title: 'Finance Executive — Puravankara', statusText: 'Rejected', statusColor: 'text-red-600 font-bold' },
        { id: '4', title: 'Project Manager — SOBHA Limited', statusText: 'Pending', statusColor: 'text-amber-600 font-bold' }
      ];

  // Mobile-specific fallback items (matching client screenshot exactly)
  const mobileApplications = [
    { id: 'm-1', title: 'Sales Manager – DLF', statusText: 'Pending', statusColor: 'text-amber-600 font-bold' },
    { id: 'm-2', title: 'Marketing Exec. – Godrej', statusText: 'Selected', statusColor: 'text-emerald-700 font-bold' },
    { id: 'm-3', title: 'Finance Exec. – Puravankara', statusText: 'Rejected', statusColor: 'text-red-600 font-bold' }
  ];

  const mobileRecommended = [
    { id: 'mr-1', title: 'Property Consultant – Emaar', tag: 'Full Time' },
    { id: 'mr-2', title: 'HR Executive – DLF', tag: 'Hybrid' }
  ];

  // Demo fallback recommended jobs matching design mockup
  const displayRecommended = recommendedJobs.length > 0
    ? recommendedJobs.slice(0, 4).map((job: any) => ({
        id: job.id,
        title: job.company ? `${job.title} — ${job.company.companyName}` : job.title,
        tag: job.jobType || job.workMode || job.tag || 'Full Time'
      }))
    : [
        { id: '1', title: 'Property Consultant — Emaar India', tag: 'Full Time' },
        { id: '2', title: 'Construction Manager — Prestige Group', tag: 'On-site' },
        { id: '3', title: 'HR Executive — DLF Limited', tag: 'Hybrid' },
        { id: '4', title: 'Leasing Manager — Emaar India', tag: 'Remote' }
      ];

  return (
    <div className="font-['Helvetica',Arial,sans-serif]">
      {/* 📱 MOBILE VIEW (< md) - 100% Match to Client Screenshot */}
      <div className="md:hidden space-y-4 max-w-xl mx-auto">
        {/* Welcome Greeting Header */}
        <div className="pt-1 pb-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Here's your job search summary
          </p>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-xs text-center hover:border-[#94C322] transition cursor-pointer"
          >
            <div className="text-lg font-black text-gray-900 leading-tight">
              {profileScore}%
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">Profile</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-xs text-center hover:border-[#94C322] transition cursor-pointer"
          >
            <div className="text-lg font-black text-gray-900 leading-tight">
              {appliedCount}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">Applied</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAVED')}
            className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-xs text-center hover:border-[#94C322] transition cursor-pointer"
          >
            <div className="text-lg font-black text-gray-900 leading-tight">
              {savedCount}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">Saved</div>
          </button>
        </div>

        {/* Recent Applications Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-gray-900 pb-1">Recent Applications</h2>

          <div className="divide-y divide-gray-100">
            {(applications.length > 0 ? displayApplications.slice(0, 3) : mobileApplications).map((app: any) => (
              <div
                key={app.id}
                onClick={() => setActiveTab('APPLICATIONS')}
                className="py-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer"
              >
                <span className="font-semibold text-gray-800 truncate">{app.title}</span>
                <span className={`text-xs shrink-0 ${app.statusColor}`}>
                  {app.statusText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Jobs Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-gray-900 pb-1">Recommended Jobs</h2>

          <div className="divide-y divide-gray-100">
            {(recommendedJobs.length > 0 ? displayRecommended.slice(0, 2) : mobileRecommended).map((job: any) => (
              <div
                key={job.id}
                onClick={() => setActiveTab('BROWSE')}
                className="py-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer"
              >
                <span className="font-semibold text-gray-800 truncate">{job.title}</span>
                <span className="bg-[#94C322] text-[#080809] font-bold text-xs px-3 py-1 rounded-md shrink-0 shadow-2xs">
                  {job.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP FULL-WIDTH VIEW (>= md) */}
      <div className="hidden md:block space-y-6">
        {/* 1. Welcome Greeting Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Here's what's happening with your job search today.
          </p>
        </div>

        {/* 2. 4 Stat KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Profile Completion */}
          <div
            onClick={() => setActiveTab('PROFILE')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#94C322] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {profileScore}%
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Profile Completion
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-[#94C322] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${profileScore}%` }}
              />
            </div>
          </div>

          {/* Card 2: Jobs Applied */}
          <div
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#94C322] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {appliedCount}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Jobs Applied
              </div>
            </div>
          </div>

          {/* Card 3: Saved Jobs */}
          <div
            onClick={() => setActiveTab('SAVED')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#94C322] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {savedCount}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Saved Jobs
              </div>
            </div>
          </div>

          {/* Card 4: Selected / Shortlisted */}
          <div
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#94C322] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {shortlistedCount}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Selected / Shortlisted
              </div>
            </div>
          </div>
        </div>

        {/* 3. 2 Side-by-Side Equal Cards (Recent Applications & Recommended For You) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Recent Applications
            </h2>

            <div className="divide-y divide-gray-100">
              {displayApplications.map((app: any) => (
                <div
                  key={app.id}
                  onClick={() => setActiveTab('APPLICATIONS')}
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-[13px] hover:bg-gray-50/50 rounded-lg px-1 transition cursor-pointer"
                >
                  <span className="font-medium text-gray-800 truncate">{app.title}</span>
                  <span className={`text-xs shrink-0 ${app.statusColor}`}>
                    {app.statusText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Recommended For You */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Recommended For You
            </h2>

            <div className="divide-y divide-gray-100">
              {displayRecommended.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => setActiveTab('BROWSE')}
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-[13px] hover:bg-gray-50/50 rounded-lg px-1 transition cursor-pointer"
                >
                  <span className="font-medium text-gray-800 truncate">{job.title}</span>
                  <span className="bg-[#94C322] text-[#080809] font-bold text-xs px-2.5 py-0.5 rounded shadow-2xs shrink-0">
                    {job.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
