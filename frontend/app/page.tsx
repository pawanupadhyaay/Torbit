'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, AlertCircle } from 'lucide-react';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import HeroSection from '@/common/HeroSection';
import PopularCategories from '@/common/PopularCategories';
import FeaturedJobs from '@/common/FeaturedJobs';
import RightSidebar from '@/common/RightSidebar';
import AuthModal from '@/common/AuthModal';
import ApplyJobModal from '@/job-seeker/ApplyJobModal';
import JobDetailsModal from '@/common/JobDetailsModal';
import MobileBottomBar from '@/common/MobileBottomBar';

export default function HomePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Role Notice Modal & Toast state (for Admin / Recruiter attempting to apply)
  const [roleNotice, setRoleNotice] = useState<{ title: string; message: string; role: 'ADMIN' | 'RECRUITER' } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUserApplications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!token || !userStr) return;
      const u = JSON.parse(userStr);
      if (u?.role !== 'JOB_SEEKER') return;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';
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
    } catch (e) {}
  };

  const fetchJobs = async (params = {}) => {
    setIsLoadingJobs(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';
      const qs = new URLSearchParams(params as any).toString();
      const res = await fetch(`${apiBase}/jobs?${qs}`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    // ⚡ Instant Cache Hydration on Mount (0ms visual render)
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('torbitHomeSnapshot') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jobs) setJobs(parsed.jobs);
        if (parsed.categories) setCategories(parsed.categories);
      }
    } catch (e) {}

    fetchJobs();
    fetchUserApplications();

    // Hydrate current user state across tabs
    const syncUser = () => {
      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const adminUser = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        if (adminToken && adminUser) {
          try {
            const u = JSON.parse(adminUser);
            if (u?.role === 'ADMIN') {
              setCurrentUser(u);
              return;
            }
          } catch (e) {}
        }

        if (token && userStr) {
          try {
            const u = JSON.parse(userStr);
            setCurrentUser(u);
            return;
          } catch (e) {}
        }

        setCurrentUser(null);
      } catch (e) {}
    };

    syncUser();

    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    document.addEventListener('visibilitychange', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
      document.removeEventListener('visibilitychange', syncUser);
    };
  }, [router]);

  const handleOpenAuth = (role: 'JOB_SEEKER' | 'RECRUITER' | null = null, tab: 'LOGIN' | 'REGISTER' = 'REGISTER') => {
    setAuthRole(role);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleOpenDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setJobDetailsOpen(true);
  };

  const handleOpenApply = (job: any) => {
    if (job?.status === 'CLOSED' || appliedJobIds.has(job?.id)) return;

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
      // Already logged in as Job Seeker -> Redirect directly to job application form
      window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(job.id)}`;
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
    setCurrentUser(user);
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 font-['Helvetica',Arial,sans-serif]">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center shadow-xl border border-white/10">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-[#b2c359]" />
            <span className="text-sm font-medium tracking-wide">Checking your session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-16 lg:pb-0">
      <Header onOpenAuth={handleOpenAuth} currentUser={currentUser} />

      <HeroSection 
        categories={categories} 
        onSearch={(params) => fetchJobs(params)} 
        onOpenAuth={handleOpenAuth} 
      />

      <main className="max-w-7xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <PopularCategories 
              categories={categories} 
              onSelectCategory={(catName) => fetchJobs(catName === 'All Categories' ? {} : { category: catName })} 
              isLoading={isLoadingJobs}
            />
            <FeaturedJobs 
              jobs={jobs} 
              onApply={handleOpenApply}
              onViewDetails={handleOpenDetails}
              appliedJobIds={appliedJobIds}
              isLoading={isLoadingJobs}
            />
          </div>

          <div className="lg:col-span-4">
            <RightSidebar onOpenAuth={handleOpenAuth} />
          </div>
        </div>
      </main>

      <Footer />

      {/* App-like Sticky Mobile Bottom Bar */}
      <MobileBottomBar onOpenAuth={handleOpenAuth} />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultRole={authRole}
        defaultTab={authTab}
        onSuccess={handleAuthSuccess}
      />

      {/* Reusable Job Details Modal */}
      {selectedJobForDetails && (
        <JobDetailsModal
          isOpen={jobDetailsOpen}
          onClose={() => setJobDetailsOpen(false)}
          job={selectedJobForDetails}
          isApplied={appliedJobIds.has(selectedJobForDetails.id)}
          onApply={handleOpenApply}
        />
      )}

      {selectedJob && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJob}
          currentUser={currentUser}
          onApplicationSubmitted={() => {
            fetchJobs();
            fetchUserApplications();
          }}
        />
      )}
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