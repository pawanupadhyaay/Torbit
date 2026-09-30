'use client';
import React from 'react';
import Link from 'next/link';
import { Bookmark, Building2, MapPin, IndianRupee } from 'lucide-react';

export default function SeekerSavedJobs() {
  const savedJobsList = [
    { id: 'sj-1', title: 'Senior Business Consultant', company: 'Godrej Enterprises', location: 'Mumbai', ctc: '₹9-14 LPA', type: 'Full-time' },
    { id: 'sj-2', title: 'Assistant General Manager – Sales', company: 'Prestige Group', location: 'Bengaluru', ctc: '₹18-24 LPA', type: 'Full-time' },
    { id: 'sj-3', title: 'Operations & Strategy Lead', company: 'Global Tech Corp', location: 'Gurugram', ctc: '₹22-30 LPA', type: 'Full-time' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif]">
      <div className="pb-3.5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-black text-gray-900">Saved Job Opportunities</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Quick access to roles you have bookmarked for later application.</p>
        </div>
        <Link href="/" className="text-xs font-bold text-[#94C322] hover:underline shrink-0">
          Browse More →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {savedJobsList.map((j) => (
          <div key={j.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#94C322] transition shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between">
                <span className="bg-slate-900 text-lime-400 font-bold text-[10px] px-2 py-0.5 rounded-lg">
                  {j.type}
                </span>
                <Bookmark className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 mt-2">{j.title}</h3>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{j.company} • {j.location}</p>
              <p className="text-[11px] font-mono font-bold text-emerald-600 mt-1">{j.ctc}</p>
            </div>
            <Link
              href="/"
              className="w-full text-center bg-[#94C322] hover:bg-[#82ad1b] text-slate-950 font-bold text-xs py-2 rounded-xl transition shadow-xs"
            >
              Apply Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
