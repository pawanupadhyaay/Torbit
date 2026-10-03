'use client';
import React, { useState } from 'react';
import { Download, CheckCircle2, XCircle, Clock, User, IndianRupee, Loader2, FileQuestion, X, Check, HelpCircle } from 'lucide-react';

interface ApplicantReviewPipelineProps {
  applications: any[];
  onUpdateStatus: (applicationId: string, status: string) => Promise<void> | void;
}

export default function ApplicantReviewPipeline({
  applications,
  onUpdateStatus
}: ApplicantReviewPipelineProps) {
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedAppForAnswers, setSelectedAppForAnswers] = useState<any | null>(null);

  const filtered = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(`${appId}-${newStatus}`);
    try {
      await onUpdateStatus(appId, newStatus);
      if (selectedAppForAnswers?.id === appId) {
        setSelectedAppForAnswers((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const parseAnswers = (ans: any): any[] => {
    if (!ans) return [];
    if (typeof ans === 'string') {
      try {
        const parsed = JSON.parse(ans);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(ans) ? ans : [];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 font-['Helvetica',Arial,sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">Applicant Review &amp; Hiring Pipeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review candidate experience, verified CTC metrics, screening question responses, and manage status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Applicants ({applications.length})</option>
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
              <th className="p-3">Candidate &amp; Contact</th>
              <th className="p-3">Applied Role</th>
              <th className="p-3">Current → Expected CTC</th>
              <th className="p-3">Resume &amp; Screener</th>
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
              filtered.map((app) => {
                const answers = parseAnswers(app.customAnswers);
                return (
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
                    <td className="p-3 space-y-1">
                      <div>
                        {app.resumeUrl || app.seeker?.resumeUrl ? (
                          <a
                            href={app.resumeUrl || app.seeker?.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-lime-400 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Resume</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No Resume</span>
                        )}
                      </div>

                      {/* Screener Answers button if answers exist */}
                      {answers.length > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedAppForAnswers(app)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#b2c359]/20 hover:bg-[#b2c359]/35 text-[#243503] px-2 py-0.5 rounded-md transition cursor-pointer border border-[#b2c359]/40"
                          >
                            <FileQuestion className="w-3 h-3 text-[#85b21c]" />
                            <span>{answers.length} Custom {answers.length === 1 ? 'Answer' : 'Answers'}</span>
                          </button>
                        </div>
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
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1 disabled:opacity-50 ${
                          app.status === 'SHORTLISTED'
                            ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300 font-black'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        {updatingId === `${app.id}-SHORTLISTED` ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>{app.status === 'SHORTLISTED' ? '✓ Shortlisted' : 'Shortlist'}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() => handleStatusChange(app.id, 'SELECTED')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1 disabled:opacity-50 ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300 font-black'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {updatingId === `${app.id}-SELECTED` ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>{app.status === 'SELECTED' ? '✓ Selected' : 'Select'}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1 disabled:opacity-50 ${
                          app.status === 'REJECTED'
                            ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-300 font-black'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {updatingId === `${app.id}-REJECTED` ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>{app.status === 'REJECTED' ? '✕ Declined' : 'Decline'}</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Screener Answers Details Modal */}
      {selectedAppForAnswers && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAppForAnswers(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#181C20] px-5 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b2c359] block">
                  CANDIDATE SCREENER RESPONSES
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {selectedAppForAnswers.seeker?.fullName || 'Candidate'} — {selectedAppForAnswers.job?.title || 'Applied Role'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForAnswers(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Contact Details</span>
                  <span className="font-bold text-gray-900">{selectedAppForAnswers.seeker?.phone || 'No phone'}</span>
                  <span className="text-gray-500 text-[11px] ml-1.5">({selectedAppForAnswers.seeker?.location || 'India'})</span>
                </div>
                <div>
                  {selectedAppForAnswers.resumeUrl && (
                    <a
                      href={selectedAppForAnswers.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-black text-lime-400 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resume</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-900 mb-2.5 flex items-center gap-1.5 text-xs">
                  <FileQuestion className="w-4 h-4 text-[#85b21c]" />
                  <span>Questionnaire Answers:</span>
                </h4>

                <div className="space-y-3">
                  {parseAnswers(selectedAppForAnswers.customAnswers).map((item: any, idx: number) => {
                    const ans = item.answer;
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-gray-900 text-xs leading-snug">
                            {idx + 1}. {item.question || `Question #${idx + 1}`}
                          </span>
                          {item.required && (
                            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
                              Mandatory
                            </span>
                          )}
                        </div>

                        <div className="pt-1">
                          {Array.isArray(ans) ? (
                            <div className="flex flex-wrap gap-1.5">
                              {ans.length === 0 ? (
                                <span className="text-gray-400 italic">No option selected</span>
                              ) : (
                                ans.map((opt: string, optIdx: number) => (
                                  <span
                                    key={optIdx}
                                    className="inline-flex items-center gap-1 bg-lime-50 text-lime-900 border border-lime-200 font-bold px-2 py-0.5 rounded-md text-[11px]"
                                  >
                                    <Check className="w-3 h-3 text-[#85b21c]" />
                                    <span>{opt}</span>
                                  </span>
                                ))
                              )}
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900">
                              {ans !== undefined && ans !== null && String(ans).trim() !== '' ? (
                                String(ans)
                              ) : (
                                <span className="text-gray-400 italic">No answer provided</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedAppForAnswers(null)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedAppForAnswers.id, 'SHORTLISTED')}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Shortlist Candidate
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedAppForAnswers.id, 'SELECTED')}
                  className="px-3.5 py-2 bg-[#b2c359] hover:bg-[#85b21c] text-slate-950 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Select / Hire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
