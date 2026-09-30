'use client';
import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function AdminAnalytics() {
  const salaryBands = [
    { band: '₹3L - ₹6L (Entry / Junior Sales)', count: 4120, pct: '39%' },
    { band: '₹6L - ₹12L (Mid-Level / Asst Manager)', count: 3250, pct: '31%' },
    { band: '₹12L - ₹25L (Senior Manager / Lead)', count: 2110, pct: '20%' },
    { band: '₹25L - ₹50L+ (VP / Director / Land Acq)', count: 1002, pct: '10%' },
  ];

  const topHiringBuilders = [
    { name: 'DLF India Limited', jobs: 34, location: 'Gurugram & Delhi NCR' },
    { name: 'Godrej Properties', jobs: 28, location: 'Mumbai, Pune & Bengaluru' },
    { name: 'SOBHA Limited', jobs: 22, location: 'Bengaluru & Chennai' },
    { name: 'Prestige Group', jobs: 19, location: 'Bengaluru & Hyderabad' },
    { name: 'Skyline Realty Partners', jobs: 14, location: 'Noida & Greater Noida' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Average Platform Real Estate CTC</span>
          <div className="text-2xl font-black text-gray-900 mt-2 flex items-center gap-1">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <span>9.42 LPA</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
            +14.8% YoY Industry Index
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Top In-Demand Role</span>
          <div className="text-lg font-black text-gray-900 mt-2 truncate">
            Residential Sales & Channel Partners
          </div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">
            34% of all Real Estate Openings
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Average Hiring Turnaround</span>
          <div className="text-2xl font-black text-gray-900 mt-2">
            12.5 Days
          </div>
          <span className="text-[10px] font-semibold text-lime-800 bg-lime-50 px-2 py-0.5 rounded mt-2 inline-block">
            3x Faster with &lt; 2MB Resumes
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-black text-gray-900 mb-4">Real Estate Compensation Brackets (CTC)</h3>
          <div className="space-y-4">
            {salaryBands.map((sb, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>{sb.band}</span>
                  <span>{sb.count.toLocaleString()} candidates ({sb.pct})</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-lime-500 to-[#94C322] h-2.5 rounded-full"
                    style={{ width: sb.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-black text-gray-900 mb-4">Top Hiring Real Estate Builders</h3>
          <div className="divide-y divide-gray-100">
            {topHiringBuilders.map((b, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-900">{b.name}</div>
                  <div className="text-[11px] text-gray-400">{b.location}</div>
                </div>
                <span className="bg-slate-900 text-lime-400 font-bold px-2.5 py-1 rounded-lg text-xs">
                  {b.jobs} active jobs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
