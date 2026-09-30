'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RecruiterSidebar from '../../../recruiter/RecruiterSidebar';
import RecruiterTopbar from '../../../recruiter/RecruiterTopbar';
import RecruiterOverview from '../../../recruiter/RecruiterOverview';
import RecruiterJobsTable from '../../../recruiter/RecruiterJobsTable';
import ApplicantReviewPipeline from '../../../recruiter/ApplicantReviewPipeline';
import CompanyProfileSettings from '../../../recruiter/CompanyProfileSettings';
import CreateJobModal from '../../../recruiter/CreateJobModal';

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

    const interval = setInterval(() => {
      loadData(false);
    }, 3500);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData(false);
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

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 antialiased selection:bg-[#94C322]/20">
      <RecruiterSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isApproved={isApproved}
        companyName={company.companyName}
        workEmail={company.workEmail}
        applicantCount={applications.length}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <RecruiterTopbar
          activeTab={activeTab}
          isApproved={isApproved}
          companyName={company.companyName}
          onOpenCreateJob={() => setCreateJobModalOpen(true)}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'OVERVIEW' && (
            <RecruiterOverview
              company={company}
              jobs={jobs}
              applications={applications}
              onOpenCreateJob={() => setCreateJobModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'CREATE_JOB' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs max-w-xl text-center space-y-4 mx-auto mt-6">
              <h3 className="text-base font-black text-slate-900">Job Creation Wizard</h3>
              <p className="text-xs text-slate-500">
                Click below to launch the modal with all 32 real estate specialized categories and custom department options.
              </p>
              <button
                onClick={() => setCreateJobModalOpen(true)}
                className="bg-[#94C322] hover:bg-[#82ad1b] text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                Launch Job Creation Modal →
              </button>
            </div>
          )}

          {activeTab === 'JOBS' && (
            <RecruiterJobsTable
              jobs={jobs}
              onOpenCreateJob={() => setCreateJobModalOpen(true)}
              isApproved={isApproved}
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

        <footer className="w-full bg-[#080809] text-white py-3.5 border-t border-neutral-900 text-center text-xs text-neutral-400 font-medium shrink-0 mt-auto">
          <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Recruiter &amp; Employer Portal.</span>
        </footer>
      </div>

      <CreateJobModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onJobCreated={() => loadData(true)}
      />
    </div>
  );
}