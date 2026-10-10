'use client';
import React, { useState, useEffect } from 'react';
import { User, Building2, AlertCircle, X, Loader2 } from 'lucide-react';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

interface GoogleAuthButtonProps {
  role?: 'JOB_SEEKER' | 'RECRUITER' | null;
  text?: 'signin' | 'signup' | 'continue';
  className?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  onSwitchToLogin?: (email: string) => void;
}

declare global {
  interface Window {
    google?: any;
    __gsiClientLoaded?: boolean;
  }
}

const DEFAULT_CLIENT_ID = '327724678292-srbf377no017sp55cfi7j22o92p782je.apps.googleusercontent.com';

export default function GoogleAuthButton({
  role = null,
  text = 'continue',
  className = '',
  onSuccess,
  onError,
  onSwitchToLogin
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals for new Google users
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [pendingAccessToken, setPendingAccessToken] = useState<string | null>(null);
  const [googleUserInfo, setGoogleUserInfo] = useState<{ email?: string; fullName?: string; avatarUrl?: string }>({});

  // Existing Account Alert Modal (when clicking Sign Up with already registered Google email)
  const [showAlreadyExistsModal, setShowAlreadyExistsModal] = useState(false);
  const [existingAccountData, setExistingAccountData] = useState<any>(null);

  useBodyScrollLock(showRoleModal || showCompanyModal || showAlreadyExistsModal);

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [companySubmitting, setCompanySubmitting] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

  // Load Google Identity Services script safely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.oauth2) {
      window.__gsiClientLoaded = true;
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.__gsiClientLoaded = true;
      };
      document.head.appendChild(script);
    }
  }, []);

  // Process authentication with backend
  const processGoogleAuth = async (params: { credential?: string; accessToken?: string; userInfo?: any; chosenRole?: 'JOB_SEEKER' | 'RECRUITER' | null; companyData?: any }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
        : '/api';

      const res = await fetch(`${apiBase}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: params.credential,
          accessToken: params.accessToken,
          userInfo: params.userInfo,
          role: params.chosenRole || role || undefined,
          companyDetails: params.companyData || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data.error || 'Google authentication failed';
        setErrorMsg(err);
        if (onError) onError(err);
        return;
      }

      // Existing User handling
      if (!data.isNewUser && data.token) {
        if (text === 'signup') {
          // User explicitly clicked "Sign up with Google", but their account is already registered!
          setExistingAccountData(data);
          setShowAlreadyExistsModal(true);
          return;
        }
        handleAuthSuccess(data, data.redirectUrl);
        return;
      }

      // New User needs Role Selection
      if (data.isNewUser && data.needsRoleSelection) {
        setPendingCredential(params.credential || null);
        setPendingAccessToken(params.accessToken || null);
        setGoogleUserInfo({
          email: data.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl
        });
        setShowRoleModal(true);
        return;
      }

      // New Recruiter needs Company details
      if (data.isNewUser && data.needsCompanyDetails) {
        setPendingCredential(params.credential || null);
        setPendingAccessToken(params.accessToken || null);
        setGoogleUserInfo({
          email: data.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl
        });
        setShowCompanyModal(true);
        return;
      }

      // New User successfully registered
      if (data.isNewUser && data.token) {
        handleAuthSuccess(data, data.redirectUrl);
        return;
      }

    } catch (err: any) {
      const msg = err.message || 'Network error during Google authentication.';
      setErrorMsg(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData: any, redirectUrl?: string) => {
    try {
      localStorage.setItem('token', userData.token || '');
      localStorage.setItem('user', JSON.stringify(userData.user || userData));
      localStorage.setItem('role', userData.user?.role || userData.role || '');

      if (onSuccess) {
        onSuccess(userData.user || userData);
      }

      const u = userData.user || userData;
      if (u.role === 'JOB_SEEKER') {
        const pendingJobId = typeof window !== 'undefined'
          ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id'))
          : null;
        const seekerId = u.seekerProfile?.id || (u.id ? `TOR-JS-${u.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
        if (pendingJobId) {
          window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
          return;
        } else {
          window.location.href = `/seeker/dashboard/${seekerId}`;
          return;
        }
      }

      if (u.role === 'RECRUITER') {
        window.location.href = '/recruiter/dashboard';
        return;
      }

      if (u.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
        return;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (e) {
      console.error('Error storing session:', e);
    }
  };

  // Direct OAuth2 popup handler (Clean React DOM, never mutates DOM, no removeChild errors)
  const handleGoogleClick = () => {
    setErrorMsg(null);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              await processGoogleAuth({ accessToken: tokenResponse.access_token });
            } else if (tokenResponse?.error && tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg('Google Sign-In was cancelled or failed.');
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('OAuth2 client init error:', err);
      }
    }

    // Fallback: One-tap prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            processGoogleAuth({ credential: response.credential });
          }
        }
      });
      window.google.accounts.id.prompt();
    } else {
      setErrorMsg('Google authentication service is initializing. Please click again.');
    }
  };

  const handleRoleSelect = (selectedRole: 'JOB_SEEKER' | 'RECRUITER') => {
    setShowRoleModal(false);

    if (selectedRole === 'JOB_SEEKER') {
      processGoogleAuth({
        credential: pendingCredential || undefined,
        accessToken: pendingAccessToken || undefined,
        chosenRole: 'JOB_SEEKER'
      });
    } else {
      setShowCompanyModal(true);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyError(null);

    if (!companyName.trim()) {
      setCompanyError('Please enter your Company Name.');
      return;
    }

    const cleanGst = gstNumber.toUpperCase().trim();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      setCompanyError('Please enter a valid 15-character GSTIN number (e.g. 06AAACD1234F1Z5).');
      return;
    }

    setCompanySubmitting(true);
    try {
      await processGoogleAuth({
        credential: pendingCredential || undefined,
        accessToken: pendingAccessToken || undefined,
        chosenRole: 'RECRUITER',
        companyData: {
          companyName: companyName.trim(),
          gstNumber: cleanGst,
          phone: phone.trim()
        }
      });
      setShowCompanyModal(false);
    } catch (e: any) {
      setCompanyError(e.message || 'Failed to complete recruiter registration.');
    } finally {
      setCompanySubmitting(false);
    }
  };

  const buttonLabel = text === 'signup'
    ? 'Sign up with Google'
    : text === 'signin'
    ? 'Sign in with Google'
    : 'Continue with Google';

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* 100% Pure React Native Button (No external iframes injected into React DOM) */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm shadow-2xs transition active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.37 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
        )}
        <span>{loading ? 'Connecting with Google...' : buttonLabel}</span>
      </button>

      {errorMsg && (
        <div className="w-full mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-[11px] text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role Selection Modal (For new users signing in from common login) */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 [overscroll-behavior:contain]">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4 font-['Helvetica',Arial,sans-serif] [overscroll-behavior:contain] [touch-action:pan-y]">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#b2c359]/20 text-[#718025] flex items-center justify-center mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Welcome, {googleUserInfo.fullName || 'there'}!
              </h3>
              <p className="text-xs text-gray-500">
                Select how you would like to use Torbit Realty Job Portal:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('JOB_SEEKER')}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[#b2c359] hover:bg-[#b2c359]/5 flex items-center gap-3 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">I am a Job Seeker</h4>
                  <p className="text-[11px] text-gray-500">Find &amp; apply for real estate jobs instantly</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('RECRUITER')}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[#b2c359] hover:bg-[#b2c359]/5 flex items-center gap-3 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">I am an Employer / Recruiter</h4>
                  <p className="text-[11px] text-gray-500">Post vacancies &amp; hire verified talent</p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Details Modal (When signing up as recruiter with Google) */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 [overscroll-behavior:contain]">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4 font-['Helvetica',Arial,sans-serif] [overscroll-behavior:contain] [touch-action:pan-y]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Complete Company Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Signed in as <span className="font-bold text-gray-700">{googleUserInfo.email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {companyError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{companyError}</span>
              </div>
            )}

            <form onSubmit={handleCompanySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Realty Pvt Ltd"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-black focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN Number (15 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 06AAACD1234F1Z5"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-black focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-black focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={companySubmitting}
                  className="flex-1 py-2 px-3 bg-[#080809] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {companySubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Register Company</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Account Already Exists Alert (When user clicks Sign Up with already registered Google email) */}
      {showAlreadyExistsModal && existingAccountData && (
        <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-['Helvetica',Arial,sans-serif] [overscroll-behavior:contain]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150 [overscroll-behavior:contain] [touch-action:pan-y]">
            {/* Top Icon Badge */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowAlreadyExistsModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-0.5">
                NOTICE
              </span>
              <h3 className="font-bold text-lg sm:text-xl text-gray-950 tracking-tight">
                Account Already Created
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                An account with this Google email already exists in our system. You do not need to register again.
              </p>
            </div>

            {/* Email & Role Badge Card */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Registered Email</div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 break-all">
                {existingAccountData.user?.email}
              </div>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-lime-100 text-[#608014] border border-lime-200 uppercase tracking-wider">
                  {existingAccountData.user?.role === 'JOB_SEEKER' ? 'Job Seeker Account' : existingAccountData.user?.role === 'RECRUITER' ? 'Recruiter Account' : 'Admin Account'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const emailToPrefill = existingAccountData?.user?.email || '';
                  setShowAlreadyExistsModal(false);
                  if (onSwitchToLogin) {
                    onSwitchToLogin(emailToPrefill);
                  } else {
                    const searchParams = new URLSearchParams(window.location.search);
                    searchParams.set('identifier', emailToPrefill);
                    window.location.href = `/login?${searchParams.toString()}`;
                  }
                }}
                className="w-full bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.99] text-[#080809] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In with this Account →</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAlreadyExistsModal(false)}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                Cancel / Use Another Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
