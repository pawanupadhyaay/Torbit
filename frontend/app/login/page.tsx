'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import GoogleAuthButton from '@/common/GoogleAuthButton';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<'CLOSED' | 'SEND_EMAIL' | 'VERIFY_OTP'>('CLOSED');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRole, setForgotRole] = useState<string | null>(null);
  const [forgotRoleLabel, setForgotRoleLabel] = useState<string | null>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  // Resend OTP Cooldown Timer
  React.useEffect(() => {
    let timer: any;
    if (forgotResendCooldown > 0) {
      timer = setInterval(() => {
        setForgotResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  React.useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (stored && token) {
        const u = JSON.parse(stored);
        if (u.role === 'JOB_SEEKER') {
          const urlParams = new URLSearchParams(window.location.search);
          const pendingJobId = urlParams.get('jobId') || 
            (typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null);
          const seekerId = u.seekerProfile?.id || (u.id ? `TOR-JS-${u.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
          if (pendingJobId) {
            window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
          } else {
            window.location.href = `/seeker/dashboard/${seekerId}`;
          }
        } else if (u.role === 'RECRUITER' || u.role === 'COMPANY') {
          window.location.href = '/recruiter/dashboard';
        } else if (u.role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        }
      }

      // Check if identifier/email query param is provided to prefill
      const urlParams = new URLSearchParams(window.location.search);
      const prefillIdentifier = urlParams.get('identifier') || urlParams.get('email');
      if (prefillIdentifier) {
        setIdentifier(decodeURIComponent(prefillIdentifier));
      }
    } catch (e) {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      let res: Response;
      try {
        res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password, rememberMe })
        });
      } catch (netErr) {
        throw new Error('Unable to connect to authentication service. Please try again.');
      }

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = { error: 'Invalid response from server' };
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email/phone or password');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('torbit_remember_me', rememberMe ? 'true' : 'false');
        localStorage.setItem('torbit_last_active_role', data.user?.role || '');
        localStorage.setItem('torbit_session_saved_at', Date.now().toString());

        if (data.user?.role === 'JOB_SEEKER') {
          try {
            sessionStorage.setItem('torbitSeekerSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              recommendedJobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') {
          try {
            sessionStorage.setItem('torbitRecruiterSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              jobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }
      }

      if (data.mustChangePassword) {
        setMustChangePassword(true);
        return;
      }

      let destination = data.redirectUrl;
      if (!destination) {
        if (data.user?.role === 'ADMIN') {
          destination = '/admin/dashboard';
        } else if (data.user?.role === 'RECRUITER') {
          destination = typeof window !== 'undefined' && window.location.port === '3001' ? '/dashboard' : '/recruiter/dashboard';
        } else {
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
          const pendingJobId = urlParams.get('jobId') || 
            (typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null);
          const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
          if (pendingJobId) {
            destination = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
          } else {
            destination = `/seeker/dashboard/${seekerId}`;
          }
        }
      }

      if (data.user?.role === 'RECRUITER' && typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
        destination = destination.replace('/recruiter', '') || '/dashboard';
      }

      window.location.href = destination;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword || !confirmNewPassword) {
      setResetError('Please enter and confirm your new permanent password.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/set-new-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          temporaryPassword: password,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set new password.');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      let destination = data.redirectUrl || '/recruiter/dashboard';
      if (typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
        destination = destination.replace('/recruiter', '') || '/dashboard';
      }
      window.location.href = destination;
    } catch (err: any) {
      setResetError(err.message || 'Error updating password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setError(null);
    setForgotError(null);
    setForgotNotice(null);
    if (identifier && identifier.includes('@')) {
      setForgotEmail(identifier.trim());
    }
    setForgotStep('SEND_EMAIL');
  };

  const handleSendForgotOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotNotice(null);

    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });

      const data = await res.json().catch(() => ({ error: 'Failed to request reset OTP.' }));
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch reset code.');
      }

      setForgotRole(data.role || null);
      setForgotRoleLabel(data.roleLabel || (data.role === 'JOB_SEEKER' ? 'Job Seeker' : (data.role === 'RECRUITER' ? 'Recruiter' : 'Admin')));
      setForgotStep('VERIFY_OTP');
      setForgotResendCooldown(30);
      setForgotNotice(`A 6-digit password reset OTP has been emailed to ${forgotEmail.trim().toLowerCase()}.`);
    } catch (err: any) {
      setForgotError(err.message || 'Error sending reset OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the 6-digit OTP code received on your email.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });

      const data = await res.json().catch(() => ({ error: 'Failed to reset password.' }));
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('torbit_remember_me', 'true');
        localStorage.setItem('torbit_last_active_role', data.user?.role || '');
        localStorage.setItem('torbit_session_saved_at', Date.now().toString());

        if (data.user?.role === 'JOB_SEEKER') {
          try {
            sessionStorage.setItem('torbitSeekerSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              recommendedJobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') {
          try {
            sessionStorage.setItem('torbitRecruiterSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              jobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }

        let destination = data.redirectUrl;
        if (!destination) {
          if (data.user?.role === 'ADMIN') {
            destination = '/admin/dashboard';
          } else if (data.user?.role === 'RECRUITER') {
            destination = typeof window !== 'undefined' && window.location.port === '3001' ? '/dashboard' : '/recruiter/dashboard';
          } else {
            const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
            const pendingJobId = urlParams.get('jobId') || 
              (typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null);
            const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
            if (pendingJobId) {
              destination = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
            } else {
              destination = `/seeker/dashboard/${seekerId}`;
            }
          }
        }

        if (data.user?.role === 'RECRUITER' && typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
          destination = destination.replace('/recruiter', '') || '/dashboard';
        }

        setForgotNotice('Password reset successful! Opening your dashboard...');
        setTimeout(() => {
          window.location.href = destination;
        }, 500);
        return;
      }

      setForgotNotice('Password reset successfully! Please sign in with your new password.');
      setForgotStep('CLOSED');
      setPassword('');
    } catch (err: any) {
      setForgotError(err.message || 'Error updating password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white sm:bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif]">
      {/* Desktop Header Elements */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Top Brand Header Bar */}
      <div className="md:hidden bg-[#080809] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
            alt="Torbit Realty"
            className="h-6 w-auto object-contain"
          />
        </Link>
        <span className="text-[10px] font-bold text-[#b2c359] uppercase tracking-wider">Universal Login</span>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-5 py-6 sm:py-10 flex flex-col justify-center">
        {/* Main Card Container */}
        <div className="w-full bg-white sm:rounded-3xl sm:p-8 sm:border sm:border-gray-200/80 sm:shadow-lg">
          
          {mustChangePassword ? (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
                  FIRST-TIME LOGIN SECURITY
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight font-['Helvetica',Arial,sans-serif]">
                  Create Permanent Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  Your temporary credentials were verified. Please create your permanent password to continue.
                </p>
              </div>

              {resetError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs font-medium">
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} className="flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                    New Permanent Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showNewPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirmNewPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{resetLoading ? 'Updating Password...' : 'Save & Open Dashboard →'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : forgotStep !== 'CLOSED' ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {/* Heading */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-lime-100 text-[#608014] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-lime-200 flex items-center gap-1">
                    <LockResetOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Account Security</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setForgotStep('CLOSED'); setForgotError(null); setForgotNotice(null); }}
                    className="text-xs text-gray-400 hover:text-gray-700 font-semibold cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight font-['Helvetica',Arial,sans-serif]">
                  {forgotStep === 'SEND_EMAIL' ? 'Reset Your Password' : 'Verify OTP & Set Password'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  {forgotStep === 'SEND_EMAIL'
                    ? 'Enter your registered email address to receive a 6-digit OTP code.'
                    : `Enter the 6-digit code sent to ${forgotEmail} and create your new password.`}
                </p>
              </div>

              {/* Error Alert */}
              {forgotError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs font-medium">
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} className="flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Notice Alert */}
              {forgotNotice && (
                <div className="mb-4 bg-lime-50 text-lime-900 p-3 rounded-xl flex items-center gap-2 border border-lime-200 text-xs font-medium">
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} className="text-emerald-600 flex-shrink-0" />
                  <span>{forgotNotice}</span>
                </div>
              )}

              {/* Step 1: Send Email */}
              {forgotStep === 'SEND_EMAIL' && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div>
                    <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                      Registered Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. hr@company.com or candidate@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition shadow-2xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail}
                      className="w-full bg-[#b2c359] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>{forgotLoading ? 'Checking & Dispatching OTP...' : 'Request OTP Code →'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setForgotStep('CLOSED'); setForgotError(null); }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Verify OTP & Enter New Password */}
              {forgotStep === 'VERIFY_OTP' && (
                <form onSubmit={handleResetPasswordWithOtp} className="space-y-3.5">
                  {/* Account / Role Badge */}
                  <div className="flex items-center justify-between bg-lime-50/70 border border-lime-200/80 px-3.5 py-2.5 rounded-xl text-xs">
                    <div className="truncate pr-2">
                      <span className="text-gray-500 block text-[10px] font-semibold">VERIFYING ACCOUNT FOR</span>
                      <strong className="text-gray-900 font-bold truncate block">{forgotEmail}</strong>
                    </div>
                    {forgotRoleLabel && (
                      <span className="bg-[#b2c359] text-[#080809] font-black px-2.5 py-1 rounded text-[10px] uppercase tracking-wider shrink-0 shadow-2xs">
                        {forgotRoleLabel}
                      </span>
                    )}
                  </div>

                  {/* 6-Digit OTP */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-gray-900 block text-xs">
                        6-Digit Verification OTP *
                      </label>
                      <button
                        type="button"
                        disabled={forgotResendCooldown > 0 || forgotLoading}
                        onClick={() => handleSendForgotOtp()}
                        className="text-[11px] text-[#658A0D] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        {forgotResendCooldown > 0 ? `Resend in ${forgotResendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-center text-base font-mono tracking-[8px] font-black text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#b2c359] bg-white transition shadow-2xs"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="font-bold text-gray-900 block mb-1 text-xs">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPass ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      >
                        {showForgotNewPass ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="font-bold text-gray-900 block mb-1 text-xs">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPass ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      >
                        {showForgotConfirmPass ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotOtp.length !== 6 || forgotNewPassword.length < 6}
                      className="w-full bg-[#b2c359] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>{forgotLoading ? 'Verifying & Opening Dashboard...' : 'Save New Password & Sign In →'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => { setForgotStep('SEND_EMAIL'); setForgotError(null); }}
                      className="text-gray-500 hover:text-gray-900 font-medium underline cursor-pointer"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setForgotStep('CLOSED'); setForgotError(null); }}
                      className="text-gray-500 hover:text-gray-900 font-medium underline cursor-pointer"
                    >
                      Cancel &amp; Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-lime-100 text-[#608014] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-lime-200">
                    Single Secure Login
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight font-['Helvetica',Arial,sans-serif]">
                  Sign In to Torbit
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  Universal login for Candidates, Recruiters &amp; Administrators
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs font-medium">
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign In */}
              <div className="mb-4">
                <GoogleAuthButton text="continue" />
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or continue with credentials</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email / Mobile Number */}
                <div>
                  <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                    Email Address / Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or registered mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition shadow-2xs"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-gray-900 block text-xs">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-xs font-bold text-[#658A0D] hover:text-[#506e09] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember-me-standalone-page"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="remember-me-standalone-page" className="text-gray-600 text-xs font-medium cursor-pointer">
                    Remember Me (Keep my session active on this device)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In →'}</span>
                  </button>
                </div>

                {/* Registration CTAs */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-medium">
                  <div>
                    <span>Candidate? </span>
                    <Link href="/register?role=seeker" className="text-[#006644] font-bold hover:underline">
                      Join as Seeker
                    </Link>
                  </div>
                  <div>
                    <span>Company? </span>
                    <Link href="/register?role=recruiter" className="text-[#006644] font-bold hover:underline">
                      Register Developer
                    </Link>
                  </div>
                </div>
              </form>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
