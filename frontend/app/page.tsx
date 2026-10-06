'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

    // Hydrate current user state without auto-redirecting away from common dashboard
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const adminUser = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

      if (stored && token) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
        } catch (e) {}
      } else if (adminUser && adminToken) {
        try {
          const u = JSON.parse(adminUser);
          setCurrentUser(u);
        } catch (e) {}
      }
    } catch (e) {}
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

    // Check if user is already logged in as a JOB_SEEKER
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let isSeekerLoggedIn = false;
    let seekerId = 'TOR-JS-ME';

    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.role === 'JOB_SEEKER') {
          isSeekerLoggedIn = true;
          seekerId = u.seekerProfile?.id || (u.id ? `TOR-JS-${u.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
        }
      } catch (e) {}
    }

    if (isSeekerLoggedIn) {
      // Already logged in as Job Seeker -> Redirect directly to job application form
      window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(job.id)}`;
    } else {
      // Not logged in or not a job seeker -> Store pending job and open common login/register modal
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
    </div>
  );
}