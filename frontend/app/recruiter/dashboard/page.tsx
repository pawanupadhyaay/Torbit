'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldCheck, RefreshCw, LogOut, ArrowLeft, Building2, AlertCircle, CheckCircle2, ShieldAlert, Mail, Phone, ExternalLink, Copy, Check } from 'lucide-react';
import RecruiterSidebar from '../../../recruiter/RecruiterSidebar';
import RecruiterTopbar from '../../../recruiter/RecruiterTopbar';
import RecruiterOverview from '../../../recruiter/RecruiterOverview';
import RecruiterJobsTable from '../../../recruiter/RecruiterJobsTable';
import ApplicantReviewPipeline from '../../../recruiter/ApplicantReviewPipeline';
import CompanyProfileSettings from '../../../recruiter/CompanyProfileSettings';
import CreateJobModal from '../../../recruiter/CreateJobModal';
import CreateJobView from '../../../recruiter/CreateJobView';
import Footer from '@/common/Footer';

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [seenApplicantCount, setSeenApplicantCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('torbit_recruiter_seen_apps');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  const isFetchingRef = useRef(false);
  const lastFetchedAtRef = useRef<number>(Date.now());

  // Calculate unread/unseen applications count
  const unreadApplicantCount = Math.max(0, applications.length - seenApplicantCount);

  // Clear badge when recruiter views APPLICANTS tab
  useEffect(() => {
    if (activeTab === 'APPLICANTS' && applications.length > 0) {
      setSeenApplicantCount(applications.length);
      try {
        localStorage.setItem('torbit_recruiter_seen_apps', String(applications.length));
      } catch (e) {}
    }
  }, [activeTab, applications.length]);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'CREATE_JOB') {
      setEditingJob(null);
    }
    if (tab === 'APPLICANTS') {
      setSeenApplicantCount(applications.length);
      try {
        localStorage.setItem('torbit_recruiter_seen_apps', String(applications.length));
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
      window.location.href = '/?auth=login&role=recruiter';
    }
  }, []);

  const loadData = useCallback(async (manual = false) => {
    if (isFetchingRef.current && !manual) return;
    try {
      isFetchingRef.current = true;
      if (manual) setIsRefreshing(true);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsCheckingAuth(false);
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

      const meRes = await fetch(`${apiBase}/auth/me`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
      let currentUser = meRes?.user || null;
      if (!currentUser) {
        const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (cachedUserStr) {
          try {
            currentUser = JSON.parse(cachedUserStr);
          } catch (e) {}
        }
      }

      if (!currentUser) {
        if (!token) {
          setIsCheckingAuth(false);
          setLoading(false);
          handleLogout();
          return;
        }
      } else {
        try { localStorage.setItem('user', JSON.stringify(currentUser)); } catch (e) {}
      }

      // Role check: if seeker visits recruiter route, redirect to seeker dashboard
      if (currentUser.role === 'JOB_SEEKER') {
        router.replace('/seeker/dashboard');
        return;
      }

      setUser(currentUser);
      setIsCheckingAuth(false);

      // Industry Standard: Dynamically sync canonical unique Recruiter GSTIN / Company ID to URL
      const recruiterIdentifier = currentUser.companyProfile?.gstNumber || currentUser.companyProfile?.id || currentUser.id;
      if (recruiterIdentifier && typeof window !== 'undefined' && window.location.pathname === '/recruiter/dashboard') {
        window.history.replaceState(null, '', `/recruiter/dashboard/${recruiterIdentifier}`);
      }

      const compStatus = currentUser.companyProfile?.status || currentUser.companyStatus || currentUser.status || 'PENDING';
      const isUserApproved = compStatus === 'APPROVED' || currentUser.role === 'ADMIN';

      // Only fetch operational jobs and applications if company is approved
      if (isUserApproved) {
        const [appRes, jobsRes] = await Promise.allSettled([
          fetch(`${apiBase}/applications`, { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${apiBase}/jobs/my/listings`, { headers }).then(r => r.ok ? r.json() : null)
        ]);

        const fetchedApps = appRes.status === 'fulfilled' && Array.isArray(appRes.value?.applications) ? appRes.value.applications : [];
        const fetchedJobs = jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs) ? jobsRes.value.jobs : [];

        setApplications(fetchedApps);
        setJobs(fetchedJobs);

        // Save snapshot for fast restore
        try {
          sessionStorage.setItem('torbitRecruiterSnapshot', JSON.stringify({
            user: currentUser,
            applications: fetchedApps,
            jobs: fetchedJobs
          }));
        } catch (cacheErr) {}
      } else {
        // Clear cached operational data if unapproved
        try {
          sessionStorage.removeItem('torbitRecruiterSnapshot');
        } catch (e) {}
      }

      lastFetchedAtRef.current = Date.now();
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [handleLogout, router]);

  // Initial Auth Guard Check on mount
  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const cached = sessionStorage.getItem('torbitRecruiterSnapshot');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.user) {
          const compStatus = parsed.user.companyProfile?.status || parsed.user.companyStatus || parsed.user.status;
          if (compStatus === 'APPROVED' || parsed.user.role === 'ADMIN') {
            setUser(parsed.user);
            if (Array.isArray(parsed.applications)) setApplications(parsed.applications);
            if (Array.isArray(parsed.jobs)) setJobs(parsed.jobs);
          }
        }
      }
    } catch (e) {}

    loadData();

    // Enterprise Smart Polling: 8s interval, only when tab is active
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 8000);

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
  }, [handleLogout, loadData]);

  const company = user?.companyProfile || {
    companyName: user?.companyName || user?.email?.split('@')[0] || '',
    workEmail: user?.email || '',
    phone: '',
    gstNumber: '',
    hqLocation: '',
    industry: 'Real Estate',
    status: user?.companyStatus || user?.status || 'PENDING',
    rejectionReason: user?.rejectionReason || null,
    verifiedAt: null
  };

  const compStatus = (
    company.status ||
    user?.companyProfile?.status ||
    user?.companyStatus ||
    user?.status ||
    'PENDING'
  ).toUpperCase();

  const isApproved = compStatus === 'APPROVED' || user?.role === 'ADMIN';
  const isBlocked = compStatus === 'BLOCKED';
  const isRejected = compStatus === 'REJECTED';

  const handleCopyEmail = (emailToCopy: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(emailToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleUpdateApplicantStatus = async (applicationId: string, status: string) => {
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      await fetch(`${apiBase}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ applicationId, status })
      });
      loadData(false);
    } catch (e) {
      console.error(e);
      loadData(false);
    }
  };

  // 1. Initial Loading Screen
  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center p-4 text-white font-['Helvetica',Arial,sans-serif]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center shadow-xl border border-white/10">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-[#b2c359] font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Authenticating Enterprise Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Blocked Account Screen (When Company is Blocked by Administrator)
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Helvetica',Arial,sans-serif]">
        {/* Top Header */}
        <header className="bg-[#080809] border-b border-gray-800 py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group" title="Go to Common Dashboard">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="bg-[#b2c359] text-[#080809] text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
              EMPLOYER PORTAL
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Blocked Account Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-red-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Banner */}
            <div className="bg-gradient-to-b from-[#1C1417] via-[#16171B] to-[#121316] p-6 text-white text-center relative overflow-hidden border-b border-red-900/30">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-400 block mb-1">
                ACCOUNT ACCESS RESTRICTED
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Your Account is Blocked
              </h1>
              <p className="text-xs text-gray-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                Your company account has been blocked by the Administrator. Please contact <strong className="text-white">Torbit Realty</strong> to review your account status and restore access.
              </p>
            </div>

            {/* Application & Block Details Card */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Company Name:</span>
                  <span className="font-bold text-gray-900">{company.companyName}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Registered Work Email:</span>
                  <span className="font-bold text-gray-900">{company.workEmail || user?.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">GSTIN Number / Company ID:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                    {company.gstNumber || 'GSTIN Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Account Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-full text-[11px] border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span>Account Blocked</span>
                  </span>
                </div>

                {company.rejectionReason && (
                  <div className="pt-2.5 border-t border-slate-200 text-xs">
                    <span className="text-gray-700 font-bold block mb-1">Reason / Moderation Note:</span>
                    <p className="bg-red-50 text-red-900 border border-red-200/80 rounded-xl p-2.5 leading-relaxed font-medium">
                      {company.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Official Torbit Realty Contact Details Card */}
              <div className="bg-gradient-to-br from-slate-900 to-[#181C20] text-white rounded-2xl p-5 space-y-3.5 shadow-md border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#b2c359]/20 text-[#b2c359] flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Torbit Realty Support Desk</h3>
                      <p className="text-[11px] text-gray-400">Enterprise Compliance &amp; Verification</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#b2c359] bg-[#b2c359]/10 border border-[#b2c359]/30 px-2 py-0.5 rounded-full">
                    Official Contact
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Please get in touch with our support team to submit clarification, update compliance documents, or request account unblocking:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  {/* Email Support */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#b2c359]" /> Support Email
                      </span>
                      <a 
                        href="mailto:torbitinsights@gmail.com" 
                        className="font-bold text-white hover:text-[#b2c359] transition break-all block text-xs"
                      >
                        torbitinsights@gmail.com
                      </a>
                      <span className="text-[10px] text-gray-400 block mt-0.5">admin@torbit.in</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail('torbitinsights@gmail.com')}
                      className="mt-2 text-[10px] font-bold text-[#b2c359] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email Address'}</span>
                    </button>
                  </div>

                  {/* Helpline / Hours */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#b2c359]" /> Support Helpline
                      </span>
                      <span className="font-bold text-white block text-xs">
                        +91 99999 99999
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Mon – Sat: 9:30 AM – 6:30 PM IST
                      </span>
                    </div>
                    <a
                      href="https://torbitrealty.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[10px] font-bold text-gray-300 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-[#b2c359]" />
                      <span>torbitrealty.com</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`mailto:torbitinsights@gmail.com?subject=Account%20Blocked%20Appeal%20-%20${encodeURIComponent(company.companyName)}&body=Company%20Name:%20${encodeURIComponent(company.companyName)}%0AGSTIN:%20${encodeURIComponent(company.gstNumber || '')}%0ARegistered%20Email:%20${encodeURIComponent(company.workEmail || user?.email || '')}%0A%0AHello%20Torbit%20Realty%20Team,%0AOur%20company%20account%20has%20been%20blocked.%20Please%20assist%20in%20verifying%20and%20unblocking%20our%20account.`}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Torbit Realty</span>
                </a>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Checking Status...' : 'Check Status Again'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#080809] text-white py-3 text-center text-xs text-neutral-400 font-medium shrink-0">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Compliance Desk.</span>
        </footer>
      </div>
    );
  }

  // 3. Rejected Account Screen (When Company is Rejected by Administrator)
  if (isRejected) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Helvetica',Arial,sans-serif]">
        {/* Top Header */}
        <header className="bg-[#080809] border-b border-gray-800 py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group" title="Go to Common Dashboard">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="bg-[#b2c359] text-[#080809] text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
              EMPLOYER PORTAL
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Rejected Account Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-amber-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Banner */}
            <div className="bg-[#181C20] p-6 text-white text-center relative overflow-hidden border-b border-amber-900/30">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                REGISTRATION NOT APPROVED
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Registration Review Incomplete
              </h1>
              <p className="text-xs text-gray-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                Your company registration could not be verified by the administrator. Please contact <strong className="text-white">Torbit Realty</strong> to provide updated documentation.
              </p>
            </div>

            {/* Details */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Company Name:</span>
                  <span className="font-bold text-gray-900">{company.companyName}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Registered Work Email:</span>
                  <span className="font-bold text-gray-900">{company.workEmail || user?.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">GSTIN Number / Company ID:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                    {company.gstNumber || 'GSTIN Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Verification Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full text-[11px] border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>Registration Rejected</span>
                  </span>
                </div>

                {company.rejectionReason && (
                  <div className="pt-2.5 border-t border-slate-200 text-xs">
                    <span className="text-gray-700 font-bold block mb-1">Feedback from Compliance Desk:</span>
                    <p className="bg-amber-50 text-amber-900 border border-amber-200/80 rounded-xl p-2.5 leading-relaxed font-medium">
                      {company.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-slate-900 to-[#181C20] text-white rounded-2xl p-5 space-y-3.5 shadow-md border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#b2c359]/20 text-[#b2c359] flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Torbit Realty Compliance Desk</h3>
                      <p className="text-[11px] text-gray-400">Enterprise Registration Verification</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#b2c359] bg-[#b2c359]/10 border border-[#b2c359]/30 px-2 py-0.5 rounded-full">
                    Support
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#b2c359]" /> Support Email
                      </span>
                      <a href="mailto:torbitinsights@gmail.com" className="font-bold text-white hover:text-[#b2c359] transition break-all block text-xs">
                        torbitinsights@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#b2c359]" /> Helpline
                      </span>
                      <span className="font-bold text-white block text-xs">+91 99999 99999</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`mailto:torbitinsights@gmail.com?subject=Re-Verification%20Request%20-%20${encodeURIComponent(company.companyName)}`}
                  className="flex-1 bg-[#b2c359] hover:bg-[#9eb047] text-[#080809] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Torbit Realty</span>
                </a>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Checking...' : 'Check Status'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#080809] text-white py-3 text-center text-xs text-neutral-400 font-medium shrink-0">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Compliance Desk.</span>
        </footer>
      </div>
    );
  }

  // 4. Pending Approval Guard Screen (When Recruiter is not yet approved by Admin)
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Helvetica',Arial,sans-serif]">
        {/* Top Header */}
        <header className="bg-[#080809] border-b border-gray-800 py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group" title="Go to Common Dashboard">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="bg-[#b2c359] text-[#080809] text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
              EMPLOYER PORTAL
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Verification Status Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-lime-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Banner */}
            <div className="bg-[#181C20] p-6 text-white text-center relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
                COMPLIANCE &amp; VERIFICATION IN PROGRESS
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Account Awaiting Admin Approval
              </h1>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Your company registration is undergoing administrative compliance review. The dashboard will unlock once verified.
              </p>
            </div>

            {/* Application Details Card */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Company Name:</span>
                  <span className="font-bold text-gray-900">{company.companyName}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">Registered Work Email:</span>
                  <span className="font-bold text-gray-900">{company.workEmail || user?.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-gray-500 font-medium">GSTIN Number / Company ID:</span>
                  <span className="font-mono font-bold text-[#b2c359] bg-[#181C20] px-2 py-0.5 rounded">
                    {company.gstNumber || 'GSTIN Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Verification Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full text-[11px] border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>Pending Verification (24–48 hrs)</span>
                  </span>
                </div>
              </div>

              <div className="bg-lime-50/80 border border-lime-200 rounded-2xl p-4 text-xs text-lime-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <ShieldCheck className="w-4 h-4 text-[#b2c359]" />
                  <span>Why is this step required?</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  To protect job seekers and maintain trusted hiring standards, Torbit Realty manually verifies the GST registration certificate and corporate identity of every employer before granting job-posting privileges.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="flex-1 bg-[#b2c359] hover:bg-[#9eb047] text-[#080809] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Checking Status...' : 'Check Approval Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { window.location.href = '/'; }}
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#080809] text-white py-3 text-center text-xs text-neutral-400 font-medium shrink-0">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Compliance Desk.</span>
        </footer>
      </div>
    );
  }

  // 3. Main Operational Recruiter Dashboard (Only for Approved Recruiters & Admins)
  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 antialiased selection:bg-[#b2c359]/20">
      <RecruiterSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isApproved={isApproved}
        companyName={company.companyName}
        workEmail={company.workEmail}
        applicantCount={unreadApplicantCount}
        logoUrl={company.logoUrl}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <RecruiterTopbar
          activeTab={activeTab}
          isApproved={isApproved}
          companyName={company.companyName}
          gstNumber={company.gstNumber}
          onOpenCreateJob={() => handleTabChange('CREATE_JOB')}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-12">
          {activeTab === 'OVERVIEW' && (
            <RecruiterOverview
              company={company}
              jobs={jobs}
              applications={applications}
              onOpenCreateJob={() => handleTabChange('CREATE_JOB')}
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === 'CREATE_JOB' && (
            <CreateJobView
              isApproved={isApproved}
              companyStatus={company.status}
              initialJob={editingJob}
              onJobCreated={() => {
                setEditingJob(null);
                loadData(true);
                setActiveTab('JOBS');
              }}
              onCancel={() => {
                setEditingJob(null);
                setActiveTab('JOBS');
              }}
            />
          )}

          {activeTab === 'JOBS' && (
            <RecruiterJobsTable
              jobs={jobs}
              onOpenCreateJob={() => {
                setEditingJob(null);
                setActiveTab('CREATE_JOB');
              }}
              isApproved={isApproved}
              onJobUpdated={() => loadData(true)}
              onEditJob={(job) => {
                setEditingJob(job);
                setActiveTab('CREATE_JOB');
              }}
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
              onProfileUpdated={(updated) => setUser((prev: any) => ({ ...prev, companyProfile: updated }))}
            />
          )}
        </main>

        {/* Unified Official Footer with Trust Strip */}
        <Footer />
      </div>

      <CreateJobModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onJobCreated={() => loadData(true)}
      />
    </div>
  );
}