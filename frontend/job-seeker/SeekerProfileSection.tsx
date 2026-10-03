'use client';
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, FileText, CheckCircle2, AlertCircle, ChevronDown, Search, Check, GraduationCap, X, Upload, Camera, Trash2, ExternalLink, Download, Loader2 } from 'lucide-react';
import { QUALIFICATION_CATEGORIES, calculateSeekerProfileScore } from '@/lib/constants';

interface SeekerProfileSectionProps {
  profile: any;
  onProfileUpdated?: (updated: any) => void;
}

export default function SeekerProfileSection({ profile, onProfileUpdated }: SeekerProfileSectionProps) {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [qualification, setQualification] = useState(profile?.qualification || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [currentSalary, setCurrentSalary] = useState(profile?.currentSalary || '');
  const [expectedSalary, setExpectedSalary] = useState(profile?.expectedSalary || '');
  const [skills, setSkills] = useState(profile?.skills || '');
  const [noticePeriod, setNoticePeriod] = useState(profile?.noticePeriod || '30 days');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || '');

  // Photo & Resume states
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || '');
  const [resumeOriginalName, setResumeOriginalName] = useState(profile?.resumeOriginalName || '');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live real-time score calculation
  const liveScore = calculateSeekerProfileScore({
    fullName,
    phone,
    location,
    qualification,
    experience,
    noticePeriod,
    currentSalary,
    expectedSalary,
    skills,
    avatarUrl,
    resumeUrl
  });

  // Custom Searchable Dropdown State
  const qualDropdownOpenRef = useRef<HTMLDivElement>(null);
  const [qualDropdownOpen, setQualDropdownOpen] = useState(false);
  const [qualSearchQuery, setQualSearchQuery] = useState('');
  const qualDropdownRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (qualDropdownRef.current && !qualDropdownRef.current.contains(event.target as Node)) {
        setQualDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setQualification(profile.qualification || '');
      setExperience(profile.experience || '');
      setCurrentSalary(profile.currentSalary || '');
      setExpectedSalary(profile.expectedSalary || '');
      setSkills(profile.skills || '');
      setNoticePeriod(profile.noticePeriod || '30 days');
      setPortfolioUrl(profile.portfolioUrl || '');
      setAvatarUrl(profile.avatarUrl || '');
      setResumeUrl(profile.resumeUrl || '');
      setResumeOriginalName(profile.resumeOriginalName || '');
    }
  }, [profile]);

  // Handle Photo / Avatar Upload (< 500 KB, JPG/JPEG/PNG)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);

    // Strictly < 500 KB (500 * 1024 bytes)
    if (file.size > 500 * 1024) {
      setAvatarError('Photo size exceeds 500 KB limit. Please upload a smaller image.');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }

    // Strictly jpeg, jpg, png
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      setAvatarError('Invalid format. Only JPG, JPEG, and PNG images are accepted.');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      setAvatarUrl(data.fileUrl);

      // Auto sync with profile in DB
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const syncRes = await fetch(`${apiBase}/auth/profile`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ avatarUrl: data.fileUrl })
        });
        const syncData = await syncRes.json();
        if (onProfileUpdated && syncData.profile) {
          onProfileUpdated(syncData.profile);
        }
      } catch (syncErr) {
        console.error('Auto-sync photo failed:', syncErr);
      }
    } catch (err: any) {
      setAvatarError(err.message || 'Photo upload failed');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Handle Resume Upload (< 1 MB, PDF/DOC/DOCX)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError(null);

    // Strictly < 1 MB (1024 * 1024 bytes)
    if (file.size > 1 * 1024 * 1024) {
      setResumeError('Resume size exceeds 1 MB limit. Please upload a file less than 1 MB.');
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    // Strictly pdf, doc, docx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setResumeError('Invalid format. Only PDF, DOC, and DOCX formats are accepted.');
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    setUploadingResume(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'resumes');

      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload resume');

      setResumeUrl(data.fileUrl);
      setResumeOriginalName(file.name);
      setResumeUploadSuccess(`"${file.name}" uploaded successfully! Profile completion increased by +20%.`);
      setTimeout(() => setResumeUploadSuccess(null), 5000);

      // Auto sync with profile in DB
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const syncRes = await fetch(`${apiBase}/auth/profile`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ resumeUrl: data.fileUrl, resumeOriginalName: file.name })
        });
        const syncData = await syncRes.json();
        if (onProfileUpdated && syncData.profile) {
          onProfileUpdated(syncData.profile);
        }
      } catch (syncErr) {
        console.error('Auto-sync resume failed:', syncErr);
      }
    } catch (err: any) {
      setResumeError(err.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  // Handle Remove Photo (Instant state + DB update)
  const handleAvatarRemove = async () => {
    setAvatarUrl('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ avatarUrl: null })
      });

      const data = await res.json();
      if (onProfileUpdated && data.profile) {
        onProfileUpdated(data.profile);
      }
    } catch (e) {
      console.error('Failed to remove photo:', e);
    }
  };

  // Handle Remove Resume (Instant state + DB update)
  const handleResumeRemove = async () => {
    setResumeUrl('');
    setResumeOriginalName('');
    setResumeUploadSuccess(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ resumeUrl: null, resumeOriginalName: null })
      });

      const data = await res.json();
      if (onProfileUpdated && data.profile) {
        onProfileUpdated(data.profile);
      }
    } catch (e) {
      console.error('Failed to remove resume:', e);
    }
  };

  const filteredCategories = QUALIFICATION_CATEGORIES.map((cat) => {
    const matchingOptions = cat.options.filter((opt) =>
      opt.toLowerCase().includes(qualSearchQuery.toLowerCase())
    );
    return {
      category: cat.category,
      options: matchingOptions,
    };
  }).filter((cat) => cat.options.length > 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        fullName,
        phone,
        location,
        qualification,
        experience,
        currentSalary: currentSalary ? Number(currentSalary) : null,
        expectedSalary: expectedSalary ? Number(expectedSalary) : null,
        skills,
        noticePeriod,
        portfolioUrl,
        resumeUrl,
        resumeOriginalName,
        avatarUrl
      };

      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      let data: any = {};
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Server returned an unexpected error response. Please check your backend connection.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSaved(true);
      if (onProfileUpdated && data.profile) {
        onProfileUpdated(data.profile);
      }
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || 'Candidate')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-4xl mx-auto font-['Helvetica',Arial,sans-serif]">
      <div className="pb-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-gray-900">Candidate Profile &amp; Credentials</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Your verified information shared with employers during 1-click job applications.
          </p>
        </div>
        {saved && (
          <span className="bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile Saved to Database!</span>
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Profile Photo / Avatar Card */}
        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || 'Avatar'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#b2c359] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 text-[#b2c359] font-black text-xl flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-[#b2c359]" />
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">Profile Photo / Avatar</div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                JPG, JPEG or PNG format • Strictly &lt; 500 KB
              </p>
              {avatarError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {avatarError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <input
              ref={avatarInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl font-bold text-xs text-gray-800 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-[#b2c359]" />
              <span>{uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Remove Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Location / City</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Gurugram, Haryana"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div className="relative" ref={qualDropdownRef}>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
              <span>Highest Qualification</span>
              {qualification && (
                <span className="text-[10px] text-[#b2c359] font-semibold lowercase">selected</span>
              )}
            </label>

            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setQualDropdownOpen(!qualDropdownOpen);
                setQualSearchQuery('');
              }}
              className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl font-semibold text-xs sm:text-[13px] text-left flex items-center justify-between transition cursor-pointer ${
                qualDropdownOpen
                  ? 'border-[#b2c359] ring-1 ring-[#b2c359] bg-white shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              } ${qualification ? 'text-gray-900' : 'text-gray-400'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <GraduationCap className="w-4 h-4 text-[#b2c359] shrink-0" />
                <span className="truncate">{qualification || 'Select Highest Qualification'}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  qualDropdownOpen ? 'rotate-180 text-gray-700' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Popover */}
            {qualDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-w-full">
                {/* Search Bar at Top */}
                <div className="p-2 border-b border-gray-100 bg-gray-50/90 sticky top-0 z-10 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    autoFocus
                    value={qualSearchQuery}
                    onChange={(e) => setQualSearchQuery(e.target.value)}
                    placeholder="Search e.g. MBA, B.Tech, MCA, Civil..."
                    className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none py-1"
                  />
                  {qualSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setQualSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Qualification List */}
                <div className="max-h-56 sm:max-h-64 overflow-y-auto p-2 space-y-2.5">
                  {/* Current custom selection if not in standard list */}
                  {qualification &&
                    !QUALIFICATION_CATEGORIES.some((g) => g.options.includes(qualification)) && (
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
                          Current Selection
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setQualDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-[#b2c359]/15 text-gray-950 flex items-center justify-between transition"
                        >
                          <span className="truncate">{qualification}</span>
                          <Check className="w-3.5 h-3.5 text-[#b2c359] shrink-0" />
                        </button>
                      </div>
                    )}

                  {filteredCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No matching qualification found for "{qualSearchQuery}"
                    </div>
                  ) : (
                    filteredCategories.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-0.5 bg-gray-100/70 rounded-md">
                          {group.category}
                        </div>
                        <div className="space-y-0.5">
                          {group.options.map((opt) => {
                            const isSelected = qualification === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setQualification(opt);
                                  setQualDropdownOpen(false);
                                  setQualSearchQuery('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#b2c359]/15 text-gray-950 font-bold'
                                    : 'text-gray-700 hover:bg-gray-100 font-medium'
                                }`}
                              >
                                <span className="leading-snug">{opt}</span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#b2c359] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Total Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 3–5 years"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Notice Period</label>
            <input
              type="text"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              placeholder="e.g. Immediate / 30 Days / Available from 15 Nov"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Salary (₹ per annum)</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              placeholder="e.g. 750000"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Expected Salary (₹ per annum)</label>
            <input
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              placeholder="e.g. 1100000"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Key Skills &amp; Competencies</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Sales, Marketing, Project Management, CRM, Full-Stack, Communication, Operations"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Portfolio / LinkedIn URL</label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-[13px] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
          />
        </div>

        {/* Resume / CV Document Upload Section (< 1 MB, PDF/DOC/DOCX) */}
        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#b2c359]" />
                <span>Resume / Curriculum Vitae (CV)</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Mandatory for 1-Click job applications • PDF, DOC, DOCX format • Strictly &lt; 1 MB
              </p>
            </div>
            {resumeUrl && !uploadingResume && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            )}
          </div>

          {resumeError && (
            <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{resumeError}</span>
            </div>
          )}

          {resumeUploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resumeUploadSuccess}</span>
            </div>
          )}

          {uploadingResume ? (
            <div className="p-6 bg-lime-50/80 border-2 border-dashed border-[#b2c359] rounded-xl flex items-center justify-center gap-3.5 text-center animate-in fade-in duration-200">
              <Loader2 className="w-7 h-7 animate-spin text-[#b2c359] shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900">Uploading &amp; Verifying Resume Document...</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Please wait, saving your file (&lt; 1 MB limit)</div>
              </div>
            </div>
          ) : resumeUrl ? (
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-lime-50 text-[#b2c359] border border-lime-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {resumeOriginalName || 'Uploaded_Resume.pdf'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    Verified Document • Ready for 1-click applications
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Resume</span>
                </a>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingResume}
                  onClick={() => resumeInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#b2c359]" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleResumeRemove}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 hover:border-[#b2c359] rounded-xl p-5 text-center bg-white transition relative">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-7 h-7 text-gray-400 mb-1.5" />
                <p className="text-xs font-bold text-gray-800">
                  Click or Drag Resume here
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  PDF, DOC, DOCX • Strictly &lt; 1 MB file size
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingAvatar || uploadingResume}
            className="w-full sm:w-auto bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold px-6 py-3 sm:py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer text-center text-xs sm:text-[13px] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Saving Profile &amp; Documents...</span>
              </>
            ) : (
              <span>Update Profile Credentials</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
