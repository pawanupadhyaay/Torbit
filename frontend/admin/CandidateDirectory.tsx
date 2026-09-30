'use client';
import React, { useState } from 'react';
import { Search, Users, Download, ExternalLink, Briefcase } from 'lucide-react';

interface CandidateDirectoryProps {
  seekers: any[];
}

export default function CandidateDirectory({ seekers }: CandidateDirectoryProps) {
  const [search, setSearch] = useState('');

  const filtered = seekers.filter((s) =>
    (s.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.skills || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">Candidate Pool & Resume Vault</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified real estate talent pool with strictly validated &lt; 2MB resumes & CTC metrics.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, skill, city..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#94C322]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Candidate</th>
              <th className="p-3">Experience & Skills</th>
              <th className="p-3">Current / Expected CTC</th>
              <th className="p-3">Notice Period</th>
              <th className="p-3">Applications</th>
              <th className="p-3 text-right">Resume Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/70 transition">
                <td className="p-3">
                  <div className="font-bold text-gray-900">{s.fullName}</div>
                  <div className="text-[11px] text-gray-400">{s.user?.email} • {s.phone}</div>
                  <div className="text-[10px] text-gray-500">{s.location || 'India'}</div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-gray-800">{s.experience || '3+ Years Real Estate'}</div>
                  <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                    {s.skills || 'Sales, RERA, Channel Partners'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-mono font-bold text-gray-900">
                    ₹{s.currentSalary || 6.5} LPA → ₹{s.expectedSalary || 9.5} LPA
                  </div>
                </td>
                <td className="p-3 text-gray-600">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {s.noticePeriod || 'Immediate / 30 Days'}
                  </span>
                </td>
                <td className="p-3">
                  <span className="bg-lime-100 text-lime-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    {s._count?.applications ?? 1} applied
                  </span>
                </td>
                <td className="p-3 text-right">
                  {s.resumeUrl ? (
                    <a
                      href={s.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-lime-400 px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>&lt;2MB PDF</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 text-[11px]">No Resume</span>
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
