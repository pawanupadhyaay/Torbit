'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface HeaderProps {
  onOpenAuth?: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
}

export default function Header({ onOpenAuth }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.location.href = '/';
  };

  const dashboardUrl = currentUser?.role === 'RECRUITER'
    ? '/recruiter/dashboard'
    : currentUser?.role === 'ADMIN'
    ? '/admin/dashboard'
    : '/seeker/dashboard';

  const displayName = currentUser?.fullName || currentUser?.seekerProfile?.fullName || currentUser?.name || currentUser?.companyName || currentUser?.companyProfile?.companyName || 'Candidate';

  return (
    <header className="bg-white border-b border-gray-100 py-2.5 sm:py-3 sticky top-0 sm:static z-40 shadow-xs sm:shadow-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* Desktop Left Action - Register / Login CTA or User Info */}
        <div className="hidden lg:flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link 
                href={dashboardUrl}
                className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] uppercase px-3.5 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <DashboardOutlinedIcon sx={{ fontSize: 16 }} />
                <span>MY DASHBOARD</span>
              </Link>
              <button 
                onClick={handleLogout}
                title="Logout"
                className="border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] uppercase px-3 py-2.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
                <span>LOGOUT</span>
              </button>
            </div>
          ) : (
            <>
              {onOpenAuth ? (
                <>
                  <button 
                    type="button"
                    onClick={() => onOpenAuth(null, 'REGISTER')}
                    className="bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>REGISTER</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => onOpenAuth(null, 'LOGIN')}
                    className="border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LoginOutlinedIcon sx={{ fontSize: 16, color: '#4B5563' }} />
                    <span>LOGIN</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/register"
                    className="bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>REGISTER</span>
                  </Link>
                  <Link 
                    href="/login"
                    className="border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <LoginOutlinedIcon sx={{ fontSize: 16, color: '#4B5563' }} />
                    <span>LOGIN</span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Center / Brand Logo */}
        <Link href="/?view=home" className="flex items-center group py-0.5" title="Torbit Realty Home">
          <img
            src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
            alt="Torbit Realty"
            className="h-8 sm:h-11 md:h-12 w-auto object-contain max-w-[190px] sm:max-w-[280px] md:max-w-[340px] group-hover:opacity-95 transition-opacity"
          />
        </Link>

        {/* Right Actions - Desktop & Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Quick Auth / Dashboard Buttons */}
          {currentUser ? (
            <div className="lg:hidden flex items-center gap-1">
              <Link
                href={dashboardUrl}
                className="bg-[#94C322] hover:bg-[#82ad1b] text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[12px] leading-[14px] uppercase px-2.5 py-2 rounded-lg shadow-xs transition flex items-center gap-1"
              >
                <DashboardOutlinedIcon sx={{ fontSize: 14 }} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="border border-gray-200 bg-gray-50 text-gray-700 hover:text-red-600 font-['Helvetica',Arial,sans-serif] font-bold text-[12px] px-2 py-2 rounded-lg transition cursor-pointer"
              >
                <LogoutOutlinedIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
          ) : (
            <>
              {onOpenAuth ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth(null, 'REGISTER')}
                    className="lg:hidden bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] uppercase px-2.5 py-2 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                    <span>Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth(null, 'LOGIN')}
                    className="lg:hidden border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[13px] leading-[14px] tracking-[0px] uppercase px-2.5 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <LoginOutlinedIcon sx={{ fontSize: 15, color: '#4B5563' }} />
                    <span>Login</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="lg:hidden bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-3 py-2 rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                    <span>Register</span>
                  </Link>
                  <Link
                    href="/login"
                    className="lg:hidden border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[#080809] font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-2.5 py-2 rounded-lg transition flex items-center gap-1"
                  >
                    <LoginOutlinedIcon sx={{ fontSize: 15, color: '#4B5563' }} />
                    <span>Login</span>
                  </Link>
                </>
              )}
            </>
          )}

          {/* Desktop Only Right Actions */}
          <Link
            href="/register?role=recruiter"
            className="hidden sm:flex bg-slate-900 hover:bg-black text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-3.5 py-2.5 rounded-lg transition items-center gap-1.5"
          >
            <span>POST A JOB</span>
          </Link>
          <Link 
            href="/forum" 
            className="hidden sm:inline-flex items-center bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-3.5 py-2.5 rounded-lg transition"
          >
            FORUM
          </Link>
          <a 
            href="#hero-search"
            aria-label="Search"
            className="hidden sm:flex p-2 text-gray-600 hover:text-[#94C322] transition ml-1 rounded-lg hover:bg-gray-50 items-center justify-center"
          >
            <SearchOutlinedIcon sx={{ fontSize: 18 }} />
          </a>
        </div>
      </div>
    </header>
  );
}
