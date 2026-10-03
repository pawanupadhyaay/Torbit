'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  User, 
  UserPlus, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  PlusCircle, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  Bell,
  Settings,
  Globe
} from 'lucide-react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

interface HeaderProps {
  onOpenAuth?: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
}

export default function Header({ onOpenAuth }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      } else {
        const adminStored = localStorage.getItem('adminUser');
        const adminToken = localStorage.getItem('adminToken');
        if (adminStored && adminToken) {
          setCurrentUser(JSON.parse(adminStored));
        }
      }
    } catch (e) {}
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('torbit_remember_me');
    localStorage.removeItem('torbit_last_active_role');
    localStorage.removeItem('torbit_session_saved_at');
    try { sessionStorage.clear(); } catch (e) {}
    setCurrentUser(null);
    setMenuOpen(false);
    window.location.href = '/?view=home';
  };

  const role = currentUser?.role;
  const isRecruiter = role === 'RECRUITER' || role === 'COMPANY';
  const isAdmin = role === 'ADMIN';
  const isJobSeeker = role === 'JOB_SEEKER' || (!isRecruiter && !isAdmin);

  const dashboardUrl = isRecruiter
    ? '/recruiter/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : '/seeker/dashboard';

  const postJobUrl = isRecruiter 
    ? '/recruiter/dashboard' 
    : '/admin/dashboard';

  const displayName = 
    currentUser?.fullName || 
    currentUser?.seekerProfile?.fullName || 
    currentUser?.name || 
    currentUser?.companyName || 
    currentUser?.companyProfile?.companyName || 
    currentUser?.email?.split('@')[0] || 
    'My Account';

  const userInitial = (displayName.charAt(0) || 'U').toUpperCase();

  const roleBadgeLabel = isAdmin 
    ? 'Admin' 
    : isRecruiter 
    ? 'Recruiter' 
    : 'Job Seeker';

  const roleBadgeClass = isAdmin
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : isRecruiter
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

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
        {/* DESKTOP LEFT / MOBILE AUTH CTA & ACCOUNT TRIGGER */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-1 relative" ref={menuRef}>
          {!currentUser ? (
            /* Unauthenticated State: Register & Login CTAs */
            <div className="flex items-center gap-1.5 sm:gap-2">
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
          ) : (
            /* Authenticated State: Role-Based Account Dropdown Menu */
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-xl transition cursor-pointer shadow-xs group active:scale-95"
                aria-expanded={menuOpen}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-[#b2c359] text-[#080809] font-bold flex items-center justify-center text-xs sm:text-sm shadow-inner">
                  {userInitial}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight truncate max-w-[110px] md:max-w-[130px]">
                    {displayName}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                    {roleBadgeLabel}
                  </div>
                </div>
                <span className="sm:hidden text-xs font-bold text-slate-800">Account</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Card */}
              {menuOpen && (
                <div className="absolute left-0 md:left-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Overview Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#b2c359] text-[#080809] font-extrabold flex items-center justify-center text-sm sm:text-base shadow-sm">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                        <span className={`inline-block mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleBadgeClass}`}>
                          {roleBadgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role-Specific Navigation Options */}
                  <div className="py-1">
                    {/* JOB SEEKER OPTIONS */}
                    {isJobSeeker && (
                      <>
                        <Link
                          href="/seeker/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>My Seeker Dashboard</span>
                        </Link>
                        <Link
                          href="/jobs"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Browse Jobs</span>
                        </Link>
                        <Link
                          href="/seeker/dashboard?tab=applications"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>My Applications</span>
                        </Link>
                        <Link
                          href="/seeker/dashboard?tab=profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile &amp; Resume</span>
                        </Link>
                        <Link
                          href="/seeker/dashboard?tab=alerts"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Bell className="w-4 h-4 text-slate-400" />
                          <span>Job Alerts</span>
                        </Link>
                      </>
                    )}

                    {/* RECRUITER OPTIONS */}
                    {isRecruiter && (
                      <>
                        <Link
                          href="/recruiter/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Recruiter Dashboard</span>
                        </Link>
                        <Link
                          href="/recruiter/dashboard?tab=post-job"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Post a New Job</span>
                        </Link>
                        <Link
                          href="/recruiter/dashboard?tab=applicants"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Candidate Applicants</span>
                        </Link>
                        <Link
                          href="/recruiter/dashboard?tab=jobs"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Active Job Listings</span>
                        </Link>
                        <Link
                          href="/recruiter/dashboard?tab=settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Company Profile</span>
                        </Link>
                      </>
                    )}

                    {/* ADMIN OPTIONS */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                          <span>Admin Control Console</span>
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Company Approvals &amp; Users</span>
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9eb047] transition"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Job Postings Governance</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Dropdown Footer: Logout */}
                  <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
