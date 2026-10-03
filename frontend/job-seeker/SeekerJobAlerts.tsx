'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Mail, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Sparkles, 
  Send, 
  Loader2, 
  Search, 
  SlidersHorizontal,
  Building2,
  ExternalLink,
  X,
  IndianRupee,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ApplyJobModal from './ApplyJobModal';
import JobDetailsModal from '@/common/JobDetailsModal';
import JobApplicationView from './JobApplicationView';

interface JobAlertItem {
  id: string;
  title: string;
  location: string;
  category: string;
  minSalary?: string | null;
  frequency: string;
  emailActive: boolean;
  matchedCount?: number;
  createdAt: string;
}

const PRESET_KEYWORDS = [
  'Sales Manager',
  'Channel Partner Lead',
  'CRM Head',
  'Marketing Director',
  'Civil Engineer',
  'Legal Liasoning',
  'Site Supervisor',
  'Luxury Residential Sales'
];

const REAL_ESTATE_DEPARTMENTS = [
  'Sales & Business Development',
  'Marketing & Communications',
  'CRM & Client Servicing',
  'Legal, Liasoning & Land Acquisition',
  'Civil Engineering & Construction',
  'Architecture & Interior Planning',
  'Finance, Accounts & Taxation',
  'HR, Talent & Operations',
  'Facility & Property Management'
];

const LOCATIONS_LIST = [
  'Delhi NCR / Gurugram',
  'Noida & Greater Noida, UP',
  'Bengaluru, Karnataka',
  'Mumbai / MMR, Maharashtra',
  'Pune, Maharashtra',
  'Hyderabad, Telangana',
  'Pan-India / Remote'
];

