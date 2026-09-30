'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

export default function HomePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchJobs = async (params = {}) => {
    try {
      const qs = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/jobs?${qs}`);
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Check saved session in browser
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const isExplicitHome = params.get('view') === 'home';

      if (stored && token && !isExplicitHome) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.role === 'JOB_SEEKER') {
          router.replace('/seeker/dashboard');
          return;
        } else if (u.role === 'RECRUITER') {
          router.replace('/recruiter/dashboard');
          return;
        } else if (u.role === 'ADMIN') {
          router.replace('/admin/dashboard');
          return;
        }
      }

      if (token && !isExplicitHome) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data.user) {
              setCurrentUser(data.user);
              if (data.user.role === 'JOB_SEEKER') {
                router.replace('/seeker/dashboard');
                return;
              } else if (data.user.role === 'RECRUITER') {
                router.replace('/recruiter/dashboard');
                return;
              } else if (data.user.role === 'ADMIN') {
                router.replace('/admin/dashboard');
                return;
              }
            }
            setIsCheckingAuth(false);
          })
          .catch(() => setIsCheckingAuth(false));
      } else {
        setIsCheckingAuth(false);
      }
    } catch (e) {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleOpenAuth = (role: 'JOB_SEEKER' | 'RECRUITER' | null = null, tab: 'LOGIN' | 'REGISTER' = 'REGISTER') => {
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
    if (user?.role === 'JOB_SEEKER') {
      router.push('/seeker/dashboard');
    } else if (user?.role === 'RECRUITER') {
      router.push('/recruiter/dashboard');
    } else if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7CB342] to-[#9CCC65] flex items-center justify-center shadow-lg shadow-[#7CB342]/20 animate-pulse">
            <span className="text-white font-black text-2xl tracking-tighter">TR</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-[#7CB342]" />
            <span className="text-sm font-medium tracking-wide">Checking your session...</span>
          </div>
        </div>
      </div>
    );
  }

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