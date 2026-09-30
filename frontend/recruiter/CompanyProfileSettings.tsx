'use client';
import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompanyProfileSettingsProps {
  company: any;
  onProfileUpdated?: (updated: any) => void;
}

export default function CompanyProfileSettings({ company, onProfileUpdated }: CompanyProfileSettingsProps) {
  const [companyName, setCompanyName] = useState(company?.companyName || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [hqLocation, setHqLocation] = useState(company?.hqLocation || '');
  const [industry, setIndustry] = useState(company?.industry || 'Real Estate');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setPhone(company.phone || '');
      setHqLocation(company.hqLocation || '');
      setIndustry(company.industry || 'Real Estate');
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/company-profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ companyName, phone, hqLocation, industry })
      });

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
            Verified corporate credentials and GST registration governed by Torbit Realty Admin.
          </p>
        </div>
        {saved && (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Company / Developer Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322] transition"
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
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Headquarters Location</label>
            <input
              type="text"
              required
              value={hqLocation}
              onChange={(e) => setHqLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Industry Sector</label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#94C322] transition"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#94C322] hover:bg-[#82ad1b] text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

