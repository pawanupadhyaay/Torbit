'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopTicker from '@/common/TopTicker';
import Header from '@/common/Header';
import Navbar from '@/common/Navbar';
import Footer from '@/common/Footer';
import HeroSection from '@/common/HeroSection';
import PopularCategories from '@/common/PopularCategories';
import FeaturedJobs from '@/common/FeaturedJobs';
import RightSidebar from '@/common/RightSidebar';
import AuthModal from '@/common/AuthModal';
import ApplyJobModal from '@/job-seeker/ApplyJobModal';
import MobileBottomBar from '@/common/MobileBottomBar';

export default function RecruiterPortalRootPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '/api';

  // 0ms instant snapshot cache hydration on mount
  useEffect(() => {
    try {
      const cachedJobs = sessionStorage.getItem('torbitFeaturedJobs');
      const cachedCats = sessionStorage.getItem('torbitCategories');
      if (cachedJobs) setJobs(JSON.parse(cachedJobs));
      if (cachedCats) setCategories(JSON.parse(cachedCats));
    } catch (e) {
      console.error('Snapshot hydration error:', e);
    }
  }, []);

  const fetchJobs = async (params = {}) => {
    try {
      const qs = new URLSearchParams(params as any).toString();
      const res = await fetch(`${apiBase}/jobs?${qs}`);
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        try { sessionStorage.setItem('torbitFeaturedJobs', JSON.stringify(data.jobs)); } catch (e) {}
      }
      if (data.categories) {
        setCategories(data.categories);
        try { sessionStorage.setItem('torbitCategories', JSON.stringify(data.categories)); } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const checkUser = async () => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const isExplicitHome = params.get('view') === 'home';

      // 1. Check local session: if already logged in as RECRUITER, open recruiter dashboard
      if (stored && token) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.role === 'RECRUITER' && !isExplicitHome) {
          router.replace('/dashboard');
          return;
        }
      }

      // 2. Validate with backend session
      if (token) {
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.role === 'RECRUITER' && !isExplicitHome) {
            router.replace('/dashboard');
            return;
          }
        }
      }
    } catch (e) {
      console.error('Error checking user session:', e);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    checkUser();
  }, []);

  const handleOpenAuth = (role: 'JOB_SEEKER' | 'RECRUITER' | null = null, tab: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthRole(role);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleOpenApply = (job: any) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    if (user?.role === 'RECRUITER') {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-16 lg:pb-0">
      <TopTicker />
      <Header onOpenAuth={handleOpenAuth} />
      <Navbar />

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
            />
            <FeaturedJobs
              jobs={jobs}
              onApply={handleOpenApply}
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

      {selectedJob && (
        <ApplyJobModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJob}
          currentUser={currentUser}
          onApplicationSubmitted={() => fetchJobs()}
        />
      )}
    </div>
  );
}
