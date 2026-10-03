'use client';
import React from 'react';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

interface AdminOverviewProps {
  stats: any;
  pendingCompanies: any[];
  recentJobs: any[];
  recentApplications: any[];
  onApprove: (id: string) => void;
  onOpenActionModal: (id: string, action: 'REJECT' | 'BLOCK') => void;
  setActiveTab: (tab: string) => void;
}

export default function AdminOverview({
  stats,
  pendingCompanies = [],
  recentJobs = [],
  recentApplications = [],
  onApprove,
  onOpenActionModal,
  setActiveTab
}: AdminOverviewProps) {
  const kpiCards = [
    {
      title: 'Real Estate Candidates',
      value: stats?.totalSeekers ?? 0,
      trend: 'Active Job Seekers',
      icon: PeopleAltOutlinedIcon,
      iconColor: '#3B82F6',
      iconBg: 'bg-blue-50 text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Verified Builders & Employers',
      value: stats?.totalCompanies ?? 0,
      trend: `${stats?.approvedCompanies ?? 0} Verified`,
      icon: CorporateFareOutlinedIcon,
      iconColor: '#10B981',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'KYC Moderation Queue',
      value: pendingCompanies.length,
      trend: pendingCompanies.length > 0 ? `${pendingCompanies.length} Action Needed` : 'All Clear',
      icon: VerifiedUserOutlinedIcon,
      iconColor: pendingCompanies.length > 0 ? '#F59E0B' : '#6B7280',
      iconBg: pendingCompanies.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500',
      badgeBg: pendingCompanies.length > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' : 'bg-gray-100 text-gray-600',
      highlight: pendingCompanies.length > 0
    },
    {
      title: 'Active Job Openings',
      value: stats?.activeJobs ?? 0,
      trend: 'Across All Departments',
      icon: WorkOutlineOutlinedIcon,
      iconColor: '#8B5CF6',
      iconBg: 'bg-purple-50 text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Applications Routed',
      value: stats?.totalApplications ?? 0,
      trend: 'Total Candidates',
      icon: DescriptionOutlinedIcon,
      iconColor: '#84CC16',
      iconBg: 'bg-lime-50 text-lime-700',
      badgeBg: 'bg-lime-50 text-lime-800'
    }
  ];

  return (
    <div className="space-y-6 font-['Helvetica',Arial,sans-serif]">
      
      {/* 1. KYC Notification Banner (if pending) */}
      {pendingCompanies.length > 0 && (
        <div className="bg-white border-l-4 border-amber-500 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">
                  {pendingCompanies.length} Employer Registration{pendingCompanies.length > 1 ? 's' : ''} Awaiting Admin KYC Audit
                </h2>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review and approve builder GSTIN details to enable job posting on the public portal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className="bg-[#080809] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Review Queue</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-4.5 border transition-all duration-150 shadow-sm flex flex-col justify-between ${
                card.highlight ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-gray-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs`}>
                    <IconComponent sx={{ fontSize: 18 }} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight my-1">
                  {card.value.toLocaleString()}
                </div>
              </div>
              
              <div className="mt-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${card.badgeBg}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Workspace Split: Fast KYC Hub & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: KYC Moderation Hub */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Fast KYC Action Queue</h3>
                <p className="text-xs text-gray-500 mt-0.5">One-click approve or reject pending developer profiles</p>
              </div>
              <button
                onClick={() => setActiveTab('APPROVALS')}
                className="text-xs font-bold text-[#b2c359] hover:text-[#9eb047] transition flex items-center gap-1"
              >
                <span>View All ({pendingCompanies.length})</span>
                <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
              </button>
            </div>

            {pendingCompanies.length === 0 ? (
              <div className="py-10 bg-gray-50/80 border border-gray-200 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                </div>
                <div className="text-xs font-bold text-gray-900">Moderation Queue is Clean!</div>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                  All employer registrations have been verified. New registrations will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCompanies.slice(0, 4).map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{comp.companyName}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Pending KYC
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="font-mono text-gray-700 font-semibold">GSTIN: {comp.gstNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <LocationOnOutlinedIcon sx={{ fontSize: 13 }} className="text-gray-400" /> {comp.hqLocation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onApprove(comp.id)}
                        className="bg-[#b2c359] hover:bg-[#9eb047] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1"
                      >
                        <CheckOutlinedIcon sx={{ fontSize: 14 }} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onOpenActionModal(comp.id, 'REJECT')}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>KYC Compliance Engine: <strong className="text-emerald-600">Active</strong></span>
            <span className="font-semibold text-gray-700">Automated Audit Log Enabled</span>
          </div>
        </div>

        {/* Right 1 Col: Live Real Estate Platform Stream */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BoltOutlinedIcon sx={{ fontSize: 18 }} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Live Platform Stream</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Real-Time
              </span>
            </div>

            <div className="space-y-3">
              {recentJobs && recentJobs.length > 0 ? (
                recentJobs.slice(0, 4).map((job: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-[#b2c359] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-bold truncate">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center justify-between mt-0.5">
                        <span className="font-medium text-gray-700">{job.company?.companyName || 'Developer Partner'}</span>
                        <span className="text-[10px] text-gray-400">{job._count?.applications || 0} applicants</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-8">
                  No recent activity stream.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('JOBS')}
              className="w-full text-center text-xs font-bold text-[#080809] hover:text-[#b2c359] transition flex items-center justify-center gap-1"
            >
              <span>Manage All Active Vacancies</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
