'use client';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Briefcase, IndianRupee, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import ApplyJobModal from './ApplyJobModal';

interface SeekerBrowseJobsProps {
  currentUser?: any;
  onApplicationSubmitted?: () => void;
}

export default function SeekerBrowseJobs({ currentUser, onApplicationSubmitted }: SeekerBrowseJobsProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedLoc, setSelectedLoc] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      job.skills?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat === 'ALL' || job.department === selectedCat;
    const matchesLoc = selectedLoc === 'ALL' || job.location?.toLowerCase().includes(selectedLoc.toLowerCase());

    return matchesSearch && matchesCat && matchesLoc;
  });

  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)));

  const handleOpenApply = (job: any) => {
    setSelectedJobForApply(job);
    setApplyModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif]">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span>Browse Job Openings</span>
              <span className="bg-lime-100 text-[#82ad1b] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-lime-200">
                {filteredJobs.length} Active Jobs
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Apply directly to verified companies, startups, and top enterprises.
            </p>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, skills..."
              className="w-full pl-9 pr-3 py-2.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#94C322] focus:bg-white transition"
            />
          </div>

          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#94C322] focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">All Categories / Departments</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#94C322] focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {loading ? (
          <div className="col-span-1 md:col-span-2 py-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-150">
            Loading job openings...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
            No matching job openings found. Try adjusting your search or filters.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:border-[#94C322] hover:shadow-md transition flex flex-col justify-between space-y-3 sm:space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94C322] block mb-0.5">
                      {job.department || 'General'}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{job.company?.companyName || 'Torbit Realty Partner'}</span>
                    </p>
                  </div>
                  <span className="bg-slate-900 text-lime-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{job.location || 'India'}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono font-bold text-gray-900">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {job.salaryMin && job.salaryMax
                        ? `₹${job.salaryMin / 100000}L – ₹${job.salaryMax / 100000}L PA`
                        : 'Competitive CTC'}
                    </span>
                  </span>
                </div>

                {job.skills && (
                  <div className="text-[11px] text-gray-500 line-clamp-1 pt-1 border-t border-gray-50">
                    <span className="font-bold text-gray-700">Skills: </span>
                    <span>{job.skills}</span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-medium truncate">
                  {job._count?.applications || 0} candidates applied
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenApply(job)}
                  className="bg-[#94C322] hover:bg-[#82ad1b] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>1-Click Apply</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobForApply}
          currentUser={currentUser}
          onApplicationSubmitted={() => {
            fetchJobs();
            if (onApplicationSubmitted) onApplicationSubmitted();
          }}
        />
      )}
    </div>
  );
}
