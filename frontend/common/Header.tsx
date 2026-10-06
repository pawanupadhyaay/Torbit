'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserPlus, 
  LogIn, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  ExternalLink,
  Globe
} from 'lucide-react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

interface HeaderProps {
  onOpenAuth?: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
  currentUser?: any;
}

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) return JSON.parse(stored);
    const adminStored = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    if (adminStored && adminToken) return JSON.parse(adminStored);
  } catch (e) {}
  return null;
};

export default function Header({ onOpenAuth, currentUser: propUser }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<any>(() => propUser || getInitialUser());

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
      return;
    }
    const u = getInitialUser();
    if (u) setCurrentUser(u);
  }, [propUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('torbit_remember_me');
    localStorage.removeItem('torbit_last_active_role');
    localStorage.removeItem('torbit_session_saved_at');
    try { sessionStorage.clear(); } catch (e) {}
    try {
      document.documentElement.classList.remove('user-is-authenticated');
      document.documentElement.removeAttribute('data-auth-role');
    } catch (e) {}
    setCurrentUser(null);
    window.location.href = '/?view=home';
  };

  const role = currentUser?.role;
  const isRecruiter = role === 'RECRUITER' || role === 'COMPANY';
  const isAdmin = role === 'ADMIN';

  const seekerId = currentUser?.seekerProfile?.id || (currentUser?.id ? `TOR-JS-${currentUser.id.slice(-6).toUpperCase()}` : null);
  const recId = currentUser?.companyProfile?.gstNumber || currentUser?.companyProfile?.id || currentUser?.id;

  const dashboardUrl = isAdmin
    ? '/admin/dashboard'
    : isRecruiter
    ? (recId ? `/recruiter/dashboard/${recId}` : '/recruiter/dashboard')
    : (seekerId ? `/seeker/dashboard/${seekerId}` : '/seeker/dashboard');

  const postJobUrl = isRecruiter 
    ? (recId ? `/recruiter/dashboard/${recId}` : '/recruiter/dashboard')
    : '/admin/dashboard';

  const displayName = 
    currentUser?.fullName || 
    currentUser?.seekerProfile?.fullName || 
    currentUser?.name || 
    currentUser?.companyName || 
    currentUser?.companyProfile?.companyName || 
    currentUser?.email?.split('@')[0] || 
    'User';

  const roleDashboardLabel = isAdmin 
    ? 'Admin Dashboard' 
    : isRecruiter 
    ? 'Recruiter Dashboard' 
    : 'Job Seeker Dashboard';

  const shortRoleDashboardLabel = isAdmin 
    ? 'Admin Dashboard' 
    : isRecruiter 
    ? 'Recruiter Dashboard' 
    : 'Seeker Dashboard';

  return (
    <header className="bg-white border-b border-gray-100 py-2 sm:py-3 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2">
        
        {/* ========================================================= */}
        {/* BRAND LOGO (Left on Mobile, Centered on Desktop) */}
        {/* ========================================================= */}
        <div className="flex items-center order-1 md:order-2 shrink-0">
          <Link href="/?view=home" className="flex items-center group py-0.5" title="Torbit Realty Home">
            <img
              src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
              alt="Torbit Realty"
              className="h-7 sm:h-9 md:h-11 w-auto object-contain max-w-[130px] sm:max-w-[200px] md:max-w-[300px] group-hover:opacity-95 transition-opacity"
            />
          </Link>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP LEFT / MOBILE AUTH CTA */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-1 relative" suppressHydrationWarning>
          {/* Guest Slot (Register & Login) */}
          <div className="auth-guest-slot flex items-center gap-1.5 sm:gap-2">
            {onOpenAuth ? (
              <>
                <button 
                  type="button"
                  onClick={() => onOpenAuth(null, 'REGISTER')}
                  className="bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>REGISTER</span>
                </button>
                <button 
                  type="button"
                  onClick={() => onOpenAuth(null, 'LOGIN')}
                  className="border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 active:scale-95 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3 md:px-3.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span>LOGIN</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>REGISTER</span>
                </Link>
                <Link 
                  href="/login"
                  className="border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 active:scale-95 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3 md:px-3.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span>LOGIN</span>
                </Link>
              </>
            )}
          </div>

          {/* User Slot (Role Dashboard & Logout) */}
          <div className="auth-user-slot flex items-center gap-1.5 sm:gap-2">
            {/* Admin Dashboard Button */}
            <Link
              href="/admin/dashboard"
              className="auth-link-admin bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition items-center gap-1.5 whitespace-nowrap"
              title="Open Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Admin Dashboard</span>
            </Link>

            {/* Recruiter Dashboard Button */}
            <Link
              href={dashboardUrl.startsWith('/recruiter') ? dashboardUrl : '/recruiter/dashboard'}
              className="auth-link-recruiter bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition items-center gap-1.5 whitespace-nowrap"
              title="Open Recruiter Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Recruiter Dashboard</span>
            </Link>

            {/* Job Seeker Dashboard Button */}
            <Link
              href={dashboardUrl.startsWith('/seeker') ? dashboardUrl : '/seeker/dashboard'}
              className="auth-link-seeker bg-[#b2c359] hover:bg-[#9eb047] active:scale-95 text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition items-center gap-1.5 whitespace-nowrap"
              title="Open Seeker Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Job Seeker Dashboard</span>
              <span className="sm:hidden">Seeker Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-gray-200 hover:border-red-300 bg-gray-50 hover:bg-red-50 active:scale-95 text-[#080809] hover:text-red-600 font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3 md:px-3.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap group"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-red-600 shrink-0" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE: POST A JOB & MAIN WEBSITE (Desktop & Mobile) */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:order-3">
          {/* Post a Job button: ONLY for Recruiter or Admin */}
          {(isRecruiter || isAdmin) && (
            <Link
              href={postJobUrl}
              className="bg-slate-900 hover:bg-black text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition flex items-center gap-1 shadow-xs active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#b2c359]" />
              <span className="hidden sm:inline">POST A JOB</span>
              <span className="sm:hidden">POST</span>
            </Link>
          )}

          {/* MAIN WEBSITE button (replaces Forum button) */}
          <a
            href="https://torbitrealty.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Go to Torbit Realty Main Website"
            className="hidden sm:inline-flex items-center gap-1 bg-[#b2c359] hover:bg-[#9eb047] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[11px] sm:text-[13px] md:text-[14px] leading-tight uppercase px-2.5 sm:px-3 md:px-3.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg shadow-xs transition"
          >
            <span>MAIN WEBSITE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Main Website Icon Button */}
          <a
            href="https://torbitrealty.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Main Website"
            className="sm:hidden p-1.5 bg-slate-100 hover:bg-[#b2c359]/20 text-slate-700 hover:text-[#b2c359] rounded-lg border border-slate-200 transition flex items-center justify-center"
          >
            <Globe className="w-4 h-4 text-[#9eb047]" />
          </a>

          {/* Search Trigger (Desktop) */}
          <a 
            href="#hero-search"
            aria-label="Search"
            className="hidden md:flex p-2 text-gray-500 hover:text-[#b2c359] transition rounded-lg hover:bg-gray-50 items-center justify-center"
          >
            <SearchOutlinedIcon sx={{ fontSize: 19 }} />
          </a>
        </div>

      </div>
    </header>
  );
}
