'use client';
import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';

interface JobGovernanceProps {
  jobs: any[];
  onToggleFeatured: (jobId: string, isFeatured: boolean) => void;
  onUpdateStatus: (jobId: string, status: string) => void;
}

export default function JobGovernance({ jobs, onToggleFeatured, onUpdateStatus }: JobGovernanceProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.company?.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || j.department === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">Job Postings Governance & Moderation</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Moderate real estate openings, control homepage featured placements, and enforce compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, company..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#94C322]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Job Title & Company</th>
              <th className="p-3">Category (32 Master)</th>
              <th className="p-3">Location & Type</th>
              <th className="p-3">Applications</th>
              <th className="p-3">Featured Pill</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50/70 transition">
                <td className="p-3">
                  <div className="font-bold text-gray-900">{j.title}</div>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {j.company?.companyName || 'Torbit Employer'}
                  </div>
                </td>
                <td className="p-3">
                  <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {j.department}
                  </span>
                </td>
                <td className="p-3 text-gray-600">
                  <div>{j.location}</div>
                  <div className="text-[10px] text-gray-400 font-medium">{j.workMode} • {j.jobType}</div>
                </td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">
                    {j._count?.applications ?? 0} applicants
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onToggleFeatured(j.id, !j.isFeatured)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                      j.isFeatured
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${j.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{j.isFeatured ? 'Featured' : 'Standard'}</span>
                  </button>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    j.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {j.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  {j.status === 'ACTIVE' ? (
                    <button
                      onClick={() => onUpdateStatus(j.id, 'CLOSED')}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded text-xs font-bold transition"
                    >
                      Close Job
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(j.id, 'ACTIVE')}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold transition"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
