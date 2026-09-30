'use client';
import React, { useState } from 'react';
import { Search, Building2, ShieldCheck, Ban, Check } from 'lucide-react';

interface CompanyDirectoryProps {
  companies: any[];
  onApprove: (id: string) => void;
  onOpenActionModal: (id: string, action: 'REJECT' | 'BLOCK') => void;
}

export default function CompanyDirectory({
  companies,
  onApprove,
  onOpenActionModal
}: CompanyDirectoryProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = companies.filter((c) => {
    const matchesSearch =
      (c.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.gstNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.hqLocation || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">Company & Builder Master Directory</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage platform builders, view active listings & toggle access.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending KYC</option>
            <option value="BLOCKED">Blocked Accounts</option>
          </select>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search builders..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#94C322]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Company / Builder</th>
              <th className="p-3">GST Number</th>
              <th className="p-3">Location</th>
              <th className="p-3">Jobs Posted</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/70 transition">
                <td className="p-3">
                  <div className="font-bold text-gray-900">{c.companyName}</div>
                  <div className="text-[11px] text-gray-400">{c.workEmail}</div>
                </td>
                <td className="p-3 font-mono text-gray-700 font-semibold">
                  {c.gstNumber}
                </td>
                <td className="p-3 text-gray-600">{c.hqLocation}</td>
                <td className="p-3">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    {c._count?.jobs ?? 0} jobs
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    c.status === 'BLOCKED' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  {c.status === 'BLOCKED' ? (
                    <button
                      onClick={() => onApprove(c.id)}
                      className="bg-slate-900 hover:bg-black text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Unblock Account
                    </button>
                  ) : c.status === 'PENDING' ? (
                    <button
                      onClick={() => onApprove(c.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenActionModal(c.id, 'BLOCK')}
                      className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-lg text-xs font-bold transition"
                    >
                      Block Access
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
