'use client';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Briefcase, IndianRupee, Sparkles, Filter, CheckCircle2, Clock, ArrowUpDown } from 'lucide-react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CustomFilterSelect from '@/common/CustomFilterSelect';
import { DEPARTMENT_CATEGORIES, formatSalaryRange } from '@/lib/constants';
import ApplyJobModal from './ApplyJobModal';
import JobDetailsModal from '@/common/JobDetailsModal';
import JobApplicationView from './JobApplicationView';

interface SeekerBrowseJobsProps {
  currentUser?: any;
  applications?: any[];
  onApplicationSubmitted?: () => void;
}

export default function SeekerBrowseJobs({ currentUser, applications, onApplicationSubmitted }: SeekerBrowseJobsProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedLoc, setSelectedLoc] = useState('ALL');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '/api';

  // Instant 0ms cache snapshot hydration on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('torbitSeekerBrowseJobs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jobs && Array.isArray(parsed.jobs)) setJobs(parsed.jobs);
        if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
      }
    } catch (e) {
      console.error('Snapshot hydration error:', e);
    }
  }, []);

  const fetchJobs = async () => {
    try {
      if (jobs.length === 0) setLoading(true);
      const res = await fetch(`${apiBase}/jobs`);
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
      if (data.categories) setCategories(data.categories);

      try {
        sessionStorage.setItem('torbitSeekerBrowseJobs', JSON.stringify({
          jobs: data.jobs || [],
          categories: data.categories || []
        }));
      } catch (e) {}
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applications && Array.isArray(applications)) {
      const ids = new Set<string>(
        applications.map((a: any) => a.jobId || a.job?.id).filter(Boolean)
      );
      setAppliedJobIds(ids);
    }
  }, [applications]);

  const fetchApplications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const res = await fetch(`${apiBase}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          const ids = new Set<string>(
            data.applications.map((a: any) => a.jobId || a.job?.id).filter(Boolean)
          );
          setAppliedJobIds(ids);
        }
      }
    } catch (e) {
      console.error('Error fetching applications for browse view:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      job.skills?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      !selectedCat ||
      selectedCat === 'ALL' ||
      selectedCat === 'All Categories' ||
      job.department === selectedCat ||
      job.category === selectedCat;

    const matchesLoc =
      !selectedLoc ||
      selectedLoc === 'ALL' ||
      selectedLoc === 'All Locations' ||
      (job.location && job.location.toLowerCase().includes(selectedLoc.toLowerCase())) ||
      (selectedLoc && selectedLoc.toLowerCase().includes(job.location?.toLowerCase() || ''));

    const matchesJobType =
      !selectedJobType ||
      selectedJobType === 'ALL' ||
      selectedJobType === 'All Job Types' ||
      (job.jobType || '').toLowerCase().replace(/[\s\-_]/g, '').includes(selectedJobType.toLowerCase().replace(/[\s\-_]/g, '')) ||
      selectedJobType.toLowerCase().replace(/[\s\-_]/g, '').includes((job.jobType || '').toLowerCase().replace(/[\s\-_]/g, ''));

    const matchesWorkMode =
      !selectedWorkMode ||
      selectedWorkMode === 'ALL' ||
      selectedWorkMode === 'All Work Modes' ||
      (job.workMode || '').toLowerCase().replace(/[\s\-_]/g, '').includes(selectedWorkMode.toLowerCase().replace(/[\s\-_]/g, '')) ||
      selectedWorkMode.toLowerCase().replace(/[\s\-_]/g, '').includes((job.workMode || '').toLowerCase().replace(/[\s\-_]/g, ''));

    return matchesSearch && matchesCat && matchesLoc && matchesJobType && matchesWorkMode;
  }).sort((a, b) => {
    const isClosedA = a.status === 'CLOSED';
    const isClosedB = b.status === 'CLOSED';
    if (isClosedA !== isClosedB) {
      return isClosedA ? 1 : -1;
    }

    if (sortBy === 'salary_high') {
      const salA = a.salaryMax || a.salaryMin || 0;
      const salB = b.salaryMax || b.salaryMin || 0;
      if (salB !== salA) return salB - salA;
    } else if (sortBy === 'salary_low') {
      const salA = a.salaryMin || a.salaryMax || 0;
      const salB = b.salaryMin || b.salaryMax || 0;
      if (salA !== salB) return salA - salB;
    } else if (sortBy === 'exp_low') {
      const expA = a.expMin ?? 0;
      const expB = b.expMin ?? 0;
      if (expA !== expB) return expA - expB;
    } else if (sortBy === 'exp_high') {
      const expA = a.expMax ?? a.expMin ?? 0;
      const expB = b.expMax ?? b.expMin ?? 0;
      if (expB !== expA) return expB - expA;
    } else if (sortBy === 'title_asc') {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      const comp = titleA.localeCompare(titleB);
      if (comp !== 0) return comp;
    }

    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const allLocations = Array.from(new Set([
    'All Locations',
    'Gurugram, Haryana',
    'Noida, Uttar Pradesh',
    'Delhi NCR',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
    'Pune, Maharashtra',
    'Hyderabad, Telangana',
    ...jobs.map((j) => j.location).filter(Boolean)
  ]));

  const categoryList: string[] = [
    'All Categories',
    ...Array.from(new Set([
      ...categories.map((c: any) => typeof c === 'string' ? c : c.name),
      ...(DEPARTMENT_CATEGORIES as unknown as string[])
    ])).filter((cat) => cat && cat !== 'All Categories' && cat !== 'ALL')
  ];

  const hasActiveFilters = Boolean(
    search ||
    selectedCat !== 'ALL' ||
    selectedLoc !== 'ALL' ||
    selectedJobType !== 'ALL' ||
    selectedWorkMode !== 'ALL'
  );

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCat('ALL');
    setSelectedLoc('ALL');
    setSelectedJobType('ALL');
    setSelectedWorkMode('ALL');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setDetailsModalOpen(true);
  };

  const handleOpenApply = (job: any) => {
    if (job?.status === 'CLOSED' || appliedJobIds.has(job.id)) return;
    setSelectedJobForApply(job);
    setApplyModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif]">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5 space-y-3 sm:space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span>Browse Job Openings</span>
              <span className="bg-lime-100 text-[#9eb047] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-lime-200">
                {filteredJobs.length} Active Jobs
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Click any job card to read the full job description and requirements before applying.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-gray-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#b2c359] transition cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Salary High to Low</option>
                <option value="salary_low">Salary Low to High</option>
                <option value="exp_low">Entry Level First</option>
                <option value="exp_high">Senior Level First</option>
                <option value="title_asc">Title A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero Section Style Search Bar & Filters */}
        <form onSubmit={handleSearchSubmit} className="space-y-2 pt-0.5">
          {/* Row 1: Keyword, Location, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center relative z-20">
            {/* 1. Keyword */}
            <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
              <SearchOutlinedIcon className="text-gray-400 mr-2 flex-shrink-0" sx={{ fontSize: 18 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skills, keyword..."
                className="w-full text-xs sm:text-[13.5px] leading-tight font-normal text-[#080809] focus:outline-none placeholder-gray-400 bg-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600 text-xs px-1 font-bold"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* 2. Location */}
            <CustomFilterSelect
              value={selectedLoc === 'ALL' ? 'All Locations' : selectedLoc}
              onChange={(val) => setSelectedLoc(val === 'All Locations' ? 'ALL' : val)}
              options={allLocations}
              icon={<LocationOnOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
              placeholder="All Locations"
            />

            {/* 3. Category */}
            <div className="sm:col-span-2 lg:col-span-1">
              <CustomFilterSelect
                value={selectedCat === 'ALL' ? 'All Categories' : selectedCat}
                onChange={(val) => setSelectedCat(val === 'All Categories' ? 'ALL' : val)}
                options={categoryList}
                icon={<LayersOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
                placeholder="All Categories"
              />
            </div>
          </div>

          {/* Row 2: Job Type, Work Mode, SEARCH CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center relative z-10">
            {/* 4. Job Type */}
            <CustomFilterSelect
              value={selectedJobType === 'ALL' ? 'All Job Types' : selectedJobType}
              onChange={(val) => setSelectedJobType(val === 'All Job Types' ? 'ALL' : val)}
              options={['All Job Types', 'Full Time', 'Part Time', 'Contract', 'Internship']}
              icon={<WorkOutlineOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
              placeholder="All Job Types"
            />

            {/* 5. Work Mode */}
            <CustomFilterSelect
              value={selectedWorkMode === 'ALL' ? 'All Work Modes' : selectedWorkMode}
              onChange={(val) => setSelectedWorkMode(val === 'All Work Modes' ? 'ALL' : val)}
              options={['All Work Modes', 'On-site', 'Hybrid', 'Remote']}
              icon={<HomeWorkOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
              placeholder="All Work Modes"
            />

            {/* 6. SEARCH CTA */}
            <div className="sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full min-h-[44px] sm:min-h-[48px] bg-[#b2c359] hover:bg-[#9eb047] text-white font-['Helvetica',Arial,sans-serif] font-bold text-xs sm:text-[14px] uppercase px-4 py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] whitespace-nowrap cursor-pointer"
              >
                <span>SEARCH</span>
                <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </form>
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
          filteredJobs.map((job) => {
            const companyName = job.company?.companyName || 'Verified Partner';
            const companyInitials = (companyName || 'JOB').substring(0, 2).toUpperCase();

            return (
              <div
                key={job.id}
                onClick={() => handleOpenDetails(job)}
                className="group bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:border-[#b2c359] hover:shadow-md transition flex flex-col justify-between space-y-3 sm:space-y-3.5 cursor-pointer text-left"
              >
                <div className="space-y-2.5">
                  {/* Top: Logo & Title Row */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-800 shrink-0 overflow-hidden group-hover:border-[#b2c359] transition shadow-2xs">
                      {job.company?.logoUrl ? (
                        <img
                          src={job.company.logoUrl}
                          alt={companyName}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[#647a16] font-black">{companyInitials}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7ea81b] truncate">
                          {job.department || 'General'}
                        </span>
                        {job.status === 'CLOSED' ? (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 border border-rose-200 uppercase tracking-wider">
                            Closed
                          </span>
                        ) : appliedJobIds.has(job.id) ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Applied
                          </span>
                        ) : (
                          <span className="bg-slate-900 text-lime-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0">
                            {job.jobType || 'Full Time'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug truncate group-hover:text-[#647a16] transition">
                        {job.title}
                      </h3>

                      <p className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{companyName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Highlights Meta Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-gray-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{job.location || 'India'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono font-bold text-gray-900">
                      <span>{formatSalaryRange(job.salaryMin, job.salaryMax, job.hideSalary)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{job.expMin ?? 0}–{job.expMax ?? 5} Yrs</span>
                    </span>
                  </div>

                  {/* Description Preview (2 lines like LinkedIn) */}
                  {job.description && (
                    <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed pt-0.5">
                      {job.description}
                    </p>
                  )}

                  {/* Skills tags preview */}
                  {job.skills && (
                    <div className="text-[11px] text-gray-500 line-clamp-1 pt-1 border-t border-gray-100 flex items-center gap-1">
                      <span className="font-bold text-gray-700 shrink-0">Skills: </span>
                      <span className="truncate text-gray-600">{job.skills}</span>
                    </div>
                  )}
                </div>

                {/* Footer with View Details & 1-Click Apply */}
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 font-medium truncate">
                    {job._count?.applications || 0} applicants
                  </span>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(job);
                      }}
                      className="border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      View Details
                    </button>
                    {job.status === 'CLOSED' ? (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-100 text-gray-400 border border-gray-200 font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-not-allowed whitespace-nowrap"
                      >
                        Closed
                      </button>
                    ) : appliedJobIds.has(job.id) ? (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-default shadow-none whitespace-nowrap"
                        title="You have already applied for this job"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenApply(job);
                        }}
                        className="bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LinkedIn-style Job Details Modal */}
      {selectedJobForDetails && (
        <JobDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          job={selectedJobForDetails}
          isApplied={appliedJobIds.has(selectedJobForDetails.id)}
          onApply={(job) => {
            setDetailsModalOpen(false);
            handleOpenApply(job);
          }}
        />
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setSelectedJobForApply(null);
          }}
          job={selectedJobForApply}
          currentUser={currentUser}
          onApplicationSubmitted={() => {
            setApplyModalOpen(false);
            setSelectedJobForApply(null);
            fetchJobs();
            fetchApplications();
            if (onApplicationSubmitted) onApplicationSubmitted();
          }}
        />
      )}
    </div>
  );
}
