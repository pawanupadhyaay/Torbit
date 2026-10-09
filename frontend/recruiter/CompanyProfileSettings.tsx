'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Globe,
  Trash2
} from 'lucide-react';

interface CompanyProfileSettingsProps {
  company: any;
  onProfileUpdated?: (updated: any) => void;
}

export default function CompanyProfileSettings({ company, onProfileUpdated }: CompanyProfileSettingsProps) {
  const [companyName, setCompanyName] = useState(company?.companyName || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [hqLocation, setHqLocation] = useState(company?.hqLocation || '');
  const [industry, setIndustry] = useState(company?.industry || 'Real Estate');
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setPhone(company.phone || '');
      setHqLocation(company.hqLocation || '');
      setIndustry(company.industry || 'Real Estate');
      setLogoUrl(company.logoUrl || '');
    }
  }, [company]);

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo image file size must be less than 5MB.');
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'company-logos');

      // Use relative endpoint first for zero-CORS proxying, fallback to full URL
      let res: Response;
      try {
        res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
      } catch (relErr) {
        const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
          : '/api';
        res = await fetch(`${apiBase}/upload`, {
          method: 'POST',
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo image');

      const uploadedUrl = data.fileUrl;
      setLogoUrl(uploadedUrl);

      // Background sync to database so logo persists
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) 
        : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        let syncRes: Response;
        try {
          syncRes = await fetch('/api/auth/company-profile', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              companyName,
              phone,
              hqLocation,
              industry,
              logoUrl: uploadedUrl
            })
          });
        } catch {
          const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
            : '/api';
          syncRes = await fetch(`${apiBase}/auth/company-profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              companyName,
              phone,
              hqLocation,
              industry,
              logoUrl: uploadedUrl
            })
          });
        }

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData?.company) {
            if (typeof window !== 'undefined') {
              try {
                const rawUser = localStorage.getItem('user');
                if (rawUser) {
                  const parsedUser = JSON.parse(rawUser);
                  parsedUser.companyProfile = syncData.company;
                  if (syncData.company.logoUrl !== undefined) parsedUser.companyProfile.logoUrl = syncData.company.logoUrl;
                  localStorage.setItem('user', JSON.stringify(parsedUser));
                }
              } catch (e) {}
            }
            if (onProfileUpdated) onProfileUpdated(syncData.company);
          }
          setSaved(true);
          setTimeout(() => setSaved(false), 3500);
        }
      } catch (autoSaveErr) {
        console.warn('Background logo sync notice:', autoSaveErr);
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading company logo');
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) 
        : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Use same-origin Next.js rewrite proxy to prevent any CORS / Failed to fetch blocks
      let res: Response;
      try {
        res = await fetch('/api/auth/company-profile', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            companyName, 
            phone, 
            hqLocation, 
            industry,
            logoUrl: logoUrl.trim() || null 
          })
        });
      } catch {
        const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
          : '/api';
        res = await fetch(`${apiBase}/auth/company-profile`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            companyName, 
            phone, 
            hqLocation, 
            industry,
            logoUrl: logoUrl.trim() || null 
          })
        });
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to update company profile');

      setSaved(true);
      if (data?.company) {
        if (typeof window !== 'undefined') {
          try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
              const parsedUser = JSON.parse(rawUser);
              parsedUser.companyName = data.company.companyName;
              parsedUser.companyProfile = data.company;
              if (data.company.logoUrl !== undefined) parsedUser.companyProfile.logoUrl = data.company.logoUrl;
              localStorage.setItem('user', JSON.stringify(parsedUser));
            }
          } catch (e) {
            console.error('Failed to sync user storage:', e);
          }
        }
        if (onProfileUpdated) {
          onProfileUpdated(data.company);
        }
      }
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error updating company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 max-w-4xl font-['Helvetica',Arial,sans-serif]">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900">Company KYC &amp; Verification Dossier</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified corporate credentials, branding logo, and GST registration governed by Torbit Realty Admin.
          </p>
        </div>
        {saved && (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile &amp; Logo Saved to Database!</span>
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Company Brand Logo Card */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Company Brand Logo
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This logo will automatically appear on all your job postings, candidate application cards, and recruiter portal.
              </p>
            </div>
            {logoUrl && (
              <span className="self-start sm:self-auto bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Live On Jobs</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            {/* Logo Preview Box */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-2 group relative">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName || 'Company Logo'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: logoUrl ? 'none' : 'flex' }}
                className="logo-fallback w-full h-full items-center justify-center flex-col text-slate-400 bg-slate-100 rounded-xl"
              >
                <Building2 className="w-6 h-6 mb-1 text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 tracking-wider">
                  {(companyName || 'CO').substring(0, 3).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Upload & Direct URL Controls */}
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-[#080809] font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#080809] border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading Logo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUrl ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                    </>
                  )}
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              {/* Direct Image URL input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Or Paste Direct Image / CDN Link (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png or Cloudinary/CDN image URL"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Company / Developer Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">GSTIN Number (KYC ID)</label>
            <input
              type="text"
              disabled
              value={company?.gstNumber || '06AAACD1234F1Z5'}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl font-mono font-bold text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Official Work Email</label>
            <input
              type="email"
              disabled
              value={company?.workEmail || 'hr@company.in'}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Corporate Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Headquarters Location</label>
            <input
              type="text"
              required
              value={hqLocation}
              onChange={(e) => setHqLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Industry Sector</label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                <span>Updating Profile...</span>
              </>
            ) : (
              <span>Update Company Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
