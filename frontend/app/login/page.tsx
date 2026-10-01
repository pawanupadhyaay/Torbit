'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import TopTicker from '@/common/TopTicker';
import Header from '@/common/Header';
import Navbar from '@/common/Navbar';
import Footer from '@/common/Footer';

export default function LoginPage() {
  const [role, setRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'recruiter' || roleParam === 'company') {
        setRole('RECRUITER');
      } else {
        setRole('JOB_SEEKER');
      }
    }
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

      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email/phone or password');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (data.mustChangePassword) {
        setMustChangePassword(true);
        return;
      }

      const destination = data.redirectUrl || (data.user?.role === 'RECRUITER' ? '/recruiter/dashboard' : data.user?.role === 'ADMIN' ? '/admin/dashboard' : '/seeker/dashboard');
      window.location.href = destination;
    } catch (err: any) {
      setError(err.message);
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
      const res = await fetch('/api/auth/set-new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
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

      window.location.href = data.redirectUrl || '/recruiter/dashboard';
    } catch (err: any) {
      setResetError(err.message || 'Error updating password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white sm:bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif]">
      {/* Desktop Header Elements */}
      <div className="hidden md:block">
        <TopTicker />
        <Header />
        <Navbar />
      </div>

      {/* Mobile Top Brand Header Bar */}
      <div className="md:hidden bg-[#080809] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#080809] shadow-xs">
            <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <span className="font-extrabold text-white text-sm tracking-wider uppercase font-['Helvetica',Arial,sans-serif]">
            TORBIT REALTY
          </span>
        </Link>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-5 py-6 sm:py-10 flex flex-col justify-center">
        {/* Main Card Container */}
        <div className="w-full bg-white sm:rounded-3xl sm:p-8 sm:border sm:border-gray-200/80 sm:shadow-lg">
          
          {mustChangePassword ? (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94C322] block mb-1">
                  FIRST-TIME LOGIN SECURITY
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight font-['Helvetica',Arial,sans-serif]">
                  Create Permanent Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  Your temporary password was verified. Please choose your new permanent password to access your dashboard.
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#94C322] bg-white pr-10 transition shadow-2xs"
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#94C322] bg-white pr-10 transition shadow-2xs"
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
                    className="w-full bg-[#94C322] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{resetLoading ? 'Updating Password...' : 'Save & Open Dashboard →'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Role Pill Badge */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setRole(role === 'JOB_SEEKER' ? 'RECRUITER' : 'JOB_SEEKER')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] tracking-wider uppercase transition"
                >
                  <span>{role === 'JOB_SEEKER' ? 'JOB SEEKER' : 'RECRUITER / EMPLOYER'}</span>
                </button>
              </div>

              {/* Segmented Tab Switcher: Login / Register */}
              <div className="bg-[#F1F3F5] p-1 rounded-xl grid grid-cols-2 gap-1 mb-6">
                <button
                  type="button"
                  className="bg-[#94C322] text-[#080809] font-bold text-xs sm:text-sm py-2.5 rounded-lg text-center shadow-xs transition"
                >
                  Login
                </button>
                <Link
                  href={role === 'RECRUITER' ? '/register?role=recruiter' : '/register?role=seeker'}
                  className="text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-sm py-2.5 rounded-lg text-center transition flex items-center justify-center"
                >
                  Register
                </Link>
              </div>

              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight font-['Helvetica',Arial,sans-serif]">
                  {role === 'JOB_SEEKER' ? 'Find your next role' : 'Find your next hire'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  {role === 'JOB_SEEKER' ? 'Log in to browse & apply for jobs' : 'Log in to manage jobs & candidates'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs font-medium">
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email / Mobile Number */}
                <div>
                  <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                    Email / Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#94C322] bg-white transition shadow-2xs"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="font-bold text-gray-900 block mb-1.5 text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#94C322] bg-white pr-10 transition shadow-2xs"
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

                  {/* Forgot Password */}
                  <div className="text-right mt-2">
                    <a
                      href="#forgot-password"
                      className="text-xs font-bold text-[#006644] hover:underline transition"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#94C322] hover:bg-[#85b21c] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{loading ? 'Logging In...' : 'Login →'}</span>
                  </button>
                </div>

                {/* Footer Prompt */}
                <div className="text-center pt-3 text-xs text-gray-500 font-medium">
                  <span>New here? </span>
                  <Link
                    href={role === 'RECRUITER' ? '/register?role=recruiter' : '/register?role=seeker'}
                    className="text-[#006644] font-bold hover:underline ml-1"
                  >
                    Create account
                  </Link>
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
