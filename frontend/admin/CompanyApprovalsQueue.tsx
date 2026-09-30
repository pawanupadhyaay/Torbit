'use client';
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Search, Mail, Phone, MapPin, Check, FileText, ExternalLink } from 'lucide-react';

interface CompanyApprovalsQueueProps {
  pendingCompanies: any[];
  onApprove: (id: string) => void;
  onOpenActionModal: (id: string, action: 'REJECT' | 'BLOCK') => void;
}

export default function CompanyApprovalsQueue({
  pendingCompanies,
  onApprove,
  onOpenActionModal
}: CompanyApprovalsQueueProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = pendingCompanies.filter((c) =>
    (c.companyName || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.gstNumber || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.hqLocation || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-gray-900">Company KYC Verification Center</h2>
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
              {pendingCompanies.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Review developer credentials, GST registration number, uploaded GST PDF certificates, and approve recruiter access.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by company, GST..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#94C322]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 bg-lime-50/50 rounded-2xl text-center border border-lime-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-sm font-black text-gray-900">No Pending Company Approvals!</div>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            All registered real estate recruiters and developer companies have been verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const refId = c.rejectionReason?.startsWith('REF:') ? c.rejectionReason.replace('REF:', '') : null;
            return (
              <div
                key={c.id}
                className="bg-gray-50/70 border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{c.companyName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {c.industry || 'Real Estate Developer'}
                        </span>
                        {refId && (
                          <span className="bg-slate-900 text-[#94C322] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {refId}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                      Pending KYC
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">GSTIN / Registration</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {c.gstNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">Official Work Email</span>
                      <span className="text-gray-900 font-semibold truncate max-w-[180px]">{c.workEmail}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">Contact Phone</span>
                      <span className="text-gray-900 font-semibold">{c.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">HQ Location</span>
                      <span className="text-gray-900 font-semibold">{c.hqLocation}</span>
                    </div>

                    {/* GST PDF Certificate Link */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">GST Certificate:</span>
                      {c.docUrl ? (
                        <a
                          href={c.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View PDF Certificate</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No document attached</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => onApprove(c.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Recruiter</span>
                  </button>
                  <button
                    onClick={() => onOpenActionModal(c.id, 'REJECT')}
                    className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
