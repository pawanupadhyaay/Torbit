'use client';
import React, { useState } from 'react';
import { Layers, Search } from 'lucide-react';

interface CategoryMasterProps {
  categories: any[];
}

export default function CategoryMaster({ categories }: CategoryMasterProps) {
  const [search, setSearch] = useState('');

  const REAL_ESTATE_32 = [
    'Residential Sales', 'Luxury & Ultra-Luxury Housing', 'Commercial Leasing & Office Spaces',
    'Retail Real Estate & Mall Management', 'Industrial & Warehousing', 'Data Centers Real Estate',
    'Land Acquisition & Aggregation', 'Joint Ventures & Land Development', 'Legal, RERA & Due Diligence',
    'Liaisoning & Government Approvals', 'Real Estate Project Management', 'Civil Engineering & Construction',
    'Architecture & Urban Master Planning', 'Interior Design & Fit-Outs', 'MEP (Mechanical, Electrical, Plumbing)',
    'Quality Surveying & Cost Estimation', 'Real Estate Private Equity & Investment', 'Project Finance & Banking',
    'Real Estate Valuation & Advisory', 'Facility & Property Management', 'Channel Partner / Broker Network Mgmt',
    'Real Estate Digital Marketing & Branding', 'Direct Sales & Tele-Sales', 'Customer Relationship Mgmt (CRM)',
    'NRI Sales & International Marketing', 'Co-Working & Managed Workspaces', 'Co-Living & Student Housing',
    'Senior Living & Assisted Care Communities', 'Hospitality Real Estate & Resorts', 'PropTech & Smart Building Solutions',
    'ESG & Green Building Sustainability', 'Others'
  ];

  const displayList = categories && categories.length > 0 ? categories : REAL_ESTATE_32.map((name, i) => ({
    id: `cat-${i}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    jobCount: Math.floor(Math.random() * 20) + 5,
    isPopular: i < 8
  }));

  const filtered = displayList.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-gray-900">32 Real Estate Specialized Categories</h2>
            <span className="bg-lime-100 text-lime-800 text-xs font-black px-2.5 py-0.5 rounded-full">
              Active Taxonomy
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Domain-specific classification powering recruiter job creation and candidate discoverability.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#94C322]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((cat: any, idx: number) => (
          <div
            key={cat.id || idx}
            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#94C322] transition shadow-xs flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 truncate">{cat.name}</div>
              <div className="text-[10px] text-gray-400 font-mono truncate">/{cat.slug}</div>
            </div>
            <span className="bg-slate-900 text-lime-400 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
              {cat.jobCount || 12} jobs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
