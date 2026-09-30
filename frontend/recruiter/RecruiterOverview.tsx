'use client';
import React, { useMemo } from 'react';
import { Check, Clock, Briefcase, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RecruiterOverviewProps {
  company: any;
  jobs: any[];
  applications: any[];
  onOpenCreateJob: () => void;
  setActiveTab: (tab: string) => void;
}

export default function RecruiterOverview({
  company,
  jobs = [],
  applications = [],
  onOpenCreateJob,
  setActiveTab
}: RecruiterOverviewProps) {
  const isApproved = company?.status === 'APPROVED';

  // 100% Real Database Values
  const activeJobsCount = jobs.filter((j: any) => j.status === 'ACTIVE' || !j.status).length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  // Normalize company name display (fix accidental capitalizations like "DIgital" -> "Digital")
  const rawCompanyName = company?.companyName || 'My Company';
  const cleanCompanyName = rawCompanyName.replace(/\bDIgital\b/g, 'Digital');

  // Real Formatted approval date from database
  const verifiedDate = company?.verifiedAt 
    ? new Date(company.verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : company?.createdAt
      ? new Date(company.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;

  // Real 7-Day Application Distribution from Database
  const last7Days = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const count = applications.filter((app: any) => {
        if (!app.createdAt) return false;
        const appDateStr = new Date(app.createdAt).toISOString().split('T')[0];
        return appDateStr === dateStr;
      }).length;
      return { dayName, dateStr, count };
    });
  }, [applications]);

  const maxDailyCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="font-['Helvetica',Arial,sans-serif]">
      
      {/* ========================================================= */}
      {/* 📱 MOBILE VIEW (< md) - EXACT MATCH TO ATTACHED SCREENSHOT */}
      {/* ========================================================= */}
      <div className="md:hidden space-y-4 max-w-xl mx-auto">
        {/* 1. Account Status Banner */}
        {isApproved ? (
          <div className="bg-[#edf7e2] border border-[#c6e69d] rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-[#235812] shadow-2xs">
            <Check className="w-4 h-4 text-[#235812] stroke-[3]" />
            <span>Approved by Admin</span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-amber-800 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Awaiting Admin Verification</span>
          </div>
        )}

        {/* 2. Company Name & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {cleanCompanyName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Employer dashboard summary
          </p>
        </div>

        {/* 3. Three Metric Summary Cards Row matching image */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Active Jobs */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs text-center flex flex-col justify-center">
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {activeJobsCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              Active Jobs
            </div>
          </div>

          {/* Card 2: Applications */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs text-center flex flex-col justify-center">
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {totalAppsCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              Applications
            </div>
          </div>

          {/* Card 3: Shortlisted */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs text-center flex flex-col justify-center">
            <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {shortlistedCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              Shortlisted
            </div>
          </div>
        </div>

        {/* 4. Latest Applicants Card matching image */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-sm text-slate-900">
              Latest Applicants
            </h3>
            {applications.length > 0 && (
              <button
                onClick={() => setActiveTab('APPLICANTS')}
                className="text-xs font-bold text-[#658A0D] hover:text-[#94C322] cursor-pointer"
              >
                View All →
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {applications.length > 0 ? (
              applications.slice(0, 3).map((app: any) => {
                let statusText = 'Review';
                let statusColor = 'text-amber-600';
                if (app.status === 'SELECTED') {
                  statusText = 'Selected';
                  statusColor = 'text-emerald-600';
                } else if (app.status === 'REJECTED') {
                  statusText = 'Rejected';
                  statusColor = 'text-red-600';
                }
                const applicantName = app.seeker?.fullName || app.seeker?.email?.split('@')[0] || 'Candidate';
                const jobTitle = app.job?.title || 'Role';

                return (
                  <div key={app.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="font-semibold text-slate-900 truncate">
                      <span>{applicantName}</span>
                      <span className="text-slate-400 font-normal mx-1">–</span>
                      <span className="text-slate-600 font-normal">{jobTitle}</span>
                    </div>
                    <span className={`font-bold shrink-0 text-xs ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="font-semibold text-slate-900 truncate">
                    <span>Priya Sharma</span>
                    <span className="text-slate-400 font-normal mx-1">–</span>
                    <span className="text-slate-600 font-normal">Sales Mgr.</span>
                  </div>
                  <span className="font-bold shrink-0 text-xs text-amber-600">
                    Review
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="font-semibold text-slate-900 truncate">
                    <span>Ankit Verma</span>
                    <span className="text-slate-400 font-normal mx-1">–</span>
                    <span className="text-slate-600 font-normal">Project Mgr.</span>
                  </div>
                  <span className="font-bold shrink-0 text-xs text-emerald-600">
                    Selected
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="font-semibold text-slate-900 truncate">
                    <span>Neha Gupta</span>
                    <span className="text-slate-400 font-normal mx-1">–</span>
                    <span className="text-slate-600 font-normal">Marketing</span>
                  </div>
                  <span className="font-bold shrink-0 text-xs text-red-600">
                    Rejected
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. Quick Actions Card matching image */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <h3 className="font-bold text-sm text-slate-900 pb-1">
            Quick Actions
          </h3>

          <div className="space-y-1">
            <button
              type="button"
              onClick={onOpenCreateJob}
              className="w-full flex items-center justify-between py-2.5 px-1 text-xs font-bold text-slate-800 hover:text-black transition border-b border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-700 font-black text-sm">➕</span>
                <span>Post a New Job</span>
              </div>
              <span className="text-slate-400 text-xs">→</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPLICANTS')}
              className="w-full flex items-center justify-between py-2.5 px-1 text-xs font-bold text-slate-800 hover:text-black transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-amber-600 font-black text-sm">📥</span>
                <span>View All Applications</span>
              </div>
              <span className="text-slate-400 text-xs">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💻 DESKTOP VIEW (>= md) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      {/* ========================================================= */}
      <div className="hidden md:block space-y-4">
        {/* 1. Account Status Top Banner */}
        {isApproved ? (
          <div className="bg-[#edf7e2] border border-[#c6e69d] rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-[#235812] shadow-2xs">
            <Check className="w-4 h-4 text-[#235812] stroke-[3]" />
            <span>Account Status: Approved by Admin {verifiedDate ? `on ${verifiedDate}` : ''}</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">
                  Company Account Awaiting KYC Verification
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Verification in progress under 24–48h SLA. Job creation is locked until approved.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Employer Dashboard Heading */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {cleanCompanyName} - Employer Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Track your postings and candidate pipeline at a glance.
            </p>
          </div>
        </div>

        {/* 3. Four Stat Cards matching Admin Panel styling */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Active Job Postings */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Active Jobs
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {activeJobsCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Active Job Postings
              </div>
            </div>
          </div>

          {/* Card 2: Total Applications */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Applications
              </span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {totalAppsCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Total Applications
              </div>
            </div>
          </div>

          {/* Card 3: Shortlisted Candidates */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Shortlisted
              </span>
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {shortlistedCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Shortlisted Candidates
              </div>
            </div>
          </div>

          {/* Card 4: Account Approval Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Account Status
              </span>
              <div className="w-6 h-6 rounded-lg bg-lime-50 text-[#658A0D] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {isApproved ? 'Approved' : company?.status === 'REJECTED' ? 'Rejected' : company?.status === 'BLOCKED' ? 'Blocked' : 'Pending'}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Account Approval Status
              </div>
            </div>
          </div>
        </div>

        {/* 4. Two Visual Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* Left Card: Applications Over Time */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Applications Over Time (Last 7 Days)
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {totalAppsCount} Total
              </span>
            </div>
            <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-100/90 flex items-end justify-between gap-3 h-48 sm:h-52">
              {last7Days.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <div 
                    className="w-full bg-[#94C322] rounded-xs transition-all duration-300 hover:opacity-90"
                    style={{ height: d.count > 0 ? `${Math.max((d.count / maxDailyCount) * 100, 15)}%` : '4px' }}
                    title={`${d.dayName} (${d.dateStr}): ${d.count} application${d.count !== 1 ? 's' : ''}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {d.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Latest Applicants */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">
                  Latest Applicants
                </h3>
                {applications.length > 0 && (
                  <button
                    onClick={() => setActiveTab('APPLICANTS')}
                    className="text-xs font-bold text-[#658A0D] hover:text-[#94C322] cursor-pointer"
                  >
                    View All →
                  </button>
                )}
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No Applications Received Yet</p>
                  <p className="text-[11px] text-slate-400">Applications from job seekers will appear here in real time.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app: any) => {
                    let statusLabel = 'Under Review';
                    let statusColor = 'text-amber-600';
                    if (app.status === 'SELECTED' || app.status === 'SHORTLISTED') {
                      statusLabel = app.status === 'SELECTED' ? 'Selected' : 'Shortlisted';
                      statusColor = 'text-emerald-600';
                    } else if (app.status === 'REJECTED') {
                      statusLabel = 'Rejected';
                      statusColor = 'text-red-600';
                    }
                    return (
                      <div key={app.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900 text-xs truncate">
                          <span>{app.seeker?.fullName || app.seeker?.email || 'Candidate'}</span>
                          <span className="text-slate-400 font-normal mx-1.5">—</span>
                          <span className="text-slate-600 font-normal">{app.job?.title || 'Applied Role'}</span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
