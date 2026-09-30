'use client';
import React, { useState } from 'react';
import { Search, Download, ExternalLink, Building2, MapPin, IndianRupee } from 'lucide-react';

interface SeekerApplicationsTableProps {
  applications: any[];
}

export default function SeekerApplicationsTable({ applications }: SeekerApplicationsTableProps) {
  const [filter, setFilter] = useState('ALL');

  const filtered = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-sm sm:text-base font-black text-gray-900">Live Application Status Tracker</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Track hiring status and recruiter interactions for each submitted role.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:py-1.5 focus:outline-none focus:border-[#94C322] cursor-pointer"
          >
            <option value="ALL">All Applications ({applications.length})</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Declined</option>
          </select>
        </div>
      </div>

      {/* 📱 Mobile View: Clean Card-Based Status List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs bg-gray-50/50 rounded-xl">
            No applications found under this filter.
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
                  ₹{app.currentSalary ? `${app.currentSalary / 100000}L` : '7.5L'} → ₹{app.expectedSalary ? `${app.expectedSalary / 100000}L` : '10.5L'} LPA
                </span>
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 text-[10px]">
                  Notice: {app.noticePeriod || '30 Days'}
                </span>
                <a
                  href={app.resumeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{app.resumeOriginalName || 'Resume.pdf'}</span>
                </a>
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
              <th className="p-3">Job &amp; Developer</th>
              <th className="p-3">Category</th>
              <th className="p-3">Submitted CTC Metrics</th>
              <th className="p-3">Resume Sent</th>
              <th className="p-3">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                  No applications found under this filter.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{app.job?.title || 'Senior Sales Manager'}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">
                      {app.job?.company?.companyName || 'DLF Limited'} • {app.job?.location || 'Gurugram'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {app.job?.department || 'Residential Sales'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-gray-900">
                      ₹{app.currentSalary ? `${app.currentSalary / 100000}L` : '7.5L'} → ₹{app.expectedSalary ? `${app.expectedSalary / 100000}L` : '10.5L'} LPA
                    </div>
                    <div className="text-[10px] text-gray-400">Notice: {app.noticePeriod || '30 Days'}</div>
                  </td>
                  <td className="p-3">
                    <a
                      href={app.resumeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{app.resumeOriginalName || 'Resume.pdf'}</span>
                    </a>
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
