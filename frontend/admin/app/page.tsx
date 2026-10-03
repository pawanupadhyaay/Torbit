'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fetch /dashboard in background so navigation is 0ms instant
  React.useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide administrative email/phone and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiEndpoint = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/auth/login`
        : '/api/auth/login';

      let res: Response;
      try {
        res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password })
        });
      } catch (fetchErr) {
        throw new Error('Unable to connect to authentication service. Please try again.');
      }

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          data = { error: 'Invalid response from backend server.' };
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid administrator credentials. Access denied.');
      }

      if (!data.token) {
        throw new Error('Authentication failed: No session token received from server.');
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. This account does not have administrator privileges.');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Helvetica',Arial,sans-serif] text-gray-900">
      {/* Top Header Bar */}
      <header className="bg-[#080809] text-white px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-2.5 py-1 flex items-center shadow-xs">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-6 sm:h-7 w-auto object-contain max-w-[140px] sm:max-w-[180px]"
            />
          </div>
          <span className="bg-[#b2c359] text-[#080809] text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
            ADMIN PORTAL
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-gray-300 font-medium">
          <ShieldOutlinedIcon sx={{ fontSize: 16 }} className="text-[#b2c359]" />
          <span className="hidden sm:inline">Secure Enterprise Gateway</span>
        </div>
      </header>

      {/* Center Main Card */}
      <main className="max-w-lg w-full mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-200/80">
          
          {/* Top Tabs: Login */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-3 mb-6">
            <div className="relative font-bold text-sm text-gray-900 cursor-pointer">
              <span>Login</span>
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-[#b2c359] rounded-full" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 text-red-700 p-3.5 rounded-xl flex items-center gap-2.5 border border-red-200 text-xs font-medium">
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Email Address or Mobile Number */}
            <div>
              <label className="font-bold text-gray-900 block mb-1.5 text-xs sm:text-sm">
                Email Address or Mobile Number
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or +91 98XXXXXXXX"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition shadow-2xs"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-bold text-gray-900 block mb-1.5 text-xs sm:text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-10 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition"
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359]"
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot-password"
                className="font-bold text-[#006644] hover:underline transition"
              >
                Forgot Password?
              </a>
            </div>

            {/* Main Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.99] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-sm py-3.5 sm:py-4 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Login as Admin →'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Help Note */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>Demo Admin Credentials: </span>
            <code className="text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded">admin@torbit.in</code>
            <span className="mx-1">/</span>
            <code className="text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded">Admin@123</code>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#080809] text-white py-3.5 border-t border-gray-900 text-center text-xs text-gray-400 font-medium">
        <span>© 2026 Torbit Realty Pvt. Ltd. Enterprise Administration &amp; Governance Center.</span>
      </footer>
    </div>
  );
}
