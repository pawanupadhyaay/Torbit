'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SeekerSidebar from '@/job-seeker/SeekerSidebar';
import SeekerTopbar from '@/job-seeker/SeekerTopbar';
import SeekerOverview from '@/job-seeker/SeekerOverview';
import SeekerApplicationsTable from '@/job-seeker/SeekerApplicationsTable';
import SeekerProfileSection from '@/job-seeker/SeekerProfileSection';
import SeekerSavedJobs from '@/job-seeker/SeekerSavedJobs';
import SeekerBrowseJobs from '@/job-seeker/SeekerBrowseJobs';
import SeekerJobAlerts from '@/job-seeker/SeekerJobAlerts';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

import { calculateSeekerProfileScore } from '@/lib/constants';

export default function SeekerDashboardPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFetchingRef = useRef(false);
  const lastFetchedAtRef = useRef<number>(Date.now());

  const loadData = useCallback(async (manual = false) => {
    if (isFetchingRef.current && !manual) return;
    try {
      isFetchingRef.current = true;
      if (manual) setIsRefreshing(true);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [meRes, appRes, jobsRes] = await Promise.allSettled([
        fetch('/api/auth/me', { headers }).then(r => r.json()),
        fetch('/api/applications', { headers }).then(r => r.json()),
        fetch('/api/jobs').then(r => r.json())
      ]);

      if (meRes.status === 'fulfilled' && meRes.value?.user) {
        setUser(meRes.value.user);
      }
      if (appRes.status === 'fulfilled' && Array.isArray(appRes.value?.applications)) {
        setApplications(appRes.value.applications);
      }
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs)) {
        setRecommendedJobs(jobsRes.value.jobs);
      }
      lastFetchedAtRef.current = Date.now();
    } catch (err) {
      console.error('Error fetching seeker data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();

    // Enterprise Smart Polling: 20s interval, only when tab is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 20000);

    // Instant smart sync on window focus/tab switch (throttled to at most once per 8 seconds)
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetchedAtRef.current;
        if (timeSinceLast > 8000) {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const profile = user?.seekerProfile || {
    fullName: user?.fullName || 'Registered Candidate',
    phone: user?.phone || 'Not Provided',
    location: 'India',
    experience: 'Fresher',
    qualification: 'Graduate',
    currentSalary: null,
    expectedSalary: null,
  };

  const currentScore = profile.profileCompleted !== undefined && profile.profileCompleted !== null
    ? profile.profileCompleted
    : calculateSeekerProfileScore(profile);

  const initials = (profile.fullName || 'CA')
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
          icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} className="text-[#94C322]" />,
          badge: applications.length > 0 ? applications.length : null
        },
        {
          id: 'SAVED',
          label: 'Saved Jobs',
          icon: <BookmarkBorderOutlinedIcon sx={{ fontSize: 20 }} className="text-red-400" />
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
    <div className="min-h-screen flex bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif] antialiased text-slate-900 selection:bg-[#94C322]/20">
      
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
                <div className="w-7 h-7 rounded-lg bg-[#94C322] flex items-center justify-center text-[#080809] font-black">
                  T
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-wide text-white">TORBIT</span>
                  <span className="bg-[#94C322] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
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
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#94C322]/15 text-[#94C322] shadow-xs'
                            : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
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
                    className="w-8 h-8 rounded-xl object-cover border border-[#94C322]/50 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 text-[#94C322] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {initials || 'JS'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{profile.fullName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{user?.email || 'candidate@torbit.in'}</div>
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
        setActiveTab={setActiveTab}
        appliedCount={applications.length}
        profileName={profile.fullName}
        profileEmail={user?.email || 'candidate@torbit.in'}
        profileScore={currentScore}
        avatarUrl={profile.avatarUrl}
      />

      {/* 3. Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 md:pb-6">
        <SeekerTopbar
          activeTab={activeTab}
          profileName={profile.fullName}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogoClick={() => setActiveTab('OVERVIEW')}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {activeTab === 'OVERVIEW' && (
            <SeekerOverview
              profile={profile}
              applications={applications}
              recommendedJobs={recommendedJobs}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'PROFILE' && (
            <SeekerProfileSection profile={profile} onProfileUpdated={handleProfileUpdated} />
          )}

          {activeTab === 'BROWSE' && (
            <SeekerBrowseJobs
              currentUser={user}
              onApplicationSubmitted={() => loadData(true)}
            />
          )}

          {activeTab === 'APPLICATIONS' && (
            <SeekerApplicationsTable applications={applications} />
          )}

          {activeTab === 'SAVED' && (
            <SeekerSavedJobs />
          )}

          {activeTab === 'ALERTS' && (
            <SeekerJobAlerts />
          )}
        </main>

        {/* Exact Standard Dark Footer */}
        <footer className="w-full bg-[#080809] text-white py-3.5 border-t border-neutral-900 text-center text-xs text-neutral-400 font-medium shrink-0 mt-auto">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Candidate &amp; Job Seeker Portal.</span>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM 5-ITEM NAVIGATION DOCK (Exact Admin/Recruiter Match) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#16181D]/98 backdrop-blur-lg border-t border-slate-800/90 px-3 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'OVERVIEW' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'OVERVIEW' ? 'bg-[#94C322]/15' : ''}`}>
            <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* 2. Browse Jobs */}
        <button
          type="button"
          onClick={() => setActiveTab('BROWSE')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'BROWSE' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'BROWSE' ? 'bg-[#94C322]/15' : ''}`}>
            <SearchOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Jobs</span>
        </button>

        {/* 3. Applied Jobs */}
        <button
          type="button"
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'APPLICATIONS' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all relative ${activeTab === 'APPLICATIONS' ? 'bg-[#94C322]/15' : ''}`}>
            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} />
            {applications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#16181D]">
                {applications.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Applied</span>
        </button>

        {/* 4. Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'PROFILE' ? 'bg-[#94C322]/15' : ''}`}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>

        {/* 5. More / Menu */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'SAVED' || activeTab === 'ALERTS' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'SAVED' || activeTab === 'ALERTS' ? 'bg-[#94C322]/15' : ''}`}>
            <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
}