'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ShieldCheck, Upload, FileText, CheckCircle2 } from 'lucide-react';
import GoogleAuthButton from '@/common/GoogleAuthButton';

interface CompanySignUpCardProps {
  onSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
  onShowVerification?: (gst: string, refId?: string, email?: string) => void;
  onSwitchRole?: () => void;
}

export default function CompanySignUpCard({ onSuccess, onSwitchToLogin, onShowVerification, onSwitchRole }: CompanySignUpCardProps) {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Real Estate');
  const [workEmail, setWorkEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [hqLocation, setHqLocation] = useState('');
  const [agree, setAgree] = useState(true);

  // GST Certificate Upload State (< 1MB PDF only)
  const [gstDocUrl, setGstDocUrl] = useState('');
  const [gstDocName, setGstDocName] = useState('');
  const [gstDocSize, setGstDocSize] = useState<number | null>(null);
  const [gstDocUploading, setGstDocUploading] = useState(false);
  const [gstDocError, setGstDocError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGstFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGstDocError(null);

    // 1. Validate format: PDF only
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setGstDocError('Invalid format. GST Certificate must be a PDF file (.pdf).');
      return;
    }

    // 2. Validate size: Strict < 1MB
    if (file.size > 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setGstDocError(`File size exceeds 1 MB limit (${sizeMb} MB). Please choose a PDF under 1 MB.`);
      return;
    }

    setGstDocUploading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'company-docs');

      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload GST certificate');

      setGstDocUrl(data.fileUrl);
      setGstDocName(file.name);
      setGstDocSize(file.size);
    } catch (err: any) {
      setGstDocError(err.message || 'Error uploading GST certificate.');
    } finally {
      setGstDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGstDocError(null);

    if (!companyName || !workEmail || !companyPhone || !gstNumber) {
      setError('Please fill in all mandatory company details.');
      return;
    }

    const cleanEmail = workEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid work email address (e.g. hr@company.com).');
      return;
    }

    const cleanPhone = companyPhone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9811002233).');
      return;
    }

    const cleanGst = gstNumber.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      setError('Please enter a valid 15-character GSTIN number (e.g. 06AAACD1234F1Z5).');
      return;
    }

    if (!gstDocUrl) {
      setGstDocError('Please upload your valid GST Certificate in PDF format (< 1MB).');
      setError('GST Certificate upload (PDF < 1MB) is mandatory.');
      return;
    }

    if (!agree) {
      setError('Please agree to the Terms & Conditions and confirm details.');
      return;
    }

    setLoading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/register-recruiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry ? industry.trim() : 'Real Estate',
          workEmail: workEmail.trim().toLowerCase(),
          phone: cleanPhone,
          gstNumber: cleanGst,
          gstDocUrl: gstDocUrl,
          hqLocation: hqLocation ? hqLocation.trim() : ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (onShowVerification) {
        onShowVerification(cleanGst, data.referenceId, cleanEmail);
      }

      // Reset form fields
      setCompanyName('');
      setWorkEmail('');
      setCompanyPhone('');
      setGstNumber('');
      setGstDocUrl('');
      setGstDocName('');
      setGstDocSize(null);
      setHqLocation('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-2xl mx-auto font-['Helvetica',Arial,sans-serif]">
      {/* Dark Top Header Banner */}
      <div className="bg-[#181C20] px-5 py-3 sm:px-6 sm:py-3 text-white">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#b2c359] block mb-0.5">
          COMPANY SIGN UP
        </span>
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
          Hire verified, quality candidates
        </h2>
      </div>

      {/* Google Quick Recruiter Sign Up */}
      <div className="p-4 sm:p-5 pb-0 text-xs text-gray-800">
        <GoogleAuthButton
          role="RECRUITER"
          text="signup"
          onSwitchToLogin={(email) => {
            window.location.href = `/login?identifier=${encodeURIComponent(email)}`;
          }}
        />
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or register company with GST Certificate</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 pt-1 space-y-2.5 sm:space-y-3 text-xs text-gray-800">
        {error && (
          <div className="bg-red-50 text-red-700 p-2.5 rounded-lg flex items-center gap-2 border border-red-200 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Row 1: Company Name & Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. DLF Limited"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Industry / Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology, Finance, Healthcare"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
        </div>

        {/* Row 2: Work Email Address */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-800 text-[11px] sm:text-xs">Work Email Address *</label>
            <span className="text-[10px] text-gray-400 font-medium">Valid corporate/work email</span>
          </div>
          <input
            type="email"
            required
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder="e.g. hr@dlf.in or careers@company.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
          />
        </div>

        {/* Row 3: Phone Number & GST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Company Mobile Number *</label>
            <input
              type="tel"
              required
              maxLength={14}
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="e.g. 9811002233 (10 digits)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Company GSTIN Number *</label>
            <input
              type="text"
              required
              maxLength={15}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 06AAACD1234F1Z5 (15 digits)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 uppercase focus:outline-none focus:border-[#b2c359] bg-white font-mono transition"
            />
          </div>
        </div>

        {/* Row 4: GST Registration Certificate (Mandatory PDF < 1MB) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-800 text-[11px] sm:text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#b2c359]" />
              <span>GST Registration Certificate (PDF, Max 1 MB) *</span>
            </label>
            {gstDocUrl ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Uploaded ({((gstDocSize || 0) / 1024).toFixed(0)} KB)</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Mandatory PDF
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="file"
              id="company-card-gst-upload"
              accept=".pdf,application/pdf"
              onChange={handleGstFileUpload}
              className="hidden"
            />
            <label
              htmlFor="company-card-gst-upload"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition ${
                gstDocUrl
                  ? 'border-emerald-300 bg-emerald-50/40 text-gray-900'
                  : gstDocError
                  ? 'border-red-300 bg-red-50/40 text-red-900'
                  : 'border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/30 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  gstDocUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500 shadow-2xs'
                }`}>
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-left">
                  <span className="block font-bold text-[11px] truncate text-gray-900">
                    {gstDocUploading
                      ? 'Uploading PDF Certificate...'
                      : gstDocName
                      ? gstDocName
                      : 'Choose GST Certificate (PDF < 1MB)'}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {gstDocUrl ? 'Click to replace document' : 'Only .pdf format, Maximum file size 1 MB'}
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] shrink-0 transition ${
                gstDocUrl
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-black'
              }`}>
                {gstDocUploading ? '...' : gstDocUrl ? 'Replace' : 'Browse'}
              </span>
            </label>
          </div>

          {gstDocError && (
            <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{gstDocError}</span>
            </p>
          )}
        </div>

        {/* Row 5: Credentials Notice: Admin will issue temporary password upon approval */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-start gap-2 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#b2c359] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-gray-900 block text-[11px]">Admin Approval &amp; Password Setup</span>
            <span className="text-[10px] sm:text-[11px] text-gray-500">
              No password needed now. Upon Admin GST verification, a secure temporary login password will be emailed to <strong>{workEmail || 'your work email'}</strong>.
            </span>
          </div>
        </div>

        {/* Row 6: HQ Location */}
        <div>
          <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">HQ Location</label>
          <input
            type="text"
            value={hqLocation}
            onChange={(e) => setHqLocation(e.target.value)}
            placeholder="City, State, Country"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
          />
        </div>

        {/* Row 6: Checkbox */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="company-terms-check"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="company-terms-check" className="text-gray-600 text-[11px] sm:text-xs font-medium cursor-pointer">
            I agree to the <a href="#terms" className="text-[#b2c359] underline font-semibold">Terms &amp; Conditions</a> and confirm the details are accurate
          </label>
        </div>

        {/* Row 7: Action Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-3.5 px-5 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Submitting for Verification...' : 'Submit for Admin Approval →'}</span>
          </button>
        </div>

        {/* Row 8: Footer link & Role Switch */}
        <div className="flex items-center justify-between pt-0.5 text-[11px] sm:text-xs text-gray-600 font-medium">
          <div>
            Already have a company account?{' '}
            <Link
              href="/login"
              className="text-emerald-700 font-bold hover:underline"
            >
              Login
            </Link>
          </div>
          {onSwitchRole && (
            <button
              type="button"
              onClick={onSwitchRole}
              className="text-gray-500 hover:text-gray-900 underline"
            >
              Job seeker sign up?
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
