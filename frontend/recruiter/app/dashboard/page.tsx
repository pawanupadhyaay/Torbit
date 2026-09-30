'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import RecruiterSidebar from '../../RecruiterSidebar';
import RecruiterTopbar from '../../RecruiterTopbar';
import RecruiterOverview from '../../RecruiterOverview';
import RecruiterJobsTable from '../../RecruiterJobsTable';
import ApplicantReviewPipeline from '../../ApplicantReviewPipeline';
import CompanyProfileSettings from '../../CompanyProfileSettings';
import CreateJobModal from '../../CreateJobModal';
import CreateJobView from '../../CreateJobView';

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        fetch('/api/jobs/my/listings', { headers }).then(r => r.json())
      ]);

      if (meRes.status === 'fulfilled' && meRes.value?.user) {
        setUser(meRes.value.user);
      }
      if (appRes.status === 'fulfilled' && Array.isArray(appRes.value?.applications)) {
        setApplications(appRes.value.applications);
      }
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs)) {
        setJobs(jobsRes.value.jobs);
      }
      lastFetchedAtRef.current = Date.now();
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();

    // Enterprise Smart Polling: 25s interval, only when browser tab is actively visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 25000);

    // Instant smart sync on window focus/tab switch (throttled to at most once per 10 seconds)
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetchedAtRef.current;
        if (timeSinceLast > 10000) {
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/');
  };

  const company = user?.companyProfile || {
    companyName: user?.companyName || user?.email?.split('@')[0] || 'My Company',
    workEmail: user?.email || '',
    phone: '',
    gstNumber: '',
    hqLocation: '',
    industry: 'Real Estate',
    status: user?.companyStatus || user?.status || 'PENDING',
    verifiedAt: null
  };

  const isApproved = company.status === 'APPROVED';

  const handleUpdateApplicantStatus = async (applicationId: string, status: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ applicationId, status })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mobileNavGroups = [
    {
      group: '',
      items: [
        { id: 'OVERVIEW', label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} /> },
        { id: 'CREATE_JOB', label: '+ Create Job', icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-[#94C322]" /> },
        { id: 'JOBS', label: 'My Job Listings', icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 20 }} /> },
        {
          id: 'APPLICANTS',
          label: 'Applications',
          icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-500" />,
          badge: applications.length > 0 ? applications.length : null
        },
        { id: 'PROFILE', label: 'Company Profile', icon: <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} /> },
        { id: 'SETTINGS', label: 'Settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} className="text-cyan-400" /> },
      ]
    }
  ];

  const userInitials = (company.companyName || 'RE')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif] text-slate-900 antialiased selection:bg-[#94C322]/20">
      
      {/* ========================================================= */}
      {/* 1. MOBILE SLIDE-OUT DRAWER OVERLAY (Exact Admin Panel Match) */}
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
                    RECRUITER
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-5 overflow-y-auto flex-1">
              {mobileNavGroups.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  {group.group && (
                    <div className="px-3 text-[10px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
                      {group.group}
                    </div>
                  )}
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        activeTab === item.id
                          ? 'bg-[#94C322]/15 text-[#94C322] shadow-xs'
                          : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </nav>

            {/* Bottom Profile & Logout */}
            <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 text-[#94C322] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{company.companyName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{company.workEmail || 'Recruiter'}</div>
                </div>
              </div>
              <button
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
      <RecruiterSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isApproved={isApproved}
        companyName={company.companyName}
        workEmail={company.workEmail}
        applicantCount={applications.length}
      />

      {/* 3. Main Workspace with Exact Admin Responsive Padding */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 md:pb-6">
        {/* Exact Admin Panel Top Header */}
        <RecruiterTopbar
          activeTab={activeTab}
          isApproved={isApproved}
          companyName={company.companyName}
          onOpenCreateJob={() => setCreateJobModalOpen(true)}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {activeTab === 'OVERVIEW' && (
            <RecruiterOverview
              company={company}
              jobs={jobs}
              applications={applications}
              onOpenCreateJob={() => setActiveTab('CREATE_JOB')}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'CREATE_JOB' && (
            <CreateJobView
              isApproved={isApproved}
              companyStatus={company.status}
              onJobCreated={() => {
                loadData(true);
                setActiveTab('JOBS');
              }}
              onCancel={() => setActiveTab('JOBS')}
            />
          )}

          {activeTab === 'JOBS' && (
            <RecruiterJobsTable
              jobs={jobs}
              onOpenCreateJob={() => setActiveTab('CREATE_JOB')}
              isApproved={isApproved}
              onJobUpdated={() => loadData(true)}
            />
          )}

          {activeTab === 'APPLICANTS' && (
            <ApplicantReviewPipeline
              applications={applications}
              onUpdateStatus={handleUpdateApplicantStatus}
            />
          )}

          {(activeTab === 'PROFILE' || activeTab === 'SETTINGS') && (
            <CompanyProfileSettings
              company={company}
              onProfileUpdated={(updated: any) => setUser((prev: any) => ({ ...prev, companyProfile: updated }))}
            />
          )}
        </main>

        {/* Exact Admin Panel Footer */}
        <footer className="w-full bg-[#080809] text-white py-3.5 border-t border-neutral-900 text-center text-xs text-neutral-400 font-medium shrink-0 mt-auto">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Recruiter &amp; Employer Portal.</span>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION DOCK (Exact Screenshot Match) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] font-['Helvetica',Arial,sans-serif]">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'OVERVIEW' ? 'text-[#82ad1b] font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <HomeOutlinedIcon sx={{ fontSize: 20 }} className={activeTab === 'OVERVIEW' ? 'text-[#82ad1b]' : 'text-slate-400'} />
          <span className="text-[10px] tracking-tight font-bold">Home</span>
        </button>

        {/* 2. Post Job */}
        <button
          type="button"
          onClick={() => setActiveTab('CREATE_JOB')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'CREATE_JOB' ? 'text-[#82ad1b] font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} className={activeTab === 'CREATE_JOB' ? 'text-[#82ad1b]' : 'text-slate-400'} />
          <span className="text-[10px] tracking-tight font-bold">Post Job</span>
        </button>

        {/* 3. Applications */}
        <button
          type="button"
          onClick={() => setActiveTab('APPLICANTS')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'APPLICANTS' ? 'text-[#82ad1b] font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} className={activeTab === 'APPLICANTS' ? 'text-[#82ad1b]' : 'text-slate-400'} />
            {applications.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                {applications.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-bold">Applications</span>
        </button>

        {/* 4. Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-[#82ad1b] font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} className={activeTab === 'PROFILE' ? 'text-[#82ad1b]' : 'text-slate-400'} />
          <span className="text-[10px] tracking-tight font-bold">Profile</span>
        </button>
      </nav>

      <CreateJobModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onJobCreated={() => loadData(true)}
      />
    </div>
  );
}
