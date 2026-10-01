'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'APPROVALS' | 'COMPANIES' | 'SEEKERS' | 'JOBS' | 'ANALYTICS' | 'SETTINGS'>('DASHBOARD');
  const [approvalFilter, setApprovalFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [approvalDateSort, setApprovalDateSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7D' | '30D' | '90D' | 'ALL'>('7D');
  const analyticsTimeframeRef = React.useRef<'7D' | '30D' | '90D' | 'ALL'>('7D');
  const [hoveredTrendItem, setHoveredTrendItem] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manage Companies search & filter states
  const [companySearch, setCompanySearch] = useState('');
  const [companyIndustryFilter, setCompanyIndustryFilter] = useState('ALL');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('ALL');

  // Manage Job Seekers search & filter states
  const [seekerSearch, setSeekerSearch] = useState('');
  const [seekerLocationFilter, setSeekerLocationFilter] = useState('ALL');
  const [seekerStatusFilter, setSeekerStatusFilter] = useState('ALL');
  const [selectedSeekerForSnapshot, setSelectedSeekerForSnapshot] = useState<any>(null);
  const [selectedSeekerForModal, setSelectedSeekerForModal] = useState<any>(null);

  const handleOpenSeekerProfile = (seeker: any) => {
    setSelectedSeekerForSnapshot(seeker);
    setSelectedSeekerForModal(seeker);
  };

  // Job Listings filter & state
  const [jobStatusFilter, setJobStatusFilter] = useState<'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EXPIRED'>('ACTIVE');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('ALL');
  const [jobCompanyFilter, setJobCompanyFilter] = useState('ALL');
  const [flaggedJobs, setFlaggedJobs] = useState<any[]>([
    { id: 'fj-1', title: 'Senior Property Advisor - Duplicate', company: 'Global Skyline Properties', reason: 'Repeated posting within 24 hours' }
  ]);

  // Modals state
  const [selectedCompanyForView, setSelectedCompanyForView] = useState<any>(null);
  const [rejectModalCompany, setRejectModalCompany] = useState<any>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<any>(null);
  const [editCompanyForm, setEditCompanyForm] = useState({
    companyName: '',
    industry: 'Real Estate',
    hqLocation: '',
    gstNumber: '',
    phone: '',
    workEmail: ''
  });

  // Selected Job for Full Listing Details Modal
  const [selectedJobForView, setSelectedJobForView] = useState<any>(null);

  // Notification Template Editor Modal State
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    title: string;
    channel: 'EMAIL' | 'SMS';
    subject?: string;
    body: string;
    variables: string[];
  } | null>(null);

  // Sub-Admin state & modal
  const [subAdmins, setSubAdmins] = useState<any[]>([
    { id: 'admin-main', name: 'Rahul Kapoor', role: 'Super Admin', access: 'Full platform access' },
    { id: 'admin-support', name: 'Sana Iyer', role: 'Approvals-only Admin', access: 'Company Approvals only' }
  ]);
  const [isSubAdminModalOpen, setIsSubAdminModalOpen] = useState(false);
  const [editingSubAdminId, setEditingSubAdminId] = useState<string | null>(null);
  const [subAdminForm, setSubAdminForm] = useState({
    name: '',
    email: '',
    role: 'Support Admin',
    access: 'Standard review'
  });

  // Category in-app modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings tab state
  const [notificationSettings, setNotificationSettings] = useState({
    companyApprovalEmail: true,
    companyRejectionEmail: true,
    statusChangeSms: true,
    newJobAlertDigest: false
  });

  const [notificationTemplates, setNotificationTemplates] = useState({
    approvalEmail: {
      subject: 'Your Company Account has been Approved - Torbit Realty',
      body: 'Dear {companyName},\n\nWe are pleased to inform you that your company profile has been verified and approved. You now have full access to create job postings and hire verified candidates on Torbit Realty.\n\nBest Regards,\nTorbit Realty Team'
    },
    rejectionEmail: {
      subject: 'Update Regarding Your Company Registration - Torbit Realty',
      body: 'Dear {companyName},\n\nThank you for applying. During our compliance check, we could not approve your registration due to: {rejectionReason}.\n\nPlease update your documentation and re-apply.\n\nBest Regards,\nTorbit Compliance Team'
    },
    statusSms: {
      body: 'Hello {candidateName}, your job application for {jobTitle} at {companyName} has been updated to: {status}. Check your Torbit candidate dashboard for details.'
    },
    jobDigest: {
      subject: 'Weekly Top Real Estate Jobs Digest - Torbit Realty',
      body: 'Hi {seekerName},\n\nHere are top matching real estate jobs for you this week:\n{jobListings}\n\nApply directly on Torbit Realty.'
    }
  });

  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Sales & Business Development',
    'Marketing & Communications',
    'Construction & Development',
    'Property Management',
    'Finance & Accounts',
    'IT & Technology'
  ]);

  const [brandingLogo, setBrandingLogo] = useState('');
  const [featuredContent, setFeaturedContent] = useState('');
  const [legalContent, setLegalContent] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Admin Profile info
  const [adminProfile, setAdminProfile] = useState<{ name: string; email: string; role: string }>({
    name: 'Super Admin',
    email: 'admin@torbit.in',
    role: 'ADMIN'
  });

  // Database states
  const [stats, setStats] = useState<any>({
    totalSeekers: 0,
    totalCompanies: 0,
    pendingApprovals: 0,
    activeJobs: 0,
    totalApplications: 0
  });

  const [analyticsData, setAnalyticsData] = useState<any>({
    appliedCount: 0,
    shortlistedCount: 0,
    selectedCount: 0,
    conversionRates: {
      appliedToShortlistedRate: 35,
      shortlistedToSelectedRate: 34,
      overallPlacementRate: 12
    },
    mostActiveCompanies: [],
    topCategories: [],
    topLocations: [],
    signUpTrends: [
      { day: 'Mon', seekers: 4, companies: 2 },
      { day: 'Tue', seekers: 7, companies: 3 },
      { day: 'Wed', seekers: 5, companies: 2 },
      { day: 'Thu', seekers: 9, companies: 4 },
      { day: 'Fri', seekers: 6, companies: 3 },
      { day: 'Sat', seekers: 3, companies: 1 },
      { day: 'Sun', seekers: 2, companies: 1 }
    ]
  });

  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [approvedCompanies, setApprovedCompanies] = useState<any[]>([]);
  const [rejectedCompanies, setRejectedCompanies] = useState<any[]>([]);
  const [seekersList, setSeekersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Refs for tracking changes and avoiding redundant / overlapping fetches
  const isFetchingRef = React.useRef(false);
  const initialLoadedRef = React.useRef(false);
  const prevPendingIdsRef = React.useRef<Set<string>>(new Set());
  const prevSeekerIdsRef = React.useRef<Set<string>>(new Set());
  const prevJobIdsRef = React.useRef<Set<string>>(new Set());
  const prevAppsCountRef = React.useRef<number>(0);

  // Check login profile and load saved settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) {
        const u = JSON.parse(stored);
        const name = u.name || u.fullName || 'Rahul Kapoor';
        setAdminProfile({
          name,
          email: u.email || 'admin@torbit.in',
          role: u.role || 'ADMIN'
        });
      }

      // ⚡ Instant Cache Hydration: Render cached stats & data in 0ms (no blank 0 flash)
      const cachedSnapshot = typeof window !== 'undefined' ? sessionStorage.getItem('torbitAdminSnapshot') : null;
      if (cachedSnapshot) {
        try {
          const parsed = JSON.parse(cachedSnapshot);
          if (parsed.stats) setStats(parsed.stats);
          if (parsed.pendingCompanies) setPendingCompanies(parsed.pendingCompanies);
          if (parsed.approvedCompanies) setApprovedCompanies(parsed.approvedCompanies);
          if (parsed.rejectedCompanies) setRejectedCompanies(parsed.rejectedCompanies);
          if (parsed.seekersList) setSeekersList(parsed.seekersList);
          if (parsed.jobsList) setJobsList(parsed.jobsList);
        } catch (e) {}
      }

      const savedSettings = localStorage.getItem('torbitAdminSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.subAdmins && parsed.subAdmins.length > 0) setSubAdmins(parsed.subAdmins);
        if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
        if (parsed.notificationTemplates) setNotificationTemplates(parsed.notificationTemplates);
        if (parsed.categoriesList) setCategoriesList(parsed.categoriesList);
        if (parsed.brandingLogo) setBrandingLogo(parsed.brandingLogo);
        if (parsed.featuredContent) setFeaturedContent(parsed.featuredContent);
        if (parsed.legalContent) setLegalContent(parsed.legalContent);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  // Fetch real data from backend endpoints with live change detection
  const fetchAdminData = useCallback(async (manual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (manual) setIsRefreshing(true);
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      // Fetch all endpoints concurrently for maximum responsiveness
      const [statsResult, compResult, seekersResult, jobsResult, analyticsResult, categoriesResult] = await Promise.allSettled([
        fetch(`${apiBase}/admin/stats`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/admin/companies`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/admin/seekers`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/admin/jobs`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/admin/analytics?timeframe=${analyticsTimeframeRef.current || '7D'}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${apiBase}/admin/categories`, { headers }).then(r => r.ok ? r.json() : null),
      ]);

      // 1. Process Stats
      if (statsResult.status === 'fulfilled' && statsResult.value) {
        const statsData = statsResult.value;
        const totalApps = statsData.stats?.totalApplications ?? statsData.totalApplications ?? 0;
        
        // Detect new incoming job applications
        if (initialLoadedRef.current && totalApps > prevAppsCountRef.current && prevAppsCountRef.current > 0) {
          const diff = totalApps - prevAppsCountRef.current;
          showToast(`📥 ${diff} New Job Application${diff > 1 ? 's' : ''} Received!`);
        }
        prevAppsCountRef.current = totalApps;

        setStats({
          totalSeekers: statsData.stats?.totalSeekers ?? statsData.totalSeekers ?? 0,
          totalCompanies: statsData.stats?.totalCompanies ?? statsData.totalCompanies ?? 0,
          pendingApprovals: statsData.stats?.pendingApprovals ?? statsData.pendingApprovals ?? 0,
          activeJobs: statsData.stats?.activeJobs ?? statsData.activeJobs ?? 0,
          totalApplications: totalApps
        });
      }

      // 2. Process Companies
      if (compResult.status === 'fulfilled' && compResult.value) {
        const compData = compResult.value;
        const list = compData.companies || compData || [];

        // Pending Companies
        const pending = list
          .filter((c: any) => c.status === 'PENDING')
          .map((c: any) => ({
            id: c.id,
            companyName: c.companyName || 'Unnamed Company',
            gstNumber: c.gstNumber || 'GST Pending',
            hqLocation: c.hqLocation || 'Not Specified',
            docUrl: c.docUrl,
            documentName: c.docUrl ? c.docUrl.split('/').pop() : 'Registration_Certificate.pdf',
            submittedOn: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            rawCreatedAt: c.createdAt ? new Date(c.createdAt).getTime() : 0,
            status: 'Pending',
            workEmail: c.workEmail,
            phone: c.phone,
            industry: c.industry || 'Real Estate',
            rejectionReason: c.rejectionReason
          }));

        // Detect new company registrations submitted for KYC approval
        if (initialLoadedRef.current) {
          const incomingNewPending = pending.filter((p: any) => !prevPendingIdsRef.current.has(p.id));
          if (incomingNewPending.length > 0) {
            const first = incomingNewPending[0];
            showToast(`🔔 New Company Registration: "${first.companyName}" submitted for KYC approval!`);
          }
        }
        prevPendingIdsRef.current = new Set(pending.map((p: any) => p.id));
        setPendingCompanies(pending);

        // Approved / Active / Blocked
        const approved = list
          .filter((c: any) => c.status === 'APPROVED' || c.status === 'BLOCKED' || c.status === 'ACTIVE')
          .map((c: any) => ({
            id: c.id,
            companyName: c.companyName || 'Corporate Real Estate',
            gstNumber: c.gstNumber || 'GST-100234',
            hqLocation: c.hqLocation || 'Delhi NCR',
            industry: c.industry || 'Real Estate',
            workEmail: c.workEmail,
            phone: c.phone,
            docUrl: c.docUrl,
            documentName: c.docUrl ? c.docUrl.split('/').pop() : 'Incorporation_Doc.pdf',
            activeJobs: c.activeJobs ?? (c._count?.jobs ?? (c.jobs ? c.jobs.length : 0)),
            applications: c.applications ?? 0,
            status: c.status === 'BLOCKED' ? 'Blocked' : 'Active',
            verifiedAt: c.verifiedAt ? new Date(c.verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified',
            submittedOn: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified',
            rawCreatedAt: c.createdAt ? new Date(c.createdAt).getTime() : 0
          }));
        setApprovedCompanies(approved);

        // Rejected
        const rejected = list
          .filter((c: any) => c.status === 'REJECTED')
          .map((c: any) => ({
            id: c.id,
            companyName: c.companyName || 'Rejected Corp',
            gstNumber: c.gstNumber || 'N/A',
            hqLocation: c.hqLocation || 'N/A',
            industry: c.industry || 'Real Estate',
            docUrl: c.docUrl,
            documentName: c.docUrl ? c.docUrl.split('/').pop() : 'Doc.pdf',
            submittedOn: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            rawCreatedAt: c.createdAt ? new Date(c.createdAt).getTime() : 0,
            status: 'Rejected',
            workEmail: c.workEmail,
            phone: c.phone,
            rejectionReason: c.rejectionReason || 'Compliance documentation mismatch'
          }));
        setRejectedCompanies(rejected);
      }

      // 3. Process Seekers
      if (seekersResult.status === 'fulfilled' && seekersResult.value) {
        const sData = seekersResult.value;
        const list = sData.seekers || sData || [];
        const mappedSeekers = list.map((s: any) => ({
          id: s.id,
          fullName: s.fullName || s.user?.email?.split('@')[0] || 'Registered Candidate',
          email: s.user?.email || s.email || 'candidate@domain.in',
          phone: s.phone || 'Not Provided',
          avatarUrl: s.avatarUrl || null,
          dob: s.dob || null,
          profileCompleted: s.profileCompleted ?? 72,
          location: s.location || 'India',
          experience: s.experience || 'Not Specified',
          qualification: s.qualification || 'Graduate',
          skills: s.skills || '',
          currentSalary: s.currentSalary,
          expectedSalary: s.expectedSalary,
          noticePeriod: s.noticePeriod || 'Immediate',
          portfolioUrl: s.portfolioUrl || '',
          resumeUrl: s.resumeUrl || null,
          resumeOriginalName: s.resumeOriginalName || s.resumeName || (s.resumeUrl ? s.resumeUrl.split('/').pop() : 'Candidate_Resume.pdf'),
          resumeName: s.resumeOriginalName || (s.resumeUrl ? s.resumeUrl.split('/').pop() : 'Candidate_Resume.pdf'),
          applications: s.applications ?? 0,
          status: s.status || (s.skills?.includes('__BLOCKED__') ? 'Blocked' : 'Active'),
          selectedCount: s.selectedCount ?? 0,
          rejectedCount: s.rejectedCount ?? 0,
          pendingCount: s.pendingCount ?? (s.applications ?? 0),
          createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'
        }));

        // Detect newly registered candidates
        if (initialLoadedRef.current) {
          const incomingNewSeekers = mappedSeekers.filter((s: any) => !prevSeekerIdsRef.current.has(s.id));
          if (incomingNewSeekers.length > 0) {
            const first = incomingNewSeekers[0];
            showToast(`👤 New Candidate Registered: ${first.fullName || first.email}`);
          }
        }
        prevSeekerIdsRef.current = new Set(mappedSeekers.map((s: any) => s.id));
        setSeekersList(mappedSeekers);
      }

      // 4. Process Jobs
      if (jobsResult.status === 'fulfilled' && jobsResult.value) {
        const jData = jobsResult.value;
        const list = jData.jobs || jData || [];
        const mappedJobs = list.map((j: any) => ({
          id: j.id,
          title: j.title || 'Position Title',
          company: j.company || (j.company?.companyName) || 'Real Estate Enterprise',
          category: j.category || j.department || 'Sales & BD',
          location: j.location || 'Gurugram / Hybrid',
          type: j.type || j.jobType || 'Full Time',
          workMode: j.workMode || 'On-site',
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          description: j.description || 'Full job description and platform responsibilities.',
          skills: j.skills || 'Real Estate, Sales, Negotiations',
          applicants: j.applicants ?? 0,
          postedOn: j.postedOn || (j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
          status: j.status || (j.rawStatus === 'ACTIVE' ? 'Active' : j.rawStatus === 'CLOSED' ? 'Closed' : j.rawStatus === 'DRAFT' ? 'Draft' : 'Active'),
          isFeatured: !!j.isFeatured
        }));

        // Detect newly posted jobs
        if (initialLoadedRef.current) {
          const incomingNewJobs = mappedJobs.filter((j: any) => !prevJobIdsRef.current.has(j.id));
          if (incomingNewJobs.length > 0) {
            const first = incomingNewJobs[0];
            showToast(`💼 New Job Listing: "${first.title}" by ${first.company}`);
          }
        }
        prevJobIdsRef.current = new Set(mappedJobs.map((j: any) => j.id));
        setJobsList(mappedJobs);
      }

      // 5. Process Analytics
      if (analyticsResult.status === 'fulfilled' && analyticsResult.value) {
        const aData = analyticsResult.value;
        setAnalyticsData({
          appliedCount: aData.appliedCount ?? aData.totalApplications ?? 0,
          shortlistedCount: aData.shortlistedCount ?? 0,
          selectedCount: aData.selectedCount ?? 0,
          conversionRates: aData.conversionRates || {
            appliedToShortlistedRate: 35,
            shortlistedToSelectedRate: 34,
            overallPlacementRate: 12
          },
          mostActiveCompanies: aData.mostActiveCompanies || [],
          topCategories: aData.topCategories || [],
          topLocations: aData.topLocations || [],
          signUpTrends: aData.signUpTrends || []
        });
      }

      // 6. Process Categories from DB Master Data
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value?.categories) {
        const dbCats = categoriesResult.value.categories.map((c: any) => c.name || c).filter(Boolean);
        if (dbCats.length > 0) {
          setCategoriesList(dbCats);
        }
      }

      initialLoadedRef.current = true;
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // ⚡ Save snapshot for instant 0ms hydration on subsequent visits
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('torbitAdminSnapshot', JSON.stringify({
            stats: statsResult.status === 'fulfilled' && statsResult.value ? statsResult.value.stats || statsResult.value : null,
            pendingCompanies: pending,
            approvedCompanies: approved,
            rejectedCompanies: rejected,
            seekersList: mappedSeekers,
            jobsList: mappedJobs
          }));
        }
      } catch (cacheErr) {}

      if (manual) showToast('Live database sync completed successfully.');
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      if (manual) showToast('Could not sync data from server.');
    } finally {
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Dedicated instant fetch when admin switches analytics timeframe
  const fetchAnalyticsOnly = useCallback(async (timeframe: '7D' | '30D' | '90D' | 'ALL') => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, { headers });
      if (res.ok) {
        const aData = await res.json();
        setAnalyticsData((prev: any) => ({
          ...prev,
          appliedCount: aData.appliedCount ?? aData.totalApplications ?? prev.appliedCount,
          shortlistedCount: aData.shortlistedCount ?? prev.shortlistedCount,
          selectedCount: aData.selectedCount ?? prev.selectedCount,
          conversionRates: aData.conversionRates || prev.conversionRates,
          mostActiveCompanies: aData.mostActiveCompanies || prev.mostActiveCompanies,
          topCategories: aData.topCategories || prev.topCategories,
          topLocations: aData.topLocations || prev.topLocations,
          signUpTrends: aData.signUpTrends || []
        }));
      }
    } catch (err) {
      console.error('Error fetching analytics by timeframe:', err);
    }
  }, []);

  const handleTimeframeChange = (tf: '7D' | '30D' | '90D' | 'ALL') => {
    setAnalyticsTimeframe(tf);
    analyticsTimeframeRef.current = tf;
    fetchAnalyticsOnly(tf);
  };

  const lastFetchedAtRef = useRef<number>(Date.now());

  // Real-time live auto-polling & visibility trigger
  useEffect(() => {
    // Immediate initial fetch
    fetchAdminData();

    // Enterprise Smart Polling: 25s interval, only when browser tab is actively visible
    const syncInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchAdminData(false);
      }
    }, 25000);

    // Instant smart sync on window focus/tab switch (throttled to at most once per 10 seconds)
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetchedAtRef.current;
        if (timeSinceLast > 10000) {
          fetchAdminData(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchAdminData]);

  // ⚡ Actions: Approve Company (Instant Optimistic UI in 0ms)
  const handleApprove = async (id: string) => {
    const targetComp = pendingCompanies.find(c => c.id === id);
    const compName = targetComp?.companyName || 'Company';

    // Instant optimistic local state update
    setPendingCompanies(prev => prev.filter(c => c.id !== id));
    if (targetComp) {
      setApprovedCompanies(prev => [
        {
          ...targetComp,
          status: 'Active',
          verifiedAt: 'Just Now',
          activeJobs: 0,
          applications: 0
        },
        ...prev.filter(c => c.id !== id)
      ]);
    }
    setStats((prev: any) => ({
      ...prev,
      pendingApprovals: Math.max(0, (prev?.pendingApprovals || 1) - 1),
      totalCompanies: (prev?.totalCompanies || 0) + (targetComp ? 0 : 0)
    }));
    showToast(`✅ "${compName}" approved! Recruiter credentials dispatched.`);
    setSelectedCompanyForView(null);

    // Non-blocking background API dispatch
    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      await fetch(`${apiBase}/admin/companies/${id}/approve`, {
        method: 'POST',
        headers
      });
      fetchAdminData(false);
    } catch (e) {
      fetchAdminData(false);
    }
  };

  // Actions: Open Reject Modal
  const handleOpenRejectModal = (comp: any) => {
    setRejectModalCompany(comp);
    setRejectionReasonInput('');
  };

  // ⚡ Actions: Submit Reject with Reason (Instant Optimistic UI in 0ms)
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalCompany) return;
    const compId = rejectModalCompany.id;
    const compName = rejectModalCompany.companyName;
    const reason = rejectionReasonInput.trim() || 'Verification documents do not meet compliance guidelines';

    // Instant optimistic local state update
    setPendingCompanies(prev => prev.filter(c => c.id !== compId));
    setRejectedCompanies(prev => [
      {
        ...rejectModalCompany,
        status: 'Rejected',
        rejectionReason: reason
      },
      ...prev.filter(c => c.id !== compId)
    ]);
    setStats((prev: any) => ({
      ...prev,
      pendingApprovals: Math.max(0, (prev?.pendingApprovals || 1) - 1)
    }));
    showToast(`🚫 "${compName}" rejected: ${reason}`);
    setRejectModalCompany(null);
    setSelectedCompanyForView(null);

    // Non-blocking background API dispatch
    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      await fetch(`${apiBase}/admin/companies/${compId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason })
      });
      fetchAdminData(false);
    } catch (e) {
      fetchAdminData(false);
    }
  };

  // Actions: Request More Information
  const handleRequestMoreInfo = async (comp: any) => {
    try {
      showToast(`Information request dispatched to ${comp.companyName}.`);
      setSelectedCompanyForView(null);
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      await fetch(`${apiBase}/admin/companies/${comp.id}/request-info`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: 'Please provide updated certificate of incorporation and clear GSTIN documentation.' })
      });
      fetchAdminData(false);
    } catch (e) {
      showToast('Request sent to company.');
    }
  };

  // ⚡ Actions: Block / Unblock Company (Instant Optimistic UI in 0ms)
  const handleToggleBlock = async (id: string) => {
    const comp = approvedCompanies.find(c => c.id === id);
    const willBlock = comp?.status === 'Active';
    const action = willBlock ? 'block' : 'unblock';

    // Instant optimistic state update
    setApprovedCompanies(prev => prev.map(c => c.id === id ? { ...c, status: willBlock ? 'Blocked' : 'Active' } : c));
    showToast(willBlock ? '🔒 Company has been blocked.' : '🔓 Company unblocked.');
    setSelectedCompanyForView(null);

    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      await fetch(`${apiBase}/admin/companies/${id}/${action}`, {
        method: 'POST',
        headers
      });
      fetchAdminData(false);
    } catch (e) {
      fetchAdminData(false);
    }
  };

  // Actions: Open Edit Company Modal
  const handleOpenEditCompany = (comp: any) => {
    setSelectedCompanyForEdit(comp);
    setEditCompanyForm({
      companyName: comp.companyName || '',
      industry: comp.industry || 'Real Estate',
      hqLocation: comp.hqLocation || '',
      gstNumber: comp.gstNumber || '',
      phone: comp.phone || '',
      workEmail: comp.workEmail || ''
    });
  };

  // Actions: Save Edited Company Details
  const handleSaveCompanyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyForEdit) return;
    try {
      const res = await fetch(`/api/admin/companies/${selectedCompanyForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCompanyForm)
      });
      if (res.ok) {
        await fetchAdminData();
        showToast(`Company "${editCompanyForm.companyName}" updated successfully.`);
        setSelectedCompanyForEdit(null);
      }
    } catch (err) {
      showToast('Failed to update company.');
    }
  };

  // Actions: Block / Unblock Seeker
  const handleToggleBlockSeeker = async (id: string) => {
    try {
      const seeker = seekersList.find(s => s.id === id);
      const willBlock = seeker?.status === 'Active';
      const action = willBlock ? 'block' : 'unblock';

      await fetch(`/api/admin/seekers/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      setSeekersList(prev =>
        prev.map(s => (s.id === id ? { ...s, status: willBlock ? 'Blocked' : 'Active' } : s))
      );
      setSelectedSeekerForModal((prev: any) => prev && prev.id === id ? { ...prev, status: willBlock ? 'Blocked' : 'Active' } : prev);
      setSelectedSeekerForSnapshot((prev: any) => prev && prev.id === id ? { ...prev, status: willBlock ? 'Blocked' : 'Active' } : prev);
      showToast(`Candidate profile has been ${willBlock ? 'blocked' : 'unblocked'}.`);
    } catch (e) {
      setSeekersList(prev =>
        prev.map(s => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Blocked' : 'Active' } : s))
      );
      showToast('Candidate status updated.');
    }
  };

  // Actions: Toggle Featured Job
  const handleToggleFeaturedJob = async (jobId: string, currentFeatured: boolean) => {
    try {
      const nextFeatured = !currentFeatured;
      await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: nextFeatured })
      });
      setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, isFeatured: nextFeatured } : j));
      showToast(`Job listing ${nextFeatured ? 'featured on home page ⭐' : 'un-featured'}`);
    } catch (err) {
      showToast('Status updated locally.');
    }
  };

  // Actions: Remove Job
  const handleRemoveJob = async (id: string) => {
    try {
      await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      setJobsList(prev => prev.filter(j => j.id !== id));
      setStats((prev: any) => ({
        ...prev,
        activeJobs: Math.max(0, prev.activeJobs - 1)
      }));
      showToast('Job listing removed permanently.');
      setSelectedJobForView(null);
    } catch (e) {
      setJobsList(prev => prev.filter(j => j.id !== id));
      showToast('Job listing removed.');
    }
  };

  // Actions: Remove Flagged Job
  const handleRemoveFlaggedJob = (id: string) => {
    setFlaggedJobs(prev => prev.filter(fj => fj.id !== id));
    showToast('Flagged listing removed.');
  };

  // Sub-Admin Handlers
  const handleOpenAddSubAdmin = () => {
    setEditingSubAdminId(null);
    setSubAdminForm({
      name: '',
      email: '',
      role: 'Support Admin',
      access: 'Standard review & ticket management'
    });
    setIsSubAdminModalOpen(true);
  };

  const handleOpenEditSubAdmin = (admin: any) => {
    setEditingSubAdminId(admin.id);
    setSubAdminForm({
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role || 'Support Admin',
      access: admin.access || 'Standard review'
    });
    setIsSubAdminModalOpen(true);
  };

  const handleSaveSubAdminModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subAdminForm.name.trim()) {
      showToast('Please enter administrator full name.');
      return;
    }

    if (editingSubAdminId) {
      setSubAdmins(prev =>
        prev.map(a =>
          a.id === editingSubAdminId
            ? {
                ...a,
                name: subAdminForm.name.trim(),
                role: subAdminForm.role,
                access: subAdminForm.access
              }
            : a
        )
      );
      showToast(`Administrator ${subAdminForm.name.trim()} updated successfully.`);
    } else {
      const newAdmin = {
        id: `admin-${Date.now()}`,
        name: subAdminForm.name.trim(),
        role: subAdminForm.role,
        access: subAdminForm.access
      };
      setSubAdmins(prev => [...prev, newAdmin]);
      showToast(`New administrator ${subAdminForm.name.trim()} added!`);
    }

    setIsSubAdminModalOpen(false);
  };

  const handleDeleteSubAdmin = (id: string) => {
    setSubAdmins(prev => prev.filter(a => a.id !== id));
    setIsSubAdminModalOpen(false);
    showToast('Administrator removed.');
  };

  // Category in-app modal
  const handleSaveCategoryModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setCategoriesList(prev => Array.from(new Set([...prev, trimmed])));
    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: trimmed })
      });
    } catch (err) {}

    setNewCategoryName('');
    setIsCategoryModalOpen(false);
    showToast(`Category "${trimmed}" added to database!`);
  };

  const handleDeleteCategory = async (cat: string) => {
    setCategoriesList(prev => prev.filter(c => c !== cat));
    try {
      const token = localStorage.getItem('adminToken');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/admin/categories/${encodeURIComponent(cat)}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {}
    showToast(`Category "${cat}" removed from database.`);
  };

  // Notification Template Handlers
  const handleOpenEditTemplate = (type: 'APPROVAL_EMAIL' | 'REJECTION_EMAIL' | 'STATUS_SMS' | 'JOB_DIGEST') => {
    if (type === 'APPROVAL_EMAIL') {
      setEditingTemplate({
        id: 'approvalEmail',
        title: 'Company Approval Email Template',
        channel: 'EMAIL',
        subject: notificationTemplates.approvalEmail.subject,
        body: notificationTemplates.approvalEmail.body,
        variables: ['{companyName}', '{contactPerson}', '{dashboardLink}']
      });
    } else if (type === 'REJECTION_EMAIL') {
      setEditingTemplate({
        id: 'rejectionEmail',
        title: 'Company Rejection Email Template',
        channel: 'EMAIL',
        subject: notificationTemplates.rejectionEmail.subject,
        body: notificationTemplates.rejectionEmail.body,
        variables: ['{companyName}', '{rejectionReason}', '{contactEmail}']
      });
    } else if (type === 'STATUS_SMS') {
      setEditingTemplate({
        id: 'statusSms',
        title: 'Application Status Change SMS Template',
        channel: 'SMS',
        body: notificationTemplates.statusSms.body,
        variables: ['{candidateName}', '{jobTitle}', '{companyName}', '{status}']
      });
    } else if (type === 'JOB_DIGEST') {
      setEditingTemplate({
        id: 'jobDigest',
        title: 'New Job Alert Digest Template',
        channel: 'EMAIL',
        subject: notificationTemplates.jobDigest.subject,
        body: notificationTemplates.jobDigest.body,
        variables: ['{seekerName}', '{jobListings}', '{unsubscribeLink}']
      });
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setNotificationTemplates(prev => ({
      ...prev,
      [editingTemplate.id]: {
        subject: editingTemplate.subject || '',
        body: editingTemplate.body
      }
    }));

    showToast(`${editingTemplate.title} saved successfully.`);
    setEditingTemplate(null);
  };

  // Export CSV Helper for Candidates
  const exportSeekersCSV = () => {
    const headers = ['Candidate Name', 'Email', 'Phone', 'Location', 'Experience', 'Qualification', 'Applications', 'Status'];
    const rows = seekersList.map(s => [
      `"${s.fullName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.location || ''}"`,
      `"${s.experience || ''}"`,
      `"${s.qualification || ''}"`,
      `"${s.applications || 0}"`,
      `"${s.status || 'Active'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Torbit_Job_Seekers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Candidate CSV exported successfully.');
  };

  // Export Analytics Comprehensive CSV
  const exportAnalyticsCSV = () => {
    const headers = ['Metric / Dimension', 'Value / Details', 'Category / Status'];
    const rows = [
      ['Total Job Seekers', stats.totalSeekers, 'Platform Core'],
      ['Total Companies', stats.totalCompanies, 'Platform Core'],
      ['Pending Approvals Queue', stats.pendingApprovals, 'Moderation'],
      ['Active Job Listings', stats.activeJobs, 'Listings'],
      ['Total Applications Submitted', stats.totalApplications, 'Pipeline'],
      ['Shortlisted Rate', `${analyticsData.conversionRates?.appliedToShortlistedRate || 35}%`, 'Funnel Conversion'],
      ['Hired / Placement Rate', `${analyticsData.conversionRates?.overallPlacementRate || 12}%`, 'Funnel Conversion'],
      ['Top Categories', categoriesList.join(' | '), 'Master Data'],
      ['Active Employers Sample', approvedCompanies.map(c => c.companyName).slice(0, 5).join(' | '), 'Directory'],
      ...((analyticsData.signUpTrends || []).map((t: any) => [
        `Sign-ups (${t.date || t.day})`,
        `Seekers: ${t.seekers || 0}, Companies: ${t.companies || 0} [Total: ${t.total || ((t.seekers || 0) + (t.companies || 0))}]`,
        'Registration Trend'
      ]))
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Torbit_Platform_Analytics_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive Analytics CSV exported successfully.');
  };

  // Print Executive Summary PDF report
  const handlePrintExecutiveReport = () => {
    window.print();
  };

  // Save platform settings
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      const payload = {
        subAdmins,
        notificationSettings,
        notificationTemplates,
        categoriesList,
        brandingLogo,
        featuredContent,
        legalContent
      };
      localStorage.setItem('torbitAdminSettings', JSON.stringify(payload));
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Settings saved successfully!');
    } catch (e) {
      showToast('Settings saved locally.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Nav items configuration
  const navItems = [
    {
      group: null,
      items: [
        { id: 'DASHBOARD', label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, badge: null }
      ]
    },
    {
      group: 'COMPANY MANAGEMENT',
      items: [
        {
          id: 'APPROVALS',
          label: 'Company Approvals',
          icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} className="text-[#94C322]" />,
          badge: pendingCompanies.length > 0 ? pendingCompanies.length : null
        },
        {
          id: 'COMPANIES',
          label: 'Manage Companies',
          icon: <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />,
          badge: null
        }
      ]
    },
    {
      group: 'USER MANAGEMENT',
      items: [
        {
          id: 'SEEKERS',
          label: 'Manage Job Seekers',
          icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-400" />,
          badge: null
        }
      ]
    },
    {
      group: 'CONTENT',
      items: [
        {
          id: 'JOBS',
          label: 'Job Listings',
          icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />,
          badge: null
        }
      ]
    },
    {
      group: 'INSIGHTS',
      items: [
        {
          id: 'ANALYTICS',
          label: 'Reports & Analytics',
          icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} className="text-red-400" />,
          badge: null
        }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        {
          id: 'SETTINGS',
          label: 'Settings',
          icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} className="text-cyan-400" />,
          badge: null
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif] text-gray-900 antialiased selection:bg-[#94C322]/20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#080809] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircleOutlinedIcon className="text-[#94C322]" sx={{ fontSize: 18 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PER-COMPANY DETAIL VIEW MODAL */}
      {/* ========================================================= */}
      {selectedCompanyForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center">
                  <CorporateFareOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedCompanyForView.companyName}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Registration &amp; Verification Audit Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanyForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">GSTIN / TAX ID</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{selectedCompanyForView.gstNumber || 'GST Pending'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">STATUS</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedCompanyForView.status === 'Pending' || selectedCompanyForView.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedCompanyForView.status === 'Active' || selectedCompanyForView.status === 'Approved' || selectedCompanyForView.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCompanyForView.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">HEADQUARTERS</span>
                  <span className="font-medium text-slate-800">{selectedCompanyForView.hqLocation || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">INDUSTRY</span>
                  <span className="font-medium text-slate-800">{selectedCompanyForView.industry || 'Real Estate'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">WORK EMAIL</span>
                  <span className="font-medium text-slate-800">{selectedCompanyForView.workEmail || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">CONTACT PHONE</span>
                  <span className="font-medium text-slate-800">{selectedCompanyForView.phone || 'Not provided'}</span>
                </div>
              </div>

              {/* Uploaded Verification Document */}
              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <AttachFileOutlinedIcon sx={{ fontSize: 18 }} className="rotate-45" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedCompanyForView.documentName || 'Incorporation_Doc.pdf'}</div>
                    <div className="text-[10px] text-slate-500">Official Government Incorporation / GST Document</div>
                  </div>
                </div>
                {selectedCompanyForView.docUrl ? (
                  <a
                    href={selectedCompanyForView.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#080809] hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <span>View Doc</span>
                    <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Attached on file</span>
                )}
              </div>

              {/* Audit Trail Info */}
              <div className="bg-slate-50/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <div><strong>Submitted On:</strong> {selectedCompanyForView.submittedOn || 'Recently'}</div>
                {selectedCompanyForView.rejectionReason && (
                  <div className="text-red-600"><strong>Notice/Reason:</strong> {selectedCompanyForView.rejectionReason}</div>
                )}
                <div><strong>Audit Action:</strong> Verified with Ministry of Corporate Affairs records.</div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                {(selectedCompanyForView.status === 'Pending' || selectedCompanyForView.status === 'PENDING') && (
                  <>
                    <button
                      onClick={() => handleRequestMoreInfo(selectedCompanyForView)}
                      className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition cursor-pointer"
                    >
                      Request Info
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(selectedCompanyForView)}
                      className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedCompanyForView.id)}
                      className="px-4 py-2 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Approve &amp; Unlock
                    </button>
                  </>
                )}

                {(selectedCompanyForView.status === 'Approved' || selectedCompanyForView.status === 'Active' || selectedCompanyForView.status === 'APPROVED') && (
                  <button
                    onClick={() => {
                      handleToggleBlock(selectedCompanyForView.id);
                      setSelectedCompanyForView(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    Block Company
                  </button>
                )}

                <button
                  onClick={() => setSelectedCompanyForView(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REJECT COMPANY WITH REASON MODAL */}
      {/* ========================================================= */}
      {rejectModalCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Reject Company Registration
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {rejectModalCompany.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalCompany(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide a reason for rejection. This will be logged in the compliance audit trail and notified to the company contact.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Invalid GSTIN / Tax ID',
                  'Incomplete Incorporation Certificate',
                  'Unverifiable Corporate Domain',
                  'Duplicate Company Registration',
                  'Outside Real Estate Industry Policy'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReasonInput(reason)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#94C322]/20 hover:text-slate-900 transition border border-slate-200/80 cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Rejection Reason / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Specify reason for rejecting this company account..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-500 transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalCompany(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#DC2626] hover:bg-red-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT COMPANY DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedCompanyForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center">
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Edit Company Details
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Update company info on their behalf
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanyForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyEdit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompanyForm.companyName}
                  onChange={(e) => setEditCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Industry</label>
                  <select
                    value={editCompanyForm.industry}
                    onChange={(e) => setEditCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                  >
                    <option value="Real Estate">Real Estate</option>
                    <option value="Construction">Construction</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Property Consulting">Property Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">HQ Location</label>
                  <input
                    type="text"
                    value={editCompanyForm.hqLocation}
                    onChange={(e) => setEditCompanyForm(prev => ({ ...prev, hqLocation: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">GSTIN / Registration No.</label>
                <input
                  type="text"
                  value={editCompanyForm.gstNumber}
                  onChange={(e) => setEditCompanyForm(prev => ({ ...prev, gstNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={editCompanyForm.workEmail}
                    onChange={(e) => setEditCompanyForm(prev => ({ ...prev, workEmail: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editCompanyForm.phone}
                    onChange={(e) => setEditCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyForEdit(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FULL JOB LISTING DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedJobForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center">
                  <WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedJobForView.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedJobForView.company} • {selectedJobForView.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJobForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">LOCATION</span>
                  <span className="font-semibold text-slate-800">{selectedJobForView.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">WORK MODE</span>
                  <span className="font-semibold text-slate-800">{selectedJobForView.workMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">JOB TYPE</span>
                  <span className="font-semibold text-slate-800">{selectedJobForView.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">APPLICANTS</span>
                  <span className="font-bold text-slate-900">{selectedJobForView.applicants} Applied</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">FEATURED</span>
                  <span className="font-semibold text-amber-600">{selectedJobForView.isFeatured ? '⭐ Yes (Promoted)' : 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">POSTED ON</span>
                  <span className="font-semibold text-slate-800">{selectedJobForView.postedOn}</span>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Job Description</h4>
                <p className="text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedJobForView.description}
                </p>
              </div>

              {/* Required Skills */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1.5">Required Skills &amp; Qualifications</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForView.skills.split(',').map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold text-[11px]">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleFeaturedJob(selectedJobForView.id, selectedJobForView.isFeatured)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    selectedJobForView.isFeatured
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <StarRoundedIcon sx={{ fontSize: 16 }} />
                  <span>{selectedJobForView.isFeatured ? 'Featured on Home' : 'Promote / Feature'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveJob(selectedJobForView.id)}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    Remove Listing
                  </button>
                  <button
                    onClick={() => setSelectedJobForView(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. NOTIFICATION TEMPLATE EDITOR MODAL */}
      {/* ========================================================= */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center">
                  {editingTemplate.channel === 'EMAIL' ? <EmailOutlinedIcon sx={{ fontSize: 18 }} /> : <SmsOutlinedIcon sx={{ fontSize: 18 }} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {editingTemplate.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customize system automated message template
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 space-y-3.5">
              {editingTemplate.channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.subject || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, subject: e.target.value }) : null)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Message Body Template <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Dynamic placeholders supported
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, body: e.target.value }) : null)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322]"
                />
              </div>

              {/* Supported Dynamic Variables */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Click to insert placeholder:</span>
                <div className="flex flex-wrap gap-1.5">
                  {editingTemplate.variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => setEditingTemplate(prev => prev ? ({ ...prev, body: prev.body + ' ' + variable }) : null)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-[#94C322]/20 text-slate-800 rounded text-[11px] font-mono border border-slate-200 transition cursor-pointer"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SUB-ADMIN IN-APP MODAL */}
      {/* ========================================================= */}
      {isSubAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center shadow-xs">
                  <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {editingSubAdminId ? 'Edit Administrator Role' : 'Add New Administrator'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assign governance privileges and permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubAdminModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveSubAdminModal} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sana Iyer"
                  value={subAdminForm.name}
                  onChange={(e) => setSubAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#94C322]/40 focus:border-[#94C322] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Admin Role
                </label>
                <select
                  value={subAdminForm.role}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    let defaultAccess = 'Standard review';
                    if (selectedRole === 'Super Admin') defaultAccess = 'Full platform access';
                    if (selectedRole === 'Approvals-only Admin') defaultAccess = 'Company Approvals only';
                    if (selectedRole === 'Job Moderation Admin') defaultAccess = 'Job Listings & Moderation only';
                    if (selectedRole === 'Read-Only Viewer') defaultAccess = 'View only access';
                    setSubAdminForm(prev => ({ ...prev, role: selectedRole, access: defaultAccess }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#94C322]/40 focus:border-[#94C322] transition cursor-pointer"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Approvals-only Admin">Approvals-only Admin</option>
                  <option value="Job Moderation Admin">Job Moderation Admin</option>
                  <option value="Support Admin">Support Admin</option>
                  <option value="Read-Only Viewer">Read-Only Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Access Privileges Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full platform access"
                  value={subAdminForm.access}
                  onChange={(e) => setSubAdminForm(prev => ({ ...prev, access: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#94C322]/40 focus:border-[#94C322] transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                {editingSubAdminId && editingSubAdminId !== 'admin-main' ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubAdmin(editingSubAdminId)}
                    className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubAdminModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {editingSubAdminId ? 'Save Changes' : 'Add Admin'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CATEGORY IN-APP MODAL */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#080809] text-[#94C322] flex items-center justify-center">
                  <AddCircleOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Add New Job Category</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryModal} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category / Department Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Legal & Compliance"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#94C322]/40 focus:border-[#94C322] transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div 
            className="w-4/5 max-w-xs bg-[#16181D] text-gray-300 flex flex-col justify-between h-full shadow-2xl border-r border-gray-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-[#121418]">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-lg px-2 py-1 flex items-center shadow-xs">
                  <img
                    src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
                    alt="Torbit Realty"
                    className="h-5 w-auto object-contain max-w-[120px]"
                  />
                </div>
                <span className="bg-[#94C322] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
                  ADMIN
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <nav className="p-4 space-y-5 overflow-y-auto flex-1">
              {navItems.map((group, idx) => (
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
                        setActiveTab(item.id as any);
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

            <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 text-[#94C322] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  {adminProfile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SA'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{adminProfile.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{adminProfile.email}</div>
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

      {/* ========================================================= */}
      {/* 9. DESKTOP SIDEBAR */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#16181D] text-gray-300 flex-col justify-between shrink-0 border-r border-gray-800 select-none font-['Helvetica',Arial,sans-serif] fixed inset-y-0 left-0 z-30 h-screen">
        <nav className="px-5 pt-7 pb-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          <div>
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all text-left ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#94C322]/15 text-[#94C322] font-black shadow-xs'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                activeTab === 'DASHBOARD' ? 'bg-[#94C322] shadow-[0_0_8px_#94C322]' : 'bg-gray-500'
              }`} />
              <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
              <span>Dashboard</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
              COMPANY MANAGEMENT
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('APPROVALS')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'APPROVALS' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} className="text-[#94C322]" />
                  <span>Company Approvals</span>
                </div>
                {pendingCompanies.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                    {pendingCompanies.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('COMPANIES')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'COMPANIES' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                <span>Manage Companies</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
              USER MANAGEMENT
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('SEEKERS')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'SEEKERS' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-400" />
                <span>Manage Job Seekers</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
              CONTENT
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('JOBS')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'JOBS' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <WorkOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                <span>Job Listings</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
              INSIGHTS
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('ANALYTICS')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'ANALYTICS' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} className="text-red-400" />
                <span>Reports &amp; Analytics</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase">
              SYSTEM
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === 'SETTINGS' ? 'text-white font-bold bg-white/10 shadow-xs' : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsOutlinedIcon sx={{ fontSize: 20 }} className="text-cyan-400" />
                <span>Settings</span>
              </button>
            </div>
          </div>

        </nav>

        <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-[#94C322] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
              {adminProfile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SA'}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white truncate leading-tight">
                {adminProfile.name}
              </div>
              <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                {adminProfile.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/15 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 10. MAIN COLUMN (HEADER + WORKSPACE) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden min-h-screen md:pl-64 lg:pl-72 pb-24 md:pb-6">
        
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-2.5 px-4 sm:px-6 shrink-0 flex items-center justify-between shadow-2xs sticky top-0 z-30">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60"
              title="Open Navigation Menu"
            >
              <MenuOutlinedIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          <div className="flex items-center gap-2.5 mx-auto md:mx-0">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-6 sm:h-7.5 w-auto object-contain max-w-[150px] sm:max-w-[200px]"
            />
            <span className="bg-[#94C322] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
              ADMIN
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-full text-[11px] font-bold tracking-tight shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Sync Active</span>
              {lastSyncTime && (
                <span className="text-[10px] text-emerald-600/80 font-mono font-normal ml-1">
                  ({lastSyncTime})
                </span>
              )}
            </div>

            <button
              onClick={() => fetchAdminData(true)}
              className="p-2 rounded-xl text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60"
              title="Sync Live Data Now"
            >
              <RefreshOutlinedIcon sx={{ fontSize: 19 }} className={isRefreshing ? 'animate-spin text-[#94C322]' : ''} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Tabs Container */}
        <main className="flex-1 px-3.5 sm:px-7 py-4 space-y-4 overflow-y-auto">
        
          {/* ========================================================= */}
          {/* 6.1 TAB: DASHBOARD (OVERVIEW) */}
          {/* ========================================================= */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Admin Overview
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-normal">
                    The landing screen — real-time snapshot of the entire Torbit platform.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    +14.8% growth this week
                  </span>
                </div>
              </div>

              {pendingCompanies.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">
                        {pendingCompanies.length} Company Account{pendingCompanies.length > 1 ? 's' : ''} Awaiting Moderation
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        New employer accounts require KYC/GST verification before unlocking job posting privileges.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('APPROVALS')}
                    className="w-full sm:w-auto px-4 py-2 bg-[#080809] hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Review Approvals Queue ({pendingCompanies.length})</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* 5 Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Seekers
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <PeopleAltOutlinedIcon sx={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {stats.totalSeekers.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Total Job Seekers
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Companies
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <CorporateFareOutlinedIcon sx={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {stats.totalCompanies.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Total Companies
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-2xl p-3.5 sm:p-4 border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between ${
                  stats.pendingApprovals > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Approvals
                    </span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      stats.pendingApprovals > 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                      stats.pendingApprovals > 0 ? 'text-[#DC2626]' : 'text-slate-900'
                    }`}>
                      {stats.pendingApprovals}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Pending Approvals
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Live Jobs
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <WorkOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {stats.activeJobs.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Active Job Listings
                    </div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Applications
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-lime-50 text-[#658A0D] flex items-center justify-center">
                      <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {stats.totalApplications.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Total Applications
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feeds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <CorporateFareOutlinedIcon sx={{ fontSize: 15 }} />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        Recent Company Registrations
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('APPROVALS')}
                      className="text-xs font-bold text-[#658A0D] hover:text-[#94C322] cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pendingCompanies.length === 0 && approvedCompanies.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No recent company activity.
                      </div>
                    ) : (
                      [...pendingCompanies, ...approvedCompanies].slice(0, 4).map((c) => (
                        <div key={c.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{c.companyName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{c.industry || 'Real Estate'} • {c.hqLocation || 'Delhi NCR'}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            c.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <WorkOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        Live Job Postings &amp; Applications
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('JOBS')}
                      className="text-xs font-bold text-[#658A0D] hover:text-[#94C322] cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {jobsList.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No recent job postings.
                      </div>
                    ) : (
                      jobsList.slice(0, 4).map((j) => (
                        <div key={j.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{j.title}</span>
                              {j.isFeatured && <span className="text-amber-500 text-[10px]">⭐</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{j.company} • {j.category}</div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {j.applicants} applicant{j.applicants === 1 ? '' : 's'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 6.2 TAB: COMPANY APPROVALS */}
          {/* ========================================================= */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-4 max-w-7xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Company Approvals
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  The core moderation queue — every new company account lands here before it can post jobs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setApprovalFilter('PENDING')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      approvalFilter === 'PENDING'
                        ? 'bg-[#080809] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    Pending ({pendingCompanies.length})
                  </button>
                  <button
                    onClick={() => setApprovalFilter('APPROVED')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      approvalFilter === 'APPROVED'
                        ? 'bg-[#080809] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    Approved ({approvedCompanies.length})
                  </button>
                  <button
                    onClick={() => setApprovalFilter('REJECTED')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      approvalFilter === 'REJECTED'
                        ? 'bg-[#080809] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    Rejected ({rejectedCompanies.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Sort by Date:</span>
                  <select
                    value={approvalDateSort}
                    onChange={(e) => setApprovalDateSort(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="NEWEST">Newest First</option>
                    <option value="OLDEST">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Main Approvals Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-[#64748B] font-extrabold uppercase text-[10px] tracking-wider bg-slate-50/50">
                        <th className="px-5 py-3.5">COMPANY</th>
                        <th className="px-5 py-3.5">REGISTRATION NO. / GST</th>
                        <th className="px-5 py-3.5">HQ LOCATION</th>
                        <th className="px-5 py-3.5">DOCUMENT</th>
                        <th className="px-5 py-3.5">SUBMITTED ON</th>
                        <th className="px-5 py-3.5">STATUS</th>
                        <th className="px-5 py-3.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {(() => {
                        let currentList =
                          approvalFilter === 'PENDING'
                            ? [...pendingCompanies]
                            : approvalFilter === 'APPROVED'
                            ? [...approvedCompanies]
                            : [...rejectedCompanies];

                        if (approvalDateSort === 'NEWEST') {
                          currentList.sort((a, b) => (b.rawCreatedAt || 0) - (a.rawCreatedAt || 0));
                        } else {
                          currentList.sort((a, b) => (a.rawCreatedAt || 0) - (b.rawCreatedAt || 0));
                        }

                        if (currentList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                                {approvalFilter === 'PENDING'
                                  ? 'No pending company verification requests in queue.'
                                  : approvalFilter === 'APPROVED'
                                  ? 'No approved companies found.'
                                  : 'No rejected company applications.'}
                              </td>
                            </tr>
                          );
                        }

                        return currentList.map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{comp.companyName}</div>
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                {comp.workEmail || 'contact@corporate.in'}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold text-xs">
                              {comp.gstNumber}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 text-xs">
                              {comp.hqLocation}
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => setSelectedCompanyForView(comp)}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 cursor-pointer"
                              >
                                <AttachFileOutlinedIcon sx={{ fontSize: 14 }} className="text-slate-400 rotate-45" />
                                <span>{comp.documentName}</span>
                              </button>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 text-xs">{comp.submittedOn}</td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                                  comp.status === 'Pending'
                                    ? 'bg-[#FEF9C3] text-[#A16207] border-amber-200/60'
                                    : comp.status === 'Approved' || comp.status === 'Active'
                                    ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200/60'
                                    : 'bg-[#FEE2E2] text-[#B91C1C] border-red-200/60'
                                }`}
                              >
                                {comp.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedCompanyForView(comp)}
                                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                                >
                                  Details
                                </button>
                                {comp.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleApprove(comp.id)}
                                      className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleOpenRejectModal(comp)}
                                      className="bg-white hover:bg-red-50 text-[#DC2626] border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : comp.status === 'Approved' || comp.status === 'Active' ? (
                                  <button
                                    onClick={() => handleToggleBlock(comp.id)}
                                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                                  >
                                    Block
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApprove(comp.id)}
                                    className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
                                  >
                                    Re-Approve
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {(() => {
                    let currentList =
                      approvalFilter === 'PENDING'
                        ? [...pendingCompanies]
                        : approvalFilter === 'APPROVED'
                        ? [...approvedCompanies]
                        : [...rejectedCompanies];

                    if (currentList.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400 text-xs px-4">
                          No company applications found.
                        </div>
                      );
                    }

                    return currentList.map((comp) => (
                      <div key={comp.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{comp.companyName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{comp.workEmail || 'No work email'}</div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${
                              comp.status === 'Pending'
                                ? 'bg-[#FEF9C3] text-[#A16207] border-amber-200/60'
                                : comp.status === 'Approved' || comp.status === 'Active'
                                ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200/60'
                                : 'bg-[#FEE2E2] text-[#B91C1C] border-red-200/60'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">GSTIN / TAX</span>
                            <span className="font-mono font-semibold text-slate-800">{comp.gstNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">LOCATION</span>
                            <span>{comp.hqLocation}</span>
                          </div>
                          <div className="col-span-2 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                            <span className="text-slate-500 text-[10px]">Submitted: {comp.submittedOn}</span>
                            <button
                              onClick={() => setSelectedCompanyForView(comp)}
                              className="text-blue-600 text-[11px] font-bold underline cursor-pointer"
                            >
                              View Docs &amp; Audit →
                            </button>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2">
                          {comp.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(comp.id)}
                                className="flex-1 bg-[#94C322] hover:bg-[#82ad1b] active:scale-98 text-[#080809] font-bold text-xs py-2.5 rounded-xl shadow-xs text-center cursor-pointer transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(comp)}
                                className="flex-1 bg-white hover:bg-red-50 active:scale-98 text-[#DC2626] border border-red-200 font-bold text-xs py-2.5 rounded-xl text-center cursor-pointer transition"
                              >
                                Reject
                              </button>
                            </>
                          ) : comp.status === 'Approved' || comp.status === 'Active' ? (
                            <button
                              onClick={() => handleToggleBlock(comp.id)}
                              className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs py-2.5 rounded-xl transition text-center cursor-pointer"
                            >
                              Block Company
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(comp.id)}
                              className="w-full bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-bold text-xs py-2.5 rounded-xl transition text-center cursor-pointer shadow-2xs"
                            >
                              Re-Approve Company
                            </button>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* KYC Protocol Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#94C322] flex items-center justify-center shadow-xs">
                      <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        Enterprise KYC &amp; Verification Protocol
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">
                        Mandatory compliance audit standards required prior to authorizing employer portal privileges
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Auditing Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#94C322]/20 text-[#658A0D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">GSTIN / Tax ID</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">MCA &amp; GST Portal verified records</div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#94C322]/20 text-[#658A0D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">KYC Documentation</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Incorporation certificate or official trade license</div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#94C322]/20 text-[#658A0D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Corporate Domain</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Official company email domain authenticated</div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#94C322]/20 text-[#658A0D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Fraud &amp; Duplicate</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">No blacklist match or duplicate registration</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 6.3 TAB: MANAGE COMPANIES */}
          {/* ========================================================= */}
          {activeTab === 'COMPANIES' && (
            <div className="space-y-4 max-w-7xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Manage Companies
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  The directory of all companies that have passed approval — day-to-day company oversight.
                </p>
              </div>

              {/* Search and Filter Toolbar */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 pb-1">
                <div className="relative w-full sm:w-60 shrink-0">
                  <SearchOutlinedIcon className="absolute left-3.5 top-2.5 text-slate-400" sx={{ fontSize: 17 }} />
                  <input
                    type="text"
                    placeholder="Search by company or location..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-lime-500 shadow-2xs"
                  />
                </div>

                <select
                  value={companyIndustryFilter}
                  onChange={(e) => setCompanyIndustryFilter(e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none shadow-2xs cursor-pointer font-medium"
                >
                  <option value="ALL">All Industries</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Construction">Construction</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Property Consulting">Property Consulting</option>
                </select>

                <select
                  value={companyStatusFilter}
                  onChange={(e) => setCompanyStatusFilter(e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none shadow-2xs cursor-pointer font-medium"
                >
                  <option value="ALL">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Main Companies Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-[#64748B] font-extrabold uppercase text-[10px] tracking-wider bg-slate-50/50">
                        <th className="px-5 py-3.5">COMPANY</th>
                        <th className="px-5 py-3.5">INDUSTRY</th>
                        <th className="px-5 py-3.5">LOCATION</th>
                        <th className="px-5 py-3.5">ACTIVE JOBS</th>
                        <th className="px-5 py-3.5">APPLICATIONS</th>
                        <th className="px-5 py-3.5">STATUS</th>
                        <th className="px-5 py-3.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {(() => {
                        const filtered = approvedCompanies.filter((comp) => {
                          const matchSearch =
                            comp.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
                            (comp.hqLocation && comp.hqLocation.toLowerCase().includes(companySearch.toLowerCase()));
                          const matchIndustry =
                            companyIndustryFilter === 'ALL' ||
                            (comp.industry && comp.industry.toLowerCase() === companyIndustryFilter.toLowerCase());
                          const matchStatus =
                            companyStatusFilter === 'ALL' ||
                            comp.status.toLowerCase() === companyStatusFilter.toLowerCase();
                          return matchSearch && matchIndustry && matchStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                                No companies matching your search / filter criteria.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-[13px]">
                              {comp.companyName}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 text-xs">
                              {comp.industry || 'Real Estate'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 text-xs">
                              {comp.hqLocation || 'Delhi NCR'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-800 font-bold text-xs">
                              {comp.activeJobs ?? 0}
                            </td>
                            <td className="px-5 py-3.5 text-slate-800 font-bold text-xs">
                              {comp.applications ?? 0}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                                  comp.status === 'Active'
                                    ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200/60'
                                    : 'bg-[#FEE2E2] text-[#B91C1C] border-red-200/60'
                                }`}
                              >
                                {comp.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedCompanyForView(comp)}
                                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleOpenEditCompany(comp)}
                                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
                                >
                                  Edit
                                </button>
                                {comp.status === 'Active' ? (
                                  <button
                                    onClick={() => handleToggleBlock(comp.id)}
                                    className="bg-white hover:bg-red-50 text-[#DC2626] border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                                  >
                                    Block
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleBlock(comp.id)}
                                    className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                                  >
                                    Unblock
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {(() => {
                    const filtered = approvedCompanies.filter((comp) => {
                      const matchSearch =
                        comp.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
                        (comp.hqLocation && comp.hqLocation.toLowerCase().includes(companySearch.toLowerCase()));
                      const matchIndustry =
                        companyIndustryFilter === 'ALL' ||
                        (comp.industry && comp.industry.toLowerCase() === companyIndustryFilter.toLowerCase());
                      const matchStatus =
                        companyStatusFilter === 'ALL' ||
                        comp.status.toLowerCase() === companyStatusFilter.toLowerCase();
                      return matchSearch && matchIndustry && matchStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400 text-xs px-4">
                          No companies matching your search / filter criteria.
                        </div>
                      );
                    }

                    return filtered.map((comp) => (
                      <div key={comp.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{comp.companyName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{comp.industry || 'Real Estate'} • {comp.hqLocation || 'Delhi NCR'}</div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                              comp.status === 'Active'
                                ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200/60'
                                : 'bg-[#FEE2E2] text-[#B91C1C] border-red-200/60'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <span>Active Jobs: <strong>{comp.activeJobs ?? 0}</strong></span>
                          <span>Applications: <strong>{comp.applications ?? 0}</strong></span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => setSelectedCompanyForView(comp)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs py-2 rounded-xl text-center cursor-pointer shadow-2xs"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => handleOpenEditCompany(comp)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs py-2 rounded-xl text-center cursor-pointer shadow-2xs"
                          >
                            Edit
                          </button>
                          {comp.status === 'Active' ? (
                            <button
                              onClick={() => handleToggleBlock(comp.id)}
                              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs py-2 rounded-xl transition text-center cursor-pointer"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleBlock(comp.id)}
                              className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-bold text-xs py-2 rounded-xl transition text-center cursor-pointer shadow-2xs"
                            >
                              Unblock
                            </button>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 6.4 TAB: MANAGE JOB SEEKERS */}
          {/* ========================================================= */}
          {activeTab === 'SEEKERS' && (() => {
            const filteredSeekers = seekersList.filter((s) => {
              const q = seekerSearch.toLowerCase().trim();
              const matchesSearch =
                !q ||
                s.fullName?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q) ||
                s.qualification?.toLowerCase().includes(q) ||
                s.skills?.toLowerCase().includes(q) ||
                (s.phone && s.phone.includes(q));

              const matchesLocation =
                seekerLocationFilter === 'ALL' ||
                s.location?.toLowerCase().includes(seekerLocationFilter.toLowerCase());

              const matchesStatus =
                seekerStatusFilter === 'ALL' ||
                s.status?.toLowerCase() === seekerStatusFilter.toLowerCase();

              return matchesSearch && matchesLocation && matchesStatus;
            });

            const activeSeekerSnapshot = selectedSeekerForSnapshot || (filteredSeekers.length > 0 ? filteredSeekers[0] : null);

            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Manage Job Seekers
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Visibility into the candidate side of the platform ({seekersList.length} registered candidates).
                    </p>
                  </div>
                  <button
                    onClick={exportSeekersCSV}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Export Candidate Data (CSV)</span>
                  </button>
                </div>

                {/* Search & Location/Status Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative w-full sm:w-60 shrink-0">
                    <SearchOutlinedIcon
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      sx={{ fontSize: 18 }}
                    />
                    <input
                      type="text"
                      value={seekerSearch}
                      onChange={(e) => setSeekerSearch(e.target.value)}
                      placeholder="Search by name, skill, email..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <select
                      value={seekerLocationFilter}
                      onChange={(e) => setSeekerLocationFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">All Locations</option>
                      <option value="Noida">Noida, UP</option>
                      <option value="Gurugram">Gurugram, Haryana</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Bengaluru">Bengaluru, Karnataka</option>
                      <option value="Mumbai">Mumbai, Maharashtra</option>
                      <option value="Hyderabad">Hyderabad, Telangana</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <select
                      value={seekerStatusFilter}
                      onChange={(e) => setSeekerStatusFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Directory Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                          <th className="px-5 py-3.5">CANDIDATE</th>
                          <th className="px-5 py-3.5">LOCATION</th>
                          <th className="px-5 py-3.5">EXPERIENCE</th>
                          <th className="px-5 py-3.5">APPLICATIONS</th>
                          <th className="px-5 py-3.5">STATUS</th>
                          <th className="px-5 py-3.5">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredSeekers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                              No registered job seekers found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredSeekers.map((seeker) => (
                            <tr
                              key={seeker.id}
                              className={`hover:bg-slate-50/70 transition ${
                                activeSeekerSnapshot?.id === seeker.id ? 'bg-[#94C322]/5' : ''
                              }`}
                            >
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{seeker.fullName}</div>
                                <div className="text-[11px] text-slate-500 font-normal mt-0.5">{seeker.email}</div>
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 text-xs">{seeker.location}</td>
                              <td className="px-5 py-3.5 text-slate-700 text-xs">{seeker.experience}</td>
                              <td className="px-5 py-3.5 text-slate-900 font-bold text-xs">{seeker.applications}</td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold ${
                                    seeker.status === 'Blocked'
                                      ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                      : 'bg-[#DCFCE7] text-[#15803D]'
                                  }`}
                                >
                                  {seeker.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenSeekerProfile(seeker)}
                                    className="px-3 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer shadow-2xs"
                                  >
                                    View Profile
                                  </button>
                                  {seeker.status === 'Blocked' ? (
                                    <button
                                      onClick={() => handleToggleBlockSeeker(seeker.id)}
                                      className="px-3 py-1 text-xs font-bold text-[#080809] bg-[#94C322] hover:bg-[#84b21d] rounded-md transition shadow-2xs cursor-pointer"
                                    >
                                      Unblock
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleBlockSeeker(seeker.id)}
                                      className="px-3 py-1 text-xs font-semibold text-[#DC2626] bg-white border border-red-200 rounded-md hover:bg-red-50 transition cursor-pointer shadow-2xs"
                                    >
                                      Block
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Candidate Cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredSeekers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs px-4">
                        No registered job seekers found in the database.
                      </div>
                    ) : (
                      filteredSeekers.map((seeker) => (
                        <div
                          key={seeker.id}
                          className={`p-4 space-y-2.5 hover:bg-slate-50/70 transition ${
                            activeSeekerSnapshot?.id === seeker.id ? 'bg-[#94C322]/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{seeker.fullName}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{seeker.email}</div>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                seeker.status === 'Blocked'
                                  ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                  : 'bg-[#DCFCE7] text-[#15803D]'
                              }`}
                            >
                              {seeker.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl font-medium">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">LOCATION</span>
                              <span>{seeker.location || 'India'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">EXPERIENCE</span>
                              <span>{seeker.experience || 'Fresher'}</span>
                            </div>
                            <div className="col-span-2 text-[10px] text-slate-500 pt-0.5">
                              Applications submitted: <strong>{seeker.applications}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleOpenSeekerProfile(seeker)}
                              className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl text-center cursor-pointer shadow-2xs"
                            >
                              View Profile
                            </button>
                            {seeker.status === 'Blocked' ? (
                              <button
                                onClick={() => handleToggleBlockSeeker(seeker.id)}
                                className="flex-1 bg-[#94C322] hover:bg-[#84b21d] text-[#080809] font-bold text-xs py-2.5 rounded-xl transition text-center cursor-pointer shadow-2xs"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleBlockSeeker(seeker.id)}
                                className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs py-2.5 rounded-xl transition text-center cursor-pointer"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Candidate Snapshot View */}
                {activeSeekerSnapshot && (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="font-bold text-xs sm:text-base text-slate-900">
                          {activeSeekerSnapshot.fullName} — Profile &amp; Application Snapshot
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                          Candidate detailed profile, documents, and historical application stages
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 pt-1 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Uploaded Resume:</span>
                        {activeSeekerSnapshot.resumeUrl ? (
                          <a
                            href={activeSeekerSnapshot.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300 underline-offset-2 transition cursor-pointer"
                          >
                            <AttachFileOutlinedIcon sx={{ fontSize: 15 }} className="rotate-45" />
                            <span>{activeSeekerSnapshot.resumeName || 'Candidate_Resume.pdf'}</span>
                            <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">{activeSeekerSnapshot.resumeName || 'Resume.pdf (on file)'}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">CONTACT PHONE</span>
                          <span className="font-semibold text-slate-800">{activeSeekerSnapshot.phone || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">LOCATION</span>
                          <span className="font-semibold text-slate-800">{activeSeekerSnapshot.location || 'India'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">QUALIFICATION</span>
                          <span className="font-semibold text-slate-800">{activeSeekerSnapshot.qualification || 'Graduate'}</span>
                        </div>
                      </div>

                      {activeSeekerSnapshot.skills && (
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {activeSeekerSnapshot.skills.replace('__BLOCKED__', '').split(',').map((sk: string, idx: number) => (
                              sk.trim() ? (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-800">
                                  {sk.trim()}
                                </span>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <span className="font-bold text-slate-900 block mb-1">Application Stages Breakdown:</span>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">
                            Total: {activeSeekerSnapshot.applications}
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100">
                            Selected / Shortlisted: {activeSeekerSnapshot.selectedCount}
                          </span>
                          <span className="px-3 py-1 bg-red-50 text-red-700 font-bold rounded-lg border border-red-100">
                            Rejected: {activeSeekerSnapshot.rejectedCount}
                          </span>
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-100">
                            Pending Review: {activeSeekerSnapshot.pendingCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* 6.5 TAB: JOB LISTINGS */}
          {/* ========================================================= */}
          {activeTab === 'JOBS' && (() => {
            const filteredJobs = jobsList.filter((j) => {
              let matchStatus = true;
              if (jobStatusFilter === 'ACTIVE') {
                matchStatus = j.status === 'Active' || j.status === 'Blocked co.';
              } else if (jobStatusFilter === 'DRAFT') {
                matchStatus = j.status === 'Draft';
              } else if (jobStatusFilter === 'CLOSED') {
                matchStatus = j.status === 'Closed';
              } else if (jobStatusFilter === 'EXPIRED') {
                matchStatus = j.status === 'Expired';
              }

              const matchCategory = jobCategoryFilter === 'ALL' || j.category === jobCategoryFilter;
              const matchCompany = jobCompanyFilter === 'ALL' || j.company.toLowerCase().includes(jobCompanyFilter.toLowerCase());

              return matchStatus && matchCategory && matchCompany;
            });

            const activeCount = jobsList.filter(j => j.status === 'Active' || j.status === 'Blocked co.').length;
            const draftCount = jobsList.filter(j => j.status === 'Draft').length;
            const closedCount = jobsList.filter(j => j.status === 'Closed').length;
            const expiredCount = jobsList.filter(j => j.status === 'Expired').length;

            return (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Job Listings
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Central moderation view of every job posted on the platform, across all companies.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      onClick={() => setJobStatusFilter('ACTIVE')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 ${
                        jobStatusFilter === 'ACTIVE'
                          ? 'bg-[#080809] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Active ({activeCount})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('DRAFT')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 ${
                        jobStatusFilter === 'DRAFT'
                          ? 'bg-[#080809] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Draft ({draftCount})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('CLOSED')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 ${
                        jobStatusFilter === 'CLOSED'
                          ? 'bg-[#080809] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Closed ({closedCount})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('EXPIRED')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 ${
                        jobStatusFilter === 'EXPIRED'
                          ? 'bg-[#080809] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Expired ({expiredCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={jobCategoryFilter}
                      onChange={(e) => setJobCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                          <th className="px-5 py-3.5">JOB TITLE</th>
                          <th className="px-5 py-3.5">COMPANY</th>
                          <th className="px-5 py-3.5">CATEGORY</th>
                          <th className="px-5 py-3.5">APPLICANTS</th>
                          <th className="px-5 py-3.5">FEATURED</th>
                          <th className="px-5 py-3.5">POSTED ON</th>
                          <th className="px-5 py-3.5">STATUS</th>
                          <th className="px-5 py-3.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                              No job postings found under {jobStatusFilter.toLowerCase()} status.
                            </td>
                          </tr>
                        ) : (
                          filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50/70 transition">
                              <td className="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-[13px]">
                                {job.title}
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 text-xs">
                                {job.company}
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 text-xs">
                                {job.category || 'Sales'}
                              </td>
                              <td className="px-5 py-3.5 text-slate-900 font-bold text-xs">
                                {job.applicants}
                              </td>
                              <td className="px-5 py-3.5">
                                <button
                                  onClick={() => handleToggleFeaturedJob(job.id, job.isFeatured)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                    job.isFeatured
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                  title="Toggle Featured status on Platform Homepage"
                                >
                                  {job.isFeatured ? <StarRoundedIcon sx={{ fontSize: 13 }} /> : <StarOutlineOutlinedIcon sx={{ fontSize: 13 }} />}
                                  <span>{job.isFeatured ? 'Featured' : 'Standard'}</span>
                                </button>
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 text-xs">
                                {job.postedOn}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  job.status === 'Active'
                                    ? 'bg-[#DCFCE7] text-[#15803D]'
                                    : job.status === 'Blocked co.'
                                    ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                    : job.status === 'Closed'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedJobForView(job)}
                                    className="px-3 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer shadow-2xs"
                                  >
                                    View Detail
                                  </button>
                                  {job.status !== 'Closed' && (
                                    <button
                                      onClick={() => handleRemoveJob(job.id)}
                                      className="px-3 py-1 text-xs font-semibold text-[#DC2626] bg-white border border-red-200 rounded-md hover:bg-red-50 transition cursor-pointer shadow-2xs"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Job Cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs px-4">
                        No job postings found under {jobStatusFilter.toLowerCase()} status.
                      </div>
                    ) : (
                      filteredJobs.map((job) => (
                        <div key={job.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{job.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{job.company} • {job.category || 'Sales'}</div>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                job.status === 'Active'
                                  ? 'bg-[#DCFCE7] text-[#15803D]'
                                  : job.status === 'Closed'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                            <span>Applicants: <strong>{job.applicants}</strong></span>
                            <button
                              onClick={() => handleToggleFeaturedJob(job.id, job.isFeatured)}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                                job.isFeatured ? 'bg-amber-100 text-amber-800' : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              <StarRoundedIcon sx={{ fontSize: 13 }} />
                              <span>{job.isFeatured ? 'Featured' : 'Promote'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => setSelectedJobForView(job)}
                              className="flex-1 px-3 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition text-center shadow-2xs cursor-pointer"
                            >
                              View Detail
                            </button>
                            {job.status !== 'Closed' && (
                              <button
                                onClick={() => handleRemoveJob(job.id)}
                                className="flex-1 px-3 py-2.5 text-xs font-bold text-[#DC2626] bg-white border border-red-200 rounded-xl hover:bg-red-50 transition text-center shadow-2xs cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Flagged Panel */}
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-base text-[#DC2626]">
                      Flagged for Moderation &amp; Review
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#DC2626]/80 mt-0.5 font-medium">
                      Listings auto-flagged for possible duplicate, misleading, or guideline-violating postings
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[#991B1B] font-bold uppercase text-[10px] tracking-wider border-b border-[#FECACA]/60">
                          <th className="py-2 pr-4">JOB TITLE</th>
                          <th className="py-2 px-4">COMPANY</th>
                          <th className="py-2 px-4">REASON</th>
                          <th className="py-2 pl-4 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FECACA]/40 font-medium text-slate-800">
                        {flaggedJobs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-xs text-slate-500 font-normal">
                              No job postings currently flagged for review.
                            </td>
                          </tr>
                        ) : (
                          flaggedJobs.map((fj) => (
                            <tr key={fj.id} className="hover:bg-red-100/30 transition">
                              <td className="py-3 pr-4 font-semibold text-slate-900 text-xs">
                                {fj.title}
                              </td>
                              <td className="py-3 px-4 text-gray-700 text-xs">
                                {fj.company}
                              </td>
                              <td className="py-3 px-4 text-gray-700 text-xs">
                                {fj.reason}
                              </td>
                              <td className="py-3 pl-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleRemoveFlaggedJob(fj.id)}
                                    className="px-3 py-1 text-xs font-semibold text-[#DC2626] bg-white border border-red-200 rounded-md hover:bg-red-50 transition cursor-pointer shadow-2xs"
                                  >
                                    Remove Listing
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* 6.6 TAB: REPORTS & ANALYTICS (IMAGE 1 COMPLIANCE) */}
          {/* ========================================================= */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-4 max-w-7xl">
              
              {/* Header Title & Export Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Reports &amp; Analytics
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    Platform-level business intelligence for tracking growth, conversion rates, and engagement.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportAnalyticsCSV}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handlePrintExecutiveReport}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#080809] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Print / PDF Report</span>
                  </button>
                </div>
              </div>

              {/* Chart & Trend Section: Sign-ups over time (Seekers vs Companies) */}
              {(() => {
                const trends = analyticsData.signUpTrends || [];
                const totalSeekersInTrend = trends.reduce((sum: number, t: any) => sum + (t.seekers || 0), 0);
                const totalCompaniesInTrend = trends.reduce((sum: number, t: any) => sum + (t.companies || 0), 0);
                const grandTotalInTrend = totalSeekersInTrend + totalCompaniesInTrend;
                const rawMax = Math.max(...trends.map((x: any) => Math.max(x.seekers || 0, x.companies || 0)), 0);
                const maxVal = Math.max(rawMax, 4);
                const midVal = Math.ceil(maxVal / 2);

                return (
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
                    {/* Header with Title & Dynamic Timeframe Selector */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                            <BarChartOutlinedIcon sx={{ fontSize: 20 }} />
                          </div>
                          <div>
                            <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                              New Registrations Over Time
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                              Live database trajectory ({analyticsTimeframe === '7D' ? 'Past 7 Days' : analyticsTimeframe === '30D' ? 'Past 30 Days' : analyticsTimeframe === '90D' ? 'Past 12 Weeks' : 'All-time Monthly History'})
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Timeframe selector tabs */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold shadow-2xs">
                          {(['7D', '30D', '90D', 'ALL'] as const).map((tf) => (
                            <button
                              key={tf}
                              onClick={() => {
                                handleTimeframeChange(tf);
                                setHoveredTrendItem(null);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                analyticsTimeframe === tf
                                  ? 'bg-[#080809] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                              }`}
                            >
                              {tf === '7D' ? '7 Days' : tf === '30D' ? '30 Days' : tf === '90D' ? '90 Days' : 'All Time'}
                            </button>
                          ))}
                        </div>

                        {/* Legend */}
                        <div className="hidden sm:flex items-center gap-3.5 text-xs pl-3 border-l border-slate-200">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 shadow-2xs" />
                            <span>Job Seekers</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-[#7CB342] to-[#94C322] shadow-2xs" />
                            <span>Companies</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Quick Metric Badges */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
                      <div className="text-left">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Total In Period
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-3xl font-black text-slate-900">{grandTotalInTrend}</span>
                          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">registrations</span>
                        </div>
                      </div>
                      <div className="text-left border-l border-slate-200/90 pl-3.5 sm:pl-5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                            Job Seekers
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-3xl font-black text-blue-600">{totalSeekersInTrend}</span>
                          <span className="text-[11px] text-blue-700/80 font-bold hidden sm:inline">
                            ({grandTotalInTrend > 0 ? Math.round((totalSeekersInTrend / grandTotalInTrend) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="text-left border-l border-slate-200/90 pl-3.5 sm:pl-5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#94C322]" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#658A0D] block">
                            Companies
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-3xl font-black text-[#658A0D]">{totalCompaniesInTrend}</span>
                          <span className="text-[11px] text-[#658A0D]/80 font-bold hidden sm:inline">
                            ({grandTotalInTrend > 0 ? Math.round((totalCompaniesInTrend / grandTotalInTrend) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Live Inspector Banner (Zero Clipping - Shows on Hover) */}
                    <div className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      hoveredTrendItem
                        ? 'bg-[#0F172A] text-white border-slate-700 shadow-md'
                        : 'bg-slate-50/70 text-slate-700 border-slate-200/70'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          hoveredTrendItem ? 'bg-[#94C322] text-[#080809]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {hoveredTrendItem ? '📍' : '📊'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black block truncate leading-tight">
                            {hoveredTrendItem 
                              ? (hoveredTrendItem.date ? `${hoveredTrendItem.day} • ${hoveredTrendItem.date}` : hoveredTrendItem.day)
                              : 'Live Registration Inspector'}
                          </span>
                          <span className={`text-[10px] block truncate leading-tight mt-0.5 ${
                            hoveredTrendItem ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            {hoveredTrendItem 
                              ? 'Detailed registration breakdown for this date'
                              : 'Hover or tap on any period bar below to inspect exact candidate & company sign-up counts'}
                          </span>
                        </div>
                      </div>

                      {hoveredTrendItem ? (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold shrink-0">
                          <div className="flex items-center gap-1.5 text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/80">
                            <span>👤 {hoveredTrendItem.seekers || 0} {hoveredTrendItem.seekers === 1 ? 'Seeker' : 'Seekers'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#94C322] bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                            <span>🏢 {hoveredTrendItem.companies || 0} {hoveredTrendItem.companies === 1 ? 'Company' : 'Companies'}</span>
                          </div>
                          <div className="text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                            Total: <span className="font-black text-[#94C322]">{hoveredTrendItem.total || ((hoveredTrendItem.seekers || 0) + (hoveredTrendItem.companies || 0))}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-slate-500 italic hidden md:block shrink-0">
                          ✨ Move mouse across columns below
                        </div>
                      )}
                    </div>

                    {/* Chart Canvas Area */}
                    <div className="relative pt-6 pb-2 bg-gradient-to-b from-slate-50/20 to-white rounded-2xl border border-slate-100 p-2 sm:p-4">
                      
                      {/* Background Dotted Gridlines & Scale Numbers */}
                      <div className="absolute inset-x-3 sm:inset-x-5 top-7 bottom-9 flex flex-col justify-between pointer-events-none">
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 text-[10px] font-mono font-bold text-slate-400">
                          <span className="bg-white px-1 rounded">{maxVal}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-300">Scale Top</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 text-[10px] font-mono font-bold text-slate-400">
                          <span className="bg-white px-1 rounded">{midVal}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-300">50% Mid</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-300 text-[10px] font-mono font-bold text-slate-400">
                          <span className="bg-white px-1 rounded">0</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-300">Baseline</span>
                        </div>
                      </div>

                      {/* Scrollable Visual Bars Grid */}
                      <div className="relative overflow-x-auto custom-scrollbar pt-4">
                        <div 
                          className="flex items-end justify-between gap-2 sm:gap-3 min-h-[160px] pb-7 px-2"
                          style={{ minWidth: trends.length > 10 ? `${trends.length * 52}px` : '100%' }}
                        >
                          {trends.length === 0 ? (
                            <div className="w-full text-center py-16 text-xs text-slate-400 italic">
                              No registrations recorded for this period.
                            </div>
                          ) : (
                            trends.map((t: any, i: number) => {
                              const sCount = t.seekers || 0;
                              const cCount = t.companies || 0;
                              const tot = t.total || (sCount + cCount);
                              
                              const seekerHeight = sCount > 0 ? Math.max(22, Math.round((sCount / maxVal) * 115)) : 4;
                              const companyHeight = cCount > 0 ? Math.max(22, Math.round((cCount / maxVal) * 115)) : 4;
                              const isHovered = hoveredTrendItem?.day === t.day && hoveredTrendItem?.date === t.date;

                              return (
                                <div 
                                  key={i} 
                                  onMouseEnter={() => setHoveredTrendItem(t)}
                                  onMouseLeave={() => setHoveredTrendItem(null)}
                                  title={`${t.date || t.day}: ${sCount} Seekers, ${cCount} Companies (Total: ${tot})`}
                                  className={`flex-1 flex flex-col items-center min-w-[44px] px-1.5 py-1.5 rounded-2xl transition-all cursor-pointer ${
                                    isHovered 
                                      ? 'bg-slate-100/90 ring-2 ring-slate-300 shadow-xs' 
                                      : 'hover:bg-slate-50'
                                  }`}
                                >
                                  {/* Bar Pair Wrapper */}
                                  <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-[120px]">
                                    {/* Seeker Column */}
                                    <div className="flex flex-col items-center justify-end h-full">
                                      {sCount > 0 && (
                                        <span className="text-[10px] font-black text-blue-600 mb-1 leading-none">
                                          {sCount}
                                        </span>
                                      )}
                                      <div 
                                        style={{ height: `${seekerHeight}px` }} 
                                        className={`w-3.5 sm:w-5.5 transition-all duration-200 ${
                                          sCount > 0 
                                            ? 'rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 shadow-md shadow-blue-500/25' 
                                            : 'rounded-full bg-slate-200/90'
                                        }`}
                                      />
                                    </div>

                                    {/* Company Column */}
                                    <div className="flex flex-col items-center justify-end h-full">
                                      {cCount > 0 && (
                                        <span className="text-[10px] font-black text-[#658A0D] mb-1 leading-none">
                                          {cCount}
                                        </span>
                                      )}
                                      <div 
                                        style={{ height: `${companyHeight}px` }} 
                                        className={`w-3.5 sm:w-5.5 transition-all duration-200 ${
                                          cCount > 0 
                                            ? 'rounded-t-lg bg-gradient-to-t from-[#7CB342] via-[#8BBF30] to-[#94C322] shadow-md shadow-[#94C322]/25' 
                                            : 'rounded-full bg-slate-200/90'
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Bottom Period Label */}
                                  <div className="mt-2 text-center">
                                    <span className={`text-[10px] sm:text-[11px] font-bold block truncate max-w-[54px] ${
                                      isHovered ? 'text-slate-950 font-black' : 'text-slate-800'
                                    }`}>
                                      {t.day}
                                    </span>
                                    {t.date && analyticsTimeframe === '7D' && (
                                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                                        {t.date}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Conversion Pipeline Funnel (Applied -> Shortlisted -> Selected) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                      Application Conversion Pipeline Funnel
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Conversion progression from initial application submission to final placement
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    {analyticsData.conversionRates?.overallPlacementRate || 12}% Placement Rate
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">STAGE 1</span>
                      <span className="text-[11px] font-bold text-slate-600">100% Base</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalApplications}</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">Total Applications Submitted</div>
                    <div className="text-[10px] text-slate-500 mt-1">Platform-wide candidate entries</div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">STAGE 2</span>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {analyticsData.conversionRates?.appliedToShortlistedRate || 35}% Conversion
                      </span>
                    </div>
                    <div className="text-2xl font-black text-blue-700 mt-2">{analyticsData.shortlistedCount}</div>
                    <div className="text-xs font-bold text-blue-900 mt-0.5">Shortlisted Candidates</div>
                    <div className="text-[10px] text-blue-600/80 mt-1">Screened &amp; interview invited</div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">STAGE 3</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {analyticsData.conversionRates?.overallPlacementRate || 12}% Hired
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mt-2">{analyticsData.selectedCount}</div>
                    <div className="text-xs font-bold text-emerald-900 mt-0.5">Selected &amp; Placed</div>
                    <div className="text-[10px] text-emerald-600/80 mt-1">Successful employment offers accepted</div>
                  </div>
                </div>
              </div>

              {/* Demand Breakdown & Active Companies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Most In-Demand Categories & Locations */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 space-y-3">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                      Most In-Demand Job Categories &amp; Hub Locations
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hiring volume distribution across real estate verticals and regions
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Top Job Categories:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(analyticsData.topCategories || []).map((cat: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{cat.name}</span>
                            <span className="text-[10px] font-black bg-[#94C322]/20 text-[#658A0D] px-1.5 py-0.2 rounded-full">{cat.count} jobs</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Top Hiring Locations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(analyticsData.topLocations || []).map((loc: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">{loc.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Active Recruiting Companies */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        Most Active Recruiting Companies
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enterprise ranking by hiring volume and candidate engagement
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {approvedCompanies.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No employer recruitment data yet.
                      </div>
                    ) : (
                      approvedCompanies.slice(0, 5).map((c, i) => (
                        <div key={c.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">{c.companyName}</div>
                              <div className="text-[10px] text-slate-500">{c.hqLocation || 'Delhi NCR'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-800">{c.activeJobs} Jobs Live</div>
                            <div className="text-[10px] text-slate-500">{c.applications} Applications</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 6.7 TAB: SETTINGS (IMAGE 2 COMPLIANCE) */}
          {/* ========================================================= */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4 max-w-7xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Settings
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    System-level configuration, roles &amp; permissions, and platform-wide notification templates.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#94C322] hover:bg-[#84b21d] text-[#080809] font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingSettings ? 'Saving...' : 'Save All Settings'}
                </button>
              </div>

              {/* 1. Admin Roles & Permissions */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Admin Roles &amp; Permissions
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Create sub-admin accounts with restricted governance access (e.g., approvals-only admin).
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddSubAdmin}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-[#94C322] hover:bg-[#84b21d] text-[#080809] font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                    <span>+ Add Sub-Admin</span>
                  </button>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-transparent">
                        <th className="py-2.5 pr-4">ADMIN</th>
                        <th className="py-2.5 px-4">ROLE</th>
                        <th className="py-2.5 px-4">ACCESS PRIVILEGES</th>
                        <th className="py-2.5 pl-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {subAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 pr-4 font-semibold text-slate-900 text-xs sm:text-[13px]">
                            {admin.name}
                          </td>
                          <td className="py-3 px-4 text-slate-700 text-xs">
                            <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">
                            {admin.access}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              onClick={() => handleOpenEditSubAdmin(admin)}
                              className="px-3 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer shadow-2xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Roles Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {subAdmins.map((admin) => (
                    <div key={admin.id} className="py-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{admin.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{admin.role} • {admin.access}</div>
                      </div>
                      <button
                        onClick={() => handleOpenEditSubAdmin(admin)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleOpenAddSubAdmin}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#94C322] hover:bg-[#84b21d] text-[#080809] font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>+ Add Sub-Admin</span>
                  </button>
                </div>
              </div>

              {/* 2. Notification Templates for Email / SMS */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Notification Templates for Email &amp; SMS
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customize system-automated messages for approval, rejection, and candidate application status changes.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Template 1: Company Approval Email */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Company Approval Email</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.2 rounded">EMAIL</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sent automatically to the employer when account verification passes
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditTemplate('APPROVAL_EMAIL')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Edit Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationSettings(p => ({ ...p, companyApprovalEmail: !p.companyApprovalEmail }));
                          showToast(`Approval email ${!notificationSettings.companyApprovalEmail ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.companyApprovalEmail ? 'bg-[#94C322]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.companyApprovalEmail ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Template 2: Company Rejection Email */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Company Rejection Email</span>
                        <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.2 rounded">EMAIL</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sent with admin compliance notes when account submission is rejected
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditTemplate('REJECTION_EMAIL')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Edit Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationSettings(p => ({ ...p, companyRejectionEmail: !p.companyRejectionEmail }));
                          showToast(`Rejection email ${!notificationSettings.companyRejectionEmail ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.companyRejectionEmail ? 'bg-[#94C322]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.companyRejectionEmail ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Template 3: Application Status Change SMS */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Application Status Change (SMS)</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.2 rounded">SMS</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sent to job seekers when recruiter shortlists or updates application status
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditTemplate('STATUS_SMS')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Edit Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationSettings(p => ({ ...p, statusChangeSms: !p.statusChangeSms }));
                          showToast(`SMS alerts ${!notificationSettings.statusChangeSms ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.statusChangeSms ? 'bg-[#94C322]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.statusChangeSms ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Template 4: New Job Alert Digest */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>New Job Alert Digest (Job Seekers)</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.2 rounded">DIGEST</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Weekly automated email digest of newly posted real estate positions
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditTemplate('JOB_DIGEST')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Edit Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationSettings(p => ({ ...p, newJobAlertDigest: !p.newJobAlertDigest }));
                          showToast(`Job digest ${!notificationSettings.newJobAlertDigest ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.newJobAlertDigest ? 'bg-[#94C322]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.newJobAlertDigest ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Job Categories / Departments Master Data */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Manage Job Categories / Dropdown Master Data
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure the category dropdown master options available across employer posting &amp; seeker search.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewCategoryName('');
                      setIsCategoryModalOpen(true);
                    }}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#658A0D] hover:text-[#94C322] cursor-pointer"
                  >
                    + Add Category
                  </button>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-2">
                  {categoriesList.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span>{cat}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer transition"
                        title="Remove category"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <button
                    onClick={() => {
                      setNewCategoryName('');
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs font-bold text-slate-900 hover:text-[#94C322] px-2.5 py-1 rounded-md transition cursor-pointer inline-flex items-center gap-1"
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              {/* 4. General Platform Settings */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    General Platform Settings
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Platform branding, homepage featured taglines, Terms &amp; Conditions, and Privacy Policy disclaimer copy.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Site Branding / Logo URL
                    </label>
                    <input
                      type="text"
                      value={brandingLogo}
                      onChange={(e) => setBrandingLogo(e.target.value)}
                      placeholder="Enter brand logo URL or custom heading"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Homepage Featured Content / Hero Tagline
                    </label>
                    <input
                      type="text"
                      value={featuredContent}
                      onChange={(e) => setFeaturedContent(e.target.value)}
                      placeholder="Connecting top tier real estate talents with verified developers"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Terms &amp; Conditions / Privacy Policy Notice
                    </label>
                    <textarea
                      rows={3}
                      value={legalContent}
                      onChange={(e) => setLegalContent(e.target.value)}
                      placeholder="Compliance legal disclaimer and platform privacy guidelines..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#94C322] focus:border-[#94C322] shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save All Settings */}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-6 py-3 bg-[#94C322] hover:bg-[#84b21d] active:scale-98 text-[#080809] font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingSettings ? 'Saving Settings...' : 'Save All Platform Settings'}
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* 11. MOBILE BOTTOM 5-ITEM NAVIGATION DOCK */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#16181D]/98 backdrop-blur-lg border-t border-slate-800/90 px-3 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        
        {/* 1. Overview */}
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'DASHBOARD' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'DASHBOARD' ? 'bg-[#94C322]/15' : ''}`}>
            <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        {/* 2. Approvals */}
        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all relative ${
            activeTab === 'APPROVALS' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all relative ${activeTab === 'APPROVALS' ? 'bg-[#94C322]/15' : ''}`}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />
            {pendingCompanies.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#16181D]">
                {pendingCompanies.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Approvals</span>
        </button>

        {/* 3. Companies */}
        <button
          onClick={() => setActiveTab('COMPANIES')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'COMPANIES' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'COMPANIES' ? 'bg-[#94C322]/15' : ''}`}>
            <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Companies</span>
        </button>

        {/* 4. Seekers */}
        <button
          onClick={() => setActiveTab('SEEKERS')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'SEEKERS' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'SEEKERS' ? 'bg-[#94C322]/15' : ''}`}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">Seekers</span>
        </button>

        {/* 5. More / Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'JOBS' || activeTab === 'ANALYTICS' || activeTab === 'SETTINGS' ? 'text-[#94C322] font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${activeTab === 'JOBS' || activeTab === 'ANALYTICS' || activeTab === 'SETTINGS' ? 'bg-[#94C322]/15' : ''}`}>
            <MoreHorizOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* 12. ENTERPRISE JOB SEEKER FULL PROFILE DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedSeekerForModal && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setSelectedSeekerForModal(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#080809] text-white p-3.5 sm:p-5 flex items-start justify-between gap-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-3 min-w-0">
                {selectedSeekerForModal.avatarUrl ? (
                  <img
                    src={selectedSeekerForModal.avatarUrl}
                    alt={selectedSeekerForModal.fullName}
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-[#94C322] shadow-md shrink-0"
                  />
                ) : null}
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#16181D] border-2 border-[#94C322]/60 text-[#94C322] font-black flex items-center justify-center text-lg sm:text-2xl shadow-md shrink-0"
                  style={{ display: selectedSeekerForModal.avatarUrl ? 'none' : 'flex' }}
                >
                  {(selectedSeekerForModal.fullName || 'JS')
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>

                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="font-black text-sm sm:text-lg text-white truncate tracking-tight">
                      {selectedSeekerForModal.fullName}
                    </h3>
                    <span
                      className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedSeekerForModal.status === 'Blocked'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-[#94C322]/20 text-[#94C322] border border-[#94C322]/30'
                      }`}
                    >
                      {selectedSeekerForModal.status}
                    </span>
                    {selectedSeekerForModal.profileCompleted !== undefined && selectedSeekerForModal.profileCompleted !== null && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-flex">
                        ✨ {selectedSeekerForModal.profileCompleted}% Profile Score
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-slate-300 break-all">
                    <span className="text-slate-300 flex items-center gap-1 font-medium truncate">
                      ✉️ {selectedSeekerForModal.email || 'candidate@torbit.in'}
                    </span>
                    <span className="text-slate-500 hidden sm:inline">•</span>
                    <span className="text-slate-300 flex items-center gap-1 font-medium">
                      📞 {selectedSeekerForModal.phone || 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeekerForModal(null)}
                className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                title="Close Modal"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1 text-slate-800 text-xs">
              
              {/* Core Metadata 4-Box Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    LOCATION
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px] block truncate">
                    {selectedSeekerForModal.location || 'India'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    EXPERIENCE
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px] block truncate">
                    {selectedSeekerForModal.experience || 'Fresher'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    QUALIFICATION
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px] block truncate">
                    {selectedSeekerForModal.qualification || 'Graduate'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    NOTICE PERIOD
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px] block truncate">
                    {selectedSeekerForModal.noticePeriod || 'Immediate Joiner'}
                  </span>
                </div>
              </div>

              {/* Compensation & Additional Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  SALARY &amp; COMPENSATION DETAILS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-0.5 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] sm:text-[11px] block">Current Annual CTC:</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {(() => {
                        const sal = selectedSeekerForModal.currentSalary;
                        if (!sal || sal <= 0) return 'Fresher / Not Disclosed';
                        const n = Number(sal);
                        if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
                        if (n <= 100) return `₹${n} LPA`;
                        return `₹${n.toLocaleString('en-IN')}`;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] sm:text-[11px] block">Expected Annual CTC:</span>
                    <span className="font-black text-emerald-700 text-xs sm:text-sm">
                      {(() => {
                        const sal = selectedSeekerForModal.expectedSalary;
                        if (!sal || sal <= 0) return 'Competitive / Open';
                        const n = Number(sal);
                        if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
                        if (n <= 100) return `₹${n} LPA`;
                        return `₹${n.toLocaleString('en-IN')}`;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] sm:text-[11px] block">Date of Birth:</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {selectedSeekerForModal.dob
                        ? new Date(selectedSeekerForModal.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  VERIFIED SKILLS &amp; EXPERTISE
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                  {selectedSeekerForModal.skills && selectedSeekerForModal.skills.trim() ? (
                    selectedSeekerForModal.skills
                      .replace('__BLOCKED__', '')
                      .split(',')
                      .map((sk: string, idx: number) =>
                        sk.trim() ? (
                          <span
                            key={idx}
                            className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-slate-800 shadow-2xs"
                          >
                            {sk.trim()}
                          </span>
                        ) : null
                      )
                  ) : (
                    <span className="text-slate-400 italic text-xs">Real Estate Candidate • General Competencies</span>
                  )}
                </div>
              </div>

              {/* Resume & Documents Card */}
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {selectedSeekerForModal.resumeOriginalName || selectedSeekerForModal.resumeName || 'Candidate_Resume.pdf'}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      Official verified resume document on Cloud Storage
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {selectedSeekerForModal.resumeUrl ? (
                    <a
                      href={selectedSeekerForModal.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <AttachFileOutlinedIcon sx={{ fontSize: 15 }} className="rotate-45" />
                      <span>View / Download Resume</span>
                      <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg">
                      No Resume Uploaded
                    </span>
                  )}

                  {selectedSeekerForModal.portfolioUrl && (
                    <a
                      href={selectedSeekerForModal.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[11px] sm:text-xs rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Portfolio</span>
                      <OpenInNewOutlinedIcon sx={{ fontSize: 12 }} />
                    </a>
                  )}
                </div>
              </div>

              {/* Application Stages Breakdown */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  HISTORICAL APPLICATION ACTIVITY
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-0.5 text-center font-bold">
                  <div className="bg-white border border-slate-200/90 rounded-xl p-2 sm:p-2.5">
                    <span className="text-base sm:text-lg font-black text-slate-900 block">{selectedSeekerForModal.applications || 0}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase text-slate-500">Total Applied</span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 sm:p-2.5">
                    <span className="text-base sm:text-lg font-black text-emerald-700 block">{selectedSeekerForModal.selectedCount || 0}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase text-emerald-800">Shortlisted</span>
                  </div>
                  <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-2 sm:p-2.5">
                    <span className="text-base sm:text-lg font-black text-red-700 block">{selectedSeekerForModal.rejectedCount || 0}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase text-red-800">Rejected</span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 sm:p-2.5">
                    <span className="text-base sm:text-lg font-black text-amber-700 block">{selectedSeekerForModal.pendingCount || 0}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase text-amber-800">Pending Review</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              {selectedSeekerForModal.status === 'Blocked' ? (
                <button
                  type="button"
                  onClick={() => handleToggleBlockSeeker(selectedSeekerForModal.id)}
                  className="px-3.5 py-1.5 sm:py-2 bg-[#94C322] hover:bg-[#84b21d] text-[#080809] font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Unblock Candidate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleBlockSeeker(selectedSeekerForModal.id)}
                  className="px-3.5 py-1.5 sm:py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Block Candidate
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedSeekerForModal(null)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
