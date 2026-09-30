'use client';
import React, { useState } from 'react';
import { Download, CheckCircle2, XCircle, Clock, User, IndianRupee } from 'lucide-react';

interface ApplicantReviewPipelineProps {
  applications: any[];
  onUpdateStatus: (applicationId: string, status: string) => void;
}

export default function ApplicantReviewPipeline({
  applications,
  onUpdateStatus
}: ApplicantReviewPipelineProps) {
  const [filter, setFilter] = useState('ALL');

  const filtered = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 font-['Helvetica',Arial,sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">Applicant Review & Hiring Pipeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review candidate experience, verified Current CTC metrics, download &lt; 2MB resumes, and update status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Applicants</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Declined</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Candidate & Contact</th>
              <th className="p-3">Applied Role</th>
              <th className="p-3">Current → Expected CTC</th>
              <th className="p-3">Resume Document</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                  No applicants matching this status filter.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{app.seeker?.fullName || app.seeker?.email || 'Candidate'}</div>
                    <div className="text-[11px] text-gray-500">{app.seeker?.phone || 'No phone provided'}</div>
                    <div className="text-[10px] text-gray-400">{app.seeker?.location || ''}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">{app.job?.title || 'Applied Role'}</div>
                    <div className="text-[10px] text-gray-500">{app.job?.department || ''}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-gray-900">
                      {app.currentSalary && app.expectedSalary
                        ? `₹${app.currentSalary / 100000}L → ₹${app.expectedSalary / 100000}L LPA`
                        : app.expectedSalary
                          ? `Expected: ₹${app.expectedSalary / 100000}L LPA`
                          : 'Not specified'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">Notice: {app.noticePeriod || 'Immediate'}</div>
                  </td>
                  <td className="p-3">
                    {app.resumeUrl || app.seeker?.resumeUrl ? (
                      <a
                        href={app.resumeUrl || app.seeker?.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-lime-400 px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">No Resume</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      app.status === 'SELECTED' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300 font-black'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      {app.status === 'SHORTLISTED' ? '✓ Shortlisted' : 'Shortlist'}
                    </button>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'SELECTED')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300 font-black'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {app.status === 'SELECTED' ? '✓ Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        app.status === 'REJECTED'
                          ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-300 font-black'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {app.status === 'REJECTED' ? '✓ Declined' : 'Decline'}
                    </button>
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
