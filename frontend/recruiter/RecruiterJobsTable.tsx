'use client';
import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  PlusCircle, 
  IndianRupee, 
  Users, 
  Edit3, 
  Power, 
  CheckCircle2, 
  PauseCircle, 
  XCircle,
  MoreVertical
} from 'lucide-react';
import EditJobModal from './EditJobModal';

interface RecruiterJobsTableProps {
  jobs: any[];
  onOpenCreateJob: () => void;
  isApproved: boolean;
  onJobUpdated?: () => void;
  onEditJob?: (job: any) => void;
}

export default function RecruiterJobsTable({ 
  jobs, 
  onOpenCreateJob, 
  isApproved, 
  onJobUpdated,
  onEditJob
}: RecruiterJobsTableProps) {
  const [editingJob, setEditingJob] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleEditClick = (job: any) => {
    if (onEditJob) {
      onEditJob(job);
    } else {
      setEditingJob(job);
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    setUpdatingId(jobId);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok && onJobUpdated) {
        onJobUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-gray-900">My Job Listings</h2>
            <span className="bg-lime-100 text-[#9eb047] text-[10px] font-black px-2 py-0.5 rounded-full border border-lime-200">
              {jobs.length} Listed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live openings, edit job terms, track candidate applicants &amp; toggle active/closed status.
          </p>
        </div>

        {isApproved && (
          <button
            type="button"
            onClick={onOpenCreateJob}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Opening</span>
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 space-y-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200 p-6">
          <Briefcase className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900">No Job Openings Created Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Post your first job opening to start receiving verified candidate applications.
          </p>
          {isApproved && (
            <button
              type="button"
              onClick={onOpenCreateJob}
              className="bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              + Create First Job
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* 1. MOBILE CARD VIEW (Shown on Mobile screens < md)        */}
          {/* ======================================================== */}
          <div className="md:hidden space-y-3">
            {jobs.map((j) => {
              const appCount = j._count?.applications ?? j.applications?.length ?? 0;
              const salaryFormatted = j.salaryMin
                ? `₹${j.salaryMin >= 100000 ? j.salaryMin / 100000 : j.salaryMin}L - ₹${j.salaryMax >= 100000 ? j.salaryMax / 100000 : j.salaryMax}L / yr`
                : 'Competitive CTC';

              const isUpdating = updatingId === j.id;
              const isClosed = j.status === 'CLOSED';
              const isPaused = j.status === 'PAUSED';

              return (
                <div
                  key={j.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition-colors space-y-3 ${
                    isClosed ? 'border-gray-200 bg-gray-50/40 opacity-80' : 'border-gray-200/90 hover:border-[#b2c359]/50'
                  }`}
                >
                  {/* Top: Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className={`text-sm font-black truncate leading-snug ${isClosed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {j.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                          {j.department || 'General'}
                        </span>
                        <span>•</span>
                        <span>Openings: <strong className="text-gray-800">{j.openings || 1}</strong></span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                      isClosed 
                        ? 'bg-red-100 text-red-800' 
                        : isPaused 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {j.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Location &amp; Mode
                      </span>
                      <p className="text-gray-700 font-semibold text-[11px] truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{j.location || 'India'}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {j.workMode || 'On-site'} • {j.jobType || 'Full-time'}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Salary (CTC)
                      </span>
                      <p className="text-gray-900 font-mono font-bold text-[11px] truncate flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{salaryFormatted}</span>
                      </p>
                    </div>
                  </div>

                  {/* Applicants Badge & Actions Row */}
                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg text-xs border border-emerald-200 flex items-center gap-1.5 shrink-0">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appCount} {appCount === 1 ? 'applicant' : 'applicants'}</span>
                    </span>

                    {/* Edit & Quick Status Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditClick(j)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Edit Job Details"
                      >
                        <Edit3 className="w-3 h-3 text-gray-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(j.id, j.status || 'ACTIVE')}
                        className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          isClosed
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                        title={isClosed ? 'Reopen Job' : 'Close Job'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isUpdating ? '...' : isClosed ? 'Reopen' : 'Close'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* 2. DESKTOP TABLE VIEW (Shown on Desktop screens >= md)    */}
          {/* ======================================================== */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Job Title</th>
                  <th className="p-3.5">Category / Department</th>
                  <th className="p-3.5">Work Mode &amp; City</th>
                  <th className="p-3.5">Salary Range (CTC)</th>
                  <th className="p-3.5">Applications</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j) => {
                  const appCount = j._count?.applications ?? j.applications?.length ?? 0;
                  const salaryFormatted = j.salaryMin
                    ? `₹${j.salaryMin >= 100000 ? j.salaryMin / 100000 : j.salaryMin}L - ₹${j.salaryMax >= 100000 ? j.salaryMax / 100000 : j.salaryMax}L`
                    : 'Competitive CTC';

                  const isUpdating = updatingId === j.id;
                  const isClosed = j.status === 'CLOSED';
                  const isPaused = j.status === 'PAUSED';

                  return (
                    <tr key={j.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3.5">
                        <div className={`font-bold ${isClosed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{j.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Openings: {j.openings || 1}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {j.department}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600">
                        <div className="font-semibold text-gray-800">{j.location}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{j.workMode} • {j.jobType}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-gray-900">
                        {salaryFormatted}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200 inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>{appCount} {appCount === 1 ? 'candidate' : 'candidates'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isClosed 
                            ? 'bg-red-100 text-red-800' 
                            : isPaused 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {j.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(j)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(j.id, j.status || 'ACTIVE')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              isClosed
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{isUpdating ? '...' : isClosed ? 'Reopen' : 'Close'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          isOpen={Boolean(editingJob)}
          onClose={() => setEditingJob(null)}
          job={editingJob}
          onJobUpdated={() => {
            if (onJobUpdated) onJobUpdated();
          }}
        />
      )}
    </div>
  );
}
