'use client';
import React, { useState } from 'react';
import { calculateSeekerProfileScore } from '@/lib/constants';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import JobDetailsModal from '@/common/JobDetailsModal';
import ApplyJobModal from './ApplyJobModal';

interface SeekerOverviewProps {
  profile: any;
  applications: any[];
  recommendedJobs: any[];
  setActiveTab: (tab: string) => void;
  loading?: boolean;
}

export default function SeekerOverview({
  profile,
  applications,
  recommendedJobs,
  setActiveTab,
  loading = false
}: SeekerOverviewProps) {
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const rawName = profile?.fullName || profile?.name || '';
  const firstName = rawName && rawName !== 'Registered Candidate' ? rawName.split(' ')[0] : '';
  const profileScore = profile.profileCompleted !== undefined && profile.profileCompleted !== null 
    ? profile.profileCompleted 
    : (rawName ? calculateSeekerProfileScore(profile) : 0);
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  const handleJobClick = (jobId: string) => {
    const found = recommendedJobs.find((j: any) => j.id === jobId);
    if (found) {
      setSelectedJobForDetails(found);
      setDetailsModalOpen(true);
    } else {
      setActiveTab('BROWSE');
    }
  };

  const getStatusTextAndColor = (status: string) => {
    switch (status) {
      case 'SELECTED':
      case 'HIRED':
      case 'ACCEPTED':
        return { text: 'Selected', color: 'text-emerald-700 font-bold' };
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
        return { text: 'Shortlisted', color: 'text-purple-700 font-bold' };
      case 'REJECTED':
      case 'DECLINED':
        return { text: 'Rejected', color: 'text-red-600 font-bold' };
      case 'UNDER_REVIEW':
      case 'IN_REVIEW':
        return { text: 'Under Review', color: 'text-blue-600 font-bold' };
      default:
        return { text: 'Pending', color: 'text-amber-600 font-bold' };
    }
  };

  const displayApplications = applications.slice(0, 5).map((app: any) => ({
    id: app.id,
    title: app.job ? `${app.job.title} — ${app.job.company?.companyName || 'Torbit Partner'}` : (app.title || 'Submitted Application'),
    statusText: getStatusTextAndColor(app.status).text,
    statusColor: getStatusTextAndColor(app.status).color
  }));

  const displayRecommended = (recommendedJobs || [])
    .filter((job: any) => job.status !== 'CLOSED')
    .slice(0, 5)
    .map((job: any) => ({
      id: job.id,
      title: job.company ? `${job.title} — ${job.company.companyName}` : job.title,
      tag: job.jobType || job.workMode || job.tag || 'Full Time'
    }));

  return (
    <div className="font-['Helvetica',Arial,sans-serif]">
      {/* 📱 MOBILE VIEW (< md) */}
      <div className="md:hidden space-y-4 max-w-xl mx-auto">
        {/* Welcome Greeting Header */}
        <div className="pt-1 pb-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <span>Welcome back</span>
            {firstName ? (
              <span>, {firstName}</span>
            ) : loading ? (
              <span className="inline-block h-5 w-24 bg-slate-200 rounded animate-pulse" />
            ) : null}
            <span>👋</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Here's your job search summary
          </p>
        </div>

        {/* 2 Metric Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-xs text-center hover:border-[#b2c359] transition cursor-pointer"
          >
            <div className="text-lg font-black text-gray-900 leading-tight">
              {profileScore > 0 ? `${profileScore}%` : loading ? <span className="inline-block h-5 w-10 bg-slate-200 rounded animate-pulse" /> : '0%'}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">Profile</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-xs text-center hover:border-[#b2c359] transition cursor-pointer"
          >
            <div className="text-lg font-black text-gray-900 leading-tight">
              {loading && applications.length === 0 ? <span className="inline-block h-5 w-6 bg-slate-200 rounded animate-pulse" /> : appliedCount}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">Applied</div>
          </button>
        </div>

        {/* Recent Applications Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-gray-900">Recent Applications</h2>
            {applications.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('APPLICATIONS')}
                className="text-[11px] font-bold text-[#7ea81b] hover:underline"
              >
                View All
              </button>
            )}
          </div>

          {loading && applications.length === 0 ? (
            <div className="py-4 space-y-2.5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
            </div>
          ) : displayApplications.length === 0 ? (
            <div className="py-5 text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">No applications submitted yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('BROWSE')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7ea81b] hover:underline"
              >
                <span>Browse Jobs to Apply</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayApplications.map((app) => (
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
          )}
        </div>

        {/* Recommended Jobs Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-gray-900">Recommended Jobs</h2>
            {recommendedJobs.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('BROWSE')}
                className="text-[11px] font-bold text-[#7ea81b] hover:underline"
              >
                Browse All
              </button>
            )}
          </div>

          {loading && recommendedJobs.length === 0 ? (
            <div className="py-4 space-y-2.5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
            </div>
          ) : displayRecommended.length === 0 ? (
            <div className="py-5 text-center space-y-1">
              <p className="text-xs text-gray-500 font-medium">No open recommendations at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayRecommended.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 rounded-lg transition"
                >
                  <span className="font-semibold text-gray-800 truncate">{job.title}</span>
                  <span className="bg-[#b2c359] text-[#080809] font-bold text-xs px-2.5 py-0.5 rounded-md shrink-0 shadow-2xs">
                    {job.tag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 💻 DESKTOP FULL-WIDTH VIEW (>= md) */}
      <div className="hidden md:block space-y-6">
        {/* 1. Welcome Greeting Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Welcome back</span>
            {firstName ? (
              <span>, {firstName}</span>
            ) : loading ? (
              <span className="inline-block h-7 w-32 bg-slate-200 rounded animate-pulse" />
            ) : null}
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Here's what's happening with your job search today.
          </p>
        </div>

        {/* 2. 3 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Profile Completion */}
          <div
            onClick={() => setActiveTab('PROFILE')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#b2c359] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {profileScore > 0 ? `${profileScore}%` : loading ? <div className="h-7 w-12 bg-slate-200 rounded animate-pulse" /> : '0%'}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Profile Completion
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-[#b2c359] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${profileScore}%` }}
              />
            </div>
          </div>

          {/* Card 2: Jobs Applied */}
          <div
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#b2c359] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {loading && applications.length === 0 ? <div className="h-7 w-8 bg-slate-200 rounded animate-pulse" /> : appliedCount}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Jobs Applied
              </div>
            </div>
          </div>

          {/* Card 3: Selected / Shortlisted */}
          <div
            onClick={() => setActiveTab('APPLICATIONS')}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-[#b2c359] transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-950 leading-tight">
                {loading && applications.length === 0 ? '-' : shortlistedCount}
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
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Recent Applications
                </h2>
                {applications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('APPLICATIONS')}
                    className="text-xs font-bold text-[#7ea81b] hover:underline"
                  >
                    View All ({applications.length})
                  </button>
                )}
              </div>

              {loading && applications.length === 0 ? (
                <div className="space-y-3 py-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
                </div>
              ) : displayApplications.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">You haven't applied for any jobs yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('BROWSE')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <span>Browse Open Positions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayApplications.map((app) => (
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
              )}
            </div>
          </div>

          {/* Right Card: Recommended For You */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Recommended For You
                </h2>
                {recommendedJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('BROWSE')}
                    className="text-xs font-bold text-[#7ea81b] hover:underline"
                  >
                    Explore All
                  </button>
                )}
              </div>

              {loading && recommendedJobs.length === 0 ? (
                <div className="space-y-3 py-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                </div>
              ) : displayRecommended.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">No recommended jobs available right now.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('BROWSE')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <span>Browse All Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayRecommended.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleJobClick(job.id)}
                      className="py-3 flex items-center justify-between gap-3 text-xs sm:text-[13px] hover:bg-gray-50/50 rounded-lg px-2 transition cursor-pointer"
                    >
                      <span className="font-medium text-gray-800 truncate">{job.title}</span>
                      <span className="bg-[#b2c359] text-[#080809] font-bold text-xs px-2.5 py-0.5 rounded shadow-2xs shrink-0">
                        {job.tag}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn-style Job Details Modal */}
      {selectedJobForDetails && (
        <JobDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          job={selectedJobForDetails}
          onApply={(job) => {
            setDetailsModalOpen(false);
            setSelectedJobForApply(job);
            setApplyModalOpen(true);
          }}
        />
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setSelectedJobForApply(null);
          }}
          job={selectedJobForApply}
          currentUser={profile}
          onApplicationSubmitted={() => {
            setApplyModalOpen(false);
            setSelectedJobForApply(null);
          }}
        />
      )}
    </div>
  );
}
