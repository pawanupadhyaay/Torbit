'use client';
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  X,
  Briefcase
} from 'lucide-react';

interface SeekerApplicationsTableProps {
  applications: any[];
}

export default function SeekerApplicationsTable({ applications }: SeekerApplicationsTableProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Status counts for quick filters
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: applications.length,
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      SELECTED: 0,
      REJECTED: 0
    };
    applications.forEach((app) => {
      const s = app.status;
      if (s === 'HIRED' || s === 'ACCEPTED' || s === 'SELECTED') {
        counts.SELECTED++;
      } else if (s === 'SHORTLISTED' || s === 'INTERVIEW_SCHEDULED') {
        counts.SHORTLISTED++;
      } else if (s === 'UNDER_REVIEW' || s === 'IN_REVIEW') {
        counts.UNDER_REVIEW++;
      } else if (s === 'REJECTED' || s === 'DECLINED') {
        counts.REJECTED++;
      } else {
        counts.APPLIED++;
      }
    });
    return counts;
  }, [applications]);

  const hasActiveFilters = statusFilter !== 'ALL' || searchQuery.trim() !== '' || sortBy !== 'NEWEST';

  const resetFilters = () => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setSortBy('NEWEST');
  };

  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== 'ALL') {
          const s = app.status;
          if (statusFilter === 'SELECTED' && !['SELECTED', 'HIRED', 'ACCEPTED'].includes(s)) return false;
          if (statusFilter === 'SHORTLISTED' && !['SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(s)) return false;
          if (statusFilter === 'UNDER_REVIEW' && !['UNDER_REVIEW', 'IN_REVIEW'].includes(s)) return false;
          if (statusFilter === 'REJECTED' && !['REJECTED', 'DECLINED'].includes(s)) return false;
          if (statusFilter === 'APPLIED' && !['APPLIED', 'PENDING'].includes(s) && ['SELECTED', 'SHORTLISTED', 'UNDER_REVIEW', 'REJECTED'].includes(s)) return false;
        }

        // Live Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (app.job?.title || '').toLowerCase();
          const company = (app.job?.company?.companyName || '').toLowerCase();
          const location = (app.job?.location || '').toLowerCase();
          const dept = (app.job?.department || '').toLowerCase();
          const matches = title.includes(q) || company.includes(q) || location.includes(q) || dept.includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'CTC_DESC') {
          return (Number(b.expectedSalary) || 0) - (Number(a.expectedSalary) || 0);
        }
        if (sortBy === 'CTC_ASC') {
          return (Number(a.expectedSalary) || 0) - (Number(b.expectedSalary) || 0);
        }
        if (sortBy === 'COMPANY_ASC') {
          const cA = (a.job?.company?.companyName || '').toLowerCase();
          const cB = (b.job?.company?.companyName || '').toLowerCase();
          return cA.localeCompare(cB);
        }
        if (sortBy === 'ROLE_ASC') {
          const rA = (a.job?.title || '').toLowerCase();
          const rB = (b.job?.title || '').toLowerCase();
          return rA.localeCompare(rB);
        }
        return 0;
      });
  }, [applications, statusFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
      case 'HIRED':
      case 'ACCEPTED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">Selected / Offer</span>;
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">Shortlisted for Interview</span>;
      case 'REJECTED':
      case 'DECLINED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">Declined</span>;
      case 'UNDER_REVIEW':
      case 'IN_REVIEW':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">Under Review</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">Applied</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-5 font-['Helvetica',Arial,sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-gray-900">Live Application Status Tracker</h2>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
              {filtered.length} of {applications.length}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Track hiring status, filter by company/role, and sort your submitted job applications.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Control Bar: Search + Status Filter + Sort By */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Search By Job / Company / Location */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, company, city..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Status Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer appearance-none"
          >
            <option value="ALL">All Applications ({applications.length})</option>
            <option value="APPLIED">Applied ({statusCounts.APPLIED})</option>
            <option value="UNDER_REVIEW">Under Review ({statusCounts.UNDER_REVIEW})</option>
            <option value="SHORTLISTED">Shortlisted ({statusCounts.SHORTLISTED})</option>
            <option value="SELECTED">Selected / Offer ({statusCounts.SELECTED})</option>
            <option value="REJECTED">Declined ({statusCounts.REJECTED})</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* 3. Sort By Dropdown */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer appearance-none"
          >
            <option value="NEWEST">Applied: Most Recent First</option>
            <option value="OLDEST">Applied: Oldest First</option>
            <option value="CTC_DESC">Expected CTC: Highest First</option>
            <option value="CTC_ASC">Expected CTC: Lowest First</option>
            <option value="COMPANY_ASC">Company Name: A to Z</option>
            <option value="ROLE_ASC">Job Role: A to Z</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* 📱 Mobile View: Clean Card-Based Status List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs bg-slate-50/70 rounded-2xl p-6 space-y-2 border border-dashed border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">No applications found matching filters</div>
            <p className="text-[11px] text-slate-500">
              {hasActiveFilters ? 'Try resetting filters or searching a different term.' : 'You have not submitted any job applications yet.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-[#b2c359] text-slate-950 rounded-xl text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-gray-200/90 bg-white shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                    {app.job?.title || 'Senior Sales Manager'}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {app.job?.company?.companyName || 'DLF Limited'} • {app.job?.location || 'Gurugram'}
                  </p>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-[11px]">
                <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">
                  {app.job?.department || 'Residential Sales'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-mono font-bold text-gray-800">
                  {app.currentSalary ? `₹${(app.currentSalary / 100000).toFixed(1)}L` : '—'} → {app.expectedSalary ? `₹${(app.expectedSalary / 100000).toFixed(1)}L LPA` : 'Open'}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 text-[10px]">
                  Applied: {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{app.resumeOriginalName || 'Resume.pdf'}</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 Desktop View: Full Responsive Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Job &amp; Employer</th>
              <th className="p-3">Category</th>
              <th className="p-3">Submitted CTC Metrics</th>
              <th className="p-3">Resume Sent</th>
              <th className="p-3">Applied Date</th>
              <th className="p-3">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400 text-xs">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Applications Found</div>
                    <p className="text-slate-500 text-[11px]">
                      {hasActiveFilters
                        ? 'Try adjusting your search keywords or status filter.'
                        : 'You have not submitted any job applications yet.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer mt-1 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{app.job?.title || 'Senior Sales Manager'}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">
                      {app.job?.company?.companyName || 'Employer'} • {app.job?.location || 'India'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {app.job?.department || 'General'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-gray-900">
                      {app.currentSalary ? `₹${(app.currentSalary / 100000).toFixed(1)}L` : '—'} → {app.expectedSalary ? `₹${(app.expectedSalary / 100000).toFixed(1)}L LPA` : 'Open'}
                    </div>
                    <div className="text-[10px] text-gray-400">Notice: {app.noticePeriod || 'Immediate'}</div>
                  </td>
                  <td className="p-3">
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{app.resumeOriginalName || 'Resume.pdf'}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No file</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 font-medium">
                    {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    {getStatusBadge(app.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
