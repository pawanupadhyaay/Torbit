'use client';
import React, { useState, useEffect } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  Bell,
  Sliders,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  Mail,
  Building2,
  Sparkles
} from 'lucide-react';

interface RecruiterSettingsProps {
  user: any;
  company: any;
  onLogout?: () => void;
}

export default function RecruiterSettings({ user, company, onLogout }: RecruiterSettingsProps) {
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences State (persisted in localStorage)
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [jobStatusAlerts, setJobStatusAlerts] = useState(true);
  const [autoAcknowledge, setAutoAcknowledge] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Copied State
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Load saved preferences from backend & localStorage on mount
  useEffect(() => {
    // 1. Instant load from localStorage
    try {
      const saved = localStorage.getItem('torbit_recruiter_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.instantAlerts !== undefined) setInstantAlerts(Boolean(parsed.instantAlerts));
        if (parsed.dailyDigest !== undefined) setDailyDigest(Boolean(parsed.dailyDigest));
        if (parsed.jobStatusAlerts !== undefined) setJobStatusAlerts(Boolean(parsed.jobStatusAlerts));
        if (parsed.autoAcknowledge !== undefined) setAutoAcknowledge(Boolean(parsed.autoAcknowledge));
      }
    } catch (e) {}

    // 2. Live fetch from backend
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetch('/api/auth/recruiter-settings', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.settings) {
            const s = data.settings;
            if (s.instantAlerts !== undefined) setInstantAlerts(Boolean(s.instantAlerts));
            if (s.dailyDigest !== undefined) setDailyDigest(Boolean(s.dailyDigest));
            if (s.jobStatusAlerts !== undefined) setJobStatusAlerts(Boolean(s.jobStatusAlerts));
            if (s.autoAcknowledge !== undefined) setAutoAcknowledge(Boolean(s.autoAcknowledge));
            try {
              localStorage.setItem('torbit_recruiter_settings', JSON.stringify(s));
            } catch (err) {}
          }
        })
        .catch((err) => {
          console.warn('Could not sync recruiter settings from backend:', err);
        });
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      let res: Response;

      if (token) {
        res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: currentPassword.trim() || undefined,
            newPassword: newPassword.trim()
          })
        });
      } else {
        const identifier = company?.workEmail || user?.email || user?.phone;
        if (!identifier) {
          throw new Error('Account email or phone not found for this user.');
        }

        res = await fetch('/api/auth/set-new-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier,
            temporaryPassword: currentPassword.trim() || undefined,
            newPassword: newPassword.trim()
          })
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password. Please check your current password.');
      }

      setPasswordSuccess('Password updated successfully! You can now use your new password for subsequent logins.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    const settingsObj = {
      instantAlerts,
      dailyDigest,
      jobStatusAlerts,
      autoAcknowledge,
      updatedAt: new Date().toISOString()
    };

    // 1. Instant localStorage update
    try {
      localStorage.setItem('torbit_recruiter_settings', JSON.stringify(settingsObj));
    } catch (e) {}

    // 2. Live backend sync
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const res = await fetch('/api/auth/recruiter-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settingsObj)
        });
        if (!res.ok) {
          console.warn('Backend settings save warning');
        }
      }
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (e) {
      console.warn('Could not save settings to backend:', e);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleCopyEmail = () => {
    const textToCopy = company?.workEmail || user?.email || '';
    if (textToCopy && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-['Helvetica',Arial,sans-serif]">
      {/* Settings Top Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Account &amp; Platform Settings
            </h1>
            <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Preferences
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure your recruiter account security, candidate notifications, email alerts, and workflow preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Account Verified</span>
          </div>
        </div>
      </div>

      {/* 1. Account Security & Change Password */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900">
                Security &amp; Password
              </h2>
              <p className="text-xs text-gray-500">
                Change your account password to protect access to your recruiter workspace and candidate applications.
              </p>
            </div>
          </div>
        </div>

        {passwordSuccess && (
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Current / Temporary Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                New Secure Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Notifications & Communication Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900">
                Email &amp; Notification Preferences
              </h2>
              <p className="text-xs text-gray-500">
                Choose when and how Torbit Realty notifies you regarding candidate submissions and pipeline updates.
              </p>
            </div>
          </div>

          {prefSuccess && (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Preferences Saved!</span>
            </span>
          )}
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Toggle 1: Instant Email on New Candidate */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="pr-4">
              <span className="font-bold text-slate-900 block text-xs">
                Instant Candidate Submission Alerts
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Receive an immediate email notification when a job seeker applies to any of your active job listings.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={instantAlerts}
                onChange={(e) => setInstantAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b2c359]"></div>
            </label>
          </div>

          {/* Toggle 2: Daily Digest */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="pr-4">
              <span className="font-bold text-slate-900 block text-xs">
                Daily Pipeline Summary Digest
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Receive a daily morning recap email summarizing total new applications and shortlisted candidates.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b2c359]"></div>
            </label>
          </div>

          {/* Toggle 3: Job Listing Alerts */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="pr-4">
              <span className="font-bold text-slate-900 block text-xs">
                Job Listing Status &amp; Expiry Notices
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Receive reminders when a job listing has reached its application deadline or needs attention.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={jobStatusAlerts}
                onChange={(e) => setJobStatusAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b2c359]"></div>
            </label>
          </div>

          {/* Toggle 4: Candidate Auto-Acknowledgment */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="pr-4">
              <span className="font-bold text-slate-900 block text-xs">
                Candidate Application Auto-Acknowledgment
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Automatically send candidates a branded confirmation that their application has been received.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoAcknowledge}
                onChange={(e) => setAutoAcknowledge(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b2c359]"></div>
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="px-5 py-2.5 bg-[#b2c359] hover:bg-[#9eb047] active:scale-98 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{savingPreferences ? 'Saving...' : 'Save Notification Preferences'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Account Dossier & Security Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900">
                Account Credentials &amp; Verification
              </h2>
              <p className="text-xs text-gray-500">
                Official enterprise account identifier managed by Torbit Realty corporate verification.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Registered Recruiter Work Email
            </span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 truncate">
                {company?.workEmail || user?.email || 'hr@company.in'}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-slate-700 ml-2"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              GSTIN Verification Key
            </span>
            <span className="font-mono font-bold text-slate-800 block">
              {company?.gstNumber || '06AAACD1234F1Z5'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Enterprise Role
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Recruiter / Hiring Authority</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Account Status
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Active &amp; Approved</span>
            </span>
          </div>
        </div>

        {/* Sign Out Option */}
        {onLogout && (
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block text-xs">Sign Out of Session</span>
              <span className="text-[11px] text-slate-500">Safely log out from this browser session.</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
