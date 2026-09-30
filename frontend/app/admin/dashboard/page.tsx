'use client';
import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/admin/AdminSidebar';
import AdminTopbar from '@/admin/AdminTopbar';
import AdminOverview from '@/admin/AdminOverview';
import CompanyApprovalsQueue from '@/admin/CompanyApprovalsQueue';
import CompanyDirectory from '@/admin/CompanyDirectory';
import CandidateDirectory from '@/admin/CandidateDirectory';
import JobGovernance from '@/admin/JobGovernance';
import CategoryMaster from '@/admin/CategoryMaster';
import AdminAnalytics from '@/admin/AdminAnalytics';
import ActionModal from '@/admin/ActionModal';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>({
    totalSeekers: 10482,
    totalCompanies: 256,
    pendingApprovals: 5,
    approvedCompanies: 248,
    blockedCompanies: 3,
    activeJobs: 512,
    totalApplications: 9340
  });
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [seekers, setSeekers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'REJECT' | 'BLOCK' | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, compRes, seekRes, jobsRes, catRes] = await Promise.allSettled([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/companies').then(r => r.json()),
        fetch('/api/admin/seekers').then(r => r.json()),
        fetch('/api/admin/jobs').then(r => r.json()),
        fetch('/api/admin/categories').then(r => r.json())
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        if (statsRes.value.stats) setStats(statsRes.value.stats);
        if (statsRes.value.pendingCompanies) setPendingCompanies(statsRes.value.pendingCompanies);
        if (statsRes.value.recentApplications) setRecentApplications(statsRes.value.recentApplications);
      }

      if (compRes.status === 'fulfilled' && compRes.value?.companies) {
        setAllCompanies(compRes.value.companies);
      }

      if (seekRes.status === 'fulfilled' && seekRes.value?.seekers) {
        setSeekers(seekRes.value.seekers);
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.jobs) {
        setJobs(jobsRes.value.jobs);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.categories) {
        setCategories(catRes.value.categories);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleApproveCompany = async (companyId: string) => {
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: 'APPROVED' })
      });
      if (res.ok) {
        setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
        setAllCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: 'APPROVED' } : c));
        setStats((prev: any) => ({
          ...prev,
          pendingApprovals: Math.max(0, (prev.pendingApprovals || 1) - 1),
          approvedCompanies: (prev.approvedCompanies || 0) + 1
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenActionModal = (id: string, action: 'REJECT' | 'BLOCK') => {
    setSelectedTargetId(id);
    setActionType(action);
    setModalOpen(true);
  };

  const handleConfirmAction = async (reason: string) => {
    if (!selectedTargetId || !actionType) return;
    try {
      const status = actionType === 'REJECT' ? 'REJECTED' : 'BLOCKED';
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedTargetId, status, reason })
      });
      if (res.ok) {
        setPendingCompanies(prev => prev.filter(c => c.id !== selectedTargetId));
        setAllCompanies(prev => prev.map(c => c.id === selectedTargetId ? { ...c, status } : c));
        setModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeaturedJob = async (jobId: string, isFeatured: boolean) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, isFeatured })
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isFeatured } : j));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status })
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCompanies.length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={loadAllData}
          activeTab={activeTab}
          pendingCount={pendingCompanies.length}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'OVERVIEW' && (
            <AdminOverview
              stats={stats}
              pendingCompanies={pendingCompanies}
              recentJobs={jobs}
              recentApplications={recentApplications}
              onApprove={handleApproveCompany}
              onOpenActionModal={handleOpenActionModal}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'APPROVALS' && (
            <CompanyApprovalsQueue
              pendingCompanies={pendingCompanies}
              onApprove={handleApproveCompany}
              onOpenActionModal={handleOpenActionModal}
            />
          )}

          {activeTab === 'COMPANIES' && (
            <CompanyDirectory
              companies={allCompanies}
              onApprove={handleApproveCompany}
              onOpenActionModal={handleOpenActionModal}
            />
          )}

          {activeTab === 'SEEKERS' && (
            <CandidateDirectory seekers={seekers} />
          )}

          {activeTab === 'JOBS' && (
            <JobGovernance
              jobs={jobs}
              onToggleFeatured={handleToggleFeaturedJob}
              onUpdateStatus={handleUpdateJobStatus}
            />
          )}

          {activeTab === 'CATEGORIES' && (
            <CategoryMaster categories={categories} />
          )}

          {activeTab === 'ANALYTICS' && (
            <AdminAnalytics />
          )}

          {activeTab === 'SETTINGS' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-900">Security & Access Control</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage platform RBAC roles, database connections & JWT keys.</p>
              </div>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">Environment Mode</div>
                    <div className="text-gray-500">Production Mode • Multi-Portal SQLite DB</div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">Resume Storage Rule</div>
                    <div className="text-gray-500">Multer Engine: Strictly &lt; 2MB & PDF / DOCX Only</div>
                  </div>
                  <span className="bg-lime-100 text-lime-800 text-[10px] font-bold px-2 py-0.5 rounded">ENFORCED</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">Recruiter Verification SLA</div>
                    <div className="text-gray-500">24–48 Hours Notice & Banner Trigger</div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">ON</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'REJECT' ? 'Reject Company Registration' : 'Block Company Account'}
        description={
          actionType === 'REJECT'
            ? 'Rejecting this company will notify the recruiter that their verification was declined and restrict job posting access.'
            : 'Blocking this company will immediately suspend all their active job listings and revoke platform access.'
        }
        actionLabel={actionType === 'REJECT' ? 'Confirm Rejection' : 'Confirm Account Block'}
        isDestructive={true}
      />
    </div>
  );
}