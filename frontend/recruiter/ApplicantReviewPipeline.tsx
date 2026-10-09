'use client';
import React, { useState, useMemo } from 'react';
import { 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  IndianRupee, 
  Loader2, 
  FileQuestion, 
  X, 
  Check, 
  HelpCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Briefcase
} from 'lucide-react';

interface ApplicantReviewPipelineProps {
  applications: any[];
  onUpdateStatus: (applicationId: string, status: string) => Promise<void> | void;
}

export default function ApplicantReviewPipeline({
  applications,
  onUpdateStatus
}: ApplicantReviewPipelineProps) {
  const [jobFilter, setJobFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [noticeFilter, setNoticeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedAppForAnswers, setSelectedAppForAnswers] = useState<any | null>(null);

  // Extract unique jobs from applications list with counts
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    applications.forEach((a) => {
      const jId = a.job?.id || a.jobId || 'unknown';
      const jTitle = a.job?.title || 'Job Listing';
      if (!map.has(jId)) {
        map.set(jId, { id: jId, title: jTitle, count: 0 });
      }
      map.get(jId)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [applications]);

  // Status counts for quick filter buttons
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: applications.length,
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      SELECTED: 0,
      REJECTED: 0
    };
    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });
    return counts;
  }, [applications]);

  const hasActiveFilters = jobFilter !== 'ALL' || statusFilter !== 'ALL' || noticeFilter !== 'ALL' || searchQuery.trim() !== '' || sortBy !== 'NEWEST';

  const resetFilters = () => {
    setJobFilter('ALL');
    setStatusFilter('ALL');
    setNoticeFilter('ALL');
    setSearchQuery('');
    setSortBy('NEWEST');
  };

  // Filter and sort applications
  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        // 1. Filter by specific Job
        if (jobFilter !== 'ALL') {
          const appId = app.job?.id || app.jobId;
          if (appId !== jobFilter) return false;
        }

        // 2. Filter by Status
        if (statusFilter !== 'ALL') {
          if (app.status !== statusFilter) return false;
        }

        // 3. Filter by Notice Period
        if (noticeFilter !== 'ALL') {
          const np = (app.noticePeriod || '').toLowerCase();
          if (noticeFilter === 'IMMEDIATE' && !np.includes('immediate') && !np.includes('0')) return false;
          if (noticeFilter === '15' && !np.includes('15')) return false;
          if (noticeFilter === '30' && !np.includes('30')) return false;
          if (noticeFilter === '60+' && !np.includes('60') && !np.includes('90') && !np.includes('2 month') && !np.includes('3 month')) return false;
        }

        // 4. Live Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = (app.seeker?.fullName || '').toLowerCase();
          const email = (app.seeker?.email || app.seeker?.user?.email || '').toLowerCase();
          const phone = (app.seeker?.phone || app.seeker?.user?.phone || '').toLowerCase();
          const title = (app.job?.title || '').toLowerCase();
          const dept = (app.job?.department || '').toLowerCase();
          const loc = (app.seeker?.location || app.job?.location || '').toLowerCase();
          const matches = name.includes(q) || email.includes(q) || phone.includes(q) || title.includes(q) || dept.includes(q) || loc.includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'CTC_DESC') {
          return (Number(b.expectedSalary) || 0) - (Number(a.expectedSalary) || 0);
        }
        if (sortBy === 'CTC_ASC') {
          return (Number(a.expectedSalary) || 0) - (Number(b.expectedSalary) || 0);
        }
        if (sortBy === 'NAME_ASC') {
          const nameA = (a.seeker?.fullName || a.seeker?.email || '').toLowerCase();
          const nameB = (b.seeker?.fullName || b.seeker?.email || '').toLowerCase();
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [applications, jobFilter, statusFilter, noticeFilter, searchQuery, sortBy]);

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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5 font-['Helvetica',Arial,sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-gray-900">Applicant Review &amp; Hiring Pipeline</h2>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
              {filtered.length} of {applications.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter applications by job, status, or candidate details. Sort by CTC, date applied, or name.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Control Bar: Search + Filter as per Job + Status + Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 1. Live Candidate Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, phone..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Filter As Per Job Dropdown */}
        <div className="relative">
          <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer appearance-none truncate"
          >
            <option value="ALL">All Jobs ({applications.length})</option>
            {uniqueJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.count})
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* 3. Filter by Status Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer appearance-none"
          >
            <option value="ALL">All Statuses ({applications.length})</option>
            <option value="APPLIED">Applied ({statusCounts.APPLIED})</option>
            <option value="UNDER_REVIEW">Under Review ({statusCounts.UNDER_REVIEW})</option>
            <option value="SHORTLISTED">Shortlisted ({statusCounts.SHORTLISTED})</option>
            <option value="SELECTED">Selected / Hired ({statusCounts.SELECTED})</option>
            <option value="REJECTED">Declined ({statusCounts.REJECTED})</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* 4. Sort By Dropdown */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer appearance-none"
          >
            <option value="NEWEST">Applied: Newest First</option>
            <option value="OLDEST">Applied: Oldest First</option>
            <option value="CTC_DESC">Expected CTC: High to Low</option>
            <option value="CTC_ASC">Expected CTC: Low to High</option>
            <option value="NAME_ASC">Candidate: A to Z</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
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
                <td colSpan={6} className="p-10 text-center text-slate-400 text-xs">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Matching Applicants Found</div>
                    <p className="text-slate-500 text-[11px]">
                      {hasActiveFilters
                        ? 'Try adjusting your job, status, or search filters to view applicants.'
                        : 'No candidate applications have been received yet for your postings.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer mt-1 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    )}
                  </div>
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