export default function SeekerJobAlerts() {
  const [categoriesList, setCategoriesList] = useState<string[]>(REAL_ESTATE_DEPARTMENTS);
  const [alerts, setAlerts] = useState<JobAlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '/api';

  // Instant 0ms cache snapshot hydration on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('torbitSeekerJobAlertsSnapshot');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setAlerts(parsed);
      }
    } catch (e) {
      console.error('Snapshot hydration error:', e);
    }
  }, []);

  useEffect(() => {
    fetch(`${apiBase}/categories`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.categories && data.categories.length > 0) {
          const catNames = data.categories.map((c: any) => c.name || c).filter(Boolean);
          setCategoriesList(Array.from(new Set([...REAL_ESTATE_DEPARTMENTS, ...catNames])));
        }
      })
      .catch(() => {});
  }, [apiBase]);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Delhi NCR / Gurugram');
  const [category, setCategory] = useState('Sales & Business Development');
  const [minSalary, setMinSalary] = useState('Competitive');
  const [frequency, setFrequency] = useState('Daily Instant Alert');

  // Status & Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Matching Jobs Modal state
  const [selectedAlertForMatches, setSelectedAlertForMatches] = useState<JobAlertItem | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [sendingDigestId, setSendingDigestId] = useState<string | null>(null);

  // Details Modal state
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Apply Modal state
  const [selectedJobToApply, setSelectedJobToApply] = useState<any | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Fetch Alerts from Database
  const fetchAlerts = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      if (alerts.length === 0) setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts`, { headers });
      if (!res.ok) throw new Error('Failed to load job alerts.');

      const data = await res.json();
      if (data.alerts && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
        try {
          sessionStorage.setItem('torbitSeekerJobAlertsSnapshot', JSON.stringify(data.alerts));
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiBase, alerts.length]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // 2. Create Alert Handler
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Please enter a target role or keyword.');
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          location,
          category,
          minSalary,
          frequency,
          emailActive: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create alert.');
      }

      if (data.alert) {
        setAlerts((prev) => {
          const updated = [data.alert, ...prev];
          try {
            sessionStorage.setItem('torbitSeekerJobAlertsSnapshot', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        setTitle('');
        showToast('success', `Alert "${data.alert.title}" activated! Confirmation email sent.`);
      }
    } catch (err: any) {
      console.error('Error creating alert:', err);
      showToast('error', err.message || 'Error creating alert.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Toggle Alert (Pause / Resume)
  const handleToggleAlert = async (id: string, currentStatus: boolean) => {
    // Optimistic UI Update
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, emailActive: !currentStatus } : a));
      try {
        sessionStorage.setItem('torbitSeekerJobAlertsSnapshot', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts/${id}/toggle`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ emailActive: !currentStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle alert status.');
      }
      showToast('info', data.message || (!currentStatus ? 'Alert resumed' : 'Alert paused'));
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      // Revert on error
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, emailActive: currentStatus } : a))
      );
      showToast('error', 'Could not update alert status.');
    }
  };

  // 4. Delete Alert
  const handleDeleteAlert = async (id: string, alertTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the alert for "${alertTitle}"?`)) {
      return;
    }

    const previousAlerts = [...alerts];
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        sessionStorage.setItem('torbitSeekerJobAlertsSnapshot', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Failed to delete alert.');
      showToast('success', `Alert "${alertTitle}" removed.`);
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setAlerts(previousAlerts);
      showToast('error', 'Failed to delete alert from server.');
    }
  };

  // 5. Open Matching Jobs Modal
  const handleViewMatches = async (alert: JobAlertItem) => {
    setSelectedAlertForMatches(alert);
    setLoadingMatches(true);
    setMatchingJobs([]);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts/${alert.id}/matches`, { headers });
      const data = await res.json();
      if (res.ok && data.matchingJobs) {
        setMatchingJobs(data.matchingJobs);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // 6. Send Test / Instant Digest Email
  const handleSendDigestEmail = async (alert: JobAlertItem) => {
    try {
      setSendingDigestId(alert.id);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/alerts/${alert.id}/send-digest`, {
        method: 'POST',
        headers
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email digest.');

      showToast('success', data.message || 'Job matches sent to your email inbox!');
    } catch (err: any) {
      console.error('Error sending digest email:', err);
      showToast('error', err.message || 'Could not send digest email.');
    } finally {
      setSendingDigestId(null);
    }
  };

  if (selectedJobToApply) {
    return (
      <JobApplicationView
        job={selectedJobToApply}
        onBack={() => setSelectedJobToApply(null)}
        onApplicationSubmitted={() => {
          setSelectedJobToApply(null);
          showToast('success', `Application submitted successfully for ${selectedJobToApply.title}!`);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-['Helvetica',Arial,sans-serif] max-w-5xl mx-auto pb-12">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : notification.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/40'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {notification.type === 'info' && <Bell className="w-4 h-4 text-[#b2c359] shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header & Enterprise Quick Alert Creator */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#b2c359]/15 text-[#7ea81b]">
                <Bell className="w-4 h-4" />
              </span>
              <span>Enterprise Job Alerts &amp; Notifications</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Never miss premier Real Estate opportunities. Configure multi-criteria alerts to receive instant email notifications and daily curated digests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer self-start sm:self-auto shrink-0"
            title="Refresh Alert Statuses"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Alerts'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#b2c359]" />
            <span>Popular Roles in Real Estate:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_KEYWORDS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTitle(preset)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  title === preset
                    ? 'bg-[#b2c359] text-slate-950 border-[#b2c359] shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Create Alert Multi-Field Form */}
        <form onSubmit={handleCreateAlert} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
            
            {/* Title / Keyword Input */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">
                Target Role / Keywords *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sales Director, Channel Partner Lead..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] focus:bg-white focus:ring-1 focus:ring-[#b2c359] transition"
                />
              </div>
            </div>

            {/* Department / Category */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">
                Real Estate Department
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#b2c359] focus:bg-white transition cursor-pointer"
              >
                {categoriesList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">
                Target Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#b2c359] focus:bg-white transition cursor-pointer"
              >
                {LOCATIONS_LIST.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">
                Alert Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#b2c359] focus:bg-white transition cursor-pointer"
              >
                <option value="Daily Instant Alert">⚡ Daily Instant</option>
                <option value="Weekly Digest">📅 Weekly Digest</option>
              </select>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span>Min Expected Salary:</span>
              <select
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#b2c359] cursor-pointer"
              >
                <option value="Competitive">Competitive / Any</option>
                <option value="₹6 - ₹10 LPA">₹6 - ₹10 LPA</option>
                <option value="₹10 - ₹18 LPA">₹10 - ₹18 LPA</option>
                <option value="₹18 - ₹30 LPA">₹18 - ₹30 LPA</option>
                <option value="₹30+ LPA">₹30+ LPA (Executive)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-[#b2c359] hover:bg-[#9eb047] disabled:opacity-60 text-slate-950 font-black text-xs sm:text-[13px] py-2.5 px-6 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Alert...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create &amp; Activate Alert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Active Subscriptions List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <span>Your Active Alert Subscriptions</span>
              <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Live auto-matching with verified recruiter postings
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#b2c359] mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading your subscribed job alerts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && alerts.length === 0 && (
          <div className="py-12 text-center space-y-3 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#b2c359]/15 text-[#7ea81b] flex items-center justify-center mx-auto shadow-xs">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-black text-gray-900">No Job Alerts Created Yet</h4>
              <p className="text-xs text-gray-500">
                Create your first job alert above to start receiving instant matching notifications when top builders like DLF, Godrej, Prestige, and Sobha post vacancies.
              </p>
            </div>
          </div>
        )}

        {/* Subscribed Alerts Cards */}
        {!loading && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const matchesCount = alert.matchedCount !== undefined ? alert.matchedCount : 0;
              const isSendingDigest = sendingDigestId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    alert.emailActive
                      ? 'bg-white border-gray-200 hover:border-[#b2c359]/60 hover:shadow-sm'
                      : 'bg-gray-50/80 border-gray-200/80 opacity-75'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-black text-sm sm:text-base text-gray-900 tracking-tight">
                          {alert.title}
                        </h4>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            alert.emailActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              alert.emailActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                            }`}
                          />
                          {alert.emailActive ? 'Active (Email Alerts ON)' : 'Paused'}
                        </span>

                        {/* Matching Openings Button/Pill */}
                        <button
                          type="button"
                          onClick={() => handleViewMatches(alert)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition cursor-pointer"
                          title="Click to view all active openings"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{matchesCount} Openings Matched</span>
                        </button>
                      </div>

                      {/* Criteria Meta tags */}
                      <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{alert.location}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{alert.category}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <IndianRupee className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{alert.minSalary || 'Competitive'}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-slate-700 font-semibold bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                          {alert.frequency}
                        </span>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0 flex-wrap">
                      
                      {/* Send Test Email Digest */}
                      <button
                        type="button"
                        onClick={() => handleSendDigestEmail(alert)}
                        disabled={isSendingDigest}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Send matching jobs digest to registered email right now"
                      >
                        {isSendingDigest ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b2c359]" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span>{isSendingDigest ? 'Sending...' : 'Send Digest'}</span>
                      </button>

                      {/* View Matches button */}
                      <button
                        type="button"
                        onClick={() => handleViewMatches(alert)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Jobs ({matchesCount})</span>
                      </button>

                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleAlert(alert.id, alert.emailActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          alert.emailActive
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                            : 'border-[#b2c359] bg-[#b2c359]/20 text-slate-950 font-black'
                        }`}
                      >
                        {alert.emailActive ? 'Pause' : 'Resume'}
                      </button>

                      {/* Delete Alert Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(alert.id, alert.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL: MATCHING REAL JOBS PREVIEW MODAL */}
      {/* ========================================================= */}
      {selectedAlertForMatches && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-[#080809] text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b2c359]" />
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Live Openings for &ldquo;{selectedAlertForMatches.title}&rdquo;
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400">
                  {selectedAlertForMatches.location} • {selectedAlertForMatches.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertForMatches(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {loadingMatches && (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-7 h-7 animate-spin text-[#b2c359] mx-auto" />
                  <p className="text-xs text-gray-500 font-bold">Scanning active enterprise vacancies...</p>
                </div>
              )}

              {!loadingMatches && matchingJobs.length === 0 && (
                <div className="py-10 text-center space-y-2 bg-gray-50 rounded-2xl p-6">
                  <Briefcase className="w-8 h-8 text-gray-400 mx-auto" />
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                    No active openings right now matching &ldquo;{selectedAlertForMatches.title}&rdquo;
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Your alert is active. The instant a recruiter posts an opening matching this criteria, you will receive an automatic email notification.
                  </p>
                </div>
              )}

              {!loadingMatches && matchingJobs.length > 0 && (
                <div className="space-y-3">
                  {matchingJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJobForDetails(job);
                        setDetailsModalOpen(true);
                      }}
                      className="p-4 rounded-2xl border border-gray-200 hover:border-[#b2c359] bg-white transition-all space-y-2.5 shadow-2xs cursor-pointer group text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-black text-sm text-gray-900 group-hover:text-[#647a16] transition">{job.title}</h4>
                          <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>{job.company?.companyName || 'Torbit Verified Partner'}</span>
                          </div>
                        </div>

                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {job.hideSalary
                            ? 'Salary: Best in Industry'
                            : (job.salaryMin ? `₹${job.salaryMin} - ₹${job.salaryMax || job.salaryMin} LPA` : 'Competitive')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{job.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          <span>{job.jobType || 'Full-Time'}</span>
                        </span>
                        <span>•</span>
                        <span>Exp: {job.expMin}-{job.expMax} Yrs</span>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          Posted on {new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobForDetails(job);
                              setDetailsModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobToApply(job);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
                          >
                            Apply →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">
                {matchingJobs.length} active verified openings
              </span>
              <button
                type="button"
                onClick={() => setSelectedAlertForMatches(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. JOB DETAILS & APPLY MODAL INTEGRATION */}
      {/* ========================================================= */}
      {selectedJobForDetails && (
        <JobDetailsModal
          isOpen={detailsModalOpen}
          job={selectedJobForDetails}
          onClose={() => setDetailsModalOpen(false)}
          onApply={(job) => {
            setDetailsModalOpen(false);
            setSelectedJobToApply(job);
          }}
        />
      )}

      {selectedJobToApply && (
        <ApplyJobModal
          isOpen={Boolean(selectedJobToApply)}
          job={selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          onApplicationSubmitted={() => {
            setSelectedJobToApply(null);
            showToast('success', `Application submitted successfully for ${selectedJobToApply.title}!`);
          }}
        />
      )}

    </div>
  );
}
