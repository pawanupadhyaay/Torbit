'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QUALIFICATIONS, QUALIFICATION_CATEGORIES, EXPERIENCE_RANGES } from '@/lib/constants';
import { AlertCircle, Eye, EyeOff, Calendar, CheckCircle2, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import GoogleAuthButton from '@/common/GoogleAuthButton';

interface SeekerSignUpCardProps {
  onSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
  onSwitchRole?: () => void;
}

export default function SeekerSignUpCard({ onSuccess, onSwitchToLogin, onSwitchRole }: SeekerSignUpCardProps) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [qualification, setQualification] = useState('Graduate (B.Tech / B.E / B.Sc / B.Com / BBA)');
  const [customQualification, setCustomQualification] = useState('');
  const [experience, setExperience] = useState('1–3 years');
  const [agree, setAgree] = useState(true);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown timer effect
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address to receive OTP.');
      return;
    }
    setError(null);
    setOtpNotice(null);
    setOtpSending(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim() })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setIsOtpSent(true);
      setResendCooldown(30);
      setOtpNotice(`OTP code has been sent to ${email}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code received on your email.');
      return;
    }
    setError(null);
    setOtpVerifying(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpInput.trim() })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

      setIsEmailVerified(true);
      setOtpNotice('Email address verified successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (!cleanName || !email || !phone || !password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    // Strict alphabet and space validation for Full Name
    const nameRegex = /^[a-zA-Z\s\.\']+$/;
    if (!nameRegex.test(cleanName)) {
      setError('Full Name must only contain alphabetical characters (letters and spaces only).');
      return;
    }
    if (cleanName.length < 2) {
      setError('Full Name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9811002233).');
      return;
    }

    if (!isEmailVerified) {
      setError('Please verify your email address via OTP before creating your account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (qualification === 'Others' && !customQualification.trim()) {
      setError('Please specify your qualification.');
      return;
    }

    const finalQualification = qualification === 'Others'
      ? customQualification.trim()
      : qualification;

    setLoading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/register-seeker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          location: location ? location.trim() : 'India',
          dob: dob || null,
          qualification: finalQualification,
          experience,
          password
        })
      });
      const data = await res.json().catch(() => ({ error: 'Registration request failed. Please try again.' }));
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (onSuccess) onSuccess(data.user);
      const pendingJobId = typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null;
      const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
      if (pendingJobId) {
        window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
      } else {
        window.location.href = `/seeker/dashboard/${seekerId}`;
      }
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
          JOB SEEKER SIGN UP
        </span>
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
          Build your profile &amp; get hired
        </h2>
      </div>

      {/* Google Quick Sign Up */}
      <div className="p-4 sm:p-5 pb-0 text-xs text-gray-800">
        <GoogleAuthButton
          role="JOB_SEEKER"
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
            <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or register with email &amp; OTP</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 pt-1 space-y-2.5 sm:space-y-3 text-xs text-gray-800">
        {error && (
          <div className="bg-red-50 text-red-700 p-2.5 rounded-lg flex items-center gap-2 border border-red-200 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpNotice && (
          <div className="bg-lime-50 text-lime-900 p-2.5 rounded-lg flex items-center gap-2 border border-lime-200 text-xs animate-in fade-in duration-200">
            <ShieldCheck className="w-4 h-4 text-[#b2c359] flex-shrink-0" />
            <span>{otpNotice}</span>
          </div>
        )}

        {/* Row 1: Full Name & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s\.\']/g, ''))}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Date of Birth</label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onClick={(e) => (e.target as any).showPicker?.()}
                min="1950-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white transition cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Email Address with Integrated Live OTP Verification */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-800 text-[11px] sm:text-xs">
              Email Address
            </label>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Successfully</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">
                Email OTP Verification Required
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                disabled={isEmailVerified}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isEmailVerified) setIsEmailVerified(false);
                  if (isOtpSent) setIsOtpSent(false);
                }}
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded-lg text-xs transition placeholder:text-gray-400 focus:outline-none ${
                  isEmailVerified
                    ? 'border-emerald-300 bg-emerald-50/40 text-gray-900 font-medium cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-800 focus:border-[#b2c359]'
                }`}
              />
            </div>

            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending || resendCooldown > 0 || !email}
                className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                {otpSending ? (
                  <span>Sending...</span>
                ) : resendCooldown > 0 ? (
                  <span>Resend ({resendCooldown}s)</span>
                ) : isOtpSent ? (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-[#b2c359]" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* OTP Input Form Sub-Card when OTP is dispatched */}
          {isOtpSent && !isEmailVerified && (
            <div className="mt-2.5 p-3 bg-slate-50 border border-lime-200/90 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#b2c359]" />
                  <span>Enter 6-Digit OTP received on {email}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Valid for 10 mins</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-36 tracking-[6px] text-center font-mono font-bold text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#b2c359] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || otpInput.length !== 6}
                  className="flex-1 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition disabled:opacity-50 shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                >
                  {otpVerifying ? 'Verifying...' : 'Confirm OTP ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Phone Number & Current Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXXX"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Current Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
            />
          </div>
        </div>

        {/* Row 4: Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-8 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-8 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Row 5: Highest Qualification & Total Experience (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Highest Qualification</label>
            <div className="relative">
              <select
                value={qualification}
                onChange={(e) => {
                  setQualification(e.target.value);
                  if (e.target.value !== 'Others') setCustomQualification('');
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white cursor-pointer appearance-none transition"
              >
                {QUALIFICATION_CATEGORIES.map((group) => (
                  <optgroup key={group.category} label={group.category} className="font-bold text-gray-900">
                    {group.options.map((opt) => (
                      <option key={opt} value={opt} className="font-normal text-gray-800">
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Custom Qualification input when Others is selected */}
            {qualification === 'Others' && (
              <div className="mt-2 animate-in fade-in duration-200">
                <label className="font-bold text-gray-800 block mb-1 text-[11px]">
                  Specify Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customQualification}
                  onChange={(e) => setCustomQualification(e.target.value)}
                  placeholder="e.g. Diploma in Interior Architecture"
                  className="w-full px-3 py-2 border border-lime-300 bg-lime-50/30 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] transition shadow-2xs"
                />
              </div>
            )}
          </div>
          <div>
            <label className="font-bold text-gray-800 block mb-1 text-[11px] sm:text-xs">Total Experience</label>
            <div className="relative">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white cursor-pointer appearance-none transition"
              >
                {EXPERIENCE_RANGES.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 6: Checkbox */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="seeker-terms-check"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="seeker-terms-check" className="text-gray-600 text-[11px] sm:text-xs font-medium cursor-pointer">
            I agree to the <a href="#terms" className="text-[#b2c359] underline font-semibold">Terms &amp; Conditions</a> and <a href="#privacy" className="text-[#b2c359] underline font-semibold">Privacy Policy</a>
          </label>
        </div>

        {/* Row 7: Action Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-3.5 px-5 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Creating Job Seeker Account...' : 'Create Job Seeker Account →'}</span>
          </button>
        </div>

        {/* Row 8: Footer link & Role Switch */}
        <div className="flex items-center justify-between pt-0.5 text-[11px] sm:text-xs text-gray-600 font-medium">
          <div>
            Already registered?{' '}
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
              Recruiter sign up?
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
