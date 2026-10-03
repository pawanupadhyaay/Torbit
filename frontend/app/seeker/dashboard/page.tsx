'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SeekerSidebar from '@/job-seeker/SeekerSidebar';
import SeekerTopbar from '@/job-seeker/SeekerTopbar';
import SeekerOverview from '@/job-seeker/SeekerOverview';
import SeekerApplicationsTable from '@/job-seeker/SeekerApplicationsTable';
import SeekerProfileSection from '@/job-seeker/SeekerProfileSection';
import SeekerBrowseJobs from '@/job-seeker/SeekerBrowseJobs';
import SeekerJobAlerts from '@/job-seeker/SeekerJobAlerts';
import JobApplicationView from '@/job-seeker/JobApplicationView';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

import { calculateSeekerProfileScore } from '@/lib/constants';
import Footer from '@/common/Footer';

export default function SeekerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);

  const [seenAppliedCount, setSeenAppliedCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('torbit_seeker_seen_apps');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  const isFetchingRef = useRef(false);
  const lastFetchedAtRef = useRef<number>(Date.now());

  // Calculate unread/unseen applications count
  const unreadAppliedCount = Math.max(0, applications.length - seenAppliedCount);

  // Clear badge when seeker views APPLICATIONS tab
  useEffect(() => {
    if (activeTab === 'APPLICATIONS' && applications.length > 0) {
      setSeenAppliedCount(applications.length);
      try {
        localStorage.setItem('torbit_seeker_seen_apps', String(applications.length));
      } catch (e) {}
    }
  }, [activeTab, applications.length]);

  const handleTabChange = useCallback((tab: string) => {
    setApplyingJob(null);
    if (tab === 'APPLICATIONS') {
      setSeenAppliedCount(applications.length);
      try {
        localStorage.setItem('torbit_seeker_seen_apps', String(applications.length));
      } catch (e) {}
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }, [applications.length]);

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('torbit_remember_me');
      localStorage.removeItem('torbit_last_active_role');
      localStorage.removeItem('torbit_session_saved_at');
      try { sessionStorage.clear(); } catch (e) {}
      window.location.href = '/?auth=login&role=seeker';
    }
  }, []);

  const loadData = useCallback(async (manual = false) => {
    if (isFetchingRef.current && !manual) return;
    try {
      isFetchingRef.current = true;
      if (manual) setIsRefreshing(true);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setLoading(false);
        handleLogout();
        return;
      }

      const headers: any = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const [meRes, appRes, jobsRes] = await Promise.allSettled([
        fetch(`${apiBase}/auth/me`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/applications`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/jobs`).then(r => r.ok ? r.json() : null)
      ]);

      let fetchedUser = meRes.status === 'fulfilled' && meRes.value?.user ? meRes.value.user : null;
      if (!fetchedUser) {
        // Fallback to locally cached user so session is never lost on network blips
        const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (cachedUserStr) {
          try {
            fetchedUser = JSON.parse(cachedUserStr);
          } catch (e) {}
        }
      }

      if (!fetchedUser) {
        if (!token) {
          setLoading(false);
          handleLogout();
          return;
        }
      } else {
        try { localStorage.setItem('user', JSON.stringify(fetchedUser)); } catch (e) {}
      }

      // If recruiter user visits seeker dashboard, redirect to recruiter dashboard
      if (fetchedUser.role === 'RECRUITER' || fetchedUser.role === 'COMPANY') {
        window.location.href = '/recruiter/dashboard';
        return;
      }

      const fetchedApps = appRes.status === 'fulfilled' && Array.isArray(appRes.value?.applications) ? appRes.value.applications : [];
      const fetchedJobs = jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs) ? jobsRes.value.jobs : [];

      setUser(fetchedUser);
      setApplications(fetchedApps);
      setRecommendedJobs(fetchedJobs);
      lastFetchedAtRef.current = Date.now();

      // Industry Standard: Dynamically sync canonical unique Candidate ID to URL
      const seekerIdentifier = fetchedUser.seekerProfile?.id || (fetchedUser.id ? `TOR-JS-${fetchedUser.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
      if (typeof window !== 'undefined' && window.location.pathname === '/seeker/dashboard') {
        window.history.replaceState(null, '', `/seeker/dashboard/${seekerIdentifier}`);
      }

      // Save snapshot for next instant load
      try {
        sessionStorage.setItem('torbitSeekerSnapshot', JSON.stringify({
          user: fetchedUser,
          applications: fetchedApps,
          recommendedJobs: fetchedJobs
        }));
      } catch (cacheErr) {}
    } catch (err) {
      console.error('Error fetching seeker data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [handleLogout]);

  // Hydrate from storage on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    try {
      const cached = sessionStorage.getItem('torbitSeekerSnapshot');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.user) setUser(parsed.user);
        if (Array.isArray(parsed.applications)) setApplications(parsed.applications);
        if (Array.isArray(parsed.recommendedJobs)) setRecommendedJobs(parsed.recommendedJobs);
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser && !cached) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {}

    loadData();

    // Check if coming from a pending job apply or query parameter
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetJobId = urlParams.get('applyJobId') || 
                          sessionStorage.getItem('torbit_pending_apply_job_id') || 
                          localStorage.getItem('torbit_pending_apply_job_id');

      if (targetJobId) {
        try {
          sessionStorage.removeItem('torbit_pending_apply_job_id');
          localStorage.removeItem('torbit_pending_apply_job_id');
        } catch (e) {}

        if (urlParams.has('applyJobId')) {
          urlParams.delete('applyJobId');
          const cleanUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
          window.history.replaceState({}, '', cleanUrl);
        }

        const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
          : '/api';

        fetch(`${apiBase}/jobs/${targetJobId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.job) {
              setApplyingJob(data.job);
            }
          })
          .catch((err) => {
            console.error('Error fetching job for application form:', err);
          });
      }
    } catch (e) {}

    // Enterprise Smart Polling: 8s interval, only when tab is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 8000);

    // Instant smart sync on window focus/tab switch (throttled to at most once per 3 seconds)
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetchedAtRef.current;
        if (timeSinceLast > 3000) {
          loadData(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [loadData]);

  const handleProfileUpdated = (updatedProfile: any) => {
    setUser((prev: any) => ({
      ...prev,
      seekerProfile: updatedProfile
    }));
  };

  const profile = user?.seekerProfile || {
    fullName: user?.fullName || user?.email?.split('@')[0] || '',
    phone: user?.phone || '',
    location: '',
    experience: '',
    qualification: '',
    currentSalary: null,
    expectedSalary: null,
  };

  const currentScore = profile.profileCompleted !== undefined && profile.profileCompleted !== null
    ? profile.profileCompleted
    : (user ? calculateSeekerProfileScore(profile) : 0);

  const initials = (profile.fullName || user?.email || 'JS')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const mobileNavGroups = [
    {
      group: 'CANDIDATE WORKSPACE',
      items: [
        {
          id: 'OVERVIEW',
          label: 'Dashboard Overview',
          icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
        },
        {
          id: 'BROWSE',
          label: 'Browse Job Listings',
          icon: <SearchOutlinedIcon sx={{ fontSize: 20 }} className="text-teal-400" />
        },
        {
          id: 'APPLICATIONS',
          label: 'Applied Jobs',
          icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} className="text-[#b2c359]" />,
          badge: unreadAppliedCount > 0 ? unreadAppliedCount : null
        },
        {
          id: 'ALERTS',
          label: 'Job Alerts & Notifications',
          icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-400" />
        }
      ]
    },
    {
      group: 'ACCOUNT & SETTINGS',
      items: [
        {
          id: 'PROFILE',
          label: 'My Career Profile',
          icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-400" />,
          badge: `${currentScore}%`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif] antialiased text-slate-900 selection:bg-[#b2c359]/20">
      
      {/* ========================================================= */}
      {/* 1. MOBILE SLIDE-OUT DRAWER OVERLAY (Exact Admin/Recruiter Match) */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div
            className="w-4/5 max-w-xs bg-[#16181D] text-gray-300 flex flex-col justify-between h-full shadow-2xl border-r border-gray-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-[#121418]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#b2c359] flex items-center justify-center text-[#080809] font-black">
                  T
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-wide text-white">TORBIT</span>
                  <span className="bg-[#b2c359] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                    SEEKER
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                title="Close Navigation"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Drawer Navigation Menu Items */}
            <nav className="p-4 space-y-5 overflow-y-auto flex-1">
              {mobileNavGroups.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  {group.group && (
                    <div className="px-3 text-[10px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
                      {group.group}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#b2c359]/15 text-[#b2c359] shadow-xs'
                            : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            suppressHydrationWarning
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            typeof item.badge === 'number'
                              ? 'bg-[#DC2626] text-white shadow-xs'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Drawer Footer Profile & Logout */}
            <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-8 h-8 rounded-xl object-cover border border-[#b2c359]/50 shadow-xs shrink-0"
                  />
                ) : (
                  <div suppressHydrationWarning className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 text-[#b2c359] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {initials || 'JS'}
                  </div>
                )}
                <div className="min-w-0">
                  <div suppressHydrationWarning className="text-xs font-bold text-white truncate">{profile.fullName}</div>
                  <div suppressHydrationWarning className="text-[10px] text-gray-400 truncate">{user?.email || 'candidate@torbit.in'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/15 transition flex items-center justify-center shrink-0 cursor-pointer"
              >
                <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Desktop Left Sidebar */}
      <SeekerSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        appliedCount={unreadAppliedCount}
        profileName={profile.fullName}
        profileEmail={user?.email || 'candidate@torbit.in'}
        profileScore={currentScore}
        avatarUrl={profile.avatarUrl}
      />

      {/* 3. Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <SeekerTopbar
          activeTab={activeTab}
          profileName={profile.fullName}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogoClick={() => handleTabChange('OVERVIEW')}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 pb-12">
          {applyingJob ? (
            <JobApplicationView
              job={applyingJob}
              currentUser={user}
              onBack={() => setApplyingJob(null)}
              onApplicationSubmitted={() => {
                setApplyingJob(null);
                loadData(true);
              }}
              onViewApplications={() => {
                setApplyingJob(null);
                handleTabChange('APPLICATIONS');
              }}
            />
          ) : (
            <>
              {activeTab === 'OVERVIEW' && (
                <SeekerOverview
                  profile={profile}
                  applications={applications}
                  recommendedJobs={recommendedJobs}
                  setActiveTab={handleTabChange}
                  loading={loading}
                />
              )}

              {activeTab === 'PROFILE' && (
                <SeekerProfileSection profile={profile} onProfileUpdated={handleProfileUpdated} />
              )}

              {activeTab === 'BROWSE' && (
                <SeekerBrowseJobs
                  currentUser={user}
                  applications={applications}
                  onApplicationSubmitted={() => loadData(true)}
                />
              )}

              {activeTab === 'APPLICATIONS' && (
                <SeekerApplicationsTable applications={applications} />
              )}

              {activeTab === 'ALERTS' && (
                <SeekerJobAlerts />
              )}
            </>
          )}
        </main>

        {/* Unified Official Footer with Trust Strip */}
        <Footer />
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM 5-ITEM NAVIGATION DOCK (Exact Admin/Recruiter Match) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#16181D]/98 backdrop-blur-lg border-t border-slate-800/90 px-3 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => handleTabChange('OVERVIEW')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'OVERVIEW' ? 'text-[#b2c359] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'OVERVIEW' ? 'bg-[#b2c359]/15' : ''}`}>
            <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* 2. Browse Jobs */}
        <button
          type="button"
          onClick={() => handleTabChange('BROWSE')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'BROWSE' ? 'text-[#b2c359] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'BROWSE' ? 'bg-[#b2c359]/15' : ''}`}>
            <SearchOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Jobs</span>
        </button>

        {/* 3. Applied Jobs */}
        <button
          type="button"
          onClick={() => handleTabChange('APPLICATIONS')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'APPLICATIONS' ? 'text-[#b2c359] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all relative ${activeTab === 'APPLICATIONS' ? 'bg-[#b2c359]/15' : ''}`}>
            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} />
            {unreadAppliedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#16181D]">
                {unreadAppliedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Applied</span>
        </button>

        {/* 4. Profile */}
        <button
          type="button"
          onClick={() => handleTabChange('PROFILE')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-[#b2c359] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'PROFILE' ? 'bg-[#b2c359]/15' : ''}`}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>

        {/* 5. More / Menu */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALERTS' ? 'text-[#b2c359] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'ALERTS' ? 'bg-[#b2c359]/15' : ''}`}>
            <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
}