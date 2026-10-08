'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import ApplyJobModal from '@/job-seeker/ApplyJobModal';
import JobDetailsModal from '@/common/JobDetailsModal';
import MobileBottomBar from '@/common/MobileBottomBar';
import JobFilterBar from '@/common/JobFilterBar';
import { DEPARTMENT_CATEGORIES, JOB_TYPES, WORK_MODES } from '@/lib/constants';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Building2,
  Share2,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  jobType: string;
  workMode: string;
  location: string;
  department?: string;
  category?: string;
  expMin: number;
  expMax: number;
  salaryMin?: number;
  salaryMax?: number;
  hideSalary?: boolean;
  description?: string;
  requirements?: string;
  createdAt: string;
  status?: string;
  company: {
    companyName: string;
    logoUrl?: string;
    industry?: string;
  };
}

const TOP_LOCATIONS = [
  'All Locations',
  'Delhi NCR',
  'Gurugram',
  'Noida',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad'
];

const EXPERIENCE_RANGES = [
  { label: 'All Experience', min: 0, max: 100 },
  { label: 'Fresher (0–1 Year)', min: 0, max: 1 },
  { label: '1–3 Years', min: 1, max: 3 },
  { label: '3–5 Years', min: 3, max: 5 },
  { label: '5–8 Years', min: 5, max: 8 },
  { label: '8+ Years', min: 8, max: 100 }
];

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedJobType, setSelectedJobType] = useState<string>('All Job Types');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All Work Modes');
  const [selectedExp, setSelectedExp] = useState<string>('All Experience');
  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allCategories, setAllCategories] = useState<Array<{ name: string; jobCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Modals
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Role Notice Modal & Toast state (for Admin / Recruiter attempting to apply)
  const [roleNotice, setRoleNotice] = useState<{ title: string; message: string; role: 'ADMIN' | 'RECRUITER' } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state from query parameters on mount or param change
  useEffect(() => {
    const catParam = searchParams.get('category');
    const locParam = searchParams.get('location');
    const qParam = searchParams.get('q') || searchParams.get('query');
    const typeParam = searchParams.get('jobType');
    const modeParam = searchParams.get('workMode');
    const expParam = searchParams.get('experience');
    const compParam = searchParams.get('company');
    const sortParam = searchParams.get('sort');

    if (catParam) setSelectedCategory(catParam);
    if (locParam) setSelectedLocation(locParam);
    if (qParam) setSearchKeyword(qParam);
    if (typeParam) setSelectedJobType(typeParam);
    if (modeParam) setSelectedWorkMode(modeParam);
    if (expParam) setSelectedExp(expParam);
    if (compParam) setSelectedCompany(compParam);
    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);

  // Fetch candidate's previous applications to lock applied jobs
  const fetchUserApplications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!token || !userStr) return;
      const u = JSON.parse(userStr);
      if (u?.role !== 'JOB_SEEKER') return;

      const res = await fetch('/api/applications', {
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
      console.error('Error fetching candidate applications:', e);
    }
  };

  // Fetch Jobs from backend API
  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) setJobs(data.jobs);
        if (data.categories) setAllCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
    fetchUserApplications();
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (e) {}
  }, []);

  const handleFilterSubmit = () => {
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('q', searchKeyword.trim());
    if (selectedLocation && selectedLocation !== 'All Locations') params.set('location', selectedLocation);
    if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    if (selectedJobType && selectedJobType !== 'All Job Types') params.set('jobType', selectedJobType);
    if (selectedWorkMode && selectedWorkMode !== 'All Work Modes') params.set('workMode', selectedWorkMode);
    if (selectedExp && selectedExp !== 'All Experience') params.set('experience', selectedExp);
    if (selectedCompany && selectedCompany !== 'All Companies') params.set('company', selectedCompany);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
  };

  // Filter Jobs based on active selections
  const filteredJobs = useMemo(() => {
    const list = jobs.filter((job) => {
      // 1. Keyword search (title, company, description, category)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase().trim();
        const titleMatch = (job.title || '').toLowerCase().includes(q);
        const compMatch = (job.company?.companyName || '').toLowerCase().includes(q);
        const descMatch = (job.description || '').toLowerCase().includes(q);
        const catMatch = (job.category || job.department || '').toLowerCase().includes(q);
        if (!titleMatch && !compMatch && !descMatch && !catMatch) return false;
      }

      // 2. Category filter
      if (selectedCategory && selectedCategory !== 'All Categories') {
        const jobCat = (job.category || job.department || '').toLowerCase();
        const targetCat = selectedCategory.toLowerCase();
        if (!jobCat.includes(targetCat) && !targetCat.includes(jobCat)) {
          return false;
        }
      }

      // 3. Location filter
      if (selectedLocation && selectedLocation !== 'All Locations') {
        const jobLoc = (job.location || '').toLowerCase().trim();
        const targetLoc = selectedLocation.toLowerCase().trim();
        const primaryCity = targetLoc.split(',')[0].trim();
        const jobCity = jobLoc.split(',')[0].trim();
        if (
          !jobLoc.includes(targetLoc) &&
          !jobLoc.includes(primaryCity) &&
          !targetLoc.includes(jobLoc) &&
          !targetLoc.includes(jobCity)
        ) {
          return false;
        }
      }

      // 4. Job Type filter
      if (selectedJobType && selectedJobType !== 'All Job Types') {
        const jobT = (job.jobType || '').toLowerCase().replace(/[\s\-]/g, '');
        const targetT = selectedJobType.toLowerCase().replace(/[\s\-]/g, '');
        if (!jobT.includes(targetT)) {
          return false;
        }
      }

      // 5. Work Mode filter
      if (selectedWorkMode && selectedWorkMode !== 'All Work Modes') {
        const jobM = (job.workMode || '').toLowerCase();
        const targetM = selectedWorkMode.toLowerCase();
        if (jobM !== targetM) {
          return false;
        }
      }

      // 6. Experience filter
      if (selectedExp && selectedExp !== 'All Experience') {
        const expObj = EXPERIENCE_RANGES.find(e => e.label === selectedExp);
        if (expObj) {
          const min = job.expMin || 0;
          const max = job.expMax || 10;
          if (max < expObj.min || min > expObj.max) {
            return false;
          }
        }
      }

      // 7. Company filter
      if (selectedCompany && selectedCompany !== 'All Companies') {
        const jobComp = (job.company?.companyName || '').toLowerCase().trim();
        const targetComp = selectedCompany.toLowerCase().trim();
        if (!jobComp.includes(targetComp) && !targetComp.includes(jobComp)) {
          return false;
        }
      }

      return true;
    });

    // Guarantee that ACTIVE jobs appear first, and CLOSED jobs appear at the bottom
    return [...list].sort((a, b) => {
      const isClosedA = a.status === 'CLOSED';
      const isClosedB = b.status === 'CLOSED';
      if (isClosedA !== isClosedB) {
        return isClosedA ? 1 : -1;
      }

      // Dynamic sorting options
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
  }, [jobs, searchKeyword, selectedCategory, selectedLocation, selectedJobType, selectedWorkMode, selectedExp, selectedCompany, sortBy]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach(j => {
      const c = j.category || j.department;
      if (c) {
        map.set(c, (map.get(c) || 0) + 1);
      }
    });
    return map;
  }, [jobs]);

  const handleResetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSelectedJobType('All Job Types');
    setSelectedWorkMode('All Work Modes');
    setSelectedExp('All Experience');
    setSelectedCompany('All Companies');
    setSearchKeyword('');
    setSortBy('newest');
    router.push('/jobs');
  };

  const handleApplyClick = (job: Job) => {
    if (job.status === 'CLOSED' || appliedJobIds.has(job.id)) return;

    // Check all auth tokens & profiles
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const adminUser = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    let isAdmin = false;
    let isRecruiter = false;
    let isSeekerLoggedIn = false;
    let seekerId = 'TOR-JS-ME';

    if (adminToken && adminUser) {
      try {
        const parsed = JSON.parse(adminUser);
        if (parsed?.role === 'ADMIN') isAdmin = true;
      } catch (e) {}
    }

    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.role === 'ADMIN') {
          isAdmin = true;
        } else if (u?.role === 'RECRUITER' || u?.role === 'COMPANY') {
          isRecruiter = true;
        } else if (u?.role === 'JOB_SEEKER') {
          isSeekerLoggedIn = true;
          seekerId = u.seekerProfile?.id || (u.id ? `TOR-JS-${u.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
        }
      } catch (e) {}
    }

    // Client Requirement: If logged in as admin, show message instead of asking to login
    if (isAdmin) {
      setRoleNotice({
        title: 'Admin Access Notice',
        message: "You are already an admin, you can't apply to jobs.",
        role: 'ADMIN'
      });
      showToast("You are already an admin, you can't apply to jobs.");
      return;
    }

    // If logged in as recruiter / employer, inform them cleanly
    if (isRecruiter) {
      setRoleNotice({
        title: 'Employer Account Notice',
        message: "You are logged in as an employer / recruiter, you can't apply to jobs.",
        role: 'RECRUITER'
      });
      showToast("You are logged in as an employer, you can't apply to jobs.");
      return;
    }

    if (isSeekerLoggedIn) {
      // Already logged in as Job Seeker -> Open Apply Job Popup Modal right here
      setSelectedJobForApply(job);
      setApplyModalOpen(true);
    } else {
      // Not logged in -> Store pending job and open common login/register modal
      try {
        sessionStorage.setItem('torbit_pending_apply_job_id', job.id);
        localStorage.setItem('torbit_pending_apply_job_id', job.id);
      } catch (e) {}
      setAuthRole('JOB_SEEKER');
      setAuthTab('LOGIN');
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = (user: any) => {
    if (user?.role === 'JOB_SEEKER') {
      const seekerId = user.seekerProfile?.id || (user.id ? `TOR-JS-${user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
      const pendingJobId = typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null;
      if (pendingJobId) {
        try {
          sessionStorage.removeItem('torbit_pending_apply_job_id');
          localStorage.removeItem('torbit_pending_apply_job_id');
        } catch (e) {}
        window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
      } else {
        window.location.href = `/seeker/dashboard/${seekerId}`;
      }
    } else if (user?.role === 'RECRUITER' || user?.role === 'COMPANY') {
      const recId = user.companyProfile?.gstNumber || user.companyProfile?.id || user.id;
      window.location.href = recId ? `/recruiter/dashboard/${recId}` : '/recruiter/dashboard';
    } else if (user?.role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleOpenAuth = (role: 'JOB_SEEKER' | 'RECRUITER' | null = null, tab: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthRole(role);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const formatSalary = (min?: number, max?: number, hide?: boolean) => {
    if (hide || (!min && !max)) return 'Disclosed upon Shortlisting';
    const toLakhs = (val: number) => {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
      return `₹${val.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${toLakhs(min)} – ${toLakhs(max)}`;
    if (min) return `From ${toLakhs(min)}`;
    if (max) return `Up to ${toLakhs(max)}`;
    return 'Competitive in Industry';
  };

  const hasActiveFilters = 
    selectedCategory !== 'All Categories' || 
    selectedLocation !== 'All Locations' || 
    selectedJobType !== 'All Job Types' || 
    selectedWorkMode !== 'All Work Modes' || 
    selectedExp !== 'All Experience' || 
    selectedCompany !== 'All Companies' ||
    searchKeyword.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-20 lg:pb-0 font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={handleOpenAuth} />

      {/* Top Search & Filter Banner */}
      <section className="bg-[#0c1424] text-white py-6 sm:py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {selectedCompany !== 'All Companies' ? (
              <>
                <Link href="/companies" className="hover:text-white transition">Companies</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#b2c359] font-semibold truncate max-w-[200px]">
                  {selectedCompany}
                </span>
              </>
            ) : (
              <>
                <Link href="/categories" className="hover:text-white transition">Categories</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#b2c359] font-semibold truncate max-w-[200px]">
                  {selectedCategory !== 'All Categories' ? selectedCategory : 'All Jobs'}
                </span>
              </>
            )}
          </div>

          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {selectedCompany !== 'All Companies' ? (
                <>
                  Jobs at <span className="text-[#b2c359]">{selectedCompany}</span>
                </>
              ) : selectedCategory !== 'All Categories' ? (
                <>
                  <span className="text-[#b2c359]">{selectedCategory}</span> Jobs
                </>
              ) : (
                <>Explore Verified <span className="text-[#b2c359]">Career Opportunities</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {selectedCompany !== 'All Companies'
                ? `Exclusive verified job openings from ${selectedCompany}. Apply directly through our portal.`
                : 'Apply directly to top hiring companies, enterprises, and verified employers across India.'}
            </p>
          </div>

          {/* Integrated Multi-Filter Search Bar */}
          <div className="mt-4 sm:mt-6">
            <JobFilterBar
              keyword={searchKeyword}
              setKeyword={setSearchKeyword}
              location={selectedLocation}
              setLocation={setSelectedLocation}
              category={selectedCategory}
              setCategory={setSelectedCategory}
              jobType={selectedJobType}
              setJobType={setSelectedJobType}
              workMode={selectedWorkMode}
              setWorkMode={setSelectedWorkMode}
              onSubmit={handleFilterSubmit}
              id="jobs-filter-bar"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Mobile & Tablet Filter, Sort & Controls Toolbar */}
        <div className="lg:hidden mb-4 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Trigger Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 transition shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#658A0D]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-[#b2c359] text-slate-950 rounded-full">
                  Active
                </span>
              )}
            </button>

            {/* Mobile Sort Dropdown */}
            <div className="flex-1 relative flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-2.5 transition shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#658A0D] shrink-0 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Salary: High → Low</option>
                <option value="salary_low">Salary: Low → High</option>
                <option value="exp_low">Entry Level First</option>
                <option value="exp_high">Senior First</option>
                <option value="title_asc">Title: A to Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Quick Links & Count Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500 font-medium">
              Showing <b className="text-slate-900">{filteredJobs.length}</b> verified jobs
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/companies"
                className="text-slate-600 hover:text-[#658A0D] font-bold flex items-center gap-0.5 transition"
              >
                <span>Brands</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/categories"
                className="text-slate-600 hover:text-[#658A0D] font-bold flex items-center gap-0.5 transition"
              >
                <span>Categories</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Backdrop for Mobile/Tablet Filter Drawer */}
        {mobileFilterOpen && (
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: ADVANCED FILTERS */}
          {/* ========================================================= */}
          <aside className={`
            lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6
            ${mobileFilterOpen 
              ? 'block fixed inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 bottom-0 sm:bottom-auto sm:top-14 z-50 w-auto sm:w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-y-auto shadow-2xl border-t-2 sm:border border-[#b2c359] pb-6 animate-in slide-in-from-bottom sm:slide-in-from-top duration-200' 
              : 'hidden lg:block'}
          `}>
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-1 mb-2 lg:hidden" />

            {/* Header / Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#9eb047]" />
                <h3 className="font-bold text-sm text-slate-900">Filter Jobs</h3>
              </div>

              <div className="flex items-center gap-3">
                {(hasActiveFilters || sortBy !== 'newest') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-[#9eb047] hover:text-[#b2c359] flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                )}

                {/* Mobile Close */}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sort Selector in Sidebar */}
            <div className="space-y-2 pb-3 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#658A0D]" />
                  <span>Sort By</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium normal-case">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#b2c359] focus:bg-white transition cursor-pointer"
              >
                <option value="newest">Most Recent (Default)</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
                <option value="exp_low">Experience: Entry Level First</option>
                <option value="exp_high">Experience: Senior Level First</option>
                <option value="title_asc">Job Title: A to Z</option>
              </select>
            </div>

            {/* 1. Job Categories Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                Job Category
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All Categories')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                    selectedCategory === 'All Categories'
                      ? 'bg-[#b2c359]/15 text-slate-900 font-bold border border-[#b2c359]/40'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400">{jobs.length}</span>
                </button>

                {(DEPARTMENT_CATEGORIES as unknown as string[]).map((cat) => {
                  const count = categoryCounts.get(cat) || 0;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                        isSelected
                          ? 'bg-[#b2c359]/15 text-slate-900 font-bold border border-[#b2c359]/40'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate mr-2">{cat}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {count > 0 ? count : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Location Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                Location
              </label>
              <div className="space-y-1 text-xs">
                {TOP_LOCATIONS.slice(0, 6).map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Job Type Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                Job Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['All Job Types', 'Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => {
                  const isSelected = selectedJobType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedJobType(type)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-[#b2c359] text-[#080809] border-[#b2c359]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Experience Level Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                Experience Level
              </label>
              <div className="space-y-1 text-xs">
                {EXPERIENCE_RANGES.map((exp) => {
                  const isSelected = selectedExp === exp.label;
                  return (
                    <button
                      key={exp.label}
                      type="button"
                      onClick={() => setSelectedExp(exp.label)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{exp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Apply Sticky Bar */}
            {mobileFilterOpen && (
              <div className="sticky bottom-0 pt-3 bg-white/95 backdrop-blur-xs border-t border-slate-100 mt-4 flex items-center gap-2">
                {(hasActiveFilters || sortBy !== 'newest') && (
                  <button
                    onClick={handleResetFilters}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-[#080809] font-black text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Show {filteredJobs.length} Results
                </button>
              </div>
            )}
          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: JOB LISTINGS & RESULTS */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Results Header & Active Filter Pills */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {selectedCompany !== 'All Companies' 
                      ? `Jobs at ${selectedCompany}` 
                      : (selectedCategory !== 'All Categories' ? selectedCategory : 'Latest Job Opportunities')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> verified vacancies
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  {/* Desktop Sort Dropdown (Visible only on lg+) */}
                  <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 transition">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#658A0D] shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                    >
                      <option value="newest">Most Recent</option>
                      <option value="salary_high">Salary: High to Low</option>
                      <option value="salary_low">Salary: Low to High</option>
                      <option value="exp_low">Experience: Entry First</option>
                      <option value="exp_high">Experience: Senior First</option>
                      <option value="title_asc">Title: A to Z</option>
                    </select>
                  </div>

                  <Link
                    href="/companies"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#658A0D] hover:text-[#b2c359] px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition"
                  >
                    <span>All Brands</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/categories"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition"
                  >
                    <span>Categories</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Active Filter Pills */}
              {(hasActiveFilters || sortBy !== 'newest') && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Active:</span>

                  {sortBy !== 'newest' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-slate-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                      <ArrowUpDown className="w-3 h-3 text-amber-600" />
                      <span>
                        Sort: {
                          sortBy === 'salary_high' ? 'Salary: High → Low' :
                          sortBy === 'salary_low' ? 'Salary: Low → High' :
                          sortBy === 'exp_low' ? 'Entry Level First' :
                          sortBy === 'exp_high' ? 'Senior First' :
                          sortBy === 'title_asc' ? 'Title: A → Z' : sortBy
                        }
                      </span>
                      <button onClick={() => setSortBy('newest')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCompany !== 'All Companies' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b2c359]/20 text-slate-900 border border-[#b2c359]/40 rounded-lg text-[11px] font-bold">
                      <Building2 className="w-3 h-3 text-[#658A0D]" />
                      <span>Company: {selectedCompany}</span>
                      <button onClick={() => setSelectedCompany('All Companies')} className="text-slate-500 hover:text-red-500 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== 'All Categories' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-lime-50 text-slate-800 border border-lime-200 rounded-lg text-[11px] font-bold">
                      <span>Category: {selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('All Categories')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedLocation !== 'All Locations' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>Location: {selectedLocation}</span>
                      <button onClick={() => setSelectedLocation('All Locations')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedJobType !== 'All Job Types' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>Type: {selectedJobType}</span>
                      <button onClick={() => setSelectedJobType('All Job Types')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedExp !== 'All Experience' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>Exp: {selectedExp}</span>
                      <button onClick={() => setSelectedExp('All Experience')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {searchKeyword && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>&quot;{searchKeyword}&quot;</span>
                      <button onClick={() => setSearchKeyword('')} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-red-600 hover:underline ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Job Listings Feed */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#b2c359] rounded-full animate-spin mb-3"></div>
                <h3 className="text-sm font-bold text-slate-800">Loading career opportunities...</h3>
                <p className="text-xs text-slate-400 mt-1">Fetching matching openings from verified employers</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedCategory && selectedCategory !== 'All Categories'
                    ? `No jobs listed in ${selectedCategory}`
                    : selectedJobType && selectedJobType !== 'All Job Types'
                    ? `No ${selectedJobType} jobs listed`
                    : searchKeyword.trim()
                    ? `No jobs listed for "${searchKeyword}"`
                    : 'No jobs listed currently'}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {selectedCategory && selectedCategory !== 'All Categories'
                    ? `Currently there are no active job openings listed under ${selectedCategory}. You can browse other categories or view all jobs.`
                    : 'Currently there are no active vacancies matching your search criteria. Please check back soon or explore other categories.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    View All Jobs
                  </button>
                  <Link
                    href="/categories"
                    className="px-4 py-2.5 bg-[#b2c359] hover:bg-[#9eb047] text-[#080809] text-xs font-bold rounded-xl transition active:scale-95 shadow-xs"
                  >
                    Browse Categories
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredJobs.map((job) => {
                  const companyInitials = (job.company?.companyName || 'TR').substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJobForDetails(job);
                        setDetailsModalOpen(true);
                      }}
                      className="bg-white hover:bg-lime-50/20 p-5 rounded-2xl border border-slate-200/80 hover:border-[#b2c359] shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Company Logo + Titles */}
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-800 font-black text-xs shrink-0 shadow-xs overflow-hidden group-hover:scale-105 transition-transform p-1">
                            {job.company?.logoUrl ? (
                              <img
                                src={job.company.logoUrl}
                                alt={job.company.companyName || 'Company'}
                                className="max-h-9 max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.jobs-logo-fallback');
                                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              style={{ display: job.company?.logoUrl ? 'none' : 'flex' }}
                              className="jobs-logo-fallback w-full h-full items-center justify-center bg-slate-900 text-[#b2c359] font-black text-sm rounded-lg"
                            >
                              {companyInitials}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#9eb047] transition leading-snug">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 font-medium flex-wrap">
                              <span className="font-semibold text-slate-800 truncate">
                                {job.company?.companyName || 'Verified Employer'}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#9eb047] shrink-0" />
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 truncate">
                                {job.category || job.department || 'General'}
                              </span>
                              {job.status === 'CLOSED' ? (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                    Closed
                                  </span>
                                </>
                              ) : appliedJobIds.has(job.id) ? (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Applied
                                  </span>
                                </>
                              ) : null}
                            </div>

                            {/* Badges / Meta Pills */}
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{job.location || 'India'}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{job.expMin}–{job.expMax} Yrs Exp</span>
                              </span>

                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{formatSalary(job.salaryMin, job.salaryMax, job.hideSalary)}</span>
                              </span>

                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                {job.jobType || 'Full-time'}
                              </span>
                            </div>

                            {/* Snippet */}
                            {job.description && (
                              <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                {job.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions (Apply CTA) */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-end sm:justify-start gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 w-full sm:w-auto">
                          {job.status === 'CLOSED' ? (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-xl shadow-none cursor-not-allowed whitespace-nowrap"
                              title="Applications are closed for this position"
                            >
                              <span>Closed</span>
                            </button>
                          ) : appliedJobIds.has(job.id) ? (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-xl shadow-none cursor-default flex items-center gap-1.5 whitespace-nowrap"
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
                                handleApplyClick(job);
                              }}
                              className="bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-[#080809] font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <span>Quick Apply</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <MobileBottomBar onOpenAuth={handleOpenAuth} />

      {/* Reusable Job Details Modal */}
      {selectedJobForDetails && (
        <JobDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          job={selectedJobForDetails}
          isApplied={appliedJobIds.has(selectedJobForDetails.id)}
          onApply={(job) => {
            setDetailsModalOpen(false);
            handleApplyClick(job);
          }}
        />
      )}

      {selectedJobForApply && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobForApply}
          currentUser={currentUser}
          onApplicationSubmitted={() => {
            setApplyModalOpen(false);
            fetchJobsData();
            fetchUserApplications();
          }}
        />
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultRole={authRole}
        defaultTab={authTab}
        onSuccess={handleAuthSuccess}
      />

      {/* Admin / Employer Role Notice Modal */}
      {roleNotice && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setRoleNotice(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {roleNotice.title}
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {roleNotice.message}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setRoleNotice(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Dismiss
              </button>
              <Link
                href={roleNotice.role === 'ADMIN' ? '/admin/dashboard' : '/recruiter/dashboard'}
                onClick={() => setRoleNotice(null)}
                className="flex-1 py-2.5 px-4 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 text-xs font-black rounded-xl transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-[#080809] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
          <AlertCircle className="text-amber-400 w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#0c1424] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#b2c359] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JobsContent />
    </React.Suspense>
  );
}
